import * as vscode from 'vscode';
import { LLMProviderManager } from '../llm/provider-manager.js';
import { ExtensionStateManager, IDecisionRecord } from '../state/index.js';
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
     * Retrieves a registered agent by type.
     */
    public getAgent(type: AgentType): IAgent | undefined {
        return this.agents.get(type);
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
            let projectArchitecture;

            const architectAgent = this.getAgent('architect');
            if (architectAgent) {
                // Global Architecture Retrieval (Task 1.1)
                try {
                    // Check if the agent has analyzeProject method (duck typing)
                    if (typeof (architectAgent as any).analyzeProject === 'function') {
                        projectArchitecture = await (architectAgent as any).analyzeProject();
                    }
                } catch (error) {
                    ErrorHandler.log('Failed to retrieve project architecture context', 'WARNING');
                }

                if (this.shouldInvolveArchitect(prompt)) {
                    const architectResponse = await this.runAgent('architect', {
                        prompt,
                        context: currentContext
                    });
                    currentContext += `\n\nArchitectural Analysis:\n${architectResponse.result}`;
                    architectReasoning = architectResponse.reasoning;
                }
            }

            // 3. Coder Agent - Generate code
            const coderResponse = await this.runAgent('coder', {
                prompt,
                context: currentContext,
                data: { architecture: projectArchitecture }
            });

            // 4. Reviewer Agent - Validate code
            const reviewerResponse = await this.runAgent('reviewer', {
                prompt: `Review this code: ${coderResponse.result}`,
                context: currentContext
            });

            // 5. Synthesize Final Response
            return this.synthesizeResponse(coderResponse, reviewerResponse, architectReasoning, prompt);

        } catch (error: any) {
            ErrorHandler.handleError(error);
            throw error;
        }
    }

    /**
     * Processes an edge case fix request.
     * Flow: Coder -> Reviewer
     */
    public async processEdgeCaseFix(edgeCase: any): Promise<IAgentResponse> {
        ErrorHandler.log(`Processing edge case fix: ${edgeCase.type}`);

        try {
            const activeEditor = vscode.window.activeTextEditor;
            let currentContext = '';
            if (activeEditor) {
                currentContext = activeEditor.document.getText();
            }

            // 1. Coder Agent - Generate Fix
            const fixPrompt = `Implement the following edge case fix for the current file:
Type: ${edgeCase.type}
Description: ${edgeCase.description}
Recommended Fix: ${edgeCase.fix}

Please provide the corrected code snippet or file content.`;

            const coderResponse = await this.runAgent('coder', {
                prompt: fixPrompt,
                context: currentContext
            });

            // 2. Reviewer Agent - Validate
            const reviewerResponse = await this.runAgent('reviewer', {
                prompt: `Review this edge case fix: ${coderResponse.result}`,
                context: currentContext
            });

            // 3. Synthesize
            return this.synthesizeResponse(coderResponse, reviewerResponse, 'Edge Case Fix implemented', edgeCase.description);

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
    private synthesizeResponse(coder: IAgentResponse, reviewer: IAgentResponse, architectReasoning: string, originalPrompt: string): IAgentResponse {
        const finalResult = coder.result;
        const combinedReasoning = [
            architectReasoning ? `Architect: ${architectReasoning}` : null,
            `Coder: ${coder.reasoning}`,
            `Reviewer: ${reviewer.reasoning}`
        ].filter(Boolean).join('\n\n');

        // Create and add history record
        const historyRecord: IDecisionRecord = {
            id: Date.now().toString(36) + Math.random().toString(36).substring(2),
            timestamp: Date.now(),
            type: 'suggestion',
            summary: originalPrompt.length > 50 ? originalPrompt.substring(0, 47) + '...' : originalPrompt,
            agent: 'coder',
            status: 'pending',
            details: {
                reasoning: combinedReasoning,
                code: coder.result,
                architectReasoning,
                coderApproach: coder.reasoning,
                reviewerValidation: reviewer.reasoning
            }
        };

        this.stateManager.addHistoryEntry(historyRecord);

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

        const activeEditor = vscode.window.activeTextEditor;
        const anchorLine = activeEditor?.selection.active.line;

        // Inject current phase into request
        const currentPhase = this.stateManager.getPhase();
        request.data = {
            ...request.data,
            currentPhase
        };

        this.stateManager.updateAgentState(type, 'thinking', `Processing request...`, anchorLine);

        const eventData: AgentLifecycleEvent = { agent: type, timestamp: Date.now() };
        this._onAgentStart.fire({ ...eventData, data: { request } });

        try {
            const response = await agent.execute(request);
            this.stateManager.updateAgentState(type, 'success', `Task complete.`, anchorLine);

            this._onAgentComplete.fire({ ...eventData, data: { response } });

            return response;
        } catch (error: any) {
            this.stateManager.updateAgentState(type, 'alert', `Error: ${error.message}`);

            this._onAgentError.fire({ ...eventData, data: { error: error.message } });

            throw error;
        }
    }
}
