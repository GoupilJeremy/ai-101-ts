/**
 * Colorblind Manager
 * Coordinates Colorblind Accessibility Mode
 * Story 5.8: Implement Colorblind Accessibility Alternatives
 */

import * as vscode from 'vscode';
import { ExtensionStateManager } from '../state/extension-state-manager.js';

/**
 * Supported colorblind types
 */
export type ColorblindType = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';

/**
 * Pattern mappings for alert severities
 */
export type AlertPattern = 'solid' | 'dashed' | 'dotted' | 'double';

/**
 * Shape mappings for agent states
 */
export type AgentShape = 'circle' | 'square' | 'triangle' | 'diamond';

/**
 * Configuration for Colorblind Mode
 */
export interface IColorblindConfig {
    enabled: boolean;
    type: ColorblindType;
    patterns: {
        alertInfo: AlertPattern;
        alertWarning: AlertPattern;
        alertCritical: AlertPattern;
        alertUrgent: AlertPattern;
    };
    shapes: {
        agentIdle: AgentShape;
        agentThinking: AgentShape;
        agentWorking: AgentShape;
        agentAlert: AgentShape;
    };
}

/**
 * Default Colorblind configuration
 */
export const DEFAULT_COLORBLIND_CONFIG: IColorblindConfig = {
    enabled: false,
    type: 'none',
    patterns: {
        alertInfo: 'solid',
        alertWarning: 'dashed',
        alertCritical: 'dotted',
        alertUrgent: 'double'
    },
    shapes: {
        agentIdle: 'circle',
        agentThinking: 'square',
        agentWorking: 'triangle',
        agentAlert: 'diamond'
    }
};

/**
 * Manages Colorblind Accessibility Mode.
 * - Provides alternative visual encodings using patterns and shapes
 * - Supports deuteranopia, protanopia, and tritanopia color blindness types
 * - Integrates with existing accessibility system
 */
export class ColorblindManager {
    private static instance: ColorblindManager;

    private config: IColorblindConfig = { ...DEFAULT_COLORBLIND_CONFIG };
    private onColorblindChangedEmitter = new vscode.EventEmitter<IColorblindConfig>();
    public readonly onColorblindChanged = this.onColorblindChangedEmitter.event;

    private constructor() {
        this.loadSettings();
    }

    public static getInstance(): ColorblindManager {
        if (!ColorblindManager.instance) {
            ColorblindManager.instance = new ColorblindManager();
        }
        return ColorblindManager.instance;
    }

    /**
     * Load settings from VSCode configuration.
     */
    private loadSettings(): void {
        const config = vscode.workspace.getConfiguration('suika.accessibility.colorblind');

        this.config.enabled = config.get<boolean>('enabled', false);
        this.config.type = config.get<ColorblindType>('type', 'none');
    }

    /**
     * Set Colorblind Mode enabled/disabled.
     */
    public async setEnabled(enabled: boolean): Promise<void> {
        if (this.config.enabled === enabled) {
            return;
        }

        this.config.enabled = enabled;

        // Persist to settings
        await vscode.workspace.getConfiguration('suika.accessibility.colorblind')
            .update('enabled', enabled, vscode.ConfigurationTarget.Workspace);

        // Notify webview and listeners
        this.notifyWebview();
        this.onColorblindChangedEmitter.fire(this.config);

        console.log(`Suika: Colorblind Mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Set the colorblind type.
     */
    public async setType(type: ColorblindType): Promise<void> {
        if (this.config.type === type) {
            return;
        }

        this.config.type = type;

        // Persist to settings
        await vscode.workspace.getConfiguration('suika.accessibility.colorblind')
            .update('type', type, vscode.ConfigurationTarget.Workspace);

        // Notify webview and listeners
        this.notifyWebview();
        this.onColorblindChangedEmitter.fire(this.config);

        console.log(`Suika: Colorblind type set to ${type}`);
    }

    /**
     * Toggle Colorblind Mode on/off.
     */
    public async toggle(): Promise<void> {
        const newState = !this.config.enabled;
        await this.setEnabled(newState);

        vscode.window.showInformationMessage(
            `Suika: Colorblind Mode ${newState ? 'enabled' : 'disabled'}`
        );
    }

    /**
     * Notify webview of Colorblind state change.
     */
    private notifyWebview(): void {
        const stateManager = ExtensionStateManager.getInstance();
        // Use the webview postMessage mechanism
        // The webview will apply/remove the 'colorblind-mode' class and update CSS variables
        (stateManager as any).webview?.postMessage({
            type: 'toWebview:colorblindUpdate',
            enabled: this.config.enabled,
            config: this.config
        });
    }

    /**
     * Check if Colorblind Mode is currently enabled.
     */
    public isEnabled(): boolean {
        return this.config.enabled;
    }

    /**
     * Get the current colorblind type.
     */
    public getType(): ColorblindType {
        return this.config.type;
    }

    /**
     * Get the current Colorblind configuration.
     */
    public getConfig(): IColorblindConfig {
        return { ...this.config };
    }

    /**
     * Get the pattern for a specific alert severity.
     */
    public getAlertPattern(severity: 'info' | 'warning' | 'critical' | 'urgent'): AlertPattern {
        switch (severity) {
            case 'info': return this.config.patterns.alertInfo;
            case 'warning': return this.config.patterns.alertWarning;
            case 'critical': return this.config.patterns.alertCritical;
            case 'urgent': return this.config.patterns.alertUrgent;
        }
    }

    /**
     * Get the shape for a specific agent state.
     */
    public getAgentShape(state: 'idle' | 'thinking' | 'working' | 'alert'): AgentShape {
        switch (state) {
            case 'idle': return this.config.shapes.agentIdle;
            case 'thinking': return this.config.shapes.agentThinking;
            case 'working': return this.config.shapes.agentWorking;
            case 'alert': return this.config.shapes.agentAlert;
        }
    }

    /**
     * Dispose of event listeners.
     */
    public dispose(): void {
        this.onColorblindChangedEmitter.dispose();
    }
}