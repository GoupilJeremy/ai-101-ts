import OpenAI from 'openai';
import { ILLMProvider, ILLMOptions, ILLMResponse, IModelInfo } from '../provider.interface.js';
import { SecretManager } from '../../config/secret-manager.js';
import { LLMProviderError } from '../../errors/llm-provider-error.js';

export class OpenAIProvider implements ILLMProvider {
    public readonly name = 'openai';
    private client: OpenAI | undefined;
    private encoding: any;

    private readonly models: Record<string, IModelInfo> = {
        'gpt-4': { id: 'gpt-4', name: 'GPT-4', contextWindow: 8192 },
        'gpt-4-turbo': { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', contextWindow: 128000 },
        'gpt-3.5-turbo': { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', contextWindow: 16385 }
    };

    private async getEncoding() {
        if (!this.encoding) {
            const { getEncoding } = await import('js-tiktoken');
            this.encoding = getEncoding('cl100k_base');
        }
        return this.encoding;
    }

    private async getClient(): Promise<OpenAI> {
        if (this.client) {
            return this.client;
        }

        const apiKey = await SecretManager.getInstance().getApiKey('openai');
        if (!apiKey) {
            throw new LLMProviderError('OpenAI API key not found in SecretStorage', 'AUTH_FAILED', false);
        }

        this.client = new OpenAI({
            apiKey: apiKey,
            maxRetries: 0 // We handle retries via our centralized ErrorHandler
        });

        return this.client;
    }

    public async generateCompletion(prompt: string, options: ILLMOptions = {}): Promise<ILLMResponse> {
        const client = await this.getClient();
        const model = options.model || 'gpt-3.5-turbo';

        try {
            const response = await client.chat.completions.create({
                model: model,
                messages: [{ role: 'user', content: prompt }],
                temperature: options.temperature ?? 0.7,
                max_tokens: options.maxTokens
            }, {
                timeout: options.timeout ?? 30000
            });

            const choice = response.choices[0];
            const usage = response.usage!;

            return {
                text: choice.message.content || '',
                tokens: {
                    prompt: usage.prompt_tokens,
                    completion: usage.completion_tokens,
                    total: usage.total_tokens
                },
                model: response.model,
                finishReason: choice.finish_reason,
                cost: this.calculateCost(response.model, usage.prompt_tokens, usage.completion_tokens)
            };
        } catch (error: any) {
            const isTransient = error.status === 429 || error.status >= 500;
            const code = error.code || 'OPENAI_ERROR';
            throw new LLMProviderError(`OpenAI API Error: ${error.message}`, code, isTransient);
        }
    }

    public async estimateTokens(text: string): Promise<number> {
        const encoding = await this.getEncoding();
        return encoding.encode(text).length;
    }

    public getModelInfo(model: string): IModelInfo {
        const info = this.models[model];
        if (!info) {
            throw new LLMProviderError(`Unsupported OpenAI model: ${model}`, 'INVALID_MODEL', false);
        }
        return info;
    }

    public async isAvailable(): Promise<boolean> {
        try {
            const apiKey = await SecretManager.getInstance().getApiKey('openai');
            return !!apiKey;
        } catch {
            return false;
        }
    }

    private calculateCost(model: string, promptTokens: number, completionTokens: number): number {
        // Simplified pricing for estimation
        // Pricing per 1k tokens (Input / Output)
        const pricing: Record<string, [number, number]> = {
            'gpt-4': [0.03, 0.06],
            'gpt-4-turbo': [0.01, 0.03],
            'gpt-3.5-turbo': [0.0005, 0.0015]
        };

        const [inputPrice, outputPrice] = pricing[model] || [0.03, 0.06];
        return (promptTokens / 1000) * inputPrice + (completionTokens / 1000) * outputPrice;
    }
}
