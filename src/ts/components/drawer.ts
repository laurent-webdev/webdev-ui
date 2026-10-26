// Drawer : glisse vers son bord avant de se fermer (l'ouverture glisse en CSS, avec @starting-style)
// Le navigateur fermerait d'un coup : le JS bloque la fermeture, pose data-closing, puis ferme à la fin du glissement

// L'événement command est trop récent pour les types de TypeScript
interface CommandEvent extends Event {
    command: string;
    source: HTMLButtonElement | null;
}

export default class Drawer {

    // cancel, command et close ne remontent pas : écoutés en capture sur document, pour tous les drawers de la page
    // Le navigateur n'ajoute pas deux fois le même écouteur : un second start() ne double rien
    static start() {
        document.addEventListener('cancel', Drawer.onCancel, true);
        document.addEventListener('command', Drawer.onCommand, true);
        document.addEventListener('close', Drawer.onClose, true);
    }

    static isDrawer(element: EventTarget | null): element is HTMLDialogElement {
        return element instanceof HTMLDialogElement && element.hasAttribute('data-drawer');
    }

    static slideClose(drawer: HTMLDialogElement, returnValue?: string) {
        if (drawer.hasAttribute('data-closing')) return;
        drawer.setAttribute('data-closing', '');

        // getAnimations() lance la transition de data-closing ; allSettled : ferme aussi si elle est interrompue
        Promise.allSettled(drawer.getAnimations().map(animation => animation.finished)).then(() => {
            // Déjà fermé autrement pendant le glissement (close(), form method="dialog")
            if (drawer.hasAttribute('data-closing')) drawer.close(returnValue);
        });
    }

    // Échap, clic à côté (closedby="any"), command="request-close", requestClose()
    static onCancel(event: Event) {
        if (!Drawer.isDrawer(event.target)) return;
        // Non annulable : le navigateur ferme d'un coup, onClose fait le ménage
        if (!event.cancelable) return;

        event.preventDefault();
        Drawer.slideClose(event.target);
    }

    // command="close" : le navigateur ferme sans passer par cancel
    static onCommand(event: Event) {
        const {command, source} = event as CommandEvent;
        if (command !== 'close' || !Drawer.isDrawer(event.target) || !event.target.open) return;

        event.preventDefault();
        // value du bouton : lue ensuite dans returnValue, comme en natif
        Drawer.slideClose(event.target, source?.hasAttribute('value') ? source.value : undefined);
    }

    // Fermé, aussi d'un coup : sans data-closing, la prochaine ouverture glisse depuis le bord
    static onClose(event: Event) {
        if (Drawer.isDrawer(event.target)) event.target.removeAttribute('data-closing');
    }
}

// Démarré au chargement du fichier : le site n'écrit que data-drawer, sans JS
Drawer.start();
