import * as vscode from 'vscode';
import { AgentMode, ModeConfigs, IModeConfig } from './mode-types.js';
import { ExtensionStateManager } from '../state/extension-state-manager.js';

/**
 * Manages the current active mode of the extension and coordinates
 * mode-specific settings across backend and frontend.
 */
export class ModeManager {
    private static instance: ModeManager;
    private currentMode: AgentMode = AgentMode.Learning;
    private onModeChangedEmitter = new vscode.EventEmitter<{ previous: AgentMode, next: AgentMode }>();
    public readonly onModeChanged = this.onModeChangedEmitter.event;

    private constructor() {
        this.loadPersistedMode();
    }

    public static getInstance(): ModeManager {
        if (!ModeManager.instance) {
            ModeManager.instance = new ModeManager();
        }
        return ModeManager.instance;
    }

    /**
     * Set the active mode and persist it.
     */
    public async setMode(mode: AgentMode): Promise<void> {
        if (this.currentMode === mode) return;

        const previousMode = this.currentMode;
        this.currentMode = mode;

        // Persist to configuration
        await vscode.workspace.getConfiguration('ai101').update('activeMode', mode, vscode.ConfigurationTarget.Workspace);

        // Sync with State Manager (and thus Webview)
        ExtensionStateManager.getInstance().updateMode(mode, ModeConfigs[mode]);

        // Notify listeners
        this.onModeChangedEmitter.fire({ previous: previousMode, next: mode });

        console.log(`AI-101: Mode switched from ${previousMode} to ${mode}`);
    }

    public getCurrentMode(): AgentMode {
        return this.currentMode;
    }

    public getConfig(): IModeConfig {
        return ModeConfigs[this.currentMode];
    }

    private loadPersistedMode(): void {
        const config = vscode.workspace.getConfiguration('ai101');
        const persistedMode = config.get<AgentMode>('activeMode', AgentMode.Learning);
        this.currentMode = persistedMode;

        // Initial sync to state manager will happen once webview is ready or on first update
    }
}
