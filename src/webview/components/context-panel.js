/**
 * Context Panel Component
 * Displays and manages the list of files currently in AI context
 * Story 6.3: Implement Visible Context File Tracking and Display
 */

class ContextPanel {
    constructor(containerId, stateManager) {
        this.containerId = containerId;
        this.stateManager = stateManager;
        this.element = null;
        this.isExpanded = false;
        this.files = [];
        this.unsubscribeCallback = null;
    }

    /**
     * Render the context panel in the DOM
     */
    render(doc) {
        if (!doc) {doc = typeof document !== 'undefined' ? document : null;}
        if (!doc) {return;}

        // Store document reference for internal use
        this.document = doc;

        const container = doc.getElementById(this.containerId);
        if (!container) {return;}

        // Create main panel element
        this.element = doc.createElement('div');
        this.element.className = 'context-panel context-panel--collapsed';
        this.element.setAttribute('role', 'region');
        this.element.setAttribute('aria-label', 'Context Files Panel');

        // Create panel header
        const header = doc.createElement('div');
        header.className = 'context-panel__header';

        const title = doc.createElement('h3');
        title.className = 'context-panel__title';
        title.textContent = 'Context Files';
        header.appendChild(title);

        const toggleButton = doc.createElement('button');
        toggleButton.className = 'context-panel__toggle';
        toggleButton.setAttribute('aria-label', 'Toggle context panel');
        toggleButton.textContent = '▼';
        toggleButton.addEventListener('click', () => this.toggle());
        header.appendChild(toggleButton);

        this.element.appendChild(header);

        // Create file list container
        const fileList = doc.createElement('div');
        fileList.className = 'context-panel__file-list';
        this.element.appendChild(fileList);

        // Create summary footer
        const footer = doc.createElement('div');
        footer.className = 'context-panel__footer';

        this.totalTokensElement = doc.createElement('div');
        this.totalTokensElement.className = 'context-panel__total-tokens';
        footer.appendChild(this.totalTokensElement);

        this.budgetElement = doc.createElement('div');
        this.budgetElement.className = 'context-panel__budget-percentage';
        footer.appendChild(this.budgetElement);

        this.element.appendChild(footer);

        // Add to container
        container.appendChild(this.element);

        // Subscribe to state updates
        this.subscribeToUpdates();

        // Initial render
        this.updateDisplay();
    }

    /**
     * Update the file list display
     */
    updateFiles(files) {
        this.files = files || [];
        this.sortFiles();
        this.updateDisplay();
    }

    /**
     * Sort files by relevance score (current > imports > recent > related)
     */
    sortFiles() {
        const relevanceOrder = { current: 0, imports: 1, recent: 2, related: 3 };

        this.files.sort((a, b) => {
            const aScore = relevanceOrder[a.relevance] !== undefined ? relevanceOrder[a.relevance] : 999;
            const bScore = relevanceOrder[b.relevance] !== undefined ? relevanceOrder[b.relevance] : 999;
            return aScore - bScore;
        });
    }

    /**
     * Update the visual display
     */
    updateDisplay(doc) {
        // Use passed doc, or stored doc, or global document
        if (!doc) {doc = this.document || (typeof document !== 'undefined' ? document : null);}
        if (!doc) {return;}
        if (!this.element) {return;}

        const fileList = this.element.querySelector('.context-panel__file-list');
        if (!fileList) {return;}

        // Clear existing content
        fileList.innerHTML = '';

        // Add file items
        this.files.forEach(file => {
            const fileItem = this.createFileItem(file, doc);
            fileList.appendChild(fileItem);
        });

        // Update summary
        this.updateSummary();
    }

    /**
     * Create a file item element
     */
    createFileItem(file, doc = this.document) {
        const item = doc.createElement('div');
        item.className = `context-panel__file-item context-panel__file-item--${file.relevance}`;

        // File name (clickable)
        const nameElement = doc.createElement('span');
        nameElement.className = 'context-panel__file-name';
        nameElement.textContent = file.filename;
        nameElement.addEventListener('click', () => this.openFile(file.path));
        item.appendChild(nameElement);

        // File path
        const pathElement = doc.createElement('span');
        pathElement.className = 'context-panel__file-path';
        pathElement.textContent = file.path;
        item.appendChild(pathElement);

        // Token count
        const tokensElement = doc.createElement('span');
        tokensElement.className = 'context-panel__file-tokens';
        tokensElement.textContent = `${file.tokens} tokens`;
        item.appendChild(tokensElement);

        // Status
        const statusElement = doc.createElement('span');
        statusElement.className = `context-panel__file-status context-panel__file-status--${file.status}`;
        statusElement.textContent = file.status;
        item.appendChild(statusElement);

        // Timestamp for recent files
        if (file.relevance === 'recent' && file.lastModified) {
            const timeElement = doc.createElement('span');
            timeElement.className = 'context-panel__file-timestamp';
            timeElement.textContent = this.formatTimestamp(file.lastModified);
            item.appendChild(timeElement);
        }

        // Action buttons
        const actionsElement = doc.createElement('div');
        actionsElement.className = 'context-panel__file-actions';

        // Remove button
        const removeButton = doc.createElement('button');
        removeButton.className = 'context-panel__file-remove';
        removeButton.setAttribute('aria-label', `Remove ${file.filename} from context`);
        removeButton.textContent = '✕';
        removeButton.addEventListener('click', () => this.removeFile(file.path));
        actionsElement.appendChild(removeButton);

        // View button (for summarized files)
        if (file.status === 'summarized') {
            const viewButton = doc.createElement('button');
            viewButton.className = 'context-panel__file-view';
            viewButton.setAttribute('aria-label', `View full content of ${file.filename}`);
            viewButton.textContent = '👁';
            viewButton.addEventListener('click', () => this.viewFullContent(file.path));
            actionsElement.appendChild(viewButton);
        }

        // Refresh button
        const refreshButton = doc.createElement('button');
        refreshButton.className = 'context-panel__file-refresh';
        refreshButton.setAttribute('aria-label', `Refresh ${file.filename}`);
        refreshButton.textContent = '↻';
        refreshButton.addEventListener('click', () => this.refreshFile(file.path));
        actionsElement.appendChild(refreshButton);

        item.appendChild(actionsElement);

        return item;
    }

    /**
     * Update summary information
     */
    updateSummary() {
        const totalTokens = this.files.reduce((sum, file) => sum + (file.tokens || 0), 0);

        if (this.totalTokensElement) {
            this.totalTokensElement.textContent = `Total: ${totalTokens} tokens`;
        }

        if (this.budgetElement) {
            // Assume 4096 token budget for now
            const budgetPercent = Math.round((totalTokens / 4096) * 100);
            this.budgetElement.textContent = `${budgetPercent}% of budget`;
        }
    }

    /**
     * Format timestamp for display
     */
    formatTimestamp(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) {return 'just now';}
        if (minutes < 60) {return `${minutes}m ago`;}

        const hours = Math.floor(minutes / 60);
        if (hours < 24) {return `${hours}h ago`;}

        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    /**
     * Toggle panel visibility
     */
    toggle() {
        this.isExpanded = !this.isExpanded;

        if (this.element) {
            const toggleButton = this.element.querySelector('.context-panel__toggle');
            const fileList = this.element.querySelector('.context-panel__file-list');

            if (this.isExpanded) {
                this.element.classList.remove('context-panel--collapsed');
                this.element.classList.add('context-panel--expanded');
                if (toggleButton) {toggleButton.textContent = '▲';}
                if (fileList) {fileList.style.display = 'block';}
            } else {
                this.element.classList.remove('context-panel--expanded');
                this.element.classList.add('context-panel--collapsed');
                if (toggleButton) {toggleButton.textContent = '▼';}
                if (fileList) {fileList.style.display = 'none';}
            }
        }
    }

    /**
     * Subscribe to state manager updates
     */
    subscribeToUpdates() {
        if (this.stateManager && this.stateManager.subscribe) {
            this.unsubscribeCallback = this.stateManager.subscribe((files) => {
                this.updateFiles(files);
            });
        }
    }

    /**
     * Open file in editor
     */
    openFile(filePath) {
        if (typeof window !== 'undefined' && window.vscode) {
            window.vscode.postMessage({
                type: 'toExtension:openFile',
                filePath: filePath
            });
        }
    }

    /**
     * Remove file from context
     */
    removeFile(filePath) {
        if (this.stateManager && this.stateManager.removeFile) {
            this.stateManager.removeFile(filePath);
        }
    }

    /**
     * View full content of file
     */
    viewFullContent(filePath) {
        if (this.stateManager && this.stateManager.refreshFile) {
            this.stateManager.refreshFile(filePath);
        }
    }

    /**
     * Refresh file content
     */
    refreshFile(filePath) {
        if (this.stateManager && this.stateManager.refreshFile) {
            this.stateManager.refreshFile(filePath);
        }
    }

    /**
     * Save context snapshot
     */
    saveContextSnapshot() {
        // Implementation for saving context snapshot
        // This would typically send a message to the extension
        if (typeof window !== 'undefined' && window.vscode) {
            window.vscode.postMessage({
                type: 'toExtension:saveContextSnapshot',
                files: this.files,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.unsubscribeCallback) {
            this.unsubscribeCallback();
        }

        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }

        this.element = null;
        this.files = [];
    }
}

export default ContextPanel;