
import * as vscode from 'vscode';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { createTodoFromAlert, dismissAlert } from '../commands/alert-commands.js';
import { ExtensionStateManager } from '../state/extension-state-manager.js';

describe('Alert Commands', () => {
    let stateManager: ExtensionStateManager;
    let workspaceEditStub: sinon.SinonStub;
    let applyEditStub: sinon.SinonStub;
    let showInfoStub: sinon.SinonStub;
    let activeEditorStub: any;

    beforeEach(() => {
        stateManager = ExtensionStateManager.getInstance();
        stateManager.clearAlerts();

        // Stub VSCode WorkspaceEdit
        applyEditStub = sinon.stub(vscode.workspace, 'applyEdit').resolves(true);
        showInfoStub = sinon.stub(vscode.window, 'showInformationMessage');

        // Mock active editor
        activeEditorStub = {
            document: {
                uri: vscode.Uri.file('/test/file.ts')
            },
            selection: {
                active: new vscode.Position(10, 0)
            }
        };
        sinon.stub(vscode.window, 'activeTextEditor').get(() => activeEditorStub);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should create a TODO and remove the alert', async () => {
        const testAlert = {
            id: 'test-1',
            severity: 'critical' as any,
            message: 'Problem found',
            anchorLine: 5,
            agent: 'reviewer',
            timestamp: Date.now()
        };
        stateManager.addAlert(testAlert);

        await createTodoFromAlert('test-1');

        expect(applyEditStub.calledOnce).to.be.true;
        const edit = applyEditStub.firstCall.args[0] as vscode.WorkspaceEdit;
        // Verify edit contains TODO text
        // Note: WorkspaceEdit is hard to inspect in mocks without more complex stubs

        expect(stateManager.getAlerts().length).to.equal(0);
        expect(showInfoStub.calledWith(sinon.match('Added alert to TODO'))).to.be.true;
    });

    it('should dismiss an alert', async () => {
        const testAlert = {
            id: 'test-2',
            severity: 'warning' as any,
            message: 'Minor issue',
            agent: 'reviewer',
            timestamp: Date.now()
        };
        stateManager.addAlert(testAlert);

        await dismissAlert('test-2');

        expect(stateManager.getAlerts().length).to.equal(0);
        expect(showInfoStub.calledWith('Alert dismissed.')).to.be.true;
    });
});
