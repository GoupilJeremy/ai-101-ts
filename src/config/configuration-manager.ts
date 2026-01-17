import * as vscode from 'vscode';
import { ConfigurationError } from '../errors/configuration-error';

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
        await config.update('llm.provider', undefined, vscode.ConfigurationTarget.Workspace);
        await config.update('ui.transparency', undefined, vscode.ConfigurationTarget.Workspace);
        await config.update('ui.mode', undefined, vscode.ConfigurationTarget.Workspace);
        await config.update('performance.maxTokens', undefined, vscode.ConfigurationTarget.Workspace);
        await config.update('telemetry.enabled', undefined, vscode.ConfigurationTarget.Workspace);
    }
}
