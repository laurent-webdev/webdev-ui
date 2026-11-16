// Dialogue et drawer : animés avant de se fermer (l'ouverture s'anime en CSS, avec @starting-style)
// Le navigateur fermerait d'un coup : le JS bloque la fermeture, pose data-closing, puis ferme à la fin de l'animation
// Et le clic à côté (closedby="any") dans les navigateurs qui ne le connaissent pas encore (Safari)

// L'événement command est trop récent pour les types de TypeScript
interface CommandEvent extends Event {
    command: string;
    source: HTMLButtonElement | null;
}

export default class Dialog {

    // Le dialogue dont le fond a reçu l'appui : il ne se ferme que si le relâché est aussi sur son fond
    static pressedOutside: HTMLDialogElement | null = null;

    // cancel, command et close ne remontent pas : écoutés en capture sur document, pour tous les dialogues de la page
    // Le navigateur n'ajoute pas deux fois le même écouteur : un second start() ne double rien
    static start() {
        document.addEventListener('cancel', Dialog.onCancel, true);
        document.addEventListener('command', Dialog.onCommand, true);
        document.addEventListener('close', Dialog.onClose, true);

        // Safari ne connaît pas encore closedby="any" : le clic à côté est fait ici, seulement là où il manque
        // pointerdown et pointerup, pas click : sur iPhone, un click écouté sur document n'arrive pas toujours
        if (!('closedBy' in HTMLDialogElement.prototype)) {
            document.addEventListener('pointerdown', Dialog.onPointerDown);
            document.addEventListener('pointerup', Dialog.onPointerUp);
        }
    }

    static isDialog(element: EventTarget | null): element is HTMLDialogElement {
        return element instanceof HTMLDialogElement && element.hasAttribute('data-dialog');
    }

    static animateClose(dialog: HTMLDialogElement, returnValue?: string) {
        if (dialog.hasAttribute('data-closing')) return;
        dialog.setAttribute('data-closing', '');

        // getAnimations() lance la transition de data-closing ; allSettled : ferme aussi si elle est interrompue
        Promise.allSettled(dialog.getAnimations().map(animation => animation.finished)).then(() => {
            // Déjà fermé autrement pendant l'animation (close(), form method="dialog")
            if (dialog.hasAttribute('data-closing')) dialog.close(returnValue);
        });
    }

    // Échap, clic à côté (closedby="any"), command="request-close", requestClose()
    static onCancel(event: Event) {
        if (!Dialog.isDialog(event.target)) return;
        // Non annulable : le navigateur ferme d'un coup, onClose fait le ménage
        if (!event.cancelable) return;

        event.preventDefault();
        Dialog.animateClose(event.target);
    }

    // command="close" : le navigateur ferme sans passer par cancel
    static onCommand(event: Event) {
        const {command, source} = event as CommandEvent;
        if (command !== 'close' || !Dialog.isDialog(event.target) || !event.target.open) return;

        event.preventDefault();
        // value du bouton : lue ensuite dans returnValue, comme en natif
        Dialog.animateClose(event.target, source?.hasAttribute('value') ? source.value : undefined);
    }

    // Fermé, aussi d'un coup : sans data-closing, la prochaine ouverture s'anime normalement
    static onClose(event: Event) {
        if (Dialog.isDialog(event.target)) event.target.removeAttribute('data-closing');
    }

    // Le fond d'un dialogue modal fait partie du dialogue : un point hors de son cadre est sur le fond
    // Seulement les modaux : un dialogue non modal n'a pas de fond, « à côté » serait toute la page
    static outsideDialog(event: PointerEvent): HTMLDialogElement | null {
        const dialog = event.target;
        if (!(dialog instanceof HTMLDialogElement) || dialog.getAttribute('closedby') !== 'any' || !dialog.matches(':modal')) return null;

        const rect = dialog.getBoundingClientRect();
        const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
        return inside ? null : dialog;
    }

    static onPointerDown(event: PointerEvent) {
        Dialog.pressedOutside = Dialog.outsideDialog(event);
    }

    // Appui et relâché sur le fond, comme le natif : une sélection de texte lâchée sur le fond ne ferme pas
    // Le défilement au doigt annule le pointeur (pas de pointerup) : il ne ferme pas non plus
    // requestClose() passe par cancel : la fermeture s'anime comme avec Échap
    static onPointerUp(event: PointerEvent) {
        const dialog = Dialog.outsideDialog(event);
        if (dialog && dialog === Dialog.pressedOutside) dialog.requestClose();
        Dialog.pressedOutside = null;
    }
}

// Démarré au chargement du fichier : le site n'écrit que data-dialog, sans JS
Dialog.start();
