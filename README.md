# webdev-ui

Lightweight CSS/JS framework — modular, CDN-ready, no dependencies.

- 📦 **GitHub** : [github.com/laurent-webdev/webdev-ui](https://github.com/laurent-webdev/webdev-ui)
- 🚀 **CDN** : [jsDelivr](https://www.jsdelivr.com/package/gh/laurent-webdev/webdev-ui)

---

## Installation rapide via CDN

### Bundle complet (recommandé)

```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/app.css">

<!-- JS -->
<script type="module" src="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/js/bundle.js"></script>
```

### Versions minifiées

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/app.min.css">
<script type="module" src="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/js/bundle.min.js"></script>
```

### À la carte — charger uniquement ce dont vous avez besoin

```html
<!-- Variables (obligatoire en premier) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/abstracts/variables.css">

<!-- Un composant -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/components/button.css">

<!-- Un module JS -->
<script type="module">
    import Alert from 'https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/js/alert.js';
    new Alert();
</script>
```

### Surcharger les variables

```css
:root {
    --color-primary: #ff6600;
    --border-radius: 0.25rem;
}
```

> Remplace `@v1` par `@latest` pour toujours avoir la dernière version (déconseillé en production).

---

## Build System

Mini framework CSS/JS compilé via Docker + Gulp + esbuild.
Aucune installation locale de Node/npm requise.

---

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et lancé

---

## Structure du projet

```
project/
├── src/
│   ├── scss/
│   │   ├── abstracts/      # variables.scss, colors.scss, breakpoints.scss
│   │   ├── base/           # base.scss, reset.scss
│   │   ├── components/     # button.scss, card.scss, ...
│   │   ├── layouts/        # grid.scss, container.scss, ...
│   │   └── utilities/      # spacing.scss, display.scss, ...
│   └── js/
│       ├── alert.js
│       ├── collapse.js
│       ├── dialog.js
│       └── ...
├── app.js                  # Point d'entrée JS (bundle)
├── dist/                   # Généré automatiquement
│   ├── css/
│   └── js/
├── Dockerfile
├── docker-compose.yml
├── package.json
└── gulpfile.js
```

---

## Fichiers de config

### `Dockerfile`
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
```

### `docker-compose.yml`
```yaml
services:
  builder:
    build: .
    volumes:
      - ./src:/app/src
      - ./dist:/app/dist
```

### `package.json`
```json
{
  "name": "simplecss",
  "version": "1.0.0",
  "scripts": {
    "build": "gulp build"
  },
  "devDependencies": {
    "gulp": "^4.0.2",
    "gulp-sass": "^6.0.0",
    "sass": "^1.79.0",
    "gulp-clean-css": "^4.3.0",
    "gulp-rename": "^2.0.0",
    "esbuild": "^0.25.0",
    "glob": "^10.0.0"
  }
}
```

### `gulpfile.js`
```javascript
const gulp = require('gulp');
const sass = require('sass');
const gulpSass = require('gulp-sass')(sass);
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const esbuild = require('esbuild');
const glob = require('glob');

const IGNORE = ['!src/scss/**/_*.scss'];

// ── CSS individuel ────────────────────────────────────
function buildCSS() {
    return gulp.src(['src/scss/**/*.scss', ...IGNORE])
        .pipe(gulpSass({ api: 'modern' }).on('error', gulpSass.logError))
        .pipe(gulp.dest('dist/css'));
}

function buildCSSMin() {
    return gulp.src(['src/scss/**/*.scss', ...IGNORE])
        .pipe(gulpSass({ api: 'modern' }).on('error', gulpSass.logError))
        .pipe(cleanCSS())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/css'));
}

// ── JS individuel ─────────────────────────────────────
async function buildJS() {
    const files = glob.sync('src/js/**/*.js');
    await Promise.all(files.map(file => {
        return esbuild.build({
            entryPoints: [file],
            outfile: file.replace('src/js', 'dist/js'),
            bundle: false,
            format: 'esm',
        });
    }));
}

async function buildJSMin() {
    const files = glob.sync('src/js/**/*.js');
    await Promise.all(files.map(file => {
        return esbuild.build({
            entryPoints: [file],
            outfile: file.replace('src/js', 'dist/js').replace('.js', '.min.js'),
            bundle: false,
            minify: true,
            format: 'esm',
        });
    }));
}

// ── JS bundle (app.js) ────────────────────────────────
async function buildJSBundle() {
    await esbuild.build({
        entryPoints: ['src/app.js'],
        outfile: 'dist/js/bundle.js',
        bundle: true,
        format: 'esm',
    });
}

async function buildJSBundleMin() {
    await esbuild.build({
        entryPoints: ['src/app.js'],
        outfile: 'dist/js/bundle.min.js',
        bundle: true,
        minify: true,
        format: 'esm',
    });
}

exports.build = gulp.parallel(
    buildCSS,
    buildCSSMin,
    buildJS,
    buildJSMin,
    buildJSBundle,
    buildJSBundleMin
);
```

---

## Commandes

### 1. Première installation (une seule fois)

```bash
docker compose build
```

> À relancer uniquement si tu modifies `package.json`, `Dockerfile` ou `gulpfile.js`.

### 2. Compiler le projet

```bash
docker compose run --rm builder npm run build
```

> `--rm` supprime le conteneur après l'exécution (évite l'accumulation de conteneurs morts).

---

## Résultat dans `dist/`

```
dist/
├── css/
│   ├── abstracts/
│   │   └── variables.css / variables.min.css
│   ├── base/
│   │   ├── base.css / base.min.css
│   │   └── reset.css / reset.min.css
│   ├── components/
│   │   ├── button.css / button.min.css
│   │   └── ...
│   ├── layouts/
│   └── utilities/
└── js/
    ├── alert.js / alert.min.js
    ├── collapse.js / collapse.min.js
    ├── ...
    ├── bundle.js        ← tout le JS en un seul fichier
    └── bundle.min.js
```

---

## Utilisation comme CDN

Voir la section **Installation rapide via CDN** en haut du README.

---

## Ordre de chargement CSS ⚠️

L'ordre est **obligatoire** si tu charges les fichiers à la carte. Chaque couche dépend de la précédente.

```html
<!-- 1. ABSTRACTS — variables CSS globales (obligatoire en premier) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/abstracts/variables.css">

<!-- 2. BASE — reset + styles HTML de base -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/base/reset.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/base/base.css">

<!-- 3. LAYOUTS — structure de page (avant les composants) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/layouts/columns.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/layouts/container.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/layouts/flex.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/layouts/grid.css">

<!-- 4. COMPONENTS — composants UI (dans n'importe quel ordre entre eux) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/components/accordion.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/components/alert.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/components/badge.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/components/button.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/components/card.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/components/collapse.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/components/dialog.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/components/dropdown.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/components/form.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/components/link.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/components/list.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/components/navbar.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/components/outline.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/components/sidebar.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/components/tab.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/components/table.css">

<!-- 5. UTILITIES — classes utilitaires (toujours en dernier, elles écrasent tout) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/utilities/animation.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/utilities/background.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/utilities/border.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/utilities/cursor.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/utilities/display.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/utilities/font.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/utilities/image.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/utilities/keyframes.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/utilities/overflow.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/utilities/position.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/utilities/shadow.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/utilities/sizing.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/utilities/spacing.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/utilities/text.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/laurent-webdev/webdev-ui@v1/dist/css/utilities/visibility.css">
```

> **Règle simple à retenir :** `variables` → `base` → `layouts` → `components` → `utilities`
> Tu peux sauter des couches entières ou des fichiers individuels, mais jamais inverser l'ordre.

---

## Règles SCSS importantes

- Les fichiers commençant par `_` (ex: `_mixins.scss`) sont **ignorés** — ce sont des partiels.
- Les fichiers `abstracts/` sans `_` (ex: `variables.scss`) **sont compilés** car ils contiennent des CSS custom properties.
- Les fichiers `abstracts/` avec `_` (ex: `_breakpoints.scss`) sont ignorés car ils ne contiennent que des variables SCSS ou mixins.