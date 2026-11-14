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
