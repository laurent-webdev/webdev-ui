// Onglets (motif « Tabs » de l'ARIA APG) : un clic ou les flèches choisissent un onglet, son panneau s'affiche
// Le HTML porte déjà l'état (aria-selected, tabindex, hidden) : le JS ne fait que le changer

export default class Tab {

    // Délégués sur document : marche aussi pour les onglets ajoutés plus tard dans la page
    // Le navigateur n'ajoute pas deux fois le même écouteur : un second start() ne double rien
    static start() {
        document.addEventListener('click', Tab.onClick);
        document.addEventListener('keydown', Tab.onKeydown);
    }

    // L'onglet visé, s'il est dans une rangée data-tab
    static getTab(target: EventTarget | null) {
        return target instanceof Element ? target.closest<HTMLButtonElement>('[data-tab] [role="tab"]') : null;
    }

    // Choisit un onglet : true s'il est choisi, false si le site a refusé le changement
    static select(tab: HTMLButtonElement) {
        if (tab.getAttribute('aria-selected') === 'true') return true;

        // Toujours trouvée : getTab impose une rangée data-tab autour de l'onglet
        const tablist = tab.closest('[data-tab]') as HTMLElement;
        const previousTab = tablist.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]');

        // Annulable : le site peut garder l'onglet en cours (un formulaire pas enregistré…)
        const allowed = tablist.dispatchEvent(new CustomEvent('tab-beforechange', {bubbles: true, cancelable: true, detail: {tab, previousTab}}));
        if (!allowed) return false;

        tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]').forEach(item => {
            const selected = item === tab;
            item.setAttribute('aria-selected', String(selected));
            // Seul l'onglet choisi est dans l'ordre du Tab : les flèches mènent aux autres
            if (selected) item.removeAttribute('tabindex');
            else item.setAttribute('tabindex', '-1');

            const panel = document.getElementById(item.getAttribute('aria-controls') ?? '');
            if (panel) panel.hidden = !selected;
        });

        tablist.dispatchEvent(new CustomEvent('tab-change', {bubbles: true, detail: {tab, previousTab}}));
        return true;
    }

    static onClick(event: MouseEvent) {
        const tab = Tab.getTab(event.target);
        if (tab) Tab.select(tab);
    }

    // ← et → passent à l'onglet d'à côté (la rangée boucle), ↑ et ↓ aussi en vertical, Début et Fin au premier et au dernier ; l'onglet s'affiche aussitôt
    static onKeydown(event: KeyboardEvent) {
        const tab = Tab.getTab(event.target);
        // Alt + ← revient à la page précédente : les raccourcis du navigateur restent libres
        if (!tab || event.altKey || event.ctrlKey || event.metaKey) return;

        const tablist = tab.closest('[data-tab]') as HTMLElement;
        // Un onglet désactivé ne prend pas le focus : il est sauté
        const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'));
        const index = tabs.indexOf(tab);
        const previous = tabs[index - 1] ?? tabs[tabs.length - 1];
        const next = tabs[index + 1] ?? tabs[0];
        // En horizontal, ↑ et ↓ restent libres pour faire défiler la page
        const vertical = tablist.getAttribute('aria-orientation') === 'vertical';

        const targets: Record<string, HTMLButtonElement | undefined> = {
            ArrowLeft: previous,
            ArrowRight: next,
            ArrowUp: vertical ? previous : undefined,
            ArrowDown: vertical ? next : undefined,
            Home: tabs[0],
            End: tabs[tabs.length - 1],
        };
        const target = targets[event.key];
        if (!target) return;

        // Les flèches ne font pas défiler la rangée ni la page
        event.preventDefault();
        if (Tab.select(target)) target.focus();
    }
}

// Démarré au chargement du fichier : le site n'écrit que data-tab, sans JS
Tab.start();
