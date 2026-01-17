import * as vscode from 'vscode';
import { ExtensionStateManager } from '../state/extension-state-manager.js';
import { DevelopmentPhase } from '../state/types.js';

/**
 * Service to automatically detect the current development phase (Prototype, Production, Debug).
 * Adapts system behavior based on the identified phase.
 */
export class PhaseDetector {
    private static instance: PhaseDetector;
    private stateManager: ExtensionStateManager;
    private manualOverride: DevelopmentPhase | null = null;

    private constructor() {
        this.stateManager = ExtensionStateManager.getInstance();
    }

    public static getInstance(): PhaseDetector {
        if (!PhaseDetector.instance) {
            PhaseDetector.instance = new PhaseDetector();
        }
        return PhaseDetector.instance;
    }

    /**
     * Initializes the detector and sets up listeners for environmental changes.
     */
    public initialize(context: vscode.ExtensionContext): void {
        // Initial detection
        this.detectPhase();

        // Listen for debug session changes - highest priority for real-time adaptation
        context.subscriptions.push(
            vscode.debug.onDidChangeActiveDebugSession(() => {
                this.detectPhase();
            })
        );

        // Listen for workspace file changes that might signal phase transitions
        const watcher = vscode.workspace.createFileSystemWatcher('**/{package.json,Dockerfile,.github/workflows/*.yml}');
        context.subscriptions.push(watcher);

        watcher.onDidChange(() => this.detectPhase());
        watcher.onDidCreate(() => this.detectPhase());
        watcher.onDidDelete(() => this.detectPhase());
    }

    /**
     * Performs phase detection logic based on environmental triggers or manual overrides.
     */
    public async detectPhase(): Promise<void> {
        // 0. Manual Override (via Command Palette)
        if (this.manualOverride) {
            this.stateManager.updatePhase(this.manualOverride);
            return;
        }

        // 1. Debug Phase (Highest priority environmental trigger)
        if (vscode.debug.activeDebugSession) {
            this.stateManager.updatePhase('debug');
            return;
        }

        // 2. Production Phase Heuristics
        const isProduction = await this.checkProductionHeuristics();
        if (isProduction) {
            this.stateManager.updatePhase('production');
            return;
        }

        // 3. Prototype Phase (Default state)
        this.stateManager.updatePhase('prototype');
    }

    /**
     * Manually sets the development phase, bypassing automatic detection.
     */
    public setManualOverride(phase: DevelopmentPhase | null): void {
        this.manualOverride = phase;
        this.detectPhase();
    }

    private async checkProductionHeuristics(): Promise<boolean> {
        try {
            // Check package.json version >= 1.0.0
            const packageJsonFiles = await vscode.workspace.findFiles('package.json', null, 1);
            if (packageJsonFiles.length > 0) {
                const content = await vscode.workspace.fs.readFile(packageJsonFiles[0]);
                const packageJson = JSON.parse(content.toString());
                const version = packageJson.version;
                if (version && this.isGreaterOrEqual(version, '1.0.0')) {
                    return true;
                }
            }

            // Check for production-related infrastructure
            const productionFiles = await vscode.workspace.findFiles('{Dockerfile,docker-compose.yml,.github/workflows/*.yml,k8s/**/*.yaml}', null, 1);
            if (productionFiles.length > 0) {
                return true;
            }
        } catch (error) {
            // Fail safe to prototype if detection errors occur
            console.error('AI-101 PhaseDetector: Error during production heuristic check', error);
        }

        return false;
    }

    /**
     * Simple semantic version comparison Helper.
     */
    private isGreaterOrEqual(v1: string, v2: string): boolean {
        // Remove prefixes like 'v' if present
        const cleanV1 = v1.replace(/^v/, '');
        const cleanV2 = v2.replace(/^v/, '');

        const parts1 = cleanV1.split('.').map(Number);
        const parts2 = cleanV2.split('.').map(Number);

        for (let i = 0; i < 3; i++) {
            const n1 = parts1[i] || 0;
            const n2 = parts2[i] || 0;
            if (n1 > n2) return true;
            if (n1 < n2) return false;
        }
        return true;
    }
}
