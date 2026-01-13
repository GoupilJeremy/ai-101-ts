import * as vscode from 'vscode';
import { LLMProviderManager } from '../llm/provider-manager.js';
import { ExtensionStateManager } from '../state/extension-state-manager.js';
import { ErrorHandler } from '../errors/error-handler.js';
import { IAgent, AgentType, IAgentRequest, IAgentResponse } from './shared/agent.interface.js';

export interface AgentLifecycleEvent {
    agent: AgentType;
    timestamp: number;
    data?: any;
}

/**
 * Orchestrates the collaboration between multiple AI agents.
 * Coordinates the flow of requests and ensures agents work in the correct sequence.
 */
export class AgentOrchestrator {
    private static instance: AgentOrchestrator;
    private agents: Map<AgentType, IAgent> = new Map();
    private stateManager: ExtensionStateManager;

    // Event Emitters
    private _onAgentStart = new vscode.EventEmitter<AgentLifecycleEvent>();
    public readonly onAgentStart = this._onAgentStart.event;

    private _onAgentComplete = new vscode.EventEmitter<AgentLifecycleEvent>();
    public readonly onAgentComplete = this._onAgentComplete.event;

    private _onAgentError = new vscode.EventEmitter<AgentLifecycleEvent>();
    public readonly onAgentError = this._onAgentError.event;

    private constructor() {
        this.stateManager = ExtensionStateManager.getInstance();
    }

    public static getInstance(): AgentOrchestrator {
        if (!AgentOrchestrator.instance) {
            AgentOrchestrator.instance = new AgentOrchestrator();
        }
        return AgentOrchestrator.instance;
    }

    /**
     * Registers an agent in the orchestrator.
     */
    public registerAgent(agent: IAgent): void {
        this.agents.set(agent.name, agent);
        ErrorHandler.log(`Agent registered: ${agent.displayName} (${agent.name})`);
    }

    /**
     * Processes a user request by coordinating multiple agents.
     * Flow: Context -> Architect (optional) -> Coder -> Reviewer
     */
    public async processUserRequest(prompt: string): Promise<IAgentResponse> {
        ErrorHandler.log(`Processing user request: ${prompt}`);

        try {
            // 1. Context Agent - Load relevant files
            const contextResponse = await this.runAgent('context', { prompt });
            let currentContext = contextResponse.result;

            // 2. Architect Agent - Optional logic (simplified for now)
            let architectReasoning = '';
            if (this.shouldInvolveArchitect(prompt)) {
                const architectResponse = await this.runAgent('architect', {
                    prompt,
                    context: currentContext
                });
                currentContext += `\n\nArchitectural Analysis:\n${architectResponse.result}`;
                architectReasoning = architectResponse.reasoning;
            }

            // 3. Coder Agent - Generate code
            const coderResponse = await this.runAgent('coder', {
                prompt,
                context: currentContext
            });

            // 4. Reviewer Agent - Validate code
            const reviewerResponse = await this.runAgent('reviewer', {
                prompt: `Review this code: ${coderResponse.result}`,
                context: currentContext
            });

            // 5. Synthesize Final Response
            return this.synthesizeResponse(coderResponse, reviewerResponse, architectReasoning);

        } catch (error: any) {
            ErrorHandler.handleError(error);
            throw error;
        }
    }

    /**
     * Decides if the architect agent should be involved based on prompt complexity.
     */
    private shouldInvolveArchitect(prompt: string): boolean {
        const structuralKeywords = ['architecture', 'design', 'structure', 'refactor', 'pattern', 'setup', 'scaffold'];
        return structuralKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
    }

    /**
     * Combines outputs from multiple agents into a final response.
     */
    private synthesizeResponse(coder: IAgentResponse, reviewer: IAgentResponse, architectReasoning: string): IAgentResponse {
        const finalResult = coder.result;
        const combinedReasoning = [
            architectReasoning ? `Architect: ${architectReasoning}` : null,
            `Coder: ${coder.reasoning}`,
            `Reviewer: ${reviewer.reasoning}`
        ].filter(Boolean).join('\n\n');

        return {
            result: finalResult,
            reasoning: combinedReasoning,
            confidence: (coder.confidence + reviewer.confidence) / 2,
            alternatives: coder.alternatives
        };
    }

    /**
     * Helper to run an agent with state updates.
     */
    private async runAgent(type: AgentType, request: IAgentRequest): Promise<IAgentResponse> {
        const agent = this.agents.get(type);
        if (!agent) {
            ErrorHandler.log(`Agent ${type} not registered, skipping...`, 'WARNING');
            return { result: '', reasoning: 'Agent not registered', confidence: 1.0 };
        }

        this.stateManager.updateAgentState(type, 'thinking', `Processing request...`);

        const eventData: AgentLifecycleEvent = { agent: type, timestamp: Date.now() };
        this._onAgentStart.fire({ ...eventData, data: { request } });

        try {
            const response = await agent.execute(request);
            this.stateManager.updateAgentState(type, 'success', `Task complete.`);

            this._onAgentComplete.fire({ ...eventData, data: { response } });

            return response;
        } catch (error: any) {
            this.stateManager.updateAgentState(type, 'alert', `Error: ${error.message}`);

            this._onAgentError.fire({ ...eventData, data: { error: error.message } });

            throw error;
        }
    }
}
