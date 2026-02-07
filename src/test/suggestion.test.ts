import * as assert from 'assert';
import * as vscode from 'vscode';
import { ExtensionStateManager } from '../state/index.js';

/**
 * Integration tests for suggestion accept/reject actions.
 * Story 7.1: Implement Suggestion Accept/Reject with Visual Feedback
 */
suite('Suggestion Actions Integration Test Suite', () => {

    // Ensure extension is activated
    suiteSetup(async () => {
        const extension = vscode.extensions.getExtension('GoupilJeremy.ai-101-ts');
        if (extension) {
            await extension.activate();
        }
    });

    test('Accept Suggestion Command should apply code edits and update history', async () => {
        const stateManager = ExtensionStateManager.getInstance();

        // 1. Setup a test document
        const doc = await vscode.workspace.openTextDocument({ content: 'initial content', language: 'typescript' });
        const editor = await vscode.window.showTextDocument(doc);

        // Select the text to replace
        editor.selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 15));

        // 2. Add history record for the suggestion
        const suggestionId = 'test-id-' + Date.now();
        stateManager.addHistoryEntry({
            id: suggestionId,
            timestamp: Date.now(),
            type: 'suggestion',
            summary: 'Apply test code',
            agent: 'coder',
            status: 'pending',
            details: {
                reasoning: 'Integration test',
                code: 'const result = "success";'
            }
        });

        // 3. Execute the accept command
        await vscode.commands.executeCommand('ai-101-ts.acceptSuggestion', { suggestionId });

        // 4. Verify the document content changed
        assert.strictEqual(doc.getText(), 'const result = "success";', 'Document content was not updated correctly');

        // 5. Verify history status updated
        const record = stateManager.getHistory().find(h => h.id === suggestionId);
        assert.strictEqual(record?.status, 'accepted', 'History status was not updated to accepted');
    });

    test('Reject Suggestion Command should update history status and remove alerts', async () => {
        const stateManager = ExtensionStateManager.getInstance();
        const suggestionId = 'reject-id-' + Date.now();

        // 1. Setup history and alert
        stateManager.addHistoryEntry({
            id: suggestionId,
            timestamp: Date.now(),
            type: 'suggestion',
            summary: 'Reject test',
            agent: 'coder',
            status: 'pending',
            details: { reasoning: 'Integration test' }
        });

        stateManager.addAlert({
            id: suggestionId,
            agent: 'coder',
            severity: 'info',
            message: 'A suggestion is waiting',
            timestamp: Date.now(),
            data: { type: 'suggestion' }
        });

        assert.ok(stateManager.getAlerts().some(a => a.id === suggestionId), 'Alert was not created');

        // 2. Execute the reject command
        await vscode.commands.executeCommand('ai-101-ts.rejectSuggestion', { suggestionId });

        // 3. Verify history status
        const record = stateManager.getHistory().find(h => h.id === suggestionId);
        assert.strictEqual(record?.status, 'rejected', 'History status was not updated to rejected');

        // 4. Verify alert was removed
        assert.ok(!stateManager.getAlerts().some(a => a.id === suggestionId), 'Alert was not removed after rejection');
    });

    test('Auto-detect latest suggestion when no ID is provided', async () => {
        const stateManager = ExtensionStateManager.getInstance();
        const suggestionId = 'latest-id-' + Date.now();

        stateManager.addHistoryEntry({
            id: suggestionId,
            timestamp: Date.now(),
            type: 'suggestion',
            summary: 'Auto detect',
            agent: 'coder',
            status: 'pending',
            details: { reasoning: 'Testing auto-id' }
        });

        // Execute without args
        await vscode.commands.executeCommand('ai-101-ts.rejectSuggestion');

        const record = stateManager.getHistory().find(h => h.id === suggestionId);
        assert.strictEqual(record?.status, 'rejected');
    });
});
