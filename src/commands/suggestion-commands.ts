import * as vscode from 'vscode';
import { ExtensionStateManager, IDecisionRecord } from '../state/index.js';
import { ErrorHandler } from '../errors/error-handler.js';
import { TelemetryManager } from '../services/telemetry-manager.js';
import { MetricsService } from '../telemetry/metrics-service.js';
import { LifecycleEventManager } from '../api/lifecycle-event-manager.js';
import { AgentType } from '../agents/shared/agent.interface.js';



/**
 * Handles the accept/reject suggestion commands.
 * Can be triggered from HUD (via message) or Editor (via hotkey).
 * Story 7.1: Implement Suggestion Accept/Reject with Visual Feedback
 */
export async function handleSuggestionCommand(action: 'accepted' | 'rejected', args?: any) {
    const stateManager = ExtensionStateManager.getInstance();

    // 1. Identify Target Suggestion
    let suggestionId = args?.suggestionId;

    if (!suggestionId) {
        // Find most recent pending suggestion from history
        const history = stateManager.getHistory();
        const latestPending = history.filter((r: IDecisionRecord) => r.type === 'suggestion' && r.status === 'pending').pop();
        if (latestPending) {
            suggestionId = latestPending.id;
        }
    }

    if (!suggestionId) {
        // If still no ID, check if there's an active alert that looks like a suggestion
        const alerts = stateManager.getAlerts();
        const suggestionAlert = alerts.reverse().find((a: any) => (a.id && a.id.startsWith('suggestion-')) || (a.data && a.data.type === 'suggestion'));
        if (suggestionAlert) {
            suggestionId = suggestionAlert.id;
        }
    }

    if (!suggestionId) {
        ErrorHandler.log('No pending suggestion found to ' + action, 'WARNING');
        return;
    }

    const historyRecord = stateManager.getHistory().find((r: IDecisionRecord) => r.id === suggestionId);

    // 2. Perform Action
    if (action === 'accepted') {
        const codeToApply = historyRecord?.details?.code || (args?.alert?.data?.code);

        if (codeToApply) {
            try {
                await applyCodeSuggestion(codeToApply);
                stateManager.updateHistoryEntryStatus(suggestionId, 'accepted');
                ErrorHandler.log(`Suggestion ${suggestionId} accepted.`);

                // Track Telemetry (Integration Task 5)
                TelemetryManager.getInstance().trackAcceptance(true, {
                    suggestionId,
                    agent: historyRecord?.agent || 'coder'
                });

                // Record Local Metrics (Story 8.2)
                const lineCount = codeToApply.split('\n').length;
                MetricsService.getInstance().recordSuggestionAccepted(lineCount);

                // Emit Lifecycle Event: suggestionAccepted
                LifecycleEventManager.getInstance().emit('suggestionAccepted', {
                    id: suggestionId,
                    agent: (historyRecord?.agent as AgentType) || 'coder',
                    code: codeToApply,
                    timestamp: Date.now()
                });
            } catch (error: any) {

                ErrorHandler.handleError(error);
                vscode.window.showErrorMessage(`Failed to apply suggestion: ${error.message}`);
                return;
            }
        } else {
            ErrorHandler.log(`No code found for suggestion ${suggestionId}`, 'ERROR');
        }
    } else {
        stateManager.updateHistoryEntryStatus(suggestionId, 'rejected');
        ErrorHandler.log(`Suggestion ${suggestionId} rejected.`);

        // Track Telemetry
        TelemetryManager.getInstance().trackAcceptance(false, {
            suggestionId,
            agent: historyRecord?.agent || 'coder'
        });

        // Record Local Metrics (Story 8.2)
        MetricsService.getInstance().recordSuggestionRejected();

        // Emit Lifecycle Event: suggestionRejected
        LifecycleEventManager.getInstance().emit('suggestionRejected', {
            id: suggestionId,
            agent: (historyRecord?.agent as AgentType) || 'coder',
            timestamp: Date.now()
        });
    }


    // 3. Cleanup Alerts
    stateManager.removeAlert(suggestionId);

    // For general review alerts, we might want to clear them too if they were associated
    if (suggestionId.startsWith('review-')) {
        stateManager.removeAlert(suggestionId);
    }
}

/**
 * Applies the suggested code to the active editor using WorkspaceEdit for undo support.
 */
async function applyCodeSuggestion(code: string) {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        throw new Error('No active editor found to apply suggestion.');
    }

    const edit = new vscode.WorkspaceEdit();

    // Applying the suggestion: Replace the current selection.
    // If there's no selection, we might want to insert at cursor.
    edit.replace(
        activeEditor.document.uri,
        activeEditor.selection,
        code
    );

    const success = await vscode.workspace.applyEdit(edit);
    if (!success) {
        throw new Error('Workspace edit failed to apply.');
    }
}
