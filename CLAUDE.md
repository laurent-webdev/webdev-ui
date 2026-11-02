# Nouveau framework CSS/JS (nom à définir)

La v2 de webdev-ui : une refonte totale, plus native, mieux architecturée. L'ancienne version (`/home/laurent/dev/webdev-ui_archive`) est en lecture seule : on n'y touche jamais, aucune compatibilité n'est recherchée. Ses classes sont le point de départ, triées une par une (garder, simplifier, supprimer), puis réécrites, jamais copiées.

**Objectif** : un framework ultra léger, simple, personnalisable, facile à utiliser. En cas de doute : faire plus simple, ou ne pas faire.

## Références

- **D'abord les normes** : spécifications W3C / WHATWG, WCAG, ARIA Authoring Practices Guide, MDN (bon usage et statut Baseline, vérifiés avant d'utiliser une balise, un attribut ou une propriété). Pour l'accessibilité, MDN et le W3C passent en premier, même contre la règle « pas d'aria redondant » (`role="status" aria-live="polite"`, MDN le conseille ; `role="alert"` sans `aria-live`, sinon VoiceOver iOS lit deux fois).
- **Ensuite Bootstrap 6** (v6.0.0-alpha.1) : inspiration pour les classes, les composants natifs et les valeurs, pas une copie ; on s'en écarte quand c'est plus simple ou plus juste. Les noms des variables CSS sont ceux de Laurent, jamais ceux de Bootstrap. Repères : préfixe `--bs-`, système `.theme-<couleur>` qui pose des tokens génériques lus par les composants, boutons `.btn-solid` / `-outline` / `-subtle` / `-text` / `-link`, mêmes breakpoints que nous.
- Puis Tailwind et les autres, pour comparer.

## Règles absolues

- **0 dépendance à l'exécution.** Outils de build : `sass`, `typescript` (et le `gulpfile.js` de Laurent, voir « Build »).
- **Personnalisation = variables CSS uniquement.** Changer une valeur ne demande jamais de rebuild. Pas de map Sass, pas de configuration en JS ou en SCSS. Seule exception : les breakpoints (`var()` ne marche pas dans `@media`), en variables SCSS.
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
- **Padding des composants en vraies valeurs** (`0.375rem`), pas en `--space-*` : changer l'échelle ne redimensionne pas les composants.
- **Où** : `settings/_colors.scss` (couleurs, `--border-color`, `--box-shadow-color`, `--backdrop-background-color`) ; `_spacing.scss` (`--space-0` à `-12`, `n × 0.25rem`) ; `_typography.scss` ; `_variables.scss` (rayons, ombres, `--border-width`, `--state-mix-soft` / `-strong`, `--transition-duration`, `--focus-outline-*`, `--disabled-opacity`, soulignement des liens, `--backdrop-filter`).
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
    - `-border`, `-subtle-border` : bordures décoratives (en essai sur l'accordéon, la carte, le dialogue ; retirées du bouton, de l'alerte et du badge).
- **Clair et sombre** : le thème suit le système ; `data-theme="light"` ou `"dark"` sur `<html>` le force (`color-scheme`). Les composants n'ont **jamais** de règle propre au sombre. Le framework ne fournit pas de JS de bascule (exemple dans la doc).

## Système de thème des composants

- **Couleur et variante séparées** : `<button class="btn-subtle theme-danger">`. Pour les composants seulement ; les utilitaires portent la couleur dans leur nom (`bg-primary`, `color-danger-emphasis`).
- **Chaque composant a ses tokens** `--<composant>-theme-*`, posés par sa propre boucle `@each` de `.theme-*` (`.theme-primary` est donc définie dans plusieurs fichiers : voulu). Un token porte le nom de la couleur qu'il contient (`--btn-theme-color`, `-contrast`, `-state`, `-subtle`, `-emphasis`, `-emphasis-strong`, `-border`, `-subtle-border`) ; la propriété à gauche dit si c'est un fond ou un texte. Les propriétés ne lisent jamais `--color-<nom>` directement.
- **Le thème décide seul** : les tokens s'héritent, un composant sans thème prend celui du parent, le sien passe devant. Le framework n'ajoute aucune règle pour protéger la lisibilité : c'est à l'utilisateur de choisir les bons composants (sur un fond plein, seuls les `-solid`, d'un autre thème ; un lien y prend `link color-inherit`). La doc le montre en contre-exemple.
- **Neutral est une couleur comme les autres** (`theme-neutral`), jamais un défaut caché. **Le défaut est la classe au nom du composant, sans couleur** (`.btn`, `.card`…) : cadre `--border-color`, fond transparent, texte hérité ; survol et clic en `--color-neutral-subtle` (seule lecture directe de `--color-*`). Exception : `.dialog` garde `--color-background`. Une variante sans `.theme-*` n'a pas de couleur (contre-exemple dans chaque page) ; son focus reste visible (`var(--btn-theme-emphasis, currentColor)`).
- **Les variantes s'utilisent seules** et disent comment utiliser le thème : `class="btn-solid theme-primary"`, jamais `.btn .btn-solid`.
    - solid : fond plein + `-contrast`, mélangé à `-state` (`--state-mix-soft` au survol, `-strong` au clic) ;
    - subtle : fond léger + emphasis, mélangé à la couleur du thème (le fond se renforce), texte en emphasis forte au survol et au clic ;
    - outline : cadre + emphasis, devient solid au survol ;
    - text : devient subtle au survol (retrait envisagé) ;
    - link : souligné, l'épaisseur grandit au survol et au clic, la couleur ne change pas.
- **Listes d'éléments** (dropdown, et plus tard `list`, `navbar`, `tab`) : au repos, le texte de la page ; la couleur du thème n'apparaît que dans les états (survol, clic, élément en cours), sur le fond seulement.

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
- **drawer** : un `<dialog>` modal, le côté est la variante (`drawer-start`, `-end`, `-top`, `-bottom`), écart `--drawer-inset`. Pas encore de thème ni de variantes de couleur.
- **dialog.ts** : fermeture animée des `<dialog data-dialog>` (dialogues et drawers) : annule `cancel` et `command="close"`, pose `data-closing`, appelle `close()` à la fin des animations. Solution d'attente (voir « Décisions en attente »).
- **dropdown** : `popover` + `popovertarget` + positionnement par ancre, sans JS. Pas de `role="menu"` ni d'`aria-expanded` écrit (motif « disclosure »). `.dropdown-item` sur `<a>` ou `<button>`, seul le fond change. Pas de variantes : neutral dans son `:root`.
- **form**, en refonte (« tout le reste garde le natif ») : `.form-input` / `-sm` / `-md` / `-lg` (padding, taille, fond, arrondi ; cadre `--form-input-border-color` sans thème, `--color-<nom>` avec un `.theme-*` ; focus comme les boutons, `outline` en emphasis, `currentColor` sans thème ; bouton du champ fichier comme `btn-solid`, sur `:enabled` seulement, `ButtonFace` / `ButtonText` sans thème (les couleurs natives) : demandes de Laurent, 2026-11-02 ; survol et désactivé natifs ; liste déroulante : flèche dessinée, la native de Chromium colle au cadre : `appearance: none` + SVG gris `#808080` en `background-image` à `--form-input-padding-inline` du bord, sans `multiple` ni `size`, comme Bootstrap, 31, 38, 45px dans Chromium et Firefox ; un gris pour les deux thèmes, `right` physique) ; `.form-range`, `.form-checkbox`, `.form-radio` : range, case et bouton radio natifs colorés par `accent-color: var(--form-control-theme-color)` (`--color-<nom>`, tokens `--form-control-theme-*` partagés, comme `--form-control-zoom` ; demande de Laurent, 2026-11-02 ; arrondi du contour : `--border-radius-md`, `-xs`, `50%`, sans effet sur le dessin natif dans Chromium et Firefox ; dans Chromium, avec une couleur claire, la partie vide devient gris foncé en clair : le navigateur garde le contraste ; focus comme les boutons, arrondi `--border-radius-md`, autour du range entier : un contour sur le rond seul demanderait `appearance: none` et de redessiner le range avec `::-webkit-slider-thumb` / `::-moz-range-thumb`, Laurent a choisi le natif) ; `.form-field` (libellé + champ + message, flex en colonne : ne s'étire pas dans une grille) ; `.form-sm` / `-md` / `-lg` sur un groupe (tout ce qu'il contient, cases natives par `zoom`) ; switch sur `<input type="checkbox" role="switch">`, sans JS, comme le bouton (demande de Laurent) : `.form-switch` sans couleur (allumé : `currentColor`), `.form-switch-solid` (allumé : fond `--color-<nom>`, cadre `--color-<nom>-border` (Laurent, 2026-11-02), curseur `-contrast` (un curseur en emphasis a été essayé : bien en clair, 3,22 à 4,03:1, perdu en sombre, 1,53 à 1,74:1) ; éteint : curseur `currentColor`, comme `.form-switch` (essayés puis retirés par Laurent le 2026-11-02 : `--color-<nom>`, 1,75 à 2,43:1 sur la page en clair ; emphasis, au moins 6,37:1) ; en clair, le fond plein est à 1,75-2,43:1 sur la page, choix de Laurent) + `.theme-*` (un `.form-switch-subtle` a été essayé puis retiré par Laurent le 2026-11-02) ; focus comme les boutons (`--form-switch-theme-emphasis`, `currentColor` sans thème, aussi sur `.form-switch` : un `.theme-*` colore le contour du défaut, comme `.btn`) ; tailles `.form-switch-sm` / `-md` / `-lg` combinables ; éteint, toutes : cadre `--form-input-border-color` (le même que les champs), curseur `currentColor`.

## Utilitaires

Un fichier par famille dans `utilities/` : spacing, gap, display, flex, sizing, border, colors, font, text, cursor, object-fit, aspect-ratio, animation, visually-hidden, opacity, visibility, overflow, position, vertical-align, box-shadow.

- **Générés par boucle ou mixin, valeurs lues dans les variables CSS** (`.m-2 { margin: var(--space-2); }`). Les mots-clés (`d-flex`, `cursor-pointer`) n'ont pas de variable.
- **Forme des fichiers responsive** (choisie par Laurent) : un mixin `<famille>-classes($breakpoint: '')` dans le fichier, une ligne par classe, appelé sans préfixe puis dans les 6 `@media (width >= …)` recopiées. Pas de `@content` avec `using`.
- **Ordre d'écriture : tous les côtés, puis un axe, puis un côté**, pour que le plus précis gagne (`class="m-4 mt-0"`, `class="gap-2 row-gap-8"`, `class="border border-2 border-primary"`).
- **Couleurs** : `bg-<nom>` et `bg-<nom>-subtle` ne posent que le fond ; le texte se choisit à part : `color-<nom>-contrast` (sur le fond plein : toujours la paire `bg-* color-*-contrast`), `color-<nom>-emphasis` (texte coloré), `color-<nom>` (couleur brute, icônes et décoration seulement), `color-inherit`.
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
- `base/` : styles des éléments natifs (typographie, fond du `body`). `base/_colors.scss` est en essai, à valider par Laurent ; restent à faire `hr`, `accent-color`, `:focus-visible` commun.

## Organisation des fichiers

Architecture ITCSS, modules Sass (`@use` / `@forward`, jamais `@import`).

```
src/scss/
├── app.scss          un @use par dossier : reset, settings, base, layout, components, utilities
├── settings/         variables CSS globales dans :root (+ _breakpoints.scss, sans sortie CSS)
├── tools/_mixins.scss   mixins (espacements, couleurs dérivées), sans sortie CSS
├── _reset.scss
├── base/
├── layout/           container, grid
├── components/       un fichier par composant
└── utilities/        un fichier par famille
src/ts/
├── bundle.ts         importe chaque composant
└── components/       un fichier par composant qui a besoin de JS
```

- Chaque fichier enveloppe son CSS dans son `@layer` (`reset`, `base`, `layout`, `components`, `utilities`) ; l'ordre vient de la première apparition. Les utilitaires sont en dernier pour surcharger les composants.
- `tools/` et `_breakpoints.scss` sont chargés par chaque fichier qui en a besoin, avec un préfixe (`@use '../tools/mixins';`, `mixins.contrast-colors(…)`), jamais `as *` (l'IDE JetBrains ne retrouve pas la source).
- Un dossier seulement s'il contient plusieurs fichiers ; son `_index.scss` les liste par ordre alphabétique. Pas de numéro dans les noms.
- Nom de fichier = nom du composant, en kebab-case, partials préfixés par `_` (`_btn-close.scss`, `dialog.ts`).
- **Ajouter un composant** : `components/_nom.scss` (+ `src/ts/components/nom.ts` si le JS est indispensable), `@use 'nom';` dans `components/_index.scss`, puis sa page de doc. Pareil pour un utilitaire ou une mise en page.

## JavaScript (si indispensable)

- TypeScript, livré en JS vanilla (modules ES), un seul fichier publié : `dist/js/bundle.js` (+ `.min.js`).
- Le JS change des attributs (`hidden`, `open`, `aria-*`, `data-*`), jamais de style inline.
- Initialisation par un attribut `data-<composant>`. **Un composant = une classe** `export default class <Composant>`, méthodes statiques (`<Composant>.méthode()`, pas `this`), démarrée en bas du fichier par `<Composant>.start()`. Écouteurs en délégation sur `document` (en capture pour `cancel`, `close`, `command`) : marche pour le HTML ajouté plus tard, sans `MutationObserver`. Pas de `destroy()` tant qu'il ne sert pas.
- **Événements pour le site** : les natifs d'abord (`toggle`, `cancel`, `close`, `command`), jamais doublés. Sinon `new CustomEvent('<composant>-<action>', { bubbles: true, detail })` sur l'élément du composant, et `<composant>-before<action>` annulable pour l'action refusable (`tab-beforechange` / `tab-change`). Chaque page de composant avec du JS liste ses événements.

## Build

- `npm run build` / `npm run watch` lancent `gulp build` / `gulp watch` ; `symfony serve` lance le watch (worker de `doc/.symfony.local.yaml`). **Laurent a besoin de `gulpfile.js` : le garder, ne pas proposer de le supprimer.**
- TS compilé par esbuild (déjà dans le gulpfile) de `src/ts/bundle.ts` vers `dist/js/` ; `npm run typecheck` (`tsc`, `noEmit`) vérifie les types.

## Documentation

- Site Symfony dans `doc/` : un contrôleur par section (`MainController` : `/` et `/test` ; `CustomController`, `ComponentController`, `LayoutController`, `UtilityController`), une méthode et un template par page (`templates/<section>/<nom>.html.twig`), **une page par fichier SCSS**. Le menu lit `doc_sections` dans `doc/config/packages/twig.yaml` ; le global `colors` sert aux boucles des démos. Ajouter une page : sa ligne, sa méthode, son template.
- **Mise en page avec le framework seulement**, pas de CSS en plus (balise native sans classe s'il manque une classe). `doc/assets/styles/doc.css` : uniquement les aides des démos ; `doc/assets/app.js` : bascule du thème, bouton `data-demo-toggle`.
- **Chaque composant a sa page, et n'est terminé que quand elle existe** : HTML minimal, variables et comment les changer (défaut, taille, un élément), variantes, tailles, accessibilité, **exemples, contre-exemples et limites**. Les contre-exemples sont en code, jamais affichés (Lighthouse doit rester à 100).
- Blocs de code : `<pre tabindex="0"><code class="language-html">` (une zone qui défile se prend au clavier). Coloration Prism par CDN (cdnjs, version exacte, SRI, thème `prism-a11y-dark`) : doc seulement.
- Page de test `doc/templates/test.html.twig` (`/test`) : vide, pour essayer un exemple avant de le mettre dans sa page.

## Façon de travailler

- **Coder comme Laurent** (son ancien code : `webdev-ui_archive/src/scss/`) : direct et lisible, plus long et détaillé plutôt qu'abstrait, indentation 4 espaces, une boucle `@each` par composant, classes qui partagent des styles regroupées dans un même sélecteur. Laurent avance pas à pas pour comprendre et refactore ensuite : changements petits, proches du code existant, pas de gros refactoring d'un coup.
- **Commentaires concis** : une ligne, le pourquoi. Les explications vont dans la doc.
- **Bonnes pratiques à la lettre, pas de bidouillage** : une solution reconnue ; s'il n'y en a pas, on en discute pour que Laurent comprenne avant de choisir.
- Signaler un choix discutable plutôt que de l'appliquer sans prévenir. Donner le code d'abord, expliquer si demandé. Ne jamais ajouter de dépendance.
- **Tenir ce fichier à jour à chaque décision** : la règle et son pourquoi, en une ou deux lignes. Les mesures, les essais et l'historique vont dans le message de commit, pas ici.

## Ordre de travail

- Faits : `accordion`, `alert`, `badge`, `button`, `btn-close`, `card`, `dialog`, `drawer`, `dropdown`, `link`, `spinner`.
- En refonte : `form`.
- À faire : `list`, `navbar`, `tab` (`tab.ts` prévu), `table`.
- Plus tard : notifications (conteneur fixé, fermeture, minuteur, animations, avec du JS), `.section` (`--section-padding-block` fluide), `.list-unstyled`, `visually-hidden-focusable`.
- Remplacés : `collapse` (= `accordion`), `outline` (= `border border-*`).

## Décisions en attente

- **Couleurs à revoir** quand tous les composants seront faits (Laurent : « il y a qqch qui me gêne de plus en plus », à lui demander). Nouvelle palette commencée le 2026-10-30. Chaque composant a un jeu de tokens différent, `.theme-*` est écrite dans une dizaine de fichiers. Pistes d'un essai annulé : mélanger `in oklab` (pas `in oklch`, la teinte dérive), noir ou blanc par luminance WCAG. Banc d'essai : https://claude.ai/artifact/TvZm72Mybh74tEqAHC4dy8
- **`.btn` ou `.button`** : le code utilise `.btn`.
- **Layers** : pas de déclaration `@layer a, b, c;` d'ordre, et les `:root` de `settings/` sont hors layer.
- **esbuild** contre la règle « seuls `sass` et `typescript` ».
- **Fermeture animée en CSS seul** le jour où `overlay` sera dans Firefox et Safari : supprimer `dialog.ts`. D'ici là, Échap pressé deux fois ferme d'un coup, et un `preventDefault()` du site sur `cancel` est sans effet (un événement `dialog-beforeclose` annulable réglerait ça).
- **Écriture de droite à gauche** : pas de règle `:dir(rtl)` tant que personne ne le demande (`slide-in-start` / `-end`, `translate-middle`, `drawer-*` glissent du mauvais côté ; limite dite dans la doc).
- **Grille sur petit écran** : 12 colonnes = 11 espaces, largeur minimum ; en essai : `--grid-gap` à 1rem et `gap-*` pour les cas serrés.
- **Formulaire** : dates et heures à 33, 40, 47px dans Chromium (au lieu de 31, 38, 45) ; Safari pas testé (flèche des listes, champ fichier, switch, zoom des cases) ; Firefox : focus et thème sombre des cases et des radios pas vus ; en clair, les couleurs pleines (switch allumé, cases, range, cadre des champs) sont sous 3:1 sur le fond de page (choix de Laurent, dit dans la doc).
- `btn-close` à 24px (Laurent avait demandé 20px, sous la cible tactile minimale).
- Retrait de `btn-text`.
- Favicon de `doc/templates/base.html.twig` : erreur W3C (`<` non encodé dans l'URL `data:`), à corriger.
- Navigateurs supportés (`:has()`, `popover`, `command`, positionnement par ancre déjà utilisé).
- Nom du projet.
