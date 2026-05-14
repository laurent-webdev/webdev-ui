class Drawer {
  static _animating = /* @__PURE__ */ new WeakMap();
  static _observer = null;
  static _counter = 0;
  constructor() {
    if (Drawer.initialized) return;
    Drawer.initialized = true;
    Drawer.init();
    Drawer.observe();
    document.addEventListener("click", Drawer.onClick);
  }
  static init() {
    const drawers = document.querySelectorAll(".drawer");
    drawers.forEach((drawer) => drawer.classList.add("no-transition"));
    document.body.classList.add("no-transition");
    document.querySelectorAll('[data-ui="drawer"]').forEach(Drawer.initButton);
    requestAnimationFrame(() => {
      drawers.forEach((drawer) => drawer.classList.remove("no-transition"));
      document.body.classList.remove("no-transition");
    });
  }
  static initButton(button) {
    const selector = button.getAttribute("data-target");
    if (!selector) return;
    const drawer = document.getElementById(selector.replace(/^#/, ""));
    if (!drawer) return;
    if (!button.id) {
      button.id = `drawer-button-${++Drawer._counter}`;
    }
    button.setAttribute("aria-controls", drawer.id);
    button.setAttribute("aria-expanded", Drawer.isOpen(drawer) ? "true" : "false");
    drawer.setAttribute("aria-labelledby", button.id);
  }
  static observe() {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", Drawer.observe, { once: true });
      return;
    }
    Drawer._observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches('[data-ui="drawer"]')) {
            Drawer.initButton(node);
            continue;
          }
          node.querySelectorAll?.('[data-ui="drawer"]').forEach(Drawer.initButton);
        }
      }
    });
    Drawer._observer.observe(document.body, { childList: true, subtree: true });
  }
  static onClick(event) {
    const backdrop = event.target.closest(".drawer-backdrop");
    if (backdrop) {
      const drawerId = backdrop.dataset.for;
      const drawer2 = document.getElementById(drawerId);
      const button2 = drawer2 ? document.querySelector(`[data-ui="drawer"][data-target="#${drawerId}"]`) : null;
      if (drawer2 && button2) Drawer.close(drawer2, button2);
      return;
    }
    const button = event.target.closest('[data-ui="drawer"]');
    if (!button) return;
    const selector = button.getAttribute("data-target");
    if (!selector) return;
    const drawer = document.getElementById(selector.replace(/^#/, ""));
    if (!drawer) return;
    Drawer.toggle(drawer, button);
  }
  static toggle(drawer, button) {
    if (Drawer.isFixed(drawer)) return;
    Drawer.isOpen(drawer) ? Drawer.close(drawer, button) : Drawer.open(drawer, button);
  }
  static isOpen(drawer) {
    return drawer.classList.contains("is-open");
  }
  static isFixed(drawer) {
    if (drawer.classList.contains("drawer-fixed")) return true;
    for (const cls of drawer.classList) {
      const match = cls.match(/^drawer-fixed-(.+)$/);
      if (!match) continue;
      const bp = match[1];
      const value = getComputedStyle(document.documentElement).getPropertyValue(`--breakpoint-${bp}`)?.trim();
      if (value && window.matchMedia(`(min-width: ${value})`).matches) return true;
    }
    return false;
  }
  static open(drawer, button) {
    if (Drawer.isOpen(drawer)) return;
    if (Drawer._animating.has(drawer)) return;
    const canOpen = drawer.dispatchEvent(new CustomEvent("drawer:beforeOpen", {
      bubbles: true,
      cancelable: true,
      detail: { drawer, button }
    }));
    if (!canOpen) return;
    Drawer._animating.set(drawer, true);
    const zDrawer = parseInt(getComputedStyle(drawer).getPropertyValue("--drawer-z-index")) || 1100;
    drawer.style.zIndex = zDrawer + 10;
    if (!Drawer.isFixed(drawer)) {
      const backdrop = document.createElement("div");
      backdrop.className = "drawer-backdrop";
      backdrop.dataset.for = drawer.id;
      document.body.appendChild(backdrop);
      const zBackdrop = parseInt(getComputedStyle(backdrop).getPropertyValue("--drawer-z-index")) || 1100;
      backdrop.style.zIndex = zBackdrop + 5;
    }
    drawer.classList.add("is-open");
    Drawer.updateTriggers(drawer, true);
    const computed = window.getComputedStyle(drawer);
    const duration = Math.max(
      0,
      ...computed.transitionDuration.split(",").map((d) => parseFloat(d) * 1e3)
    );
    const afterOpen = () => {
      Drawer._animating.delete(drawer);
      drawer.dispatchEvent(new CustomEvent("drawer:afterOpen", {
        bubbles: true,
        detail: { drawer, button }
      }));
    };
    if (!duration) {
      afterOpen();
      return;
    }
    const safetyTimer = setTimeout(afterOpen, duration + 100);
    drawer.addEventListener("transitionend", (event) => {
      if (event.target !== drawer) return;
      clearTimeout(safetyTimer);
      afterOpen();
    }, { once: true });
  }
  static updateTriggers(drawer, expanded) {
    document.querySelectorAll(`[data-ui="drawer"][data-target="#${drawer.id}"]`).forEach((btn) => btn.setAttribute("aria-expanded", expanded ? "true" : "false"));
  }
  static close(drawer, button) {
    if (!Drawer.isOpen(drawer)) return;
    if (Drawer._animating.has(drawer)) return;
    const canClose = drawer.dispatchEvent(new CustomEvent("drawer:beforeClose", {
      bubbles: true,
      cancelable: true,
      detail: { drawer, button }
    }));
    if (!canClose) return;
    Drawer._animating.set(drawer, true);
    drawer.classList.add("is-closing");
    drawer.classList.remove("is-open");
    Drawer.updateTriggers(drawer, false);
    const backdrop = document.querySelector(`.drawer-backdrop[data-for="${drawer.id}"]`);
    if (backdrop) backdrop.classList.add("is-closing");
    const computed = window.getComputedStyle(drawer);
    const duration = Math.max(
      0,
      ...computed.transitionDuration.split(",").map((d) => parseFloat(d) * 1e3)
    );
    const cleanup = () => {
      drawer.classList.remove("is-closing");
      drawer.style.zIndex = "";
      Drawer._animating.delete(drawer);
      backdrop?.remove();
      drawer.dispatchEvent(new CustomEvent("drawer:afterClose", {
        bubbles: true,
        detail: { drawer, button }
      }));
    };
    if (!duration) {
      cleanup();
      return;
    }
    const safetyTimer = setTimeout(cleanup, duration + 100);
    drawer.addEventListener("transitionend", (event) => {
      if (event.target !== drawer) return;
      clearTimeout(safetyTimer);
      cleanup();
    }, { once: true });
  }
  static destroy() {
    document.querySelectorAll(".drawer-backdrop").forEach((b) => b.remove());
    document.querySelectorAll(".drawer.is-open, .drawer.is-closing").forEach((drawer) => {
      drawer.classList.remove("is-open", "is-closing");
    });
    document.removeEventListener("click", Drawer.onClick);
    Drawer._observer?.disconnect();
    Drawer._observer = null;
    Drawer.initialized = false;
  }
}
export {
  Drawer as default
};
