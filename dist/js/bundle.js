// src/ts/components/drawer.ts
var Drawer = class _Drawer {
  // cancel, command et close ne remontent pas : écoutés en capture sur document, pour tous les drawers de la page
  // Le navigateur n'ajoute pas deux fois le même écouteur : un second start() ne double rien
  static start() {
    document.addEventListener("cancel", _Drawer.onCancel, true);
    document.addEventListener("command", _Drawer.onCommand, true);
    document.addEventListener("close", _Drawer.onClose, true);
  }
  static isDrawer(element) {
    return element instanceof HTMLDialogElement && element.hasAttribute("data-drawer");
  }
  static slideClose(drawer, returnValue) {
    if (drawer.hasAttribute("data-closing")) return;
    drawer.setAttribute("data-closing", "");
    Promise.allSettled(drawer.getAnimations().map((animation) => animation.finished)).then(() => {
      if (drawer.hasAttribute("data-closing")) drawer.close(returnValue);
    });
  }
  // Échap, clic à côté (closedby="any"), command="request-close", requestClose()
  static onCancel(event) {
    if (!_Drawer.isDrawer(event.target)) return;
    if (!event.cancelable) return;
    event.preventDefault();
    _Drawer.slideClose(event.target);
  }
  // command="close" : le navigateur ferme sans passer par cancel
  static onCommand(event) {
    const { command, source } = event;
    if (command !== "close" || !_Drawer.isDrawer(event.target) || !event.target.open) return;
    event.preventDefault();
    _Drawer.slideClose(event.target, source?.hasAttribute("value") ? source.value : void 0);
  }
  // Fermé, aussi d'un coup : sans data-closing, la prochaine ouverture glisse depuis le bord
  static onClose(event) {
    if (_Drawer.isDrawer(event.target)) event.target.removeAttribute("data-closing");
  }
};
Drawer.start();
