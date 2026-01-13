import * as vscode from 'vscode';
import { IAgent, AgentType, IAgentRequest, IAgentResponse, IAgentState, AgentStatus } from '../shared/agent.interface.js';
import { LLMProviderManager } from '../../llm/provider-manager.js';
import { ErrorHandler } from '../../errors/error-handler.js';
import { MetricsProvider } from '../../ui/metrics-provider.js';

/**
 * ContextAgent is responsible for loading relevant project files and optimizing context
 * to stay within LLM token limits.
 */
export class ContextAgent implements IAgent {
    public readonly name: AgentType = 'context';
    public readonly displayName: string = 'Context Agent';
    public readonly icon: string = '🔍';

    private llmManager: LLMProviderManager | undefined;
    private status: AgentStatus = 'idle';
    private currentTask: string | undefined;
    private loadedFiles: string[] = [];
    private encoding: any;

    constructor() { }

    public initialize(llmManager: LLMProviderManager): void {
        this.llmManager = llmManager;
    }

    public async execute(request: IAgentRequest): Promise<IAgentResponse> {
        this.updateState('working', 'Searching for relevant files...');
        this.loadedFiles = [];

        try {
            // Heuristic 1: Current active file
            const activeEditor = vscode.window.activeTextEditor;
            let contextContent = '';

            if (activeEditor) {
                const doc = activeEditor.document;
                this.loadedFiles.push(doc.fileName);
                contextContent += `--- FILE: ${doc.fileName} ---\n${doc.getText()}\n\n`;
            }

            // Heuristic 2: Imports (simple regex for now)
            // TODO: More advanced import parsing

            // Heuristic 3: Recently opened files
            const recentDocs = vscode.workspace.textDocuments.filter(d => d !== activeEditor?.document);
            for (const doc of recentDocs.slice(0, 3)) { // Limit to 3 recent files
                if (!this.loadedFiles.includes(doc.fileName)) {
                    this.loadedFiles.push(doc.fileName);
                    contextContent += `--- FILE: ${doc.fileName} ---\n${doc.getText()}\n\n`;
                }
            }

            // Token Optimization
            const optimizedContext = await this.optimizeTokens(contextContent);

            // Report metrics
            const tokens = await this.estimateTokens(optimizedContext);
            MetricsProvider.getInstance().updateTokens(tokens);
            MetricsProvider.getInstance().updateFiles(this.loadedFiles.length);

            this.updateState('success', `Loaded ${this.loadedFiles.length} files.`);

            return {
                result: optimizedContext,
                reasoning: `Found ${this.loadedFiles.length} relevant files including the active editor and recently used documents. Optimized content to fit within token limits.`,
                confidence: 1.0
            };
        } catch (error: any) {
            this.updateState('alert', `Error loading context: ${error.message}`);
            throw error;
        }
    }

    public getState(): IAgentState {
        return {
            status: this.status,
            currentTask: this.currentTask,
            lastUpdate: Date.now()
        };
    }

    /**
     * Returns the list of files currently loaded in context.
     */
    public getLoadedFiles(): string[] {
        return this.loadedFiles;
    }

    private updateState(status: AgentStatus, task?: string): void {
        this.status = status;
        this.currentTask = task;
        // In a real scenario, we'd also notify the state manager here if not handled by orchestrator
    }

    private async estimateTokens(content: string): Promise<number> {
        try {
            const encoding = await this.getEncoding();
            return encoding.encode(content).length;
        } catch (e) {
            return Math.ceil(content.length / 4);
        }
    }

    private async optimizeTokens(content: string): Promise<string> {
        const maxContextTokens = 10000;
        const tokens = await this.estimateTokens(content);

        if (tokens > maxContextTokens) {
            ErrorHandler.log(`Context exceeds limit (${tokens} tokens). Truncating...`, 'WARNING');
            return content.substring(0, maxContextTokens * 4);
        }

        return content;
    }

    private async getEncoding() {
        if (!this.encoding) {
            try {
                const { getEncoding } = await import('js-tiktoken');
                this.encoding = getEncoding('cl100k_base');
            } catch (e) {
                // Return a mock if import fails in test environments
                return { encode: (s: string) => ({ length: s.length / 4 }) };
            }
        }
        return this.encoding;
    }
}
