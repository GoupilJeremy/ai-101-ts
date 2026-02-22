import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as vscode from 'vscode';
import { addContextFileCommand, removeContextFileCommand } from '../add-context-file.js';
import { AgentOrchestrator } from '../../agents/orchestrator.js';

// Mock AgentOrchestrator
vi.mock('../../agents/orchestrator.js', () => {
    return {
        AgentOrchestrator: {
            getInstance: vi.fn()
        }
    };
});

describe('add-context-file commands', () => {
    let mockContextAgent: any;
    let mockOrchestrator: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockContextAgent = {
            addFileToContext: vi.fn().mockResolvedValue(true),
            removeFileFromContext: vi.fn().mockReturnValue(true),
            getManualContextFiles: vi.fn().mockReturnValue(['file1.ts', 'file2.ts'])
        };

        mockOrchestrator = {
            getAgent: vi.fn().mockReturnValue(mockContextAgent)
        };

        (AgentOrchestrator.getInstance as any).mockReturnValue(mockOrchestrator);
    });

    describe('addContextFileCommand', () => {
        it('should show error if Context Agent is not available', async () => {
            mockOrchestrator.getAgent.mockReturnValue(null);

            await addContextFileCommand();

            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Context Agent not available');
        });

        it('should prompt for file and add it to context', async () => {
            const selectedUri = { fsPath: '/test/path/file.ts' };
            (vscode.window.showOpenDialog as any).mockResolvedValue([selectedUri]);

            await addContextFileCommand();

            expect(vscode.window.showOpenDialog).toHaveBeenCalled();
            expect(mockContextAgent.addFileToContext).toHaveBeenCalledWith('/test/path/file.ts');
        });

        it('should do nothing if no file is selected', async () => {
            (vscode.window.showOpenDialog as any).mockResolvedValue(undefined);

            await addContextFileCommand();

            expect(mockContextAgent.addFileToContext).not.toHaveBeenCalled();
        });
    });

    describe('removeContextFileCommand', () => {
        it('should show error if Context Agent is not available', async () => {
            mockOrchestrator.getAgent.mockReturnValue(null);

            await removeContextFileCommand();

            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Context Agent not available');
        });

        it('should show information message if no manual files are present', async () => {
            mockContextAgent.getManualContextFiles.mockReturnValue([]);

            await removeContextFileCommand();

            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('No manually added context files to remove');
        });

        it('should prompt for file and remove it from context', async () => {
            (vscode.window.showQuickPick as any).mockResolvedValue({ label: 'file1.ts' });

            await removeContextFileCommand();

            expect(vscode.window.showQuickPick).toHaveBeenCalled();
            expect(mockContextAgent.removeFileFromContext).toHaveBeenCalledWith('file1.ts');
        });

        it('should do nothing if no file is selected in quick pick', async () => {
            (vscode.window.showQuickPick as any).mockResolvedValue(undefined);

            await removeContextFileCommand();

            expect(mockContextAgent.removeFileFromContext).not.toHaveBeenCalled();
        });
    });
});
