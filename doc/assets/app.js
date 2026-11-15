// Bascule clair / sombre de la doc : le framework ne fournit pas ce JS, c'est au site de le faire
const root = document.documentElement;
const toggle = document.getElementById('theme-toggle');

const isDark = () => (root.dataset.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) === 'dark';

toggle.setAttribute('aria-pressed', isDark());
toggle.addEventListener('click', () => {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    localStorage.setItem('theme', root.dataset.theme);
    toggle.setAttribute('aria-pressed', isDark());
});

// Les écouteurs des démos et des blocs de code sont sur document : ils marchent pour le contenu que htmx remplace

// Démos : le bouton affiche ou masque son contenu (hidden) ; les animations se rejouent à chaque affichage
document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-demo-toggle]');
    if (!button) return;
    const target = document.getElementById(button.getAttribute('aria-controls'));
    target.hidden = !target.hidden;
    button.setAttribute('aria-expanded', !target.hidden);
});

// Démos : le bouton ajoute une copie de son <template> (data-demo-toast = id du modèle) au conteneur data-toast de son dialogue ou de la page,
// ou à celui de data-demo-toast-container (id du conteneur)
document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-demo-toast]');
    if (!button) return;
    const template = document.getElementById(button.dataset.demoToast);
    const container = button.dataset.demoToastContainer
        ? document.getElementById(button.dataset.demoToastContainer)
        : button.closest('dialog, body').querySelector('[data-toast]');
    container.append(template.content.cloneNode(true));
});

// Menu fixé (grand écran) : il défile seul ; au chargement, la page en cours au milieu du menu
const docMenu = document.getElementById('doc-menu-fixed');
const docMenuCurrent = docMenu?.querySelector('[aria-current="page"]');
if (docMenuCurrent) docMenu.scrollTop = docMenuCurrent.offsetTop - docMenu.clientHeight / 2;

// Blocs de code : un bouton Copier en haut à droite de chacun, ajouté ici (sans JS, il ne servirait à rien)
// Le bouton est dans le <pre> (il en prend les couleurs) mais placé par rapport à une enveloppe : il ne défile pas avec le code
const copyIcon = '<svg class="vertical-align-middle" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M15 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4"/></svg>';
const copiedIcon = '<svg class="vertical-align-middle" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
// La zone role="status" de base.html.twig, présente dès le chargement : le lecteur d'écran annonce la copie
const copyStatus = document.getElementById('doc-copy-status');

const addCopyButtons = (parent) => {
    parent.querySelectorAll('pre > code[class*="language-"]').forEach((code) => {
        const pre = code.parentElement;
        // Déjà fait : une page remise par le bouton Retour garde ses boutons
        if (pre.querySelector('.doc-code-copy')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'position-relative';
        pre.before(wrapper);
        wrapper.append(pre);

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-xs position-absolute top-0 end-0 m-2 doc-code-copy';
        button.setAttribute('aria-label', 'Copier le code');
        button.innerHTML = copyIcon;
        pre.append(button);
    });
};

addCopyButtons(document);

// Copié : une coche et l'annonce pendant 2 secondes, puis le bouton revient
document.addEventListener('click', async (event) => {
    const button = event.target.closest('.doc-code-copy');
    if (!button) return;
    try {
        await navigator.clipboard.writeText(button.closest('pre').querySelector('code').textContent);
        button.innerHTML = copiedIcon;
        copyStatus.textContent = 'Code copié';
    } catch {
        copyStatus.textContent = 'Copie impossible : sélectionner le code à la main';
    }
    setTimeout(() => {
        button.innerHTML = copyIcon;
        copyStatus.textContent = '';
    }, 2000);
});

// Recherche de l'en-tête : motif « combobox » de l'ARIA APG (liste filtrée pendant la frappe, l'option se choisit à la main)
// Le focus reste dans le champ ; aria-activedescendant dit au lecteur d'écran quelle option est choisie au clavier
const search = document.getElementById('doc-search');
const searchList = document.getElementById('doc-search-list');
const searchOptions = [...searchList.querySelectorAll('[role="option"]')];
// Sans majuscules ni accents : « accordeon » trouve « Accordéon »
const simplify = (text) => text.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

// Garde les pages dont le nom contient le texte tapé (champ vide : toutes) : d'abord celles qui commencent par lui (« to » : Toast avant Bouton),
// puis les autres, dans l'ordre du menu ; remises dans cet ordre dans le HTML, l'ordre lu est celui affiché ; rend celles qui restent
const filterOptions = () => {
    const query = simplify(search.value);
    const starts = searchOptions.filter((option) => simplify(option.textContent).startsWith(query));
    const contains = searchOptions.filter((option) => !starts.includes(option) && simplify(option.textContent).includes(query));
    const options = [...starts, ...contains];
    searchOptions.forEach((option) => { option.hidden = !options.includes(option); });
    searchList.append(...options);
    return options;
};

// L'option choisie au clavier (null : aucune) : entourée comme au focus (doc.css), visible dans la liste qui défile
const setActive = (option) => {
    searchOptions.forEach((item) => item.setAttribute('aria-selected', item === option));
    if (option) {
        search.setAttribute('aria-activedescendant', option.id);
        option.scrollIntoView({ block: 'nearest' });
    } else {
        search.removeAttribute('aria-activedescendant');
    }
};

const openList = () => {
    if (!searchList.matches(':popover-open')) searchList.showPopover();
    search.setAttribute('aria-expanded', 'true');
};

const closeList = () => {
    if (searchList.matches(':popover-open')) searchList.hidePopover();
    search.setAttribute('aria-expanded', 'false');
    setActive(null);
};

// Frappe : la liste suit le texte, fermée si le champ est vide ou si aucune page ne correspond
search.addEventListener('input', () => {
    const options = filterOptions();
    setActive(null);
    if (search.value.trim() && options.length) {
        openList();
    } else {
        closeList();
    }
});

search.addEventListener('keydown', (event) => {
    const active = searchOptions.find((option) => option.getAttribute('aria-selected') === 'true');

    // ↓ ↑ : ouvrent la liste (toutes les pages si le champ est vide), puis passent d'une option à l'autre, en boucle ; Alt + ↓ ouvre seulement
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const options = filterOptions();
        if (!options.length) return;
        openList();
        if (event.altKey) return;
        const index = options.indexOf(active);
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const next = index === -1 ? (step === 1 ? 0 : options.length - 1) : (index + step + options.length) % options.length;
        setActive(options[next]);
    }

    // Entrée : l'option choisie, sinon la page du même nom, sinon la première de la liste
    if (event.key === 'Enter') {
        event.preventDefault();
        if (!search.value.trim() && !active) return;
        const options = filterOptions();
        const target = active ?? options.find((option) => simplify(option.textContent) === simplify(search.value)) ?? options[0];
        target?.click();
    }

    // Échap : ferme la liste, le texte reste ; liste fermée, vide le champ
    if (event.key === 'Escape') {
        if (searchList.matches(':popover-open')) {
            closeList();
        } else {
            search.value = '';
        }
    }

    // ← → Début Fin : le curseur bouge dans le champ, plus d'option choisie
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) setActive(null);
});

// La liste se ferme quand le focus quitte le champ (Tab, clic ailleurs)
search.addEventListener('blur', closeList);
// Un clic dans la liste ne prend pas le focus au champ : sinon la liste se fermerait avant le clic
searchList.addEventListener('mousedown', (event) => event.preventDefault());
// Une page choisie (clic ou Entrée) : htmx la charge (data-hx-boost), la recherche se vide
searchList.addEventListener('click', (event) => {
    if (!event.target.closest('[role="option"]')) return;
    closeList();
    search.value = '';
});

// htmx : après chaque changement de page (lien du menu ou bouton Retour), ce que fait un vrai chargement
const pageChanged = () => {
    const content = document.getElementById('doc-content');

    // Le drawer du menu (petit écran) se fermait avec l'ancienne page
    const menu = document.getElementById('doc-menu');
    if (menu.open) menu.close();

    // La page en cours dans les deux menus : ils ne sont pas redessinés
    document.querySelectorAll('#doc-menu .list-item, #doc-menu-fixed .list-item').forEach((link) => {
        if (new URL(link.href).pathname === location.pathname) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });

    // Le nouveau contenu : couleurs du code, boutons Copier, conteneurs de toasts (toast.ts n'ouvre que ceux du chargement)
    window.Prism?.highlightAllUnder(content);
    addCopyButtons(content);
    content.querySelectorAll('[data-toast][popover]').forEach((container) => {
        if (!container.matches(':popover-open')) container.showPopover();
    });

    // Le focus sur le titre de la page : le lecteur d'écran annonce la nouvelle page au lieu de rester sur le lien du menu
    const title = content.querySelector('h1');
    title.setAttribute('tabindex', '-1');
    title.focus({ preventScroll: true });
};

document.addEventListener('htmx:afterSettle', (event) => {
    if (event.target.id === 'doc-content') pageChanged();
});
document.addEventListener('htmx:historyRestore', pageChanged);
