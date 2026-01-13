import { AgentType, IAgentState, AgentStatus } from '../agents/shared/agent.interface.js';

/**
 * Manages the state of all AI agents in the extension.
 * Serves as the single source of truth for agent activity.
 */
export class ExtensionStateManager {
    private static instance: ExtensionStateManager;
    private agentStates: Map<AgentType, IAgentState> = new Map();

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
     * Updates the status and current task of a specific agent.
     */
    public updateAgentState(agent: AgentType, status: AgentStatus, currentTask?: string): void {
        const newState: IAgentState = {
            status,
            currentTask,
            lastUpdate: Date.now()
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
        // This will be implemented in Story 3.8 for webview sync
        console.log(`[ExtensionStateManager] State update for ${agent}: ${state.status} (${state.currentTask || 'no task'})`);

        // Placeholder for postMessage to webview
        // if (this.webview) { this.webview.postMessage({ type: 'toWebview:agentStateUpdate', agent, ...state }); }
    }
}
