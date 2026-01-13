import * as assert from 'assert';
import * as vscode from 'vscode';
import { ContextAgent } from '../context-agent.js';

// Mock VSCode
(vscode as any).window = {
    activeTextEditor: {
        document: {
            fileName: 'test.ts',
            getText: () => 'console.log("hello");'
        }
    }
};
(vscode as any).workspace = {
    textDocuments: []
};

suite('ContextAgent Test Suite', () => {
    let agent: ContextAgent;

    setup(() => {
        agent = new ContextAgent();
    });

    test('Should identify itself correctly', () => {
        assert.strictEqual(agent.name, 'context');
        assert.strictEqual(agent.displayName, 'Context Agent');
    });

    test('Should load active editor content', async () => {
        const response = await agent.execute({ prompt: 'test' });
        assert.ok(response.result.includes('test.ts'));
        assert.ok(response.result.includes('console.log("hello");'));
        assert.strictEqual(agent.getLoadedFiles().length, 1);
    });

    test('Should update state to working then success', async () => {
        const promise = agent.execute({ prompt: 'test' });
        assert.strictEqual(agent.getState().status, 'working');
        await promise;
        assert.strictEqual(agent.getState().status, 'success');
    });
});
