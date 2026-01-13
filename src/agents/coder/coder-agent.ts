import { IAgent, AgentType, IAgentRequest, IAgentResponse, IAgentState, AgentStatus } from '../shared/agent.interface.js';
import { LLMProviderManager } from '../../llm/provider-manager.js';
import { ModeManager } from '../../modes/mode-manager.js';
import { AgentMode } from '../../modes/mode-types.js';

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
        let learningInstruction = '';
        if (mode === AgentMode.Learning) {
            learningInstruction = `
[LEARNING MODE ACTIVE]
Please provide a detailed [PEDAGOGY] section. Identify any design patterns used (e.g. Singleton, Observer).
Explain "Why" this approach is better than others for a student. 
Include links to documentation where appropriate.`;
        }

        const systemPrompt = `You are the Coder Agent for AI-101. 
Your goal is to generate high-quality TypeScript code based on the user's request, project context, and architectural guidance.
Always follow established project patterns and TypeScript best practices.
${learningInstruction}

EXPECTED OUTPUT FORMAT:
[REASONING]
Briefly explain your technical approach.
[PEDAGOGY]
(Only if Learning mode is active) Detailed educational explanation and patterns.
[CODE]
The generated code snippet.
[ALTERNATIVES]
Briefly list alternative approaches if applicable.`;

        const finalPrompt = `${systemPrompt}\n\nPROJECT CONTEXT:\n${request.context || 'No context provided'}\n\nUSER REQUEST: ${request.prompt}`;

        try {
            const llmResponse = await this.llmManager.callLLM(this.name, finalPrompt, request.options);

            // Parse response
            const text = llmResponse.text;
            const reasoningMatch = text.match(/\[REASONING\]([\s\S]*?)(?:\[PEDAGOGY\]|\[CODE\])/);
            const pedagogyMatch = text.match(/\[PEDAGOGY\]([\s\S]*?)\[CODE\]/);
            const codeMatch = text.match(/\[CODE\]([\s\S]*?)(\[ALTERNATIVES\]|$)/);
            const alternativesMatch = text.match(/\[ALTERNATIVES\]([\s\S]*)/);

            const result = codeMatch ? codeMatch[1].trim() : text;
            let reasoning = reasoningMatch ? reasoningMatch[1].trim() : 'Reasoning generated from LLM.';

            if (pedagogyMatch && mode === AgentMode.Learning) {
                reasoning = `${reasoning}\n\n🎓 EDUCATION:\n${pedagogyMatch[1].trim()}`;
            }

            const alternatives = alternativesMatch ? alternativesMatch[1].trim().split('\n').map(s => s.trim()).filter(Boolean) : [];

            this.updateState('success', 'Code suggestions generated.');

            return {
                result: result,
                reasoning: reasoning,
                alternatives: alternatives,
                confidence: 0.85
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
