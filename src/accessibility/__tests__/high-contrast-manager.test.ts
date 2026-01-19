/**
 * High Contrast Manager Unit Tests
 * Story 5.7: Implement High Contrast Mode for Accessibility
 */

import * as vscode from 'vscode';
import { HighContrastManager, IHighContrastConfig, DEFAULT_HIGH_CONTRAST_CONFIG } from '../high-contrast-manager.js';
import { ExtensionStateManager } from '../../state/extension-state-manager.js';

describe('HighContrastManager', () => {

    let manager: HighContrastManager;
    let mockConfig: any;
    let mockWindow: any;

    beforeEach(() => {
        // Mock VSCode API
        mockConfig = {
            get: jest.fn(),
            update: jest.fn()
        };

        mockWindow = {
            activeColorTheme: {
                kind: vscode.ColorThemeKind.Light
            },
            onDidChangeActiveColorTheme: jest.fn(),
            showInformationMessage: jest.fn()
        };

        // Mock VSCode module
        jest.mock('vscode', () => ({
            workspace: {
                getConfiguration: jest.fn().mockReturnValue(mockConfig)
            },
            window: mockWindow,
            ColorThemeKind: vscode.ColorThemeKind,
            EventEmitter: jest.requireActual('events').EventEmitter
        }));

        // Reset instance for testing
        (HighContrastManager as any).instance = undefined;
        manager = HighContrastManager.getInstance();
    });

    afterEach(() => {
        jest.clearAllMocks();
        manager.dispose();
    });

    describe('Initialization', () => {
        it('should initialize with default config', () => {
            expect(manager.isEnabled()).toBe(false);
            expect(manager.getConfig()).toEqual(DEFAULT_HIGH_CONTRAST_CONFIG);
        });

        it('should load settings from VSCode configuration', () => {
            mockConfig.get.mockImplementation((key: string) => {
                if (key === 'highContrast') {return null;}
                if (key === 'autoDetectHighContrast') {return true;}
                return undefined;
            });

            const newManager = HighContrastManager.getInstance();
            expect(mockConfig.get).toHaveBeenCalledWith('highContrast', null);
            expect(mockConfig.get).toHaveBeenCalledWith('autoDetectHighContrast', true);
        });
    });

    describe('Manual Toggle', () => {
        it('should toggle High Contrast Mode manually', async () => {
            mockConfig.update.mockResolvedValue(undefined);

            await manager.toggleManual();
            expect(manager.isEnabled()).toBe(true);
            expect(manager.hasManualOverride()).toBe(true);
            expect(mockConfig.update).toHaveBeenCalledWith('highContrast', true, vscode.ConfigurationTarget.Workspace);

            await manager.toggleManual();
            expect(manager.isEnabled()).toBe(false);
            expect(mockConfig.update).toHaveBeenCalledWith('highContrast', false, vscode.ConfigurationTarget.Workspace);
        });

        it('should show information message when toggling', async () => {
            await manager.toggleManual();
            expect(mockWindow.showInformationMessage).toHaveBeenCalledWith('AI-101: High Contrast Mode enabled');
        });
    });

    describe('Auto-Detection', () => {
        it('should detect High Contrast theme and enable HC mode', () => {
            mockConfig.get.mockImplementation((key: string) => {
                if (key === 'highContrast') {return null;}
                if (key === 'autoDetectHighContrast') {return true;}
                return undefined;
            });

            // Simulate High Contrast theme
            const highContrastTheme = {
                kind: vscode.ColorThemeKind.HighContrast
            };

            mockWindow.activeColorTheme = highContrastTheme;

            // Recreate manager to trigger initial theme check
            (HighContrastManager as any).instance = undefined;
            const newManager = HighContrastManager.getInstance();

            expect(newManager.isEnabled()).toBe(true);
        });

        it('should not auto-detect when manual override is set', () => {
            mockConfig.get.mockImplementation((key: string) => {
                if (key === 'highContrast') {return true;} // Manual override
                if (key === 'autoDetectHighContrast') {return true;}
                return undefined;
            });

            const newManager = HighContrastManager.getInstance();
            expect(newManager.isEnabled()).toBe(true);
            expect(newManager.hasManualOverride()).toBe(true);
        });

        it('should not auto-detect when autoDetectionEnabled is false', () => {
            mockConfig.get.mockImplementation((key: string) => {
                if (key === 'highContrast') {return null;}
                if (key === 'autoDetectHighContrast') {return false;}
                return undefined;
            });

            const newManager = HighContrastManager.getInstance();
            expect(newManager.isEnabled()).toBe(false);
        });
    });

    describe('Theme Change Handling', () => {
        it('should handle theme changes when auto-detection is enabled', () => {
            mockConfig.get.mockImplementation((key: string) => {
                if (key === 'highContrast') {return null;}
                if (key === 'autoDetectHighContrast') {return true;}
                return undefined;
            });

            const highContrastTheme = {
                kind: vscode.ColorThemeKind.HighContrast
            };

            // Trigger theme change
            const themeChangeCallback = mockWindow.onDidChangeActiveColorTheme.mock.calls[0][0];
            themeChangeCallback(highContrastTheme);

            expect(manager.isEnabled()).toBe(true);
        });

        it('should not handle theme changes when manual override is set', () => {
            mockConfig.get.mockImplementation((key: string) => {
                if (key === 'highContrast') {return false;} // Manual override
                if (key === 'autoDetectHighContrast') {return true;}
                return undefined;
            });

            const newManager = HighContrastManager.getInstance();

            const highContrastTheme = {
                kind: vscode.ColorThemeKind.HighContrast
            };

            // Trigger theme change
            const themeChangeCallback = mockWindow.onDidChangeActiveColorTheme.mock.calls[0][0];
            themeChangeCallback(highContrastTheme);

            // Should not change because manual override is set
            expect(newManager.isEnabled()).toBe(false);
        });
    });

    describe('Configuration Management', () => {
        it('should return current configuration', () => {
            const config = manager.getConfig();
            expect(config).toEqual(DEFAULT_HIGH_CONTRAST_CONFIG);
        });

        it('should clear manual override', async () => {
            // Set manual override
            await manager.toggleManual();
            expect(manager.hasManualOverride()).toBe(true);

            // Clear manual override
            mockConfig.update.mockResolvedValue(undefined);
            await manager.clearManualOverride();

            expect(manager.hasManualOverride()).toBe(false);
            expect(mockConfig.update).toHaveBeenCalledWith('highContrast', null, vscode.ConfigurationTarget.Workspace);
        });
    });

    describe('Event Handling', () => {
        it('should emit events when High Contrast Mode changes', (done) => {
            manager.onHighContrastChanged((enabled: boolean) => {
                expect(enabled).toBe(true);
                done();
            });

            manager.setHighContrastMode(true);
        });

        it('should not emit events when state does not change', () => {
            const mockCallback = jest.fn();
            manager.onHighContrastChanged(mockCallback);

            manager.setHighContrastMode(false); // Already false
            expect(mockCallback).not.toHaveBeenCalled();
        });
    });

    describe('WCAG AAA Compliance', () => {
        it('should have minimum 60% opacity in config', () => {
            const config = manager.getConfig();
            expect(config.minOpacity).toBe(0.6);
        });

        it('should have high contrast color palette', () => {
            const config = manager.getConfig();
            expect(config.colorPalette.ink).toBe('#000000'); // Pure black
            expect(config.colorPalette.paper).toBe('#ffffff'); // Pure white
            expect(config.colorPalette.accent).toBe('#ff0000'); // High contrast red
        });

        it('should have enhanced readability settings', () => {
            const config = manager.getConfig();
            expect(config.fontSize).toBe(14);
            expect(config.fontWeight).toBe(600);
            expect(config.borderWidth).toBe(2);
        });
    });
});