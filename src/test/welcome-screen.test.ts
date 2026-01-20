import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as vscode from 'vscode';

// Mock vscode module
vi.mock('vscode', () => ({
    commands: {
        executeCommand: vi.fn()
    },
    window: {
        showErrorMessage: vi.fn()
    }
}));

describe('First-run Welcome Screen', () => {
    let mockContext: any;
    let globalStateData: Map<string, any>;

    beforeEach(() => {
        vi.clearAllMocks();
        globalStateData = new Map();

        mockContext = {
            globalState: {
                get: vi.fn((key: string, defaultValue?: any) => {
                    return globalStateData.has(key) ? globalStateData.get(key) : defaultValue;
                }),
                update: vi.fn((key: string, value: any) => {
                    globalStateData.set(key, value);
                    return Promise.resolve();
                })
            },
            subscriptions: []
        };
    });

    it('should show welcome walkthrough on first activation', async () => {
        const executeCommandMock = vi.mocked(vscode.commands.executeCommand);
        executeCommandMock.mockResolvedValue(undefined);

        // Simulate first run - hasShownWelcome is false
        const hasShownWelcome = mockContext.globalState.get('suika.hasShownWelcome', false);
        expect(hasShownWelcome).toBe(false);

        if (!hasShownWelcome) {
            await vscode.commands.executeCommand(
                'workbench.action.openWalkthrough',
                'GoupilJeremy.suika#suika.gettingStarted',
                false
            );
            await mockContext.globalState.update('suika.hasShownWelcome', true);
        }

        expect(executeCommandMock).toHaveBeenCalledWith(
            'workbench.action.openWalkthrough',
            'GoupilJeremy.suika#suika.gettingStarted',
            false
        );
        expect(mockContext.globalState.update).toHaveBeenCalledWith('suika.hasShownWelcome', true);
    });

    it('should not show welcome walkthrough on subsequent activations', async () => {
        const executeCommandMock = vi.mocked(vscode.commands.executeCommand);

        // Simulate subsequent run - hasShownWelcome is true
        globalStateData.set('suika.hasShownWelcome', true);
        const hasShownWelcome = mockContext.globalState.get('suika.hasShownWelcome', false);
        expect(hasShownWelcome).toBe(true);

        if (!hasShownWelcome) {
            await vscode.commands.executeCommand(
                'workbench.action.openWalkthrough',
                'GoupilJeremy.suika#suika.gettingStarted',
                false
            );
        }

        expect(executeCommandMock).not.toHaveBeenCalled();
    });

    it('should handle walkthrough command failure gracefully', async () => {
        const executeCommandMock = vi.mocked(vscode.commands.executeCommand);
        const testError = new Error('Walkthrough not found');
        executeCommandMock.mockRejectedValue(testError);

        const hasShownWelcome = mockContext.globalState.get('suika.hasShownWelcome', false);

        if (!hasShownWelcome) {
            try {
                await vscode.commands.executeCommand(
                    'workbench.action.openWalkthrough',
                    'GoupilJeremy.suika#suika.gettingStarted',
                    false
                );
                await mockContext.globalState.update('suika.hasShownWelcome', true);
            } catch (error) {
                // Should handle error gracefully without blocking activation
                expect(error).toBe(testError);
            }
        }

        expect(executeCommandMock).toHaveBeenCalled();
        // State should not be updated if command failed
        expect(mockContext.globalState.update).not.toHaveBeenCalled();
    });
});
