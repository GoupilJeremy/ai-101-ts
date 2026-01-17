import * as vscode from 'vscode';
import { ExtensionStateManager } from '../state/extension-state-manager.js';

/**
 * Handles creating a TODO entry from a critical alert.
 * Story 7.3: Implement Drag-and-Drop Alerts to TODO List
 */
export async function createTodoFromAlert(alertId: string) {
    const stateManager = ExtensionStateManager.getInstance();
    const alerts = stateManager.getAlerts();
    const alert = alerts.find(a => a.id === alertId);

    if (!alert) {
        console.warn(`Alert not found for TODO creation: ${alertId}`);
        return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active editor to create TODO.');
        return;
    }

    const doc = editor.document;
    const line = alert.anchorLine !== undefined ? alert.anchorLine : editor.selection.active.line;

    // Format: // TODO: [AI-Review] {alert.message} ({alert.severity})
    // We escape newlines in message to keep it on one line if possible, or just take first line
    const cleanMessage = alert.message.split('\n')[0].trim();
    const todoText = `// TODO: [AI-Review] ${cleanMessage} (${alert.severity})\n`;

    const edit = new vscode.WorkspaceEdit();
    // Insert at the beginning of the line where the alert is anchored
    edit.insert(doc.uri, new vscode.Position(line, 0), todoText);

    const success = await vscode.workspace.applyEdit(edit);
    if (success) {
        vscode.window.showInformationMessage(`Added alert to TODO list at line ${line + 1}`);
        // Remove the alert after taskifying it
        stateManager.removeAlert(alertId);
    } else {
        vscode.window.showErrorMessage('Failed to create TODO entry.');
    }
}

/**
 * Handles dismissing an alert.
 */
export async function dismissAlert(alertId: string) {
    ExtensionStateManager.getInstance().removeAlert(alertId);
    vscode.window.showInformationMessage('Alert dismissed.');
}
