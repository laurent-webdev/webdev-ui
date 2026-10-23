# Nouveau framework CSS/JS (nom à définir)

Nouveau projet, repart de zéro en s'inspirant de webdev-ui. webdev-ui reste un projet séparé : on ne touche pas à son code, et aucune compatibilité avec lui n'est recherchée.

## Objectif

Un framework **ultra léger, simple, personnalisable, facile à utiliser**. En cas de doute : faire plus simple, ou ne pas faire.

## Référence : Bootstrap 6

**On s'inspire de Bootstrap 6 (v6.0.0-alpha.1), sans le copier** (précisé par Laurent, 2026-10-23) : ses classes et ses composants basés sur le HTML natif sont un bon modèle. En cas de question (noms de classes, variantes, valeurs), regarder comment Bootstrap 6 fait, puis garder ce qui est le plus simple. On s'en écarte librement quand c'est plus simple ou plus juste.

**Exception : les noms des variables CSS sont ceux de Laurent, pas ceux de Bootstrap** (précisé par Laurent, 2026-10-22). Ils doivent se comprendre sans doc : nom complet de la propriété CSS qu'ils règlent, pas de jargon (`--focus-outline-width` qui règle `outline-width`, pas `--focus-ring-width`). Bootstrap sert pour les valeurs, pas pour les noms de variables.

Ce que fait Bootstrap 6 (relevé dans `dist/css/bootstrap.css`, octobre 2026) :

- **Layers** : `@layer colors, config, root, reboot, layout, content, forms, components, custom, helpers, utilities;`. Couleurs avec `light-dark()`, `color-scheme: light dark`, thème forcé par `[data-bs-theme]`. Media queries en syntaxe d'intervalle (`@media (width >= 768px)`), container queries.
- **Variables** : préfixe `--bs-` (nous : aucun préfixe). Locales `--bs-<composant>-<propriété>` (`--bs-btn-padding-y`).
- **Couleurs** : palettes oklch (`--bs-blue-500: oklch(60% 0.24 240deg)`), paliers 025 à 975 obtenus par `color-mix` avec blanc (025-400) ou noir (600-975). Familles sémantiques : primary, accent, success, danger, warning, info, inverse, secondary. Chacune a `-base`, `-fg`, `-fg-emphasis`, `-bg`, `-bg-subtle`, `-bg-muted`, `-border`, `-focus-ring`, `-contrast`. Surfaces `--bs-bg-body`, `--bs-bg-1` à `-4` ; textes `--bs-fg-body`, `--bs-fg-1` à `-4`.
- **Système de thème** : une classe `.theme-<couleur>` pose des tokens génériques (`--bs-theme-bg`, `-fg`, `-fg-emphasis`, `-contrast`, `-bg-subtle`, `-bg-muted`, `-border`, `-focus-ring`) ; les composants ne lisent que ces tokens. Ex. : `<button class="btn btn-subtle theme-success">`.
- **Bouton** : `.btn` + variante `.btn-solid` / `.btn-outline` / `.btn-subtle` / `.btn-text` (+ `.btn-link`, `.btn-icon`), tailles `.btn-sm` / `.btn-lg`. Survol : `oklch(from <couleur> calc(l * .95) calc(c * 1.1) h)`, clic : `calc(l * .9) calc(c * 1.15)`.
- **Espacements** : `--bs-spacer-0` à `-12`, fixes : 0, 0.25, 0.375, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3rem. Utilitaires `m-*`, `p-*` (côtés `t b s e x y`), `gap-*`, `row-gap-*`, `column-gap-*`, `space-x-*`, `space-y-*`.
- **Rayons** : `--bs-radius-0` à `-9` (0 à 1rem) + `--bs-radius-pill`. Bordure `--bs-border-width: 1px`.
- **Typo** : `--bs-font-size-xs` à `-6xl`, fluides (`clamp()`) à partir de `lg` ; graisses `light` 300 à `bold` 700 ; titres h1 = 3xl … h6 = sm.
- **Breakpoints** : sm 576, md 768, lg 1024, xl 1280, 2xl 1536 px. Classes responsive préfixées : `md:d-flex` (comme nous).
- **Utilitaires** : noms abrégés gardés (`d-flex`, `text-center`, `fw-bold`, `fs-lg`, `w-100`) ; couleurs de texte `fg-*`.
- **Accessibilité** : `--bs-focus-ring-width: 3px`, `--bs-focus-ring-offset: 1px`, `button:focus:not(:focus-visible) { outline: 0; }`.
- **Non vérifié** (docs illisibles par l'outil) : liste complète des composants, JS (`<dialog>`, `popover`, anchor positioning), règles exactes de `.theme-*`.

## Règles absolues

- **0 dépendance à l'exécution.** Le CSS et le JS livrés ne dépendent d'aucune librairie. Seuls outils de build autorisés : `sass` et `typescript`.
- **Personnalisation = variables CSS uniquement.** Aucune valeur de configuration en JS ou en SCSS. Changer une valeur ne doit jamais demander de rebuild.
    - **Règle indiscutable (Laurent)** : toutes les valeurs sont des variables CSS. Pas de map Sass. Rester simple, comme `webdev-ui_archive/src/scss/abstracts/variables.scss`.
    - Les couleurs dérivées (`--color-text-on-*`, `-state-on-*`, `-subtle-*`, `-emphasis-*`) sont écrites par des mixins de `tools/_mixins.scss` (`text-on-colors`, `state-on-colors`, `subtle-colors`, `emphasis-colors`, demande de Laurent), appelés dans le `:root` de `_colors.scss` avec la liste `$colors`. Le CSS produit est le même qu'écrit à la main : une nouvelle couleur s'ajoute dans `--color-*` et dans `$colors`.
    - Seule exception : les breakpoints (`var()` ne fonctionne pas dans `@media`), définis en variables SCSS.
- **Couleurs en oklch** (choix de Laurent, 2026-10-21, après des essais en hexa + Sass puis en HSL) : dérivées calculées dans le navigateur depuis les `--color-*` (`oklch(from)`, `color(from)`), donc un site change une couleur sans rebuild. **Pas de couleurs de repli** (décision de Laurent, 2026-10-21) : `light-dark()` (Baseline mai 2024) et `color(from)` (Baseline sept. 2024) seront « largement disponibles » (30 mois) vers novembre 2026 et mars 2027, avant la sortie du framework.
- **CSS d'abord, JS en dernier recours.** Avant d'écrire du JS, vérifier si c'est faisable en HTML/CSS natif (`<details>`, `<dialog>`, `popover`, `:has()`, `:checked`, `:focus-within`…).
- **HTML minimal.** Le moins de classes et de balises d'enveloppe possible.
- **Le plus natif possible.** Utiliser l'élément HTML qui fait déjà le travail (`<button>`, `<dialog>`, `<details>`, `<nav>`…) plutôt que de le recréer.
- **Accessibilité** : tous les attributs `aria-*` indispensables sont présents dans chaque exemple. Pas d'`aria-*` redondant avec le natif (ex. pas de `role="button"` sur un `<button>`). Navigation clavier et focus visible obligatoires.
- **Validation W3C : 0 erreur, 0 warning** sur le HTML (documentation et exemples compris).
- **Rien d'inutile.** Ne pas reprendre de webdev-ui les fonctionnalités complexes ou rarement utiles.
- **Seulement ce qui sert au quotidien.** Pas de classe « au cas où » (ex. pas de `border-top-left-radius-*`). Un besoin rare se règle en CSS dans le site ou en surchargeant une variable. Une classe est ajoutée le jour où elle devient vraiment utile.
- **Facile à étendre.** Les mixins et boucles SCSS permettent d'ajouter une valeur ou une classe en une ligne, sans toucher au reste.
- **Point de départ : les classes de webdev-ui**, triées une par une (garder, simplifier ou supprimer).
- **Variantes responsive (`md:`…) seulement pour la mise en page** : display, flex, grid, espacements, largeur, alignement du texte. Pas pour les couleurs, l'opacité, les bordures, les ombres, etc.

## Exigence qualité

- **Le framework ne doit jamais faire perdre de points.** Lighthouse (performance, accessibilité, bonnes pratiques, SEO) et validateur W3C : si une note baisse, la cause doit venir du site, jamais du framework.
- **Chaque composant a sa page de démo**, qui doit obtenir 100 dans les 4 catégories Lighthouse et 0 erreur / 0 warning au validateur W3C HTML.
- **MDN comme référence** : vérifier sur MDN la compatibilité (statut Baseline) et le bon usage de chaque balise, attribut ou propriété avant de l'utiliser.
- **Composants robustes** : ils fonctionnent au clavier, avec un contenu long, en zoom 200 %, avec `prefers-reduced-motion`, et sans JS quand c'est possible.

## Nommage des classes

Inspiré de Bootstrap et Tailwind. Pas de préfixe sur les classes.

**Lisible avant tout.** Le nom complet de la propriété CSS est utilisé, sauf abréviations listées ci-dessous. Mieux vaut trop verbeux que pas assez.

| Cas | Format | Exemple |
|---|---|---|
| Utilitaire | `propriete-valeur` | `justify-content-center`, `text-align-center` |
| Composant | `composant` | `button`, `card` |
| Élément d'un composant | `composant-element` | `card-title`, `card-body` |
| Variante | `composant-variante` | `button-primary`, `button-outline` |
| Taille | `composant-taille` | `button-sm`, `button-lg` |
| Breakpoint | `breakpoint:classe` | `md:d-flex`, `lg:button-lg` |
| État | attribut natif ou ARIA | `disabled`, `aria-expanded`, `open` (pas de classe `is-*`) |

- **Tailles et breakpoints** : `xs`, `sm`, `md`, `lg`, `xl`. Une taille est un suffixe (`.btn-sm`, `.btn-lg`), un breakpoint est un préfixe (`md:d-flex`) : jamais `sm:` pour dire « petit » (décision de Laurent, 2026-10-22).
- **Abréviations autorisées** : uniquement les très connues — `d` (display), `m` / `p` (margin / padding) et leurs côtés `mt`, `mx`…, `w` / `h` (width / height), `fs` / `fw` / `fst` (font-size / font-weight / font-style, comme Bootstrap 6). Toute nouvelle abréviation doit être ajoutée ici.
- Tout en minuscules, mots séparés par `-`.
- En SCSS, le `:` des breakpoints s'échappe : `.md\:d-flex`. Les classes responsive sont générées par un mixin, jamais écrites à la main.

## Variables CSS

- **Aucun préfixe** sur les variables ni sur les classes.
- **Nommage cohérent partout** (validé par Laurent, 2026-10-22 : simple, basique, modifiable ensuite) :
    - échelle globale = `--<propriété>-<valeur>` : `--font-size-lg`, `--font-weight-bold`, `--space-3` ;
    - réglage d'un élément ou composant = `--<élément>-<propriété>` : `--heading-font-weight`, `--btn-padding-block`, `--focus-outline-width`.
- **Globales** (dans `:root`) : `--color-primary`, `--space-2`, `--radius`, `--font`…
    - couleurs dans `settings/_colors.scss` ; espacements dans `settings/_spacing.scss` ; le reste (`--radius`…) dans `settings/_variables.scss`.
    - **Espacements** : `--space-0` à `--space-12`, l'échelle de Bootstrap 6 (même numéro, même valeur : 0, 0.25, 0.375, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3rem). Toutes les valeurs sont des multiples de `--space` (0.25rem) : le changer redimensionne toute l'échelle. Sert aux utilitaires (margin, padding, gap). `auto` est géré par les utilitaires.
    - **Espace entre les sections** : pas dans cette échelle. Une variable fluide unique (`--section-padding-block: clamp(…)`) sur une classe `.section` de `layout/`, à créer avec le `container`.
    - **Padding des composants : vraies valeurs** (`--btn-padding-block: 0.375rem`), pas `--space-*` (choix de Laurent, 2026-10-22) : changer l'échelle des espacements ne doit pas redimensionner les composants.
    - **Variables simples, accessibles aux débutants** (Laurent, 2026-10-23) : une variable n'existe que si un site voudra la changer. Une formule ou une valeur réglée pour le contraste va en dur dans le mixin, pas dans `:root`. Fichiers propres, sans bruit ni variable pseudo-utile.
    - **Peu de variables par composant** (Laurent, 2026-10-23) : un composant n'a de variable `--<composant>-*` que pour ce qu'on règle souvent (padding, rayon, bordure ; le rayon pointe vers `--radius`). Le reste (transition, focus, survol et clic) lit la globale directement ; on le personnalise en surchargeant la globale sur la classe (`.btn-solid { --state-mix-soft: 15%; }`).
- **Toutes les couleurs ont une valeur claire et une sombre** (`light-dark()`), en oklch, dans `settings/_colors.scss`. Couleurs de marque et d'état : en sombre, même teinte, chroma réduite (~15-20 %), et luminosité ramenée dans une même bande (l 0.68 à 0.84) pour l'équilibre : les couleurs moyennes (primary, accent) sont éclaircies, les claires (success, warning) un peu assombries. Le mode clair est validé par Laurent : les réglages d'équilibre se font sur le sombre. `neutral` : gris clair en clair, gris foncé en sombre. `inverse` : presque noir en clair, presque blanc en sombre. `primary`, `success`, `warning` : couleurs de Laurent (`#118ab2`, `#06d6a0`, `#ffd166`) converties en oklch. `secondary` (essai en cours) : rose tiré de `#ef476f`, arrangé pour la marque : teinte 355 (bleu 228 → violet 290 → rose 355, ~60° d'écart ; plus rose que `#ef476f` (11) pour s'éloigner de danger, 25), chroma ramenée à 0.15 (comme primary et accent, `#ef476f` est à 0.20). `accent` : violet (teinte 290), pour aller avec primary et secondary ; en clair, la couleur de son ancien survol (`0.60 0.13` + 20 % de blanc = `0.68 0.104`), choix de Laurent. Les gris et le fond sombre sont légèrement teintés (teinte 228, celle de primary).
- Chaque couleur `--color-<nom>` a ses dérivées, dans chaque thème, à créer aussi pour toute nouvelle couleur :
    - `--color-text-on-<nom>` : noir ou blanc, le plus contrasté (luminance WCAG comparée à 0.179, ≥ 4,58:1), formule dans `color(from … srgb-linear …)`, écrite une fois dans une variable Sass locale du mixin (`$channel`) : c'est une formule, pas un réglage ;
    - `--color-state-on-<nom>` : mélangée au fond au survol et au clic. L'inverse du texte (`color(from … srgb calc(1 - r) …)`) : le fond s'éloigne du texte, le contraste ne baisse jamais ;
    - `--color-subtle-<nom>` : fond léger, `oklch(from …)` : luminosité `l * 0.12 + 0.85` en clair / `+ 0.22` en sombre, chroma `c * 0.3`, en dur dans le mixin (réglées avec l'emphasis pour le contraste ≥ 4,5:1 : pas un réglage libre). Garder 12 % de la luminosité donne des subtle différents à `neutral` et `inverse` ;
    - `--color-emphasis-<nom>` : texte coloré sur le fond de page et le subtle (`.btn-outline`, `.btn-subtle`, `.btn-text`), `oklch(from …)` : même teinte et chroma, luminosité 0.45 en clair, 0.80 en sombre (≥ 4,5:1 sur les deux fonds). Équivalent de `--bs-primary-text-emphasis` de Bootstrap.
    - Nommage : le nom de la couleur en dernier, comme `--color-text-on-<nom>`.
- **Système de thème (comme Bootstrap 6)** : la couleur et la variante sont séparées.
    - **Chaque composant a ses propres tokens de thème** `--<composant>-theme-*` (choix de Laurent, pour s'y retrouver quand subtle, outline… arriveront) : sa boucle `@each` génère les `.theme-<couleur>` qui les posent, défaut neutral dans son `:root`. Un 2ᵉ composant (badge…) aura sa boucle et ses `--badge-theme-*` : `.theme-primary` est alors définie dans plusieurs fichiers, c'est voulu. Pas de `utilities/_theme.scss` pour l'instant ; refactoring possible plus tard.
    - **Noms explicites, qui disent à quoi sert la variable** (choix de Laurent) : `--btn-theme-background-solid` (fond), `--btn-theme-text-solid` (texte), `--btn-theme-state-solid` (mélangée au fond au survol et au clic), `--btn-theme-background-subtle` (fond du subtle), `--btn-theme-text-emphasis` (texte de l'outline, du subtle et du text). Écart avec Bootstrap 6 (`--bs-theme-contrast`).
    - Les tokens sont hérités : un `.theme-*` sur un parent colore tous ses enfants.
    - Les composants lisent leurs `--<composant>-theme-*`, jamais `--color-<nom>` directement dans les propriétés : une nouvelle couleur s'ajoute dans la liste `@each` du composant.
    - Les variantes (`.btn-solid`, `.btn-subtle`…) disent **comment** utiliser le thème.
- **Composant** : ses réglages (forme, tailles) sont des variables `--<composant>-*` dans un `:root` en tête de son fichier ; sa couleur vient de ses `--<composant>-theme-*`. Pas de classe de base : chaque variante (`.btn-solid`, `.btn-subtle`…) s'utilise seule.

Modèle de référence : `src/scss/components/_button.scss` (pas de copie du code ici : elle devient fausse dès que le code change, et l'IDE la signale en erreur au commit).

```html
<button class="btn-subtle theme-danger" type="button">Supprimer</button>
```

- **Survol et clic** : `color-mix(in srgb, <fond>, var(--btn-theme-state-solid) var(--state-mix-soft))`, `--state-mix-soft` 20 % / `--state-mix-strong` 30 % dans `settings/_variables.scss`. Pas de `@supports` ni de repli (retirés le 2026-10-23, accord de Laurent) : `light-dark()` et `oklch(from)`, dont dépendent toutes les couleurs, sont arrivés après `color-mix()` dans tous les navigateurs, le repli ne servait jamais. Noms sans `hover` / `active` (choix de Laurent, 2026-10-22) : un état léger et un fort, utilisables pour n'importe quel état.
    - solid : mélange avec l'opposé du texte (avec `CanvasText`, primary tombait vers 3,5:1 au clic) ;
    - **Les variantes lisent les globales directement** (2026-10-23, remplace les `--btn-<variante>-hover-mix` / `-active-mix`) : solid et subtle prennent `--state-mix-soft` au survol, `--state-mix-strong` au clic ; outline et text prennent au survol le fond du solid / du subtle, sans mélange, et `--state-mix-soft` au clic ;
    - subtle : mélangé avec la couleur du thème (`--btn-theme-background-solid`), le fond se renforce au lieu de foncer ou d'éclaircir (choix de Laurent, 2026-10-22 ; comme le `-bg-muted` de Bootstrap 6). Utilisé directement dans le `color-mix()` : une variable du `:root` pointant vers `--btn-theme-*` serait figée sur neutral. Contraste du texte emphasis (≥ 4,5:1) à vérifier en sombre ;
    - outline : devient solid au survol et au clic. Bordure `transparent` dans ces états : le fond passe dessous (`background-clip: border-box` par défaut), elle a toujours la couleur du fond, sans répéter le `color-mix()` ;
    - text : devient subtle au survol et au clic ;
    - link (2026-10-23, inspiré de Bootstrap 6, aucune variable en plus) : souligné, sans fond, même taille que les autres variantes. Couleur `--btn-theme-text-emphasis`, mélangée à `CanvasText` au survol (`calc(var(--state-mix-soft) * 2)`, 40 %) et au clic (`calc(var(--state-mix-strong) * 2)`, 60 %) ; doublé parce qu'un texte fin demande deux fois plus de mélange qu'un fond pour que ça se voie (à 20 %, l'écart de luminosité n'était que de 0.04 en sombre) ; `calc()` dans un pourcentage de `color-mix()` vérifié sur MDN. Elle se rapproche du texte, le contraste augmente dans les deux thèmes (Bootstrap ajoute 10 % de noir, même en sombre). Écart avec Bootstrap : par défaut neutral comme les autres variantes, pas la couleur des liens (primary) ; `theme-primary` pour un lien bleu.
    - États écrits avec le nesting Sass (`&:hover`, `&:active`) dans la variante.
    - Transition des couleurs (fond, bordure, texte) : la globale `--transition-duration` (0.15s, comme Bootstrap), lue directement. Coupée par le bloc `prefers-reduced-motion` du reset.
- **Focus des boutons** (demande de Laurent, 2026-10-22) : `:focus-visible` dans la forme commune, `outline` simple de la couleur du thème en emphasis (`--btn-theme-text-emphasis`, pas la couleur pleine : neutral, success et warning sont trop clairs sur fond blanc, < 3:1 ; corrigé le 2026-10-23). Lit directement les globales `--focus-outline-width` 2px / `--focus-outline-offset` 1px (`_variables.scss`). Halo façon archive essayé puis écarté (2026-10-22) : trop orienté design, le framework reste sobre.
- **Bouton sur un lien** (2026-10-23) : `<a class="btn-*" href>` pour aller vers une page, `<button>` pour une action. La forme commune pose `display: inline-block`, `text-align: center`, `text-decoration: none` (sans effet sur `<button>`, déjà comme ça nativement ; `.btn-link`, écrit après, remet le soulignement). Pas dans le reset : un lien dans un texte doit rester inline (il se coupe en fin de ligne) et souligné (sinon Lighthouse signale « Links rely on color to be distinguishable »). Lien désactivé (retirer `href`) : plus tard, quand ce sera utile.
- **Bouton désactivé** (2026-10-23) : attribut natif `disabled` (un `<fieldset disabled>` désactive aussi ses boutons), dans la forme commune : `opacity: var(--disabled-opacity)` (0.5, réglé par Laurent le 2026-10-23 ; globale dans `_variables.scss`, servira aussi aux champs) et `pointer-events: none` (plus de survol ni de clic), comme Bootstrap. Pas de `cursor: not-allowed` (décision de Laurent, 2026-10-23) : la flèche normale est le comportement natif, et `pointer-events: none` empêche tout curseur. WCAG n'exige pas de contraste pour un élément désactivé.
- **Tailles des boutons** (2026-10-22) : `.btn-xs` / `.btn-sm` / `.btn-lg`, combinables avec toutes les variantes (`class="btn-outline btn-lg"`). Comme Bootstrap, elles changent `--btn-padding-block` / `-inline` du bouton et posent `font-size` : pas de variables de taille dans le `:root`, et l'ordre dans le fichier ne compte pas. Padding (block / inline) et taille de texte : xs 0.125 / 0.5rem / `--font-size-xs`, sm 0.25 / 0.75rem / `--font-size-sm`, normal 0.375 / 1rem, lg 0.5 / 1.25rem / `--font-size-lg` (réglés par Laurent). Hauteurs (interligne 1.5 + bordures) : 24, 31, 38, 45px, un pas régulier de 7px (lg fixe depuis que `--font-size-lg` ne grandit plus) ; xs = 24px, la cible tactile minimale (WCAG 2.5.8) : ne pas descendre en dessous. Pas de taille responsive (`md:btn-lg`) : réservé à la mise en page.
- L'utilisateur personnalise en surchargeant une variable (globale ou `--theme-*`), globalement ou sur un seul élément.
- **Typographie** (2026-10-22), valeurs de Bootstrap 6, noms de Laurent :
    - `settings/_typography.scss` : `--font-family` (polices du système), `--font-family-monospace`, `--font-size-xs` à `-6xl` (règles de Laurent, 2026-10-23, deux zones alignées sur l'interligne : texte xs à lg fixe, 2px d'écart, 12/14/16/18px ; titres xl à 6xl fluides de 400 à 1200px d'écran, grand écran 24/32/40/48/64/80px (double tous les 3 crans), mobile 20/24/28/32/40/48px (écart avec md divisé par 2) ; écarts max/min ≤ 1,7, le zoom 200 % fonctionne), `--font-weight-light` 300 à `-bold` 700 (pas de `lighter` / `bolder` : rarement utiles), `--line-height-xs` à `-6xl` (règle de Laurent, 2026-10-23 : 1.5 pour le texte de lecture xs à lg, puis −0.1 par taille, 1.2 minimum ; 1.2 parce qu'en dessous de ~1.15 une majuscule accentuée touche le « g » de la ligne du dessus), `--heading-font-weight` (medium). **L'interligne suit la taille, pas la balise** (validé par Laurent, 2026-10-22) : un `<h5>` et un `<p>` de même taille ont le même interligne ; `.fs-*` règle aussi l'interligne ;
    - `base/_typography.scss` : body (famille, taille md, graisse normale, interlignage md), titres h1 = 3xl … h6 = sm avec l'interligne de leur taille, `code, kbd, samp, pre` en monospace à 1em. `font-family` suivie d'une famille générique (`var(--font-family), sans-serif`, `var(--font-family-monospace), monospace`), exigée par l'inspection « Insert generic font name » de l'IDE ;
    - `utilities/_font.scss` : `.fs-*`, `.fw-*`, `.fst-italic` / `-normal`, `.font-monospace`, générés par `@each`. Pas de variante responsive (comme Bootstrap 6), pas de `.lh-*` pour l'instant ;
    - testé dans `doc/templates/main/index.html.twig`.

## Thèmes clair et sombre

- **Par défaut** : le thème suit le réglage du système de l'utilisateur.
- **Forcer un thème** : attribut `data-theme="light"` ou `data-theme="dark"` sur `<html>`.
- **Natif** : `color-scheme` + fonction `light-dark()`. Chaque couleur est déclarée une seule fois, avec ses deux valeurs. Les éléments natifs (champs de formulaire, barres de défilement) s'adaptent tout seuls.

```css
:root { color-scheme: light dark; }
:root[data-theme="light"] { color-scheme: light; }
:root[data-theme="dark"] { color-scheme: dark; }

:root {
  --color-background: light-dark(#ffffff, oklch(0.17 0.008 228));
}
```

- Les composants n'utilisent que ces variables : ils n'ont **jamais** de règle spécifique au thème sombre.
- Le framework ne fournit pas de JS pour changer de thème. Le bouton de bascule et la mémorisation du choix sont gérés par le site. Exemple dans la doc : bouton `#theme-toggle` dans `base.html.twig`, script inline dans `<head>` (thème mémorisé posé avant le CSS, sans flash) et bascule dans `doc/assets/app.js` (`localStorage`, `aria-pressed`).
- Contrastes vérifiés dans les deux thèmes (accessibilité Lighthouse à 100 dans les deux).

## Organisation des fichiers

Architecture ITCSS (ordre de spécificité croissante), modules Sass (`@use` / `@forward`, jamais `@import`).

```
src/scss/
├── app.scss              un @use par dossier, rien d'autre
├── settings/
│   ├── _index.scss
│   ├── _layers.scss      ordre des @layer (premier CSS produit)
│   ├── _breakpoints.scss variables SCSS (seule config SCSS), pas de sortie CSS
│   ├── _colors.scss      couleurs oklch dans :root, avec light-dark(), et color-scheme
│   ├── _spacing.scss     échelle d'espacements --space-1 à --space-12
│   └── _variables.scss   autres variables CSS globales dans :root (rayons…)
├── tools/
│   ├── _index.scss       @forward des outils
│   └── _mixins.scss      mixin responsive, boucles des utilitaires, pas de sortie CSS
├── _reset.scss           remise à zéro, aucun style visuel (un seul fichier : pas de dossier)
├── base/                 styles des éléments natifs (texte, liens, focus-visible…)
├── layout/               container, columns
├── components/           un fichier par composant
└── utilities/            un fichier par famille d'utilitaires (spacing = m-*, p-*…)
src/ts/
├── bundle.ts             démarre tous les composants
└── components/           un fichier par composant qui a besoin de JS
```

- **Ordre** : settings → tools → reset → base → layout → components → utilities. Les utilitaires sont en dernier pour pouvoir surcharger les composants.
- **Pas de numéro dans les noms de dossiers** : l'ordre vient de `app.scss` et de `@layer`.
- **Un dossier seulement s'il contient plusieurs fichiers.** Un dossier a un `_index.scss` (convention Sass : `@use 'components'` charge `components/_index.scss`), qui liste ses fichiers par ordre alphabétique. Un fichier unique par nature (le reset) reste à la racine de `src/scss/`, sans dossier ni index.
- **Tout le CSS du framework est dans un `@layer`** : `@layer settings, reset, base, layout, components, utilities;`. Le CSS du site, écrit hors layer, gagne toujours sur le framework, sans bataille de spécificité.
- `tools/` et `settings/_breakpoints.scss` ne produisent pas de CSS : chaque fichier qui en a besoin les charge lui-même, avec un préfixe (`@use '../tools/mixins';` puis `@include mixins.text-on-colors(…)`). Pas de `as *` : l'IDE (JetBrains) ne retrouve pas la source et affiche « resolved only by name without use of explicit imports ».
- **Ajouter un composant** :
    1. créer `components/_nom.scss` (et `src/ts/components/nom.ts` si le JS est indispensable) ;
    2. ajouter `@use 'nom';` dans `components/_index.scss` ;
    3. créer sa page de documentation.

    Même principe pour un utilitaire ou une mise en page.
- **Nom de fichier = nom de la classe** : `_button.scss` contient `.button` et ses dérivés. Même nom pour le TS : `button.ts`.
- Fichiers en kebab-case, partials SCSS préfixés par `_`.
- **Contenu d'un fichier composant**, dans cet ordre : variables locales → styles de base → éléments → variantes → tailles → états.
- **Utilitaires** : générés par boucle SCSS sur une liste de clés, mais les valeurs viennent toujours des variables CSS (`.m-2 { margin: var(--space-2); }`).

## JavaScript (si indispensable)

- Écrit en TypeScript, livré en JavaScript vanilla (modules ES).
- Le JS change des attributs (`hidden`, `open`, `aria-*`), jamais de style inline.
- Initialisation via un attribut `data-*` au nom du composant (ex. `data-dropdown`).

## Documentation

- Basée sur le template fourni par Laurent (à venir).
- CSS propre à la doc (mise en page des démos, hors framework) : `doc/assets/styles/doc.css`, chargé après le CSS du framework dans `base.html.twig`.
- **Chaque composant a sa page de documentation.** Ordre de création :
    1. Le composant (SCSS, et TS si besoin).
    2. Sa page de documentation, construite avec le CSS du composant.
- Un composant n'est terminé que quand sa documentation existe.
- Pour chaque composant : exemple HTML minimal, liste des variables CSS, variantes, tailles, notes d'accessibilité.
- *(À compléter.)*

## Façon de travailler

- Changements petits et lisibles, proches du style du code existant. Pas de gros refactoring d'un coup.
- **Coder comme Laurent** : code direct et lisible, sans indirections (pas de variables « recette » ni de `--x-current`). Les réglages d'un composant sont des variables `--<composant>-*` dans un `:root` en tête de fichier, lues directement par les propriétés. Plusieurs classes qui partagent des styles sont regroupées dans un même sélecteur (`.btn, .btn-solid, .btn-subtle { … }`).
- **Style de Laurent** : voir son ancien code dans `/home/laurent/dev/webdev-ui_archive/src/scss/` (`components/button.scss`, `abstracts/variables.scss`). Indentation 4 espaces ; variables préfixées par le composant ; une boucle `@each` par composant ; états imbriqués (`&:hover`). Laurent développe pour comprendre et refactore ensuite : avancer pas à pas, le refactoring viendra plus tard.
- **Commentaires concis** : une ligne courte, qui dit le pourquoi. Pas de paragraphe ni d'exemple d'usage dans le code : les explications vont dans la documentation.
- **Tenir ce fichier à jour** à chaque nouvelle décision ou information.
- Donner le code d'abord ; expliquer seulement si demandé.
- Signaler clairement un choix discutable plutôt que de l'appliquer sans prévenir.
- Ne jamais ajouter de dépendance.

## Décisions en attente

- **Alignement sur Bootstrap 6** : points où ce fichier dit autre chose que Bootstrap 6, à trancher :
    - nommage : ce fichier veut des noms complets (`text-align-center`, `.button`), Bootstrap garde les abréviations (`text-center`, `.btn`, `fw-bold`). Le code utilise déjà `.btn` et `.theme-*` ;
    - tokens de couleur : Bootstrap a `-bg-subtle`, `-fg`, `-fg-emphasis`, `-contrast`, `-border`… ; le code a `-subtle`, `-emphasis`, `on-` ;
    - breakpoints : Bootstrap a lg 1024 et 2xl 1536.


- **Page de test** : tout exemple à tester va dans `doc/templates/main/index.html.twig` (demande de Laurent, 2026-10-22), pas dans `test/`.
- Nom du projet (plus tard).
- Navigateurs supportés (conditionne `:has()`, `popover`, nesting natif, `command`/`commandfor`, anchor positioning).
- Build CSS : fait par la CLI `sass` (scripts `build` et `watch` de `package.json`). `gulpfile.js` et les paquets gulp, gulp-sass, gulp-rename et esbuild ne servent plus, à supprimer. Build JS à ajouter avec `tsc` quand le premier composant aura du JS.
- Reset (`_reset.scss`) : revu et corrigé (comparé à Josh Comeau, Andy Bell, modern-normalize, reboot de Bootstrap 6). Décisions :
    - `margin: 0` seul sur `*` (pas de `padding: 0` : il casse le padding natif des champs, cellules, listes) ;
    - pas de `ul[role="list"]` (warning W3C) : liste sans puces = future classe `.list-unstyled` ;
    - `interpolate-size` seulement sous `prefers-reduced-motion: no-preference` ;
    - bloc `prefers-reduced-motion: reduce` global en `!important` dans le reset : gagne sur tout, site compris (choix strict assumé) ;
    - `-webkit-font-smoothing` retiré.
- **base/ à créer** : ce qui est sorti du reset y va, avec des variables : `line-height` du body (`--line-height`), taille et graisse des titres, couleur des liens, `hr`, `accent-color`.
- Composants de l'archive écartés pour l'instant :
    - `collapse` (fusionné dans `accordion`, c'est un `<details>`) ;
    - `link` (va dans base) ;
    - `outline` (rôle à préciser) ;
    - utilitaires `animation`, `keyframes`, `cursor`, `image`.
- JS : seul `tab.ts` est prévu. `dialog`, `drawer` et `dropdown` pourraient se passer de JS (`<dialog>` + `command`, `popover`), selon les navigateurs supportés.