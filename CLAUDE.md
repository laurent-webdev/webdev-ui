# Nouveau framework CSS/JS (nom à définir)

La v2 de webdev-ui : une refonte totale, plus native, mieux architecturée.

**Objectif** : un framework ultra léger, simple, personnalisable, facile à utiliser. En cas de doute : faire plus simple, ou ne pas faire.

Ce fichier donne les règles communes. Les choix de chaque composant sont dans `.claude/rules/components.md`, le site de doc dans `.claude/rules/doc.md` : Claude Code les charge quand il ouvre un fichier qu'ils concernent.

## Références

- **D'abord les normes** : spécifications W3C / WHATWG, WCAG, ARIA Authoring Practices Guide, MDN (bon usage et statut Baseline, vérifiés avant d'utiliser une balise, un attribut ou une propriété). Pour l'accessibilité, MDN et le W3C passent en premier, même contre la règle « pas d'aria redondant » (`role="status" aria-live="polite"`, MDN le conseille ; `role="alert"` sans `aria-live`, sinon VoiceOver iOS lit deux fois).
- **Ensuite Bootstrap 6** (v6.0.0-alpha.1) : inspiration pour les classes, les composants natifs et les valeurs, pas une copie ; on s'en écarte quand c'est plus simple ou plus juste. Les noms des variables CSS sont les nôtres, jamais ceux de Bootstrap. Repères : préfixe `--bs-`, système `.theme-<couleur>` qui pose des tokens génériques lus par les composants, boutons `.btn-solid` / `-outline` / `-subtle` / `-text` / `-link`, mêmes breakpoints que nous. Puis Tailwind et les autres, pour comparer.

## Règles absolues

- **0 dépendance à l'exécution.** Outils de build : `sass`, `typescript` (et `gulpfile.js`, voir « Build »).
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
| Effet (plusieurs propriétés) | son nom usuel | `glass`, `visually-hidden`, `text-truncate` |

- **Abréviations autorisées, et seulement elles** : `d` (display), `m` / `p` et leurs côtés (`mt`, `mx`…), `w` / `h`, `fs` / `fw` / `fst`, `bg` (background-color), `border` seul pour `border-width` et `border-color` (`border-2`, `border-primary`). Toute nouvelle abréviation s'ajoute ici.
- **La valeur CSS est dans le nom** : `start` / `end` (pas `flex-start`, pas `left` / `right`), `w-fit-content`, `opacity-25` (= 25 %), `w-33` (= `calc(100% / 3)`), `aspect-ratio-16x9` (`/` et `:` demanderaient un échappement).
- **Couleur d'abord, puis la dérivée**, pour les classes comme pour les variables : `bg-primary-subtle`, `color-danger-emphasis`, `border-primary-emphasis`.
- **Tailles** `xs`, `sm`, `md`, `lg`, `xl` ; **breakpoints** `xs` (360px), `sm`, `md`, `lg`, `xl`, `2xl`. Une classe sans préfixe vaut pour tous les écrans. Jamais `sm:` pour dire « petit ».
- **Toutes les tailles existent en classe**, défaut compris (`.btn-md`, `.container-2xl`, `.fw-normal`) : la valeur est écrite dans la classe, un site qui change le défaut garde la taille d'origine.
- **Taille fixe ou qui suit le texte** : un composant dans le texte (badge, spinner) est en `em`, sans classes de taille ; un composant posé dans la mise en page (bouton, accordéon, champ) a des tailles fixes sur l'échelle globale, jamais sous 24px de haut (cible tactile, WCAG 2.5.8). Une classe de taille écrit le padding, le `font-size` et le `line-height` de sa taille : la hauteur ne dépend pas du texte autour (un `btn-md` dans un `<h1>` fait 36px). Sans classe de taille, le composant prend la taille du texte autour (`.btn` dans un `fs-sm`), voulu. Exception : le switch (16, 20, 24px), un contrôle à côté de son libellé comme une case, qui agrandit la cible.
- Propriétés logiques partout où le nom dit `start` / `end` / `x` / `y` (`ms` = `margin-inline-start`). Ce qui est physique (`translate`) ne s'inverse pas en écriture de droite à gauche (voir « Décisions en attente »). Ailleurs, le physique : `width`, `height`, `min-width` (pas `inline-size` / `block-size`).
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
- **Changer une valeur = une ligne dans le site**, sans `!important` ni spécificité (le CSS du site, hors layer, gagne toujours) : une échelle `:root { --border-radius-md: 8px; }`, le défaut d'un composant `:root { --btn-padding-inline: 1.25rem; }`, une taille `.btn-lg { --btn-padding-inline: 1.5rem; }`, un élément `.btn-hero { --btn-padding-inline: 2rem; }`.

## Couleurs

- **Neuf couleurs** : `primary`, `secondary`, `accent`, `success`, `danger`, `warning`, `info`, `neutral`, `inverse`, plus `--color-background`. Chacune a une valeur claire et une sombre (`light-dark()`), en oklch. Le mode clair est validé ; les réglages se font sur le sombre.
- **Dérivées**, écrites par les mixins de `tools/_mixins.scss`, appelés dans le `:root` de `settings/_colors.scss` avec la liste `$colors`. Nouvelle couleur : une `--color-<nom>` et son nom dans `$colors` ; les `.theme-*` des composants et les utilitaires de couleur la lisent (`@use '../settings/colors';`, `@each $color in colors.$colors`), jamais une liste recopiée.
    - `-contrast` : noir ou blanc, le plus lisible sur la couleur pleine (luminance WCAG) ;
    - `-state` : mélangée au fond au survol et au clic, l'inverse du texte : le contraste ne peut qu'augmenter ;
    - `-subtle` : fond léger ;
    - `-emphasis` : texte coloré lisible sur le fond de page et sur le subtle ;
    - `-emphasis-strong` : texte sur le subtle renforcé (survol et clic des variantes subtle) ;
    - `-border`, `-subtle-border` : bordures décoratives (en essai sur l'accordéon, la carte, le dialogue, le switch et la table ; retirées du bouton, de l'alerte et du badge).
- **Clair et sombre** : le thème suit le système ; `data-theme="light"` ou `"dark"` sur `<html>` le force (`color-scheme`). Les composants n'ont **jamais** de règle propre au sombre. Le framework ne fournit pas de JS de bascule (exemple dans la doc).

## Système de thème des composants

- **Couleur et variante séparées** : `<button class="btn-subtle theme-danger">`. Pour les composants seulement ; les utilitaires portent la couleur dans leur nom (`bg-primary`, `color-danger-emphasis`).
- **Chaque composant a ses tokens** `--<composant>-theme-*`, posés par sa propre boucle `@each` de `.theme-*` (`.theme-primary` est donc définie dans plusieurs fichiers : voulu). Un token porte le nom de la couleur qu'il contient (`--btn-theme-color`, `-contrast`, `-state`, `-subtle`, `-emphasis`, `-emphasis-strong`, `-border`, `-subtle-border`) ; la propriété à gauche dit si c'est un fond ou un texte. Les propriétés ne lisent jamais `--color-<nom>` directement.
- **Le thème décide seul** : les tokens s'héritent, un composant sans thème prend celui du parent, le sien passe devant. Le framework n'ajoute aucune règle pour protéger la lisibilité : c'est à l'utilisateur de choisir les bons composants (sur un fond plein, seuls les `-solid`, d'un autre thème ; la croix `btn-close-solid` prend le même thème, son carré se fond dans le fond ; un lien y prend `link color-inherit`). La doc le montre en contre-exemple.
- **Neutral est une couleur comme les autres** (`theme-neutral`), jamais un défaut caché. **Le défaut est la classe au nom du composant, sans couleur** (`.btn`, `.card`…) : cadre `--border-color`, fond transparent, texte hérité ; survol et clic en voile (gris neutral sans thème). **Voile** : tout ce qui est transparent au repos (`btn`, `btn-close`, titre de l'accordéon, `pagination` sans couleur, éléments de `list`, `dropdown`, `navbar`, `tab`) prend au survol, au clic et en cours un voile transparent de sa couleur (neutral sans thème), `color-mix(in oklch, var(--btn-theme-color, var(--color-neutral)) var(--state-mix-soft / -strong), transparent)` (un `.btn` dans un `.theme-danger` a un voile et un focus rouges) : ce qui est derrière (verre, image) reste visible (la « couche d'état » de Material 3). Les variantes colorées (`-solid`, `-subtle`, `-outline`, `-text`, `pagination-subtle` / `-solid`, `navbar-subtle` / `-solid`) gardent leurs fonds pleins. Exception : `.dialog` garde `--color-background`. Lectures directes de `--color-*`, trois cas seulement : `--color-background` pour un fond opaque (dialogue, drawer, dropdown, toast, champs, curseur du switch allumé), neutral pour le défaut sans thème (repli du voile, `-subtle` de `form-input-group-text` et des tableaux, `:root` des listes d'éléments), danger pour un champ en erreur. Une variante sans `.theme-*` n'a pas de couleur (contre-exemple dans chaque page) ; son focus reste visible (`var(--btn-theme-emphasis, currentColor)`).
- **Les variantes s'utilisent seules** et disent comment utiliser le thème : `class="btn-solid theme-primary"`, jamais `.btn .btn-solid`.
    - solid : fond plein + `-contrast`, mélangé à `-state` (`--state-mix-soft` au survol, `-strong` au clic) ;
    - subtle : fond léger + emphasis, mélangé à la couleur du thème (le fond se renforce), texte en emphasis forte au survol et au clic ;
    - outline : cadre + emphasis, devient solid au survol ;
    - text : devient subtle au survol (retrait envisagé) ;
    - link : souligné, l'épaisseur grandit au survol et au clic, la couleur ne change pas.
    - sur subtle et outline, un contenant (carte, dialogue, contenu de l'accordéon) garde le texte de la page ; un message court (alerte, toast, badge) et le titre de l'accordéon, qui se clique, sont en emphasis.
- **Listes d'éléments** (dropdown, list, tab, et plus tard `navbar`) : au repos, le texte de la page ; la couleur du thème n'apparaît que dans les états (survol, clic, élément en cours), sur le fond seulement. Focus comme les boutons, en emphasis du thème (neutral sans thème), à l'intérieur de l'élément. L'élément en cours (`aria-current`) : le fond du clic seul, pas de gras (le texte bougerait) ; sous 3:1 contre la page et par la couleur seule (WCAG 1.4.1, 1.4.11) : choix assumé, dit dans la doc. Exception, l'onglet choisi : un trait dessous en emphasis (la forme reconnue d'un onglet, ≥ 4,5:1), sa place gardée en padding pour que le texte ne bouge pas.

## Composants

**Modèle de référence : `src/scss/components/_button.scss`** (ne pas en copier le code ici). Un fichier composant contient, dans cet ordre : variables locales (`:root`) → boucle `.theme-*` → forme commune (états imbriqués : `&:focus-visible`, `&:disabled`) → éléments → défaut sans couleur → variantes → tailles.

- **Focus** : `:focus-visible`, `outline` de la couleur emphasis du thème (ou `currentColor`), `--focus-outline-width` / `-offset`. Pas de halo.
- **Désactivé** : attribut natif `disabled`, `opacity: var(--disabled-opacity)`, `pointer-events: none`, pas de `cursor: not-allowed`.
- **Transitions** : `--transition-duration` (couleurs) ; un composant qui s'ouvre a sa propre durée (`--accordion-transition-duration`). Le reset coupe tout sous `prefers-reduced-motion: reduce`.
- **Ombre** : seulement le dialogue, le drawer (en `<dialog>` comme dans la page), le dropdown et le toast ; les autres n'en ont pas. `box-shadow-*` en ajoute, `box-shadow-none` la retire. Décidé : les garder, ne pas reproposer de les retirer.
- **Choix de chaque composant** (HTML attendu, tailles, limites) : `.claude/rules/components.md`.

## Utilitaires

- **Générés par boucle ou mixin, valeurs lues dans les variables CSS** (`.m-2 { margin: var(--space-2); }`). Les mots-clés (`d-flex`, `cursor-pointer`) n'ont pas de variable.
- **Forme des fichiers responsive** (décidée) : un mixin `<famille>-classes($breakpoint: '')` dans le fichier, une ligne par classe, appelé sans préfixe puis dans les 6 `@media (width >= …)` recopiées. Pas de `@content` avec `using`.
- **Ordre d'écriture : tous les côtés, puis un axe, puis un côté**, pour que le plus précis gagne (`class="m-4 mt-0"`, `class="gap-2 row-gap-8"`, `class="border border-2 border-primary"`).
- **Couleurs** : `bg-<nom>` et `bg-<nom>-subtle` ne posent que le fond ; le texte se choisit à part : `color-<nom>-contrast` (sur le fond plein : toujours la paire `bg-* color-*-contrast`), `color-<nom>-emphasis` (texte coloré), `color-<nom>` (couleur brute, icônes et décoration seulement), `color-inherit`.
- **Verre** : `glass`, un effet nommé comme `visually-hidden`, à ajouter à un composant sans couleur ou `-outline` (card, accordion, dialog, drawer, toast, navbar, dropdown…), jamais sur un `-solid` (texte noir ou blanc sur le verre). `--glass-background-color` (le fond de la page à 70 % : le texte de la page garde 7:1 devant du noir ou du blanc, le texte coloré tombe à 3:1) et `--glass-backdrop-filter` ; fond plein sous `prefers-reduced-transparency: reduce`. `backdrop-filter` fait de l'élément la référence des éléments fixés qu'il contient : le conteneur de toasts d'un dialogue en verre se met dans son coin.
- **Cacher** : `hidden` / `d-none` (caché à tous), `visually-hidden` (lu par les lecteurs d'écran), `visibility-hidden` (garde sa place), `opacity-0` (reste cliquable et lu).
- **Écartés volontairement** : `order-*` et `*-reverse` (l'ordre affiché ne suit plus le DOM, WCAG 1.3.2), `text-align-justify`, `overflow-scroll`, largeurs en `vw` (les `w-*` sont en %), z-index nommés (`<dialog>` et `popover` passent au-dessus par le top layer), `!important` dans les utilitaires, `cursor-not-allowed` (un désactivé a `pointer-events: none` : la souris passe au travers ; `cursor-pointer` reste pour le libellé d'une case).
- Animations : une variable de durée par animation (`--animation-fade-in-duration`), propriétés `translate` / `scale` / `rotate` (pas `transform`), pas de clignotement.

## Mise en page

- **container** (`layout/_container.scss`) : fluide, une seule largeur max (`--container-max-width`, 96rem = 2xl), pas de paliers ; `.container-xs` à `-2xl` = largeur du breakpoint du même nom ; marges `--container-padding-inline: 1rem`.
- **grid** (`layout/_grid.scss`) : `.grid` + `.col-1` à `-12`, CSS Grid `repeat(12, minmax(0, 1fr))`, `gap: var(--grid-gap)` (1rem), enfants sans classe sur toute la largeur, variantes en `@media` (pas `@container`). `.grid` et pas `.row`. L'espace se règle avec les utilitaires `gap-*`.
- **Breakpoints** (`settings/_breakpoints.scss`, `$screen-*`, en rem) : xs 360, sm 576, md 768, lg 1024, xl 1280, 2xl 1536px. Règle : un breakpoint au début de chaque famille d'appareils, jamais au milieu. `2xl:` s'écrit `.\32 xl\:` dans le CSS.
- **Typographie** : `--font-size-xs` à `-lg` fixes (12 à 18px), `-xl` à `-6xl` fluides (`clamp()`) ; titres h1 = 3xl … h6 = sm. **L'interligne suit la taille, pas la balise** : 1.5 pour le texte, −0.1 par taille au-dessus, 1.2 minimum ; `.fs-*` règle aussi l'interligne.

## Reset et base

- `_reset.scss` : remise à zéro sans style visuel. `margin: 0` seul (pas de `padding: 0`) ; **`:where(:not(dialog, [popover]))` gardé, ne pas reproposer de le retirer** ; `hidden` en `!important` ; `prefers-reduced-motion: reduce` global en `!important` (choix strict assumé) ; `interpolate-size` seulement sous `no-preference` ; `scrollbar-gutter: stable` sur `html`, gardé (essais écartés : seulement pendant le blocage du dialogue, une page courte bouge de 15px ; `overflow-y: scroll`, une barre vide sur une page courte) ; pas de `ul[role="list"]` (warning W3C).
- `base/` : styles des éléments natifs (typographie, fond du `body`). `base/_colors.scss` est en essai, à valider ; `accent-color: currentColor` sur le `body` : cases, boutons radio, range et progress sans thème dans la couleur du texte, le défaut sans couleur comme `form-switch` (Bootstrap 6 met primary ; un site le change sur son `body`). Restent à faire `hr`, `:focus-visible` commun.

## Organisation des fichiers

Architecture ITCSS, modules Sass (`@use` / `@forward`, jamais `@import`).

- `src/scss/webdev-ui.scss` : un `@use` par dossier, dans l'ordre : `_reset.scss`, `settings/` (variables CSS globales dans `:root`, + `_breakpoints.scss` sans sortie CSS), `base/`, `layout/` (container, grid), `components/` (un fichier par composant), `utilities/` (un fichier par famille). `tools/_mixins.scss` (espacements, couleurs dérivées) n'a pas de sortie CSS.
- `src/ts/webdev-ui.ts` importe chaque fichier de `src/ts/components/` (un par composant qui a besoin de JS).
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
- `npm run build` / `npm run watch` lancent `gulp build` / `gulp watch` ; `symfony serve` lance le watch (worker de `doc/.symfony.local.yaml`). **`gulpfile.js` est voulu : le garder, ne pas proposer de le supprimer.**
- TS compilé par esbuild (déjà dans le gulpfile) de `src/ts/webdev-ui.ts` vers `dist/js/` ; `npm run typecheck` (`tsc`, `noEmit`) vérifie les types.
- Node n'existe que dans le conteneur Docker du dépôt : `docker exec -w /app webdev-ui npm run …`. `dist/` est versionné : il va dans le commit avec `src/`.
- Skills du projet (`.claude/skills/`) : `/nouveau-composant <nom>` pour commencer un composant, `/verifier` avant un commit (typecheck, build, W3C sur toutes les pages, règles de ce fichier ; Lighthouse et contrastes restent à la main).

## Documentation

- Site Symfony dans `doc/` : un contrôleur par section (`MainController` : `/` et `/test` ; `CustomController`, `ComponentController`, `LayoutController`, `UtilityController`, `TemplateController`), une méthode et un template par page (`templates/<section>/<nom>.html.twig`), **une page par fichier SCSS**. Ses règles (plan d'une page, exemples, blocs de code) et le fonctionnement du site : `.claude/rules/doc.md`.
- **Chaque composant a sa page, et n'est terminé que quand elle existe** : HTML minimal, variables et comment les changer (défaut, taille, un élément), variantes, tailles, accessibilité, **exemples, contre-exemples et limites**. Les contre-exemples sont en code, jamais affichés (Lighthouse doit rester à 100).

## Façon de travailler

- **Style de code** : direct et lisible, plus long et détaillé plutôt qu'abstrait, indentation 4 espaces, commentaires `//`, zéro devant (`0.2s`), `text-wrap: nowrap` (pas `white-space`) posé sur l'élément du texte (sur un parent, le `text-wrap: pretty` des `<li>` et des `<p>` du reset l'annule), une boucle `@each` par composant, classes qui partagent des styles regroupées dans un même sélecteur. Avancer pas à pas, comprendre puis refactorer : changements petits, proches du code existant, pas de gros refactoring d'un coup.
- **Lisible par un junior** : simple et court, la même chose écrite de la même façon partout ; un peu plus de code plutôt qu'une optimisation (une déclaration qui double le natif reste si elle dit l'intention) ; chaque réglage reste une variable CSS, pour qu'un site fasse ressembler le framework à lui.
- **Commentaires concis** : une ligne, le pourquoi. Les explications vont dans la doc.
- **Bonnes pratiques à la lettre, pas de bidouillage** : une solution reconnue ; s'il n'y en a pas, on en discute pour comprendre avant de choisir.
- Signaler un choix discutable plutôt que de l'appliquer sans prévenir. Donner le code d'abord, expliquer si demandé. Ne jamais ajouter de dépendance.
- **Tenir ce fichier et `.claude/rules/` à jour à chaque décision** : la règle et son pourquoi, en une ou deux lignes, là où elle sert (commune ici, d'un composant dans `components.md`, du site de doc dans `doc.md`). Ce fichier reste sous 200 lignes (conseil de Claude Code : plus long, il est moins bien suivi). Les mesures, les essais et l'historique vont dans le message de commit.

## Ordre de travail

- Faits : `accordion`, `alert`, `badge`, `button`, `btn-close`, `card`, `dialog`, `drawer`, `dropdown`, `fieldset`, `link`, `list`, `navbar`, `pagination`, `spinner`, `tab`, `table`, `toast`.
- En refonte : `form` ; plus tard : `.section` (`--section-padding-block` fluide), `visually-hidden-focusable`.
- Remplacés : `collapse` (= `accordion`), `outline` (= `border border-*`).

## Décisions en attente

- **Couleurs à revoir** quand tous les composants seront faits (quelque chose gêne encore, à préciser ; une nouvelle palette est commencée). Chaque composant a un jeu de tokens différent, `.theme-*` est écrite dans une dizaine de fichiers. Pistes d'un essai annulé : mélanger `in oklab` (pas `in oklch`, la teinte dérive), noir ou blanc par luminance WCAG.
- **Layers** : pas de déclaration `@layer a, b, c;` d'ordre, et les `:root` de `settings/` sont hors layer.
- **esbuild** contre la règle « seuls `sass` et `typescript` ».
- **Écriture de droite à gauche** : pas de règle `:dir(rtl)` tant que personne ne le demande (`slide-in-start` / `-end`, `translate-middle`, `drawer-*` glissent du mauvais côté ; limite dite dans la doc).
- **Grille sur petit écran** : 12 colonnes = 11 espaces, largeur minimum ; en essai : `--grid-gap` à 1rem et `gap-*` pour les cas serrés.
- **Focus sur un fond plein** : en sombre, le contour emphasis d'un bouton `-solid` d'un autre thème, ou d'une croix `btn-close-solid` du même thème, posé sur un fond plein (`toast-solid`, `dialog-solid`, `alert-solid`) est sous 3:1 : à revoir avec les couleurs.
- **Voile transparent ou fond opaque** (liste, et les autres composants à voile) : à trancher ; essai d'une liste opaque (survol `-subtle`, clic et en cours mélangés à la couleur, comme `pagination-subtle`) annulé.
- **À trancher aussi** : `.btn` ou `.button` (le code utilise `.btn`) ; `btn-close` à 24px (20px demandé, sous la cible tactile minimale) ; retrait de `btn-text` ; navigateurs supportés (`:has()`, `popover`, `command`, positionnement par ancre déjà utilisé) ; nom du projet (les fichiers `webdev-ui.*` le suivront).
