class Dropdown {
  static _animating = /* @__PURE__ */ new WeakMap();
  static _reposition = /* @__PURE__ */ new WeakMap();
  static _openDropdowns = /* @__PURE__ */ new Set();
  static _observer = null;
  constructor() {
    if (Dropdown.initialized) return;
    Dropdown.initialized = true;
    Dropdown.init();
    Dropdown.observe();
    document.addEventListener("click", Dropdown.onClick);
  }
  static init() {
    document.querySelectorAll('[data-ui="dropdown"]').forEach(Dropdown.initButton);
  }
  static initButton(button) {
    const selector = button.getAttribute("data-target");
    if (!selector) return;
    if (!button.closest(".dropdown")) return;
    const dropdown = document.getElementById(selector.replace(/^#/, ""));
    if (!dropdown) return;
    button.setAttribute("aria-controls", dropdown.id);
    button.setAttribute("aria-expanded", Dropdown.isOpen(dropdown) ? "true" : "false");
  }
  static observe() {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", Dropdown.observe, { once: true });
      return;
    }
    Dropdown._observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches('[data-ui="dropdown"]')) {
            Dropdown.initButton(node);
            continue;
          }
          node.querySelectorAll?.('[data-ui="dropdown"]').forEach(Dropdown.initButton);
        }
      }
    });
    Dropdown._observer.observe(document.body, { childList: true, subtree: true });
  }
  static onClick(event) {
    const button = event.target.closest('[data-ui="dropdown"]');
    if (button) {
      if (!button.closest(".dropdown")) return;
      const selector = button.getAttribute("data-target");
      if (!selector) return;
      const dropdown = document.getElementById(selector.replace(/^#/, ""));
      if (!dropdown) return;
      Dropdown.closeAllDropdowns(button);
      Dropdown.toggleDropdown(dropdown, button);
      return;
    }
    if (event.target.closest(".dropdown-body")) return;
    Dropdown.closeAllDropdowns();
  }
  static toggleDropdown(dropdown, button) {
    Dropdown.isOpen(dropdown) ? Dropdown.closeDropdown(dropdown, button) : Dropdown.openDropdown(dropdown, button);
  }
  static isOpen(dropdown) {
    return dropdown.classList.contains("is-open");
  }
  static updateTriggers(dropdown, expanded) {
    document.querySelectorAll(`[data-ui="dropdown"][data-target="#${dropdown.id}"]`).forEach((btn) => btn.setAttribute("aria-expanded", expanded ? "true" : "false"));
  }
  static openDropdown(dropdown, button) {
    if (Dropdown.isOpen(dropdown)) return;
    if (Dropdown._animating.has(dropdown)) return;
    const canOpen = dropdown.dispatchEvent(new CustomEvent("dropdown:beforeOpen", {
      bubbles: true,
      cancelable: true,
      detail: { dropdown, button }
    }));
    if (!canOpen) return;
    dropdown.classList.remove("is-closing");
    dropdown.classList.add("is-open");
    Dropdown.updateTriggers(dropdown, true);
    Dropdown._animating.set(dropdown, true);
    const wrapper = button.closest(".dropdown");
    if (!wrapper) return;
    if (!wrapper.dataset.dropOrigin) {
      wrapper.dataset.dropOrigin = wrapper.dataset.drop ?? "bottom";
      wrapper.dataset.dropAlignOrigin = wrapper.dataset.dropAlign ?? "start";
    }
    const checkViewport = () => {
      const buttonRect = button.getBoundingClientRect();
      const dropdownWidth = dropdown.offsetWidth;
      const dropdownHeight = dropdown.offsetHeight;
      const spaceAbove = buttonRect.top;
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const preference = wrapper.dataset.dropOrigin ?? "bottom";
      if (preference === "top") {
        if (spaceAbove >= dropdownHeight) wrapper.dataset.drop = "top";
        else if (spaceBelow >= dropdownHeight) wrapper.dataset.drop = "bottom";
      } else {
        if (spaceBelow >= dropdownHeight) wrapper.dataset.drop = "bottom";
        else if (spaceAbove >= dropdownHeight) wrapper.dataset.drop = "top";
      }
      const alignPreference = wrapper.dataset.dropAlignOrigin ?? "start";
      const endOutsideFits = buttonRect.right + dropdownWidth <= window.innerWidth;
      const startOutsideFits = buttonRect.left - dropdownWidth >= 0;
      const startFits = window.innerWidth - buttonRect.left >= dropdownWidth;
      const endFits = buttonRect.right >= dropdownWidth;
      const centerFits = buttonRect.left + buttonRect.width / 2 - dropdownWidth / 2 >= 0 && buttonRect.left + buttonRect.width / 2 + dropdownWidth / 2 <= window.innerWidth;
      if (alignPreference === "start") {
        if (startFits) wrapper.dataset.dropAlign = "start";
        else if (centerFits) wrapper.dataset.dropAlign = "center";
        else if (endFits) wrapper.dataset.dropAlign = "end";
      } else if (alignPreference === "end") {
        if (endFits) wrapper.dataset.dropAlign = "end";
        else if (centerFits) wrapper.dataset.dropAlign = "center";
        else if (startFits) wrapper.dataset.dropAlign = "start";
      } else if (alignPreference === "center") {
        if (centerFits) wrapper.dataset.dropAlign = "center";
        else if (startFits) wrapper.dataset.dropAlign = "start";
        else if (endFits) wrapper.dataset.dropAlign = "end";
      } else if (alignPreference === "end-outside") {
        if (endOutsideFits) wrapper.dataset.dropAlign = "end-outside";
        else if (startOutsideFits) wrapper.dataset.dropAlign = "start-outside";
        else if (endFits) wrapper.dataset.dropAlign = "end";
        else if (centerFits) wrapper.dataset.dropAlign = "center";
        else if (startFits) wrapper.dataset.dropAlign = "start";
      } else if (alignPreference === "start-outside") {
        if (startOutsideFits) wrapper.dataset.dropAlign = "start-outside";
        else if (endOutsideFits) wrapper.dataset.dropAlign = "end-outside";
        else if (startFits) wrapper.dataset.dropAlign = "start";
        else if (centerFits) wrapper.dataset.dropAlign = "center";
        else if (endFits) wrapper.dataset.dropAlign = "end";
      }
    };
    Dropdown._reposition.set(dropdown, checkViewport);
    window.addEventListener("scroll", checkViewport, { passive: true });
    window.addEventListener("resize", checkViewport, { passive: true });
    Dropdown._openDropdowns.forEach((entry) => {
      if (entry.dropdown === dropdown) Dropdown._openDropdowns.delete(entry);
    });
    Dropdown._openDropdowns.add({ dropdown, button });
    requestAnimationFrame(() => {
      checkViewport();
      Dropdown._animating.delete(dropdown);
      dropdown.dispatchEvent(new CustomEvent("dropdown:afterOpen", {
        bubbles: true,
        detail: { dropdown, button }
      }));
    });
  }
  static closeDropdown(dropdown, button) {
    if (!Dropdown.isOpen(dropdown)) return;
    if (Dropdown._animating.has(dropdown)) return;
    const canClose = dropdown.dispatchEvent(new CustomEvent("dropdown:beforeClose", {
      bubbles: true,
      cancelable: true,
      detail: { dropdown, button }
    }));
    if (!canClose) return;
    Dropdown.updateTriggers(dropdown, false);
    const checkViewport = Dropdown._reposition.get(dropdown);
    if (checkViewport) {
      window.removeEventListener("scroll", checkViewport);
      window.removeEventListener("resize", checkViewport);
      Dropdown._reposition.delete(dropdown);
    }
    Dropdown._openDropdowns.forEach((entry) => {
      if (entry.dropdown === dropdown) Dropdown._openDropdowns.delete(entry);
    });
    dropdown.classList.add("is-closing");
    Dropdown._animating.set(dropdown, true);
    const wrapper = button.closest(".dropdown");
    const cleanup = () => {
      dropdown.classList.remove("is-open", "is-closing");
      Dropdown._animating.delete(dropdown);
      if (wrapper) {
        wrapper.dataset.drop = wrapper.dataset.dropOrigin;
        wrapper.dataset.dropAlign = wrapper.dataset.dropAlignOrigin;
        delete wrapper.dataset.dropOrigin;
        delete wrapper.dataset.dropAlignOrigin;
      }
      dropdown.dispatchEvent(new CustomEvent("dropdown:afterClose", {
        bubbles: true,
        detail: { dropdown, button }
      }));
    };
    const duration = Math.max(
      0,
      ...window.getComputedStyle(dropdown).transitionDuration.split(",").map((d) => parseFloat(d) * 1e3)
    );
    if (!duration) {
      cleanup();
      return;
    }
    const safetyTimer = setTimeout(cleanup, duration + 100);
    dropdown.addEventListener("transitionend", (event) => {
      if (event.target !== dropdown) return;
      clearTimeout(safetyTimer);
      cleanup();
    }, { once: true });
  }
  static closeAllDropdowns(exception = null) {
    [...Dropdown._openDropdowns].forEach(({ dropdown, button }) => {
      if (button === exception) return;
      Dropdown.closeDropdown(dropdown, button);
    });
  }
  static destroy() {
    [...Dropdown._openDropdowns].forEach(({ dropdown }) => {
      const checkViewport = Dropdown._reposition.get(dropdown);
      if (checkViewport) {
        window.removeEventListener("scroll", checkViewport);
        window.removeEventListener("resize", checkViewport);
        Dropdown._reposition.delete(dropdown);
      }
    });
    document.removeEventListener("click", Dropdown.onClick);
    Dropdown._observer?.disconnect();
    Dropdown._observer = null;
    Dropdown.initialized = false;
    Dropdown._openDropdowns.clear();
  }
}
export {
  Dropdown as default
};
