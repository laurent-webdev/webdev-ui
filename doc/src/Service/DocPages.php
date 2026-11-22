<?php

namespace App\Service;

use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Twig\Environment;

// Les pages de la doc en Markdown, pour llms.txt et llms-full.txt (les IA lisent mieux du texte que du HTML) :
// chaque page est rendue comme pour un visiteur, puis le contenu de son <main> est converti.
// Une page = un template sans variable (voir doc_sections dans config/packages/twig.yaml)
final class DocPages
{
    // Ce qui n'est pas du texte à lire : le rendu des démos (dans une .card), les contrôles, les images, la navigation
    private const SKIPPED = ['audio', 'button', 'canvas', 'dialog', 'form', 'iframe', 'img', 'input', 'nav', 'noscript', 'picture', 'script', 'select', 'style', 'svg', 'template', 'textarea', 'video'];

    // Les balises dans le texte d'un paragraphe ; les autres sont des blocs
    private const INLINE = ['a', 'abbr', 'b', 'br', 'code', 'em', 'i', 'kbd', 'mark', 'q', 's', 'samp', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr'];

    // La grille des contrastes, en fin de page : sans code, rien à lire
    private const SKIPPED_HEADING = 'Toutes les combinaisons';

    // La page en cours de conversion et le début de ses adresses (https://exemple.fr), pour rendre les liens absolus
    private string $url = '';
    private string $origin = '';

    public function __construct(
        private readonly Environment $twig,
        private readonly UrlGeneratorInterface $urls,
    ) {
    }

    // Les sections du menu, chacune avec ses pages
    public function sections(): array
    {
        $sections = [];
        foreach ($this->twig->getGlobals()['doc_sections'] as $section) {
            $pages = [];
            foreach ($section['links'] as [$route, $label, $template]) {
                $pages[] = $this->page($route, $template);
            }
            $sections[] = ['label' => $section['label'], 'pages' => $pages];
        }

        return $sections;
    }

    // L'accueil : installer, personnaliser, navigateurs
    public function home(): array
    {
        return $this->page('app_main', 'main/index.html.twig');
    }

    // Une page : son titre (le <h1>), son adresse, sa phrase d'introduction (le premier paragraphe) et son contenu en Markdown, sans le titre
    private function page(string $route, string $template): array
    {
        $url = $this->urls->generate($route, [], UrlGeneratorInterface::ABSOLUTE_URL);
        $path = $this->urls->generate($route);
        $this->url = $url;
        $this->origin = substr($url, 0, strlen($url) - strlen($path));

        // libxml ne connaît pas les balises de HTML5 (main, search, dialog) : il les garde, sans ses avertissements
        $errors = libxml_use_internal_errors(true);
        $document = new \DOMDocument();
        $document->loadHTML('<?xml encoding="UTF-8">' . $this->twig->render($template));
        libxml_clear_errors();
        libxml_use_internal_errors($errors);

        // Le contenu de la page : le corps de la carte du <main>
        $content = (new \DOMXPath($document))->query('//main/div')->item(0);
        $blocks = $this->clean($this->blocks($content));

        $title = '';
        if ($blocks && $blocks[0]['level'] === 1) {
            $title = array_shift($blocks)['heading'];
        }
        $intro = $blocks && $blocks[0]['level'] === null ? $blocks[0]['text'] : '';

        return [
            'title' => $title,
            'url' => $url,
            'intro' => $intro,
            'markdown' => implode("\n\n", array_column($blocks, 'text')),
        ];
    }

    // Les blocs d'un élément, dans l'ordre : chacun son texte en Markdown et, pour un titre, son niveau
    private function blocks(\DOMNode $node): array
    {
        $blocks = [];
        // Le texte et les balises en ligne qui se suivent forment un paragraphe
        $inline = [];

        foreach ($node->childNodes as $child) {
            if ($child instanceof \DOMText || ($child instanceof \DOMElement && in_array($child->tagName, self::INLINE, true) && !$this->isSkipped($child))) {
                $inline[] = $child;
                continue;
            }
            if (!$child instanceof \DOMElement || $this->isSkipped($child)) {
                continue;
            }

            $blocks = [...$blocks, ...$this->paragraph($inline)];
            $inline = [];

            $tag = $child->tagName;
            if (preg_match('/^h([1-6])$/', $tag, $match)) {
                $level = (int) $match[1];
                $blocks[] = ['level' => $level, 'text' => str_repeat('#', $level) . ' ' . $this->inline($child), 'heading' => $this->inline($child)];
            } elseif ($tag === 'p') {
                $blocks = [...$blocks, ...$this->paragraph(iterator_to_array($child->childNodes))];
            } elseif ($tag === 'pre') {
                $blocks[] = ['level' => null, 'text' => $this->code($child)];
            } elseif ($tag === 'ul' || $tag === 'ol') {
                $blocks[] = ['level' => null, 'text' => $this->list($child, 0)];
            } elseif ($tag === 'table') {
                $blocks = [...$blocks, ...$this->table($child)];
            } elseif ($tag === 'blockquote') {
                $text = implode("\n\n", array_column($this->blocks($child), 'text'));
                $blocks[] = ['level' => null, 'text' => '> ' . str_replace("\n", "\n> ", $text)];
            } else {
                // Un conteneur (div, section, figure…) : ses blocs à la suite
                $blocks = [...$blocks, ...$this->blocks($child)];
            }
        }

        return [...$blocks, ...$this->paragraph($inline)];
    }

    // Retire la grille des contrastes et les titres restés vides (leur contenu était une démo)
    private function clean(array $blocks): array
    {
        $kept = [];
        $skipUnder = null;
        foreach ($blocks as $block) {
            if ($block['level'] !== null && $skipUnder !== null && $block['level'] <= $skipUnder) {
                $skipUnder = null;
            }
            if ($block['level'] !== null && ($block['heading'] ?? '') === self::SKIPPED_HEADING) {
                $skipUnder = $block['level'];
            }
            if ($skipUnder === null) {
                $kept[] = $block;
            }
        }

        // Un titre suivi d'un titre de même niveau ou plus haut (ou de rien) n'a pas de contenu
        $result = [];
        foreach ($kept as $index => $block) {
            $next = $kept[$index + 1] ?? null;
            if ($block['level'] !== null && ($next === null || ($next['level'] !== null && $next['level'] <= $block['level']))) {
                continue;
            }
            $result[] = $block;
        }

        return $result;
    }

    // Un paragraphe, s'il reste du texte
    private function paragraph(array $nodes): array
    {
        $text = trim($this->inlineNodes($nodes));

        return $text === '' ? [] : [['level' => null, 'text' => $text]];
    }

    // Le texte d'un élément en ligne : `code`, [lien](adresse), **gras**, *italique*
    private function inline(\DOMNode $node): string
    {
        return trim($this->inlineNodes(iterator_to_array($node->childNodes)));
    }

    private function inlineNodes(array $nodes): string
    {
        $text = '';
        foreach ($nodes as $node) {
            if ($node instanceof \DOMText) {
                $text .= preg_replace('/\s+/', ' ', $node->textContent);
                continue;
            }
            if (!$node instanceof \DOMElement || $this->isSkipped($node)) {
                continue;
            }
            $text .= match ($node->tagName) {
                'code', 'kbd', 'samp' => '`' . $node->textContent . '`',
                'a' => $node->hasAttribute('href') ? '[' . $this->inline($node) . '](' . $this->absolute($node->getAttribute('href')) . ')' : $this->inline($node),
                'strong', 'b' => '**' . $this->inline($node) . '**',
                'em', 'i' => '*' . $this->inline($node) . '*',
                'br' => ' ',
                default => $this->inlineNodes(iterator_to_array($node->childNodes)),
            };
        }

        return $text;
    }

    // Un bloc de code, avec son langage (class="language-css")
    private function code(\DOMElement $pre): string
    {
        $code = $pre->getElementsByTagName('code')->item(0) ?? $pre;
        preg_match('/language-(\S+)/', $code->getAttribute('class'), $match);

        return '```' . ($match[1] ?? '') . "\n" . rtrim($code->textContent) . "\n```";
    }

    // Une liste à puces ou numérotée ; une sous-liste, en retrait
    private function list(\DOMElement $list, int $depth): string
    {
        $lines = [];
        $number = 1;
        foreach ($list->childNodes as $item) {
            if (!$item instanceof \DOMElement || $item->tagName !== 'li' || $this->isSkipped($item)) {
                continue;
            }
            $text = [];
            $sublists = [];
            foreach ($item->childNodes as $child) {
                if ($child instanceof \DOMElement && ($child->tagName === 'ul' || $child->tagName === 'ol')) {
                    $sublists[] = $this->list($child, $depth + 1);
                } else {
                    $text[] = $child;
                }
            }
            $marker = $list->tagName === 'ol' ? $number++ . '.' : '-';
            $lines[] = str_repeat('    ', $depth) . $marker . ' ' . trim($this->inlineNodes($text));
            array_push($lines, ...$sublists);
        }

        return implode("\n", $lines);
    }

    // Un tableau : sa légende en paragraphe, puis ses lignes ; la première ligne sert d'en-tête
    private function table(\DOMElement $table): array
    {
        $blocks = [];
        $caption = $table->getElementsByTagName('caption')->item(0);
        if ($caption !== null) {
            $blocks = $this->paragraph(iterator_to_array($caption->childNodes));
        }

        $rows = [];
        foreach ($table->getElementsByTagName('tr') as $row) {
            $cells = [];
            foreach ($row->childNodes as $cell) {
                if ($cell instanceof \DOMElement && ($cell->tagName === 'th' || $cell->tagName === 'td')) {
                    $cells[] = str_replace('|', '\|', $this->inline($cell));
                }
            }
            $rows[] = '| ' . implode(' | ', $cells) . ' |';
            if (count($rows) === 1) {
                $rows[] = '|' . str_repeat(' --- |', count($cells));
            }
        }
        $blocks[] = ['level' => null, 'text' => implode("\n", $rows)];

        return $blocks;
    }

    // Caché, décoratif (aria-hidden) ou démo : pas lu
    private function isSkipped(\DOMElement $element): bool
    {
        return in_array($element->tagName, self::SKIPPED, true)
            || $element->hasAttribute('hidden')
            || $element->getAttribute('aria-hidden') === 'true'
            || preg_match('/(^|\s)card(\s|$)/', $element->getAttribute('class'));
    }

    // Une adresse de la doc (/components/button, #variables) devient absolue
    private function absolute(string $href): string
    {
        if (str_starts_with($href, '#')) {
            return $this->url . $href;
        }

        return str_starts_with($href, '/') ? $this->origin . $href : $href;
    }
}
