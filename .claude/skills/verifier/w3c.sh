#!/usr/bin/env bash
# Valide chaque page de la doc au validateur W3C (Nu), avec son image Docker officielle : rien à installer.
# Le validateur refuse les adresses locales : les pages sont d'abord enregistrées dans le dossier donné.
# Usage : w3c.sh <dossier-temporaire>
set -euo pipefail

dir="${1:?Usage : w3c.sh <dossier-temporaire>}"
base="http://localhost:8888"

mkdir -p "$dir"
rm -f "$dir"/*.html

# Les pages sont celles du menu de la doc, plus l'accueil.
# En-tête XHR : Symfony n'injecte pas sa barre de débogage (dev seulement), qui n'est pas la doc
for path in $(curl -fsS "$base/" | grep -oE 'href="/[a-z0-9/_-]*"' | sed 's/^href="//; s/"$//' | sort -u); do
    name=$(echo "${path#/}" | tr '/' '-')
    curl -fsS -H 'X-Requested-With: XMLHttpRequest' "$base$path" -o "$dir/${name:-index}.html"
    # Un modèle (section Modèles) : sa page seule aussi, hors du menu
    if [[ "$path" == /templates/* ]]; then
        curl -fsS -H 'X-Requested-With: XMLHttpRequest' "$base$path/page" -o "$dir/$name-page.html"
    fi
done
echo "$(ls "$dir"/*.html | wc -l) pages enregistrées dans $dir"

# --Werror : un warning compte comme une erreur (0 erreur, 0 warning exigés)
docker run --rm -v "$dir":/pages:ro ghcr.io/validator/validator:latest \
    java -jar /vnu.jar --Werror --skip-non-html --format gnu /pages/ 2>&1 | grep -v '^Picked up JAVA_TOOL_OPTIONS' || true
echo "Fin de la validation (aucune ligne au-dessus = 0 erreur, 0 warning)"
