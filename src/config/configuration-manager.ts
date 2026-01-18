import * as vscode from 'vscode';
import { ConfigurationError } from '../errors/configuration-error.js';
import { IAI101Config, ConfigurationScope } from '../api/configuration-types.js';

export interface IConfiguration {
    llm: {
        provider: 'openai' | 'anthropic' | 'custom';
        agentProviders: {
            architect: 'openai' | 'anthropic' | 'custom';
            coder: 'openai' | 'anthropic' | 'custom';
            reviewer: 'openai' | 'anthropic' | 'custom';
            context: 'openai' | 'anthropic' | 'custom';
        };
    };
    ui: {
        transparency: 'minimal' | 'medium' | 'full';
        mode: 'learning' | 'expert' | 'focus' | 'team' | 'performance';
    };
    performance: {
        maxTokens: number;
        tokenBudget: number;
        costBudget: number;
    };
    telemetry: {
        enabled: boolean;
    };
}

export class ConfigurationManager {
    private static instance: ConfigurationManager;
    private readonly section = 'ai101';

    private constructor() { }

    public static getInstance(): ConfigurationManager {
        if (!ConfigurationManager.instance) {
            ConfigurationManager.instance = new ConfigurationManager();
        }
        return ConfigurationManager.instance;
    }

    public initialize(context: vscode.ExtensionContext): void {
        context.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(this.section)) {
                    // Logic to handle configuration changes can be added here (e.g., event emitter)
                    // For now, consumers get fresh values via getSettings()
                    console.log('AI-101 Configuration changed');
                }
            })
        );
    }

    /**
     * Gets a typed configuration value.
     */
    public getConfig<K extends keyof IAI101Config>(key: K): IAI101Config[K] {
        const config = vscode.workspace.getConfiguration(this.section);
        const value = config.get(key);
        return value as IAI101Config[K];
    }

    /**
     * Sets a configuration value with validation and scope support.
     */
    public async setConfig<K extends keyof IAI101Config>(
        key: K,
        value: IAI101Config[K],
        scope: ConfigurationScope = 'user'
    ): Promise<void> {
        this.validateValue(key, value);
        const config = vscode.workspace.getConfiguration(this.section);
        const target = this.mapScopeToTarget(scope);
        await config.update(key, value, target);
    }

    /**
     * Performs a bulk update of multiple configuration keys.
     */
    public async updateConfig(
        partialConfig: Partial<IAI101Config>,
        scope: ConfigurationScope = 'user'
    ): Promise<void> {
        const target = this.mapScopeToTarget(scope);
        const config = vscode.workspace.getConfiguration(this.section);

        // First validate all values
        for (const [key, value] of Object.entries(partialConfig)) {
            this.validateValue(key as keyof IAI101Config, value);
        }

        // Then apply all updates sequentially
        for (const [key, value] of Object.entries(partialConfig)) {
            await config.update(key, value, target);
        }
    }

    private mapScopeToTarget(scope: ConfigurationScope): vscode.ConfigurationTarget {
        switch (scope) {
            case 'workspace':
                return vscode.ConfigurationTarget.Workspace;
            case 'workspaceFolder':
                return vscode.ConfigurationTarget.WorkspaceFolder;
            case 'user':
            default:
                return vscode.ConfigurationTarget.Global;
        }
    }

    private validateValue(key: string, value: any): void {
        const validProviders = ['openai', 'anthropic', 'custom'];
        const validTransparency = ['minimal', 'medium', 'full'];
        const validModes = ['learning', 'expert', 'focus', 'team', 'performance'];
        const validColorblindTypes = ['none', 'deuteranopia', 'protanopia', 'tritanopia'];

        switch (key) {
            case 'llm.provider':
                if (!validProviders.includes(value)) {
                    throw new ConfigurationError(`Invalid LLM provider: ${value}`);
                }
                break;
            case 'ui.transparency':
                if (!validTransparency.includes(value)) {
                    throw new ConfigurationError(`Invalid UI transparency: ${value}`);
                }
                break;
            case 'ui.mode':
                if (!validModes.includes(value)) {
                    throw new ConfigurationError(`Invalid UI mode: ${value}`);
                }
                break;
            case 'performance.maxTokens':
            case 'performanceMode.collisionThrottleMs':
            case 'performanceMode.metricsThrottleMs':
                if (typeof value !== 'number' || value <= 0) {
                    throw new ConfigurationError(`${key} must be a positive number`);
                }
                break;
            case 'telemetry.enabled':
            case 'teamMode.largeText':
            case 'teamMode.surveyEnabled':
            case 'performanceMode.autoActivate':
            case 'performanceMode.autoSuggest':
            case 'accessibility.autoDetectHighContrast':
                if (typeof value !== 'boolean') {
                    throw new ConfigurationError(`${key} must be a boolean`);
                }
                break;
            case 'accessibility.colorblind':
                if (typeof value !== 'object' || value === null) {
                    throw new ConfigurationError(`${key} must be an object`);
                }
                if (typeof value.enabled !== 'boolean') {
                    throw new ConfigurationError(`${key}.enabled must be a boolean`);
                }
                if (!validColorblindTypes.includes(value.type)) {
                    throw new ConfigurationError(`Invalid colorblind type: ${value.type}`);
                }
                break;
        }
    }

    public getSettings(): IConfiguration {
        const config = vscode.workspace.getConfiguration(this.section);

        const defaultProvider = config.get<any>('llm.provider', 'openai');

        const settings: IConfiguration = {
            llm: {
                provider: defaultProvider,
                agentProviders: {
                    architect: config.get<any>('llm.agentProviders.architect', defaultProvider),
                    coder: config.get<any>('llm.agentProviders.coder', defaultProvider),
                    reviewer: config.get<any>('llm.agentProviders.reviewer', defaultProvider),
                    context: config.get<any>('llm.agentProviders.context', defaultProvider),
                },
            },
            ui: {
                transparency: config.get<any>('ui.transparency', 'medium'),
                mode: config.get<any>('ui.mode', 'learning'),
            },
            performance: {
                maxTokens: config.get<number>('performance.maxTokens', 4096),
                tokenBudget: config.get<number>('performance.tokenBudget', 50000), // Default session budget
                costBudget: config.get<number>('performance.costBudget', 0.10),   // Default $0.10 session budget
            },
            telemetry: {
                enabled: config.get<boolean>('telemetry.enabled', true),
            },
        };

        this.validateSettings(settings);
        return settings;
    }

    private validateSettings(config: IConfiguration): void {
        const validProviders = ['openai', 'anthropic', 'custom'];
        if (!validProviders.includes(config.llm.provider)) {
            throw new ConfigurationError(`Invalid LLM provider: ${config.llm.provider}`);
        }

        for (const [agent, provider] of Object.entries(config.llm.agentProviders)) {
            if (!validProviders.includes(provider)) {
                throw new ConfigurationError(`Invalid LLM provider for agent ${agent}: ${provider}`);
            }
        }

        const validTransparency = ['minimal', 'medium', 'full'];
        if (!validTransparency.includes(config.ui.transparency)) {
            throw new ConfigurationError(`Invalid UI transparency: ${config.ui.transparency}`);
        }

        const validModes = ['learning', 'expert', 'focus', 'team', 'performance'];
        if (!validModes.includes(config.ui.mode)) {
            throw new ConfigurationError(`Invalid UI mode: ${config.ui.mode}`);
        }

        if (config.performance.maxTokens <= 0) {
            throw new ConfigurationError('Max tokens must be greater than 0');
        }

        if (config.performance.tokenBudget <= 0) {
            throw new ConfigurationError('Token budget must be greater than 0');
        }

        if (config.performance.costBudget <= 0) {
            throw new ConfigurationError('Cost budget must be greater than 0');
        }
    }

    /**
     * Resets all configuration settings to their default values.
     */
    public async resetToDefaults(): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.section);

        // Reset all settings to undefined (which restores defaults)
        await config.update('llm.provider', undefined, vscode.ConfigurationTarget.Global);
        await config.update('ui.transparency', undefined, vscode.ConfigurationTarget.Global);
        await config.update('ui.mode', undefined, vscode.ConfigurationTarget.Global);
        await config.update('performance.maxTokens', undefined, vscode.ConfigurationTarget.Global);
        await config.update('telemetry.enabled', undefined, vscode.ConfigurationTarget.Global);
    }
}
