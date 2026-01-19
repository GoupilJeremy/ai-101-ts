import TooltipManager from './tooltip-manager.js';

/**
 * AgentComponent - Represents an individual AI agent in the HUD.
 * Handles rendering, status updates, and contextual tooltips.
 */
class AgentComponent {
    constructor(agentId, initialState) {
        this.agentId = agentId;
        this.state = initialState;
        this.element = null;
        this.tooltipManager = TooltipManager.getInstance();

        this.labelMap = {
            context: 'Context',
            architect: 'Architect',
            coder: 'Coder',
            reviewer: 'Reviewer'
        };

        this.iconMap = {
            context: '🔍',
            architect: '🏗️',
            coder: '💻',
            reviewer: '🛡️'
        };
    }

    /**
     * Render the agent icon to the DOM.
     * @param {HTMLElement} container - The HUD container.
     */
    render(container) {
        this.element = document.createElement('div');
        this.element.id = `agent-${this.agentId}`;
        this.element.className = `agent-icon ${this.state.status}`;
        this.element.dataset.agent = this.agentId;
        this.element.setAttribute('role', 'button');
        this.element.setAttribute('tabindex', '0');
        this.element.setAttribute('aria-label', `Agent ${this.labelMap[this.agentId]}: ${this.state.status}`);

        this.element.innerHTML = `
            <div class="agent-symbol">${this.iconMap[this.agentId] || '🤖'}</div>
            <div class="agent-label-text">${this.labelMap[this.agentId] || this.agentId}</div>
        `;

        container.appendChild(this.element);
        this.attachEvents();
    }

    /**
     * Attach hover and keyboard events for tooltips.
     */
    attachEvents() {
        // Add data-tooltip-id for automatic tooltip delegation
        const tooltipId = `agent-${this.agentId}`;
        this.element.setAttribute('data-tooltip-id', tooltipId);

        // Keyboard support for tooltip (Shift+F10 as per AC)
        this.element.addEventListener('keydown', (e) => {
            if (e.shiftKey && (e.key === 'F10' || e.code === 'F10')) {
                e.preventDefault();
                // Tooltip will be shown automatically via global delegation
            }
        });
    }

    /**
     * Update the agent's state and reflect in UI.
     * @param {Object} newState - The new state from backend.
     */
    update(newState) {
        this.state = newState;
        if (this.element) {
            requestAnimationFrame(() => {
                this.element.className = `agent-icon ${this.state.status}`;
                this.element.setAttribute('aria-label', `Agent ${this.labelMap[this.agentId]}: ${this.state.status}`);
            });
        }
    }

    /**
     * Generate HTML content for the tooltip based on current state.
     * @returns {string} HTML string.
     */
    generateTooltipContent() {
        const name = this.labelMap[this.agentId] || this.agentId;
        const status = this.state.status.toUpperCase();
        const task = this.state.currentTask || 'Waiting for tasks...';
        const reason = this.state.activationReason || this.getDefaultReason(this.agentId);
        const lastUpdate = this.formatLastUpdate(this.state.lastUpdate);
        const eta = this.state.estimatedCompletion ? ` | ETA: ${this.formatETA(this.state.estimatedCompletion)}` : '';

        return `
            <div class="tooltip__header">
                <span class="tooltip__agent-name">${name}</span>
                <span class="tooltip__state">${status}</span>
            </div>
            <div class="tooltip__task-desc">${task}</div>
            <div class="tooltip__reason">${reason}</div>
            <div class="tooltip__footer">
                <span>Updated ${lastUpdate}</span>
                <span>${eta}</span>
            </div>
        `;
    }

    getDefaultReason(agentId) {
        const reasons = {
            context: 'Activated to analyze project files and provide context.',
            architect: 'Activated to design structure and analyze architectural patterns.',
            coder: 'Activated to implement features and generate code.',
            reviewer: 'Activated to validate code quality and security.'
        };
        return reasons[agentId] || 'Activated for project assistance.';
    }

    formatLastUpdate(timestamp) {
        if (!timestamp) { return 'Just now'; }
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 5) { return 'Just now'; }
        if (seconds < 60) { return `${seconds}s ago`; }
        return `${Math.floor(seconds / 60)}m ago`;
    }

    formatETA(timestamp) {
        if (!timestamp) { return 'n/a'; }
        const seconds = Math.floor((timestamp - Date.now()) / 1000);
        if (seconds < 0) { return 'Any moment'; }
        if (seconds < 60) { return `${seconds}s`; }
        return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    }
}

export default AgentComponent;
