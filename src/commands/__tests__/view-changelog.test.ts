import { describe, it, expect, vi, beforeEach } from 'vitest';
import { viewChangelogCommand } from '../view-changelog.js';
import * as vscode from 'vscode';
import * as path from 'path';

describe('viewChangelogCommand', () => {
    let context: any;

    beforeEach(() => {
        vi.clearAllMocks();
        context = {
            extensionPath: '/mock/extension/path'
        };
    });

    it('should open CHANGELOG.md in preview if it exists', async () => {
        // Mock fs.stat to succeed
        vi.mocked(vscode.workspace.fs.stat).mockResolvedValue({} as any);

        await viewChangelogCommand(context as any);

        const expectedUri = vscode.Uri.file(path.join(context.extensionPath, 'CHANGELOG.md'));
        expect(vscode.commands.executeCommand).toHaveBeenCalledWith('markdown.showPreview', expect.objectContaining({
            fsPath: expectedUri.fsPath
        }));
    });

    it('should show error message if CHANGELOG.md does not exist', async () => {
        // Mock fs.stat to fail
        vi.mocked(vscode.workspace.fs.stat).mockRejectedValue(new Error('File not found'));

        await viewChangelogCommand(context as any);

        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(expect.stringContaining('not found'));
        expect(vscode.commands.executeCommand).not.toHaveBeenCalledWith('markdown.showPreview', expect.anything());
    });
});
