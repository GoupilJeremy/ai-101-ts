import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VersionManager } from '../version-manager.js';
import * as vscode from 'vscode';

describe('VersionManager', () => {
    let context: any;
    let versionManager: VersionManager;

    beforeEach(() => {
        vi.clearAllMocks();
        context = {
            extension: {
                packageJSON: {
                    version: '1.1.0'
                }
            },
            globalState: {
                get: vi.fn(),
                update: vi.fn()
            }
        };
        versionManager = new VersionManager(context as any);
    });

    it('should initialize lastKnownVersion on first run', async () => {
        context.globalState.get.mockReturnValue(undefined);

        await versionManager.checkVersionUpdate();

        expect(context.globalState.update).toHaveBeenCalledWith('ai101.lastKnownVersion', '1.1.0');
        expect(vscode.window.showInformationMessage).not.toHaveBeenCalled();
    });

    it('should show notification when version increases', async () => {
        context.globalState.get.mockReturnValue('1.0.0');

        await versionManager.checkVersionUpdate();

        expect(vscode.window.showInformationMessage).toHaveBeenCalled();
        expect(context.globalState.update).toHaveBeenCalledWith('ai101.lastKnownVersion', '1.1.0');
    });

    it('should not show notification if version is same', async () => {
        context.globalState.get.mockReturnValue('1.1.0');

        await versionManager.checkVersionUpdate();

        expect(vscode.window.showInformationMessage).not.toHaveBeenCalled();
    });

    it('should trigger command if notification action is selected', async () => {
        context.globalState.get.mockReturnValue('1.0.0');
        vi.mocked(vscode.window.showInformationMessage).mockResolvedValue('View Changelog' as any);

        await versionManager.checkVersionUpdate();

        expect(vscode.commands.executeCommand).toHaveBeenCalledWith('ai-101-ts.viewChangelog');
    });
});
