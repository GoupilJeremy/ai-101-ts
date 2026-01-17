import { IAgent, AgentType, IAgentRequest, IAgentResponse, IAgentState, AgentStatus } from '../shared/agent.interface.js';
import { LLMProviderManager } from '../../llm/provider-manager.js';
import { ModeManager } from '../../modes/mode-manager.js';
import { AgentMode } from '../../modes/mode-types.js';

/**
 * CoderAgent is responsible for generating code suggestions based on context
 * and architectural guidance.
 */
import { ArchitecturePromptBuilder } from './libs/architecture-prompt-builder.js';
import { IProjectArchitecture } from '../architect/interfaces/project-architecture.interface.js';

/**
 * CoderAgent is responsible for generating code suggestions based on context
 * and architectural guidance.
 */
export class CoderAgent implements IAgent {
    public readonly name: AgentType = 'coder';
    public readonly displayName: string = 'Coder Agent';
    public readonly icon: string = '💻';

    private llmManager: LLMProviderManager | undefined;
    private status: AgentStatus = 'idle';
    private currentTask: string | undefined;

    constructor() { }

    public initialize(llmManager: LLMProviderManager): void {
        this.llmManager = llmManager;
    }

    public async execute(request: IAgentRequest): Promise<IAgentResponse> {
        if (!this.llmManager) {
            throw new Error('CoderAgent not initialized with LLMProviderManager');
        }

        this.updateState('working', 'Generating code suggestion...');

        const mode = ModeManager.getInstance().getCurrentMode();
        let modeInstructions = '';
        if (mode === AgentMode.Learning) {
            modeInstructions = `
[LEARNING MODE ACTIVE]
Please provide a detailed [PEDAGOGY] section. Identify any design patterns used (e.g. Singleton, Observer).
Explain "Why" this approach is better than others for a student.
Include links to documentation where appropriate.`;
        } else if (mode === AgentMode.Expert) {
            modeInstructions = `
[EXPERT MODE ACTIVE]
Provide in-depth technical analysis for experienced developers. Focus on signal > noise.

Required sections:
- [TECH DEBT]: Identify potential technical debt, maintainability concerns, and long-term implications
- [COMPLEXITY]: Analyze time/space complexity (Big-O notation where applicable), performance trade-offs
- [EDGE CASES]: Explicitly list edge cases, boundary conditions, and error scenarios with handling recommendations

Keep explanations concise and technical. Avoid basic explanations - assume deep technical knowledge.`;
        }

        // Feature 6.5: Architecture Guidance
        let architectureInstructions = '';
        if (request.data && request.data.architecture && !request.data.bypassArchitecture) {
            const architecture = request.data.architecture as IProjectArchitecture;
            architectureInstructions = ArchitecturePromptBuilder.buildSystemPrompt(architecture);
        }

        const systemPrompt = `You are the Coder Agent for AI-101.
Your goal is to generate high-quality TypeScript code based on the user's request, project context, and architectural guidance.
Always follow established project patterns and TypeScript best practices.
${architectureInstructions}
${modeInstructions}

EXPECTED OUTPUT FORMAT:
[REASONING]
Briefly explain your technical approach.
${mode === AgentMode.Learning ? '[PEDAGOGY]\n(Only if Learning mode is active) Detailed educational explanation and patterns.' : ''}
${mode === AgentMode.Expert ? '[TECH DEBT]\n(Only if Expert mode is active) Technical debt and maintainability analysis.\n[COMPLEXITY]\n(Only if Expert mode is active) Time/space complexity and performance trade-offs.\n[EDGE CASES]\n(Only if Expert mode is active) Edge cases and error scenarios.' : ''}
[CODE]
The generated code snippet.
[ALTERNATIVES]
Briefly list alternative approaches if applicable.
[CONFIDENCE]
A single number between 0.0 and 1.0 representing your confidence in the solution's correctness and architectural alignment.`;

        const finalPrompt = `${systemPrompt}\n\nPROJECT CONTEXT:\n${request.context || 'No context provided'}\n\nUSER REQUEST: ${request.prompt}`;

        try {
            const llmResponse = await this.llmManager.callLLM(this.name, finalPrompt, request.options);

            // Parse response
            const text = llmResponse.text;
            const reasoningMatch = text.match(/\[REASONING\]([\s\S]*?)(?:\[PEDAGOGY\]|\[TECH DEBT\]|\[CODE\])/);
            const pedagogyMatch = text.match(/\[PEDAGOGY\]([\s\S]*?)\[CODE\]/);
            const techDebtMatch = text.match(/\[TECH DEBT\]([\s\S]*?)(?:\[COMPLEXITY\]|\[CODE\])/);
            const complexityMatch = text.match(/\[COMPLEXITY\]([\s\S]*?)(?:\[EDGE CASES\]|\[CODE\])/);
            const edgeCasesMatch = text.match(/\[EDGE CASES\]([\s\S]*?)\[CODE\]/);
            const codeMatch = text.match(/\[CODE\]([\s\S]*?)(\[ALTERNATIVES\]|$)/);
            const alternativesMatch = text.match(/\[ALTERNATIVES\]([\s\S]*?)(\[CONFIDENCE\]|$)/);
            const confidenceMatch = text.match(/\[CONFIDENCE\]\s*([\d\.]+)/);

            const result = codeMatch ? codeMatch[1].trim() : text;
            let reasoning = reasoningMatch ? reasoningMatch[1].trim() : 'Reasoning generated from LLM.';

            if (pedagogyMatch && mode === AgentMode.Learning) {
                reasoning = `${reasoning}\n\n🎓 EDUCATION:\n${pedagogyMatch[1].trim()}`;
            }

            if (mode === AgentMode.Expert) {
                if (techDebtMatch) {
                    reasoning = `${reasoning}\n\n⚠️ TECH DEBT:\n${techDebtMatch[1].trim()}`;
                }
                if (complexityMatch) {
                    reasoning = `${reasoning}\n\n📊 COMPLEXITY:\n${complexityMatch[1].trim()}`;
                }
                if (edgeCasesMatch) {
                    reasoning = `${reasoning}\n\n🔍 EDGE CASES:\n${edgeCasesMatch[1].trim()}`;
                }
            }

            const alternatives = alternativesMatch ? alternativesMatch[1].trim().split('\n').map(s => s.trim()).filter(Boolean) : [];
            const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.85;

            this.updateState('success', 'Code suggestions generated.');

            return {
                result: result,
                reasoning: reasoning,
                alternatives: alternatives,
                confidence: isNaN(confidence) ? 0.85 : confidence
            };
        } catch (error: any) {
            this.updateState('alert', `Error generating code: ${error.message}`);
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

    private updateState(status: AgentStatus, task?: string): void {
        this.status = status;
        this.currentTask = task;
    }
}
