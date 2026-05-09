export default class Dialog {

    static _animating = new WeakMap();
    static _counter = 0;

    constructor() {
        if (Dialog.initialized) return;
        Dialog.initialized = true;
        Dialog._observer = null;
        Dialog.init();
        Dialog.observe();
        document.addEventListener('click', Dialog.onClick);
        document.addEventListener('keydown', Dialog.onKeydown);
    }

    static init() {
        document.querySelectorAll('[data-ui="dialog"]').forEach(Dialog.initButton);
    }

    static initButton(button) {
        const selector = button.getAttribute('data-target');
        if (!selector) return;

        const dialog = document.getElementById(selector.replace(/^#/, ''));
        if (!dialog) return;

        dialog.setAttribute('aria-modal', 'true');

        // Relier le titre pour les lecteurs d'écran
        const title = dialog.querySelector('.dialog-header');
        if (title) {
            if (!title.id) title.id = `dialog-title-${++Dialog._counter}`;
            dialog.setAttribute('aria-labelledby', title.id);
        }

        dialog.querySelectorAll('[data-dismiss="dialog"]').forEach(btn => {
            if (!btn.hasAttribute('aria-label')) btn.setAttribute('aria-label', 'Close');
        });
    }

    static observe() {
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', Dialog.observe, {once: true});
            return;
        }

        Dialog._observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (!(node instanceof HTMLElement)) continue;
                    if (node.matches('[data-ui="dialog"]')) {
                        Dialog.initButton(node);
                        continue;
                    }
                    node.querySelectorAll?.('[data-ui="dialog"]').forEach(Dialog.initButton);
                }
            }
        });

        Dialog._observer.observe(document.body, {childList: true, subtree: true});
    }

    static onClick(event) {
        const triggerBtn = event.target.closest('[data-ui="dialog"]');
        if (triggerBtn) {
            Dialog.handleOpen(triggerBtn);
            return;
        }

        const closeBtn = event.target.closest('[data-dismiss="dialog"]');
        if (closeBtn) {
            const dialog = closeBtn.closest('dialog');
            if (dialog) Dialog.hide(dialog);
        }

        const dialog = event.target.closest('dialog[open]');
        if (dialog && event.target === dialog) {
            Dialog.hide(dialog);
        }
    }

    static onKeydown(event) {
        if (event.key !== 'Escape') return;
        // Prendre le dernier dialog ouvert dans le DOM (dialogs chaînés)
        const dialogs = document.querySelectorAll('dialog[open]');
        const dialog = dialogs[dialogs.length - 1];
        if (!dialog) return;
        event.preventDefault();
        Dialog.hide(dialog);
    }

    static handleOpen(button) {
        const selector = button.getAttribute('data-target');
        if (!selector) return;

        const dialog = document.querySelector(selector);
        if (!dialog || !(dialog instanceof HTMLDialogElement)) return;

        if (button.hasAttribute('data-dismiss')) {
            const currentDialog = button.closest('dialog');
            if (currentDialog && currentDialog !== dialog) {
                Dialog.hide(currentDialog);
                currentDialog.addEventListener('dialog:afterClose', () => {
                    Dialog.open(dialog);
                }, {once: true});
                return;
            }
        }

        Dialog.open(dialog);
    }

    static open(dialog) {
        if (dialog.open || Dialog._animating.has(dialog)) return;

        const canOpen = dialog.dispatchEvent(new CustomEvent('dialog:beforeOpen', {
            bubbles: true,
            cancelable: true,
            detail: {dialog}
        }));
        if (!canOpen) return;

        Dialog._animating.set(dialog, true);

        dialog.showModal();
        Dialog.showBackdrop();

        // Reflow forcé nécessaire pour que la transition CSS se déclenche
        void dialog.offsetHeight;
        dialog.classList.add('is-open');

        Dialog.onTransitionEnd(dialog, () => {
            Dialog._animating.delete(dialog);
            Dialog.emit(dialog, 'dialog:afterOpen');
        });
    }

    static hide(dialog) {
        if (!dialog.open || Dialog._animating.has(dialog)) return;

        const canClose = dialog.dispatchEvent(new CustomEvent('dialog:beforeClose', {
            bubbles: true,
            cancelable: true,
            detail: {dialog}
        }));
        if (!canClose) return;

        Dialog._animating.set(dialog, true);

        dialog.classList.add('is-closing');
        dialog.classList.remove('is-open');
        Dialog.hideBackdrop();

        Dialog.onTransitionEnd(dialog, () => {
            dialog.classList.remove('is-closing');
            dialog.close();
            Dialog._animating.delete(dialog);
            Dialog.emit(dialog, 'dialog:afterClose');
        });
    }

    static getOrCreateBackdrop() {
        let backdrop = document.querySelector('.dialog-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'dialog-backdrop';
            document.body.appendChild(backdrop);
        }
        return backdrop;
    }

    static showBackdrop() {
        const backdrop = Dialog.getOrCreateBackdrop();
        backdrop.classList.remove('is-closing');
        void backdrop.offsetHeight;
        backdrop.classList.add('is-open');
    }

    static hideBackdrop() {
        // Ne pas masquer le backdrop si un autre dialog est encore ouvert
        if (document.querySelectorAll('dialog[open]').length > 1) return;

        const backdrop = document.querySelector('.dialog-backdrop');
        if (!backdrop) return;

        backdrop.classList.add('is-closing');
        backdrop.classList.remove('is-open');

        Dialog.onTransitionEnd(backdrop, () => {
            backdrop.classList.remove('is-closing');
        });
    }

    static onTransitionEnd(element, callback) {
        let done = false;

        const finish = () => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            element.removeEventListener('transitionend', onEnd);
            callback();
        };

        const onEnd = (event) => {
            if (event.target !== element) return;
            finish();
        };

        const computed = window.getComputedStyle(element);
        const duration = Math.max(
            0,
            ...computed.transitionDuration.split(',').map(d => parseFloat(d) * 1000)
        );

        const timer = setTimeout(finish, duration + 50);

        if (duration === 0) {
            finish();
            return;
        }

        element.addEventListener('transitionend', onEnd);
    }

    static emit(target, name, cancelable = false) {
        return target.dispatchEvent(new CustomEvent(name, {
            detail: {dialog: target},
            bubbles: true,
            cancelable,
        }));
    }

    static destroy() {
        document.removeEventListener('click', Dialog.onClick);
        document.removeEventListener('keydown', Dialog.onKeydown);
        Dialog._observer?.disconnect();
        Dialog._observer = null;
        Dialog.initialized = false;
    }
}
