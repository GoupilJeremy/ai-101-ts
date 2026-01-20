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
                    console.log('Suika Configuration changed');
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
                    throw new ConfigurationError({ setting: 'llm.provider' });
                }
                break;
            case 'ui.transparency':
                if (!validTransparency.includes(value)) {
                    throw new ConfigurationError({ setting: 'ui.transparency' });
                }
                break;
            case 'ui.mode':
                if (!validModes.includes(value)) {
                    throw new ConfigurationError({ setting: 'ui.mode' });
                }
                break;
            case 'performance.maxTokens':
            case 'performanceMode.collisionThrottleMs':
            case 'performanceMode.metricsThrottleMs':
                if (typeof value !== 'number' || value <= 0) {
                    throw new ConfigurationError({ setting: key });
                }
                break;
            case 'telemetry.enabled':
            case 'teamMode.largeText':
            case 'teamMode.surveyEnabled':
            case 'performanceMode.autoActivate':
            case 'performanceMode.autoSuggest':
            case 'accessibility.autoDetectHighContrast':
                if (typeof value !== 'boolean') {
                    throw new ConfigurationError({ setting: key });
                }
                break;
            case 'accessibility.colorblind':
                if (typeof value !== 'object' || value === null) {
                    throw new ConfigurationError({ setting: 'accessibility.colorblind' });
                }
                if (typeof value.enabled !== 'boolean') {
                    throw new ConfigurationError({ setting: 'accessibility.colorblind.enabled' });
                }
                if (!validColorblindTypes.includes(value.type)) {
                    throw new ConfigurationError({ setting: 'accessibility.colorblind.type' });
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
            throw new ConfigurationError({ setting: 'llm.provider' });
        }

        for (const [agent, provider] of Object.entries(config.llm.agentProviders)) {
            if (!validProviders.includes(provider as any)) {
                throw new ConfigurationError({ setting: `llm.agentProviders.${agent}` });
            }
        }

        const validTransparency = ['minimal', 'medium', 'full'];
        if (!validTransparency.includes(config.ui.transparency)) {
            throw new ConfigurationError({ setting: 'ui.transparency' });
        }

        const validModes = ['learning', 'expert', 'focus', 'team', 'performance'];
        if (!validModes.includes(config.ui.mode)) {
            throw new ConfigurationError({ setting: 'ui.mode' });
        }

        if (config.performance.maxTokens <= 0) {
            throw new ConfigurationError({ setting: 'performance.maxTokens' });
        }

        if (config.performance.tokenBudget <= 0) {
            throw new ConfigurationError({ setting: 'performance.tokenBudget' });
        }

        if (config.performance.costBudget <= 0) {
            throw new ConfigurationError({ setting: 'performance.costBudget' });
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
