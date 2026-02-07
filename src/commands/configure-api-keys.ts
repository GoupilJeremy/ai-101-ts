import * as vscode from 'vscode';
import { ConfigurationManager } from '../config/configuration-manager.js';

/**
 * Command handler to configure API keys securely using VSCode SecretStorage.
 * Prompts user for OpenAI and Anthropic API keys and stores them securely.
 */
export async function configureApiKeysCommand(context: vscode.ExtensionContext): Promise<void> {
    try {
        // Prompt for OpenAI API Key
        const openaiKey = await vscode.window.showInputBox({
            prompt: 'Enter your OpenAI API Key (leave empty to skip)',
            password: true,
            placeHolder: 'sk-...',
            ignoreFocusOut: true
        });

        if (openaiKey) {
            await context.secrets.store('ai101.openai.apiKey', openaiKey);
            vscode.window.showInformationMessage('AI-101: OpenAI API Key saved securely');
        }

        // Prompt for Anthropic API Key
        const anthropicKey = await vscode.window.showInputBox({
            prompt: 'Enter your Anthropic API Key (leave empty to skip)',
            password: true,
            placeHolder: 'sk-ant-...',
            ignoreFocusOut: true
        });

        if (anthropicKey) {
            await context.secrets.store('ai101.anthropic.apiKey', anthropicKey);
            vscode.window.showInformationMessage('AI-101: Anthropic API Key saved securely');
        }

        if (!openaiKey && !anthropicKey) {
            vscode.window.showInformationMessage('AI-101: No API keys were configured');
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to configure API keys: ${error}`);
    }
}

/**
 * Command handler to reset configuration to defaults.
 * Prompts for confirmation before resetting all settings.
 */
export async function resetConfigCommand(): Promise<void> {
    try {
        const confirmation = await vscode.window.showWarningMessage(
            'Are you sure you want to reset all AI-101 configuration to defaults? This cannot be undone.',
            { modal: true },
            'Reset',
            'Cancel'
        );

        if (confirmation === 'Reset') {
            await ConfigurationManager.getInstance().resetToDefaults();
            vscode.window.showInformationMessage('AI-101: Configuration reset to defaults');
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to reset configuration: ${error}`);
    }
}
