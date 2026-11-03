#!/usr/bin/env bash
# Cherche dans le code ce que CLAUDE.md interdit. Un résultat n'est pas forcément une faute :
# une exception voulue est commentée dans le code (ex. la flèche de l'accordéon, en côtés physiques).
# Usage : regles.sh
cd "$(dirname "$0")/../../.." || exit 1

regle() {
    titre="$1"
    shift
    resultat=$("$@" 2>/dev/null)
    if [ -n "$resultat" ]; then
        printf '\n✗ %s\n%s\n\n' "$titre" "$resultat"
    else
        printf '✓ %s\n' "$titre"
    fi
}

regle "Pas de dépendance à l'exécution (package.json)" grep -n '"dependencies"' package.json
regle "Modules Sass : pas de @import" grep -rn '@import' src/scss
regle "@use avec un préfixe, jamais « as * »" grep -rnE '@use .* as \*' src/scss
regle "Pas de variable de Bootstrap (--bs-)" grep -rn -- '--bs-' src doc/templates doc/assets
regle "État = attribut natif ou ARIA, pas de classe is-*" grep -rnE '\.is-[a-z]|class="[^"]*\bis-[a-z]' src doc/templates
regle "Désactivé sans cursor: not-allowed (composants)" grep -rn 'not-allowed' src/scss/components
regle "!important seulement dans le reset" grep -rn '!important' src/scss --exclude=_reset.scss
regle "translate / scale / rotate, pas transform" grep -rnE '^\s*transform\s*:' src/scss
regle "Pas de @supports" grep -rn '@supports' src/scss
regle "Propriétés logiques, pas left / right" grep -rnE '\b(margin|padding|border)-(left|right)\b|^\s*(left|right)\s*:|text-align:\s*(left|right)|float:\s*(left|right)' src/scss
regle "Couleurs en oklch, pas de #hex, rgb() ni hsl()" grep -rnE '#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(' src/scss
regle "Le JS ne pose pas de style inline" grep -rnE '\.style\b' src/ts
# Les lignes de commentaire Twig ({# … #}) ne comptent pas
regle "Blocs de code en <pre tabindex=\"0\">" grep -rnP '^(?!\s*\{#).*<pre(?![^>]*tabindex="0")[\s>]' doc/templates --include=*.twig
