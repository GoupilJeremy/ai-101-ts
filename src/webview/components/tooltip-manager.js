/**
 * TooltipManager - Manages contextual hover tooltips for agents and other HUD elements.
 * Follows the Singleton pattern to ensure only one tooltip is visible at a time.
 * Adheres to Sumi-e aesthetic and 60fps performance requirements.
 */
class TooltipManager {
    static instance = null;

    constructor() {
        if (TooltipManager.instance) {
            return TooltipManager.instance;
        }

        this.tooltipEl = null;
        this.showTimeout = null;
        this.hideTimeout = null;
        this.currentTarget = null;
        this.content = null;

        // Constants from AC
        this.SHOW_DELAY_MS = 500;
        this.HIDE_DELAY_MS = 200;

        this.init();
        TooltipManager.instance = this;
    }

    /**
     * Get the singleton instance.
     */
    static getInstance() {
        if (!TooltipManager.instance) {
            TooltipManager.instance = new TooltipManager();
        }
        return TooltipManager.instance;
    }

    /**
     * Initialize the tooltip DOM element.
     */
    init() {
        if (this.tooltipEl) return;

        this.tooltipEl = document.createElement('div');
        this.tooltipEl.id = 'hud-tooltip';
        this.tooltipEl.className = 'tooltip';
        this.tooltipEl.setAttribute('role', 'tooltip');
        this.tooltipEl.setAttribute('aria-hidden', 'true');

        // Initial state
        this.tooltipEl.style.opacity = '0';
        this.tooltipEl.style.pointerEvents = 'none';
        this.tooltipEl.style.position = 'fixed';
        this.tooltipEl.style.zIndex = '10000';
        this.tooltipEl.style.willChange = 'transform, opacity';

        document.body.appendChild(this.tooltipEl);
    }

    /**
     * Show the tooltip for a target element.
     * @param {HTMLElement} target - The element being hovered.
     * @param {string|HTMLElement} content - The content to display.
     */
    show(target, content) {
        // Clear any pending hide
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }

        // If hovering same target and tooltip is already visible or pending, do nothing
        if (this.currentTarget === target && (this.showTimeout || this.tooltipEl.style.opacity !== '0')) {
            return;
        }

        // If hovering a new target while another is visible, hide current immediately
        if (this.currentTarget && this.currentTarget !== target) {
            this.hideImmediately();
        }

        this.currentTarget = target;
        this.content = content;

        // Start show delay
        this.showTimeout = setTimeout(() => {
            this.render();
            this.showTimeout = null;
        }, this.SHOW_DELAY_MS);
    }

    /**
     * Hide the tooltip with a delay.
     */
    hide() {
        // Clear any pending show
        if (this.showTimeout) {
            clearTimeout(this.showTimeout);
            this.showTimeout = null;
        }

        // Start hide delay
        if (!this.hideTimeout) {
            this.hideTimeout = setTimeout(() => {
                this.hideImmediately();
                this.hideTimeout = null;
            }, this.HIDE_DELAY_MS);
        }
    }

    /**
     * Hide the tooltip immediately.
     */
    hideImmediately() {
        if (this.tooltipEl) {
            requestAnimationFrame(() => {
                this.tooltipEl.style.opacity = '0';
                this.tooltipEl.setAttribute('aria-hidden', 'true');
                if (this.currentTarget) {
                    this.currentTarget.removeAttribute('aria-describedby');
                }
                this.currentTarget = null;
            });
        }
    }

    /**
     * Render the tooltip content and position it.
     */
    render() {
        if (!this.currentTarget || !this.tooltipEl) return;

        // Set content
        if (typeof this.content === 'string') {
            this.tooltipEl.innerHTML = this.content;
        } else {
            this.tooltipEl.innerHTML = '';
            this.tooltipEl.appendChild(this.content);
        }

        // Position tooltip
        this.position();

        // Reveal with fade-in
        requestAnimationFrame(() => {
            this.tooltipEl.style.opacity = '1';
            this.tooltipEl.setAttribute('aria-hidden', 'false');
            this.currentTarget.setAttribute('aria-describedby', this.tooltipEl.id);
        });
    }

    /**
     * Position the tooltip relative to the current target.
     * Implements anti-collision and viewport boundary respect.
     */
    position() {
        const targetRect = this.currentTarget.getBoundingClientRect();
        const tooltipRect = this.tooltipEl.getBoundingClientRect();
        const padding = 12;

        // Default position: Right of the agent
        let left = targetRect.right + padding;
        let top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);

        // Anti-collision: Check viewport boundaries
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Horizontal overflow (Right side)
        if (left + tooltipRect.width > viewportWidth - padding) {
            // Flip to Left
            left = targetRect.left - tooltipRect.width - padding;
        }

        // Vertical overflow (Bottom side)
        if (top + tooltipRect.height > viewportHeight - padding) {
            top = viewportHeight - tooltipRect.height - padding;
        }

        // Vertical overflow (Top side)
        if (top < padding) {
            top = padding;
        }

        // Horizontal overflow (Left side if flipped)
        if (left < padding) {
            // If it still overflows left, try top/bottom positioning or just clamp
            left = padding;
            // Shift vertically to avoid covering the icon if possible
            if (Math.abs(top - targetRect.top) < targetRect.height) {
                top = targetRect.bottom + padding;
            }
        }

        // Final clamp for extreme cases
        left = Math.max(padding, Math.min(left, viewportWidth - tooltipRect.width - padding));
        top = Math.max(padding, Math.min(top, viewportHeight - tooltipRect.height - padding));

        // Apply position using translate3d for 60fps
        this.tooltipEl.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    }

    /**
     * Global event delegation or individual binding helper.
     */
    attach(element, contentGenerator) {
        element.addEventListener('mouseenter', () => this.show(element, contentGenerator()));
        element.addEventListener('mouseleave', () => this.hide());
        element.addEventListener('focus', () => this.show(element, contentGenerator()));
        element.addEventListener('blur', () => this.hide());
    }
}

export default TooltipManager;
