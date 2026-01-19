import * as vscode from 'vscode';
import * as path from 'path';
import { IAgent, AgentType, IAgentRequest, IAgentResponse, IAgentState, AgentStatus } from '../shared/agent.interface.js';
import { PhasePromptBuilder } from '../shared/phase-prompt-builder.js';
import { LLMProviderManager } from '../../llm/provider-manager.js';
import { ModeManager } from '../../modes/mode-manager.js';
import { AgentMode } from '../../modes/mode-types.js';
import { ProjectPatternDetector } from './project-pattern-detector.js';
import { IProjectArchitecture } from './interfaces/project-architecture.interface.js';

/**
 * ArchitectAgent analyzes the project structure and context to identify patterns
 * and provide architectural guidance for code generation.
 */
export class ArchitectAgent implements IAgent {
    public readonly name: AgentType = 'architect';
    public readonly displayName: string = 'Architect Agent';
    public readonly icon: string = '🏛️';

    private llmManager: LLMProviderManager | undefined;
    private status: AgentStatus = 'idle';
    private currentTask: string | undefined;
    private detector: ProjectPatternDetector;
    private cachedArchitecture: IProjectArchitecture | undefined;

    constructor() {
        this.detector = new ProjectPatternDetector();
    }

    public initialize(llmManager: LLMProviderManager): void {
        this.llmManager = llmManager;
    }

    /**
     * Analyzes the project architecture and identifies key patterns.
     * Caches the result for the current session.
     */
    public async analyzeProject(): Promise<IProjectArchitecture> {
        this.updateState('thinking', 'Identifying project architecture and patterns...');

        if (this.cachedArchitecture) {
            this.updateState('success', 'Project architecture loaded from cache.');
            return this.cachedArchitecture;
        }

        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                throw new Error('No workspace folder open');
            }

            const rootPath = workspaceFolders[0].uri.fsPath;

            // Load package.json
            const packageJsonPath = path.join(rootPath, 'package.json');
            let packageJson = {};
            try {
                const content = await vscode.workspace.fs.readFile(vscode.Uri.file(packageJsonPath));
                packageJson = JSON.parse(content.toString());
            } catch (e) {
                // package.json might not exist or be invalid, proceed with empty object
            }

            // Detect patterns
            const architecture = this.detector.detectTechStack(packageJson);

            const conventions = await this.detector.detectFileStructure(rootPath);
            architecture.conventions = { ...architecture.conventions, ...conventions };

            // Merge with settings overrides
            const config = vscode.workspace.getConfiguration('ai101.architecture');
            const overrides = config.get<any>('overrides');
            if (overrides) {
                if (overrides.techStack) {architecture.techStack = { ...architecture.techStack, ...overrides.techStack };}
                if (overrides.patterns) {architecture.patterns = { ...architecture.patterns, ...overrides.patterns };}
                if (overrides.conventions) {architecture.conventions = { ...architecture.conventions, ...overrides.conventions };}
            }

            this.cachedArchitecture = architecture;
            this.updateState('success', 'Architecture analysis complete.');
            return architecture;
        } catch (error: any) {
            this.updateState('alert', `Architecture analysis failed: ${error.message}`);
            throw error;
        }
    }

    public async execute(request: IAgentRequest): Promise<IAgentResponse> {
        this.updateState('thinking', 'Analyzing project patterns and architecture...');

        // If no context, try to use project-wide architecture
        const architecture = await this.analyzeProject();

        const context = request.context || '';
        const patterns: string[] = [];

        // Simple heuristic-based pattern detection from current context
        if (context.includes('import * as vscode')) {patterns.push('VSCode Extension Pattern');}
        if (context.includes('import {') && context.includes('} from \'react\'')) {patterns.push('React Component Pattern');}
        if (context.includes('export class') && context.includes('implements')) {patterns.push('Interface implementation (Adapter/Interface Pattern)');}
        if (context.includes('private static instance') && context.includes('getInstance()')) {patterns.push('Singleton Pattern');}
        if (context.includes('import { AI101Error }')) {patterns.push('Custom Error Handling Pattern');}

        // Augment with project-wide detected patterns
        if (architecture.techStack.frontend !== 'unknown') {
            patterns.push(`Project Stack: ${architecture.techStack.frontend}`);
        }

        // Feature 6.9: Development Phase Adaptation
        let phaseInstructions = '';
        if (request.data && request.data.currentPhase) {
            phaseInstructions = PhasePromptBuilder.buildSystemPrompt(request.data.currentPhase);
        }

        let result = patterns.length > 0
            ? `Detected Patterns:\n- ${patterns.join('\n- ')}\n\nRecommendation: When generating code, follow these established project conventions to ensure consistency and maintainability.`
            : 'No clear architectural patterns detected in the current context. Applying generic clean code principles and TypeScript best practices.';

        if (phaseInstructions) {
            result += `\n\n${phaseInstructions}`;
        }

        let reasoning = `Analyzed the provided context and overall project architecture. Identified ${patterns.length} distinct patterns.`;

        if (ModeManager.getInstance().getCurrentMode() === AgentMode.Learning) {
            result += `\n\n🎓 LEARNING TIP: Software patterns like 'Singleton' or 'Adapter' help decouple your code and make it more testable. In this project, we use the singleton pattern for Managers to ensure a single source of truth for state.`;
            reasoning = `[STUDENT FOCUS] ${reasoning} Added educational context about the identified patterns to help understanding of the 'Why' behind the project structure.`;
        }

        this.updateState('success', 'Architecture analysis complete.');

        return {
            result: result,
            reasoning: reasoning,
            confidence: 0.9
        };
    }

    public getState(): IAgentState {
        return {
            status: this.status,
            currentTask: this.currentTask,
            lastUpdate: Date.now()
        };
    }

    private updateState(status: AgentStatus, task?: string): void {
        this.status = status;
        this.currentTask = task;
    }
}
