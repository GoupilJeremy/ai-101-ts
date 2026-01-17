/**
 * AlertDetailPanel Component
 * Story 7.5: Implement Click-to-Expand for Alert Details and Fixes
 * 
 * Singleton component that displays detailed information about alerts,
 * including code diffs, reasoning, and action buttons.
 */
class AlertDetailPanel {
    static instance = null;

    constructor() {
        if (AlertDetailPanel.instance) {
            return AlertDetailPanel.instance;
        }

        this.panelEl = null;
        this.currentAlert = null;
        this.currentTarget = null;
        this.isVisible = false;

        this.init();
        AlertDetailPanel.instance = this;
    }

    /**
     * Get the singleton instance.
     */
    static getInstance() {
        if (!AlertDetailPanel.instance) {
            AlertDetailPanel.instance = new AlertDetailPanel();
        }
        return AlertDetailPanel.instance;
    }

    /**
     * Initialize the panel DOM element.
     */
    init() {
        if (this.panelEl) return;

        this.panelEl = document.createElement('div');
        this.panelEl.id = 'alert-detail-panel';
        this.panelEl.className = 'alert-panel';

        // ARIA attributes for accessibility
        this.panelEl.setAttribute('role', 'dialog');
        this.panelEl.setAttribute('aria-modal', 'true');
        this.panelEl.setAttribute('aria-hidden', 'true');

        // Initial state
        this.panelEl.style.opacity = '0';
        this.panelEl.style.pointerEvents = 'none';
        this.panelEl.style.position = 'fixed';
        this.panelEl.style.zIndex = '10001';
        this.panelEl.style.willChange = 'transform, opacity';

        document.body.appendChild(this.panelEl);

        // Setup global event listeners
        this.setupGlobalListeners();
    }

    /**
     * Setup global event listeners for dismissal.
     */
    setupGlobalListeners() {
        // Click outside to dismiss
        document.addEventListener('click', (e) => {
            if (this.isVisible && this.panelEl && !this.panelEl.contains(e.target) && e.target !== this.currentTarget) {
                this.hide();
            }
        });

        // Escape key to dismiss
        document.addEventListener('keydown', (e) => {
            if (this.isVisible && e.key === 'Escape') {
                this.hide();
                // Return focus to target
                if (this.currentTarget) {
                    this.currentTarget.focus();
                }
            }
        });
    }

    /**
     * Show the panel with alert data.
     * @param {Object} alertData - The alert data to display
     * @param {HTMLElement} targetElement - The element that triggered the panel
     */
    show(alertData, targetElement) {
        if (!alertData || !targetElement) return;

        this.currentAlert = alertData;
        this.currentTarget = targetElement;
        this.isVisible = true;

        this.render();
        this.position();

        // Reveal with animation
        requestAnimationFrame(() => {
            this.panelEl.style.opacity = '1';
            this.panelEl.style.pointerEvents = 'auto';
            this.panelEl.setAttribute('aria-hidden', 'false');
        });
    }

    /**
     * Hide the panel.
     */
    hide() {
        if (!this.isVisible) return;

        this.isVisible = false;

        requestAnimationFrame(() => {
            this.panelEl.style.opacity = '0';
            this.panelEl.style.pointerEvents = 'none';
            this.panelEl.setAttribute('aria-hidden', 'true');
        });

        this.currentAlert = null;
        this.currentTarget = null;
    }

    /**
     * Render the panel content.
     */
    render() {
        if (!this.currentAlert) return;

        const { id, severity, message, reasoning, codeSnippet, fix } = this.currentAlert;

        // Severity icons
        const severityIcons = {
            info: '💡',
            warning: '⚠️',
            critical: '🚨',
            urgent: '🔥'
        };

        const severityIcon = severityIcons[severity] || '❗';

        // Build panel HTML
        let html = `
            <div class="alert-panel__header">
                <div class="alert-panel__severity alert-panel__severity--${severity}">
                    <span class="alert-panel__severity-icon">${severityIcon}</span>
                    <span class="alert-panel__severity-label">${severity.toUpperCase()}</span>
                </div>
                <button class="alert-panel__btn--close" aria-label="Close panel">✕</button>
            </div>
            <div class="alert-panel__content">
                <h3 class="alert-panel__title" id="alert-panel-title">${message}</h3>
        `;

        // Add reasoning if available
        if (reasoning) {
            html += `
                <div class="alert-panel__reasoning">
                    <strong>Reasoning:</strong>
                    <p>${reasoning}</p>
                </div>
            `;
        }

        // Add code snippet if available
        if (codeSnippet) {
            html += `
                <div class="alert-panel__code-snippet">
                    <strong>Affected Code:</strong>
                    <pre><code>${this.escapeHtml(codeSnippet)}</code></pre>
                </div>
            `;
        }

        // Add code diff if fix is available
        if (fix) {
            html += `
                <div class="alert-panel__diff">
                    <strong>Proposed Fix:</strong>
                    <div class="alert-panel__diff-container">
                        <div class="alert-panel__diff-before">
                            <span class="alert-panel__diff-label">Before:</span>
                            <pre><code class="alert-panel__diff-code--removed">${this.escapeHtml(fix.before)}</code></pre>
                        </div>
                        <div class="alert-panel__diff-after">
                            <span class="alert-panel__diff-label">After:</span>
                            <pre><code class="alert-panel__diff-code--added">${this.escapeHtml(fix.after)}</code></pre>
                        </div>
                    </div>
                    ${fix.description ? `<p class="alert-panel__diff-description">${fix.description}</p>` : ''}
                </div>
            `;
        }

        html += `</div>`; // Close content

        // Add action buttons
        html += `
            <div class="alert-panel__actions">
                ${fix ? '<button class="alert-panel__btn alert-panel__btn--apply">⚡ Apply Fix</button>' : ''}
                <button class="alert-panel__btn alert-panel__btn--explain">💬 Explain More</button>
            </div>
        `;

        this.panelEl.innerHTML = html;

        // Set aria-labelledby
        this.panelEl.setAttribute('aria-labelledby', 'alert-panel-title');

        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Setup event listeners for panel interactions.
     */
    setupEventListeners() {
        // Close button
        const closeBtn = this.panelEl.querySelector('.alert-panel__btn--close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // Apply Fix button
        const applyBtn = this.panelEl.querySelector('.alert-panel__btn--apply');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.handleApplyFix());
        }

        // Explain More button
        const explainBtn = this.panelEl.querySelector('.alert-panel__btn--explain');
        if (explainBtn) {
            explainBtn.addEventListener('click', () => this.handleExplainMore());
        }

        // Focus trap: Tab cycle within panel
        this.setupFocusTrap();
    }

    /**
     * Setup focus trap for keyboard navigation.
     */
    setupFocusTrap() {
        const focusableElements = this.panelEl.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        this.panelEl.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });

        // Focus first element when panel opens
        requestAnimationFrame(() => {
            firstElement.focus();
        });
    }

    /**
     * Handle Apply Fix button click.
     */
    handleApplyFix() {
        if (!this.currentAlert || !window.vscode) return;

        // Send message to extension
        window.vscode.postMessage({
            type: 'toExtension:applyFix',
            alertId: this.currentAlert.id,
            fix: this.currentAlert.fix
        });

        // Update button state
        const applyBtn = this.panelEl.querySelector('.alert-panel__btn--apply');
        if (applyBtn) {
            applyBtn.textContent = '✓ Applying...';
            applyBtn.disabled = true;
        }
    }

    /**
     * Handle Explain More button click.
     */
    handleExplainMore() {
        if (!this.currentAlert || !window.vscode) return;

        // Send message to extension
        window.vscode.postMessage({
            type: 'toExtension:explainAlert',
            alertId: this.currentAlert.id
        });

        // Update button state
        const explainBtn = this.panelEl.querySelector('.alert-panel__btn--explain');
        if (explainBtn) {
            explainBtn.textContent = '⏳ Generating...';
            explainBtn.disabled = true;
        }
    }

    /**
     * Position the panel relative to the target element.
     * Implements anti-collision and viewport boundary respect.
     */
    position() {
        if (!this.currentTarget) return;

        const targetRect = this.currentTarget.getBoundingClientRect();
        const panelRect = this.panelEl.getBoundingClientRect();
        const padding = 16;

        // Default position: Right of the target
        let left = targetRect.right + padding;
        let top = targetRect.top;

        // Anti-collision: Check viewport boundaries
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Horizontal overflow (Right side)
        if (left + panelRect.width > viewportWidth - padding) {
            // Flip to Left
            left = targetRect.left - panelRect.width - padding;
        }

        // Vertical overflow (Bottom side)
        if (top + panelRect.height > viewportHeight - padding) {
            top = viewportHeight - panelRect.height - padding;
        }

        // Vertical overflow (Top side)
        if (top < padding) {
            top = padding;
        }

        // Horizontal overflow (Left side if flipped)
        if (left < padding) {
            left = padding;
            // Try positioning below target
            top = targetRect.bottom + padding;

            // If still overflows bottom, position above
            if (top + panelRect.height > viewportHeight - padding) {
                top = targetRect.top - panelRect.height - padding;
            }
        }

        // Final clamp for extreme cases
        left = Math.max(padding, Math.min(left, viewportWidth - panelRect.width - padding));
        top = Math.max(padding, Math.min(top, viewportHeight - panelRect.height - padding));

        // Apply position using translate3d for 60fps
        this.panelEl.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    }

    /**
     * Escape HTML to prevent XSS.
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

export default AlertDetailPanel;
