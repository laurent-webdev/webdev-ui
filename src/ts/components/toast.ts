// Toasts : le minuteur et les animations sont en CSS ; le JS retire le toast de la page quand il a disparu
// Un toast est un enfant direct d'un conteneur data-toast, ajouté par le site quand il veut

export default class Toast {

    // Écouteurs délégués sur document : marche pour les toasts ajoutés plus tard, sans les surveiller
    static start() {
        document.addEventListener('click', Toast.onClick);
        document.addEventListener('animationend', Toast.onAnimationEnd);
        Toast.showContainers();
    }

    // Les conteneurs popover="manual" de la page, ouverts une fois pour toutes : dans le top layer, au-dessus de la page
    // Sans popover (dans un dialogue, déjà dans le top layer), le conteneur s'affiche seul
    static showContainers() {
        document.querySelectorAll<HTMLElement>('[data-toast][popover]').forEach(container => {
            if (!container.matches(':popover-open')) container.showPopover();
        });
    }

    static findToast(element: EventTarget | null): HTMLElement | null {
        return element instanceof Element ? element.closest<HTMLElement>('[data-toast] > *') : null;
    }

    // La croix (data-toast-close) : data-closing lance le fondu, le toast est retiré à la fin
    static onClick(event: MouseEvent) {
        if (!(event.target instanceof Element) || !event.target.closest('[data-toast-close]')) return;

        const toast = Toast.findToast(event.target);
        if (!toast || toast.hasAttribute('data-closing')) return;

        toast.setAttribute('data-closing', '');
        // getAnimations() lance la transition de data-closing ; allSettled : retiré aussi si elle est interrompue
        Promise.allSettled(toast.getAnimations().map(animation => animation.finished)).then(() => toast.remove());
    }

    // Fin du minuteur : toast-hide l'a fait disparaître, il est retiré
    static onAnimationEnd(event: AnimationEvent) {
        if (event.animationName !== 'toast-hide') return;

        const toast = Toast.findToast(event.target);
        // Le toast lui-même : pas une animation d'un élément qu'il contient
        if (toast && toast === event.target) toast.remove();
    }
}

// Démarré au chargement du fichier : le site n'écrit que data-toast, sans JS
Toast.start();
