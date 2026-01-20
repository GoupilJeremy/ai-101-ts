/**
 * Supported modes for the Suika extension.
 */
export enum AgentMode {
    Learning = 'learning',
    Expert = 'expert',
    Focus = 'focus',
    Team = 'team',
    Performance = 'performance'
}

/**
 * Base configuration for any mode.
 */
export interface IModeConfig {
    mode: AgentMode;
    showLabels: boolean;
    animationComplexity: 'full' | 'reduced' | 'none';
    explanationVerbositiy: 'low' | 'high';
    hudOpacity: number;
}

/**
 * Detailed configurations for each specific mode.
 */
export const ModeConfigs: Record<AgentMode, IModeConfig> = {
    [AgentMode.Learning]: {
        mode: AgentMode.Learning,
        showLabels: true,
        animationComplexity: 'full',
        explanationVerbositiy: 'high',
        hudOpacity: 0.9
    },
    [AgentMode.Expert]: {
        mode: AgentMode.Expert,
        showLabels: false,
        animationComplexity: 'full',
        explanationVerbositiy: 'low',
        hudOpacity: 0.7
    },
    [AgentMode.Focus]: {
        mode: AgentMode.Focus,
        showLabels: false,
        animationComplexity: 'none',
        explanationVerbositiy: 'low',
        hudOpacity: 0.0 // Hidden by default
    },
    [AgentMode.Team]: {
        mode: AgentMode.Team,
        showLabels: true,
        animationComplexity: 'full',
        explanationVerbositiy: 'high',
        hudOpacity: 0.95
    },
    [AgentMode.Performance]: {
        mode: AgentMode.Performance,
        showLabels: false,
        animationComplexity: 'none',
        explanationVerbositiy: 'low',
        hudOpacity: 0.8
    }
};
