/**
 * Timeline Component
 * Displays a chronological list of AI decisions and reasoning.
 * Story 6.8: Implement Decision and Reasoning History Timeline
 */
class TimelineComponent {
    constructor(containerId, stateManager) {
        this.containerId = containerId;
        this.stateManager = stateManager;
        this.history = [];
        this.isVisible = false;
        this.element = null;
        this.listElement = null;

        this.init();
    }

    init() {
        if (typeof document === 'undefined') return;

        const container = document.getElementById(this.containerId);
        if (!container) return;

        // Create the timeline panel
        this.element = document.createElement('div');
        this.element.id = 'timeline-panel';
        this.element.className = 'timeline-panel sumi-text';
        this.element.style.display = 'none';

        this.element.innerHTML = `
            <div class="timeline-panel__header">
                <span class="timeline-panel__title">History Timeline</span>
                <button class="timeline-panel__close" aria-label="Close">×</button>
            </div>
            <div class="timeline-panel__list"></div>
        `;

        container.appendChild(this.element);
        this.listElement = this.element.querySelector('.timeline-panel__list');

        // Close button handler
        this.element.querySelector('.timeline-panel__close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        // Prevent panel clicks from closing the HUD if it has similar handlers
        this.element.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    updateHistory(history) {
        this.history = history;
        if (this.isVisible) {
            this.render();
        }

        // Visual indicator could be handled here (Task 7.3)
        this.notifyNewEntry();
    }

    toggle() {
        this.isVisible = !this.isVisible;
        if (this.element) {
            this.element.style.display = this.isVisible ? 'flex' : 'none';
        }

        if (this.isVisible) {
            this.render();
        }
    }

    notifyNewEntry() {
        if (!this.isVisible) {
            const btn = document.getElementById('history-toggle-btn');
            if (btn) {
                btn.classList.add('has-new');
                setTimeout(() => btn.classList.remove('has-new'), 3000);
            }
        }
    }

    render() {
        if (!this.listElement) return;
        this.listElement.innerHTML = '';

        if (this.history.length === 0) {
            this.listElement.innerHTML = '<div class="timeline-empty">No history available yet.</div>';
            return;
        }

        // Render from newest to oldest
        [...this.history].reverse().forEach(entry => {
            const entryEl = this.renderEntry(entry);
            this.listElement.appendChild(entryEl);
        });
    }

    renderEntry(entry) {
        const el = document.createElement('div');
        el.className = `timeline-entry timeline-entry--${entry.status}`;
        el.dataset.id = entry.id;

        const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        el.innerHTML = `
            <div class="timeline-entry__summary">
                <span class="timeline-entry__time">${time}</span>
                <span class="timeline-entry__agent timeline-entry__agent--${entry.agent}">${entry.agent.charAt(0).toUpperCase() + entry.agent.slice(1)}</span>
                <span class="timeline-entry__text">${this.escapeHtml(entry.summary)}</span>
                <span class="timeline-entry__status-icon">${this.getStatusIcon(entry.status)}</span>
            </div>
            <div class="timeline-entry__details" style="display: none;">
                <div class="timeline-entry__reasoning">${entry.details.reasoning.replace(/\n/g, '<br>')}</div>
                ${entry.details.code ? `<pre class="timeline-entry__code"><code>${this.escapeHtml(entry.details.code)}</code></pre>` : ''}
            </div>
        `;

        el.addEventListener('click', () => {
            const details = el.querySelector('.timeline-entry__details');
            const isVisible = details.style.display === 'block';
            details.style.display = isVisible ? 'none' : 'block';
            el.classList.toggle('timeline-entry--expanded', !isVisible);
        });

        return el;
    }

    getStatusIcon(status) {
        switch (status) {
            case 'accepted': return '✅';
            case 'rejected': return '❌';
            case 'resolved': return '☑️';
            default: return '⏳';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

export default TimelineComponent;
