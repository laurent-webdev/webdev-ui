class Collapse {
  static _animating = /* @__PURE__ */ new WeakMap();
  static _counter = 0;
  constructor() {
    if (Collapse.initialized) return;
    Collapse.initialized = true;
    Collapse._observer = null;
    Collapse.init();
    Collapse.observe();
    document.addEventListener("click", Collapse.onClick);
  }
  static init() {
    document.querySelectorAll('[data-ui="collapse"]').forEach(Collapse.initButton);
  }
  static initButton(button) {
    const selector = button.getAttribute("data-target");
    if (!selector) return;
    const panel = document.getElementById(selector.replace(/^#/, ""));
    if (!panel) return;
    button.setAttribute("aria-controls", panel.id);
    if (!button.id) {
      button.id = `collapse-button-${++Collapse._counter}`;
    }
    panel.setAttribute("aria-labelledby", button.id);
    const isOpen = panel.classList.contains("is-open");
    button.setAttribute("aria-expanded", isOpen ? "true" : "false");
    button.classList.toggle("is-open", isOpen);
    const indicator = button.querySelector(".accordion-indicator, .collapse-indicator");
    if (indicator) {
      indicator.classList.add("no-transition");
      requestAnimationFrame(() => indicator.classList.remove("no-transition"));
    }
  }
  static observe() {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", Collapse.observe, { once: true });
      return;
    }
    Collapse._observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches('[data-ui="collapse"]')) {
            Collapse.initButton(node);
            continue;
          }
          node.querySelectorAll?.('[data-ui="collapse"]').forEach(Collapse.initButton);
        }
      }
    });
    Collapse._observer.observe(document.body, { childList: true, subtree: true });
  }
  static onClick(event) {
    const button = event.target.closest('[data-ui="collapse"]');
    if (!button) return;
    const selector = button.getAttribute("data-target");
    if (!selector) return;
    const panel = document.getElementById(selector.replace(/^#/, ""));
    if (!panel) return;
    Collapse.toggle(panel, button);
  }
  static toggle(panel, button) {
    if (!panel) return;
    panel.classList.contains("is-open") ? Collapse.close(panel, button) : Collapse.open(panel, button);
  }
  static open(panel, button) {
    if (Collapse._animating.has(panel)) return;
    const canOpen = panel.dispatchEvent(new CustomEvent("collapse:beforeOpen", {
      bubbles: true,
      cancelable: true,
      detail: { panel, button }
    }));
    if (!canOpen) return;
    Collapse.handleAccordion(button);
    button.setAttribute("aria-expanded", "true");
    button.classList.add("is-open");
    panel.classList.add("is-open");
    const height = panel.scrollHeight;
    Collapse._animating.set(panel, true);
    panel.getAnimations().forEach((a) => a.cancel());
    panel.style.overflow = "hidden";
    panel.style.height = "0px";
    const animation = panel.animate(
      [{ height: "0px" }, { height: `${height}px` }],
      { duration: 200, easing: "ease" }
    );
    animation.onfinish = () => {
      panel.style.height = "auto";
      panel.style.removeProperty("overflow");
      Collapse._animating.delete(panel);
      panel.dispatchEvent(new CustomEvent("collapse:afterOpen", {
        bubbles: true,
        detail: { panel, button }
      }));
    };
    animation.oncancel = () => {
      Collapse._animating.delete(panel);
    };
  }
  static close(panel, button) {
    if (Collapse._animating.has(panel)) return;
    const canClose = panel.dispatchEvent(new CustomEvent("collapse:beforeClose", {
      bubbles: true,
      cancelable: true,
      detail: { panel, button }
    }));
    if (!canClose) return;
    button.setAttribute("aria-expanded", "false");
    button.classList.add("is-closing");
    Collapse._animating.set(panel, true);
    panel.getAnimations().forEach((a) => a.cancel());
    const height = panel.getBoundingClientRect().height;
    panel.style.overflow = "hidden";
    const animation = panel.animate(
      [{ height: `${height}px` }, { height: "0px" }],
      { duration: 200, easing: "ease" }
    );
    animation.onfinish = () => {
      button.classList.remove("is-open", "is-closing");
      panel.classList.remove("is-open");
      panel.style.removeProperty("overflow");
      panel.style.removeProperty("height");
      Collapse._animating.delete(panel);
      panel.dispatchEvent(new CustomEvent("collapse:afterClose", {
        bubbles: true,
        detail: { panel, button }
      }));
    };
    animation.oncancel = () => {
      button.classList.remove("is-open", "is-closing");
      panel.classList.remove("is-open");
      panel.style.removeProperty("overflow");
      panel.style.removeProperty("height");
      Collapse._animating.delete(panel);
    };
  }
  static handleAccordion(button) {
    const accordion = button.closest('[data-ui="accordion"]');
    if (!accordion) return;
    if (accordion.dataset.type !== "single") return;
    accordion.querySelectorAll('[data-ui="collapse"]').forEach((btn) => {
      if (btn === button) return;
      const selector = btn.getAttribute("data-target");
      if (!selector) return;
      const panel = document.getElementById(selector.replace(/^#/, ""));
      if (!panel || !panel.classList.contains("is-open")) return;
      Collapse.close(panel, btn);
    });
  }
  static destroy() {
    document.removeEventListener("click", Collapse.onClick);
    Collapse._observer?.disconnect();
    Collapse._observer = null;
    Collapse.initialized = false;
  }
}
export {
  Collapse as default
};
