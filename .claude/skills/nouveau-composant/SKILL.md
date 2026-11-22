---
name: nouveau-composant
description: Créer un composant du framework (SCSS, JS si indispensable, page de doc, CLAUDE.md) sur le modèle de _button.scss. À utiliser quand on demande de commencer un composant de la liste « À faire » (list, navbar, tab, table…) ou d'en ajouter un nouveau.
argument-hint: <nom-du-composant>
---

# Nouveau composant : $ARGUMENTS

Les règles sont dans `CLAUDE.md` (Nommage, Variables CSS, Couleurs, Système de thème, Composants), `.claude/rules/components.md` (les composants déjà faits) et `.claude/rules/doc.md` (les pages de doc). Ce skill dit seulement **dans quel ordre** les appliquer. Avancer pas à pas : une étape, puis l'accord de l'utilisateur, puis la suivante.

## 1. Préparer, puis proposer (rien n'est écrit)

1. Lire `src/scss/components/_button.scss` (le modèle) et le composant fait le plus proche (une liste d'éléments → `_dropdown.scss`, un bloc → `_card.scss`, ouvert ou fermé → `_accordion.scss` ou `_dialog.scss`).
2. Vérifier les normes : l'élément natif qui fait déjà le travail, le motif de l'ARIA APG s'il y en a un, le statut Baseline (MDN) de chaque balise, attribut ou propriété nouvelle. Le dire si c'est hors Baseline.
3. Regarder Bootstrap 6 pour les noms de classes et le HTML : `https://cdn.jsdelivr.net/npm/bootstrap@6.0.0-alpha.1/dist/css/bootstrap.css`.
4. **Proposer à l'utilisateur**, court, avec le HTML minimal en code :
    - les classes : défaut `.<nom>`, éléments `.<nom>-<élément>`, variantes, tailles (avec `-md`), ou « pas de taille, suit le texte (em) » ;
    - les tokens `--<nom>-theme-*` et les variables du `:root` (peu : padding, rayon, bordure ; seulement ce qu'un site changera) ;
    - JS ou pas, et pourquoi le natif ne suffit pas ;
    - ce qu'on écarte de Bootstrap, et pourquoi.

   Attendre son accord avant d'écrire.

## 2. SCSS : `src/scss/components/_<nom>.scss`

- Tout dans `@layer components { … }`, ordre du fichier : `:root` → boucle `.theme-*` → forme commune → éléments → variantes → tailles → états (en nesting `&:hover`).
- Boucle `@each $color in primary, secondary, accent, success, danger, warning, info, neutral, inverse` écrite en entier, comme le bouton ; seulement les tokens dont le composant se sert.
- Le défaut et les variantes partagent un même sélecteur pour la forme commune (`.<nom>, .<nom>-solid, …`).
- Focus, désactivé, transitions : copier la forme de `_button.scss` (`var(--<nom>-theme-emphasis, currentColor)`, `opacity: var(--disabled-opacity)` + `pointer-events: none`).
- Tailles : chaque taille réécrit les variables du `:root` sur sa classe, valeurs en dur, `-md` compris.
- Commentaires d'une ligne, qui disent le pourquoi, jamais d'où vient la valeur.
- Puis ajouter `@use '<nom>';` dans `src/scss/components/_index.scss`, à sa place alphabétique.

## 3. JS, seulement si indispensable

- `src/ts/components/<nom>.ts` : `export default class <Nom>`, méthodes statiques, `<Nom>.start()` en bas du fichier, écouteurs délégués sur `document`, initialisation par `data-<nom>`. Le JS change des attributs, jamais de style.
- `import './components/<nom>';` dans `src/ts/webdev-ui.ts`.
- `docker exec -w /app webdev-ui npm run typecheck`.

## 4. Page de doc

- Méthode dans `doc/src/Controller/ComponentController.php`, à sa place alphabétique : `#[Route('/<nom>', name: 'app_<nom_en_snake_case>')]`, méthode en camelCase.
- Ligne dans `doc/config/packages/twig.yaml` (`doc_sections`, section `component`), triée par libellé français : `[app_<nom>, <Libellé>, components/<nom>.html.twig]`.
- Template `doc/templates/components/<nom>.html.twig` (`{% extends 'base.html.twig' %}`, blocs `title` et `body`), sections `<h2 class="mt-10">` dans cet ordre, sans celles qui ne servent pas :
    1. `<h1>` + une phrase `<p class="fs-lg color-neutral-emphasis mb-6">`
    2. Par défaut
    3. Une section par variante, couleurs en boucle `{% for color in colors %}`
    4. Tailles
    5. HTML (le minimal, en `<pre class="mt-2" tabindex="0"><code class="language-html">`)
    6. Exemples (« Exemple : … »)
    7. Variables (tableau Variable / Défaut / Rôle, `<th scope="row">`)
    8. Exemple : changer les valeurs (le défaut, une taille, un élément du site)
    9. JavaScript (les événements), si le composant en a
    10. Accessibilité
    11. Contre-exemples : en code seulement, jamais affichés ; au moins la variante sans `.theme-*`
    12. Limites
- Mise en page avec les classes du framework seulement ; `doc/assets/styles/doc.css` ne reçoit que des aides de démo.

## 5. Vérifier

- `/verifier`, puis contrastes mesurés dans les deux thèmes, au repos, au survol et au clic (texte ≥ 4,5:1, contour de focus et bordure seule ≥ 3:1), clavier, 320px, zoom 200 %, `prefers-reduced-motion`.
- Donner les mesures à l'utilisateur ; elles iront dans le message de commit.

## 6. CLAUDE.md

- « Ordre de travail » : passer le composant de « À faire » à « Faits ».
- `.claude/rules/components.md` : une puce de une ou deux lignes (le HTML, ce qui le distingue, le pourquoi d'un choix inhabituel). Pas de mesures ni d'essais : ils vont dans le commit.
- Un point non tranché va dans « Décisions en attente ».
