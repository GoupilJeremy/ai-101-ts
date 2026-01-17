// Webview Entry Point
// @ts-ignore
import ContextPanel from './components/context-panel.js';
// @ts-ignore
import VitalSignsBar from './components/vital-signs-bar.js';
// @ts-ignore
import TimelineComponent from './components/timeline-component.js';
// @ts-ignore
import SuggestionCard from './components/suggestion-card.js';

console.log('Webview loaded');

// Initialize Components
let contextPanel: any;
let vitalSignsBar: any;
let timelineComponent: any;

const stateManagerAdapter = {
    subscribe: (callback: any) => { /* No-op, we call update manually for now */ },
    removeFile: (filePath: string) => {
        getVsCodeApi().postMessage({
            type: 'toExtension:removeContextFile',
            filePath: filePath
        });
    },
    refreshFile: (filePath: string) => {
        getVsCodeApi().postMessage({
            type: 'toExtension:refreshContextFile',
            filePath: filePath
        });
    }
};

function initializeComponents() {
    // Initialize Vital Signs Bar
    vitalSignsBar = new VitalSignsBar('vital-signs-bar', stateManagerAdapter, {
        onFilesClick: () => {
            if (contextPanel) {
                contextPanel.toggle();
            }
        },
        onHistoryClick: () => {
            if (timelineComponent) {
                timelineComponent.toggle();
            }
        }
    });

    // Initialize Context Panel
    contextPanel = new ContextPanel('hud-container', stateManagerAdapter);
    contextPanel.render();

    // Initialize Timeline Component
    timelineComponent = new TimelineComponent('hud-container', stateManagerAdapter);
}

// Performance Monitoring
let frameCount = 0;
let lastTime = performance.now();
let fps = 60;
let performanceMode = false;

// Mode tracking for condensed rendering
let currentMode = 'learning';
let currentVerbosity: 'low' | 'high' = 'high';

// Low FPS detection state
let consecutiveLowFpsCount = 0;
let fpsReportSent = false;

function monitorFPS() {
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = now;

        // Performance Mode: Report low FPS to extension for detection
        if (fps < 30 && !performanceMode) {
            consecutiveLowFpsCount++;
            console.warn(`Low FPS detected: ${fps}. Recommendation: Enable Performance Mode.`);

            // Report to extension after 3 consecutive low FPS readings
            if (consecutiveLowFpsCount >= 3 && !fpsReportSent) {
                fpsReportSent = true;
                try {
                    getVsCodeApi().postMessage({
                        type: 'toExtension:lowFpsDetected',
                        fps: fps,
                        consecutiveCount: consecutiveLowFpsCount
                    });
                } catch (e) {
                    // Ignore if VSCode API not available
                }
            }

            // Apply no-gpu class if very low FPS
            if (fps < 20) {
                document.body.classList.add('no-gpu');
            }
        } else {
            consecutiveLowFpsCount = 0;
        }
    }
    requestAnimationFrame(monitorFPS);
}
monitorFPS();

// Async Rendering Pipeline (Batching & Debouncing)
const updateQueue: any[] = [];
let isRenderingRequested = false;

function requestUpdate(update: any) {
    updateQueue.push(update);
    if (!isRenderingRequested) {
        isRenderingRequested = true;
        requestAnimationFrame(processUpdateQueue);
    }
}

function processUpdateQueue() {
    isRenderingRequested = false;

    // Process only the last update of each type in this frame to avoid redundant work
    const latestUpdates: Record<string, any> = {};

    while (updateQueue.length > 0) {
        const update = updateQueue.shift();
        const key = `${update.type}:${update.agent || ''}:${update.alertId || ''}`;
        latestUpdates[key] = update;
    }

    Object.values(latestUpdates).forEach(update => {
        applyUpdate(update);
    });
}

function applyUpdate(update: any) {
    switch (update.type) {
        case 'agentState':
            executeUpdateAgentHUD(update.agent, update.state);
            break;
        case 'metrics':
            executeUpdateMetricsUI(update.metrics);
            break;
        case 'cursor':
            executeHandleCursorUpdate(update.cursor);
            break;
        case 'phase':
            executeUpdatePhaseUI(update.phase);
            break;
        case 'newAlert':
            executeRenderAlert(update.alert);
            break;
        case 'clearAlerts':
            document.querySelectorAll('.alert-component').forEach(el => el.remove());
            break;
        case 'history':
            if (timelineComponent) {
                timelineComponent.updateHistory(update.history);
            }
            break;
        case 'fullState':
            if (update.mode && update.config) {
                applyModeUpdate(update.mode, update.config);
            }
            if (update.hudVisible !== undefined) {
                updateHUDVisibility(update.hudVisible);
            }
            Object.entries(update.states).forEach(([agent, state]: any) => {
                executeUpdateAgentHUD(agent, state);
            });
            if (update.metrics) executeUpdateMetricsUI(update.metrics);
            if (update.phase) executeUpdatePhaseUI(update.phase);
            if (update.alerts) update.alerts.forEach((alert: any) => executeRenderAlert(alert));
            if (update.history && timelineComponent) {
                timelineComponent.updateHistory(update.history);
            }
            break;
    }
}

function applyModeUpdate(mode: string, config: any) {
    performanceMode = (mode === 'performance' || config.animationComplexity === 'none');

    // Track current mode and verbosity for condensed rendering (Expert Mode)
    currentMode = mode;
    currentVerbosity = config.explanationVerbositiy || 'high';

    // Performance Mode: Apply additional optimizations
    if (mode === 'performance') {
        console.log('Performance Mode activated - applying optimizations');
        // Reduce animation complexity and hide non-essential elements
        document.body.classList.add('performance-mode');
    } else {
        document.body.classList.remove('performance-mode');
    }

    // Update all existing agents and alerts to reflect the new mode
    const agents = document.querySelectorAll('.agent-icon');
    agents.forEach((el: any) => {
        el.classList.toggle('low-fx', performanceMode);
        el.classList.toggle('show-labels', config.showLabels);
    });

    const hudContainer = document.getElementById('hud-container');
    if (hudContainer) {
        hudContainer.style.opacity = config.hudOpacity.toString();
        hudContainer.classList.toggle('focus-mode', mode === 'focus');
        hudContainer.classList.toggle('expert-mode', mode === 'expert');
        // Set data-mode attribute for CSS selectors
        hudContainer.setAttribute('data-mode', mode);

        // Apply large text mode if enabled (Team Mode only)
        // Note: In webview context, we use the VSCode API via acquireVsCodeApi()
        // For now, we'll use a simple flag that can be set via message passing
        if (mode === 'team') {
            hudContainer.setAttribute('data-large-text', 'true');
            // Add comment buttons to existing alerts when switching to Team Mode
            addCommentButtonToAlerts();
        } else {
            hudContainer.removeAttribute('data-large-text');
        }
    }

    // Also set data-mode on metrics (Vital Signs Bar) for auto-hide
    const metricsEl = document.getElementById('metrics');
    if (metricsEl) {
        metricsEl.setAttribute('data-mode', mode);
    }

    console.log(`AI-101 Webview: Mode=${mode}, Verbosity=${currentVerbosity}, HUD Opacity=${config.hudOpacity}`);
}

// Keyboard Navigation State
let currentFocusIndex = -1;
let interactiveElements: HTMLElement[] = [];

// Initialize keyboard navigation
function initializeKeyboardNavigation() {
    updateInteractiveElements();

    // Add keydown event listener
    document.addEventListener('keydown', (e) => {
        handleKeyDown(e);
        handleGlobalHotkeys(e);
    });

    // Add focus event listeners for focus management
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
}

function updateInteractiveElements() {
    // Get all interactive elements (agents and alerts)
    interactiveElements = Array.from(document.querySelectorAll('.agent-icon, .alert-component')) as HTMLElement[];

    // Ensure all have tabindex
    interactiveElements.forEach(el => {
        if (!el.hasAttribute('tabindex')) {
            el.setAttribute('tabindex', '0');
        }
    });
}

function handleKeyDown(event: KeyboardEvent) {
    if (interactiveElements.length === 0) return;

    switch (event.key) {
        case 'Tab':
            event.preventDefault();
            handleTabNavigation(event.shiftKey);
            break;
        case 'ArrowRight':
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'ArrowDown':
            event.preventDefault();
            handleArrowNavigation(event.key);
            break;
        case 'Enter':
        case ' ':
            event.preventDefault();
            handleActivation();
            break;
        case 'Escape':
            event.preventDefault();
            handleEscape();
            break;
    }
}

function handleGlobalHotkeys(event: KeyboardEvent) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

    if (cmdOrCtrl && event.key === 'Enter') {
        event.preventDefault();
        // Find visible suggestion card
        const suggestionEl = document.querySelector('.suggestion-card:not(.suggestion-card--accepted):not(.suggestion-card--rejected)') as HTMLElement;
        if (suggestionEl) {
            const acceptBtn = suggestionEl.querySelector('.suggestion-card__btn--accept') as HTMLButtonElement;
            if (acceptBtn) acceptBtn.click();
        }
    } else if (cmdOrCtrl && (event.key === 'Backspace' || (isMac && event.key === 'Delete'))) {
        event.preventDefault();
        // Find visible suggestion card
        const suggestionEl = document.querySelector('.suggestion-card:not(.suggestion-card--accepted):not(.suggestion-card--rejected)') as HTMLElement;
        if (suggestionEl) {
            const rejectBtn = suggestionEl.querySelector('.suggestion-card__btn--reject') as HTMLButtonElement;
            if (rejectBtn) rejectBtn.click();
        }
    }
}

function handleTabNavigation(shiftKey: boolean) {
    if (currentFocusIndex === -1) {
        // No current focus, start with first element
        currentFocusIndex = 0;
    } else {
        if (shiftKey) {
            // Shift+Tab: previous
            currentFocusIndex = currentFocusIndex > 0 ? currentFocusIndex - 1 : interactiveElements.length - 1;
        } else {
            // Tab: next
            currentFocusIndex = currentFocusIndex < interactiveElements.length - 1 ? currentFocusIndex + 1 : 0;
        }
    }

    focusElement(currentFocusIndex);
}

function handleArrowNavigation(key: string) {
    if (currentFocusIndex === -1) {
        currentFocusIndex = 0;
        focusElement(currentFocusIndex);
        return;
    }

    const currentElement = interactiveElements[currentFocusIndex];
    let nextIndex = currentFocusIndex;

    if (currentElement.classList.contains('agent-icon')) {
        // Agent navigation
        if (key === 'ArrowRight') {
            // Find next agent
            for (let i = currentFocusIndex + 1; i < interactiveElements.length; i++) {
                if (interactiveElements[i].classList.contains('agent-icon')) {
                    nextIndex = i;
                    break;
                }
            }
        } else if (key === 'ArrowLeft') {
            // Find previous agent
            for (let i = currentFocusIndex - 1; i >= 0; i--) {
                if (interactiveElements[i].classList.contains('agent-icon')) {
                    nextIndex = i;
                    break;
                }
            }
        }
    } else if (currentElement.classList.contains('alert-component')) {
        // Alert navigation
        if (key === 'ArrowDown') {
            // Find next alert
            for (let i = currentFocusIndex + 1; i < interactiveElements.length; i++) {
                if (interactiveElements[i].classList.contains('alert-component')) {
                    nextIndex = i;
                    break;
                }
            }
        } else if (key === 'ArrowUp') {
            // Find previous alert
            for (let i = currentFocusIndex - 1; i >= 0; i--) {
                if (interactiveElements[i].classList.contains('alert-component')) {
                    nextIndex = i;
                    break;
                }
            }
        }
    }

    if (nextIndex !== currentFocusIndex) {
        currentFocusIndex = nextIndex;
        focusElement(currentFocusIndex);
    }
}

function handleActivation() {
    if (currentFocusIndex === -1) return;

    const element = interactiveElements[currentFocusIndex];
    if (element.classList.contains('agent-icon')) {
        // Activate agent (could expand details, show menu, etc.)
        console.log('Activating agent:', element.dataset.agent);
        // For now, just announce
        announceToScreenReader(`Agent ${element.dataset.agent} activated`);
    } else if (element.classList.contains('alert-component')) {
        // Activate alert (could expand, accept suggestion, etc.)
        console.log('Activating alert:', element.id);
        announceToScreenReader('Alert activated');
    }
}

function handleEscape() {
    if (currentFocusIndex === -1) return;

    const element = interactiveElements[currentFocusIndex];
    if (element.classList.contains('alert-component')) {
        // Dismiss/collapse alert
        console.log('Dismissing alert:', element.id);
        announceToScreenReader('Alert dismissed');
    }
}

function focusElement(index: number) {
    if (index >= 0 && index < interactiveElements.length) {
        interactiveElements[index].focus();
    }
}

function focusFirstElement() {
    updateInteractiveElements();
    if (interactiveElements.length > 0) {
        currentFocusIndex = 0;
        focusElement(0);
        announceToScreenReader('HUD focused for keyboard navigation');
    }
}

function handleFocusIn(event: FocusEvent) {
    const target = event.target as HTMLElement;
    const index = interactiveElements.indexOf(target);
    if (index !== -1) {
        currentFocusIndex = index;
        target.classList.add('keyboard-focus');
    }
}

function handleFocusOut(event: FocusEvent) {
    const target = event.target as HTMLElement;
    target.classList.remove('keyboard-focus');
}

function announceToScreenReader(message: string) {
    // Create a live region for screen reader announcements
    let liveRegion = document.getElementById('sr-live-region');
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'sr-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = message;
}

// Initialize keyboard navigation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeKeyboardNavigation();
        initializeComponents();
    });
} else {
    initializeKeyboardNavigation();
    initializeComponents();
}

// Listen for messages from the extension
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
        case 'toWebview:agentStateUpdate':
            requestUpdate({ type: 'agentState', agent: message.agent, state: message.state });
            break;
        case 'toWebview:metricsUpdate':
            requestUpdate({ type: 'metrics', metrics: message.metrics });
            break;
        case 'toWebview:cursorUpdate':
            requestUpdate({ type: 'cursor', cursor: message.cursor });
            break;
        case 'toWebview:phaseUpdate':
            requestUpdate({ type: 'phase', phase: message.phase });
            break;
        case 'toWebview:newAlert':
            requestUpdate({ type: 'newAlert', alert: message.alert, alertId: message.alert.id });
            break;
        case 'toWebview:clearAlerts':
            requestUpdate({ type: 'clearAlerts' });
            break;
        case 'toWebview:historyUpdate':
            requestUpdate({ type: 'history', history: message.history });
            break;
        case 'toWebview:modeUpdate':
            console.log('Mode update received:', message.mode, message.config);
            applyModeUpdate(message.mode, message.config);
            break;
        case 'toWebview:fullStateUpdate':
            requestUpdate({
                type: 'fullState',
                states: message.states,
                metrics: message.metrics,
                alerts: message.alerts,
                history: message.history,
                mode: message.mode,
                config: message.modeConfig,
                phase: message.phase
            });
            break;
        case 'toWebview:largeTextUpdate':
            console.log('Large text update received:', message.enabled);
            updateLargeTextMode(message.enabled);
            break;
        case 'toWebview:teamMetricsUpdate':
            console.log('Team metrics update received:', message.metrics);
            updateTeamMetricsDisplay(message.metrics);
            break;
        case 'toWebview:annotationAdded':
            console.log('Annotation added:', message.annotation);
            renderAnnotation(message.annotation);
            break;
        case 'toWebview:annotationsUpdate':
            console.log('Annotations update received:', message.annotations);
            updateAnnotationsDisplay(message.annotations);
            break;
        case 'toWebview:highContrastUpdate':
            console.log('High Contrast update received:', message.enabled);
            updateHighContrastMode(message.enabled, message.config);
            break;
        case 'toWebview:colorblindUpdate':
            console.log('Colorblind update received:', message.enabled, message.config);
            updateColorblindMode(message.enabled, message.config);
            break;
        case 'toWebview:contextFilesUpdate':
            if (contextPanel) {
                contextPanel.updateFiles(message.files);
            }
            break;
        case 'toWebview:focusFirstElement':
            console.log('Focus first element requested');
            focusFirstElement();
            break;
        case 'toWebview:hudVisibilityUpdate':
            console.log('HUD visibility update received:', message.visible);
            updateHUDVisibility(message.visible);
            break;
    }

    // Update interactive elements after any DOM changes
    setTimeout(updateInteractiveElements, 0);
});

function updateLargeTextMode(enabled: boolean): void {
    const hudContainer = document.getElementById('hud-container');
    if (hudContainer) {
        if (currentMode === 'team') {
            hudContainer.setAttribute('data-large-text', enabled ? 'true' : 'false');
        }
    }
}

function updateHUDVisibility(visible: boolean): void {
    const hudContainer = document.getElementById('hud-container');
    if (hudContainer) {
        hudContainer.classList.toggle('hud-container--hidden', !visible);
        if (visible) {
            announceToScreenReader('HUD is now visible');
        } else {
            announceToScreenReader('HUD is now hidden');
        }
    }
}

function updateHighContrastMode(enabled: boolean, config: any): void {
    const hudContainer = document.getElementById('hud-container');
    if (hudContainer) {
        if (enabled) {
            hudContainer.classList.add('high-contrast-mode');
            console.log('High Contrast Mode enabled in webview');
        } else {
            hudContainer.classList.remove('high-contrast-mode');
            console.log('High Contrast Mode disabled in webview');
        }
    }

    // Update all existing agents and alerts to reflect High Contrast Mode
    const agents = document.querySelectorAll('.agent-icon');
    agents.forEach((el: any) => {
        el.classList.toggle('high-contrast-mode', enabled);
    });

    const alerts = document.querySelectorAll('.alert-component');
    alerts.forEach((el: any) => {
        el.classList.toggle('high-contrast-mode', enabled);
    });

    // Update metrics display
    const metricsEl = document.getElementById('metrics');
    if (metricsEl) {
        metricsEl.classList.toggle('high-contrast-mode', enabled);
    }

    // Update team metrics panel if in Team Mode
    if (currentMode === 'team') {
        const teamMetricsPanel = document.getElementById('team-metrics-panel');
        if (teamMetricsPanel) {
            teamMetricsPanel.classList.toggle('high-contrast-mode', enabled);
        }

        const annotationsPanel = document.getElementById('annotations-panel');
        if (annotationsPanel) {
            annotationsPanel.classList.toggle('high-contrast-mode', enabled);
        }
    }
}

function updateColorblindMode(enabled: boolean, config: any): void {
    const hudContainer = document.getElementById('hud-container');
    if (hudContainer) {
        if (enabled) {
            hudContainer.classList.add('colorblind-mode');
            hudContainer.setAttribute('data-colorblind-type', config.type);
            console.log('Colorblind Mode enabled in webview:', config.type);
        } else {
            hudContainer.classList.remove('colorblind-mode');
            hudContainer.removeAttribute('data-colorblind-type');
            console.log('Colorblind Mode disabled in webview');
        }
    }

    // Update all existing agents and alerts to reflect Colorblind Mode
    const agents = document.querySelectorAll('.agent-icon');
    agents.forEach((el: any) => {
        el.classList.toggle('colorblind-mode', enabled);
    });

    const alerts = document.querySelectorAll('.alert-component');
    alerts.forEach((el: any) => {
        el.classList.toggle('colorblind-mode', enabled);
    });

    // Update metrics display
    const metricsEl = document.getElementById('metrics');
    if (metricsEl) {
        metricsEl.classList.toggle('colorblind-mode', enabled);
    }

    // Update team metrics panel if in Team Mode
    if (currentMode === 'team') {
        const teamMetricsPanel = document.getElementById('team-metrics-panel');
        if (teamMetricsPanel) {
            teamMetricsPanel.classList.toggle('colorblind-mode', enabled);
        }

        const annotationsPanel = document.getElementById('annotations-panel');
        if (annotationsPanel) {
            annotationsPanel.classList.toggle('colorblind-mode', enabled);
        }
    }
}

function updateTeamMetricsDisplay(metrics: any): void {
    // Create or update team metrics panel
    let metricsPanel = document.getElementById('team-metrics-panel');

    if (!metricsPanel && currentMode === 'team') {
        metricsPanel = document.createElement('div');
        metricsPanel.id = 'team-metrics-panel';
        metricsPanel.className = 'team-metrics-panel';
        document.body.appendChild(metricsPanel);
    }

    if (metricsPanel && currentMode === 'team') {
        const summary = metrics.getMetricsSummary ? metrics.getMetricsSummary() :
            `Acceptance: ${metrics.overallAcceptanceRate || 0}% | Time Saved: ${Math.floor(metrics.totalTimeSaved / 60)}h ${metrics.totalTimeSaved % 60}m`;

        metricsPanel.innerHTML = `
            <div class="team-metrics-panel__title">Team Metrics</div>
            <div class="team-metrics-panel__item">
                <span class="team-metrics-panel__label">Overall Acceptance:</span>
                <span class="team-metrics-panel__value team-metrics-panel__value--positive">${metrics.overallAcceptanceRate || 0}%</span>
            </div>
            <div class="team-metrics-panel__item">
                <span class="team-metrics-panel__label">Time Saved:</span>
                <span class="team-metrics-panel__value team-metrics-panel__value--positive">${Math.floor(metrics.totalTimeSaved / 60)}h ${metrics.totalTimeSaved % 60}m</span>
            </div>
            <div class="team-metrics-panel__item">
                <span class="team-metrics-panel__label">Architect:</span>
                <span class="team-metrics-panel__value">${metrics.architect?.accepted || 0} accepted, ${metrics.architect?.rejected || 0} rejected</span>
            </div>
            <div class="team-metrics-panel__item">
                <span class="team-metrics-panel__label">Coder:</span>
                <span class="team-metrics-panel__value">${metrics.coder?.accepted || 0} accepted, ${metrics.coder?.rejected || 0} rejected</span>
            </div>
            <div class="team-metrics-panel__item">
                <span class="team-metrics-panel__label">Reviewer:</span>
                <span class="team-metrics-panel__value">${metrics.reviewer?.accepted || 0} accepted, ${metrics.reviewer?.rejected || 0} rejected</span>
            </div>
            <div class="team-metrics-panel__item">
                <span class="team-metrics-panel__label">Context:</span>
                <span class="team-metrics-panel__value">${metrics.context?.accepted || 0} accepted, ${metrics.context?.rejected || 0} rejected</span>
            </div>
        `;
    }
}


// VSCode API for posting messages back to extension
declare const acquireVsCodeApi: () => { postMessage: (message: any) => void };
let vscodeApi: { postMessage: (message: any) => void } | null = null;
function getVsCodeApi() {
    if (!vscodeApi) {
        vscodeApi = acquireVsCodeApi();
    }
    return vscodeApi;
}

// Annotations storage for Team Mode
let currentAnnotations: any[] = [];

/**
 * Render a single annotation in the annotation panel
 */
function renderAnnotation(annotation: any): void {
    if (currentMode !== 'team') return;

    currentAnnotations.push(annotation);

    let annotationsPanel = document.getElementById('annotations-panel');
    if (!annotationsPanel) {
        annotationsPanel = document.createElement('div');
        annotationsPanel.id = 'annotations-panel';
        annotationsPanel.className = 'annotations-panel';
        annotationsPanel.innerHTML = '<div class="annotations-panel__title">Team Annotations</div>';
        document.body.appendChild(annotationsPanel);
    }

    const annotationEl = createAnnotationElement(annotation);
    annotationsPanel.appendChild(annotationEl);
}

/**
 * Update all annotations display
 */
function updateAnnotationsDisplay(annotations: any[]): void {
    if (currentMode !== 'team') return;

    currentAnnotations = annotations;

    let annotationsPanel = document.getElementById('annotations-panel');
    if (!annotationsPanel) {
        annotationsPanel = document.createElement('div');
        annotationsPanel.id = 'annotations-panel';
        annotationsPanel.className = 'annotations-panel';
        document.body.appendChild(annotationsPanel);
    }

    annotationsPanel.innerHTML = '<div class="annotations-panel__title">Team Annotations</div>';

    annotations.forEach(annotation => {
        const annotationEl = createAnnotationElement(annotation);
        annotationsPanel!.appendChild(annotationEl);
    });
}

/**
 * Create an annotation element
 */
function createAnnotationElement(annotation: any): HTMLElement {
    const el = document.createElement('div');
    el.className = 'team-annotation';
    el.dataset.annotationId = annotation.id;

    const timestamp = new Date(annotation.timestamp).toLocaleString();

    el.innerHTML = `
        <div class="team-annotation__header">
            <span class="team-annotation__author">${annotation.author}</span>
            <span class="team-annotation__timestamp">${timestamp}</span>
        </div>
        <div class="team-annotation__content">${annotation.comment}</div>
    `;

    return el;
}

/**
 * Show add comment dialog for a suggestion
 */
function showAddCommentDialog(suggestionId: string): void {
    const comment = prompt('Enter your comment for this suggestion:');
    if (comment) {
        const author = prompt('Your name:', 'Team Member') || 'Team Member';
        getVsCodeApi().postMessage({
            type: 'toExtension:annotationAdded',
            suggestionId,
            comment,
            author
        });
    }
}

/**
 * Add "Add Comment" button to alert elements (suggestions) in Team Mode
 */
function addCommentButtonToAlerts(): void {
    if (currentMode !== 'team') return;

    const alerts = document.querySelectorAll('.alert-component');
    alerts.forEach((alertEl: any) => {
        if (alertEl.querySelector('.add-comment-btn')) return; // Already has button

        const btn = document.createElement('button');
        btn.className = 'add-comment-btn';
        btn.textContent = '💬 Add Comment';
        btn.onclick = (e) => {
            e.stopPropagation();
            const suggestionId = alertEl.id || `alert-${Date.now()}`;
            showAddCommentDialog(suggestionId);
        };
        alertEl.appendChild(btn);
    });
}

function executeUpdateMetricsUI(metrics: any) {
    // Performance Mode: Throttle metrics updates to 1/second (AC: 10)
    if (performanceMode) {
        const now = Date.now();
        pendingMetricsUpdate = metrics; // Store latest update

        if (now - lastMetricsUpdate < METRICS_THROTTLE_MS) {
            // Schedule update if not already scheduled
            if (!metricsThrottleTimeout) {
                metricsThrottleTimeout = setTimeout(() => {
                    metricsThrottleTimeout = null;
                    if (pendingMetricsUpdate) {
                        doUpdateMetricsUI(pendingMetricsUpdate);
                        pendingMetricsUpdate = null;
                    }
                }, METRICS_THROTTLE_MS - (now - lastMetricsUpdate));
            }
            return;
        }
        lastMetricsUpdate = now;
    }

    doUpdateMetricsUI(metrics);
}

function executeUpdatePhaseUI(phase: string) {
    if (vitalSignsBar) {
        vitalSignsBar.setPhase(phase);
    }
}

let metricsThrottleTimeout: any = null;

function doUpdateMetricsUI(metrics: any) {
    if (vitalSignsBar) {
        vitalSignsBar.updateMetrics(metrics);

        // Also update context panel files if needed, or wait for separate update?
        // Usually full state includes files.
        // Assuming context panel gets files via separate message or we can pass here if metrics has file list?
        // Metrics object currently has `files` (count).
        // ContextPanel needs actual file list.
    } else {
        // Fallback or early init logic
        const metricsEl = document.getElementById('metrics');
        if (metricsEl) {
            const formattedCost = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(metrics.cost);
            metricsEl.innerText = `Tokens: ${metrics.tokens.toLocaleString()} | Cost: ${formattedCost} | Files: ${metrics.files}`;
        }
    }
}

function executeUpdateAgentHUD(agent: string, state: any) {
    const hud = document.getElementById('agent-hud');
    if (!hud) return;

    let agentEl = document.getElementById(`agent-${agent}`);
    if (!agentEl) {
        agentEl = document.createElement('div');
        agentEl.id = `agent-${agent}`;
        agentEl.className = 'agent-icon';
        const icons: any = { context: '🔍', architect: '🏗️', coder: '💻', reviewer: '🛡️' };
        const labelMap: any = { context: 'Context', architect: 'Architect', coder: 'Coder', reviewer: 'Reviewer' };

        agentEl.innerHTML = `
            <div class="agent-symbol">${icons[agent] || '🤖'}</div>
            <div class="agent-label-text">${labelMap[agent] || agent}</div>
        `;
        hud.appendChild(agentEl);
    }

    agentEl.className = `agent-icon ${state.status} ${performanceMode ? 'low-fx' : ''}`;
    agentEl.setAttribute('data-agent', agent);

    // Add ARIA attributes for accessibility
    agentEl.setAttribute('role', 'button');
    agentEl.setAttribute('aria-label', `Agent ${agent}: ${state.status}`);
    agentEl.setAttribute('aria-describedby', `agent-description-${agent}`);
    agentEl.setAttribute('aria-expanded', 'false'); // Could be expanded for details

    // Update label text with descriptive state (Team Mode)
    const labelEl = agentEl.querySelector('.agent-label-text') as HTMLElement;
    if (labelEl) {
        if (currentMode === 'team') {
            // Team Mode: Show descriptive state text for team visibility
            labelEl.textContent = getDescriptiveStateText(agent, state);
            labelEl.style.display = 'block';
        } else if (currentMode === 'learning' || currentVerbosity === 'high') {
            // Learning Mode or high verbosity: Show agent name only
            const labelMap: any = { context: 'Context', architect: 'Architect', coder: 'Coder', reviewer: 'Reviewer' };
            labelEl.textContent = labelMap[agent] || agent;
            labelEl.style.display = 'block';
        } else {
            // Expert/Focus/Performance modes: Hide labels
            labelEl.style.display = 'none';
        }
    }

    const positions: any = {
        context: { top: 10, left: 10 },
        architect: { top: 10, left: 30 },
        coder: { top: 10, left: 50 },
        reviewer: { top: 10, left: 70 }
    };

    let targetTop = positions[agent]?.top || 20;

    if (state.anchorLine !== undefined && currentViewport) {
        const { start, end } = currentViewport;
        const totalLines = end - start;
        const relativePos = (state.anchorLine - start) / Math.max(1, totalLines);
        targetTop = relativePos * 100;
        if (targetTop < 5) targetTop = 5;
        if (targetTop > 95) targetTop = 95;
    }

    agentEl.style.left = `${positions[agent]?.left || 10}%`;
    agentEl.dataset.baseTop = targetTop.toString();
    applyRepulsionToAgent(agentEl as HTMLElement, lastCursor);
}

/**
 * Get descriptive state text for Team Mode visibility.
 * Shows what each agent is currently doing in human-readable format.
 */
function getDescriptiveStateText(agent: string, state: any): string {
    const stateMessages: any = {
        context: {
            idle: 'Context: Ready',
            thinking: 'Loading context files...',
            working: 'Optimizing token budget...',
            success: 'Context ready',
            error: 'Context error'
        },
        architect: {
            idle: 'Architect: Ready',
            thinking: 'Analyzing project structure...',
            working: 'Designing solution...',
            success: 'Architecture complete',
            error: 'Analysis error'
        },
        coder: {
            idle: 'Coder: Ready',
            thinking: 'Planning code generation...',
            working: 'Generating code...',
            success: 'Code ready for review',
            error: 'Generation error'
        },
        reviewer: {
            idle: 'Reviewer: Ready',
            thinking: 'Analyzing code quality...',
            working: 'Identifying risks...',
            success: 'Review complete',
            error: 'Review error'
        }
    };

    return stateMessages[agent]?.[state.status] || `${agent}: ${state.status}`;
}

let currentViewport: any = null;
let lastCursor: any = null;

// Performance Mode: Throttle collision checks (AC: 8)
let lastCollisionCheck = 0;
const COLLISION_THROTTLE_MS = 500; // 500ms throttle in Performance Mode

// Performance Mode: Throttle metrics updates (AC: 10)
let lastMetricsUpdate = 0;
const METRICS_THROTTLE_MS = 1000; // 1 second throttle in Performance Mode
let pendingMetricsUpdate: any = null;

function executeHandleCursorUpdate(cursor: any) {
    lastCursor = cursor;
    currentViewport = cursor.visibleRanges[0];

    // Performance Mode: Throttle collision checks to 500ms
    if (performanceMode) {
        const now = Date.now();
        if (now - lastCollisionCheck < COLLISION_THROTTLE_MS) {
            return; // Skip this update, throttled
        }
        lastCollisionCheck = now;
    }

    repositionAgents();
    repositionAlerts();
}

function repositionAgents() {
    const agents = document.querySelectorAll('.agent-icon');
    agents.forEach((el: any) => {
        applyRepulsionToAgent(el, lastCursor);
    });
}

function repositionAlerts() {
    if (!currentViewport) return;
    const alerts = document.querySelectorAll('.alert-component');
    alerts.forEach((el: any) => {
        const anchorLine = parseInt(el.dataset.anchorLine);
        if (!isNaN(anchorLine)) {
            const { start, end } = currentViewport;
            const totalLines = end - start;
            let relativePos = (anchorLine - start) / Math.max(1, totalLines);
            if (relativePos < 0.05) relativePos = 0.05;
            if (relativePos > 0.95) relativePos = 0.95;

            const targetY = relativePos * window.innerHeight;
            el.style.transform = `translate3d(0, ${targetY}px, 0)`;
        }
    });
}

function executeRenderAlert(alert: any) {
    // Story 7.1: Specialized Suggestion Rendering
    if (alert.type === 'suggestion' || (alert.data && alert.data.type === 'suggestion')) {
        const hud = document.getElementById('agent-hud');
        if (!hud) return;

        // Force cleanup of existing suggestion if new one arrives?
        // For now, let's keep it simple.
        const suggestionCard = new SuggestionCard(hud, alert, {
            onAccept: (s: any) => {
                getVsCodeApi().postMessage({
                    type: 'toExtension:suggestionAccepted',
                    suggestionId: s.id,
                    agent: s.agent || 'coder'
                });
            },
            onReject: (s: any) => {
                getVsCodeApi().postMessage({
                    type: 'toExtension:suggestionRejected',
                    suggestionId: s.id,
                    agent: s.agent || 'coder'
                });
            }
        });
        suggestionCard.render();
        repositionAlerts();
        return;
    }

    const icons: any = { info: '💡', warning: '⚠️', critical: '🚨', urgent: '🔥' };

    // Focus Mode: Show only critical/urgent alerts as toast notifications
    if (currentMode === 'focus') {
        if (alert.severity !== 'critical' && alert.severity !== 'urgent') {
            return; // Suppress non-critical alerts in Focus Mode
        }

        // Render as toast notification (bottom-right)
        showToastNotification(alert.message, icons[alert.severity] || '🚨');
        return;
    }

    // Normal/Expert Mode: Render as standard alert
    const hud = document.getElementById('agent-hud');
    if (!hud) return;

    let alertEl = document.getElementById(`alert-${alert.id}`);
    if (!alertEl) {
        alertEl = document.createElement('div');
        alertEl.id = `alert-${alert.id}`;
        hud.appendChild(alertEl);
    }

    alertEl.className = `alert-component alert-${alert.severity}`;
    alertEl.dataset.anchorLine = alert.anchorLine?.toString() || '';

    // Add ARIA attributes for accessibility
    alertEl.setAttribute('role', 'alert');
    alertEl.setAttribute('aria-label', `Alert: ${alert.message}`);
    alertEl.setAttribute('aria-live', 'polite');
    alertEl.setAttribute('aria-atomic', 'true');

    // Expert Mode: Condensed rendering (signal > noise)
    let messageToDisplay = alert.message;
    if (currentVerbosity === 'low') {
        // In Expert Mode, render links more compactly and keep message concise
        messageToDisplay = messageToDisplay
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">🔗</a>')
            .replace(/\n/g, '<br/>');
    } else {
        // Normal mode: Full link display
        messageToDisplay = messageToDisplay
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
            .replace(/\n/g, '<br/>');
    }

    alertEl.innerHTML = `
        <div class="alert-icon-ideogram">${icons[alert.severity] || '❗'}</div>
        <div class="alert-tooltip">${messageToDisplay}</div>
    `;
    repositionAlerts();

    // Team Mode: Add comment button to alerts
    if (currentMode === 'team') {
        addCommentButtonToAlerts();
    }

    // Edge Case Handling (Story 6.6)
    if (alert.data && alert.data.fix) {
        const fixBtn = document.createElement('button');
        fixBtn.className = 'fix-btn';
        fixBtn.style.marginTop = '8px';
        fixBtn.style.display = 'block';
        fixBtn.style.padding = '4px 8px';
        fixBtn.style.backgroundColor = 'var(--vscode-button-background)';
        fixBtn.style.color = 'var(--vscode-button-foreground)';
        fixBtn.style.border = 'none';
        fixBtn.style.borderRadius = '2px';
        fixBtn.style.cursor = 'pointer';
        fixBtn.textContent = '⚡ Fix Edge Case';

        fixBtn.onclick = (e) => {
            e.stopPropagation();
            getVsCodeApi().postMessage({
                type: 'toExtension:fixEdgeCase',
                edgeCase: alert.data
            });
            fixBtn.textContent = 'Generating Fix...';
            fixBtn.disabled = true;
            fixBtn.style.opacity = '0.7';
        };
        alertEl.appendChild(fixBtn);
    }
}

/**
 * Show a toast notification (used in Focus Mode for critical alerts)
 */
function showToastNotification(message: string, icon: string = '🚨') {
    const toast = document.createElement('div');
    toast.className = 'toast toast--critical';
    toast.innerHTML = `
        <div class="toast__icon">${icon}</div>
        <div class="toast__message">${message}</div>
    `;

    document.body.appendChild(toast);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Cache last positions to skip redundant updates (AC: 11)
const lastAgentPositions: Map<string, { top: number; opacity: number }> = new Map();

function applyRepulsionToAgent(el: HTMLElement, cursor: any) {
    const baseTopPercent = parseFloat(el.dataset.baseTop || '20');
    const baseTopPx = (baseTopPercent / 100) * window.innerHeight;

    let translateY = baseTopPx;
    let opacity = 1.0;

    // Performance Mode: Skip complex repulsion calculations (AC: 11)
    if (performanceMode) {
        // Simple positioning - no repulsion, just base position
        const agentId = el.id;
        const lastPos = lastAgentPositions.get(agentId);

        // Skip update if position unchanged (within 1px tolerance)
        if (lastPos && Math.abs(lastPos.top - baseTopPx) < 1) {
            return;
        }

        // Direct positioning without transform (faster)
        el.style.top = `${baseTopPx}px`;
        el.style.transform = 'none';
        el.style.opacity = '0.8'; // Fixed opacity in Performance Mode

        lastAgentPositions.set(agentId, { top: baseTopPx, opacity: 0.8 });
        return;
    }

    // Normal mode: Full repulsion calculation
    if (cursor) {
        const cursorYPx = cursor.relativeY * window.innerHeight;
        const dist = Math.abs(baseTopPx - cursorYPx);
        const threshold = window.innerHeight * 0.15;

        if (dist < threshold) {
            const repulsionScale = (threshold - dist) / threshold;
            const offset = threshold * repulsionScale * (baseTopPx > cursorYPx ? 1 : -1);
            translateY += offset;
            opacity = 0.3 + (0.7 * (1 - repulsionScale));
        }
    }

    el.style.transform = `translate3d(0, ${translateY}px, 0)`;
    el.style.opacity = opacity.toString();
}
