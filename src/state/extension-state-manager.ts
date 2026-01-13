import { AgentType, IAgentState, AgentStatus } from '../agents/shared/agent.interface.js';

export interface IMetricsState {
    tokens: number;
    files: number;
    cost: number;
}

/**
 * Manages the state of all AI agents in the extension.
 * Serves as the single source of truth for agent activity.
 */
export class ExtensionStateManager {
    private static instance: ExtensionStateManager;
    private agentStates: Map<AgentType, IAgentState> = new Map();
    private metrics: IMetricsState = { tokens: 0, files: 0, cost: 0 };
    private webview: { postMessage: (message: any) => Thenable<boolean> } | undefined;

    private constructor() {
        this.initializeDefaultStates();
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
                metrics: this.metrics
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
}
