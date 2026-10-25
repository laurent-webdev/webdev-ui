// src/ts/components/drawer.ts
function isDrawer(element) {
  return element instanceof HTMLDialogElement && element.hasAttribute("data-drawer");
}
function slideClose(drawer, returnValue) {
  if (drawer.hasAttribute("data-closing")) return;
  drawer.setAttribute("data-closing", "");
  Promise.allSettled(drawer.getAnimations().map((animation) => animation.finished)).then(() => {
    if (drawer.hasAttribute("data-closing")) drawer.close(returnValue);
  });
}
document.addEventListener("cancel", (event) => {
  if (!isDrawer(event.target)) return;
  if (!event.cancelable) return;
  event.preventDefault();
  slideClose(event.target);
}, true);
document.addEventListener("command", (event) => {
  const { command, source } = event;
  if (command !== "close" || !isDrawer(event.target) || !event.target.open) return;
  event.preventDefault();
  slideClose(event.target, source?.hasAttribute("value") ? source.value : void 0);
}, true);
document.addEventListener("close", (event) => {
  if (isDrawer(event.target)) event.target.removeAttribute("data-closing");
}, true);
