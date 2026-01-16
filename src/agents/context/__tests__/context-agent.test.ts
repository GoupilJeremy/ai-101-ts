import * as assert from 'assert';
import * as vscode from 'vscode';
import { ContextAgent } from '../context-agent.js';

// Mock VSCode
(vscode as any).window = {
    activeTextEditor: {
        document: {
            fileName: '/test/workspace/test.ts',
            getText: () => 'import { utils } from "./utils";\nconsole.log("hello");'
        }
    },
    showInformationMessage: () => { },
    showErrorMessage: () => { },
    showWarningMessage: () => { }
};
(vscode as any).workspace = {
    workspaceFolders: [{ uri: { fsPath: '/test/workspace' } }],
    textDocuments: [
        { uri: { scheme: 'file', fsPath: '/test/workspace/recent.ts' }, isUntitled: false }
    ],
    findFiles: async () => [{ fsPath: '/test/workspace/utils.ts' }],
    fs: {
        readFile: async (uri: vscode.Uri) => {
            if (uri.fsPath.includes('utils.ts')) {
                return Buffer.from('export const utils = () => {};');
            }
            return Buffer.from('console.log("hello");');
        },
        stat: async () => ({})
    }
};
(vscode as any).Uri = { file: (path: string) => ({ fsPath: path }) };

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

    test('Should discover and load multiple files', async () => {
        const response = await agent.execute({ prompt: 'test' });

        // Should load current file and imported file
        assert.ok(response.result.includes('test.ts'));
        assert.ok(response.result.includes('utils.ts'));
        assert.ok(agent.getLoadedFiles().length >= 2);
    });

    test('Should add file to manual context', async () => {
        const success = await agent.addFileToContext('/test/manual.ts');

        assert.strictEqual(success, true);
        assert.ok(agent.getManualContextFiles().includes('/test/manual.ts'));
    });

    test('Should remove file from manual context', () => {
        agent.addFileToContext('/test/manual.ts');
        const success = agent.removeFileFromContext('/test/manual.ts');

        assert.strictEqual(success, true);
        assert.ok(!agent.getManualContextFiles().includes('/test/manual.ts'));
    });

    test('Should handle invalid file path gracefully', async () => {
        const success = await agent.addFileToContext('/invalid/path.ts');

        assert.strictEqual(success, false);
    });

    test('Should return empty manual context files initially', () => {
        const files = agent.getManualContextFiles();

        assert.ok(Array.isArray(files));
        assert.strictEqual(files.length, 0);
    });
});
