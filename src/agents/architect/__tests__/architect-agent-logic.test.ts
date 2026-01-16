import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ArchitectAgent } from '../architect-agent.js';

vi.mock('vscode', () => ({
    workspace: {
        workspaceFolders: [{ uri: { fsPath: '/test/path' } }],
        fs: {
            readFile: vi.fn()
        },
        getConfiguration: vi.fn().mockReturnValue({
            get: vi.fn().mockReturnValue({})
        })
    },
    Uri: {
        file: (p: string) => ({ fsPath: p })
    }
}));

vi.mock('path', () => ({
    join: (...args: string[]) => args.join('/')
}));

describe('ArchitectAgent Logic Test', () => {
    let agent: ArchitectAgent;

    beforeEach(() => {
        agent = new ArchitectAgent();
        vi.clearAllMocks();
    });

    it('Should cache architecture results', async () => {
        const { workspace } = await import('vscode');
        (workspace.fs.readFile as any).mockResolvedValue(Buffer.from(JSON.stringify({ dependencies: { react: '1.0.0' } })));

        // First call
        const arch1 = await agent.analyzeProject();
        expect(arch1.techStack.frontend).toBe('react');
        expect(workspace.fs.readFile).toHaveBeenCalledTimes(1);

        // Second call should use cache
        const arch2 = await agent.analyzeProject();
        expect(arch2).toBe(arch1);
        expect(workspace.fs.readFile).toHaveBeenCalledTimes(1);
    });
});
