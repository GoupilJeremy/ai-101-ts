import { IConfiguration } from './configuration-manager.js';

export interface IPreset {
    name: string;
    description: string;
    config: Partial<IConfiguration>; // Presets might not define everything
}

export const SOLO_PRESET: IPreset = {
    name: 'Solo Developer',
    description: 'Optimized for single user, learning mode, and detailed explanations.',
    config: {
        ui: {
            transparency: 'full',
            mode: 'learning'
        },
        performance: {
            maxTokens: 4096,
            tokenBudget: 50000,
            costBudget: 0.10
        }
    }
};

export const TEAM_PRESET: IPreset = {
    name: 'Team',
    description: 'Optimized for collaboration, pair programming, and shared context.',
    config: {
        ui: {
            transparency: 'medium',
            mode: 'team'
        },
        performance: {
            maxTokens: 8192,
            tokenBudget: 100000,
            costBudget: 0.50
        }
    }
};

export const ENTERPRISE_PRESET: IPreset = {
    name: 'Enterprise',
    description: 'Optimized for security, compliance, and on-premise resources.',
    config: {
        llm: {
            provider: 'custom',
            agentProviders: {
                architect: 'custom',
                coder: 'custom',
                reviewer: 'custom',
                context: 'custom'
            }
        },
        ui: {
            transparency: 'minimal',
            mode: 'focus'
        },
        performance: {
            maxTokens: 16384,
            tokenBudget: 500000,
            costBudget: 2.00
        },
        telemetry: {
            enabled: true // Logging compliance
        }
    }
};

export const PRESETS: Record<string, IPreset> = {
    'solo': SOLO_PRESET,
    'team': TEAM_PRESET,
    'enterprise': ENTERPRISE_PRESET
};
