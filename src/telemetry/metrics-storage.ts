import * as vscode from 'vscode';
import { IUsageMetrics, DEFAULT_METRICS } from './metrics.interface';

/**
 * Handles persistent storage of usage metrics in the extension's global storage.
 */
export class MetricsStorage {
    private readonly METRICS_FILENAME = 'metrics.json';
    private storageUri: vscode.Uri;

    constructor(context: vscode.ExtensionContext) {
        this.storageUri = vscode.Uri.joinPath(context.globalStorageUri, this.METRICS_FILENAME);
    }

    /**
     * Loads metrics from storage. Returns default metrics if file doesn't exist.
     */
    public async loadMetrics(): Promise<IUsageMetrics> {
        try {
            const content = await vscode.workspace.fs.readFile(this.storageUri);
            const decoded = new TextDecoder().decode(content);
            return {
                ...DEFAULT_METRICS,
                ...JSON.parse(decoded)
            };
        } catch (error) {
            // If file doesn't exist, return default metrics
            if (error instanceof vscode.FileSystemError && error.code === 'FileNotFound') {
                return { ...DEFAULT_METRICS };
            }
            console.error('Failed to load metrics:', error);
            return { ...DEFAULT_METRICS };
        }
    }

    /**
     * Saves metrics to storage.
     */
    public async saveMetrics(metrics: IUsageMetrics): Promise<void> {
        try {
            const encoded = new TextEncoder().encode(JSON.stringify(metrics, null, 2));
            await vscode.workspace.fs.writeFile(this.storageUri, encoded);
        } catch (error) {
            console.error('Failed to save metrics:', error);
            throw error;
        }
    }

    /**
     * Exports metrics to a user-selected JSON file.
     */
    public async exportMetrics(): Promise<void> {
        const metrics = await this.loadMetrics();
        const saveUri = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file('suika-metrics.json'),
            filters: { 'JSON': ['json'] },
            title: 'Export Usage Metrics'
        });

        if (saveUri) {
            const encoded = new TextEncoder().encode(JSON.stringify(metrics, null, 2));
            await vscode.workspace.fs.writeFile(saveUri, encoded);
            vscode.window.showInformationMessage(`Metrics exported to ${saveUri.fsPath}`);
        }
    }
}
