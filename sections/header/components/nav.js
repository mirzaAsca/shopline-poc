defineModule('theme-nav-bar', () => {
    class NavBar extends BaseElement {
        static #MENU_SELECTOR = '[data-role="menu"]';
        static #NAV_SELECTOR = '[data-role="header-nav"]';
        #openMenu(element) {
            this.#closeAllMenu();
            this.#checkAndAdjustDropdownPosition(element);
            element.classList.add('open');
        }
        #checkAndAdjustDropdownPosition(menu) {
            const scope = menu.querySelector('.header-nav-dropdown-menu-scope');
            if (scope) {
                this.#adjustElementPosition(scope);
            }
            const panelMenu = menu.querySelector('.header-nav-dropdown-panel__menu');
            if (panelMenu) {
                this.#adjustElementPosition(panelMenu);
            }
        }
        #adjustElementPosition(element) {
            element.style.removeProperty('inset-inline');
            element.style.removeProperty('left');
            element.style.removeProperty('right');
            const viewportWidth = window.innerWidth;
            const originalDisplay = element.style.getPropertyValue('display');
            const originalDisplayPriority = element.style.getPropertyPriority('display');
            const originalVisibility = element.style.getPropertyValue('visibility');
            const originalVisibilityPriority = element.style.getPropertyPriority('visibility');
            const originalOpacity = element.style.getPropertyValue('opacity');
            const originalOpacityPriority = element.style.getPropertyPriority('opacity');
            element.style.setProperty('display', 'block', 'important');
            element.style.setProperty('visibility', 'hidden', 'important');
            element.style.setProperty('opacity', '0', 'important');
            element.offsetHeight;
            const rect = element.getBoundingClientRect();
            const elementLeft = rect.left;
            const elementRight = rect.right;
            if (originalDisplay) {
                element.style.setProperty('display', originalDisplay, originalDisplayPriority);
            }
            else {
                element.style.removeProperty('display');
            }
            if (originalVisibility) {
                element.style.setProperty('visibility', originalVisibility, originalVisibilityPriority);
            }
            else {
                element.style.removeProperty('visibility');
            }
            if (originalOpacity) {
                element.style.setProperty('opacity', originalOpacity, originalOpacityPriority);
            }
            else {
                element.style.removeProperty('opacity');
            }
            if (elementRight >= viewportWidth || elementLeft < 0) {
                element.style.setProperty('inset-inline', 'auto 0', 'important');
                element.style.setProperty('left', 'auto', 'important');
                element.style.setProperty('right', '0', 'important');
            }
        }
        #recalculateAllOpenMenus() {
            document.querySelectorAll(`${NavBar.#MENU_SELECTOR}.open`).forEach((menu) => {
                this.#checkAndAdjustDropdownPosition(menu);
            });
        }
        #resizeHandler = () => {
            this.#recalculateAllOpenMenus();
        };
        #closeAllMenu() {
            document.querySelectorAll(NavBar.#MENU_SELECTOR).forEach((item) => {
                item.classList.remove('open');
            });
        }
        #openDropdownMenuHandler = (event) => {
            const target = event.target;
            const menu = target.closest(NavBar.#MENU_SELECTOR);
            if (!menu) {
                return;
            }
            this.#openMenu(menu);
        };
        #closeDropdownMenuHandler = (event) => {
            const targets = event.composedPath();
            if (this.#isMatchingTarget(targets, NavBar.#NAV_SELECTOR)) {
                return;
            }
            this.#closeAllMenu();
        };
        #isMatchingTarget(targets, selector) {
            return targets.some((target) => {
                if (!(target instanceof HTMLElement)) {
                    return false;
                }
                return target.matches(selector);
            });
        }
        mounted() {
            this.addEventListener('click', this.#openDropdownMenuHandler);
            document.addEventListener('click', this.#closeDropdownMenuHandler);
            window.addEventListener('resize', this.#resizeHandler);
            this.#resizeHandler();
        }
        unmounted() {
            this.removeEventListener('click', this.#openDropdownMenuHandler);
            document.removeEventListener('click', this.#closeDropdownMenuHandler);
            window.removeEventListener('resize', this.#resizeHandler);
        }
    }
    window.customElements.define('theme-nav-bar', NavBar);
});
