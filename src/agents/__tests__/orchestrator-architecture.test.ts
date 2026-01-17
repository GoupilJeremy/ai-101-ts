
import * as assert from 'assert';
import { AgentOrchestrator } from '../orchestrator.js';
import { IAgent, AgentType, IAgentRequest, IAgentResponse, IAgentState } from '../shared/agent.interface.js';
import { LLMProviderManager } from '../../llm/provider-manager.js';
import { IProjectArchitecture } from '../architect/interfaces/project-architecture.interface.js';

class MockAgent implements IAgent {
    constructor(
        public readonly name: AgentType,
        public readonly displayName: string,
        public readonly icon: string = '🤖'
    ) { }

    async initialize(llmManager: LLMProviderManager): Promise<void> { }

    async execute(request: IAgentRequest): Promise<IAgentResponse> {
        return {
            result: `Response from ${this.name}`,
            reasoning: `Reasoning from ${this.name}`,
            confidence: 0.9
        };
    }

    getState(): IAgentState {
        return { status: 'idle', lastUpdate: Date.now() };
    }
}

class MockArchitectAgent implements IAgent {
    public readonly name: AgentType = 'architect';
    public readonly displayName = 'Mock Architect';
    public readonly icon = '🏛️';

    public architecture: IProjectArchitecture = {
        techStack: { language: 'typescript', frontend: 'react', backend: 'node', database: 'none', testing: 'mocha' },
        patterns: { architectural: 'mvc', stateManagement: 'redux' },
        conventions: { naming: 'camelCase', structure: 'feature-based' }
    };

    public analyzeCalled = false;

    async initialize(llmManager: LLMProviderManager): Promise<void> { }

    async execute(request: IAgentRequest): Promise<IAgentResponse> {
        return { result: 'Architect Result', reasoning: 'Architect Reasoning', confidence: 1 };
    }

    async analyzeProject(): Promise<IProjectArchitecture> {
        this.analyzeCalled = true;
        return this.architecture;
    }

    getState(): IAgentState { return { status: 'idle', lastUpdate: 0 }; }
}

class MockCoderAgent implements IAgent {
    public readonly name: AgentType = 'coder';
    public readonly displayName = 'Mock Coder';
    public readonly icon = '💻';
    public lastRequest: IAgentRequest | undefined;

    async initialize(llmManager: LLMProviderManager): Promise<void> { }

    async execute(request: IAgentRequest): Promise<IAgentResponse> {
        this.lastRequest = request;
        return { result: 'Coder Result', reasoning: 'Coder Reasoning', confidence: 1 };
    }

    getState(): IAgentState { return { status: 'idle', lastUpdate: 0 }; }
}

describe('AgentOrchestrator Architecture Integration', () => {
    let orchestrator: AgentOrchestrator;

    beforeEach(() => {
        orchestrator = AgentOrchestrator.getInstance();
        (orchestrator as any).agents.clear();
    });

    it('Should retrieve architecture from ArchitectAgent and pass to CoderAgent', async () => {
        const context = new MockAgent('context', 'Context Agent');
        const architect = new MockArchitectAgent();
        const coder = new MockCoderAgent();
        const reviewer = new MockAgent('reviewer', 'Reviewer Agent');

        orchestrator.registerAgent(context);
        orchestrator.registerAgent(architect);
        orchestrator.registerAgent(coder);
        orchestrator.registerAgent(reviewer);

        await orchestrator.processUserRequest('Create a new feature');

        // Check if analyzeProject was called
        assert.strictEqual(architect.analyzeCalled, true, 'ArchitectAgent.analyzeProject should be called');

        // Check if CoderAgent received the architecture
        assert.ok(coder.lastRequest, 'CoderAgent should receive a request');
        assert.ok(coder.lastRequest!.data, 'CoderAgent request should have data property');
        assert.deepStrictEqual(coder.lastRequest!.data.architecture, architect.architecture, 'Architecture should be passed to CoderAgent');
    });
});
