import Anthropic from '@anthropic-ai/sdk';
import { ILLMProvider, ILLMOptions, ILLMResponse, IModelInfo } from '../provider.interface.js';
import { SecretManager } from '../../config/secret-manager.js';
import { LLMProviderError } from '../../errors/llm-provider-error.js';

export class AnthropicProvider implements ILLMProvider {
    public readonly name = 'anthropic';
    private client: Anthropic | undefined;

    private readonly models: Record<string, IModelInfo> = {
        'claude-3-opus': { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', contextWindow: 200000 },
        'claude-3-sonnet': { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', contextWindow: 200000 },
        'claude-3-haiku': { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', contextWindow: 200000 }
    };

    private async getClient(): Promise<Anthropic> {
        if (this.client) {
            return this.client;
        }

        const apiKey = await SecretManager.getInstance().getApiKey('anthropic');
        if (!apiKey) {
            throw new LLMProviderError('Anthropic API key not found in SecretStorage', 'AI101-AUTH-002', false, { provider: 'anthropic' });
        }

        this.client = new Anthropic({
            apiKey: apiKey,
            maxRetries: 0 // Centralized retry handling
        });

        return this.client;
    }

    public async generateCompletion(prompt: string, options: ILLMOptions = {}): Promise<ILLMResponse> {
        const client = await this.getClient();
        const modelKey = options.model || 'claude-3-haiku';
        const modelInfo = this.getModelInfo(modelKey);

        try {
            const response = await client.messages.create({
                model: modelInfo.id,
                max_tokens: options.maxTokens || 4096,
                messages: [{ role: 'user', content: prompt }],
                temperature: options.temperature ?? 0.7
            }, {
                timeout: options.timeout ?? 30000
            });

            const content = response.content[0];
            if (content.type !== 'text') {
                throw new LLMProviderError('Unexpected Anthropic response content type', 'AI101-LLM-001', false, { provider: 'anthropic' });
            }

            const usage = response.usage;

            return {
                text: content.text,
                tokens: {
                    prompt: usage.input_tokens,
                    completion: usage.output_tokens,
                    total: usage.input_tokens + usage.output_tokens
                },
                model: response.model,
                finishReason: response.stop_reason || 'unknown',
                cost: this.calculateCost(response.model, usage.input_tokens, usage.output_tokens)
            };
        } catch (error: any) {
            const isTransient = error.status === 429 || error.status >= 500;
            throw new LLMProviderError(`Anthropic API Error: ${error.message}`, 'AI101-LLM-001', isTransient, { provider: 'anthropic' });
        }
    }

    public async estimateTokens(text: string): Promise<number> {
        // Approximation as per story requirements (char count / 4)
        return Math.ceil(text.length / 4);
    }

    public getModelInfo(model: string): IModelInfo {
        const info = this.models[model];
        if (!info) {
            throw new LLMProviderError(`Unsupported Anthropic model: ${model}`, 'AI101-LLM-001', false, { provider: 'anthropic' });
        }
        return info;
    }

    public async isAvailable(): Promise<boolean> {
        try {
            const apiKey = await SecretManager.getInstance().getApiKey('anthropic');
            return !!apiKey;
        } catch {
            return false;
        }
    }

    private calculateCost(modelId: string, promptTokens: number, completionTokens: number): number {
        // Pricing per 1M tokens (Input / Output) based on Claude 3 pricing
        const pricing: Record<string, [number, number]> = {
            'claude-3-opus-20240229': [15.00, 75.00],
            'claude-3-sonnet-20240229': [3.00, 15.00],
            'claude-3-haiku-20240307': [0.25, 1.25]
        };

        const [inputPrice, outputPrice] = pricing[modelId] || [15.00, 75.00];
        return (promptTokens / 1_000_000) * inputPrice + (completionTokens / 1_000_000) * outputPrice;
    }
}
