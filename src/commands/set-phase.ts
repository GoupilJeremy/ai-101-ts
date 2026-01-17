import * as vscode from 'vscode';
import { PhaseDetector } from '../services/phase-detector.js';
import { DevelopmentPhase } from '../state/types.js';

/**
 * Command to manually set or reset the development phase override.
 */
export async function setPhaseCommand() {
    const phases = [
        { label: '✨ Automatic', value: null, detail: 'Auto-detect based on debug sessions and project files' },
        { label: '🧪 Prototype', value: 'prototype', detail: 'Speed and conciseness (Default)' },
        { label: '🏗️ Production', value: 'production', detail: 'Security, performance, and documentation' },
        { label: '🐛 Debug', value: 'debug', detail: 'Logging, error catching, and diagnostics' }
    ];

    const selected = await vscode.window.showQuickPick(phases, {
        placeHolder: 'Set Development Phase'
    });

    if (selected !== undefined) {
        PhaseDetector.getInstance().setManualOverride(selected.value as DevelopmentPhase | null);

        const message = selected.value === null
            ? 'AI-101: Reverted to automatic phase detection'
            : `AI-101: Development phase set to ${selected.label.split(' ')[1]}`;

        vscode.window.showInformationMessage(message);
    }
}
