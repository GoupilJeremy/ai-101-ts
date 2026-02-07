import * as vscode from 'vscode';
import { ExtensionStateManager } from '../state/extension-state-manager.js';
import { TelemetryService } from './telemetry-service.js';
import { AgentMode } from '../modes/mode-types.js';

/**
 * Service for detecting when the HUD might be distracting to the user.
 * Tracks usage patterns and offers mitigation tips.
 */
export class DistractionDetectorService implements vscode.Disposable {
    private static instance: DistractionDetectorService;
    private subscriptions: vscode.Disposable[] = [];
    private hudOpenTime: number | undefined;

    // Thresholds
    private static readonly QUICK_CLOSE_THRESHOLD_MS = 5000; // 5 seconds
    private static readonly QUICK_CLOSE_COUNT_TRIGGER = 3;
    private static readonly FOCUS_MODE_RATIO_TRIGGER = 0.5;

    private constructor(
        private context: vscode.ExtensionContext,
        private stateManager: ExtensionStateManager = ExtensionStateManager.getInstance(),
        private telemetryService: TelemetryService = TelemetryService.getInstance(context)
    ) {
        this.registerEventListeners();
        this.initializeSessionTracking();
    }

    public static getInstance(context: vscode.ExtensionContext): DistractionDetectorService {
        if (!DistractionDetectorService.instance) {
            DistractionDetectorService.instance = new DistractionDetectorService(context);
        }
        return DistractionDetectorService.instance;
    }

    private registerEventListeners(): void {
        // Listen to HUD visibility changes
        this.stateManager.on('hudVisibilityUpdate', (visible: boolean) => {
            if (visible) {
                this.hudOpenTime = Date.now();
            } else {
                this.handleHUDClose();
            }
        });

        // Listen to Mode changes
        this.stateManager.on('modeUpdate', (mode: AgentMode) => {
            if (mode === AgentMode.Focus) {
                this.recordFocusModeUsage();
            }
        });

        // Listen to Config changes
        this.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('ai101.ui.transparency') ||
                    e.affectsConfiguration('ai101.ui.mode')) {
                    this.recordSettingsChange();
                }
            })
        );
    }

    private async initializeSessionTracking(): Promise<void> {
        const totalSessions = await this.context.globalState.get<number>('distraction.totalSessions', 0);
        await this.context.globalState.update('distraction.totalSessions', totalSessions + 1);

        // If HUD is currently visible, start timer
        if (this.stateManager.isHUDVisible()) {
            this.hudOpenTime = Date.now();
        }
    }

    private async handleHUDClose(): Promise<void> {
        if (!this.hudOpenTime) {
            return;
        }

        const duration = Date.now() - this.hudOpenTime;
        this.hudOpenTime = undefined;

        if (duration < DistractionDetectorService.QUICK_CLOSE_THRESHOLD_MS) {
            const count = await this.context.globalState.get<number>('distraction.quickCloseCount', 0);
            const newCount = count + 1;
            await this.context.globalState.update('distraction.quickCloseCount', newCount);

            if (newCount >= DistractionDetectorService.QUICK_CLOSE_COUNT_TRIGGER) {
                await this.checkForDistraction('quick_close', newCount);
            }
        } else if (duration > 60000) {
            // Reset quick close counter if user kept it open for > 1 minute (success signal)
            await this.context.globalState.update('distraction.quickCloseCount', 0);
        }
    }

    private async recordFocusModeUsage(): Promise<void> {
        const focusSessions = await this.context.globalState.get<number>('distraction.focusSessions', 0);
        await this.context.globalState.update('distraction.focusSessions', focusSessions + 1);

        await this.checkForDistraction('focus_usage', focusSessions + 1);
    }

    private recordSettingsChange(): void {
        // Just track it happened
        this.telemetryService.trackEvent('distraction.settings_change', {
            signal_type: 'settings_change'
        });
    }

    private async checkForDistraction(signalType: string, triggerValue: number): Promise<void> {
        // Check if user previously opted out
        const silent = await this.context.globalState.get<boolean>('distraction.suppressHelp', false);
        if (silent) {
            return;
        }

        let shouldTrigger = false;

        if (signalType === 'quick_close') {
            shouldTrigger = true; // Already reached threshold in handleHUDClose
        } else if (signalType === 'focus_usage') {
            const totalSessions = await this.context.globalState.get<number>('distraction.totalSessions', 1);
            const ratio = triggerValue / totalSessions;
            if (ratio > DistractionDetectorService.FOCUS_MODE_RATIO_TRIGGER && totalSessions >= 4) {
                shouldTrigger = true;
            }
        }

        if (shouldTrigger) {
            this.promptDistractionHelp(signalType, triggerValue);
        }
    }

    private async promptDistractionHelp(signalType: string, triggerValue: number): Promise<void> {
        const message = "Seems like the HUD might be distracting. Would you like some tips to customize your experience?";
        const options = ["See Tips", "No, thanks", "Don't ask again"];

        const selection = await vscode.window.showInformationMessage(message, ...options);

        if (selection === "See Tips") {
            this.showMitigationTips();
            this.trackDistractionDetected(signalType, triggerValue, "see_tips");
        } else if (selection === "Don't ask again") {
            await this.context.globalState.update('distraction.suppressHelp', true);
            this.trackDistractionDetected(signalType, triggerValue, "dont_ask_again");
        } else if (selection === "No, thanks") {
            this.trackDistractionDetected(signalType, triggerValue, "no_thanks");
        }
    }

    private async showMitigationTips(): Promise<void> {
        const items = [
            { label: "Turn on Focus Mode", description: "Hide agents but keep vital signs", action: "toggleFocusMode" },
            { label: "Adjust Transparency", description: "Make the HUD more subtle", action: "adjustTransparency" },
            { label: "Disable Animations", description: "Reduce visual movement", action: "toggleAnimations" },
            { label: "Configure Hotkeys", description: "Toggle HUD quickly with keyboard", action: "configureHotkeys" }
        ];

        const selection = await vscode.window.showQuickPick(items, {
            placeHolder: "How can we make AI-101 less distracting?"
        });

        if (selection) {
            switch (selection.action) {
                case "toggleFocusMode":
                    vscode.commands.executeCommand('ai-101-ts.toggleFocusMode');
                    break;
                case "adjustTransparency":
                    vscode.commands.executeCommand('workbench.action.openSettings', 'ai101.ui.transparency');
                    break;
                case "toggleAnimations":
                    vscode.commands.executeCommand('ai-101-ts.togglePerformanceMode');
                    break;
                case "configureHotkeys":
                    vscode.commands.executeCommand('workbench.action.openGlobalKeybindings', 'ai-101-ts');
                    break;
            }
        }
    }

    private trackDistractionDetected(signalType: string, triggerValue: number, actionTaken: string): void {
        this.telemetryService.trackEvent('distraction.detected', {
            signal_type: signalType,
            trigger_value: triggerValue.toString(),
            action_taken: actionTaken
        });
    }

    public dispose(): void {
        this.subscriptions.forEach(s => s.dispose());
        this.subscriptions = [];
    }
}
