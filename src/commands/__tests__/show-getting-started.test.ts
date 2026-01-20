import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as vscode from 'vscode';
import { showGettingStartedCommand } from '../show-getting-started';

// Mock vscode module
vi.mock('vscode', () => ({
    commands: {
        executeCommand: vi.fn()
    },
    window: {
        showErrorMessage: vi.fn()
    }
}));

describe('showGettingStartedCommand', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should execute workbench.action.openWalkthrough command with correct parameters', async () => {
        const executeCommandMock = vi.mocked(vscode.commands.executeCommand);
        executeCommandMock.mockResolvedValue(undefined);

        await showGettingStartedCommand();

        expect(executeCommandMock).toHaveBeenCalledWith(
            'workbench.action.openWalkthrough',
            'GoupilJeremy.suika#suika.gettingStarted',
            false
        );
        expect(executeCommandMock).toHaveBeenCalledTimes(1);
    });

    it('should show error message if command execution fails', async () => {
        const executeCommandMock = vi.mocked(vscode.commands.executeCommand);
        const showErrorMessageMock = vi.mocked(vscode.window.showErrorMessage);
        const testError = new Error('Test error');

        executeCommandMock.mockRejectedValue(testError);

        await showGettingStartedCommand();

        expect(showErrorMessageMock).toHaveBeenCalledWith(
            'Failed to open Getting Started guide: Test error'
        );
    });

    it('should handle non-Error exceptions', async () => {
        const executeCommandMock = vi.mocked(vscode.commands.executeCommand);
        const showErrorMessageMock = vi.mocked(vscode.window.showErrorMessage);

        executeCommandMock.mockRejectedValue('String error');

        await showGettingStartedCommand();

        expect(showErrorMessageMock).toHaveBeenCalledWith(
            'Failed to open Getting Started guide: String error'
        );
    });
});
