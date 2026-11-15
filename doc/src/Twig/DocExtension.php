<?php

namespace App\Twig;

use Twig\Attribute\AsTwigFilter;

// Filtres Twig de la doc
class DocExtension
{
    // Le code d'un exemple (_code.html.twig) : sans les lignes vides du début et de la fin, collé à gauche (l'indentation du template retirée)
    #[AsTwigFilter('dedent')]
    public function dedent(string $code): string
    {
        $lines = explode("\n", $code);

        while ($lines && trim($lines[0]) === '') {
            array_shift($lines);
        }
        while ($lines && trim(end($lines)) === '') {
            array_pop($lines);
        }

        // La plus petite indentation des lignes écrites
        $indent = PHP_INT_MAX;
        foreach ($lines as $line) {
            if (trim($line) !== '') {
                $indent = min($indent, strlen($line) - strlen(ltrim($line)));
            }
        }

        return implode("\n", array_map(fn (string $line) => substr($line, $indent), $lines));
    }
}
