import { IAgent, AgentType, IAgentRequest, IAgentResponse, IAgentState, AgentStatus } from '../shared/agent.interface.js';
import { LLMProviderManager } from '../../llm/provider-manager.js';
import { ModeManager } from '../../modes/mode-manager.js';
import { AgentMode } from '../../modes/mode-types.js';

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

    constructor() { }

    public initialize(llmManager: LLMProviderManager): void {
        this.llmManager = llmManager;
    }

    public async execute(request: IAgentRequest): Promise<IAgentResponse> {
        this.updateState('thinking', 'Analyzing project patterns and architecture...');

        const context = request.context || '';
        const patterns: string[] = [];

        // Simple heuristic-based pattern detection
        if (context.includes('import * as vscode')) {
            patterns.push('VSCode Extension Pattern');
        }
        if (context.includes('import {') && context.includes('} from \'react\'')) {
            patterns.push('React Component Pattern');
        }
        if (context.includes('export class') && context.includes('implements')) {
            patterns.push('Interface implementation (Adapter/Interface Pattern)');
        }
        if (context.includes('private static instance') && context.includes('getInstance()')) {
            patterns.push('Singleton Pattern');
        }
        if (context.includes('import { AI101Error }')) {
            patterns.push('Custom Error Handling Pattern');
        }

        let result = patterns.length > 0
            ? `Detected Patterns:\n- ${patterns.join('\n- ')}\n\nRecommendation: When generating code, follow these established project conventions to ensure consistency and maintainability.`
            : 'No clear architectural patterns detected in the current context. Applying generic clean code principles and TypeScript best practices.';

        let reasoning = `Analyzed the provided context for common software patterns and project-specific conventions. Identified ${patterns.length} distinct patterns.`;

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
