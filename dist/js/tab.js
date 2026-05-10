class Tab {
  static _observer = null;
  static _counter = 0;
  constructor() {
    if (Tab.initialized) return;
    Tab.initialized = true;
    Tab.init();
    Tab.observe();
    document.addEventListener("click", Tab.onClick);
    document.addEventListener("keydown", Tab.onKeydown);
  }
  static init() {
    document.querySelectorAll('[data-ui="tab"]').forEach(Tab.initTab);
  }
  static initTab(root) {
    const nav = root.querySelector('[role="tablist"]');
    const buttons = nav ? Array.from(nav.querySelectorAll("button")) : [];
    if (!buttons.length) return;
    buttons.forEach((button) => {
      const selector2 = button.getAttribute("data-target");
      if (!selector2) return;
      const panel2 = document.getElementById(selector2.replace(/^#/, ""));
      if (!panel2) return;
      if (!button.id) {
        button.id = `tab-button-${++Tab._counter}`;
      }
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", panel2.id);
      button.setAttribute("aria-selected", "false");
      button.setAttribute("tabindex", "-1");
      panel2.setAttribute("role", "tabpanel");
      panel2.setAttribute("tabindex", "0");
      panel2.setAttribute("aria-labelledby", button.id);
      panel2.classList.remove("is-open");
    });
    const activeButton = buttons.find((btn) => btn.classList.contains("active")) ?? buttons[0];
    const selector = activeButton.getAttribute("data-target");
    if (!selector) return;
    const panel = document.getElementById(selector.replace(/^#/, ""));
    if (!panel) return;
    Tab.resetButtons(buttons);
    Tab.resetPanels(root.querySelectorAll('[data-ui="tab-panel"]'));
    Tab.show(activeButton, panel, buttons, root.querySelectorAll('[data-ui="tab-panel"]'), true);
  }
  static observe() {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", Tab.observe, { once: true });
      return;
    }
    Tab._observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches('[data-ui="tab"]')) {
            Tab.initTab(node);
            continue;
          }
          node.querySelectorAll?.('[data-ui="tab"]').forEach(Tab.initTab);
        }
      }
    });
    Tab._observer.observe(document.body, { childList: true, subtree: true });
  }
  static onClick(event) {
    const button = event.target.closest('[data-ui="tab"] button');
    if (!button) return;
    const root = button.closest('[data-ui="tab"]');
    if (!root) return;
    const nav = button.closest('[role="tablist"]');
    const buttons = nav.querySelectorAll("button");
    const panels = root.querySelectorAll('[data-ui="tab-panel"]');
    const selector = button.getAttribute("data-target");
    if (!selector) return;
    const panel = document.getElementById(selector.replace(/^#/, ""));
    if (!panel) return;
    Tab.show(button, panel, buttons, panels);
  }
  static onKeydown(event) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const button = event.target.closest('[data-ui="tab"] button');
    if (!button) return;
    const nav = button.closest('[role="tablist"]');
    const buttons = Array.from(nav.querySelectorAll("button"));
    const index = buttons.indexOf(button);
    const targets = {
      ArrowLeft: buttons[index - 1] ?? buttons[buttons.length - 1],
      ArrowRight: buttons[index + 1] ?? buttons[0],
      Home: buttons[0],
      End: buttons[buttons.length - 1]
    };
    const target = targets[event.key];
    if (!target) return;
    event.preventDefault();
    target.click();
    target.focus();
  }
  static resetButtons(buttons) {
    buttons.forEach((btn) => {
      btn.classList.remove("active");
      btn.setAttribute("aria-selected", "false");
      btn.setAttribute("tabindex", "-1");
    });
  }
  static resetPanels(panels) {
    panels.forEach((panel) => panel.classList.remove("is-open"));
  }
  // FIX : reset après canShow pour éviter un état vide si l'événement est annulé
  static show(button, panel, buttons = [], panels = [], first = false) {
    const canShow = panel.dispatchEvent(new CustomEvent("tab:beforeShow", {
      bubbles: true,
      cancelable: true,
      detail: { button, panel }
    }));
    if (!canShow) return;
    Tab.resetButtons(buttons);
    Tab.resetPanels(panels);
    button.classList.add("active");
    button.setAttribute("aria-selected", "true");
    button.setAttribute("tabindex", "0");
    panel.classList.add("is-open");
    if (!first) {
      panel.classList.add("anim-fade-in", "anim-200");
      panel.addEventListener("animationend", () => {
        panel.classList.remove("anim-fade-in", "anim-200");
      }, { once: true });
    }
    panel.dispatchEvent(new CustomEvent("tab:afterShow", {
      bubbles: true,
      detail: { button, panel }
    }));
  }
  static destroy() {
    document.removeEventListener("click", Tab.onClick);
    document.removeEventListener("keydown", Tab.onKeydown);
    Tab._observer?.disconnect();
    Tab._observer = null;
    Tab.initialized = false;
  }
}
export {
  Tab as default
};
