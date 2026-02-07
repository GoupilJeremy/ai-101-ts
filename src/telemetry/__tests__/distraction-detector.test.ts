import { describe, it, expect, beforeEach, vi } from 'vitest';
import type * as vscode from 'vscode';
import { EventEmitter } from 'events';

// Mock variables starting with 'mock' are accessible in vi.mock
const mockStateManagerInstance = new EventEmitter() as any;
mockStateManagerInstance.isHUDVisible = vi.fn(() => true);
mockStateManagerInstance.getInstance = vi.fn(() => mockStateManagerInstance);

vi.mock('../../state/extension-state-manager.js', () => ({
    ExtensionStateManager: {
        getInstance: vi.fn(() => mockStateManagerInstance),
    }
}));

// Mock TelemetryService
vi.mock('../telemetry-service.js', () => ({
    TelemetryService: {
        getInstance: vi.fn(() => ({
            isEnabled: vi.fn(() => true),
            trackEvent: vi.fn(),
        })),
    },
}));

// Mock vscode
vi.mock('vscode', () => ({
    window: {
        showInformationMessage: vi.fn(),
        showQuickPick: vi.fn(),
    },
    workspace: {
        onDidChangeConfiguration: vi.fn(() => ({ dispose: vi.fn() })),
    },
    commands: {
        executeCommand: vi.fn(),
    },
}));

import { DistractionDetectorService } from '../distraction-detector.js';

const mockContext = {
    globalState: {
        get: vi.fn(),
        update: vi.fn(),
    },
    subscriptions: [],
} as unknown as vscode.ExtensionContext;

describe('DistractionDetectorService', () => {
    let detector: DistractionDetectorService;

    beforeEach(() => {
        vi.clearAllMocks();
        detector = (DistractionDetectorService as any).instance = new (DistractionDetectorService as any)(mockContext, mockStateManagerInstance);
    });

    describe('Quick Close Detection', () => {
        it('should increment quick close count if HUD closed within 5 seconds', async () => {
            (mockContext.globalState.get as any).mockReturnValue(0);

            // Simulate HUD open
            mockStateManagerInstance.emit('hudVisibilityUpdate', true);

            // Wait 1 second
            vi.useFakeTimers();
            vi.advanceTimersByTime(1000);

            // Simulate HUD close
            await detector['handleHUDClose']();

            expect(mockContext.globalState.update).toHaveBeenCalledWith('distraction.quickCloseCount', 1);
            vi.useRealTimers();
        });

        it('should trigger distraction help after 3 quick closes', async () => {
            (mockContext.globalState.get as any).mockImplementation((key: string) => {
                if (key === 'distraction.quickCloseCount') {return 2;}
                if (key === 'distraction.suppressHelp') {return false;}
                return undefined;
            });

            const promptSpy = vi.spyOn(detector as any, 'promptDistractionHelp').mockResolvedValue(undefined);

            // Simulate HUD open then close quickly
            detector['hudOpenTime'] = Date.now() - 1000;
            await detector['handleHUDClose']();

            expect(mockContext.globalState.update).toHaveBeenCalledWith('distraction.quickCloseCount', 3);
            expect(promptSpy).toHaveBeenCalled();
        });

        it('should reset quick close count if HUD stays open for > 1 minute', async () => {
            (mockContext.globalState.get as any).mockReturnValue(2);

            // Simulate HUD open then close after 2 minutes
            detector['hudOpenTime'] = Date.now() - 120000;
            await detector['handleHUDClose']();

            expect(mockContext.globalState.update).toHaveBeenCalledWith('distraction.quickCloseCount', 0);
        });
    });

    describe('Focus Mode Usage Detection', () => {
        it('should track focus mode activation and check thresholds', async () => {
            (mockContext.globalState.get as any).mockImplementation((key: string) => {
                if (key === 'distraction.focusSessions') {return 2;}
                if (key === 'distraction.totalSessions') {return 4;}
                if (key === 'distraction.suppressHelp') {return false;}
                return undefined;
            });

            const promptSpy = vi.spyOn(detector as any, 'promptDistractionHelp').mockResolvedValue(undefined);

            await detector['recordFocusModeUsage']();

            expect(mockContext.globalState.update).toHaveBeenCalledWith('distraction.focusSessions', 3);
            // Ratio is 3/4 = 0.75 > 0.5 threshold
            expect(promptSpy).toHaveBeenCalled();
        });
    });

    describe('Privacy and Suppression', () => {
        it('should not prompt if suppressHelp is true', async () => {
            (mockContext.globalState.get as any).mockReturnValue(true); // suppressed

            const promptSpy = vi.spyOn(detector as any, 'promptDistractionHelp');

            await detector['checkForDistraction']('quick_close', 3);

            expect(promptSpy).not.toHaveBeenCalled();
        });
    });
});
