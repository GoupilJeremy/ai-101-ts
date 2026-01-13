import { CostTracker } from '../llm/cost-tracker.js';
import { ExtensionStateManager } from '../state/extension-state-manager.js';

/**
 * Gathers and synchronizes real-time metrics (tokens, files, cost) 
 * from various extension components to the State Manager.
 */
export class MetricsProvider {
    private static instance: MetricsProvider;
    private currentTokens: number = 0;
    private currentFiles: number = 0;

    private constructor() { }

    public static getInstance(): MetricsProvider {
        if (!MetricsProvider.instance) {
            MetricsProvider.instance = new MetricsProvider();
        }
        return MetricsProvider.instance;
    }

    /**
     * Updates the token count metric.
     */
    public updateTokens(count: number): void {
        this.currentTokens = count;
        this.sync();
    }

    /**
     * Updates the loaded files count metric.
     */
    public updateFiles(count: number): void {
        this.currentFiles = count;
        this.sync();
    }

    /**
     * Synchronizes current metrics with the ExtensionStateManager.
     */
    public sync(): void {
        const cost = CostTracker.getInstance().getCurrentSessionCost();

        // We'll update ExtensionStateManager with a special 'toWebview:metricsUpdate' message
        // For now, let's assume ExtensionStateManager has a way to handle this.
        ExtensionStateManager.getInstance().updateMetrics({
            tokens: this.currentTokens,
            files: this.currentFiles,
            cost: cost
        });
    }
}
