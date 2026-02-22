
import * as vscode from 'vscode';
import { ExtensionStateManager } from '../state/extension-state-manager.js';
import { IQuest, IAchievement, QUEST_REGISTRY, ACHIEVEMENT_REGISTRY } from './quest-registry.js';
import { LifecycleEventManager } from '../api/lifecycle-event-manager.js';

export interface IGamificationState {
    xp: number;
    level: number;
    completedQuests: string[];
    activeQuests: string[];
    unlockedAchievements: string[];
    streakDays: number;
    lastActiveDate: number;
}

export class GamificationManager {
    private static instance: GamificationManager;
    private state: IGamificationState;
    private context: vscode.ExtensionContext | undefined;

    // Level scaling constants
    private readonly BASE_XP = 1000;
    private readonly XP_MULTIPLIER = 1.5;

    private constructor() {
        this.state = {
            xp: 0,
            level: 1,
            completedQuests: [],
            activeQuests: ['first_refactor'], // Default starting quest
            unlockedAchievements: [],
            streakDays: 0,
            lastActiveDate: Date.now()
        };

        this.initializeListeners();
    }

    public static getInstance(): GamificationManager {
        if (!GamificationManager.instance) {
            GamificationManager.instance = new GamificationManager();
        }
        return GamificationManager.instance;
    }

    public initialize(context: vscode.ExtensionContext): void {
        this.context = context;
        this.loadState();
        this.checkDailyStreak();
    }

    /**
     * Adds XP and handles level up logic.
     */
    public addXp(amount: number, reason?: string): void {
        this.state.xp += amount;

        // Check for level up
        const newLevel = this.calculateLevel(this.state.xp);
        if (newLevel > this.state.level) {
            this.handleLevelUp(newLevel);
        }

        this.saveState();
        this.notifyUpdate(reason ? `+${amount} XP: ${reason}` : `+${amount} XP`);
    }

    /**
     * Records an action to check against quest criteria.
     */
    public recordAction(metric: string, count: number = 1): void {
        // Check active quests
        this.state.activeQuests.forEach(questId => {
            const quest = QUEST_REGISTRY[questId];
            if (quest && quest.criteria.metric === metric) {
                // In a real implementation, we would track progress per quest
                // For simplicity, we'll assume single-action completion or simple count
                // We'd need a separate "questProgress" state map

                // For now, let's assume if they do the action, they make progress
                // If it's a 'one-off' action, complete it
                if (quest.criteria.target <= count) { // Simplified check
                    this.completeQuest(questId);
                }
            }
        });
    }

    public completeQuest(questId: string): void {
        if (this.state.completedQuests.includes(questId)) { return; }

        const quest = QUEST_REGISTRY[questId];
        if (!quest) { return; }

        this.state.completedQuests.push(questId);
        this.state.activeQuests = this.state.activeQuests.filter(id => id !== questId);

        this.addXp(quest.xpReward, `Quest Completed: ${quest.title}`);

        vscode.window.showInformationMessage(`Quest Complete: ${quest.title}! (+${quest.xpReward} XP)`);

        this.saveState();
    }

    public unlockAchievement(achievementId: string): void {
        if (this.state.unlockedAchievements.includes(achievementId)) { return; }

        const achievement = ACHIEVEMENT_REGISTRY[achievementId];
        if (!achievement) { return; }

        this.state.unlockedAchievements.push(achievementId);
        this.addXp(achievement.xpReward, `Achievement Unlocked: ${achievement.title}`);

        vscode.window.showInformationMessage(`🏆 Achievement Unlocked: ${achievement.title}!`);

        this.saveState();
    }

    private calculateLevel(xp: number): number {
        // Simple geometric progression: Level N requires BASE * (MULTIPLIER ^ (N-1))
        // Or roughly: XP = BASE * (MULTIPLIER^Level - 1) / (MULTIPLIER - 1)
        // Let's use a simpler quadratic formula for standard RPG feel: Level = constant * sqrt(XP)
        // Level = 1 + floor(0.1 * sqrt(XP))
        return 1 + Math.floor(0.1 * Math.sqrt(xp));
    }

    private handleLevelUp(newLevel: number): void {
        const levelsGained = newLevel - this.state.level;
        this.state.level = newLevel;

        vscode.window.showInformationMessage(`🎉 Level Up! You are now Level ${newLevel}!`);

        // Emit event
        LifecycleEventManager.getInstance().emit('gamificationLevelUp', {
            level: newLevel,
            xp: this.state.xp,
            timestamp: Date.now()
        });
    }

    private checkDailyStreak(): void {
        const now = Date.now();
        const lastDate = new Date(this.state.lastActiveDate);
        const currentDate = new Date(now);

        // Check if same day
        if (lastDate.toDateString() === currentDate.toDateString()) {
            return;
        }

        // Check if consecutive day (86400000 ms in a day)
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            this.state.streakDays++;
            this.addXp(50 * this.state.streakDays, 'Daily Streak Bonus');
        } else if (diffDays > 1) {
            this.state.streakDays = 1; // Reset streak
        }

        this.state.lastActiveDate = now;
        this.saveState();
    }

    private notifyUpdate(message: string): void {
        // Send update to webview
        ExtensionStateManager.getInstance().notifyGamificationUpdate(this.state, message);
    }

    private loadState(): void {
        if (this.context) {
            const storedState = this.context.globalState.get<IGamificationState>('suika.gamification');
            if (storedState) {
                this.state = { ...this.state, ...storedState };
            }
        }
    }

    private saveState(): void {
        if (this.context) {
            this.context.globalState.update('suika.gamification', this.state);
        }
    }

    private initializeListeners(): void {
        // Listen for internal events to trigger achievements/quests
        LifecycleEventManager.getInstance().on('suggestionGenerated', (event) => {
            // Check for potential achievements/quests related to suggestions
            // For now, simplify logic
        });
    }

    public getState(): IGamificationState {
        return { ...this.state };
    }
}
