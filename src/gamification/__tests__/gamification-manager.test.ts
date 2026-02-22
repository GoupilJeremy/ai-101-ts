
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GamificationManager, IGamificationState } from '../gamification-manager.js';
import * as vscode from 'vscode';

// Mock vscode
vi.mock('vscode', () => {
    return {
        window: {
            showInformationMessage: vi.fn(),
            createTextEditorDecorationType: vi.fn()
        },
        ExtensionContext: vi.fn(),
        DecorationRangeBehavior: {
            OpenOpen: 0,
            ClosedClosed: 1,
            OpenClosed: 2,
            ClosedOpen: 3
        },
        Range: vi.fn(),
        OverviewRulerLane: {
            Left: 1,
            Center: 2,
            Right: 4,
            Full: 7
        }
    };
});

describe('GamificationManager', () => {
    let context: any;

    beforeEach(() => {
        // Reset singleton
        (GamificationManager as any).instance = undefined;

        context = {
            globalState: {
                get: vi.fn().mockReturnValue(undefined),
                update: vi.fn()
            }
        };
    });

    it('should initialize with default state', () => {
        const manager = GamificationManager.getInstance();
        manager.initialize(context);

        const state = manager.getState();
        expect(state.xp).toBe(0);
        expect(state.level).toBe(1);
    });

    it('should add XP and trigger level up', () => {
        const manager = GamificationManager.getInstance();
        manager.initialize(context);

        manager.addXp(100);
        expect(manager.getState().xp).toBe(100);

        // Add enough XP to level up (level 2 requires ~1000 XP based on formula)
        // Level = 1 + floor(0.1 * sqrt(XP)) -> 2 = 1 + floor(0.1 * sqrt(100))
        manager.addXp(900); // Total 1000 -> sqrt(1000) ~ 31.6 -> 3.16 -> level 4? Wait the formula was Level = 1 + floor(0.1 * sqrt(XP))
        // 1 + floor(3.16) = 4. Wait, 0.1 * 31.6 = 3.16. So Level 4.

        expect(manager.getState().level).toBeGreaterThan(1);
        expect(vscode.window.showInformationMessage).toHaveBeenCalled();
    });

    it('should complete quests correctly', () => {
        const manager = GamificationManager.getInstance();
        manager.initialize(context);

        const initialXp = manager.getState().xp;
        manager.completeQuest('first_refactor'); // 100 XP

        expect(manager.getState().xp).toBe(initialXp + 100);
        expect(manager.getState().completedQuests).toContain('first_refactor');
    });

    it('should persist state', () => {
        const manager = GamificationManager.getInstance();
        manager.initialize(context);

        manager.addXp(50);
        expect(context.globalState.update).toHaveBeenCalled();
    });
});
