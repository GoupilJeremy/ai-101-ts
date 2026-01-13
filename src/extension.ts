// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
import { AI101WebviewProvider } from './webview/webview-provider.js';
import { WebviewManager } from './ui/webview-manager.js';
import { ErrorHandler } from './errors/error-handler.js';
import { LLMProviderManager } from './llm/provider-manager.js';
import { RateLimiter } from './llm/rate-limiter.js';
import { VitalSignsBar } from './ui/vital-signs-bar.js';
import { SpatialManager } from './ui/spatial-manager.js';
import { ModeManager } from './modes/mode-manager.js';
import { AgentMode } from './modes/mode-types.js';

export function activate(context: vscode.ExtensionContext) {

	// Initialize Centralized Error Handler
	ErrorHandler.initialize();
	ErrorHandler.log('Extension "ai-101-ts" activation started.');

	// Initialize LLM Manager and Rate Limiter
	LLMProviderManager.getInstance().initialize(context.globalStorageUri.fsPath);
	RateLimiter.getInstance().reset();

	// Initialize UI Components
	context.subscriptions.push(VitalSignsBar.getInstance().getDisposable());
	context.subscriptions.push(SpatialManager.getInstance());
	ModeManager.getInstance(); // Initialize early to load persisted mode
	WebviewManager.getInstance().initialize(context);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('ai-101-ts.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from ai-101-ts!');
	});

	context.subscriptions.push(disposable);

	// Command to switch modes
	let switchModeDisposable = vscode.commands.registerCommand('ai101.switchMode', async () => {
		const modes = [
			{ label: 'Learning', value: AgentMode.Learning, detail: 'Pedagogical explanations and pattern annotations' },
			{ label: 'Expert', value: AgentMode.Expert, detail: 'In-depth technical details and trade-offs' },
			{ label: 'Focus', value: AgentMode.Focus, detail: 'Minimal UI with agents hidden' },
			{ label: 'Team', value: AgentMode.Team, detail: 'Visible labels and team-oriented metrics' },
			{ label: 'Performance', value: AgentMode.Performance, detail: 'Reduced animations for better speed' }
		];

		const selected = await vscode.window.showQuickPick(modes, {
			placeHolder: 'Select AI-101 Mode'
		});

		if (selected) {
			await ModeManager.getInstance().setMode(selected.value as AgentMode);
			vscode.window.showInformationMessage(`AI-101: Switched to ${selected.label} mode`);
		}
	});

	context.subscriptions.push(switchModeDisposable);

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
