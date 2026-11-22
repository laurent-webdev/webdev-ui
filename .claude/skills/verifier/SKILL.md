---
name: verifier
description: Vérifier le framework avant un commit (typecheck, build, validateur W3C sur toutes les pages de la doc, règles du CLAUDE.md, dist/ recompilé) et dire ce qui reste à vérifier à la main. À lancer quand on demande de vérifier, avant de proposer un commit, ou à la fin d'un composant.
---

# Vérifier

Node, sass et tsc n'existent que dans le conteneur Docker `webdev-ui` ; la doc est servie sur http://localhost:8888 par `symfony serve` (qui lance aussi `gulp watch`). Si `docker ps` ne montre pas `webdev-ui`, ou si la doc ne répond pas, s'arrêter et le dire à l'utilisateur.

Lancer les étapes dans l'ordre, sans rien corriger : le compte rendu d'abord, les corrections sur l'accord de l'utilisateur.

## 1. Types

```bash
docker exec -w /app webdev-ui npm run typecheck
```

## 2. Build et `dist/`

```bash
docker exec -w /app webdev-ui npm run build
git status --short dist/
```

`dist/` est versionné : si `src/` a changé, le `dist/` recompilé va dans le même commit. Le `DeprecationWarning` (`fs.Stats`) vient de gulp 4 sous Node 24, sans effet.

## 3. Validateur W3C (toutes les pages)

```bash
.claude/skills/verifier/w3c.sh <dossier scratchpad de la session>/w3c
```

Le script enregistre chaque page du menu (sans la barre de débogage de Symfony), puis la passe au validateur Nu (image Docker `ghcr.io/validator/validator`), warnings comptés comme des erreurs. Objectif : aucune ligne.

## 4. Règles du CLAUDE.md

```bash
.claude/skills/verifier/regles.sh
```

Chaque ✗ est à regarder : une exception commentée dans le code est voulue (connue : `border-right` de la flèche de l'accordéon, côtés physiques). Sinon, la signaler.

## 5. Compte rendu

Un tableau court : étape, ✓ ou ✗, l'erreur exacte (fichier:ligne). Puis, toujours, ce que ce skill **ne vérifie pas** et qui reste à faire à la main (CLAUDE.md, « Exigence qualité ») :

- Lighthouse à 100 dans les 4 catégories (Chromium, DevTools > Lighthouse), sur les pages changées ;
- contrastes dans les deux thèmes, au repos, au survol et au clic ;
- clavier et focus visible, 320px sans débordement, zoom 200 %, `prefers-reduced-motion`.
