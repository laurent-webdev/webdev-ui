// src/js/alert.js
var Alert = class _Alert {
  static _exitAnimations = ["alert-exit", "alert-auto"];
  constructor() {
    if (_Alert.initialized) return;
    _Alert.initialized = true;
    _Alert._observer = null;
    _Alert.init();
    _Alert.observe();
    document.addEventListener("animationend", _Alert.onAnimationEnd);
    document.addEventListener("click", _Alert.onClick);
  }
  static init() {
    document.querySelectorAll('[data-ui="alert"]').forEach(_Alert.enhance);
  }
  static onClick(event) {
    const btnClose = event.target.closest('[data-dismiss="alert"]');
    if (!btnClose) return;
    const alert = btnClose.closest('[data-ui="alert"]');
    if (!alert) return;
    _Alert.close(alert);
  }
  static onAnimationEnd(event) {
    const alert = event.target;
    if (!alert.matches('[data-ui="alert"]')) return;
    const isExitAnim = _Alert._exitAnimations.some((name) => event.animationName.includes(name));
    if (!isExitAnim) return;
    alert.dispatchEvent(new CustomEvent("alert:afterClose", {
      bubbles: true,
      detail: { alert }
    }));
    alert.remove();
  }
  static observe() {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", _Alert.observe, { once: true });
      return;
    }
    _Alert._observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches('[data-ui="alert"]')) {
            _Alert.enhance(node);
            continue;
          }
          node.querySelectorAll?.('[data-ui="alert"]').forEach(_Alert.enhance);
        }
      }
    });
    _Alert._observer.observe(document.body, { childList: true, subtree: true });
  }
  static enhance(alert) {
    if (alert.dataset.uiReady) return;
    alert.dataset.uiReady = "true";
    if (!alert.classList.contains("anim-alert-auto")) {
      alert.classList.add("anim-alert-enter");
    }
    const level = alert.dataset.level;
    alert.setAttribute("role", "alert");
    alert.setAttribute("aria-live", level === "error" ? "assertive" : "polite");
    alert.setAttribute("aria-atomic", "true");
    alert.querySelectorAll('[data-dismiss="alert"]').forEach((button) => {
      if (!button.hasAttribute("aria-label")) {
        button.setAttribute("aria-label", "Close");
      }
    });
    const duration = parseFloat(alert.dataset.duration);
    if (!isNaN(duration) && duration > 0) {
      setTimeout(() => {
        if (document.contains(alert)) _Alert.close(alert);
      }, duration);
    }
  }
  static close(alert) {
    if (alert.classList.contains("is-closing")) return;
    const canClose = alert.dispatchEvent(new CustomEvent("alert:beforeClose", {
      bubbles: true,
      cancelable: true,
      detail: { alert }
    }));
    if (!canClose) return;
    alert.classList.add("is-closing", "anim-alert-exit");
    alert.setAttribute("aria-hidden", "true");
  }
  static destroy() {
    document.removeEventListener("animationend", _Alert.onAnimationEnd);
    document.removeEventListener("click", _Alert.onClick);
    _Alert._observer?.disconnect();
    _Alert._observer = null;
    _Alert.initialized = false;
  }
};

// src/js/collapse.js
var Collapse = class _Collapse {
  static _animating = /* @__PURE__ */ new WeakMap();
  static _counter = 0;
  constructor() {
    if (_Collapse.initialized) return;
    _Collapse.initialized = true;
    _Collapse._observer = null;
    _Collapse.init();
    _Collapse.observe();
    document.addEventListener("click", _Collapse.onClick);
  }
  static init() {
    document.querySelectorAll('[data-ui="collapse"]').forEach(_Collapse.initButton);
  }
  static initButton(button) {
    const selector = button.getAttribute("data-target");
    if (!selector) return;
    const panel = document.getElementById(selector.replace(/^#/, ""));
    if (!panel) return;
    button.setAttribute("aria-controls", panel.id);
    if (!button.id) {
      button.id = `collapse-button-${++_Collapse._counter}`;
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
      document.addEventListener("DOMContentLoaded", _Collapse.observe, { once: true });
      return;
    }
    _Collapse._observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches('[data-ui="collapse"]')) {
            _Collapse.initButton(node);
            continue;
          }
          node.querySelectorAll?.('[data-ui="collapse"]').forEach(_Collapse.initButton);
        }
      }
    });
    _Collapse._observer.observe(document.body, { childList: true, subtree: true });
  }
  static onClick(event) {
    const button = event.target.closest('[data-ui="collapse"]');
    if (!button) return;
    const selector = button.getAttribute("data-target");
    if (!selector) return;
    const panel = document.getElementById(selector.replace(/^#/, ""));
    if (!panel) return;
    _Collapse.toggle(panel, button);
  }
  static toggle(panel, button) {
    if (!panel) return;
    panel.classList.contains("is-open") ? _Collapse.close(panel, button) : _Collapse.open(panel, button);
  }
  static open(panel, button) {
    if (_Collapse._animating.has(panel)) return;
    const canOpen = panel.dispatchEvent(new CustomEvent("collapse:beforeOpen", {
      bubbles: true,
      cancelable: true,
      detail: { panel, button }
    }));
    if (!canOpen) return;
    _Collapse.handleAccordion(button);
    button.setAttribute("aria-expanded", "true");
    button.classList.add("is-open");
    panel.classList.add("is-open");
    const height = panel.scrollHeight;
    _Collapse._animating.set(panel, true);
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
      _Collapse._animating.delete(panel);
      panel.dispatchEvent(new CustomEvent("collapse:afterOpen", {
        bubbles: true,
        detail: { panel, button }
      }));
    };
    animation.oncancel = () => {
      _Collapse._animating.delete(panel);
    };
  }
  static close(panel, button) {
    if (_Collapse._animating.has(panel)) return;
    const canClose = panel.dispatchEvent(new CustomEvent("collapse:beforeClose", {
      bubbles: true,
      cancelable: true,
      detail: { panel, button }
    }));
    if (!canClose) return;
    button.setAttribute("aria-expanded", "false");
    button.classList.add("is-closing");
    _Collapse._animating.set(panel, true);
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
      _Collapse._animating.delete(panel);
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
      _Collapse._animating.delete(panel);
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
      _Collapse.close(panel, btn);
    });
  }
  static destroy() {
    document.removeEventListener("click", _Collapse.onClick);
    _Collapse._observer?.disconnect();
    _Collapse._observer = null;
    _Collapse.initialized = false;
  }
};

// src/js/dialog.js
var Dialog = class _Dialog {
  static _animating = /* @__PURE__ */ new WeakMap();
  static _counter = 0;
  constructor() {
    if (_Dialog.initialized) return;
    _Dialog.initialized = true;
    _Dialog._observer = null;
    _Dialog.init();
    _Dialog.observe();
    document.addEventListener("click", _Dialog.onClick);
    document.addEventListener("keydown", _Dialog.onKeydown);
  }
  static init() {
    document.querySelectorAll('[data-ui="dialog"]').forEach(_Dialog.initButton);
  }
  static initButton(button) {
    const selector = button.getAttribute("data-target");
    if (!selector) return;
    const dialog = document.getElementById(selector.replace(/^#/, ""));
    if (!dialog) return;
    dialog.setAttribute("aria-modal", "true");
    const title = dialog.querySelector(".dialog-header");
    if (title) {
      if (!title.id) title.id = `dialog-title-${++_Dialog._counter}`;
      dialog.setAttribute("aria-labelledby", title.id);
    }
    dialog.querySelectorAll('[data-dismiss="dialog"]').forEach((btn) => {
      if (!btn.hasAttribute("aria-label")) btn.setAttribute("aria-label", "Close");
    });
  }
  static observe() {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", _Dialog.observe, { once: true });
      return;
    }
    _Dialog._observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches('[data-ui="dialog"]')) {
            _Dialog.initButton(node);
            continue;
          }
          node.querySelectorAll?.('[data-ui="dialog"]').forEach(_Dialog.initButton);
        }
      }
    });
    _Dialog._observer.observe(document.body, { childList: true, subtree: true });
  }
  static onClick(event) {
    const triggerBtn = event.target.closest('[data-ui="dialog"]');
    if (triggerBtn) {
      _Dialog.handleOpen(triggerBtn);
      return;
    }
    const closeBtn = event.target.closest('[data-dismiss="dialog"]');
    if (closeBtn) {
      const dialog2 = closeBtn.closest("dialog");
      if (dialog2) _Dialog.hide(dialog2);
    }
    const dialog = event.target.closest("dialog[open]");
    if (dialog && event.target === dialog) {
      _Dialog.hide(dialog);
    }
  }
  static onKeydown(event) {
    if (event.key !== "Escape") return;
    const dialogs = document.querySelectorAll("dialog[open]");
    const dialog = dialogs[dialogs.length - 1];
    if (!dialog) return;
    event.preventDefault();
    _Dialog.hide(dialog);
  }
  static handleOpen(button) {
    const selector = button.getAttribute("data-target");
    if (!selector) return;
    const dialog = document.querySelector(selector);
    if (!dialog || !(dialog instanceof HTMLDialogElement)) return;
    if (button.hasAttribute("data-dismiss")) {
      const currentDialog = button.closest("dialog");
      if (currentDialog && currentDialog !== dialog) {
        _Dialog.hide(currentDialog);
        currentDialog.addEventListener("dialog:afterClose", () => {
          _Dialog.open(dialog);
        }, { once: true });
        return;
      }
    }
    _Dialog.open(dialog);
  }
  static open(dialog) {
    if (dialog.open || _Dialog._animating.has(dialog)) return;
    const canOpen = dialog.dispatchEvent(new CustomEvent("dialog:beforeOpen", {
      bubbles: true,
      cancelable: true,
      detail: { dialog }
    }));
    if (!canOpen) return;
    _Dialog._animating.set(dialog, true);
    dialog.showModal();
    _Dialog.showBackdrop();
    void dialog.offsetHeight;
    dialog.classList.add("is-open");
    _Dialog.onTransitionEnd(dialog, () => {
      _Dialog._animating.delete(dialog);
      _Dialog.emit(dialog, "dialog:afterOpen");
    });
  }
  static hide(dialog) {
    if (!dialog.open || _Dialog._animating.has(dialog)) return;
    const canClose = dialog.dispatchEvent(new CustomEvent("dialog:beforeClose", {
      bubbles: true,
      cancelable: true,
      detail: { dialog }
    }));
    if (!canClose) return;
    _Dialog._animating.set(dialog, true);
    dialog.classList.add("is-closing");
    dialog.classList.remove("is-open");
    _Dialog.hideBackdrop();
    _Dialog.onTransitionEnd(dialog, () => {
      dialog.classList.remove("is-closing");
      dialog.close();
      _Dialog._animating.delete(dialog);
      _Dialog.emit(dialog, "dialog:afterClose");
    });
  }
  static getOrCreateBackdrop() {
    let backdrop = document.querySelector(".dialog-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "dialog-backdrop";
      document.body.appendChild(backdrop);
    }
    return backdrop;
  }
  static showBackdrop() {
    const backdrop = _Dialog.getOrCreateBackdrop();
    backdrop.classList.remove("is-closing");
    void backdrop.offsetHeight;
    backdrop.classList.add("is-open");
  }
  static hideBackdrop() {
    if (document.querySelectorAll("dialog[open]").length > 1) return;
    const backdrop = document.querySelector(".dialog-backdrop");
    if (!backdrop) return;
    backdrop.classList.add("is-closing");
    backdrop.classList.remove("is-open");
    _Dialog.onTransitionEnd(backdrop, () => {
      backdrop.classList.remove("is-closing");
    });
  }
  static onTransitionEnd(element, callback) {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      element.removeEventListener("transitionend", onEnd);
      callback();
    };
    const onEnd = (event) => {
      if (event.target !== element) return;
      finish();
    };
    const computed = window.getComputedStyle(element);
    const duration = Math.max(
      0,
      ...computed.transitionDuration.split(",").map((d) => parseFloat(d) * 1e3)
    );
    const timer = setTimeout(finish, duration + 50);
    if (duration === 0) {
      finish();
      return;
    }
    element.addEventListener("transitionend", onEnd);
  }
  static emit(target, name, cancelable = false) {
    return target.dispatchEvent(new CustomEvent(name, {
      detail: { dialog: target },
      bubbles: true,
      cancelable
    }));
  }
  static destroy() {
    document.removeEventListener("click", _Dialog.onClick);
    document.removeEventListener("keydown", _Dialog.onKeydown);
    _Dialog._observer?.disconnect();
    _Dialog._observer = null;
    _Dialog.initialized = false;
  }
};

// src/js/drawer.js
var Drawer = class _Drawer {
  static _animating = /* @__PURE__ */ new WeakMap();
  static _observer = null;
  static _counter = 0;
  constructor() {
    if (_Drawer.initialized) return;
    _Drawer.initialized = true;
    _Drawer.init();
    _Drawer.observe();
    document.addEventListener("click", _Drawer.onClick);
  }
  static init() {
    const drawers = document.querySelectorAll(".drawer");
    drawers.forEach((drawer) => drawer.classList.add("no-transition"));
    document.body.classList.add("no-transition");
    document.querySelectorAll('[data-ui="drawer"]').forEach(_Drawer.initButton);
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
      button.id = `drawer-button-${++_Drawer._counter}`;
    }
    button.setAttribute("aria-controls", drawer.id);
    button.setAttribute("aria-expanded", _Drawer.isOpen(drawer) ? "true" : "false");
    drawer.setAttribute("aria-labelledby", button.id);
  }
  static observe() {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", _Drawer.observe, { once: true });
      return;
    }
    _Drawer._observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches('[data-ui="drawer"]')) {
            _Drawer.initButton(node);
            continue;
          }
          node.querySelectorAll?.('[data-ui="drawer"]').forEach(_Drawer.initButton);
        }
      }
    });
    _Drawer._observer.observe(document.body, { childList: true, subtree: true });
  }
  static onClick(event) {
    const backdrop = event.target.closest(".drawer-backdrop");
    if (backdrop) {
      const drawerId = backdrop.dataset.for;
      const drawer2 = document.getElementById(drawerId);
      const button2 = drawer2 ? document.querySelector(`[data-ui="drawer"][data-target="#${drawerId}"]`) : null;
      if (drawer2 && button2) _Drawer.close(drawer2, button2);
      return;
    }
    const button = event.target.closest('[data-ui="drawer"]');
    if (!button) return;
    const selector = button.getAttribute("data-target");
    if (!selector) return;
    const drawer = document.getElementById(selector.replace(/^#/, ""));
    if (!drawer) return;
    _Drawer.toggle(drawer, button);
  }
  static toggle(drawer, button) {
    if (_Drawer.isFixed(drawer)) return;
    _Drawer.isOpen(drawer) ? _Drawer.close(drawer, button) : _Drawer.open(drawer, button);
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
    if (_Drawer.isOpen(drawer)) return;
    if (_Drawer._animating.has(drawer)) return;
    const canOpen = drawer.dispatchEvent(new CustomEvent("drawer:beforeOpen", {
      bubbles: true,
      cancelable: true,
      detail: { drawer, button }
    }));
    if (!canOpen) return;
    _Drawer._animating.set(drawer, true);
    const zDrawer = parseInt(getComputedStyle(drawer).getPropertyValue("--drawer-z-index")) || 1100;
    drawer.style.zIndex = zDrawer + 10;
    if (!_Drawer.isFixed(drawer)) {
      const backdrop = document.createElement("div");
      backdrop.className = "drawer-backdrop";
      backdrop.dataset.for = drawer.id;
      document.body.appendChild(backdrop);
      const zBackdrop = parseInt(getComputedStyle(backdrop).getPropertyValue("--drawer-z-index")) || 1100;
      backdrop.style.zIndex = zBackdrop + 5;
    }
    drawer.classList.add("is-open");
    _Drawer.updateTriggers(drawer, true);
    const computed = window.getComputedStyle(drawer);
    const duration = Math.max(
      0,
      ...computed.transitionDuration.split(",").map((d) => parseFloat(d) * 1e3)
    );
    const afterOpen = () => {
      _Drawer._animating.delete(drawer);
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
    if (!_Drawer.isOpen(drawer)) return;
    if (_Drawer._animating.has(drawer)) return;
    const canClose = drawer.dispatchEvent(new CustomEvent("drawer:beforeClose", {
      bubbles: true,
      cancelable: true,
      detail: { drawer, button }
    }));
    if (!canClose) return;
    _Drawer._animating.set(drawer, true);
    drawer.classList.add("is-closing");
    drawer.classList.remove("is-open");
    _Drawer.updateTriggers(drawer, false);
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
      _Drawer._animating.delete(drawer);
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
    document.removeEventListener("click", _Drawer.onClick);
    _Drawer._observer?.disconnect();
    _Drawer._observer = null;
    _Drawer.initialized = false;
  }
};

// src/js/dropdown.js
var Dropdown = class _Dropdown {
  static _animating = /* @__PURE__ */ new WeakMap();
  static _reposition = /* @__PURE__ */ new WeakMap();
  static _openDropdowns = /* @__PURE__ */ new Set();
  static _observer = null;
  constructor() {
    if (_Dropdown.initialized) return;
    _Dropdown.initialized = true;
    _Dropdown.init();
    _Dropdown.observe();
    document.addEventListener("click", _Dropdown.onClick);
  }
  static init() {
    document.querySelectorAll('[data-ui="dropdown"]').forEach(_Dropdown.initButton);
  }
  static initButton(button) {
    const selector = button.getAttribute("data-target");
    if (!selector) return;
    if (!button.closest(".dropdown")) return;
    const dropdown = document.getElementById(selector.replace(/^#/, ""));
    if (!dropdown) return;
    button.setAttribute("aria-controls", dropdown.id);
    button.setAttribute("aria-expanded", _Dropdown.isOpen(dropdown) ? "true" : "false");
  }
  static observe() {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", _Dropdown.observe, { once: true });
      return;
    }
    _Dropdown._observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches('[data-ui="dropdown"]')) {
            _Dropdown.initButton(node);
            continue;
          }
          node.querySelectorAll?.('[data-ui="dropdown"]').forEach(_Dropdown.initButton);
        }
      }
    });
    _Dropdown._observer.observe(document.body, { childList: true, subtree: true });
  }
  static onClick(event) {
    const button = event.target.closest('[data-ui="dropdown"]');
    if (button) {
      if (!button.closest(".dropdown")) return;
      const selector = button.getAttribute("data-target");
      if (!selector) return;
      const dropdown = document.getElementById(selector.replace(/^#/, ""));
      if (!dropdown) return;
      _Dropdown.closeAllDropdowns(button);
      _Dropdown.toggleDropdown(dropdown, button);
      return;
    }
    if (event.target.closest(".dropdown-body")) return;
    _Dropdown.closeAllDropdowns();
  }
  static toggleDropdown(dropdown, button) {
    _Dropdown.isOpen(dropdown) ? _Dropdown.closeDropdown(dropdown, button) : _Dropdown.openDropdown(dropdown, button);
  }
  static isOpen(dropdown) {
    return dropdown.classList.contains("is-open");
  }
  static updateTriggers(dropdown, expanded) {
    document.querySelectorAll(`[data-ui="dropdown"][data-target="#${dropdown.id}"]`).forEach((btn) => btn.setAttribute("aria-expanded", expanded ? "true" : "false"));
  }
  static openDropdown(dropdown, button) {
    if (_Dropdown.isOpen(dropdown)) return;
    if (_Dropdown._animating.has(dropdown)) return;
    const canOpen = dropdown.dispatchEvent(new CustomEvent("dropdown:beforeOpen", {
      bubbles: true,
      cancelable: true,
      detail: { dropdown, button }
    }));
    if (!canOpen) return;
    dropdown.classList.remove("is-closing");
    dropdown.classList.add("is-open");
    _Dropdown.updateTriggers(dropdown, true);
    _Dropdown._animating.set(dropdown, true);
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
    _Dropdown._reposition.set(dropdown, checkViewport);
    window.addEventListener("scroll", checkViewport, { passive: true });
    window.addEventListener("resize", checkViewport, { passive: true });
    _Dropdown._openDropdowns.forEach((entry) => {
      if (entry.dropdown === dropdown) _Dropdown._openDropdowns.delete(entry);
    });
    _Dropdown._openDropdowns.add({ dropdown, button });
    requestAnimationFrame(() => {
      checkViewport();
      _Dropdown._animating.delete(dropdown);
      dropdown.dispatchEvent(new CustomEvent("dropdown:afterOpen", {
        bubbles: true,
        detail: { dropdown, button }
      }));
    });
  }
  static closeDropdown(dropdown, button) {
    if (!_Dropdown.isOpen(dropdown)) return;
    if (_Dropdown._animating.has(dropdown)) return;
    const canClose = dropdown.dispatchEvent(new CustomEvent("dropdown:beforeClose", {
      bubbles: true,
      cancelable: true,
      detail: { dropdown, button }
    }));
    if (!canClose) return;
    _Dropdown.updateTriggers(dropdown, false);
    const checkViewport = _Dropdown._reposition.get(dropdown);
    if (checkViewport) {
      window.removeEventListener("scroll", checkViewport);
      window.removeEventListener("resize", checkViewport);
      _Dropdown._reposition.delete(dropdown);
    }
    _Dropdown._openDropdowns.forEach((entry) => {
      if (entry.dropdown === dropdown) _Dropdown._openDropdowns.delete(entry);
    });
    dropdown.classList.add("is-closing");
    _Dropdown._animating.set(dropdown, true);
    const wrapper = button.closest(".dropdown");
    const cleanup = () => {
      dropdown.classList.remove("is-open", "is-closing");
      _Dropdown._animating.delete(dropdown);
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
    [..._Dropdown._openDropdowns].forEach(({ dropdown, button }) => {
      if (button === exception) return;
      _Dropdown.closeDropdown(dropdown, button);
    });
  }
  static destroy() {
    [..._Dropdown._openDropdowns].forEach(({ dropdown }) => {
      const checkViewport = _Dropdown._reposition.get(dropdown);
      if (checkViewport) {
        window.removeEventListener("scroll", checkViewport);
        window.removeEventListener("resize", checkViewport);
        _Dropdown._reposition.delete(dropdown);
      }
    });
    document.removeEventListener("click", _Dropdown.onClick);
    _Dropdown._observer?.disconnect();
    _Dropdown._observer = null;
    _Dropdown.initialized = false;
    _Dropdown._openDropdowns.clear();
  }
};

// src/js/dropdown-float.js
var DropdownFloat = class _DropdownFloat {
  static _animating = /* @__PURE__ */ new WeakMap();
  static _reposition = /* @__PURE__ */ new WeakMap();
  static _anchor = /* @__PURE__ */ new WeakMap();
  static _rafPending = /* @__PURE__ */ new WeakMap();
  static _openDropdowns = /* @__PURE__ */ new Set();
  // { dropdown, button }
  static _observer = null;
  constructor() {
    if (_DropdownFloat.initialized) return;
    _DropdownFloat.initialized = true;
    _DropdownFloat.init();
    _DropdownFloat.observe();
    document.addEventListener("click", _DropdownFloat.onClick);
  }
  static init() {
    document.querySelectorAll('[data-ui="dropdown-float"]').forEach(_DropdownFloat.initButton);
  }
  static initButton(button) {
    if (button.closest('[data-ui="code"]')) return;
    const selector = button.getAttribute("data-target");
    if (!selector) return;
    const dropdown = document.getElementById(selector.replace(/^#/, ""));
    if (!dropdown) return;
    const isOpen = _DropdownFloat.isOpen(dropdown);
    button.setAttribute("aria-controls", dropdown.id);
    button.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (isOpen) {
      _DropdownFloat.attachReposition(dropdown, button);
    }
  }
  static observe() {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", _DropdownFloat.observe, { once: true });
      return;
    }
    _DropdownFloat._observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches('[data-ui="dropdown-float"]')) {
            _DropdownFloat.initButton(node);
            continue;
          }
          node.querySelectorAll?.('[data-ui="dropdown-float"]').forEach(_DropdownFloat.initButton);
        }
      }
    });
    _DropdownFloat._observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  static onClick(event) {
    const button = event.target.closest('[data-ui="dropdown-float"]');
    if (button) {
      const selector = button.getAttribute("data-target");
      if (!selector) return;
      const dropdown = document.getElementById(selector.replace(/^#/, ""));
      if (!dropdown) return;
      _DropdownFloat.closeAllDropdowns(button);
      _DropdownFloat.toggleDropdown(dropdown, button);
      return;
    }
    if (event.target.closest(".dropdown-body")) return;
    _DropdownFloat.closeAllDropdowns();
  }
  static toggleDropdown(dropdown, button) {
    _DropdownFloat.isOpen(dropdown) ? _DropdownFloat.closeDropdown(dropdown, button) : _DropdownFloat.openDropdown(dropdown, button);
  }
  static isOpen(dropdown) {
    return dropdown.classList.contains("is-open");
  }
  static openDropdown(dropdown, button) {
    if (_DropdownFloat.isOpen(dropdown)) return;
    if (_DropdownFloat._animating.has(dropdown)) return;
    const canOpen = dropdown.dispatchEvent(new CustomEvent("dropdown:beforeOpen", {
      bubbles: true,
      cancelable: true,
      detail: { dropdown, button }
    }));
    if (!canOpen) return;
    const wrapper = button.closest(".dropdown");
    if (wrapper) {
      dropdown.dataset.drop = wrapper.dataset.drop ?? "bottom";
      dropdown.dataset.dropAlign = wrapper.dataset.dropAlign ?? "start";
      dropdown.dataset.dropOrigin = dropdown.dataset.drop;
      dropdown.dataset.dropAlignOrigin = dropdown.dataset.dropAlign;
    }
    if (!_DropdownFloat._anchor.has(dropdown)) {
      _DropdownFloat._anchor.set(dropdown, {
        parent: dropdown.parentNode,
        next: dropdown.nextSibling
      });
    }
    document.body.appendChild(dropdown);
    dropdown.classList.remove("is-closing");
    dropdown.classList.add("is-open");
    button.setAttribute("aria-expanded", "true");
    _DropdownFloat._animating.set(dropdown, true);
    requestAnimationFrame(() => {
      _DropdownFloat.attachReposition(dropdown, button);
      requestAnimationFrame(() => {
        _DropdownFloat._animating.delete(dropdown);
        dropdown.dispatchEvent(new CustomEvent("dropdown:afterOpen", {
          bubbles: true,
          detail: { dropdown, button }
        }));
      });
    });
  }
  static closeDropdown(dropdown, button) {
    if (!_DropdownFloat.isOpen(dropdown)) return;
    if (_DropdownFloat._animating.has(dropdown)) return;
    const canClose = dropdown.dispatchEvent(new CustomEvent("dropdown:beforeClose", {
      bubbles: true,
      cancelable: true,
      detail: { dropdown, button }
    }));
    if (!canClose) return;
    button.setAttribute("aria-expanded", "false");
    const reposition = _DropdownFloat._reposition.get(dropdown);
    if (reposition) {
      window.removeEventListener("scroll", reposition);
      window.removeEventListener("resize", reposition);
      _DropdownFloat._reposition.delete(dropdown);
    }
    _DropdownFloat._openDropdowns.forEach((entry) => {
      if (entry.dropdown === dropdown) _DropdownFloat._openDropdowns.delete(entry);
    });
    dropdown.classList.add("is-closing");
    _DropdownFloat._animating.set(dropdown, true);
    const cleanup = () => {
      dropdown.classList.remove("is-open", "is-closing");
      _DropdownFloat._animating.delete(dropdown);
      delete dropdown.dataset.drop;
      delete dropdown.dataset.dropAlign;
      delete dropdown.dataset.dropOrigin;
      delete dropdown.dataset.dropAlignOrigin;
      dropdown.style.top = "";
      dropdown.style.left = "";
      const anchor = _DropdownFloat._anchor.get(dropdown);
      if (anchor) {
        anchor.parent.insertBefore(dropdown, anchor.next);
        _DropdownFloat._anchor.delete(dropdown);
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
  // [FIX] Logique simplifiée et alignée sur Dropdown (référence)
  static closeAllDropdowns(exception = null) {
    [..._DropdownFloat._openDropdowns].forEach(({ dropdown, button }) => {
      if (button === exception) return;
      _DropdownFloat.closeDropdown(dropdown, button);
    });
  }
  static attachReposition(dropdown, button) {
    _DropdownFloat.position(dropdown, button);
    const reposition = _DropdownFloat.createReposition(dropdown, button);
    _DropdownFloat._reposition.set(dropdown, reposition);
    window.addEventListener("scroll", reposition, { passive: true });
    window.addEventListener("resize", reposition, { passive: true });
    _DropdownFloat._openDropdowns.add({ dropdown, button });
  }
  static createReposition(dropdown, button) {
    let debounceTimer = null;
    return () => {
      if (!_DropdownFloat._rafPending.get(dropdown)) {
        _DropdownFloat._rafPending.set(dropdown, true);
        requestAnimationFrame(() => {
          _DropdownFloat.position(dropdown, button);
          _DropdownFloat._rafPending.delete(dropdown);
        });
      }
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        _DropdownFloat.position(dropdown, button);
      }, 100);
    };
  }
  static position(dropdown, button) {
    const rect = button.getBoundingClientRect();
    const dropdownWidth = dropdown.offsetWidth;
    const dropdownHeight = dropdown.offsetHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropOrigin = dropdown.dataset.dropOrigin ?? "bottom";
    const dropAlignOrigin = dropdown.dataset.dropAlignOrigin ?? "start";
    const setTop = () => {
      top = rect.top - dropdownHeight;
      dropdown.dataset.drop = "top";
    };
    const setBottom = () => {
      top = rect.bottom;
      dropdown.dataset.drop = "bottom";
    };
    let top;
    if (dropOrigin === "top") {
      if (spaceAbove >= dropdownHeight) {
        setTop();
      } else if (spaceBelow >= dropdownHeight) {
        setBottom();
      }
    } else {
      if (spaceBelow >= dropdownHeight) {
        setBottom();
      } else if (spaceAbove >= dropdownHeight) {
        setTop();
      }
    }
    const startFits = window.innerWidth - rect.left >= dropdownWidth;
    const endFits = rect.right >= dropdownWidth;
    const centerFits = rect.left + rect.width / 2 - dropdownWidth / 2 >= 0 && rect.left + rect.width / 2 + dropdownWidth / 2 <= window.innerWidth;
    const endOutsideFits = rect.right + dropdownWidth <= window.innerWidth;
    const startOutsideFits = rect.left - dropdownWidth >= 0;
    const setLeft = () => {
      left = rect.left;
      dropdown.dataset.dropAlign = "start";
    };
    const setCenter = () => {
      left = rect.left + rect.width / 2 - dropdownWidth / 2;
      dropdown.dataset.dropAlign = "center";
    };
    const setRight = () => {
      left = rect.right - dropdownWidth;
      dropdown.dataset.dropAlign = "end";
    };
    const setRightOutside = () => {
      left = rect.right;
      top = rect.top;
      dropdown.dataset.dropAlign = "end-outside";
    };
    const setLeftOutside = () => {
      left = rect.left - dropdownWidth;
      top = rect.top;
      dropdown.dataset.dropAlign = "start-outside";
    };
    let left;
    if (dropAlignOrigin === "start") {
      if (startFits) {
        setLeft();
      } else if (centerFits) {
        setCenter();
      } else if (endFits) {
        setRight();
      }
    } else if (dropAlignOrigin === "end") {
      if (endFits) {
        setRight();
      } else if (centerFits) {
        setCenter();
      } else if (startFits) {
        setLeft();
      }
    } else if (dropAlignOrigin === "center") {
      if (centerFits) {
        setCenter();
      } else if (startFits) {
        setLeft();
      } else if (endFits) {
        setRight();
      }
    } else if (dropAlignOrigin === "end-outside") {
      if (endOutsideFits) {
        setRightOutside();
      } else if (startOutsideFits) {
        setLeftOutside();
      } else if (endFits) {
        setRight();
      } else if (centerFits) {
        setCenter();
      } else if (startFits) {
        setLeft();
      }
    } else if (dropAlignOrigin === "start-outside") {
      if (startOutsideFits) {
        setLeftOutside();
      } else if (endOutsideFits) {
        setRightOutside();
      } else if (startFits) {
        setLeft();
      } else if (centerFits) {
        setCenter();
      } else if (endFits) {
        setRight();
      }
    }
    if (top !== void 0) dropdown.style.top = Math.round(top) + scrollY + "px";
    if (left !== void 0) dropdown.style.left = Math.round(left) + scrollX + "px";
  }
  // [FIX] destroy complet : nettoyage listeners scroll/resize, _anchor, _rafPending
  static destroy() {
    [..._DropdownFloat._openDropdowns].forEach(({ dropdown }) => {
      const reposition = _DropdownFloat._reposition.get(dropdown);
      if (reposition) {
        window.removeEventListener("scroll", reposition);
        window.removeEventListener("resize", reposition);
        _DropdownFloat._reposition.delete(dropdown);
      }
      const anchor = _DropdownFloat._anchor.get(dropdown);
      if (anchor) {
        anchor.parent.insertBefore(dropdown, anchor.next);
        _DropdownFloat._anchor.delete(dropdown);
      }
    });
    _DropdownFloat._rafPending = /* @__PURE__ */ new WeakMap();
    document.removeEventListener("click", _DropdownFloat.onClick);
    _DropdownFloat._observer?.disconnect();
    _DropdownFloat._observer = null;
    _DropdownFloat.initialized = false;
    _DropdownFloat._openDropdowns.clear();
  }
};

// src/js/form-validate.js
var FormValidate = class _FormValidate {
  constructor() {
    if (_FormValidate.initialized) return;
    _FormValidate.initialized = true;
    document.addEventListener("submit", _FormValidate.onSubmit);
  }
  static onSubmit(event) {
    const form = event.target;
    if (!form.matches('[data-ui="validate"]')) return;
    const canSubmit = form.dispatchEvent(new CustomEvent("formValidate:beforeSubmit", {
      bubbles: true,
      cancelable: true,
      detail: { form }
    }));
    if (!canSubmit) {
      event.preventDefault();
      return;
    }
    if (!form.checkValidity()) {
      event.preventDefault();
      form.classList.add("validated");
      form.dispatchEvent(new CustomEvent("formValidate:invalid", {
        bubbles: true,
        detail: { form }
      }));
    } else {
      form.dispatchEvent(new CustomEvent("formValidate:valid", {
        bubbles: true,
        detail: { form }
      }));
    }
  }
  static destroy() {
    document.removeEventListener("submit", _FormValidate.onSubmit);
    _FormValidate.initialized = false;
  }
};

// src/js/tab.js
var Tab = class _Tab {
  static _observer = null;
  static _counter = 0;
  constructor() {
    if (_Tab.initialized) return;
    _Tab.initialized = true;
    _Tab.init();
    _Tab.observe();
    document.addEventListener("click", _Tab.onClick);
    document.addEventListener("keydown", _Tab.onKeydown);
  }
  static init() {
    document.querySelectorAll('[data-ui="tab"]').forEach(_Tab.initTab);
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
        button.id = `tab-button-${++_Tab._counter}`;
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
    _Tab.resetButtons(buttons);
    _Tab.resetPanels(root.querySelectorAll('[data-ui="tab-panel"]'));
    _Tab.show(activeButton, panel, buttons, root.querySelectorAll('[data-ui="tab-panel"]'), true);
  }
  static observe() {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", _Tab.observe, { once: true });
      return;
    }
    _Tab._observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches('[data-ui="tab"]')) {
            _Tab.initTab(node);
            continue;
          }
          node.querySelectorAll?.('[data-ui="tab"]').forEach(_Tab.initTab);
        }
      }
    });
    _Tab._observer.observe(document.body, { childList: true, subtree: true });
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
    _Tab.show(button, panel, buttons, panels);
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
    _Tab.resetButtons(buttons);
    _Tab.resetPanels(panels);
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
    document.removeEventListener("click", _Tab.onClick);
    document.removeEventListener("keydown", _Tab.onKeydown);
    _Tab._observer?.disconnect();
    _Tab._observer = null;
    _Tab.initialized = false;
  }
};

// src/app.js
document.addEventListener("DOMContentLoaded", () => {
  new Alert();
  new Collapse();
  new Dialog();
  new Drawer();
  new Dropdown();
  new DropdownFloat();
  new FormValidate();
  new Tab();
});
