import * as vscode from 'vscode';
import { IAI101API, AI101Events } from '../../src/api/index.js';

/**
 * Example demonstrating how to subscribe to AI-101 lifecycle events.
 * 
 * This shows all available event types and how to handle them.
 */
export class EventSubscriptionExample {
    private unsubscribeFunctions: Array<() => void> = [];

    constructor(private api: IAI101API) { }

    /**
     * Subscribe to all available events.
     */
    subscribeToAllEvents(): void {
        // 1. Agent Activation Events
        const unsubActivated = this.api.on('agentActivated', (event) => {
            console.log(`[AI-101] Agent activated: ${event.agent}`);
            console.log(`  Timestamp: ${new Date(event.timestamp).toISOString()}`);
            if (event.data) {
                console.log(`  Data:`, event.data);
            }

            // Example: Show notification when architect agent activates
            if (event.agent === 'architect') {
                vscode.window.showInformationMessage('Architect agent is analyzing your code...');
            }
        });
        this.unsubscribeFunctions.push(unsubActivated);

        // 2. Agent State Change Events
        const unsubStateChanged = this.api.on('agentStateChanged', (event) => {
            console.log(`[AI-101] Agent state changed: ${event.agent}`);
            console.log(`  New state:`, event.state);
            console.log(`  Status: ${event.state.status}`);

            // Example: Track agent activity
            if (event.state.status === 'working') {
                console.log(`${event.agent} is now working on: ${event.state.currentTask || 'unknown task'}`);
            }
        });
        this.unsubscribeFunctions.push(unsubStateChanged);

        // 3. Suggestion Generated Events
        const unsubSuggestionGenerated = this.api.on('suggestionGenerated', (event) => {
            console.log(`[AI-101] New suggestion from ${event.agent}`);
            console.log(`  Suggestion ID: ${event.id}`);
            if (event.code) {
                console.log(`  Code preview: ${event.code.substring(0, 100)}...`);
            }

            // Example: Log all suggestions for analytics
            this.logSuggestion(event.id, event.agent, 'generated');
        });
        this.unsubscribeFunctions.push(unsubSuggestionGenerated);

        // 4. Suggestion Accepted Events
        const unsubSuggestionAccepted = this.api.on('suggestionAccepted', (event) => {
            console.log(`[AI-101] User accepted suggestion ${event.id} from ${event.agent}`);

            // Example: Track acceptance rate
            this.logSuggestion(event.id, event.agent, 'accepted');
            this.updateAcceptanceRate(event.agent);
        });
        this.unsubscribeFunctions.push(unsubSuggestionAccepted);

        // 5. Suggestion Rejected Events
        const unsubSuggestionRejected = this.api.on('suggestionRejected', (event) => {
            console.log(`[AI-101] User rejected suggestion ${event.id} from ${event.agent}`);

            // Example: Track rejection reasons
            this.logSuggestion(event.id, event.agent, 'rejected');
        });
        this.unsubscribeFunctions.push(unsubSuggestionRejected);

        console.log('[AI-101] Subscribed to all events');
    }

    /**
     * Subscribe to specific events only.
     */
    subscribeToSuggestionEvents(): void {
        // Only track suggestion lifecycle
        const unsubGenerated = this.api.on('suggestionGenerated', (event) => {
            console.log(`New suggestion: ${event.id}`);
        });

        const unsubAccepted = this.api.on('suggestionAccepted', (event) => {
            console.log(`Accepted: ${event.id}`);
        });

        const unsubRejected = this.api.on('suggestionRejected', (event) => {
            console.log(`Rejected: ${event.id}`);
        });

        this.unsubscribeFunctions.push(unsubGenerated, unsubAccepted, unsubRejected);
    }

    /**
     * Example: Build a suggestion analytics tracker.
     */
    private suggestionStats = {
        generated: 0,
        accepted: 0,
        rejected: 0,
        byAgent: new Map<string, { generated: number; accepted: number; rejected: number }>()
    };

    private logSuggestion(id: string, agent: string, action: 'generated' | 'accepted' | 'rejected'): void {
        // Update overall stats
        this.suggestionStats[action]++;

        // Update per-agent stats
        if (!this.suggestionStats.byAgent.has(agent)) {
            this.suggestionStats.byAgent.set(agent, { generated: 0, accepted: 0, rejected: 0 });
        }
        const agentStats = this.suggestionStats.byAgent.get(agent)!;
        agentStats[action]++;

        // Log to file or analytics service
        console.log(`[Analytics] ${action} suggestion ${id} from ${agent}`);
    }

    private updateAcceptanceRate(agent: string): void {
        const stats = this.suggestionStats.byAgent.get(agent);
        if (stats && stats.generated > 0) {
            const rate = (stats.accepted / stats.generated) * 100;
            console.log(`[Analytics] ${agent} acceptance rate: ${rate.toFixed(1)}%`);
        }
    }

    /**
     * Get current statistics.
     */
    getStats() {
        return {
            ...this.suggestionStats,
            acceptanceRate: this.suggestionStats.generated > 0
                ? (this.suggestionStats.accepted / this.suggestionStats.generated) * 100
                : 0
        };
    }

    /**
     * Clean up all subscriptions.
     * IMPORTANT: Always call this when deactivating your extension!
     */
    dispose(): void {
        this.unsubscribeFunctions.forEach(unsub => unsub());
        this.unsubscribeFunctions = [];
        console.log('[AI-101] Unsubscribed from all events');
    }
}

/**
 * Example usage in extension activation:
 */
export function activate(context: vscode.ExtensionContext) {
    // Get AI-101 API
    const ai101Extension = vscode.extensions.getExtension('GoupilJeremy.ai-101-ts');
    if (!ai101Extension) {
        console.log('AI-101 extension not found');
        return;
    }

    const api: IAI101API = ai101Extension.exports;

    // Create event subscriber
    const eventSubscriber = new EventSubscriptionExample(api);
    eventSubscriber.subscribeToAllEvents();

    // Register command to show stats
    const showStatsCommand = vscode.commands.registerCommand('example.showAI101Stats', () => {
        const stats = eventSubscriber.getStats();
        vscode.window.showInformationMessage(
            `AI-101 Stats: ${stats.accepted}/${stats.generated} accepted (${stats.acceptanceRate.toFixed(1)}%)`
        );
    });

    // Clean up on deactivation
    context.subscriptions.push(
        showStatsCommand,
        { dispose: () => eventSubscriber.dispose() }
    );
}
