/**
 * Vital Signs Bar Component
 * Displays real-time project metrics (Tokens, Cost, Files)
 * Story 6.3: Implement Visible Context File Tracking and Display
 */

class VitalSignsBar {
    constructor(elementId, stateManager, options = {}) {
        this.elementId = elementId;
        this.stateManager = stateManager;
        this.options = options;
        this.element = null;
        this.metricsElement = null;
        this.filesCountElement = null;

        // Initialize if document is ready
        if (typeof document !== 'undefined') {
            this.init();
        }
    }

    init() {
        if (!document) return;
        this.element = document.getElementById(this.elementId);
        this.metricsElement = document.getElementById('metrics');

        if (this.stateManager && this.stateManager.subscribe) {
            this.stateManager.subscribe((metrics) => this.updateMetrics(metrics));
        }
    }

    updateMetrics(metrics) {
        if (!this.metricsElement && typeof document !== 'undefined') {
            this.metricsElement = document.getElementById('metrics');
        }
        if (!this.metricsElement) return;

        // Format cost
        const formattedCost = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(metrics.cost || 0);

        // Clear existing
        this.metricsElement.innerHTML = '';

        // Tokens
        const tokensSpan = document.createElement('span');
        tokensSpan.className = 'vital-signs__tokens';
        tokensSpan.textContent = `Tokens: ${(metrics.tokens || 0).toLocaleString()}`;
        this.metricsElement.appendChild(tokensSpan);

        this.metricsElement.appendChild(document.createTextNode(' | '));

        // Cost
        const costSpan = document.createElement('span');
        costSpan.className = 'vital-signs__cost';
        costSpan.textContent = `Cost: ${formattedCost}`;
        this.metricsElement.appendChild(costSpan);

        this.metricsElement.appendChild(document.createTextNode(' | '));

        // Files
        const filesSpan = document.createElement('span');
        filesSpan.className = 'vital-signs__files';
        filesSpan.textContent = `Files: ${metrics.files || 0}`;

        // Add click handler for files
        if (this.options.onFilesClick) {
            filesSpan.style.cursor = 'pointer';
            filesSpan.title = 'View Context Files';
            filesSpan.addEventListener('click', (e) => {
                e.stopPropagation();
                this.options.onFilesClick();
            });
        }

        this.metricsElement.appendChild(filesSpan);
        this.filesCountElement = filesSpan;

        // Time (if valid)
        if (metrics.sessionTime !== undefined) {
            this.metricsElement.appendChild(document.createTextNode(' | '));
            const minutes = Math.floor(metrics.sessionTime / 60);
            const seconds = metrics.sessionTime % 60;
            const timeSpan = document.createElement('span');
            timeSpan.className = 'vital-signs__time';
            timeSpan.textContent = `Time: ${minutes}m ${seconds}s`;
            this.metricsElement.appendChild(timeSpan);
        }
    }
}

export default VitalSignsBar;
