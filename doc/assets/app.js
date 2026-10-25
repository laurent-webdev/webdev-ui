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
