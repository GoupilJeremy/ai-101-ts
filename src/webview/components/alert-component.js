/**
 * Alert Component
 * Handles rendering of individual alerts with drag-and-drop support
 * Story 7.3: Implement Drag-and-Drop Alerts to TODO List
 */
class AlertComponent {
    constructor(parentContainer, alert, options = {}) {
        this.container = typeof parentContainer === 'string' ? document.getElementById(parentContainer) : parentContainer;
        this.alert = alert;
        this.options = options;
        this.element = null;
    }

    render(doc = document) {
        if (!this.container) { return; }

        this.element = doc.getElementById(`alert-${this.alert.id}`);
        if (!this.element) {
            this.element = doc.createElement('div');
            this.element.id = `alert-${this.alert.id}`;
            this.container.appendChild(this.element);
        }

        const icons = { info: '💡', warning: '⚠️', critical: '🚨', urgent: '🔥' };

        this.element.className = `alert-component alert-${this.alert.severity}`;
        this.element.dataset.anchorLine = this.alert.anchorLine?.toString() || '';

        // Draggable support
        this.element.setAttribute('draggable', 'true');

        // ARIA attributes
        this.element.setAttribute('role', 'alert');
        this.element.setAttribute('aria-label', `Alert: ${this.alert.message}`);
        this.element.setAttribute('tabindex', '0');

        // Tooltip support - map severity to tooltip ID
        const tooltipId = `alert-${this.alert.severity}`;
        this.element.setAttribute('data-tooltip-id', tooltipId);

        this.element.innerHTML = `
            <div class="alert-icon-ideogram">${icons[this.alert.severity] || '❗'}</div>
        `;

        if (this.alert.data && this.alert.data.fix) {
            this.renderFixButton(doc);
        }

        this.setupEventListeners();

        return this.element;
    }

    renderFixButton(doc) {
        const fixBtn = doc.createElement('button');
        fixBtn.className = 'fix-btn';
        fixBtn.textContent = '⚡ Fix Edge Case';
        fixBtn.onclick = (e) => {
            e.stopPropagation();
            if (this.options.onFix) {
                this.options.onFix(this.alert.data);
            }
            fixBtn.textContent = 'Generating Fix...';
            fixBtn.disabled = true;
        };
        this.element.appendChild(fixBtn);
    }

    setupEventListeners() {
        // Click event to toggle AlertDetailPanel
        this.element.addEventListener('click', (e) => {
            // Don't trigger if clicking on fix button
            if (e.target.classList.contains('fix-btn')) {
                return;
            }

            if (this.options.onAlertClick) {
                this.options.onAlertClick(this.alert, this.element);
            }
        });

        // Drag events
        this.element.addEventListener('dragstart', (e) => {
            this.element.classList.add('drag-source');
            e.dataTransfer.effectAllowed = 'copyMove';
            e.dataTransfer.setData('text/plain', `alert-${this.alert.id}`);

            // Set drag image if needed, or use default ghost
        });

        this.element.addEventListener('dragend', () => {
            this.element.classList.remove('drag-source');
        });

        // Keyboard events
        this.element.addEventListener('keydown', (e) => {
            // Enter or Space to activate alert detail panel
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (this.options.onAlertClick) {
                    this.options.onAlertClick(this.alert, this.element);
                }
            } else if (e.key.toLowerCase() === 't') {
                e.preventDefault();
                this.handleAddToTodo();
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                this.handleDismiss();
            }
        });
    }

    handleAddToTodo() {
        if (this.options.onAddToTodo) {
            this.options.onAddToTodo(this.alert.id);
        }
    }

    handleDismiss() {
        if (this.options.onDismiss) {
            this.options.onDismiss(this.alert.id);
        }
    }
}

export default AlertComponent;
