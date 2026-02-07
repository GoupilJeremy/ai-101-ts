/**
 * Drop Zone Manager Component
 * Manages "TODO" and "Dismiss" drop zones for alerts
 * Story 7.3: Implement Drag-and-Drop Alerts to TODO List
 */
class DropZoneManager {
    constructor(parentContainer) {
        this.container = typeof parentContainer === 'string' ? document.getElementById(parentContainer) : parentContainer;
        this.todoZone = null;
        this.dismissZone = null;
    }

    /**
     * Render the drop zones
     * @param {Document} doc - The document object (default to global document)
     */
    render(doc = document) {
        if (!this.container) {return;}

        // Create Container for zones if not already present
        let zonesContainer = doc.getElementById('drop-zones-container');
        if (!zonesContainer) {
            zonesContainer = doc.createElement('div');
            zonesContainer.id = 'drop-zones-container';
            zonesContainer.className = 'drop-zones-container';
            this.container.appendChild(zonesContainer);
        }

        // Create TODO Zone
        this.todoZone = doc.createElement('div');
        this.todoZone.className = 'drop-zone drop-zone--todo';
        this.todoZone.innerHTML = `
            <div class="drop-zone__content">
                <div class="drop-zone__icon">📝</div>
                <div class="drop-zone__label">Add to TODO</div>
            </div>
        `;

        // Create Dismiss Zone
        this.dismissZone = doc.createElement('div');
        this.dismissZone.className = 'drop-zone drop-zone--dismiss';
        this.dismissZone.innerHTML = `
            <div class="drop-zone__content">
                <div class="drop-zone__icon">🗑️</div>
                <div class="drop-zone__label">Dismiss</div>
            </div>
        `;

        zonesContainer.appendChild(this.todoZone);
        zonesContainer.appendChild(this.dismissZone);

        this.setupEventListeners(doc);
    }

    setupEventListeners(doc) {
        // Global drag events to show/hide zones
        // Using capture phase for global detection
        doc.addEventListener('dragenter', (e) => {
            if (this.isValidDrag(e)) {
                this.showZones();
            }
        }, true);

        // We use a timeout or a counter to handle dragleave/dragenter jitter
        let dragCounter = 0;
        doc.addEventListener('dragenter', () => { dragCounter++; }, true);
        doc.addEventListener('dragleave', () => {
            dragCounter--;
            if (dragCounter === 0) {
                // Should we hide? Usually hide on drop or dragend is safer
            }
        }, true);

        doc.addEventListener('dragend', () => {
            dragCounter = 0;
            this.hideZones();
        }, true);

        // Zone-specific events
        this.setupZoneEvents(this.todoZone, 'toExtension:createTodo');
        this.setupZoneEvents(this.dismissZone, 'toExtension:dismissAlert');
    }

    isValidDrag(e) {
        // Check types to ensure it's an alert ID drag
        return e.dataTransfer && (e.dataTransfer.types.includes('text/plain') || e.dataTransfer.types.includes('Files'));
    }

    setupZoneEvents(zone, messageType) {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            zone.classList.add('drop-zone--active');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drop-zone--active');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drop-zone--active');
            this.hideZones();

            const alertId = e.dataTransfer.getData('text/plain');
            if (alertId) {
                // Strip "alert-" prefix if present
                const cleanId = alertId.startsWith('alert-') ? alertId.substring(6) : alertId;
                this.postMessage({
                    type: messageType,
                    alertId: cleanId
                });
            }
        });
    }

    showZones() {
        if (this.todoZone && this.dismissZone) {
            this.todoZone.parentElement?.classList.add('drop-zones-container--visible');
            this.todoZone.classList.add('drop-zone--visible');
            this.dismissZone.classList.add('drop-zone--visible');
        }
    }

    hideZones() {
        if (this.todoZone && this.dismissZone) {
            this.todoZone.parentElement?.classList.remove('drop-zones-container--visible');
            this.todoZone.classList.remove('drop-zone--visible');
            this.dismissZone.classList.remove('drop-zone--visible');
            this.todoZone.classList.remove('drop-zone--active');
            this.dismissZone.classList.remove('drop-zone--active');
        }
    }

    postMessage(message) {
        try {
            // @ts-ignore - acquireVsCodeApi is global in webview
            const vscode = typeof acquireVsCodeApi !== 'undefined' ? acquireVsCodeApi() : window.vscode;
            if (vscode) {
                vscode.postMessage(message);
            }
        } catch (e) {
            console.error('DropZoneManager: Failed to post message:', e);
        }
    }
}

export default DropZoneManager;
