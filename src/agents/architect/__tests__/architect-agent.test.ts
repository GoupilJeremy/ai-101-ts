import * as assert from 'assert';
import { ArchitectAgent } from '../architect-agent.js';

suite('ArchitectAgent Test Suite', () => {
    let agent: ArchitectAgent;

    setup(() => {
        agent = new ArchitectAgent();
    });

    test('Should identify itself correctly', () => {
        assert.strictEqual(agent.name, 'architect');
        assert.strictEqual(agent.displayName, 'Architect Agent');
    });

    test('Should detect Singleton pattern', async () => {
        const context = 'private static instance: MyClass; public static getInstance() {}';
        const response = await agent.execute({ prompt: 'analyze', context });
        assert.ok(response.result.includes('Singleton Pattern'));
    });

    test('Should detect VSCode extension pattern', async () => {
        const context = "import * as vscode from 'vscode'; export function activate() {}";
        const response = await agent.execute({ prompt: 'analyze', context });
        assert.ok(response.result.includes('VSCode Extension Pattern'));
    });

    test('Should update state to thinking then success', async () => {
        const promise = agent.execute({ prompt: 'test' });
        assert.strictEqual(agent.getState().status, 'thinking');
        await promise;
        assert.strictEqual(agent.getState().status, 'success');
    });
});
