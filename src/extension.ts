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
import { AgentOrchestrator } from './agents/orchestrator.js';
import { ContextAgent } from './agents/context/context-agent.js';
import { ArchitectAgent } from './agents/architect/architect-agent.js';
import { SystemDetector } from './performance/system-detector.js';
import { PhaseDetector } from './services/phase-detector.js';
import { TelemetryManager } from './telemetry/telemetry-manager.js';
import { TelemetryService } from './telemetry/telemetry-service.js';
import { registerTelemetryCommands } from './commands/telemetry-commands.js';
import { MetricsService } from './telemetry/metrics-service.js';
import { registerMetricsCommands } from './commands/metrics-commands.js';
import { SurveyService } from './telemetry/survey-service.js';
import { DistractionDetectorService } from './telemetry/distraction-detector.js';

// Global reference to survey service for deactivate
let surveyService: SurveyService | null = null;

export function activate(context: vscode.ExtensionContext) {

	// Initialize Centralized Error Handler
	ErrorHandler.initialize();
	ErrorHandler.log('Extension "ai-101-ts" activation started.');

	// Check for low memory and auto-activate Performance Mode if needed (Story 5.6)
	SystemDetector.getInstance().checkAndAutoActivate();

	// Initialize Phase Detector (Story 6.9)
	PhaseDetector.getInstance().initialize(context);

	// Initialize Telemetry
	const telemetryManager = new TelemetryManager(context);
	telemetryManager.checkFirstRun();
	registerTelemetryCommands(context, telemetryManager);
	TelemetryService.getInstance(context); // Initialize singleton
	MetricsService.getInstance(context); // Initialize metrics tracking
	registerMetricsCommands(context); // Register metrics commands

	// Initialize Survey Service (Story 8.4)
	surveyService = new SurveyService(context);
	surveyService.startSession(); // Start tracking session
	surveyService.checkAndPrompt(); // Check for pending surveys from previous session

	// Initialize Distraction Detector (Story 8.7)
	const distractionDetector = DistractionDetectorService.getInstance(context);
	context.subscriptions.push(distractionDetector);


	// Initialize LLM Manager and Rate Limiter
	const llmManager = LLMProviderManager.getInstance();
	llmManager.initialize(context.globalStorageUri.fsPath);
	RateLimiter.getInstance().reset();

	// Initialize Agents
	const orchestrator = AgentOrchestrator.getInstance();
	const contextAgent = new ContextAgent();
	contextAgent.initialize(llmManager);
	orchestrator.registerAgent(contextAgent);

	const architectAgent = new ArchitectAgent();
	architectAgent.initialize(llmManager);
	orchestrator.registerAgent(architectAgent);

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

	context.subscriptions.push(
		vscode.commands.registerCommand('ai-101-ts.toggleFocusMode', () => {
			import('./commands/toggle-focus-mode.js').then(module => module.toggleFocusModeCommand());
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('ai-101-ts.togglePerformanceMode', () => {
			import('./commands/toggle-performance-mode.js').then(module => module.togglePerformanceModeCommand());
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('ai-101-ts.toggleLargeText', () => {
			import('./commands/toggle-large-text.js').then(module => module.toggleLargeTextCommand());
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('ai-101-ts.toggleHighContrast', () => {
			import('./commands/toggle-high-contrast.js').then(module => module.toggleHighContrastCommand());
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('ai-101-ts.toggleColorblind', () => {
			import('./commands/toggle-colorblind.js').then(module => module.toggleColorblind());
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('ai-101-ts.viewArchitecture', async () => {
			const architect = AgentOrchestrator.getInstance().getAgent('architect') as ArchitectAgent;
			if (architect) {
				const arch = await architect.analyzeProject();
				const outputChannel = vscode.window.createOutputChannel('AI-101 Architecture');
				outputChannel.appendLine('Detected Project Architecture:');
				outputChannel.appendLine('=============================');
				outputChannel.appendLine(`Frontend: ${arch.techStack.frontend}`);
				outputChannel.appendLine(`Backend: ${arch.techStack.backend}`);
				outputChannel.appendLine(`Build Tool: ${arch.techStack.build}`);
				outputChannel.appendLine(`Testing Framework: ${arch.techStack.testing}`);
				outputChannel.appendLine(`State Management: ${arch.patterns.stateManagement?.join(', ') || 'None detected'}`);
				outputChannel.appendLine(`API Style: ${arch.patterns.apiStyle?.join(', ') || 'None detected'}`);
				outputChannel.appendLine('=============================');
				outputChannel.appendLine(`Conventions: Naming=${arch.conventions.naming}, Tests=${arch.conventions.testLocation}`);
				outputChannel.show();
			} else {
				vscode.window.showErrorMessage('Architect Agent not found.');
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('ai-101-ts.focusHud', () => {
			// Focus the HUD for keyboard navigation
			const webviewManager = WebviewManager.getInstance();
			// Send message to webview to focus first interactive element
			webviewManager.postMessageToWebview({
				type: 'toWebview:focusFirstElement'
			});
			vscode.window.showInformationMessage('AI-101: HUD focused for keyboard navigation');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('ai-101-ts.setPhase', () => {
			import('./commands/set-phase.js').then(module => module.setPhaseCommand());
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('ai-101-ts.toggleHUD', () => {
			import('./commands/toggle-hud.js').then(module => module.toggleHUDCommand());
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('ai-101-ts.forceAgentState', (agentId?: any, state?: any, task?: any) => {
			import('./commands/force-agent-state.command.js').then(module => module.forceAgentStateCommand(agentId, state, task));
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('ai-101-ts.acceptSuggestion', (args?: any) => {
			import('./commands/suggestion-commands.js').then(module => module.handleSuggestionCommand('accepted', args));
		}),
		vscode.commands.registerCommand('ai-101-ts.rejectSuggestion', (args?: any) => {
			import('./commands/suggestion-commands.js').then(module => module.handleSuggestionCommand('rejected', args));
		}),
		vscode.commands.registerCommand('ai-101-ts.createTodoFromAlert', (alertId: string) => {
			import('./commands/alert-commands.js').then(module => module.createTodoFromAlert(alertId));
		}),
		vscode.commands.registerCommand('ai-101-ts.dismissAlert', (alertId: string) => {
			import('./commands/alert-commands.js').then(module => module.dismissAlert(alertId));
		})
	);

	// Mode switching commands
	context.subscriptions.push(
		vscode.commands.registerCommand('ai-101-ts.switchToLearningMode', () => {
			import('./commands/switch-mode.js').then(module => module.switchToLearningModeCommand());
		}),
		vscode.commands.registerCommand('ai-101-ts.switchToExpertMode', () => {
			import('./commands/switch-mode.js').then(module => module.switchToExpertModeCommand());
		}),
		vscode.commands.registerCommand('ai-101-ts.switchToTeamMode', () => {
			import('./commands/switch-mode.js').then(module => module.switchToTeamModeCommand());
		})
	);

	// Configuration commands
	context.subscriptions.push(
		vscode.commands.registerCommand('ai-101-ts.configureApiKeys', () => {
			import('./commands/configure-api-keys.js').then(module => module.configureApiKeysCommand(context));
		}),
		vscode.commands.registerCommand('ai-101-ts.resetConfig', () => {
			import('./commands/configure-api-keys.js').then(module => module.resetConfigCommand());
		})
	);

	// UI commands
	context.subscriptions.push(
		vscode.commands.registerCommand('ai-101-ts.toggleAgentVisibility', () => {
			import('./commands/toggle-agent-visibility.js').then(module => module.toggleAgentVisibilityCommand());
		}),
		vscode.commands.registerCommand('ai-101-ts.openDocumentation', () => {
			import('./commands/toggle-agent-visibility.js').then(module => module.openDocumentationCommand());
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {
	// End survey session (Story 8.4)
	if (surveyService) {
		surveyService.endSession().catch(error => {
			// Silently fail - don't block deactivation
			console.error('Failed to end survey session:', error);
		});
	}

	// Finalize metrics session
	try {
		MetricsService.getInstance().recordSessionEnd();
	} catch (error) {
		// Service might not have been initialized
	}
}

