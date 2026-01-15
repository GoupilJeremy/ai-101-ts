/**
 * High Contrast Manager
 * Coordinates High Contrast Mode for accessibility
 * Story 5.7: Implement High Contrast Mode for Accessibility
 */

import * as vscode from 'vscode';
import { ExtensionStateManager } from '../state/extension-state-manager.js';

/**
 * Configuration for High Contrast Mode
 */
export interface IHighContrastConfig {
    enabled: boolean;
    minOpacity: number;
    colorPalette: {
        ink: string;
        paper: string;
        accent: string;
    };
    fontSize: number;
    fontWeight: number;
    borderWidth: number;
}

/**
 * Default High Contrast configuration meeting WCAG AAA standards
 */
export const DEFAULT_HIGH_CONTRAST_CONFIG: IHighContrastConfig = {
    enabled: false,
    minOpacity: 0.6,    // NFR8 requirement
    colorPalette: {
        ink: '#000000',      // Pure black for maximum contrast
        paper: '#ffffff',    // Pure white
        accent: '#ff0000'    // High-contrast red (7:1+ ratio on white)
    },
    fontSize: 14,        // Larger base font for readability
    fontWeight: 600,     // Semi-bold
    borderWidth: 2       // Thicker borders for visibility
};

/**
 * Manages High Contrast Mode for accessibility.
 * - Integrates with VSCode High Contrast theme detection
 * - Allows manual toggle independent of VSCode theme
 * - Coordinates with existing mode system (Learning, Expert, Focus, Team, Performance)
 */
export class HighContrastManager {
    private static instance: HighContrastManager;

    private config: IHighContrastConfig = { ...DEFAULT_HIGH_CONTRAST_CONFIG };
    private manualOverride: boolean | undefined;
    private autoDetectionEnabled: boolean = true;
    private themeChangeDisposable: vscode.Disposable | undefined;

    private onHighContrastChangedEmitter = new vscode.EventEmitter<boolean>();
    public readonly onHighContrastChanged = this.onHighContrastChangedEmitter.event;

    private constructor() {
        this.loadSettings();
        this.setupThemeDetection();
        this.checkInitialTheme();
    }

    public static getInstance(): HighContrastManager {
        if (!HighContrastManager.instance) {
            HighContrastManager.instance = new HighContrastManager();
        }
        return HighContrastManager.instance;
    }

    /**
     * Load settings from VSCode configuration.
     */
    private loadSettings(): void {
        const config = vscode.workspace.getConfiguration('ai101.accessibility');

        // Check for manual override setting
        const manualSetting = config.get<boolean | null>('highContrast', null);
        if (manualSetting !== null) {
            this.manualOverride = manualSetting;
        }

        this.autoDetectionEnabled = config.get<boolean>('autoDetectHighContrast', true);
    }

    /**
     * Setup listener for VSCode theme changes.
     */
    private setupThemeDetection(): void {
        this.themeChangeDisposable = vscode.window.onDidChangeActiveColorTheme(
            this.handleThemeChange.bind(this)
        );
    }

    /**
     * Check initial VSCode theme on startup.
     */
    private checkInitialTheme(): void {
        // If user has manual override, use that
        if (this.manualOverride !== undefined) {
            this.setHighContrastMode(this.manualOverride);
            return;
        }

        // Otherwise, check VSCode theme
        if (this.autoDetectionEnabled) {
            const theme = vscode.window.activeColorTheme;
            const isHighContrast = this.isHighContrastTheme(theme);
            this.setHighContrastMode(isHighContrast);
        }
    }

    /**
     * Handle VSCode theme change event.
     */
    private handleThemeChange(theme: vscode.ColorTheme): void {
        // Don't auto-change if user has manual override
        if (this.manualOverride !== undefined) {
            return;
        }

        // Don't auto-change if auto-detection disabled
        if (!this.autoDetectionEnabled) {
            return;
        }

        const isHighContrast = this.isHighContrastTheme(theme);
        this.setHighContrastMode(isHighContrast);

        if (isHighContrast) {
            console.log('AI-101: High Contrast theme detected, enabling High Contrast Mode');
        }
    }

    /**
     * Check if a VSCode theme is a High Contrast theme.
     */
    private isHighContrastTheme(theme: vscode.ColorTheme): boolean {
        return theme.kind === vscode.ColorThemeKind.HighContrast ||
               theme.kind === vscode.ColorThemeKind.HighContrastLight;
    }

    /**
     * Set High Contrast Mode enabled/disabled.
     */
    public setHighContrastMode(enabled: boolean): void {
        if (this.config.enabled === enabled) {
            return;
        }

        this.config.enabled = enabled;

        // Notify webview of change
        this.notifyWebview();

        // Emit change event
        this.onHighContrastChangedEmitter.fire(enabled);

        console.log(`AI-101: High Contrast Mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Toggle High Contrast Mode manually.
     * This sets a manual override that takes precedence over auto-detection.
     */
    public async toggleManual(): Promise<void> {
        const newState = !this.config.enabled;
        this.manualOverride = newState;

        // Persist manual override to settings
        await vscode.workspace.getConfiguration('ai101.accessibility')
            .update('highContrast', newState, vscode.ConfigurationTarget.Workspace);

        this.setHighContrastMode(newState);

        vscode.window.showInformationMessage(
            `AI-101: High Contrast Mode ${newState ? 'enabled' : 'disabled'}`
        );
    }

    /**
     * Clear manual override and return to auto-detection.
     */
    public async clearManualOverride(): Promise<void> {
        this.manualOverride = undefined;

        // Clear setting
        await vscode.workspace.getConfiguration('ai101.accessibility')
            .update('highContrast', null, vscode.ConfigurationTarget.Workspace);

        // Re-check current theme
        this.checkInitialTheme();
    }

    /**
     * Notify webview of High Contrast state change.
     */
    private notifyWebview(): void {
        const stateManager = ExtensionStateManager.getInstance();
        // Use the webview postMessage mechanism
        // The webview will apply/remove the 'high-contrast-mode' class
        (stateManager as any).webview?.postMessage({
            type: 'toWebview:highContrastUpdate',
            enabled: this.config.enabled,
            config: this.config
        });
    }

    /**
     * Check if High Contrast Mode is currently enabled.
     */
    public isEnabled(): boolean {
        return this.config.enabled;
    }

    /**
     * Get the current High Contrast configuration.
     */
    public getConfig(): IHighContrastConfig {
        return { ...this.config };
    }

    /**
     * Check if manual override is active.
     */
    public hasManualOverride(): boolean {
        return this.manualOverride !== undefined;
    }

    /**
     * Dispose of event listeners.
     */
    public dispose(): void {
        this.themeChangeDisposable?.dispose();
        this.onHighContrastChangedEmitter.dispose();
    }
}
