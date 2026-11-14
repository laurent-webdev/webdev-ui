// src/ts/components/dialog.ts
var Dialog = class _Dialog {
  // cancel, command et close ne remontent pas : écoutés en capture sur document, pour tous les dialogues de la page
  // Le navigateur n'ajoute pas deux fois le même écouteur : un second start() ne double rien
  static start() {
    document.addEventListener("cancel", _Dialog.onCancel, true);
    document.addEventListener("command", _Dialog.onCommand, true);
    document.addEventListener("close", _Dialog.onClose, true);
  }
  static isDialog(element) {
    return element instanceof HTMLDialogElement && element.hasAttribute("data-dialog");
  }
  static animateClose(dialog, returnValue) {
    if (dialog.hasAttribute("data-closing")) return;
    dialog.setAttribute("data-closing", "");
    Promise.allSettled(dialog.getAnimations().map((animation) => animation.finished)).then(() => {
      if (dialog.hasAttribute("data-closing")) dialog.close(returnValue);
    });
  }
  // Échap, clic à côté (closedby="any"), command="request-close", requestClose()
  static onCancel(event) {
    if (!_Dialog.isDialog(event.target)) return;
    if (!event.cancelable) return;
    event.preventDefault();
    _Dialog.animateClose(event.target);
  }
  // command="close" : le navigateur ferme sans passer par cancel
  static onCommand(event) {
    const { command, source } = event;
    if (command !== "close" || !_Dialog.isDialog(event.target) || !event.target.open) return;
    event.preventDefault();
    _Dialog.animateClose(event.target, source?.hasAttribute("value") ? source.value : void 0);
  }
  // Fermé, aussi d'un coup : sans data-closing, la prochaine ouverture s'anime normalement
  static onClose(event) {
    if (_Dialog.isDialog(event.target)) event.target.removeAttribute("data-closing");
  }
};
Dialog.start();

// src/ts/components/tab.ts
var Tab = class _Tab {
  // Délégués sur document : marche aussi pour les onglets ajoutés plus tard dans la page
  // Le navigateur n'ajoute pas deux fois le même écouteur : un second start() ne double rien
  static start() {
    document.addEventListener("click", _Tab.onClick);
    document.addEventListener("keydown", _Tab.onKeydown);
  }
  // L'onglet visé, s'il est dans une rangée data-tab
  static getTab(target) {
    return target instanceof Element ? target.closest('[data-tab] [role="tab"]') : null;
  }
  // Choisit un onglet : true s'il est choisi, false si le site a refusé le changement
  static select(tab) {
    if (tab.getAttribute("aria-selected") === "true") return true;
    const tablist = tab.closest("[data-tab]");
    const previousTab = tablist.querySelector('[role="tab"][aria-selected="true"]');
    const allowed = tablist.dispatchEvent(new CustomEvent("tab-beforechange", { bubbles: true, cancelable: true, detail: { tab, previousTab } }));
    if (!allowed) return false;
    tablist.querySelectorAll('[role="tab"]').forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      if (selected) item.removeAttribute("tabindex");
      else item.setAttribute("tabindex", "-1");
      const panel = document.getElementById(item.getAttribute("aria-controls") ?? "");
      if (panel) panel.hidden = !selected;
    });
    tablist.dispatchEvent(new CustomEvent("tab-change", { bubbles: true, detail: { tab, previousTab } }));
    return true;
  }
  static onClick(event) {
    const tab = _Tab.getTab(event.target);
    if (tab) _Tab.select(tab);
  }
  // ← et → passent à l'onglet d'à côté (la rangée boucle), ↑ et ↓ aussi en vertical, Début et Fin au premier et au dernier ; l'onglet s'affiche aussitôt
  static onKeydown(event) {
    const tab = _Tab.getTab(event.target);
    if (!tab || event.altKey || event.ctrlKey || event.metaKey) return;
    const tablist = tab.closest("[data-tab]");
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]:not(:disabled)'));
    const index = tabs.indexOf(tab);
    const previous = tabs[index - 1] ?? tabs[tabs.length - 1];
    const next = tabs[index + 1] ?? tabs[0];
    const vertical = tablist.getAttribute("aria-orientation") === "vertical";
    const targets = {
      ArrowLeft: previous,
      ArrowRight: next,
      ArrowUp: vertical ? previous : void 0,
      ArrowDown: vertical ? next : void 0,
      Home: tabs[0],
      End: tabs[tabs.length - 1]
    };
    const target = targets[event.key];
    if (!target) return;
    event.preventDefault();
    if (_Tab.select(target)) target.focus();
  }
};
Tab.start();
