import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { FileLoader } from '../file-loader.js';

// Mock VSCode workspace
const mockWorkspace = {
    workspaceFolders: [{ uri: { fsPath: '/test/workspace' } }],
    findFiles: async (pattern: string) => {
        if (pattern.includes('utils')) {
            return [{ fsPath: '/test/workspace/src/utils.ts' }];
        }
        return [];
    },
    fs: {
        readFile: async (uri: vscode.Uri) => {
            const filePath = uri.fsPath;
            if (filePath.includes('test.ts')) {
                return Buffer.from('import { utils } from "./utils";\nconsole.log("test");');
            } else if (filePath.includes('utils.ts')) {
                return Buffer.from('export const utils = () => "utils";');
            }
            throw new Error('File not found');
        },
        stat: async (uri: vscode.Uri) => {
            // Mock file exists
            return {};
        }
    },
    textDocuments: [
        { uri: { scheme: 'file', fsPath: '/test/workspace/recent1.ts' }, isUntitled: false },
        { uri: { scheme: 'file', fsPath: '/test/workspace/recent2.ts' }, isUntitled: false }
    ]
};

(vscode as any).workspace = mockWorkspace;
(vscode as any).Uri = { file: (path: string) => ({ fsPath: path }) };

suite('FileLoader Test Suite', () => {
    let fileLoader: FileLoader;

    setup(() => {
        fileLoader = new FileLoader();
    });

    test('Should discover and load current file', async () => {
        const files = await fileLoader.discoverAndLoadFiles('/test/workspace/test.ts', 5);

        assert.strictEqual(files.length, 1);
        assert.strictEqual(files[0].path, '/test/workspace/test.ts');
        assert.ok(files[0].content.includes('import { utils }'));
    });

    test('Should discover import dependencies', async () => {
        const files = await fileLoader.discoverAndLoadFiles('/test/workspace/test.ts', 5);

        // Should include the utils.ts file from import
        const utilsFile = files.find(f => f.path.includes('utils.ts'));
        assert.ok(utilsFile);
        assert.ok(utilsFile!.content.includes('export const utils'));
    });

    test('Should respect max files limit', async () => {
        const files = await fileLoader.discoverAndLoadFiles('/test/workspace/test.ts', 1);

        assert.strictEqual(files.length, 1);
        assert.strictEqual(files[0].path, '/test/workspace/test.ts');
    });

    test('Should load specific file', async () => {
        const content = await fileLoader.loadSpecificFile('/test/workspace/test.ts');

        assert.ok(content);
        assert.ok(content!.includes('console.log("test")'));
    });

    test('Should handle file not found gracefully', async () => {
        const content = await fileLoader.loadSpecificFile('/nonexistent/file.ts');

        assert.strictEqual(content, null);
    });

    test('Should complete file discovery within performance target', async () => {
        const startTime = Date.now();
        await fileLoader.discoverAndLoadFiles('/test/workspace/test.ts', 5);
        const duration = Date.now() - startTime;

        // Allow some tolerance for test environment
        assert.ok(duration < 1000, `File discovery took ${duration}ms, should be < 1000ms`);
    });

    test('Should prioritize current file first', async () => {
        const files = await fileLoader.discoverAndLoadFiles('/test/workspace/test.ts', 5);

        assert.strictEqual(files[0].path, '/test/workspace/test.ts');
    });
});