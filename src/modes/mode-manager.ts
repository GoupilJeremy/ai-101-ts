import * as vscode from 'vscode';
import { AgentMode, ModeConfigs, IModeConfig } from './mode-types.js';
import { ExtensionStateManager } from '../state/extension-state-manager.js';
import { SurveyManager } from '../team/survey-manager.js';

/**
 * Manages the current active mode of the extension and coordinates
 * mode-specific settings across backend and frontend.
 */
export class ModeManager {
    private static instance: ModeManager;
    private currentMode: AgentMode = AgentMode.Learning;
    private previousMode: AgentMode | undefined; // Store mode to restore when exiting Focus
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
        if (this.currentMode === mode) {return;}

        const previousMode = this.currentMode;

        // Store previous mode for Focus Mode restoration (only when entering Focus)
        if (mode === AgentMode.Focus && this.currentMode !== AgentMode.Focus) {
            this.previousMode = this.currentMode;
        }

        this.currentMode = mode;

        // Persist to configuration
        await vscode.workspace.getConfiguration('ai101').update('activeMode', mode, vscode.ConfigurationTarget.Workspace);

        // Sync with State Manager (and thus Webview)
        ExtensionStateManager.getInstance().updateMode(mode, ModeConfigs[mode]);

        // Notify SurveyManager about mode changes for session tracking
        SurveyManager.getInstance().updateMode(mode);

        // Notify listeners
        this.onModeChangedEmitter.fire({ previous: previousMode, next: mode });

        console.log(`AI-101: Mode switched from ${previousMode} to ${mode}`);
    }

    /**
     * Restore the previous mode before entering Focus Mode.
     * If no previous mode is stored, defaults to Learning mode.
     */
    public async restorePreviousMode(): Promise<void> {
        const modeToRestore = this.previousMode || AgentMode.Learning;
        this.previousMode = undefined; // Clear stored mode after restoration
        await this.setMode(modeToRestore);
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
