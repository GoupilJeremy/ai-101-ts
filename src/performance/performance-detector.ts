/**
 * Performance Detector
 * Monitors FPS and detects GPU/performance issues
 * Story 5.6: Implement Performance Mode for Low-End Machines
 */

import * as vscode from 'vscode';
import { ModeManager } from '../modes/mode-manager.js';
import { AgentMode } from '../modes/mode-types.js';

export interface IPerformanceMetrics {
    currentFps: number;
    averageFps: number;
    lowFpsCount: number;
    gpuIssuesDetected: boolean;
}

/**
 * Detects performance issues and suggests Performance Mode activation.
 * Monitors FPS from webview and triggers alerts when performance degrades.
 */
export class PerformanceDetector {
    private static instance: PerformanceDetector;

    private fpsHistory: number[] = [];
    private readonly FPS_HISTORY_SIZE = 30; // Keep last 30 FPS readings
    private readonly LOW_FPS_THRESHOLD = 30;
    private readonly CRITICAL_FPS_THRESHOLD = 20;
    private readonly LOW_FPS_COUNT_THRESHOLD = 5; // Trigger after 5 low FPS readings

    private lowFpsCount = 0;
    private suggestionShown = false;
    private gpuIssuesDetected = false;

    private constructor() {}

    public static getInstance(): PerformanceDetector {
        if (!PerformanceDetector.instance) {
            PerformanceDetector.instance = new PerformanceDetector();
        }
        return PerformanceDetector.instance;
    }

    /**
     * Record an FPS reading from the webview.
     * Called via postMessage from webview's FPS monitor.
     */
    public recordFps(fps: number): void {
        this.fpsHistory.push(fps);

        // Keep history limited
        if (this.fpsHistory.length > this.FPS_HISTORY_SIZE) {
            this.fpsHistory.shift();
        }

        // Check for low FPS
        if (fps < this.LOW_FPS_THRESHOLD) {
            this.lowFpsCount++;
            this.checkPerformanceIssues(fps);
        } else {
            // Reset counter if FPS recovers
            if (this.lowFpsCount > 0) {
                this.lowFpsCount = Math.max(0, this.lowFpsCount - 1);
            }
        }
    }

    /**
     * Check if performance issues warrant intervention.
     */
    private async checkPerformanceIssues(currentFps: number): Promise<void> {
        // Don't show suggestions if already in Performance Mode
        const currentMode = ModeManager.getInstance().getCurrentMode();
        if (currentMode === AgentMode.Performance) {
            return;
        }

        // Don't show suggestion twice in same session
        if (this.suggestionShown) {
            return;
        }

        // Critical FPS - immediate suggestion
        if (currentFps < this.CRITICAL_FPS_THRESHOLD) {
            this.gpuIssuesDetected = true;
            await this.showPerformanceSuggestion('critical');
            return;
        }

        // Sustained low FPS - suggest after threshold
        if (this.lowFpsCount >= this.LOW_FPS_COUNT_THRESHOLD) {
            this.gpuIssuesDetected = true;
            await this.showPerformanceSuggestion('sustained');
        }
    }

    /**
     * Show a notification suggesting Performance Mode activation.
     */
    private async showPerformanceSuggestion(reason: 'critical' | 'sustained'): Promise<void> {
        this.suggestionShown = true;

        const message = reason === 'critical'
            ? `Very low FPS detected (${this.getAverageFps().toFixed(0)} fps). Performance Mode can improve your experience.`
            : `Sustained low performance detected. Enable Performance Mode for better responsiveness?`;

        const choice = await vscode.window.showWarningMessage(
            message,
            'Enable Performance Mode',
            'Ignore',
            'Never Ask'
        );

        if (choice === 'Enable Performance Mode') {
            await ModeManager.getInstance().setMode(AgentMode.Performance);
            vscode.window.showInformationMessage('Performance Mode enabled. Animations reduced for better performance.');
        } else if (choice === 'Never Ask') {
            // Store preference to not ask again
            await vscode.workspace.getConfiguration('ai101.performanceMode')
                .update('autoSuggest', false, vscode.ConfigurationTarget.Global);
        }
    }

    /**
     * Get average FPS from history.
     */
    public getAverageFps(): number {
        if (this.fpsHistory.length === 0) {
            return 60;
        }
        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        return sum / this.fpsHistory.length;
    }

    /**
     * Get current performance metrics.
     */
    public getMetrics(): IPerformanceMetrics {
        return {
            currentFps: this.fpsHistory[this.fpsHistory.length - 1] || 60,
            averageFps: this.getAverageFps(),
            lowFpsCount: this.lowFpsCount,
            gpuIssuesDetected: this.gpuIssuesDetected
        };
    }

    /**
     * Check if GPU issues have been detected.
     */
    public hasGpuIssues(): boolean {
        return this.gpuIssuesDetected;
    }

    /**
     * Reset the detector state.
     */
    public reset(): void {
        this.fpsHistory = [];
        this.lowFpsCount = 0;
        this.suggestionShown = false;
        this.gpuIssuesDetected = false;
    }
}
