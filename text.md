# Inventaire webdev-ui : fait / à faire

État au 2026-10-24 (dernier commit `be3caa2`). Point de départ : les fichiers de l'archive (`webdev-ui_archive/src`), triés un par un.

Légende : `[x]` fait dans la v2 · `[ ]` à faire · ~~barré~~ écarté (avec la raison)

## Fondations

- [x] Réglages (`settings/`) : couleurs oklch clair / sombre, espacements `--space-0` à `-12`, typographie, variables globales (rayon, états, focus, désactivé, transition)
- [x] Breakpoints `xs` 360, `sm` 576, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536px (en rem)
- [x] Couleurs dérivées : `contrast`, `state`, `subtle`, `emphasis` (mixins)
- [x] Thème clair / sombre (`color-scheme`, `light-dark()`, `data-theme`)
- [x] Système de thème `.theme-*` (boutons, liens)
- [x] Reset (`_reset.scss`)
- [x] Layers (`@layer reset, base, layout, components, utilities`)

## Base (éléments natifs)

- [x] `body` : fond, police, taille, interligne
- [x] Titres `h1` à `h6`
- [x] `code`, `kbd`, `samp`, `pre` en monospace
- [x] Liens `a` : couleur du thème, survol / clic par le soulignement, focus
- [ ] `hr`
- [ ] `accent-color` (cases à cocher, radios, range)
- [ ] `:focus-visible` commun (champs, `summary`…)
- [ ] `button`, `legend`, `select` (étaient dans le base de l'archive : à trier avec les formulaires)

## Mise en page (`layout/`)

- [x] Container : `.container`, `.container-xs` à `.container-2xl`
- [x] Grille : `.grid`, `.col-1` à `.col-12`, responsive (remplace `.row` / `.col` de l'archive)
- [ ] `.section` (espace vertical fluide entre les sections, `--section-padding-block`)
- ~~`.container-fluid`~~ : un `<div class="px-4">` suffit
- ~~`.col`, `.col-auto`, `offset-*`, `row-cols-*`~~ : pour l'instant

## Composants

- [x] Bouton : `btn-solid`, `btn-outline`, `btn-subtle`, `btn-text`, `btn-link` ; tailles `xs` `sm` `md` `lg` ; `disabled` ; sur un `<a>`
- [x] Lien : `.theme-*` sur `<a>` (refait, remplace `.link-*`)
- [ ] Groupe de boutons (`btn-group` de l'archive)
- [ ] Bouton de fermeture (`close-indicator` de l'archive)
- [ ] Accordéon (`<details>`, remplace aussi `collapse`)
- [ ] Alerte
- [ ] Badge
- [ ] Carte
- [ ] Dialog (`<dialog>`)
- [ ] Drawer
- [ ] Dropdown (`popover` ?)
- [ ] Formulaire : champs, tailles, validation, `disabled`
- [ ] Liste (`list-unstyled`, `list-inline`, `list-divider`…)
- [ ] Navbar (container queries)
- [ ] Onglets (tab, seul JS prévu)
- [ ] Tableau (rayé, bordé, responsive)
- ~~`collapse`~~ : fusionné dans l'accordéon
- ~~`outline`~~ : rôle à préciser

## Utilitaires

- [x] Espacements : `m-*`, `p-*` (côtés logiques), responsive
- [x] Gap : `gap-*`, `row-gap-*`, `column-gap-*`, responsive
- [x] Display : `d-none`, `d-inline`, `d-inline-block`, `d-block`, `d-flex`, `d-inline-flex`, `d-grid`, responsive
- [x] Flex : direction, wrap, `justify-content-*`, `align-items-*`, `align-self-*`, grow, shrink, responsive
- [x] Largeur et hauteur : `w-25` à `w-100` (tiers compris), `w-auto`, `w-fit-content`, `min-w-0`, `h-100`, `min-h-100svh`, responsive
- [x] Couleurs : `bg-*`, `bg-*-subtle`, `color-*`, `color-*-emphasis`, `color-inherit`
- [x] Police : `fs-*`, `fw-*`, `fst-italic` / `-normal`, `font-monospace`
- [ ] Texte : alignement `text-align-*` (responsive), majuscules, soulignement, `nowrap`, coupure, troncature (`text.scss` de l'archive)
- [ ] Interligne `lh-*`, espacement des lettres (`ls-*` de l'archive) : à trier
- [ ] Visibilité : `.visually-hidden`, `.visually-hidden-focusable`, `opacity-*`
- [x] Bordures : `border`, `border-top` / `-bottom` / `-start` / `-end`, `border-0`, `border-color-*`, `border-radius-0` / `-xs` à `-xl` / `-pill` / `-circle`
- [ ] Ombres (`shadow`)
- [ ] Débordement (`overflow-*`)
- [ ] Position (`relative`, `absolute`, `sticky`, `inset-*`, `z-*`)
- [ ] `bg-transparent` (archive) : à trier
- ~~`flex-direction-*-reverse`, `order-*`~~ : l'ordre affiché ne suit plus le DOM (WCAG 1.3.2)
- ~~`align-content-*`, `flex-fill`~~ : rarement utiles
- ~~`h-25` à `h-75`, `vw-100`, largeurs fixes en rem~~ : rarement utiles
- ~~Arrondis par coin, `dashed` / `dotted`, épaisseurs `border-1` à `-5`~~ : rarement utiles (surcharger `--border-width`)
- ~~Animations et keyframes~~, ~~curseur~~, ~~images~~ (`img-fluid` est déjà dans le reset) : écartés pour l'instant

## JavaScript

Archive : alert, collapse, dialog, drawer, dropdown, dropdown-float, form-validate, tab (+ 9 utilitaires).

- [ ] Build TypeScript (`tsc`), à ajouter avec le premier composant qui a du JS
- [ ] `tab.ts` : le seul JS prévu
- [ ] Dialog, drawer, dropdown : sans JS si possible (`<dialog>` + `command`, `popover`), selon les navigateurs supportés

## Documentation et qualité

- [x] Page de test (`doc/templates/main/index.html.twig`) : typo, liens, espacements, container, grille, couleurs, flex, display, gap, largeur et hauteur
- [x] Bascule de thème de la doc (`#theme-toggle`)
- [ ] Template de doc fourni par Laurent
- [ ] Une page de doc par composant (exemple, variables, variantes, tailles, accessibilité, contre-exemples, limites)
- [ ] Lighthouse 100 dans les 4 catégories et W3C 0 erreur / 0 warning, sur chaque page

## Décisions en attente

- [ ] Nom du projet
- [ ] Navigateurs supportés (`:has()`, `popover`, `command`, anchor positioning)
- [ ] Nommage des composants : `.btn` (Bootstrap) ou `.button`
- [ ] Tokens de couleur : nos `-subtle`, `-emphasis`, `on-` ou ceux de Bootstrap 6
- [ ] Lien désactivé (sans `href`)
- [ ] Container queries pour navbar et carte
