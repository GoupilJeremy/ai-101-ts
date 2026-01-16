import * as vscode from 'vscode';
import { IAgent, AgentType, IAgentRequest, IAgentResponse, IAgentState, AgentStatus } from '../shared/agent.interface.js';
import { LLMProviderManager } from '../../llm/provider-manager.js';
import { ErrorHandler } from '../../errors/error-handler.js';
import { MetricsProvider } from '../../ui/metrics-provider.js';
import { VitalSignsBar } from '../../ui/vital-signs-bar.js';
import { FileLoader } from './file-loader.js';
import { TokenOptimizer } from './token-optimizer.js';

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
    private manualContextFiles: Set<string> = new Set();
    private fileLoader: FileLoader;
    private tokenOptimizer: TokenOptimizer;

    constructor() {
        this.fileLoader = new FileLoader();
        this.tokenOptimizer = new TokenOptimizer();
    }

    public initialize(llmManager: LLMProviderManager): void {
        this.llmManager = llmManager;
    }

    public async execute(request: IAgentRequest): Promise<IAgentResponse> {
        this.updateState('working', 'Loading context files...');
        this.loadedFiles = [];

        const vitalSignsBar = VitalSignsBar.getInstance();
        vitalSignsBar.setLoading('Loading context...');

        try {
            // Get current file
            const activeEditor = vscode.window.activeTextEditor;
            const currentFile = activeEditor?.document.uri.fsPath;

            // Discover and load relevant files
            const discoveredFiles = await this.fileLoader.discoverAndLoadFiles(currentFile, 10);

            // Add manually specified context files
            const manualFiles: Array<{ path: string, content: string }> = [];
            for (const manualFile of this.manualContextFiles) {
                if (!discoveredFiles.some(f => f.path === manualFile)) {
                    const content = await this.fileLoader.loadSpecificFile(manualFile);
                    if (content) {
                        manualFiles.push({ path: manualFile, content });
                    }
                }
            }

            // Combine discovered and manual files
            const allFiles = [...discoveredFiles, ...manualFiles];

            // Update loaded files list
            this.loadedFiles = allFiles.map(f => f.path);

            // Optimize for token limits
            const optimizedContext = await this.tokenOptimizer.optimizeFiles(allFiles);

            // Report metrics
            const tokens = await this.tokenOptimizer.estimateTokens(optimizedContext);
            MetricsProvider.getInstance().updateTokens(tokens);
            MetricsProvider.getInstance().updateFiles(this.loadedFiles.length);

            this.updateState('success', `Loaded ${this.loadedFiles.length} files.`);
            vitalSignsBar.clearLoading();

            return {
                result: optimizedContext,
                reasoning: `Automatically discovered and loaded ${this.loadedFiles.length} relevant files based on current context, imports, recent files, and similar files. Content optimized to fit within token limits.`,
                confidence: 1.0
            };
        } catch (error: any) {
            this.updateState('alert', `Error loading context: ${error.message}`);
            vitalSignsBar.clearLoading();
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

    /**
     * Manually adds a file to the context.
     */
    public async addFileToContext(filePath: string): Promise<boolean> {
        try {
            // Check if file exists
            const uri = vscode.Uri.file(filePath);
            await vscode.workspace.fs.stat(uri);

            this.manualContextFiles.add(filePath);
            vscode.window.showInformationMessage(`Added ${filePath} to context`);
            return true;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to add file to context: ${filePath}`);
            return false;
        }
    }

    /**
     * Manually removes a file from the context.
     */
    public removeFileFromContext(filePath: string): boolean {
        if (this.manualContextFiles.has(filePath)) {
            this.manualContextFiles.delete(filePath);
            vscode.window.showInformationMessage(`Removed ${filePath} from context`);
            return true;
        } else {
            vscode.window.showWarningMessage(`File not found in manual context: ${filePath}`);
            return false;
        }
    }

    /**
     * Gets the list of manually added context files.
     */
    public getManualContextFiles(): string[] {
        return Array.from(this.manualContextFiles);
    }

    private updateState(status: AgentStatus, task?: string): void {
        this.status = status;
        this.currentTask = task;
        // In a real scenario, we'd also notify the state manager here if not handled by orchestrator
    }

}
