# webdev-ui

Mini framework CSS/JS modulaire, sans dépendance : SCSS compilé par Gulp + Sass, TypeScript compilé par esbuild.
La doc (Symfony, dans `doc/`) sert de site de démonstration.

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