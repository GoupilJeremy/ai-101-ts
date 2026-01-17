/**
 * FocusManager - Manages keyboard navigation and focus for all interactive elements in the HUD.
 * Handles Tab/Shift+Tab cycling, arrow key spatial navigation, and focus trapping for modals.
 */
class FocusManager {
    constructor() {
        this.currentFocusIndex = -1;
        this.interactiveElements = [];
        this.focusTrapStack = [];
        this.skipLinks = [];

        // Selectors for interactive elements (in priority order)
        this.elementSelectors = [
            '.skip-link',
            '.agent-icon',
            '.alert-component',
            '.suggestion-card__btn',
            '.vital-signs__files',
            '.vital-signs__history',
            '.context-panel__file-item',
            '.timeline__entry',
            '.alert-panel__btn',
            'button[tabindex="0"]',
            'a[tabindex="0"]',
            '[role="button"][tabindex="0"]'
        ];

        this.initialized = false;
    }

    /**
     * Initialize the focus manager and set up event listeners.
     */
    initialize() {
        if (this.initialized) return;

        this.updateInteractiveElements();
        this.attachEventListeners();
        this.createSkipLinks();
        this.initialized = true;

        console.log('FocusManager initialized with', this.interactiveElements.length, 'interactive elements');
    }

    /**
     * Create skip links for rapid navigation.
     */
    createSkipLinks() {
        const hudContainer = document.getElementById('hud-container');
        if (!hudContainer) return;

        // Create skip links container
        const skipLinksContainer = document.createElement('div');
        skipLinksContainer.className = 'skip-links';
        skipLinksContainer.setAttribute('role', 'navigation');
        skipLinksContainer.setAttribute('aria-label', 'Skip links');

        // Skip to agents
        const skipToAgents = this.createSkipLink('Skip to Agents', () => {
            const firstAgent = document.querySelector('.agent-icon');
            if (firstAgent) this.focusElement(firstAgent);
        });

        // Skip to alerts
        const skipToAlerts = this.createSkipLink('Skip to Alerts', () => {
            const firstAlert = document.querySelector('.alert-component');
            if (firstAlert) this.focusElement(firstAlert);
        });

        // Skip to suggestions
        const skipToSuggestions = this.createSkipLink('Skip to Suggestions', () => {
            const firstSuggestion = document.querySelector('.suggestion-card');
            if (firstSuggestion) this.focusElement(firstSuggestion);
        });

        skipLinksContainer.appendChild(skipToAgents);
        skipLinksContainer.appendChild(skipToAlerts);
        skipLinksContainer.appendChild(skipToSuggestions);

        // Insert at the beginning of HUD container
        hudContainer.insertBefore(skipLinksContainer, hudContainer.firstChild);

        this.skipLinks = [skipToAgents, skipToAlerts, skipToSuggestions];
    }

    /**
     * Create a single skip link element.
     */
    createSkipLink(text, onClick) {
        const link = document.createElement('a');
        link.href = '#';
        link.className = 'skip-link';
        link.textContent = text;
        link.setAttribute('tabindex', '0');
        link.addEventListener('click', (e) => {
            e.preventDefault();
            onClick();
        });
        link.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
            }
        });
        return link;
    }

    /**
     * Update the list of interactive elements.
     */
    updateInteractiveElements() {
        this.interactiveElements = [];

        // Collect all interactive elements in order
        this.elementSelectors.forEach(selector => {
            const elements = Array.from(document.querySelectorAll(selector));
            elements.forEach(el => {
                if (!this.interactiveElements.includes(el)) {
                    this.interactiveElements.push(el);
                    this.ensureTabIndex(el);
                }
            });
        });

        console.log('Updated interactive elements:', this.interactiveElements.length);
    }

    /**
     * Ensure element has proper tabindex.
     */
    ensureTabIndex(element) {
        if (!element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }

        // Add ARIA role if not present
        if (!element.hasAttribute('role') && !element.tagName.match(/^(BUTTON|A|INPUT)$/)) {
            element.setAttribute('role', 'button');
        }
    }

    /**
     * Attach keyboard event listeners.
     */
    attachEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('focusin', (e) => this.handleFocusIn(e));
        document.addEventListener('focusout', (e) => this.handleFocusOut(e));
    }

    /**
     * Handle keydown events for navigation.
     */
    handleKeyDown(event) {
        // Check if we're in a focus trap
        if (this.focusTrapStack.length > 0) {
            this.handleFocusTrapKeyDown(event);
            return;
        }

        switch (event.key) {
            case 'Tab':
                event.preventDefault();
                this.handleTabNavigation(event.shiftKey);
                break;
            case 'ArrowRight':
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'ArrowDown':
                this.handleArrowNavigation(event);
                break;
            case 'Enter':
            case ' ':
                this.handleActivation(event);
                break;
            case 'Escape':
                this.handleEscape(event);
                break;
        }
    }

    /**
     * Handle Tab/Shift+Tab navigation.
     */
    handleTabNavigation(shiftKey) {
        this.updateInteractiveElements();

        if (this.interactiveElements.length === 0) return;

        if (this.currentFocusIndex === -1) {
            // No current focus, start with first element
            this.currentFocusIndex = 0;
        } else {
            if (shiftKey) {
                // Shift+Tab: previous element (with wrapping)
                this.currentFocusIndex = this.currentFocusIndex > 0
                    ? this.currentFocusIndex - 1
                    : this.interactiveElements.length - 1;
            } else {
                // Tab: next element (with wrapping)
                this.currentFocusIndex = this.currentFocusIndex < this.interactiveElements.length - 1
                    ? this.currentFocusIndex + 1
                    : 0;
            }
        }

        this.focusElementAtIndex(this.currentFocusIndex);
    }

    /**
     * Handle arrow key spatial navigation.
     */
    handleArrowNavigation(event) {
        if (this.currentFocusIndex === -1) {
            this.currentFocusIndex = 0;
            this.focusElementAtIndex(0);
            return;
        }

        const currentElement = this.interactiveElements[this.currentFocusIndex];
        if (!currentElement) return;

        let nextIndex = this.currentFocusIndex;

        // Agent spatial navigation (left/right)
        if (currentElement.classList.contains('agent-icon')) {
            if (event.key === 'ArrowRight') {
                nextIndex = this.findNextAgent(this.currentFocusIndex, 1);
                event.preventDefault();
            } else if (event.key === 'ArrowLeft') {
                nextIndex = this.findNextAgent(this.currentFocusIndex, -1);
                event.preventDefault();
            } else if (event.key === 'ArrowDown') {
                // Move to first alert or next section
                nextIndex = this.findFirstOfType('alert-component');
                if (nextIndex !== -1) event.preventDefault();
            }
        }
        // Alert spatial navigation (up/down)
        else if (currentElement.classList.contains('alert-component')) {
            if (event.key === 'ArrowDown') {
                nextIndex = this.findNextAlert(this.currentFocusIndex, 1);
                event.preventDefault();
            } else if (event.key === 'ArrowUp') {
                nextIndex = this.findNextAlert(this.currentFocusIndex, -1);
                event.preventDefault();
            } else if (event.key === 'ArrowRight') {
                // Move to suggestion if available
                nextIndex = this.findFirstOfType('suggestion-card__btn');
                if (nextIndex !== -1) event.preventDefault();
            }
        }

        if (nextIndex !== this.currentFocusIndex && nextIndex !== -1) {
            this.currentFocusIndex = nextIndex;
            this.focusElementAtIndex(nextIndex);
        }
    }

    /**
     * Find next agent in the specified direction.
     */
    findNextAgent(startIndex, direction) {
        for (let i = startIndex + direction; i >= 0 && i < this.interactiveElements.length; i += direction) {
            if (this.interactiveElements[i].classList.contains('agent-icon')) {
                return i;
            }
        }
        return startIndex; // No next agent, stay on current
    }

    /**
     * Find next alert in the specified direction.
     */
    findNextAlert(startIndex, direction) {
        for (let i = startIndex + direction; i >= 0 && i < this.interactiveElements.length; i += direction) {
            if (this.interactiveElements[i].classList.contains('alert-component')) {
                return i;
            }
        }
        return startIndex; // No next alert, stay on current
    }

    /**
     * Find first element of a specific type.
     */
    findFirstOfType(className) {
        for (let i = 0; i < this.interactiveElements.length; i++) {
            if (this.interactiveElements[i].classList.contains(className)) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Handle Enter/Space activation.
     */
    handleActivation(event) {
        if (this.currentFocusIndex === -1) return;

        const element = this.interactiveElements[this.currentFocusIndex];
        if (!element) return;

        // Prevent default for Space on buttons to avoid scrolling
        if (event.key === ' ' && element.tagName !== 'INPUT') {
            event.preventDefault();
        }

        // Trigger click event
        element.click();

        // Announce activation
        this.announceToScreenReader(`Activated ${this.getElementDescription(element)}`);
    }

    /**
     * Handle Escape key.
     */
    handleEscape(event) {
        // Release focus trap if active
        if (this.focusTrapStack.length > 0) {
            event.preventDefault();
            this.releaseFocusTrap();
            return;
        }

        // Dismiss alert if focused
        if (this.currentFocusIndex !== -1) {
            const element = this.interactiveElements[this.currentFocusIndex];
            if (element && element.classList.contains('alert-component')) {
                event.preventDefault();
                // Trigger dismiss action
                const dismissBtn = element.querySelector('.alert-component__dismiss');
                if (dismissBtn) {
                    dismissBtn.click();
                } else {
                    element.remove();
                }
                this.announceToScreenReader('Alert dismissed');
            }
        }
    }

    /**
     * Focus element at specific index.
     */
    focusElementAtIndex(index) {
        if (index >= 0 && index < this.interactiveElements.length) {
            const element = this.interactiveElements[index];
            this.focusElement(element);
        }
    }

    /**
     * Focus a specific element.
     */
    focusElement(element) {
        if (!element) return;

        element.focus();

        // Scroll into view if needed
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
        });

        // Announce to screen reader
        this.announceToScreenReader(`Focused on ${this.getElementDescription(element)}`);
    }

    /**
     * Get human-readable description of element for screen readers.
     */
    getElementDescription(element) {
        if (element.hasAttribute('aria-label')) {
            return element.getAttribute('aria-label');
        }
        if (element.classList.contains('agent-icon')) {
            return `Agent ${element.dataset.agent || 'unknown'}`;
        }
        if (element.classList.contains('alert-component')) {
            return 'Alert';
        }
        if (element.classList.contains('suggestion-card__btn')) {
            return element.textContent.trim();
        }
        return element.textContent.trim() || 'Interactive element';
    }

    /**
     * Handle focus in event.
     */
    handleFocusIn(event) {
        const target = event.target;
        const index = this.interactiveElements.indexOf(target);

        if (index !== -1) {
            this.currentFocusIndex = index;
            target.classList.add('keyboard-focus');
        }
    }

    /**
     * Handle focus out event.
     */
    handleFocusOut(event) {
        const target = event.target;
        target.classList.remove('keyboard-focus');
    }

    /**
     * Create a focus trap for modal panels.
     * @param {HTMLElement} container - The container element to trap focus within.
     */
    createFocusTrap(container) {
        if (!container) return;

        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const trap = {
            container,
            elements: Array.from(focusableElements),
            previousFocus: document.activeElement
        };

        this.focusTrapStack.push(trap);

        // Focus first element in trap
        if (trap.elements.length > 0) {
            trap.elements[0].focus();
        }

        console.log('Focus trap created for', container.className);
    }

    /**
     * Handle keyboard navigation within focus trap.
     */
    handleFocusTrapKeyDown(event) {
        const trap = this.focusTrapStack[this.focusTrapStack.length - 1];
        if (!trap || trap.elements.length === 0) return;

        if (event.key === 'Tab') {
            event.preventDefault();

            const currentIndex = trap.elements.indexOf(document.activeElement);
            let nextIndex;

            if (event.shiftKey) {
                // Shift+Tab: previous element with wrapping
                nextIndex = currentIndex > 0 ? currentIndex - 1 : trap.elements.length - 1;
            } else {
                // Tab: next element with wrapping
                nextIndex = currentIndex < trap.elements.length - 1 ? currentIndex + 1 : 0;
            }

            trap.elements[nextIndex].focus();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            this.releaseFocusTrap();
        }
    }

    /**
     * Release the current focus trap.
     */
    releaseFocusTrap() {
        const trap = this.focusTrapStack.pop();
        if (!trap) return;

        // Restore focus to previous element
        if (trap.previousFocus && trap.previousFocus.focus) {
            trap.previousFocus.focus();
        }

        console.log('Focus trap released for', trap.container.className);
        this.announceToScreenReader('Modal closed');
    }

    /**
     * Focus the first interactive element.
     */
    focusFirst() {
        this.updateInteractiveElements();
        if (this.interactiveElements.length > 0) {
            this.currentFocusIndex = 0;
            this.focusElementAtIndex(0);
            this.announceToScreenReader('HUD focused for keyboard navigation');
        }
    }

    /**
     * Announce message to screen readers via ARIA live region.
     */
    announceToScreenReader(message) {
        let liveRegion = document.getElementById('sr-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'sr-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
        }

        // Clear and set new message
        liveRegion.textContent = '';
        setTimeout(() => {
            liveRegion.textContent = message;
        }, 100);
    }
}

export default FocusManager;
