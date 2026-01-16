import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContextAgent } from '../context-agent.js';
import * as vscode from 'vscode';

// Mock dependencies
const mockLLMManager = {
    getProvider: vi.fn(),
};

vi.mock('../../../llm/provider-manager.js', () => ({
    LLMProviderManager: {
        getInstance: () => mockLLMManager
    }
}));

// Mock TokenOptimizer
vi.mock('../token-optimizer.js', () => ({
    TokenOptimizer: class {
        optimizeFiles = vi.fn().mockResolvedValue({ content: 'optimized content', truncatedCount: 0 });
        estimateTokens = vi.fn().mockResolvedValue(100);
    }
}));

// Mock FileLoader
vi.mock('../file-loader.js', () => ({
    FileLoader: class {
        discoverAndLoadFiles = vi.fn().mockResolvedValue([
            { path: '/test/workspace/test.ts', content: '...' },
            { path: '/test/workspace/utils.ts', content: '...' }
        ]);
        loadSpecificFile = vi.fn().mockResolvedValue('manual content');
    }
}));

// Mock VitalSignsBar
vi.mock('../../../ui/vital-signs-bar.js', () => {
    return {
        VitalSignsBar: {
            getInstance: () => ({
                setLoading: vi.fn(),
                clearLoading: vi.fn()
            })
        }
    };
});

// Mock MetricsProvider
vi.mock('../../../ui/metrics-provider.js', () => {
    return {
        MetricsProvider: {
            getInstance: () => ({
                updateTokens: vi.fn(),
                updateFiles: vi.fn()
            })
        }
    };
});

describe('ContextAgent', () => {
    let agent: ContextAgent;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup specific VSCode mocks for this test
        (vscode.window as any).activeTextEditor = {
            document: {
                uri: { fsPath: '/test/workspace/test.ts' },
                fileName: '/test/workspace/test.ts',
                getText: () => 'import { utils } from "./utils";\nconsole.log("hello");'
            },
            selection: { active: { line: 0 } }
        };
        (vscode.window as any).showInformationMessage = vi.fn();

        (vscode.workspace as any).workspaceFolders = [{ uri: { fsPath: '/test/workspace' } }];
        (vscode.workspace as any).findFiles = vi.fn().mockResolvedValue([{ fsPath: '/test/workspace/utils.ts' }]);
        (vscode.workspace as any).fs = {
            readFile: vi.fn().mockImplementation(async (uri) => {
                if (uri.fsPath.includes('utils.ts')) {
                    return Buffer.from('export const utils = () => {};');
                }
                return Buffer.from('console.log("hello");');
            }),
            stat: vi.fn().mockResolvedValue({})
        };

        agent = new ContextAgent();
        agent.initialize(mockLLMManager as any);
    });

    it('Should identify itself correctly', () => {
        expect(agent.name).toBe('context');
        expect(agent.displayName).toBe('Context Agent');
    });

    it('Should load context and return result', async () => {
        const response = await agent.execute({ prompt: 'test' });
        expect(response.result).toBe('optimized content');
        expect(agent.getState().status).toBe('success');
    });

    it('Should filter excluded files', async () => {
        // Exclude utils.ts
        agent.excludeFile('/test/workspace/utils.ts');

        await agent.execute({ prompt: 'test' });

        const loaded = agent.getLoadedFiles();
        expect(loaded).not.toContain('/test/workspace/utils.ts');
        expect(loaded).toContain('/test/workspace/test.ts');
    });

    it('Should re-include files', async () => {
        agent.excludeFile('/test/workspace/utils.ts');
        agent.includeFile('/test/workspace/utils.ts');

        await agent.execute({ prompt: 'test' });

        const loaded = agent.getLoadedFiles();
        expect(loaded).toContain('/test/workspace/utils.ts');
    });

    it('Should provide detailed context files for UI', async () => {
        await agent.execute({ prompt: 'test' });

        const uiFiles = agent.getContextFiles();
        expect(uiFiles.length).toBeGreaterThan(0);
        expect(uiFiles[0]).toHaveProperty('filename');
        expect(uiFiles[0]).toHaveProperty('path');
        expect(uiFiles[0]).toHaveProperty('tokens');
        expect(uiFiles[0]).toHaveProperty('relevance');
    });
});
