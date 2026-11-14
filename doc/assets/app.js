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

// Démos : le bouton affiche ou masque son contenu (hidden) ; les animations se rejouent à chaque affichage
document.querySelectorAll('[data-demo-toggle]').forEach((button) => {
    const target = document.getElementById(button.getAttribute('aria-controls'));
    button.addEventListener('click', () => {
        target.hidden = !target.hidden;
        button.setAttribute('aria-expanded', !target.hidden);
    });
});

// Démos : le bouton ajoute une copie de son <template> (data-demo-toast = id du modèle) au conteneur data-toast de son dialogue ou de la page,
// ou à celui de data-demo-toast-container (id du conteneur)
document.querySelectorAll('[data-demo-toast]').forEach((button) => {
    const template = document.getElementById(button.dataset.demoToast);
    const container = button.dataset.demoToastContainer
        ? document.getElementById(button.dataset.demoToastContainer)
        : button.closest('dialog, body').querySelector('[data-toast]');
    button.addEventListener('click', () => container.append(template.content.cloneNode(true)));
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

document.querySelectorAll('pre > code[class*="language-"]').forEach((code) => {
    const pre = code.parentElement;
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

    // Copié : une coche et l'annonce pendant 2 secondes, puis le bouton revient
    button.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(code.textContent);
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
});
