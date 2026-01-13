// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
import { AI101WebviewProvider } from './webview/webview-provider.js';
import { ErrorHandler } from './errors/error-handler.js';
import { LLMProviderManager } from './llm/provider-manager.js';
import { RateLimiter } from './llm/rate-limiter.js';
import { VitalSignsBar } from './ui/vital-signs-bar.js';

export function activate(context: vscode.ExtensionContext) {

	// Initialize Centralized Error Handler
	ErrorHandler.initialize();
	ErrorHandler.log('Extension "ai-101-ts" activation started.');

	// Initialize LLM Manager and Rate Limiter
	LLMProviderManager.getInstance().initialize(context.globalStorageUri.fsPath);
	RateLimiter.getInstance().reset();

	// Initialize UI Components
	context.subscriptions.push(VitalSignsBar.getInstance().getDisposable());

	console.log('Congratulations, your extension "ai-101-ts" is now active!');

	const provider = new AI101WebviewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(AI101WebviewProvider.viewType, provider)
	);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('ai-101-ts.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from ai-101-ts!');
	});

	context.subscriptions.push(disposable);

	context.subscriptions.push(
		vscode.commands.registerCommand('ai-101-ts.applyPreset', () => {
			import('./commands/apply-preset.js').then(module => module.applyPresetCommand());
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('ai-101-ts.exportConfig', () => {
			import('./commands/export-config.js').then(module => module.exportConfigCommand());
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('ai-101-ts.importConfig', () => {
			import('./commands/import-config.js').then(module => module.importConfigCommand());
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() { }
