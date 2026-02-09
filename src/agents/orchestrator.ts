import * as vscode from 'vscode';
import { LLMProviderManager } from '../llm/provider-manager.js';
import { ExtensionStateManager, IDecisionRecord } from '../state/index.js';
import { ErrorHandler } from '../errors/error-handler.js';
import { IAgent, AgentType, IAgentRequest, IAgentResponse } from './shared/agent.interface.js';
import { LifecycleEventManager } from '../api/lifecycle-event-manager.js';
import { SpatialManager } from '../ui/spatial-manager.js';
import { WebviewManager } from '../ui/webview-manager.js';


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

        // Story 11.11: Determine if fusion should be triggered
        const willInvolveArchitect = this.shouldInvolveArchitect(prompt);
        const activeAgents: AgentType[] = ['context', 'coder', 'reviewer'];
        if (willInvolveArchitect) {
            activeAgents.splice(1, 0, 'architect'); // Insert architect after context
        }

        const shouldFuse = this.shouldTriggerFusion(prompt, activeAgents.length);
        let fusionTriggered = false;

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

                if (willInvolveArchitect) {
                    // Story 11.11: Trigger fusion if needed (after context loads)
                    if (shouldFuse && !fusionTriggered) {
                        const metadata = this.collectFusionMetadata(prompt, activeAgents);
                        WebviewManager.getInstance().postMessageToWebview({
                            type: 'toWebview:triggerFusion',
                            agents: activeAgents,
                            metadata
                        });
                        fusionTriggered = true;
                    }

                    // Story 11.8: Visualize context → architect interaction
                    this.visualizeAgentInteraction('context', 'architect',
                        'Context loaded - analyzing architecture', false);

                    const architectResponse = await this.runAgent('architect', {
                        prompt,
                        context: currentContext
                    });
                    currentContext += `\n\nArchitectural Analysis:\n${architectResponse.result}`;
                    architectReasoning = architectResponse.reasoning;

                    // Story 11.8: Visualize architect → coder interaction
                    this.visualizeAgentInteraction('architect', 'coder',
                        'Architecture analysis complete', true);
                }
            }

            // 3. Coder Agent - Generate code
            const coderResponse = await this.runAgent('coder', {
                prompt,
                context: currentContext,
                data: { architecture: projectArchitecture }
            });

            // Story 11.8: Visualize coder → reviewer interaction
            this.visualizeAgentInteraction('coder', 'reviewer',
                'Code generation complete', true);

            // 4. Reviewer Agent - Validate code
            const reviewerResponse = await this.runAgent('reviewer', {
                prompt: `Review this code: ${coderResponse.result}`,
                context: currentContext
            });

            // Story 11.8: Visualize reviewer → context interaction (completing the cycle)
            this.visualizeAgentInteraction('reviewer', 'context',
                'Review complete - updating context', false);

            // 5. Synthesize Final Response
            const response = this.synthesizeResponse(coderResponse, reviewerResponse, architectReasoning, prompt);

            // Story 11.11: Release fusion if it was triggered
            if (fusionTriggered) {
                WebviewManager.getInstance().postMessageToWebview({
                    type: 'toWebview:releaseFusion'
                });
            }

            return response;

        } catch (error: any) {
            // Story 11.11: Release fusion on error
            if (fusionTriggered) {
                try {
                    WebviewManager.getInstance().postMessageToWebview({
                        type: 'toWebview:releaseFusion'
                    });
                } catch (defusionError) {
                    ErrorHandler.log('Failed to release fusion on error', 'WARNING');
                }
            }

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
     * Determines if agents should fuse based on collaboration intensity
     * Story 11.11
     *
     * Fusion is triggered when:
     * - 3+ agents are active simultaneously
     * - Task is complex (architectural changes + code gen + review)
     * - Estimated duration >5 seconds
     *
     * @param prompt - User's request prompt
     * @param activeAgentCount - Number of agents that will be involved
     * @returns true if fusion should be triggered
     */
    private shouldTriggerFusion(prompt: string, activeAgentCount: number): boolean {
        // Must have 3+ agents (typically: context, architect, coder, reviewer)
        if (activeAgentCount < 3) {
            return false;
        }

        // Check for complex task keywords
        const complexTaskKeywords = [
            'architecture', 'architectural', 'design', 'redesign',
            'refactor', 'refactoring', 'restructure',
            'pattern', 'patterns', 'framework',
            'system', 'module', 'component',
            'migrate', 'migration', 'upgrade',
            'optimize', 'optimization',
            'entire', 'complete', 'comprehensive'
        ];

        const hasComplexKeyword = complexTaskKeywords.some(keyword =>
            prompt.toLowerCase().includes(keyword)
        );

        // If has complex keyword and 3+ agents, likely a fusion-worthy task
        return hasComplexKeyword;
    }

    /**
     * Collects metadata for fusion visualization
     * Story 11.11
     *
     * @param prompt - User's request prompt
     * @param activeAgents - Array of active agent types
     * @returns Fusion metadata object
     */
    private collectFusionMetadata(prompt: string, activeAgents: AgentType[]): any {
        // Estimate tokens (rough approximation: 1 token ≈ 4 characters)
        const estimatedTokens = Math.ceil(prompt.length / 4);

        // Determine status based on prompt
        let status = 'collaborating';
        if (prompt.toLowerCase().includes('refactor')) {
            status = 'refactoring';
        } else if (prompt.toLowerCase().includes('architecture')) {
            status = 'architectural design';
        } else if (prompt.toLowerCase().includes('optimize')) {
            status = 'optimization';
        } else if (prompt.toLowerCase().includes('migrate')) {
            status = 'migration';
        }

        // Create contextual message from prompt (truncate if too long)
        let message = prompt;
        if (message.length > 50) {
            message = message.substring(0, 47) + '...';
        }

        return {
            tokens: estimatedTokens,
            status,
            agents: activeAgents,
            message
        };
    }

    /**
     * Visualizes an interaction between two agents
     *
     * Story 11.8: Sends postMessage to webview to trigger ink stroke animation
     *
     * @param fromAgent - Source agent
     * @param toAgent - Destination agent
     * @param message - Description of the interaction
     * @param critical - Whether this is a critical interaction (uses vermillion color)
     *
     * @example
     * ```typescript
     * this.visualizeAgentInteraction('context', 'architect',
     *   'Context loaded - 5 files', false);
     * ```
     */
    private visualizeAgentInteraction(
        fromAgent: AgentType,
        toAgent: AgentType,
        message: string,
        critical: boolean = false
    ): void {
        try {
            // Send to webview for visualization
            WebviewManager.getInstance().postMessageToWebview({
                type: 'toWebview:agentInteraction',
                from: fromAgent,
                to: toAgent,
                message,
                critical,
                timestamp: Date.now()
            });
        } catch (error) {
            // Non-critical: visualization failure shouldn't break agent workflow
            ErrorHandler.log(`Failed to visualize interaction ${fromAgent} -> ${toAgent}: ${error}`, 'WARNING');
        }
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

        // Record Metrics (Story 8.2)
        import('../telemetry/metrics-service.js').then(module => {
            const metrics = module.MetricsService.getInstance();
            metrics.recordSuggestionRequested();
        }).catch(() => { });

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

        // Also add an alert so the webview can display the suggestion card
        this.stateManager.addAlert({
            id: historyRecord.id,
            agent: 'coder',
            severity: 'info',
            message: `Suggestion for: ${historyRecord.summary}`,
            timestamp: Date.now(),
            data: {
                type: 'suggestion',
                code: coder.result
            }
        });

        // Emit Lifecycle Event: suggestionGenerated
        LifecycleEventManager.getInstance().emit('suggestionGenerated', {
            id: historyRecord.id,
            agent: historyRecord.agent as AgentType,
            code: coder.result,
            timestamp: Date.now(),
            data: {
                reasoning: combinedReasoning,
                confidence: (coder.confidence + reviewer.confidence) / 2
            }
        });

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

        // Story 11.5: Anchor agent character to current line
        if (anchorLine !== undefined) {
            try {
                SpatialManager.getInstance().attachAgentToLine(type, anchorLine);
            } catch (error) {
                // Log but don't fail - spatial positioning is non-critical
                ErrorHandler.log(`Failed to anchor agent ${type}: ${error}`, 'WARNING');
            }
        }

        const eventData: AgentLifecycleEvent = { agent: type, timestamp: Date.now() };
        this._onAgentStart.fire({ ...eventData, data: { request } });

        // Emit Lifecycle Event: agentActivated
        LifecycleEventManager.getInstance().emit('agentActivated', {
            agent: type,
            timestamp: Date.now(),
            data: { request }
        });

        try {

            const response = await agent.execute(request);
            this.stateManager.updateAgentState(type, 'success', `Task complete.`, anchorLine);

            this._onAgentComplete.fire({ ...eventData, data: { response } });

            // Story 11.5: Detach agent character after completion
            // Keep anchored for a brief moment to show success, then detach
            setTimeout(() => {
                try {
                    SpatialManager.getInstance().detachAgent(type);
                } catch (error) {
                    ErrorHandler.log(`Failed to detach agent ${type}: ${error}`, 'WARNING');
                }
            }, 2000); // 2 second delay to show success state

            return response;
        } catch (error: any) {
            this.stateManager.updateAgentState(type, 'alert', `Error: ${error.message}`);

            this._onAgentError.fire({ ...eventData, data: { error: error.message } });

            // Story 11.5: Detach agent on error
            setTimeout(() => {
                try {
                    SpatialManager.getInstance().detachAgent(type);
                } catch (error) {
                    ErrorHandler.log(`Failed to detach agent ${type}: ${error}`, 'WARNING');
                }
            }, 3000); // 3 second delay to show error state

            throw error;
        }
    }
}
