import * as vscode from 'vscode';
import { IAI101API } from '../../src/api/index.js';

/**
 * Complete example of a VSCode extension integrating with Suika.
 * 
 * This demonstrates:
 * - Declaring Suika as a dependency
 * - Accessing the API safely
 * - Version compatibility checking
 * - Graceful degradation
 * - Full integration patterns
 */

export function activate(context: vscode.ExtensionContext) {
    console.log('Example extension activating...');

    // Step 1: Get the Suika extension
    const ai101Extension = vscode.extensions.getExtension('GoupilJeremy.suika');

    // Step 2: Handle Suika not installed
    if (!ai101Extension) {
        handleAI101NotInstalled();
        return; // Graceful degradation - extension continues without Suika
    }

    // Step 3: Get the API
    const api: IAI101API = ai101Extension.exports;

    // Step 4: Check version compatibility
    const requiredVersion = '^0.0.1'; // Require version 0.0.x
    if (!api.checkCompatibility(requiredVersion)) {
        handleIncompatibleVersion(api.apiVersion, requiredVersion);
        return;
    }

    console.log(`Suika API v${api.apiVersion} is compatible`);

    // Step 5: Use the API
    integrateWithAI101(api, context);

    vscode.window.showInformationMessage('Example extension activated with Suika integration!');
}

/**
 * Handle the case where Suika is not installed.
 */
function handleAI101NotInstalled(): void {
    const message = 'Suika extension is not installed. Some features will be unavailable.';

    vscode.window.showWarningMessage(
        message,
        'Install Suika',
        'Learn More',
        'Dismiss'
    ).then(selection => {
        if (selection === 'Install Suika') {
            vscode.commands.executeCommand(
                'workbench.extensions.installExtension',
                'GoupilJeremy.suika'
            );
        } else if (selection === 'Learn More') {
            vscode.env.openExternal(
                vscode.Uri.parse('https://github.com/GoupilJeremy/suika')
            );
        }
    });

    // Extension continues with reduced functionality
    console.log('Running in fallback mode without Suika');
}

/**
 * Handle incompatible Suika version.
 */
function handleIncompatibleVersion(currentVersion: string, requiredVersion: string): void {
    const message = `Suika version ${currentVersion} is incompatible. Required: ${requiredVersion}`;

    vscode.window.showErrorMessage(
        message,
        'Update Suika',
        'Dismiss'
    ).then(selection => {
        if (selection === 'Update Suika') {
            vscode.commands.executeCommand(
                'workbench.extensions.installExtension',
                'GoupilJeremy.suika'
            );
        }
    });

    console.error(message);
}

/**
 * Main integration logic with Suika.
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
            `Suika generated a suggestion from ${event.agent}`,
            'View'
        ).then(selection => {
            if (selection === 'View') {
                // Navigate to suggestion or show details
                console.log('User wants to view suggestion:', event.id);
            }
        });
    });

    // Example 3: Read Suika configuration
    const currentMode = api.getConfig('ui.mode');
    console.log(`Suika is in ${currentMode} mode`);

    // Example 4: Adjust your extension's behavior based on Suika settings
    if (currentMode === 'focus') {
        // Reduce notifications when user is in focus mode
        console.log('User is in focus mode - reducing interruptions');
    }

    // Example 5: Register commands that interact with Suika
    const toggleModeCommand = vscode.commands.registerCommand(
        'example.toggleAI101Mode',
        async () => {
            const currentMode = api.getConfig('ui.mode');
            const newMode = currentMode === 'expert' ? 'learning' : 'expert';

            await api.setConfig('ui.mode', newMode);
            vscode.window.showInformationMessage(`Suika mode: ${newMode}`);
        }
    );

    // Example 6: Create a status bar item
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    statusBarItem.text = '$(robot) Suika';
    statusBarItem.tooltip = 'Suika Integration Active';
    statusBarItem.command = 'example.showAI101Info';
    statusBarItem.show();

    const showInfoCommand = vscode.commands.registerCommand(
        'example.showAI101Info',
        () => {
            const mode = api.getConfig('ui.mode');
            const maxTokens = api.getConfig('performance.maxTokens');

            vscode.window.showInformationMessage(
                `Suika Info:\nMode: ${mode}\nMax Tokens: ${maxTokens}\nAPI Version: ${api.apiVersion}`
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
    statusBarItem.tooltip = `Suika ${agent} is ${status}`;
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
