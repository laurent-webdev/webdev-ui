# Nouveau framework CSS/JS (nom à définir)

La v2 de webdev-ui : une refonte totale, plus native, mieux architecturée. L'ancienne version (`/home/laurent/dev/webdev-ui_archive`) est en lecture seule : on n'y touche jamais, aucune compatibilité n'est recherchée. Ses classes sont le point de départ, triées une par une (garder, simplifier, supprimer), puis réécrites, jamais copiées.

**Objectif** : un framework ultra léger, simple, personnalisable, facile à utiliser. En cas de doute : faire plus simple, ou ne pas faire.

## Références

- **D'abord les normes** : spécifications W3C / WHATWG, WCAG, ARIA Authoring Practices Guide, MDN (bon usage et statut Baseline, vérifiés avant d'utiliser une balise, un attribut ou une propriété). Pour l'accessibilité, MDN et le W3C passent en premier, même contre la règle « pas d'aria redondant » (`role="status" aria-live="polite"`, MDN le conseille ; `role="alert"` sans `aria-live`, sinon VoiceOver iOS lit deux fois).
- **Ensuite Bootstrap 6** (v6.0.0-alpha.1) : inspiration pour les classes, les composants natifs et les valeurs, pas une copie ; on s'en écarte quand c'est plus simple ou plus juste. Les noms des variables CSS sont ceux de Laurent, jamais ceux de Bootstrap. Repères : préfixe `--bs-`, système `.theme-<couleur>` qui pose des tokens génériques lus par les composants, boutons `.btn-solid` / `-outline` / `-subtle` / `-text` / `-link`, mêmes breakpoints que nous.
- Puis Tailwind et les autres, pour comparer.

## Règles absolues

- **0 dépendance à l'exécution.** Outils de build : `sass`, `typescript` (et le `gulpfile.js` de Laurent, voir « Build »).
- **Personnalisation = variables CSS uniquement.** Changer une valeur ne demande jamais de rebuild. Pas de map Sass, pas de configuration en JS ou en SCSS. Seule exception : les breakpoints (`var()` ne marche pas dans `@media`), en variables SCSS `!default`, que le site change dans son SCSS avec `@use '…/settings/breakpoints' with (…)` avant le framework.
- **Couleurs en oklch**, dérivées calculées dans le navigateur (`oklch(from)`, `color(from)`, `color-mix()`, `light-dark()`), sans couleur de repli ni `@supports`.
- **CSS d'abord, JS en dernier recours** : `<details>`, `<dialog>`, `popover`, `command` / `commandfor`, `:has()`… avant toute ligne de JS.
- **HTML minimal et natif** : l'élément qui fait déjà le travail, le moins de classes et d'enveloppes possible.
- **Accessibilité** : les `aria-*` indispensables dans chaque exemple, pas ceux qui doublent le natif (sauf conseil MDN / W3C, voir plus haut). Clavier et focus visible obligatoires.
- **Rien d'inutile** : seulement ce qui sert au quotidien, pas de classe « au cas où » ; un besoin rare se règle dans le site ou en surchargeant une variable. Une classe s'ajoute le jour où elle sert.
- **Facile à étendre** : ajouter une valeur ou une classe = une ligne (boucle, mixin, liste).
- **Variantes responsive (`md:`…) seulement pour la mise en page** : display, flex, grid, espacements, largeur et hauteur, `aspect-ratio`, `position-*`, `text-align`. Jamais pour les couleurs, l'opacité, les bordures, les ombres, les tailles de composants.

## Exigence qualité

- **Le framework ne fait jamais perdre de points** : chaque page de démo à 100 dans les 4 catégories Lighthouse, 0 erreur / 0 warning au validateur W3C HTML.
- **Composants robustes** : clavier, contenu long, zoom 200 %, `prefers-reduced-motion`, sans JS quand c'est possible, sans débordement dès 320px.
- **Contrastes vérifiés dans les deux thèmes, au repos, au survol et au clic** (Lighthouse ne teste que le repos) : texte ≥ 4,5:1, contour de focus et bordure qui seule montre un composant ≥ 3:1 (WCAG 1.4.11). Une couleur brute, une ombre ou le gris `--border-color` restent décoratifs.

## Nommage des classes

Pas de préfixe. Tout en minuscules, mots séparés par `-`. **Lisible avant tout** : le nom complet de la propriété CSS, mieux vaut trop verbeux que pas assez (`justify-content-space-between`, `flex-direction-column`, `border-radius-md`, `box-shadow-md`, `vertical-align-middle`, `z-index-1`, `line-height-md`).

| Cas | Format | Exemple |
|---|---|---|
| Utilitaire | `propriété-valeur` | `text-align-center`, `align-items-start` |
| Composant (défaut, sans couleur) | `composant` | `btn`, `card` |
| Élément | `composant-élément` | `card-header`, `dialog-body` |
| Variante | `composant-variante` | `btn-solid`, `card-outline` |
| Couleur d'un composant | `theme-<couleur>` | `theme-primary` |
| Taille | `composant-taille` (suffixe) | `btn-sm`, `container-lg` |
| Breakpoint | `breakpoint:classe` (préfixe) | `md:d-flex` |
| État | attribut natif ou ARIA | `disabled`, `open`, `aria-current` (jamais `is-*`) |

- **Abréviations autorisées, et seulement elles** : `d` (display), `m` / `p` et leurs côtés (`mt`, `mx`…), `w` / `h`, `fs` / `fw` / `fst`, `bg` (background-color), `border` seul pour `border-width` et `border-color` (`border-2`, `border-primary`). Toute nouvelle abréviation s'ajoute ici.
- **La valeur CSS est dans le nom** : `start` / `end` (pas `flex-start`, pas `left` / `right`), `w-fit-content`, `opacity-25` (= 25 %), `w-33` (= `calc(100% / 3)`), `aspect-ratio-16x9` (`/` et `:` demanderaient un échappement).
- **Couleur d'abord, puis la dérivée**, pour les classes comme pour les variables : `bg-primary-subtle`, `color-danger-emphasis`, `border-primary-emphasis`.
- **Tailles** `xs`, `sm`, `md`, `lg`, `xl` ; **breakpoints** `xs` (360px), `sm`, `md`, `lg`, `xl`, `2xl`. Une classe sans préfixe vaut pour tous les écrans. Jamais `sm:` pour dire « petit ».
- **Toutes les tailles existent en classe**, défaut compris (`.btn-md`, `.container-2xl`, `.fw-normal`) : la valeur est écrite dans la classe, un site qui change le défaut garde la taille d'origine.
- **Taille fixe ou qui suit le texte** : un composant dans le texte (badge, spinner) est en `em`, sans classes de taille ; un composant posé dans la mise en page (bouton, accordéon, champ) a des tailles fixes sur l'échelle globale, jamais sous 24px de haut (cible tactile, WCAG 2.5.8).
- Propriétés logiques partout où le nom dit `start` / `end` / `x` / `y` (`ms` = `margin-inline-start`). Ce qui est physique (`translate`) ne s'inverse pas en écriture de droite à gauche (voir « Décisions en attente »).
- En SCSS, le `:` s'échappe (`.md\:d-flex`) ; les classes responsive sont générées par un mixin, jamais écrites à la main.

## Variables CSS

- **Aucun préfixe. Le nom dit la propriété CSS qu'elle règle**, sans jargon (`--focus-outline-width`, pas `--focus-ring-width`).
- **Deux formes** :
    - échelle globale `--<propriété>-<valeur>` (`--space-3`, `--font-size-lg`, `--border-radius-md`), dans `settings/`, pour une valeur partagée par plusieurs classes ou composants ;
    - réglage `--<composant>-<propriété>` (`--btn-padding-block`), une seule variable par propriété, dans un `:root` en tête du fichier du composant ; les tailles la réécrivent sur leur classe (`.btn-sm { --btn-padding-block: 0.25rem; }`), jamais de `--btn-padding-block-sm`.
- **Une variable n'existe que si un site voudra la changer.** Une formule ou une valeur réglée pour le contraste va en dur. Fichiers propres, lisibles par un débutant, sans variable pseudo-utile ni indirection (`--x-current`).
- **Peu de variables par composant** : padding, rayon (pointe vers `--border-radius-md`), épaisseur de bordure (vers `--border-width` : toutes les bordures changent ensemble), parfois une largeur ou une durée. Le reste (transition, focus, survol, clic) lit les globales directement ; on le personnalise en surchargeant la globale sur la classe.
- **Zéro avec son unité** : une variable de longueur à zéro s'écrit `0px`, dans le framework comme dans les exemples de la doc. Elle peut entrer dans un `calc()` (coins des enfants, écarts du drawer), où un `0` sans unité rend le calcul invalide : la propriété revient à sa valeur initiale (coins carrés de `list-borderless`).
- **Padding des composants en vraies valeurs** (`0.375rem`), pas en `--space-*` : changer l'échelle ne redimensionne pas les composants.
- **Où** : `settings/_colors.scss` (couleurs, `--border-color`, `--box-shadow-color`, `--backdrop-background-color`, `--glass-background-color`) ; `_spacing.scss` (`--space-0` à `-12`, `n × 0.25rem`) ; `_typography.scss` ; `_variables.scss` (rayons, ombres, `--border-width`, `--state-mix-soft` / `-strong`, `--transition-duration`, `--focus-outline-*`, `--disabled-opacity`, soulignement des liens, `--backdrop-filter`, `--glass-backdrop-filter`).
- **Changer une valeur = une ligne dans le site**, sans `!important` ni spécificité (le CSS du site, hors layer, gagne toujours) :
    - une échelle : `:root { --border-radius-md: 8px; }` ;
    - le défaut d'un composant : `:root { --btn-padding-inline: 1.25rem; }` ;
    - une taille : `.btn-lg { --btn-padding-inline: 1.5rem; }` ;
    - un élément : `.btn-hero { --btn-padding-inline: 2rem; }`.

## Couleurs

- **Neuf couleurs** : `primary`, `secondary`, `accent`, `success`, `danger`, `warning`, `info`, `neutral`, `inverse`, plus `--color-background`. Chacune a une valeur claire et une sombre (`light-dark()`), en oklch. Le mode clair est validé par Laurent ; les réglages se font sur le sombre.
- **Dérivées**, écrites par les mixins de `tools/_mixins.scss`, appelés dans le `:root` de `settings/_colors.scss` avec la liste `$colors`. Nouvelle couleur : une `--color-<nom>` et son nom dans `$colors`.
    - `-contrast` : noir ou blanc, le plus lisible sur la couleur pleine (luminance WCAG) ;
    - `-state` : mélangée au fond au survol et au clic, l'inverse du texte : le contraste ne peut qu'augmenter ;
    - `-subtle` : fond léger ;
    - `-emphasis` : texte coloré lisible sur le fond de page et sur le subtle ;
    - `-emphasis-strong` : texte sur le subtle renforcé (survol et clic des variantes subtle) ;
    - `-border`, `-subtle-border` : bordures décoratives (en essai sur l'accordéon, la carte, le dialogue et le switch ; retirées du bouton, de l'alerte et du badge).
- **Clair et sombre** : le thème suit le système ; `data-theme="light"` ou `"dark"` sur `<html>` le force (`color-scheme`). Les composants n'ont **jamais** de règle propre au sombre. Le framework ne fournit pas de JS de bascule (exemple dans la doc).

## Système de thème des composants

- **Couleur et variante séparées** : `<button class="btn-subtle theme-danger">`. Pour les composants seulement ; les utilitaires portent la couleur dans leur nom (`bg-primary`, `color-danger-emphasis`).
- **Chaque composant a ses tokens** `--<composant>-theme-*`, posés par sa propre boucle `@each` de `.theme-*` (`.theme-primary` est donc définie dans plusieurs fichiers : voulu). Un token porte le nom de la couleur qu'il contient (`--btn-theme-color`, `-contrast`, `-state`, `-subtle`, `-emphasis`, `-emphasis-strong`, `-border`, `-subtle-border`) ; la propriété à gauche dit si c'est un fond ou un texte. Les propriétés ne lisent jamais `--color-<nom>` directement.
- **Le thème décide seul** : les tokens s'héritent, un composant sans thème prend celui du parent, le sien passe devant. Le framework n'ajoute aucune règle pour protéger la lisibilité : c'est à l'utilisateur de choisir les bons composants (sur un fond plein, seuls les `-solid`, d'un autre thème ; la croix `btn-close-solid` prend le même thème, son carré se fond dans le fond ; un lien y prend `link color-inherit`). La doc le montre en contre-exemple.
- **Neutral est une couleur comme les autres** (`theme-neutral`), jamais un défaut caché. **Le défaut est la classe au nom du composant, sans couleur** (`.btn`, `.card`…) : cadre `--border-color`, fond transparent, texte hérité ; survol et clic en voile gris neutral. **Voile** : tout ce qui est transparent au repos (`btn`, `btn-close`, titre de l'accordéon, `pagination` sans couleur, éléments de `list`, `dropdown`, `navbar`, `tab`) prend au survol, au clic et en cours un voile transparent de sa couleur (neutral sans thème), `color-mix(in oklch, couleur var(--state-mix-soft / -strong), transparent)` : ce qui est derrière (verre, image) reste visible (la « couche d'état » de Material 3). Les variantes colorées (`-solid`, `-subtle`, `-outline`, `-text`, `pagination-subtle` / `-solid`, `navbar-subtle` / `-solid`) gardent leurs fonds pleins. Exception : `.dialog` garde `--color-background`. Ces deux couleurs, `--color-background` (fond du dialogue, du drawer, du dropdown, du toast, des champs) et le danger d'un champ en erreur sont les seules lectures directes de `--color-*`. Une variante sans `.theme-*` n'a pas de couleur (contre-exemple dans chaque page) ; son focus reste visible (`var(--btn-theme-emphasis, currentColor)`).
- **Les variantes s'utilisent seules** et disent comment utiliser le thème : `class="btn-solid theme-primary"`, jamais `.btn .btn-solid`.
    - solid : fond plein + `-contrast`, mélangé à `-state` (`--state-mix-soft` au survol, `-strong` au clic) ;
    - subtle : fond léger + emphasis, mélangé à la couleur du thème (le fond se renforce), texte en emphasis forte au survol et au clic ;
    - outline : cadre + emphasis, devient solid au survol ;
    - text : devient subtle au survol (retrait envisagé) ;
    - link : souligné, l'épaisseur grandit au survol et au clic, la couleur ne change pas.
- **Listes d'éléments** (dropdown, list, tab, et plus tard `navbar`) : au repos, le texte de la page ; la couleur du thème n'apparaît que dans les états (survol, clic, élément en cours), sur le fond seulement. Focus comme les boutons, en emphasis du thème (neutral sans thème), à l'intérieur de l'élément. L'élément en cours (`aria-current`) : le fond du clic seul, pas de gras (le texte bougerait) ; sous 3:1 contre la page et par la couleur seule (WCAG 1.4.1, 1.4.11) : choix de Laurent, dit dans la doc. Exception, l'onglet choisi : un trait dessous en emphasis (la forme reconnue d'un onglet, ≥ 4,5:1), sa place gardée en padding pour que le texte ne bouge pas.

## Composants

**Modèle de référence : `src/scss/components/_button.scss`** (ne pas en copier le code ici). Un fichier composant contient, dans cet ordre : variables locales (`:root`) → forme commune → éléments → variantes → tailles → états (nesting Sass, `&:hover`).

- **Focus** : `:focus-visible`, `outline` de la couleur emphasis du thème (ou `currentColor`), `--focus-outline-width` / `-offset`. Pas de halo.
- **Désactivé** : attribut natif `disabled`, `opacity: var(--disabled-opacity)`, `pointer-events: none`, pas de `cursor: not-allowed`.
- **Transitions** : `--transition-duration` (couleurs) ; un composant qui s'ouvre a sa propre durée (`--accordion-transition-duration`). Le reset coupe tout sous `prefers-reduced-motion: reduce`.

Faits (le détail est dans le SCSS et dans la page de doc de chacun) :

- **button** : `<a>` pour aller vers une page, `<button>` pour une action, mêmes styles calculés. Tailles 24, 31, 38, 45px. Pas de taille responsive.
- **link** : `<a class="link theme-*">` ; un `<a>` sans classe reste natif. Sans thème, la couleur du texte autour. Survol et clic : soulignement 2× puis 3× plus épais. Focus `currentColor`.
- **spinner** : cercle en CSS, `currentColor` (pas de `.theme-*`), en `em`. Toujours un texte dans un `role="status" aria-live="polite"` présent avant le spinner.
- **badge** : suit le texte (`max(--font-size-xs, 0.75em)`), pas de tailles, pas interactif (une étiquette cliquable est un bouton).
- **alert** : message dans la page, sans JS, un bloc. Pas de `role` au chargement ; affiché par JS : zone présente dès le chargement, `role="status" aria-live="polite"` ou `role="alert"` seul pour une erreur urgente. Le texte dit le type (WCAG 1.4.1).
- **accordion** : `<div class="accordion-*">` + `<details name>` + `<summary>` + `.accordion-body`, sans JS ni `aria-expanded`. `block-size: fit-content`. Ouverture animée par `::details-content` + `interpolate-size` (Chrome et Edge seulement, ailleurs d'un coup). Flèche en bordures `currentColor` (visible en contraste élevé).
- **card** : `.card-header` / `-body` / `-footer`, `<img>` directement dedans. La variante colore toute la carte ; texte de la page sur subtle et outline. Flex en colonne : hauteurs égales dans une grille. Coins des enfants : `calc(rayon - bordure)`.
- **dialog** : `<dialog>` natif avec ses propres classes (pas celles de la carte), `.dialog-header` / `-body` / `-footer` en `<div>` (pas `<header>` / `<footer>`). Ouvert et fermé sans JS (`command` / `commandfor`, `closedby`, `<form method="dialog">`). Tailles `xs` à `xl` = largeur du breakpoint. Page bloquée par `:root:has(dialog:modal)` + `scrollbar-gutter: stable` dans le reset.
- **btn-close** : le carré est le bouton, la croix un `mask-image` sur `::before` en `currentColor`. Mêmes variantes que le bouton, 24px par défaut (= xs). `aria-label="Fermer"`.
- **drawer** : un `<dialog>` modal, le côté est la variante (`drawer-start`, `-end`, `-top`, `-bottom`), écart `--drawer-inset`. Pas encore de thème ni de variantes de couleur. Toujours là : `drawer-start` / `-end` sur un `<aside>` ou un `<nav>` (pas un `<dialog>` : il garderait le rôle dialog, comme la navbar), collé (`sticky`, une colonne à côté du contenu) ou, avec l'utilitaire `position-fixed`, contre le bord de l'écran aux écarts du drawer (menu de côté ; le site décale sa page lui-même), toute la hauteur de l'écran ; sur petit écran, `d-none md:d-block` et le même contenu dans un vrai drawer.
- **dialog.ts** : fermeture animée des `<dialog data-dialog>` (dialogues et drawers) : annule `cancel` et `command="close"`, pose `data-closing`, appelle `close()` à la fin des animations. Solution d'attente (voir « Décisions en attente »).
- **dropdown** : `popover` + `popovertarget` + positionnement par ancre, sans JS. Pas de `role="menu"` ni d'`aria-expanded` écrit (motif « disclosure »). `.dropdown-item` sur `<a>` ou `<button>`, seul le fond change. Pas de variantes : neutral dans son `:root`.
- **list** : `<ul class="list">` + `<li>` sans classe (le padding) ; `.list-item` sur le `<a>` ou le `<button>` d'un `<li>`, qui prend le padding par `:has()` (toute la ligne se clique). Comme le dropdown : seul le fond change, pas de variantes, neutral dans son `:root`, pas de tailles. Puces retirées par `list-style-type: ""` (avec `none`, Safari n'annonce plus la liste ; `role="list"` = warning W3C). `block-size: fit-content` comme l'accordéon. Option `.list-borderless` (comme `table-borderless`) : `--list-border-width: 0`, et chaque `<li>` prend les coins de la liste (sinon le fond d'un élément du milieu serait carré). `.list-unstyled`, seule (liens d'un pied de page, étiquettes) : le retrait à 0 et le `list-style-type: ""` de `.list`, dans le même sélecteur, rien d'autre ; dans `_list.scss` et sa page, pas un utilitaire (son nom est celui d'une variante).
- **tab** + **tab.ts** : motif « Tabs » de l'APG, `<div class="tab" role="tablist" data-tab>` + `<button class="tab-item" role="tab">`, panneaux `role="tabpanel"` sans classe. L'état de départ est dans le HTML (`aria-selected`, `tabindex="-1"`, `hidden`), le JS ne fait que le changer (pas de MutationObserver) : sans JS, seul le premier panneau se voit. Activation automatique, ← → Début Fin, `tab-beforechange` / `tab-change` sur la rangée. Rangée en `overflow-x: auto` (pas de passage à la ligne). Vertical par `aria-orientation="vertical"` (demandé par l'ARIA, lu par le CSS, pas de classe), ↑ ↓ en plus, à gauche du panneau par la grille. Pas de variantes ni de tailles.
- **table** : `<table class="table">` + `<caption>` et `<th scope>`, les autres balises sans classe ; un trait `--border-color` sous chaque ligne, cellules en haut, `th` et `caption` alignés comme le texte, `tabular-nums`, `block-size: fit-content` comme la liste. Pas de variantes : `.theme-*` directement sur `.table` (comme `.link`), fond `-subtle`, traits `-subtle-border`, texte de la page ; sans thème, fond transparent et `--border-color` (repli dans le `var()`). Options ajoutées à `.table` et combinables : `-striped` et `-hover` (le fond léger mélangé à la couleur à `--state-mix-soft` / `-strong`, neutral sans thème), `-bordered`, `-borderless` (`--table-border-width: 0`). Tailles `-sm` / `-md` / `-lg`, padding seul (texte par `fs-*`). Trop large : `<div class="overflow-x-auto" role="region" aria-labelledby tabindex="0">`, jamais `display: block` sur la table (sa structure se perd).
- **navbar** : `<nav class="navbar md:navbar-expand">` + `.navbar-brand`, une `.navbar-list` dans la barre et la même dans un `.drawer-*` ouvert par `<button class="btn navbar-toggle" command="show-modal">`. Deux listes, pas un `<dialog>` affiché dans la barre comme Bootstrap 6 : il garderait le rôle dialog sur ordinateur et demanderait d'annuler tout le style du drawer. `navbar-expand` (+ `sm:` … `2xl:`) choisit la liste qui se montre ; `.navbar-item` suit la règle des listes d'éléments. `.navbar-toggle` ajoute les trois traits (`mask-image`) à un bouton du framework. Variantes `.navbar-subtle` / `-solid` : fond, `--navbar-padding-inline`, états des liens un cran plus forts (comme le bouton subtle et solid), focus `currentColor` sur solid ; seulement la liste de la barre (`> .navbar-list`), le drawer garde la page. Sans thème, neutral (le `:root` des listes d'éléments). Bande sur toute la largeur du parent, pas de `.container` à l'intérieur.
- **pagination** : `<nav aria-label>` + `<ul class="pagination">` + `<a class="pagination-item">` (ou `<button>`), `<li>` sans classe, `<li>…</li>` pour les points de suspension. Sans cadre (transparent : hauteur d'un bouton, visible en contraste élevé). `.pagination` sans couleur : texte de la page, survol en voile gris, page en cours au voile du clic. `.pagination-subtle` et `-solid` + `.theme-*` : texte en emphasis comme `btn-text` (survol `-subtle`, clic renforcé + emphasis forte) ; page en cours au fond du clic + emphasis forte (subtle, un cran au-dessus du survol) ou fond plein + `-contrast` (solid). Focus comme les boutons. Désactivé : `<a>` sans `href` ou `<button disabled>`. Carré pour un chiffre (`min-inline-size` en `1lh`). Option `.pagination-group` : éléments collés, cadre gris partagé (marge négative), coins aux deux bouts, au survol et sur la page en cours, cadre de la couleur du thème (`--color-neutral` sans couleur), devant les voisins. Tailles `-sm` / `-md` / `-lg` (31, 38, 45px).
- **toast** : une pile, plusieurs à la fois. `<div class="toast-container" role="status" aria-live="polite" aria-atomic="false" popover="manual" data-toast>` vide au chargement, en bas côté fin, ouvert par `toast.ts` : dans le top layer, au-dessus de tout ce qui est positionné, sans `z-index` (pas de `display` écrit sur le conteneur : il afficherait le popover fermé, écart en marges) ; le site y ajoute un `.toast` / `-solid` / `-subtle` / `-outline` + `.theme-*` (comme l'alerte, fond `--color-background` : il passe sur la page), un texte et une croix `data-toast-close`. Options combinables `.toast-container-top` et `-start` (comme le drawer) ; en haut, le dernier arrivé sous les autres (l'ordre du HTML, pas de `column-reverse`). Minuteur en CSS (`animation-delay: var(--toast-duration)`, en pause au survol et au focus ; aucun sur un toast qui contient un lien ou un autre bouton que la croix, par `:has()`, WCAG 2.2.1) : le JS n'a pas à savoir qu'un toast arrive, sans `MutationObserver` ; le reset ne réduit que la durée, le délai reste. `toast.ts` retire le toast à la fin de `toast-hide` ou du fondu de la croix (`data-closing`). Un dialogue modal ouvert après passe devant : le dialogue a son conteneur dans son `.dialog-body`, sans `popover` (il est déjà dans le top layer).
- **form**, en refonte ; tout le reste garde le natif :
    - `.form-input` / `-sm` / `-md` / `-lg` (chaque taille s'utilise seule) : toute la largeur du parent (`width: 100%`, comme Bootstrap : la largeur native déborde à 320px ; `w-auto` la rend), padding, taille, fond `--color-background`, arrondi ; cadre `--form-input-border-color`, celui du thème avec un `.theme-*` ; focus comme les boutons ; survol natif ; désactivé estompé comme les boutons (notre fond, notre cadre et le `color: inherit` du reset effacent l'aspect natif). En erreur, `[aria-invalid="true"]` pose les tokens du thème danger (cadre 2,43:1 en clair, accepté : le message dit l'erreur) ; message en utilitaires (`fs-sm color-danger-emphasis`), pas de classe. Pas de `:user-invalid` : cadre rouge sans message en texte (WCAG 1.4.1). Champ fichier : bouton collé au cadre, comme `btn-solid` sur `:enabled`, `ButtonFace` / `ButtonText` sans thème. Liste sans `multiple` ni `size` : `appearance: none` et une flèche SVG grise `#808080` (une pour les deux thèmes, `right` physique) à `--form-input-padding-inline` du bord, la flèche native de Chromium collant au cadre.
    - `.form-range`, `.form-checkbox`, `.form-radio` : le dessin natif coloré par `accent-color` (tokens `--form-control-theme-*`) ; focus comme les boutons, autour du range entier (un contour sur le rond seul demanderait de redessiner le range : Laurent garde le natif).
    - `.form-field` : libellé, champ et message en flex colonne ; `> label`, cases et boutons radio en `align-self: start` (pas cliquables sur toute la ligne) ; sur un `<fieldset>`, il empile les cases.
    - `.form-input-group` : un champ, des boutons du framework et des `.form-input-group-text` (@, €, https://) collés sur une ligne, comme `pagination-group` (marge négative, coins aux deux bouts) ; le champ prend la place qui reste ; sur la ligne partagée, le plus coloré devant : boutons solid, outline et subtle devant le champ, le champ devant les textes et `.btn`, le champ en erreur devant tout, le focus encore devant ; la taille par `.form-sm` / `-md` / `-lg` sur le groupe, pas sur le champ. Pas `.form-group` : c'est le nom de notre `.form-field` dans Bootstrap 6.
    - `.form-sm` / `-md` / `-lg` sur un groupe : tout ce qu'il contient, les contrôles natifs par `zoom`.
    - Switch sur `<input type="checkbox" role="switch">`, sans JS, sur le modèle du bouton : `.form-switch` sans couleur (allumé : `currentColor`) et `.form-switch-solid` + `.theme-*` (allumé : fond de la couleur, cadre `-border`, curseur `-contrast`) ; éteint, tous : cadre `--form-input-border-color`, curseur `currentColor`. Focus comme les boutons, aussi sur `.form-switch`. Tailles `.form-switch-sm` / `-md` / `-lg`, combinables.
    - Écartés par Laurent, à ne pas reproposer : `.form-switch-subtle` ; un curseur coloré (emphasis ou couleur du thème, allumé comme éteint) ; le rebond du curseur.

## Utilitaires

Un fichier par famille dans `utilities/` : spacing, gap, display, flex, sizing, border, colors, font, text, cursor, object-fit, aspect-ratio, animation, visually-hidden, opacity, visibility, overflow, position, vertical-align, box-shadow, glass.

- **Générés par boucle ou mixin, valeurs lues dans les variables CSS** (`.m-2 { margin: var(--space-2); }`). Les mots-clés (`d-flex`, `cursor-pointer`) n'ont pas de variable.
- **Forme des fichiers responsive** (choisie par Laurent) : un mixin `<famille>-classes($breakpoint: '')` dans le fichier, une ligne par classe, appelé sans préfixe puis dans les 6 `@media (width >= …)` recopiées. Pas de `@content` avec `using`.
- **Ordre d'écriture : tous les côtés, puis un axe, puis un côté**, pour que le plus précis gagne (`class="m-4 mt-0"`, `class="gap-2 row-gap-8"`, `class="border border-2 border-primary"`).
- **Couleurs** : `bg-<nom>` et `bg-<nom>-subtle` ne posent que le fond ; le texte se choisit à part : `color-<nom>-contrast` (sur le fond plein : toujours la paire `bg-* color-*-contrast`), `color-<nom>-emphasis` (texte coloré), `color-<nom>` (couleur brute, icônes et décoration seulement), `color-inherit`.
- **Verre** : `glass`, un effet nommé comme `visually-hidden`, à ajouter à un composant sans couleur ou `-outline` (card, accordion, dialog, drawer, toast, navbar, dropdown…), jamais sur un `-solid` (texte noir ou blanc sur le verre). `--glass-background-color` (le fond de la page à 70 % : le texte de la page garde 7:1 devant du noir ou du blanc, le texte coloré tombe à 3:1) et `--glass-backdrop-filter` ; fond plein sous `prefers-reduced-transparency: reduce`. `backdrop-filter` fait de l'élément la référence des éléments fixés qu'il contient : le conteneur de toasts d'un dialogue en verre se met dans son coin.
- **Cacher** : `hidden` / `d-none` (caché à tous), `visually-hidden` (lu par les lecteurs d'écran), `visibility-hidden` (garde sa place), `opacity-0` (reste cliquable et lu).
- **Écartés volontairement** : `order-*` et `*-reverse` (l'ordre affiché ne suit plus le DOM, WCAG 1.3.2), `text-align-justify`, `overflow-scroll`, largeurs en `vw` (les `w-*` sont en %), z-index nommés (`<dialog>` et `popover` passent au-dessus par le top layer), `!important` dans les utilitaires.
- Animations : une variable de durée par animation (`--animation-fade-in-duration`), propriétés `translate` / `scale` / `rotate` (pas `transform`), pas de clignotement.

## Mise en page

- **container** (`layout/_container.scss`) : fluide, une seule largeur max (`--container-max-width`, 96rem = 2xl), pas de paliers ; `.container-xs` à `-2xl` = largeur du breakpoint du même nom ; marges `--container-padding-inline: 1rem`.
- **grid** (`layout/_grid.scss`) : `.grid` + `.col-1` à `-12`, CSS Grid `repeat(12, minmax(0, 1fr))`, `gap: var(--grid-gap)` (1rem), enfants sans classe sur toute la largeur, variantes en `@media` (pas `@container`). `.grid` et pas `.row`. L'espace se règle avec les utilitaires `gap-*`.
- **Breakpoints** (`settings/_breakpoints.scss`, `$screen-*`, en rem) : xs 360, sm 576, md 768, lg 1024, xl 1280, 2xl 1536px. Règle : un breakpoint au début de chaque famille d'appareils, jamais au milieu. `2xl:` s'écrit `.\32 xl\:` dans le CSS.
- **Typographie** : `--font-size-xs` à `-lg` fixes (12 à 18px), `-xl` à `-6xl` fluides (`clamp()`) ; titres h1 = 3xl … h6 = sm. **L'interligne suit la taille, pas la balise** : 1.5 pour le texte, −0.1 par taille au-dessus, 1.2 minimum ; `.fs-*` règle aussi l'interligne.

## Reset et base

- `_reset.scss` : remise à zéro sans style visuel. `margin: 0` seul (pas de `padding: 0`) ; **`:where(:not(dialog, [popover]))` gardé, ne pas reproposer de le retirer** ; `hidden` en `!important` ; `prefers-reduced-motion: reduce` global en `!important` (choix strict assumé) ; `interpolate-size` seulement sous `no-preference` ; `scrollbar-gutter: stable` sur `html` ; pas de `ul[role="list"]` (warning W3C).
- `base/` : styles des éléments natifs (typographie, fond du `body`). `base/_colors.scss` est en essai, à valider par Laurent ; `accent-color: currentColor` sur le `body` : cases, boutons radio, range et progress sans thème dans la couleur du texte, le défaut sans couleur comme `form-switch` (Bootstrap 6 met primary ; un site le change sur son `body`). Restent à faire `hr`, `:focus-visible` commun.

## Organisation des fichiers

Architecture ITCSS, modules Sass (`@use` / `@forward`, jamais `@import`).

```
src/scss/
├── webdev-ui.scss    un @use par dossier : reset, settings, base, layout, components, utilities
├── settings/         variables CSS globales dans :root (+ _breakpoints.scss, sans sortie CSS)
├── tools/_mixins.scss   mixins (espacements, couleurs dérivées), sans sortie CSS
├── _reset.scss
├── base/
├── layout/           container, grid
├── components/       un fichier par composant
└── utilities/        un fichier par famille
src/ts/
├── webdev-ui.ts      importe chaque composant
└── components/       un fichier par composant qui a besoin de JS
```

- Chaque fichier enveloppe son CSS dans son `@layer` (`reset`, `base`, `layout`, `components`, `utilities`) ; l'ordre vient de la première apparition. Les utilitaires sont en dernier pour surcharger les composants.
- `tools/` et `_breakpoints.scss` sont chargés par chaque fichier qui en a besoin, avec un préfixe (`@use '../tools/mixins';`, `mixins.contrast-colors(…)`), jamais `as *` (l'IDE JetBrains ne retrouve pas la source).
- Un dossier seulement s'il contient plusieurs fichiers, sauf les couches ITCSS (`tools/` n'a que `_mixins.scss`) ; son `_index.scss` les liste par ordre alphabétique. Pas de numéro dans les noms.
- Nom de fichier = nom du composant, en kebab-case, partials préfixés par `_` (`_btn-close.scss`, `dialog.ts`).
- **Ajouter un composant** : `components/_nom.scss` (+ `src/ts/components/nom.ts` si le JS est indispensable), `@use 'nom';` dans `components/_index.scss`, puis sa page de doc. Pareil pour un utilitaire ou une mise en page.

## JavaScript (si indispensable)

- TypeScript, livré en JS vanilla (modules ES), un seul fichier publié : `dist/js/webdev-ui.js` (+ `.min.js`).
- Le JS change des attributs (`hidden`, `open`, `aria-*`, `data-*`), jamais de style inline.
- Initialisation par un attribut `data-<composant>`. **Un composant = une classe** `export default class <Composant>`, méthodes statiques (`<Composant>.méthode()`, pas `this`), démarrée en bas du fichier par `<Composant>.start()`. Écouteurs en délégation sur `document` (en capture pour `cancel`, `close`, `command`) : marche pour le HTML ajouté plus tard, sans `MutationObserver`. Pas de `destroy()` tant qu'il ne sert pas.
- **Événements pour le site** : les natifs d'abord (`toggle`, `cancel`, `close`, `command`), jamais doublés. Sinon `new CustomEvent('<composant>-<action>', { bubbles: true, detail })` sur l'élément du composant, et `<composant>-before<action>` annulable pour l'action refusable (`tab-beforechange` / `tab-change`). Chaque page de composant avec du JS liste ses événements.

## Build

- Fichiers publiés au nom du projet (`dist/css/webdev-ui.css`, `dist/js/webdev-ui.js`, + `.min`), comme leurs sources (`src/scss/webdev-ui.scss`, `src/ts/webdev-ui.ts`) : `app.css` se confondait avec le CSS du site.
- `npm run build` / `npm run watch` lancent `gulp build` / `gulp watch` ; `symfony serve` lance le watch (worker de `doc/.symfony.local.yaml`). **Laurent a besoin de `gulpfile.js` : le garder, ne pas proposer de le supprimer.**
- TS compilé par esbuild (déjà dans le gulpfile) de `src/ts/webdev-ui.ts` vers `dist/js/` ; `npm run typecheck` (`tsc`, `noEmit`) vérifie les types.
- Node n'existe que dans le conteneur Docker du dépôt : `docker exec -w /app webdev-ui npm run …`. `dist/` est versionné : il va dans le commit avec `src/`.
- Skills du projet (`.claude/skills/`) : `/nouveau-composant <nom>` pour commencer un composant, `/verifier` avant un commit (typecheck, build, W3C sur toutes les pages, règles de ce fichier ; Lighthouse et contrastes restent à la main).

## Documentation

- Site Symfony dans `doc/` : un contrôleur par section (`MainController` : `/` et `/test` ; `CustomController`, `ComponentController`, `LayoutController`, `UtilityController`), une méthode et un template par page (`templates/<section>/<nom>.html.twig`), **une page par fichier SCSS**. **La doc n'a pas de thème** : en-tête, menu, nom du site, accueil sans `.theme-*` (neutral par défaut) ; les couleurs ne sont que dans les démos. En-tête, contenu et pied de page : trois `.card glass` (`<header>`, `<main>`, `<footer>` dans `base.html.twig`), à 0.75rem l'une de l'autre (l'écart du menu fixé), le contenu en `.card-body p-4 md:p-10`, l'en-tête en `flex-wrap-wrap` (ses boutons passent à la ligne à 320px), une recherche au milieu, entre deux côtés `lg:w-25` en `lg:flex-wrap-nowrap` : motif « combobox » de l'APG (`<search>`, `<input type="text" role="combobox" enterkeyhint="search">` (`combobox` refusé par le W3C sur `type="search"`), un `.dropdown glass` `role="listbox" popover="manual"` de la largeur du champ par `anchor-size()` dans `doc.css`, une option = un lien `role="option" tabindex="-1"` chargé par htmx) ; clic dans le champ : la liste s'ouvre sans attendre la frappe (toutes les pages si le champ est vide), un deuxième clic la ferme (exemple de l'APG) ; `app.js` filtre sans majuscules ni accents (le début du nom d'abord), le focus reste dans le champ (`aria-activedescendant`, l'option entourée comme au focus), ↓ ↑ en boucle, Entrée, Échap (ferme la liste, puis vide le champ) ; pas de `<datalist>` : sa liste ne prend ni le style ni la largeur du champ ; sur grand écran (lg), la page a la hauteur de l'écran (`lg:h-100svh`), l'en-tête et le pied restent, le `<main>` prend la place qui reste (`flex-grow-1 lg:min-h-0`) et son `.card-body` défile (`position-relative overflow-y-auto` : les `visually-hidden` défilent dedans), `doc.css` rend la place de la barre de la fenêtre (`scrollbar-gutter: auto`) ; sur petit écran et en zoom, toute la page défile (fixes, l'en-tête et le pied cacheraient le contenu, WCAG 1.4.10) ; un élément fixé d'une démo va dans le bloc Twig `fixed`, hors de la carte (`backdrop-filter` en ferait sa référence). Chaque tableau de la doc dans `<div class="overflow-x-auto" role="region" aria-labelledby tabindex="0">`, nommé par sa `<caption>` ou le titre de sa section (`id` sur le `<h2>`) : la doc ne déborde pas à 320px. Le menu (`_menu.html.twig` : par section un titre en `fs-md fw-bold` sur une bande grise (`bg-neutral-subtle border-radius-md`, pour mieux voir les sections, sans couleur) et une `.list list-borderless`, un trait `border-top` entre deux sections, lignes resserrées par les variables de la liste dans `doc.css`, texte `fs-sm`) est inclus deux fois : sur grand écran (lg), dans un `<nav class="drawer-start position-fixed glass">` toujours là, le nom du site en haut, la page décalée par `doc.css`, la page en cours centrée par `app.js` ; sur petit écran, dans le drawer en verre (`glass`) du bouton Menu. Il lit `doc_sections` dans `doc/config/packages/twig.yaml` ; le global `colors` sert aux boucles des démos. Ajouter une page : sa ligne, sa méthode, son template.
- **Mise en page avec le framework seulement**, pas de CSS en plus (balise native sans classe s'il manque une classe). `doc/assets/styles/doc.css` : les aides des démos (dont `.demo-drawer-fixed` : la doc se décale quand le drawer fixé est affiché) et le fond de la doc (foncé, vagues de couleur floues aux teintes de la palette, animées par `body::before` / `::after`, clair en thème clair) ; `doc/assets/app.js` : bascule du thème, bouton `data-demo-toggle`, bouton `data-demo-toast` (ajoute la copie d'un `<template>` au conteneur), la page en cours au milieu du menu fixé, le bouton Copier de chaque bloc de code (`btn btn-xs` dans le `<pre>`, sans cadre ni changement au survol et au clic (`doc.css`), la coche dit que c'est copié, placé par une enveloppe `position-relative` pour ne pas défiler avec le code ; annonce dans le `#doc-copy-status` de `base.html.twig`).
- **Chaque composant a sa page, et n'est terminé que quand elle existe** : HTML minimal, variables et comment les changer (défaut, taille, un élément), variantes, tailles, accessibilité, **exemples, contre-exemples et limites**. Les contre-exemples sont en code, jamais affichés (Lighthouse doit rester à 100).
- **Peu de texte, des exemples** (modèle : `components/button.html.twig`) : un exemple = le rendu dans un `.card`, son code juste en dessous, écrit une seule fois (`{% set code %}…{% endset %}` + `{{ include('_example.html.twig', {code: code}) }}` ; `class` change la mise en page du rendu, `html` rend autre chose que le code montré (`{% set demo %}` + `html: demo`, jamais `{% set html %}` : `include` passe toute la page, il resterait pour les exemples suivants) ; code seul : `_code.html.twig`, `language: 'css'` ; filtre `dedent` de `src/Twig/DocExtension.php`). Au plus une phrase avant un exemple, noms de classes en `<code>`, HTML écrit en entier sans boucle Twig (le template = le code affiché), boîtes des démos en classes du framework (`bg-primary-subtle p-2`, `border` pour le parent) ; une aide de `doc.css` (`demo-height`, `demo-glass`) seulement dans le rendu (`html`). Plan : titre + une phrase, exemples, Variables (tableau + CSS commenté), Accessibilité (quelques points), À éviter (`<!-- Non : … -->` / `<!-- Oui -->` dans le code), Limites, Toutes les combinaisons (grille sans code, pour les contrastes).
- Blocs de code : `<pre tabindex="0"><code class="language-html">` (une zone qui défile se prend au clavier). Coloration Prism par CDN (cdnjs, version exacte, SRI) : doc seulement. Pas de thème Prism : ses couleurs sont dans `doc.css`, celles du fond de la doc (un fond uni, l'indigo clair en thème clair, un peu plus foncé que la page pour se voir sur le verre blanc, l'indigo foncé en sombre ; les mots en `--color-*-emphasis` des vagues primary, secondary, info et accent, ponctuation et commentaires en neutral, commentaires en italique), texte en `--font-size-sm`.
- **Navigation sans rechargement** : htmx 2 (`doc/assets/js/htmx.min.js`, doc seulement, le framework reste sans dépendance). Les liens des deux menus, de l'en-tête, du précédent / suivant et de l'accueil (`data-hx-boost`) ne remplacent que `#doc-content` (le `<main>` et le bloc `fixed`, seul gardé pour le bouton Retour) : le menu garde son défilement. Attributs en `data-hx-*` (`hx-*` est refusé par le W3C). Après chaque changement, `app.js` refait ce que faisait le chargement : fermer le drawer du menu, `aria-current` des deux menus, Prism, boutons Copier, conteneurs de toasts, focus sur le `<h1>` (le lecteur d'écran annonce la page ; sans contour dans `doc.css` : pas cliquable, le contour natif de Chromium faisait le tour du texte et du bloc) ; les écouteurs des démos sont sur `document`. Limites : un `{% block stylesheets %}` de page ne se charge pas par htmx ; sur grand écran, Retour remet le main en haut (htmx ne garde que la position de la fenêtre).
- Scripts de `base.html.twig` : `importmap('app')` avant le `<script type="module">` du framework (Firefox ignore une importmap posée après le début du chargement d'un module : plus aucun JS de la doc ; Chromium l'accepte).
- Pied de page : « Cette doc est faite avec » webdev-ui, htmx et Prism (liens et petits logos : le favicon, et des SVG écrits dans `base.html.twig` en `currentColor`, de Simple Icons et du dépôt de Prism), et le lien du projet sur GitHub.
- Page de test `doc/templates/test.html.twig` (`/test`) : vide, pour essayer un exemple avant de le mettre dans sa page.
- **Modèles** (dernière section du menu, `TemplateController`) : des pages entières prêtes à copier (tableau de bord, liste avec filtres, tableau de projet, réglages du compte, connexion, page d'accueil), faites **seulement avec le framework** : pas de `doc.css`, pas de `style`, le JS du site seulement s'il le faut (le toast des réglages). Chacune est un fichier HTML écrit en entier, `templates/templates/pages/<nom>.html.twig` (`/templates/<nom>/page`), dont le seul Twig est l'`asset()` des deux fichiers du framework, montré en `css/webdev-ui.min.css` et `js/webdev-ui.min.js` ; sa page de doc (`templates/templates/<nom>.html.twig`) : une phrase, l'aperçu (`_preview.html.twig` : la page dans un iframe `inert`, réduit de moitié par `.demo-template` de `doc.css`), le bouton qui l'ouvre, « Ce qu'il utilise » (liens vers les composants), le code entier (`_source.html.twig`, `source()`). Contenus inventés et réalistes (Brûlerie Margot, Les Cimes, Studio Ardoise), e-mails en `exemple.fr`. Le `w3c.sh` de `/verifier` les valide avec la doc.
- Accueil : Installer (deux façons, toujours la dernière version : les deux `.min` téléchargés depuis la doc (`download`), ou le projet entier sur GitHub ; pas de tag ni de CDN, Laurent change souvent le framework) ; Personnaliser (tout se recalcule dans le navigateur quand on change une variable, sauf les breakpoints : `@use … with` et SCSS à recompiler) ; Ce qu'il y a dedans ; Navigateurs, un tableau simple (logo et nom du navigateur, version minimum), pas le détail par fonction (choix de Laurent). Versions d'après web-features (les données Baseline de MDN) ; Opera, Brave et Samsung Internet : la première version avec Chromium 135 ou plus (données MDN, journal de Brave). Logos de `@browser-logos` dans `doc/assets/images/browsers/`. À mettre à jour quand une fonction indispensable plus récente entre dans le framework.

## Façon de travailler

- **Coder comme Laurent** (son ancien code : `webdev-ui_archive/src/scss/`) : direct et lisible, plus long et détaillé plutôt qu'abstrait, indentation 4 espaces, une boucle `@each` par composant, classes qui partagent des styles regroupées dans un même sélecteur. Laurent avance pas à pas pour comprendre et refactore ensuite : changements petits, proches du code existant, pas de gros refactoring d'un coup.
- **Commentaires concis** : une ligne, le pourquoi. Les explications vont dans la doc.
- **Bonnes pratiques à la lettre, pas de bidouillage** : une solution reconnue ; s'il n'y en a pas, on en discute pour que Laurent comprenne avant de choisir.
- Signaler un choix discutable plutôt que de l'appliquer sans prévenir. Donner le code d'abord, expliquer si demandé. Ne jamais ajouter de dépendance.
- **Tenir ce fichier à jour à chaque décision** : la règle et son pourquoi, en une ou deux lignes. Les mesures, les essais et l'historique vont dans le message de commit, pas ici.

## Ordre de travail

- Faits : `accordion`, `alert`, `badge`, `button`, `btn-close`, `card`, `dialog`, `drawer`, `dropdown`, `link`, `list`, `navbar`, `pagination`, `spinner`, `tab`, `table`, `toast`.
- En refonte : `form`.
- Plus tard : `.section` (`--section-padding-block` fluide), `visually-hidden-focusable`.
- Remplacés : `collapse` (= `accordion`), `outline` (= `border border-*`).

## Décisions en attente

- **Couleurs à revoir** quand tous les composants seront faits (Laurent : « il y a qqch qui me gêne de plus en plus », à lui demander). Nouvelle palette commencée le 2026-10-30. Chaque composant a un jeu de tokens différent, `.theme-*` est écrite dans une dizaine de fichiers. Pistes d'un essai annulé : mélanger `in oklab` (pas `in oklch`, la teinte dérive), noir ou blanc par luminance WCAG. Banc d'essai : https://claude.ai/artifact/TvZm72Mybh74tEqAHC4dy8
- **`.btn` ou `.button`** : le code utilise `.btn`.
- **Layers** : pas de déclaration `@layer a, b, c;` d'ordre, et les `:root` de `settings/` sont hors layer.
- **esbuild** contre la règle « seuls `sass` et `typescript` ».
- **Fermeture animée en CSS seul** le jour où `overlay` sera dans Firefox et Safari : supprimer `dialog.ts`. D'ici là, Échap pressé deux fois ferme d'un coup, et un `preventDefault()` du site sur `cancel` est sans effet (un événement `dialog-beforeclose` annulable réglerait ça).
- **Écriture de droite à gauche** : pas de règle `:dir(rtl)` tant que personne ne le demande (`slide-in-start` / `-end`, `translate-middle`, `drawer-*` glissent du mauvais côté ; limite dite dans la doc).
- **Grille sur petit écran** : 12 colonnes = 11 espaces, largeur minimum ; en essai : `--grid-gap` à 1rem et `gap-*` pour les cas serrés.
- **Liste** : `list-style-type: ""` garde la liste dans Safari d'après un test de 2023 (Matuzović, Safari 16.5) repris par Bootstrap 6, pas par MDN : à vérifier avec VoiceOver.
- **Formulaire** : dates et heures à 33, 40, 47px dans Chromium (au lieu de 31, 38, 45) ; Safari pas testé (flèche des listes, champ fichier, switch, zoom des cases) ; Firefox : focus et thème sombre des cases et des radios pas vus ; en clair, les couleurs pleines (switch allumé, cases, range, cadre des champs) sont sous 3:1 sur le fond de page (choix de Laurent, dit dans la doc).
- **Focus sur un fond plein** : en sombre, le contour emphasis d'un bouton `-solid` d'un autre thème, ou d'une croix `btn-close-solid` du même thème, posé sur un fond plein (`toast-solid`, `dialog-solid`, `alert-solid`) est sous 3:1 : à revoir avec les couleurs.
- `btn-close` à 24px (Laurent avait demandé 20px, sous la cible tactile minimale).
- Retrait de `btn-text`.
- Navigateurs supportés (`:has()`, `popover`, `command`, positionnement par ancre déjà utilisé).
- Nom du projet (les fichiers `webdev-ui.*` le suivront).
