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
