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
        this.historyToggleElement = null;
        this.currentPhase = 'prototype';

        // Initialize if document is ready
        if (typeof document !== 'undefined') {
            this.init();
        }
    }

    init() {
        if (!document) { return; }
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
        if (!this.metricsElement) { return; }

        this.lastMetrics = metrics;

        // Format cost
        const formattedCost = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(metrics.cost || 0);

        // Clear existing
        this.metricsElement.innerHTML = '';

        // Phase (Story 6.9)
        const phaseSpan = document.createElement('span');
        const phaseClass = this.currentPhase || 'prototype';
        phaseSpan.className = `vital-signs__phase vital-signs__phase--${phaseClass}`;
        const phaseLabel = this.getPhaseLabel(phaseClass);
        const phaseIcon = this.getPhaseIcon(phaseClass);
        phaseSpan.innerHTML = `${phaseIcon} ${phaseLabel}`;
        phaseSpan.setAttribute('data-tooltip-id', 'vital-signs-phase');
        phaseSpan.setAttribute('tabindex', '0');
        this.metricsElement.appendChild(phaseSpan);

        this.metricsElement.appendChild(document.createTextNode(' | '));

        // Tokens
        const tokensSpan = document.createElement('span');
        tokensSpan.className = 'vital-signs__tokens';
        tokensSpan.textContent = `Tokens: ${(metrics.tokens || 0).toLocaleString()}`;
        tokensSpan.setAttribute('data-tooltip-id', 'vital-signs-tokens');
        tokensSpan.setAttribute('tabindex', '0');
        this.metricsElement.appendChild(tokensSpan);

        this.metricsElement.appendChild(document.createTextNode(' | '));

        // Cost
        const costSpan = document.createElement('span');
        costSpan.className = 'vital-signs__cost';
        costSpan.textContent = `Cost: ${formattedCost}`;
        costSpan.setAttribute('data-tooltip-id', 'vital-signs-cost');
        costSpan.setAttribute('tabindex', '0');
        this.metricsElement.appendChild(costSpan);

        this.metricsElement.appendChild(document.createTextNode(' | '));

        // Files
        const filesSpan = document.createElement('span');
        filesSpan.className = 'vital-signs__files';
        filesSpan.textContent = `Files: ${metrics.files || 0}`;
        filesSpan.setAttribute('data-tooltip-id', 'vital-signs-files');
        filesSpan.setAttribute('tabindex', '0');

        // Add click handler for files
        if (this.options.onFilesClick) {
            filesSpan.style.cursor = 'pointer';
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

        // History Toggle (Task 5.1)
        this.metricsElement.appendChild(document.createTextNode(' | '));
        const historySpan = document.createElement('span');
        historySpan.id = 'history-toggle-btn';
        historySpan.className = 'vital-signs__history';
        historySpan.textContent = `History`;
        historySpan.title = 'View Decision History';
        historySpan.style.cursor = 'pointer';

        if (this.options.onHistoryClick) {
            historySpan.addEventListener('click', (e) => {
                e.stopPropagation();
                this.options.onHistoryClick();
            });
        }
        this.metricsElement.appendChild(historySpan);
        this.historyToggleElement = historySpan;
    }

    setPhase(phase) {
        this.currentPhase = phase;
        // The bar will be rerendered on the next metrics update,
        // but we can force a rerender if we keep the last metrics.
        if (this.lastMetrics) {
            this.updateMetrics(this.lastMetrics);
        }
    }

    getPhaseLabel(phase) {
        const labels = {
            'prototype': 'Prototype',
            'production': 'Production',
            'debug': 'Debug'
        };
        return labels[phase] || 'Prototype';
    }

    getPhaseIcon(phase) {
        const icons = {
            'prototype': '🧪',
            'production': '🏗️',
            'debug': '🐛'
        };
        return icons[phase] || '🧪';
    }
}

export default VitalSignsBar;
