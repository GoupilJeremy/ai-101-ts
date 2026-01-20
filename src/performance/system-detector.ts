/**
 * System Detector
 * Detects system capabilities (RAM, etc.) for auto-activation of Performance Mode
 * Story 5.6: Implement Performance Mode for Low-End Machines
 */

import * as os from 'os';
import * as vscode from 'vscode';
import { ModeManager } from '../modes/mode-manager.js';
import { AgentMode } from '../modes/mode-types.js';

export interface ISystemCapabilities {
    totalMemoryGB: number;
    freeMemoryGB: number;
    cpuCount: number;
    isLowMemory: boolean;
}

/**
 * Detects system capabilities and auto-activates Performance Mode on low-end machines.
 */
export class SystemDetector {
    private static instance: SystemDetector;
    private static activated = false;

    private readonly LOW_MEMORY_THRESHOLD_GB = 4;

    private constructor() {}

    public static getInstance(): SystemDetector {
        if (!SystemDetector.instance) {
            SystemDetector.instance = new SystemDetector();
        }
        return SystemDetector.instance;
    }

    /**
     * Get system capabilities.
     */
    public getCapabilities(): ISystemCapabilities {
        const totalMemoryGB = os.totalmem() / (1024 ** 3);
        const freeMemoryGB = os.freemem() / (1024 ** 3);
        const cpuCount = os.cpus().length;

        return {
            totalMemoryGB,
            freeMemoryGB,
            cpuCount,
            isLowMemory: totalMemoryGB < this.LOW_MEMORY_THRESHOLD_GB
        };
    }

    /**
     * Check if system has low memory (<4GB RAM).
     */
    public isLowMemorySystem(): boolean {
        const capabilities = this.getCapabilities();
        return capabilities.isLowMemory;
    }

    /**
     * Check and auto-activate Performance Mode if system has low memory.
     * Shows notification to user with option to disable.
     */
    public async checkAndAutoActivate(): Promise<void> {
        // Don't activate twice in same session
        if (SystemDetector.activated) {
            return;
        }

        // Check if auto-activate is enabled in settings
        const config = vscode.workspace.getConfiguration('suika.performanceMode');
        const autoActivate = config.get<boolean>('autoActivate', true);

        if (!autoActivate) {
            console.log('Performance Mode auto-activation disabled by user setting');
            return;
        }

        // Check if already in Performance Mode
        const currentMode = ModeManager.getInstance().getCurrentMode();
        if (currentMode === AgentMode.Performance) {
            return;
        }

        // Check system memory
        const capabilities = this.getCapabilities();
        console.log(`System capabilities: ${capabilities.totalMemoryGB.toFixed(1)}GB RAM, ${capabilities.cpuCount} CPUs`);

        if (capabilities.isLowMemory) {
            SystemDetector.activated = true;

            // Show notification with option to disable
            const choice = await vscode.window.showInformationMessage(
                `Low system memory detected (${capabilities.totalMemoryGB.toFixed(1)}GB). Performance Mode activated for optimal experience.`,
                'Keep Enabled',
                'Disable',
                'Never Ask Again'
            );

            if (choice === 'Disable') {
                // User declined, restore to Learning mode
                await ModeManager.getInstance().setMode(AgentMode.Learning);
                console.log('Performance Mode disabled by user');
            } else if (choice === 'Never Ask Again') {
                // Disable auto-activation permanently
                await config.update('autoActivate', false, vscode.ConfigurationTarget.Global);
                await ModeManager.getInstance().setMode(AgentMode.Learning);
                console.log('Performance Mode auto-activation disabled permanently');
            } else {
                // Keep enabled (including if user dismisses notification)
                await ModeManager.getInstance().setMode(AgentMode.Performance);
                console.log('Performance Mode auto-activated due to low memory');
            }
        }
    }

    /**
     * Reset the activation flag (for testing purposes).
     */
    public reset(): void {
        SystemDetector.activated = false;
    }
}
