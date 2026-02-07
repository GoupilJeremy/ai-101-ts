import * as vscode from 'vscode';
import { IAI101API } from '../../src/api/index.js';

/**
 * Complete example of a VSCode extension integrating with AI-101.
 * 
 * This demonstrates:
 * - Declaring AI-101 as a dependency
 * - Accessing the API safely
 * - Version compatibility checking
 * - Graceful degradation
 * - Full integration patterns
 */

export function activate(context: vscode.ExtensionContext) {
    console.log('Example extension activating...');

    // Step 1: Get the AI-101 extension
    const ai101Extension = vscode.extensions.getExtension('GoupilJeremy.ai-101-ts');

    // Step 2: Handle AI-101 not installed
    if (!ai101Extension) {
        handleAI101NotInstalled();
        return; // Graceful degradation - extension continues without AI-101
    }

    // Step 3: Get the API
    const api: IAI101API = ai101Extension.exports;

    // Step 4: Check version compatibility
    const requiredVersion = '^0.0.1'; // Require version 0.0.x
    if (!api.checkCompatibility(requiredVersion)) {
        handleIncompatibleVersion(api.apiVersion, requiredVersion);
        return;
    }

    console.log(`AI-101 API v${api.apiVersion} is compatible`);

    // Step 5: Use the API
    integrateWithAI101(api, context);

    vscode.window.showInformationMessage('Example extension activated with AI-101 integration!');
}

/**
 * Handle the case where AI-101 is not installed.
 */
function handleAI101NotInstalled(): void {
    const message = 'AI-101 extension is not installed. Some features will be unavailable.';

    vscode.window.showWarningMessage(
        message,
        'Install AI-101',
        'Learn More',
        'Dismiss'
    ).then(selection => {
        if (selection === 'Install AI-101') {
            vscode.commands.executeCommand(
                'workbench.extensions.installExtension',
                'GoupilJeremy.ai-101-ts'
            );
        } else if (selection === 'Learn More') {
            vscode.env.openExternal(
                vscode.Uri.parse('https://github.com/GoupilJeremy/ai-101-ts')
            );
        }
    });

    // Extension continues with reduced functionality
    console.log('Running in fallback mode without AI-101');
}

/**
 * Handle incompatible AI-101 version.
 */
function handleIncompatibleVersion(currentVersion: string, requiredVersion: string): void {
    const message = `AI-101 version ${currentVersion} is incompatible. Required: ${requiredVersion}`;

    vscode.window.showErrorMessage(
        message,
        'Update AI-101',
        'Dismiss'
    ).then(selection => {
        if (selection === 'Update AI-101') {
            vscode.commands.executeCommand(
                'workbench.extensions.installExtension',
                'GoupilJeremy.ai-101-ts'
            );
        }
    });

    console.error(message);
}

/**
 * Main integration logic with AI-101.
 */
function integrateWithAI101(api: IAI101API, context: vscode.ExtensionContext): void {
    // Example 1: Register a custom LLM provider
    // (Uncomment if you have a custom provider)
    /*
    import { MyCustomProvider } from './my-provider';
    const provider = new MyCustomProvider();
    api.registerLLMProvider('my-provider', provider);
    console.log('Custom LLM provider registered');
    */

    // Example 2: Subscribe to events
    const unsubscribeActivated = api.on('agentActivated', (event) => {
        console.log(`Agent ${event.agent} activated`);

        // Show status bar item when agents are working
        updateStatusBar(event.agent, 'activated');
    });

    const unsubscribeSuggestion = api.on('suggestionGenerated', (event) => {
        console.log(`New suggestion from ${event.agent}: ${event.id}`);

        // Could show a notification or update UI
        vscode.window.showInformationMessage(
            `AI-101 generated a suggestion from ${event.agent}`,
            'View'
        ).then(selection => {
            if (selection === 'View') {
                // Navigate to suggestion or show details
                console.log('User wants to view suggestion:', event.id);
            }
        });
    });

    // Example 3: Read AI-101 configuration
    const currentMode = api.getConfig('ui.mode');
    console.log(`AI-101 is in ${currentMode} mode`);

    // Example 4: Adjust your extension's behavior based on AI-101 settings
    if (currentMode === 'focus') {
        // Reduce notifications when user is in focus mode
        console.log('User is in focus mode - reducing interruptions');
    }

    // Example 5: Register commands that interact with AI-101
    const toggleModeCommand = vscode.commands.registerCommand(
        'example.toggleAI101Mode',
        async () => {
            const currentMode = api.getConfig('ui.mode');
            const newMode = currentMode === 'expert' ? 'learning' : 'expert';

            await api.setConfig('ui.mode', newMode);
            vscode.window.showInformationMessage(`AI-101 mode: ${newMode}`);
        }
    );

    // Example 6: Create a status bar item
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    statusBarItem.text = '$(robot) AI-101';
    statusBarItem.tooltip = 'AI-101 Integration Active';
    statusBarItem.command = 'example.showAI101Info';
    statusBarItem.show();

    const showInfoCommand = vscode.commands.registerCommand(
        'example.showAI101Info',
        () => {
            const mode = api.getConfig('ui.mode');
            const maxTokens = api.getConfig('performance.maxTokens');

            vscode.window.showInformationMessage(
                `AI-101 Info:\nMode: ${mode}\nMax Tokens: ${maxTokens}\nAPI Version: ${api.apiVersion}`
            );
        }
    );

    // Register all disposables for cleanup
    context.subscriptions.push(
        { dispose: unsubscribeActivated },
        { dispose: unsubscribeSuggestion },
        toggleModeCommand,
        showInfoCommand,
        statusBarItem
    );
}

/**
 * Update status bar based on agent activity.
 */
let statusBarItem: vscode.StatusBarItem | undefined;

function updateStatusBar(agent: string, status: string): void {
    if (!statusBarItem) {
        statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
    }

    statusBarItem.text = `$(sync~spin) ${agent}`;
    statusBarItem.tooltip = `AI-101 ${agent} is ${status}`;
    statusBarItem.show();

    // Hide after 3 seconds
    setTimeout(() => {
        if (statusBarItem) {
            statusBarItem.hide();
        }
    }, 3000);
}

export function deactivate() {
    console.log('Example extension deactivating...');
    // Cleanup is handled automatically by context.subscriptions
}
