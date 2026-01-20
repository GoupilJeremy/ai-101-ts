import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as vscode from 'vscode';

// Mock vscode module
vi.mock('vscode', () => ({
    commands: {
        registerCommand: vi.fn((cmd, handler) => ({ dispose: vi.fn() })),
        executeCommand: vi.fn()
    },
    window: {
        showInputBox: vi.fn()
    }
}));

describe('Show Troubleshooting Commands', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('suika.showTroubleshooting', () => {
        it('should register command', async () => {
            const { registerShowTroubleshootingCommand } = await import('../show-troubleshooting');

            const mockContext = {
                subscriptions: []
            } as unknown as vscode.ExtensionContext;

            const mockProvider = {} as any;

            const disposable = registerShowTroubleshootingCommand(mockContext, mockProvider);

            expect(disposable).toBeDefined();
            expect(typeof disposable.dispose).toBe('function');
        });

        it('should focus troubleshooting view when executed', async () => {
            const { registerShowTroubleshootingCommand } = await import('../show-troubleshooting');

            const mockContext = {
                subscriptions: []
            } as unknown as vscode.ExtensionContext;

            const mockProvider = {} as any;

            registerShowTroubleshootingCommand(mockContext, mockProvider);

            // Get the registered handler
            const registerCall = (vscode.commands.registerCommand as any).mock.calls[0];
            const handler = registerCall[1];

            await handler();

            expect(vscode.commands.executeCommand).toHaveBeenCalledWith('suika.troubleshootingView.focus');
        });
    });

    describe('suika.openTroubleshootingArticle', () => {
        it('should register command', async () => {
            const { registerOpenTroubleshootingArticleCommand } = await import('../show-troubleshooting');

            const mockContext = {
                subscriptions: []
            } as unknown as vscode.ExtensionContext;

            const disposable = registerOpenTroubleshootingArticleCommand(mockContext);

            expect(disposable).toBeDefined();
            expect(typeof disposable.dispose).toBe('function');
        });

        it('should prompt for article ID if not provided', async () => {
            const { registerOpenTroubleshootingArticleCommand } = await import('../show-troubleshooting');

            const mockContext = {
                subscriptions: []
            } as unknown as vscode.ExtensionContext;

            registerOpenTroubleshootingArticleCommand(mockContext);

            // Get the registered handler
            const registerCall = (vscode.commands.registerCommand as any).mock.calls.find(
                (call: any[]) => call[0] === 'suika.openTroubleshootingArticle'
            );
            const handler = registerCall[1];

            (vscode.window.showInputBox as any).mockResolvedValue('performance-slow-ui');

            await handler();

            expect(vscode.window.showInputBox).toHaveBeenCalled();
        });

        it('should open article directly if ID provided', async () => {
            const { registerOpenTroubleshootingArticleCommand } = await import('../show-troubleshooting');

            const mockContext = {
                subscriptions: []
            } as unknown as vscode.ExtensionContext;

            registerOpenTroubleshootingArticleCommand(mockContext);

            const registerCall = (vscode.commands.registerCommand as any).mock.calls.find(
                (call: any[]) => call[0] === 'suika.openTroubleshootingArticle'
            );
            const handler = registerCall[1];

            await handler('performance-slow-ui');

            expect(vscode.window.showInputBox).not.toHaveBeenCalled();
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith('suika.troubleshootingView.focus');
        });
    });

    describe('suika.searchTroubleshooting', () => {
        it('should register command', async () => {
            const { registerSearchTroubleshootingCommand } = await import('../show-troubleshooting');

            const mockContext = {
                subscriptions: []
            } as unknown as vscode.ExtensionContext;

            const disposable = registerSearchTroubleshootingCommand(mockContext);

            expect(disposable).toBeDefined();
            expect(typeof disposable.dispose).toBe('function');
        });

        it('should prompt for query if not provided', async () => {
            const { registerSearchTroubleshootingCommand } = await import('../show-troubleshooting');

            const mockContext = {
                subscriptions: []
            } as unknown as vscode.ExtensionContext;

            registerSearchTroubleshootingCommand(mockContext);

            const registerCall = (vscode.commands.registerCommand as any).mock.calls.find(
                (call: any[]) => call[0] === 'suika.searchTroubleshooting'
            );
            const handler = registerCall[1];

            (vscode.window.showInputBox as any).mockResolvedValue('slow ui');

            await handler();

            expect(vscode.window.showInputBox).toHaveBeenCalled();
        });

        it('should search directly if query provided', async () => {
            const { registerSearchTroubleshootingCommand } = await import('../show-troubleshooting');

            const mockContext = {
                subscriptions: []
            } as unknown as vscode.ExtensionContext;

            registerSearchTroubleshootingCommand(mockContext);

            const registerCall = (vscode.commands.registerCommand as any).mock.calls.find(
                (call: any[]) => call[0] === 'suika.searchTroubleshooting'
            );
            const handler = registerCall[1];

            await handler('slow ui');

            expect(vscode.window.showInputBox).not.toHaveBeenCalled();
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith('suika.troubleshootingView.focus');
        });
    });
});
