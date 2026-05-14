export default class DropdownFloat {

    static _animating = new WeakMap();
    static _reposition = new WeakMap();
    static _anchor = new WeakMap();
    static _rafPending = new WeakMap();
    static _openDropdowns = new Set(); // { dropdown, button }
    static _observer = null;

    constructor() {
        if (DropdownFloat.initialized) return;
        DropdownFloat.initialized = true;
        DropdownFloat.init();
        DropdownFloat.observe();
        document.addEventListener('click', DropdownFloat.onClick);
    }

    static init() {
        document.querySelectorAll('[data-ui="dropdown-float"]').forEach(DropdownFloat.initButton);
    }

    static initButton(button) {
        if (button.closest('[data-ui="code"]')) return;

        const selector = button.getAttribute('data-target');
        if (!selector) return;

        const dropdown = document.getElementById(selector.replace(/^#/, ''));
        if (!dropdown) return;

        const isOpen = DropdownFloat.isOpen(dropdown);

        button.setAttribute('aria-controls', dropdown.id);
        button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

        if (isOpen) {
            DropdownFloat.attachReposition(dropdown, button);
        }
    }

    static observe() {
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', DropdownFloat.observe, {once: true});
            return;
        }

        DropdownFloat._observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (!(node instanceof HTMLElement)) continue;
                    if (node.matches('[data-ui="dropdown-float"]')) {
                        DropdownFloat.initButton(node);
                        continue;
                    }
                    node.querySelectorAll?.('[data-ui="dropdown-float"]').forEach(DropdownFloat.initButton);
                }
            }
        });

        DropdownFloat._observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    static onClick(event) {
        const button = event.target.closest('[data-ui="dropdown-float"]');

        if (button) {
            const selector = button.getAttribute('data-target');
            if (!selector) return;

            const dropdown = document.getElementById(selector.replace(/^#/, ''));
            if (!dropdown) return;

            DropdownFloat.closeAllDropdowns(button);
            DropdownFloat.toggleDropdown(dropdown, button);
            return;
        }

        if (event.target.closest('.dropdown-body')) return;

        DropdownFloat.closeAllDropdowns();
    }

    static toggleDropdown(dropdown, button) {
        DropdownFloat.isOpen(dropdown)
            ? DropdownFloat.closeDropdown(dropdown, button)
            : DropdownFloat.openDropdown(dropdown, button);
    }

    static isOpen(dropdown) {
        return dropdown.classList.contains('is-open');
    }

    static openDropdown(dropdown, button) {
        if (DropdownFloat.isOpen(dropdown)) return;
        if (DropdownFloat._animating.has(dropdown)) return;

        const canOpen = dropdown.dispatchEvent(new CustomEvent('dropdown:beforeOpen', {
            bubbles: true,
            cancelable: true,
            detail: {dropdown, button}
        }));
        if (!canOpen) return;

        // Copier les préférences du wrapper sur le dropdown-body avant téléport
        const wrapper = button.closest('.dropdown');
        if (wrapper) {
            dropdown.dataset.drop = wrapper.dataset.drop ?? 'bottom';
            dropdown.dataset.dropAlign = wrapper.dataset.dropAlign ?? 'start';
            // Mémoriser les préférences d'origine pour les fallbacks au scroll/resize
            dropdown.dataset.dropOrigin = dropdown.dataset.drop;
            dropdown.dataset.dropAlignOrigin = dropdown.dataset.dropAlign;
        }

        // Mémoriser la position d'origine avant téléport
        if (!DropdownFloat._anchor.has(dropdown)) {
            DropdownFloat._anchor.set(dropdown, {
                parent: dropdown.parentNode,
                next: dropdown.nextSibling
            });
        }
        document.body.appendChild(dropdown);

        dropdown.classList.remove('is-closing');
        dropdown.classList.add('is-open');

        button.setAttribute('aria-expanded', 'true');

        DropdownFloat._animating.set(dropdown, true);

        requestAnimationFrame(() => {
            DropdownFloat.attachReposition(dropdown, button);

            requestAnimationFrame(() => {
                DropdownFloat._animating.delete(dropdown);
                dropdown.dispatchEvent(new CustomEvent('dropdown:afterOpen', {
                    bubbles: true,
                    detail: {dropdown, button}
                }));
            });
        });
    }

    static closeDropdown(dropdown, button) {
        if (!DropdownFloat.isOpen(dropdown)) return;
        if (DropdownFloat._animating.has(dropdown)) return;

        const canClose = dropdown.dispatchEvent(new CustomEvent('dropdown:beforeClose', {
            bubbles: true,
            cancelable: true,
            detail: {dropdown, button}
        }));
        if (!canClose) return;

        button.setAttribute('aria-expanded', 'false');

        const reposition = DropdownFloat._reposition.get(dropdown);
        if (reposition) {
            window.removeEventListener('scroll', reposition);
            window.removeEventListener('resize', reposition);
            DropdownFloat._reposition.delete(dropdown);
        }

        DropdownFloat._openDropdowns.forEach(entry => {
            if (entry.dropdown === dropdown) DropdownFloat._openDropdowns.delete(entry);
        });

        dropdown.classList.add('is-closing');

        DropdownFloat._animating.set(dropdown, true);

        const cleanup = () => {
            dropdown.classList.remove('is-open', 'is-closing');
            DropdownFloat._animating.delete(dropdown);

            // Nettoyer tous les data attributs copiés
            delete dropdown.dataset.drop;
            delete dropdown.dataset.dropAlign;
            delete dropdown.dataset.dropOrigin;
            delete dropdown.dataset.dropAlignOrigin;

            dropdown.style.top = '';
            dropdown.style.left = '';

            // Remettre le dropdown à sa place d'origine
            const anchor = DropdownFloat._anchor.get(dropdown);
            if (anchor) {
                anchor.parent.insertBefore(dropdown, anchor.next);
                DropdownFloat._anchor.delete(dropdown);
            }

            dropdown.dispatchEvent(new CustomEvent('dropdown:afterClose', {
                bubbles: true,
                detail: {dropdown, button}
            }));
        };

        // [FIX] Prendre la durée max parmi toutes les transitions (aligné sur Dropdown)
        const duration = Math.max(
            0,
            ...window.getComputedStyle(dropdown).transitionDuration
                .split(',')
                .map(d => parseFloat(d) * 1000)
        );

        if (!duration) {
            cleanup();
            return;
        }

        const safetyTimer = setTimeout(cleanup, duration + 100);

        dropdown.addEventListener('transitionend', (event) => {
            if (event.target !== dropdown) return;
            clearTimeout(safetyTimer);
            cleanup();
        }, {once: true});
    }

    // [FIX] Logique simplifiée et alignée sur Dropdown (référence)
    static closeAllDropdowns(exception = null) {
        [...DropdownFloat._openDropdowns].forEach(({dropdown, button}) => {
            if (button === exception) return;
            DropdownFloat.closeDropdown(dropdown, button);
        });
    }

    static attachReposition(dropdown, button) {
        DropdownFloat.position(dropdown, button);
        const reposition = DropdownFloat.createReposition(dropdown, button);
        DropdownFloat._reposition.set(dropdown, reposition);
        window.addEventListener('scroll', reposition, {passive: true});
        window.addEventListener('resize', reposition, {passive: true});
        DropdownFloat._openDropdowns.add({dropdown, button});
    }

    static createReposition(dropdown, button) {
        let debounceTimer = null;

        return () => {
            // rAF pour la fluidité pendant le resize
            if (!DropdownFloat._rafPending.get(dropdown)) {
                DropdownFloat._rafPending.set(dropdown, true);
                requestAnimationFrame(() => {
                    DropdownFloat.position(dropdown, button);
                    DropdownFloat._rafPending.delete(dropdown);
                });
            }

            // Debounce pour recalculer une dernière fois quand le resize est fini
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                DropdownFloat.position(dropdown, button);
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

        const dropOrigin = dropdown.dataset.dropOrigin ?? 'bottom';
        const dropAlignOrigin = dropdown.dataset.dropAlignOrigin ?? 'start';

        // ↕ Axe vertical ↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕↕

        const setTop = () => {
            top = rect.top - dropdownHeight;
            dropdown.dataset.drop = 'top';
        }
        const setBottom = () => {
            top = rect.bottom;
            dropdown.dataset.drop = 'bottom';
        }

        let top;

        if (dropOrigin === 'top') {
            if (spaceAbove >= dropdownHeight) {setTop();}
            else if (spaceBelow >= dropdownHeight) {setBottom();}
        } else {
            if (spaceBelow >= dropdownHeight) {setBottom();}
            else if (spaceAbove >= dropdownHeight) {setTop();}
        }

        // ↔ Axe horizontal ↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔↔
        const startFits = window.innerWidth - rect.left >= dropdownWidth;
        const endFits = rect.right >= dropdownWidth;
        const centerFits =
            (rect.left + rect.width / 2) - dropdownWidth / 2 >= 0 &&
            (rect.left + rect.width / 2) + dropdownWidth / 2 <= window.innerWidth;
        const endOutsideFits = rect.right + dropdownWidth <= window.innerWidth;
        const startOutsideFits = rect.left - dropdownWidth >= 0;

        const setLeft = () => {
            left = rect.left;
            dropdown.dataset.dropAlign = 'start';
        }

        const setCenter = () => {
            left = rect.left + (rect.width / 2) - (dropdownWidth / 2);
            dropdown.dataset.dropAlign = 'center';
        }

        const setRight = () => {
            left = rect.right - dropdownWidth;
            dropdown.dataset.dropAlign = 'end';
        }

        const setRightOutside = () => {
            left = rect.right;
            top = rect.top;
            dropdown.dataset.dropAlign = 'end-outside';
        }

        const setLeftOutside = () => {
            left = rect.left - dropdownWidth;
            top = rect.top;
            dropdown.dataset.dropAlign = 'start-outside';
        }

        let left;

        if (dropAlignOrigin === 'start') {
            if (startFits) {setLeft();}
            else if (centerFits) {setCenter()}
            else if (endFits) {setRight()}

        } else if (dropAlignOrigin === 'end') {
            if (endFits) {setRight();}
            else if (centerFits) {setCenter();}
            else if (startFits) { setLeft(); }

        } else if (dropAlignOrigin === 'center') {
            if (centerFits) {setCenter();}
            else if (startFits) {setLeft();}
            else if (endFits) {setRight();}

        } else if (dropAlignOrigin === 'end-outside') {
            if (endOutsideFits) {setRightOutside();}
            else if (startOutsideFits) {setLeftOutside();}
            else if (endFits) {setRight();}
            else if (centerFits) {setCenter();}
            else if (startFits) {setLeft();}

        } else if (dropAlignOrigin === 'start-outside') {
            if (startOutsideFits) {setLeftOutside();}
            else if (endOutsideFits) {setRightOutside();}
            else if (startFits) {setLeft();}
            else if (centerFits) {setCenter();}
            else if (endFits) {setRight();}
        }

        if (top !== undefined) dropdown.style.top = (Math.round(top) + scrollY) + 'px';
        if (left !== undefined) dropdown.style.left = (Math.round(left) + scrollX) + 'px';
    }

    // [FIX] destroy complet : nettoyage listeners scroll/resize, _anchor, _rafPending
    static destroy() {
        [...DropdownFloat._openDropdowns].forEach(({dropdown}) => {
            const reposition = DropdownFloat._reposition.get(dropdown);
            if (reposition) {
                window.removeEventListener('scroll', reposition);
                window.removeEventListener('resize', reposition);
                DropdownFloat._reposition.delete(dropdown);
            }

            // Remettre les dropdowns téléportés à leur place d'origine
            const anchor = DropdownFloat._anchor.get(dropdown);
            if (anchor) {
                anchor.parent.insertBefore(dropdown, anchor.next);
                DropdownFloat._anchor.delete(dropdown);
            }
        });

        DropdownFloat._rafPending = new WeakMap();
        document.removeEventListener('click', DropdownFloat.onClick);
        DropdownFloat._observer?.disconnect();
        DropdownFloat._observer = null;
        DropdownFloat.initialized = false;
        DropdownFloat._openDropdowns.clear();
    }
}
