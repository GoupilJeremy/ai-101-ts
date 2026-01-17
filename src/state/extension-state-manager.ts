import { AgentType, IAgentState, AgentStatus, IAlert } from '../agents/shared/agent.interface.js';
import { AgentMode, IModeConfig, ModeConfigs } from '../modes/mode-types.js';
import { IDecisionRecord } from './history.interface.js';

export interface IMetricsState {
    tokens: number;
    files: number;
    cost: number;
    sessionTime?: number; // Session duration in seconds (Team Mode)
}

/**
 * Manages the state of all AI agents in the extension.
 * Serves as the single source of truth for agent activity.
 */
export class ExtensionStateManager {
    private static instance: ExtensionStateManager;
    private agentStates: Map<AgentType, IAgentState> = new Map();
    private metrics: IMetricsState = { tokens: 0, files: 0, cost: 0, sessionTime: 0 };
    private alerts: IAlert[] = [];
    private currentMode: AgentMode = AgentMode.Learning;
    private modeConfig: IModeConfig = ModeConfigs[AgentMode.Learning];
    private webview: { postMessage: (message: any) => Thenable<boolean> } | undefined;
    private sessionStartTime: number = Date.now();
    private sessionTimerInterval: NodeJS.Timeout | undefined;
    private history: IDecisionRecord[] = [];

    private constructor() {
        this.initializeDefaultStates();
        this.startSessionTimer();
    }

    public static getInstance(): ExtensionStateManager {
        if (!ExtensionStateManager.instance) {
            ExtensionStateManager.instance = new ExtensionStateManager();
        }
        return ExtensionStateManager.instance;
    }
    /**
     * Registers a webview for state synchronization.
     * Automatically sends a full state snapshot upon registration.
     */
    public setWebview(webview: { postMessage: (message: any) => Thenable<boolean> }): void {
        this.webview = webview;
        this.syncFullState();
    }

    private syncFullState(): void {
        if (this.webview) {
            this.webview.postMessage({
                type: 'toWebview:fullStateUpdate',
                states: this.getAllAgentStates(),
                metrics: this.metrics,
                alerts: this.alerts,
                history: this.history,
                mode: this.currentMode,
                modeConfig: this.modeConfig
            });
        }
    }

    /**
     * Updates the active mode and notifies webview.
     */
    public updateMode(mode: AgentMode, config: IModeConfig): void {
        this.currentMode = mode;
        this.modeConfig = config;
        if (this.webview) {
            this.webview.postMessage({
                type: 'toWebview:modeUpdate',
                mode,
                config
            });
        }
    }

    /**
     * Adds an alert and notifies the webview.
     */
    public addAlert(alert: IAlert): void {
        this.alerts.push(alert);
        if (this.webview) {
            this.webview.postMessage({
                type: 'toWebview:newAlert',
                alert
            });
        }
    }

    /**
     * Returns the current list of alerts.
     */
    public getAlerts(): IAlert[] {
        return [...this.alerts];
    }

    /**
     * Clears all alerts.
     */
    public clearAlerts(): void {
        this.alerts = [];
        if (this.webview) {
            this.webview.postMessage({
                type: 'toWebview:clearAlerts'
            });
        }
    }

    /**
     * Updates the global metrics and notifies the webview.
     */
    public updateMetrics(metrics: IMetricsState): void {
        this.metrics = { ...metrics };
        if (this.webview) {
            this.webview.postMessage({
                type: 'toWebview:metricsUpdate',
                metrics: this.metrics
            });
        }
    }

    /**
     * Notifies the webview about raw cursor movements for anti-collision.
     */
    public notifyCursorUpdate(update: any): void {
        if (this.webview) {
            this.webview.postMessage({
                type: 'toWebview:cursorUpdate',
                cursor: update
            });
        }
    }

    /**
     * Sends the list of context files to the webview.
     */
    public sendContextFiles(files: any[]): void {
        if (this.webview) {
            this.webview.postMessage({
                type: 'toWebview:contextFilesUpdate',
                files
            });
        }
    }

    /**
     * Adds a history entry and notifies the webview.
     */
    public addHistoryEntry(entry: IDecisionRecord): void {
        this.history.push(entry);
        if (this.webview) {
            this.webview.postMessage({
                type: 'toWebview:historyUpdate',
                history: this.getHistory()
            });
        }
    }

    /**
     * Returns the current list of history entries.
     */
    public getHistory(): IDecisionRecord[] {
        return [...this.history];
    }

    /**
     * Updates the status of a specific history entry.
     */
    public updateHistoryEntryStatus(id: string, status: 'accepted' | 'rejected' | 'resolved'): void {
        const entry = this.history.find(e => e.id === id);
        if (entry) {
            entry.status = status;
            if (this.webview) {
                this.webview.postMessage({
                    type: 'toWebview:historyUpdate',
                    history: this.getHistory()
                });
            }
        }
    }

    /**
     * Updates the status and current task of a specific agent.
     */
    public updateAgentState(agent: AgentType, status: AgentStatus, currentTask?: string, anchorLine?: number): void {
        const newState: IAgentState = {
            status,
            currentTask,
            lastUpdate: Date.now(),
            anchorLine
        };

        this.agentStates.set(agent, newState);
        this.notifyStateUpdate(agent, newState);
    }

    /**
     * Returns the current state of a specific agent.
     */
    public getAgentState(agent: AgentType): IAgentState {
        return this.agentStates.get(agent) || { status: 'idle', lastUpdate: Date.now() };
    }

    /**
     * Returns a snapshot of all agent states.
     */
    public getAllAgentStates(): Record<AgentType, IAgentState> {
        const snapshot: Partial<Record<AgentType, IAgentState>> = {};
        this.agentStates.forEach((state, agent) => {
            snapshot[agent] = { ...state };
        });
        return snapshot as Record<AgentType, IAgentState>;
    }

    private initializeDefaultStates(): void {
        const agents: AgentType[] = ['architect', 'coder', 'reviewer', 'context'];
        const now = Date.now();
        agents.forEach(agent => {
            this.agentStates.set(agent, {
                status: 'idle',
                lastUpdate: now
            });
        });
    }

    private notifyStateUpdate(agent: AgentType, state: IAgentState): void {
        if (this.webview) {
            this.webview.postMessage({
                type: 'toWebview:agentStateUpdate',
                agent,
                state
            });
        }
    }

    /**
     * Start session timer for Team Mode metrics.
     * Updates sessionTime every second in Team Mode.
     */
    private startSessionTimer(): void {
        this.sessionTimerInterval = setInterval(() => {
            if (this.currentMode === AgentMode.Team) {
                const sessionTime = Math.floor((Date.now() - this.sessionStartTime) / 1000);
                this.metrics.sessionTime = sessionTime;
                this.updateMetrics(this.metrics);
            }
        }, 1000); // Update every second
    }

    /**
     * Reset session timer (called when extension is deactivated or session ends).
     */
    public resetSessionTimer(): void {
        this.sessionStartTime = Date.now();
        this.metrics.sessionTime = 0;
    }

    /**
     * Stop session timer (cleanup).
     */
    public stopSessionTimer(): void {
        if (this.sessionTimerInterval) {
            clearInterval(this.sessionTimerInterval);
            this.sessionTimerInterval = undefined;
        }
    }
}
