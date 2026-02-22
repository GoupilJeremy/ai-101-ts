
export interface IQuest {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    criteria: {
        type: 'action_count' | 'feature_usage' | 'uptime';
        metric: string;
        target: number;
    };
    icon?: string;
}

export interface IAchievement {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    icon: string; // codicon name
    isHidden?: boolean;
}

export const QUEST_REGISTRY: Record<string, IQuest> = {
    'first_refactor': {
        id: 'first_refactor',
        title: 'First Steps',
        description: 'Ask the Architect or Coder to refactor a piece of code.',
        xpReward: 100,
        criteria: {
            type: 'action_count',
            metric: 'refactor_request',
            target: 1
        },
        icon: 'tools'
    },
    'bug_hunter': {
        id: 'bug_hunter',
        title: 'Bug Hunter',
        description: 'Fix 3 bugs using the Reviewer agent.',
        xpReward: 300,
        criteria: {
            type: 'action_count',
            metric: 'bug_fix',
            target: 3
        },
        icon: 'bug'
    },
    'documentation_master': {
        id: 'documentation_master',
        title: 'Scribe',
        description: 'Generate documentation for 5 files.',
        xpReward: 250,
        criteria: {
            type: 'action_count',
            metric: 'doc_gen',
            target: 5
        },
        icon: 'book'
    },
    'team_player': {
        id: 'team_player',
        title: 'Team Player',
        description: 'Accept 5 suggestions from Suika.',
        xpReward: 200,
        criteria: {
            type: 'action_count',
            metric: 'suggestion_accepted',
            target: 5
        },
        icon: 'organization'
    }
};

export const ACHIEVEMENT_REGISTRY: Record<string, IAchievement> = {
    'early_adopter': {
        id: 'early_adopter',
        title: 'Early Adopter',
        description: 'Use Suika during the alpha/beta phase.',
        xpReward: 500,
        icon: 'star'
    },
    'night_owl': {
        id: 'night_owl',
        title: 'Night Owl',
        description: 'Use Suika between 2 AM and 5 AM.',
        xpReward: 150,
        icon: 'moon'
    },
    'speed_demon': {
        id: 'speed_demon',
        title: 'Speed Demon',
        description: 'Accept a suggestion within 5 seconds of generation.',
        xpReward: 100,
        icon: 'zap'
    }
};
