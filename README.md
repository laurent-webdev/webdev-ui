# webdev-ui

Un framework CSS/JS ultra léger : le HTML natif, des variables CSS pour tout personnaliser, les thèmes clair et sombre, et pas une dépendance.

> En cours : la v2, une refonte totale. Le nom est encore à définir et le formulaire est en refonte. Pas encore de version publiée (ni tag ni CDN) : on prend toujours la dernière.

## Principes

- **Le HTML natif d'abord** : `<dialog>`, `<details>`, `popover`, `command`, `:has()`… Le JS ne sert qu'aux onglets, aux toasts et à la fermeture animée des dialogues et des drawers.
- **Tout se personnalise par des variables CSS**, sans recompiler : on change une variable, tout ce qui la lit suit. Seule exception, les breakpoints (`var()` ne marche pas dans une media query).
- **Des couleurs en oklch**, dont les dérivées (survol, fond léger, texte lisible) sont calculées par le navigateur. Clair ou sombre selon le système, ou forcé par `data-theme` sur `<html>`.
- **Aucun point perdu** : chaque page de la doc est à 100 dans les 4 catégories Lighthouse (performance, accessibilité, bonnes pratiques, SEO), sans erreur au validateur W3C. Les contrastes sont vérifiés dans les deux thèmes, au repos, au survol et au clic, et tout marche au clavier, à 320px et en zoom 200 %.
- **Des noms lisibles** : le nom de la propriété CSS (`justify-content-space-between`, `border-radius-md`), la couleur séparée de la variante (`btn-solid theme-primary`).

## Utiliser le framework

Télécharger `webdev-ui.min.css` et `webdev-ui.min.js` depuis la page d'accueil de la doc (ou les prendre dans `dist/`), puis :

```html
<link rel="stylesheet" href="css/webdev-ui.min.css">
<script type="module" src="js/webdev-ui.min.js"></script>

<button class="btn-solid theme-primary">Enregistrer</button>
```

Personnaliser, dans le CSS du site :

```css
:root {
    /* La couleur et ses dérivées : tous les theme-primary suivent */
    --color-primary: light-dark(oklch(0.55 0.15 150), oklch(0.7 0.15 150));
    /* Les arrondis de tous les composants */
    --border-radius-md: 0.5rem;
}
```

Changer les breakpoints demande les sources SCSS (ce dépôt) et un SCSS à compiler :

```scss
@use '…/webdev-ui/src/scss/settings/breakpoints' with ($screen-md: 50rem);
@use '…/webdev-ui/src/scss/webdev-ui';
```

Navigateurs : les versions à jour depuis fin 2025 (Baseline 2025), sur ordinateur et sur téléphone. Le détail est sur la page d'accueil de la doc.

## Le dépôt

```
src/scss/   les sources SCSS (settings, tools, reset, base, layout, components, utilities)
src/ts/     le JS des composants qui en ont besoin (dialog, tab, toast)
dist/       les fichiers compilés, versionnés : webdev-ui.css, webdev-ui.js et leurs .min
doc/        le site de documentation (Symfony), qui sert aussi de démo
```

## Prérequis

Docker uniquement : le conteneur fournit Node.js, PHP, Composer et la Symfony CLI.

## Lancer le projet

1. Les valeurs par défaut (nom du conteneur, UID, ports) sont dans `.env`, lu automatiquement par Docker Compose.
   Pour en changer sur ta machine (UID différent de `id -u`, port déjà pris…), crée un `.env.local` (non commité)
   avec uniquement les variables à surcharger, puis ajoute `--env-file .env --env-file .env.local` à chaque commande
   `docker compose`.

2. Démarrer le conteneur et y ouvrir un terminal :

   ```bash
   docker compose up -d --build
   docker exec -it webdev-ui bash
   ```

3. La première fois, installer les dépendances (dans le conteneur) :

   ```bash
   cd /app && npm install
   cd /app/doc && composer install
   ```

4. Lancer la doc (dans le conteneur) :

   ```bash
   cd /app/doc && symfony serve --allow-all-ip
   ```

   Puis ouvrir http://localhost:8888 (la valeur de `APP_PORT`). Tant que le serveur tourne, `dist/` est reconstruit à
   chaque modification de `src/` : il suffit de rafraîchir la page. `Ctrl+C` pour arrêter.

## Autres commandes

Dans le conteneur, à la racine (`/app`) :

```bash
npm run build       # compiler src/ vers dist/
npm run watch       # recompiler à chaque modification
npm run typecheck   # vérifier les types TypeScript
```

Depuis la machine, pour arrêter le conteneur :

```bash
docker compose down
```

## Contribuer

Les règles du projet sont dans [`CLAUDE.md`](CLAUDE.md) : nommage, variables CSS, couleurs, thèmes, qualité. Il s'adresse à Claude Code, mais se lit comme un guide.

- **Un composant** = un fichier `src/scss/components/_nom.scss` (+ `src/ts/components/nom.ts` si le JS est indispensable), son `@use` dans `components/_index.scss`, et sa page de doc. Il n'est terminé que quand sa page existe.
- **Avant un commit** : `npm run typecheck`, `npm run build` (`dist/` va dans le commit avec `src/`), le validateur W3C sur les pages changées, puis à la main : Lighthouse à 100, les contrastes dans les deux thèmes, le clavier, 320px, le zoom 200 %.

### Avec Claude Code

Le projet est codé en duo avec [Claude Code](https://claude.com/claude-code), qui lit ces fichiers tout seul :

| Fichier | Contenu | Chargé |
|---|---|---|
| `CLAUDE.md` | les règles communes | à chaque session |
| `.claude/rules/components.md` | les choix de chaque composant | quand Claude ouvre un composant ou une page de la doc |
| `.claude/rules/doc.md` | les pages et le fonctionnement du site de doc | quand Claude ouvre un fichier de `doc/` |
| `CLAUDE.local.md` | tes réglages à toi (non versionné, à créer si besoin) | à chaque session, sur ta machine |

Deux commandes du projet (`.claude/skills/`) :

- `/nouveau-composant <nom>` : commence un composant, étape par étape (SCSS, JS si besoin, page de doc, règles).
- `/verifier` : avant un commit, vérifie les types, le build, le validateur W3C sur toutes les pages et les règles du `CLAUDE.md`, puis dit ce qui reste à vérifier à la main.

## Licence

MIT, voir [`LICENSE`](LICENSE).
