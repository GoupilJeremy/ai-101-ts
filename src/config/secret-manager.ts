import * as vscode from 'vscode';
import { AuthenticationError } from '../errors/authentication-error';

export type LLMProvider = 'openai' | 'anthropic' | 'custom';

export class SecretManager {
    private static instance: SecretManager;
    private readonly keyPrefix = 'ai101';

    private constructor(private readonly secrets: vscode.SecretStorage) { }

    public static initialize(context: vscode.ExtensionContext): SecretManager {
        if (!SecretManager.instance) {
            SecretManager.instance = new SecretManager(context.secrets);
        }
        return SecretManager.instance;
    }

    public static getInstance(): SecretManager {
        if (!SecretManager.instance) {
            throw new Error('SecretManager not initialized. Call initialize() first.');
        }
        return SecretManager.instance;
    }

    private getKeyName(provider: LLMProvider): string {
        return `${this.keyPrefix}.${provider}.apiKey`;
    }

    public async storeApiKey(provider: LLMProvider, key: string): Promise<void> {
        if (!key) {
            throw new AuthenticationError('AI101-AUTH-002', { provider });
        }
        try {
            await this.secrets.store(this.getKeyName(provider), key);
        } catch (error) {
            throw new AuthenticationError('AI101-AUTH-001', { provider });
        }
    }

    public async getApiKey(provider: LLMProvider): Promise<string | undefined> {
        try {
            return await this.secrets.get(this.getKeyName(provider));
        } catch (error) {
            throw new AuthenticationError('AI101-AUTH-001', { provider });
        }
    }

    public async deleteApiKey(provider: LLMProvider): Promise<void> {
        try {
            await this.secrets.delete(this.getKeyName(provider));
        } catch (error) {
            throw new AuthenticationError('AI101-AUTH-001', { provider });
        }
    }
}
