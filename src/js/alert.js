export default class Alert {

    static _exitAnimations = ['alert-exit', 'alert-auto'];

    constructor() {
        if (Alert.initialized) return;
        Alert.initialized = true;
        Alert._observer = null;
        Alert.init();
        Alert.observe();
        document.addEventListener('animationend', Alert.onAnimationEnd);
        document.addEventListener('click', Alert.onClick);
    }

    static init() {
        document.querySelectorAll('[data-ui="alert"]').forEach(Alert.enhance);
    }

    static onClick(event) {
        const btnClose = event.target.closest('[data-dismiss="alert"]');
        if (!btnClose) return;
        const alert = btnClose.closest('[data-ui="alert"]');
        if (!alert) return;
        Alert.close(alert);
    }

    static onAnimationEnd(event) {
        const alert = event.target;
        if (!alert.matches('[data-ui="alert"]')) return;
        const isExitAnim = Alert._exitAnimations.some(name => event.animationName.includes(name));
        if (!isExitAnim) return;
        alert.dispatchEvent(new CustomEvent('alert:afterClose', {
            bubbles: true,
            detail: {alert}
        }));
        alert.remove();
    }

    static observe() {
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', Alert.observe, {once: true});
            return;
        }
        Alert._observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (!(node instanceof HTMLElement)) continue;
                    if (node.matches('[data-ui="alert"]')) {
                        Alert.enhance(node);
                        continue;
                    }
                    node.querySelectorAll?.('[data-ui="alert"]').forEach(Alert.enhance);
                }
            }
        });
        Alert._observer.observe(document.body, {childList: true, subtree: true});
    }

    static enhance(alert) {
        if (alert.dataset.uiReady) return;
        alert.dataset.uiReady = 'true';

        if (!alert.classList.contains('anim-alert-auto')) {
            alert.classList.add('anim-alert-enter');
        }

        const level = alert.dataset.level;
        alert.setAttribute('role', 'alert');
        alert.setAttribute('aria-live', level === 'error' ? 'assertive' : 'polite');
        alert.setAttribute('aria-atomic', 'true');

        alert.querySelectorAll('[data-dismiss="alert"]').forEach(button => {
            if (!button.hasAttribute('aria-label')) {
                button.setAttribute('aria-label', 'Close');
            }
        });

        const duration = parseFloat(alert.dataset.duration);
        if (!isNaN(duration) && duration > 0) {
            setTimeout(() => {
                if (document.contains(alert)) Alert.close(alert);
            }, duration);
        }
    }

    static close(alert) {
        if (alert.classList.contains('is-closing')) return;
        const canClose = alert.dispatchEvent(new CustomEvent('alert:beforeClose', {
            bubbles: true,
            cancelable: true,
            detail: {alert}
        }));
        if (!canClose) return;
        alert.classList.add('is-closing', 'anim-alert-exit');
        alert.setAttribute('aria-hidden', 'true');
    }

    static destroy() {
        document.removeEventListener('animationend', Alert.onAnimationEnd);
        document.removeEventListener('click', Alert.onClick);
        Alert._observer?.disconnect();
        Alert._observer = null;
        Alert.initialized = false;
    }
}
