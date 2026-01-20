import { ILLMProvider, ILLMOptions, ILLMResponse, IModelInfo } from '../../src/llm/provider.interface.js';

/**
 * Example custom LLM provider implementation.
 * 
 * This demonstrates how to create a custom provider that integrates
 * with Suika's agent system.
 */
export class ExampleCustomProvider implements ILLMProvider {
    readonly name = 'example-custom-provider';

    /**
     * Generate a completion from the LLM.
     * 
     * In a real implementation, this would call your LLM API.
     * This example returns a mock response.
     */
    async generateCompletion(prompt: string, options?: ILLMOptions): Promise<ILLMResponse> {
        // Validate input
        if (!prompt || prompt.trim().length === 0) {
            throw new Error('Prompt cannot be empty');
        }

        // In a real implementation, you would:
        // 1. Call your LLM API with the prompt and options
        // 2. Handle rate limiting and retries
        // 3. Parse the response
        // 4. Return structured ILLMResponse

        // Mock implementation
        const mockResponse: ILLMResponse = {
            content: `Mock response to: ${prompt.substring(0, 50)}...`,
            model: options?.model || 'example-model-v1',
            usage: {
                promptTokens: this.estimateTokens(prompt),
                completionTokens: 100,
                totalTokens: this.estimateTokens(prompt) + 100
            },
            finishReason: 'stop'
        };

        return mockResponse;
    }

    /**
     * Estimate the number of tokens in a text.
     * 
     * This is a simple approximation. Real implementations should use
     * the tokenizer specific to your LLM.
     */
    estimateTokens(text: string): number {
        // Simple approximation: ~4 characters per token
        return Math.ceil(text.length / 4);
    }

    /**
     * Get information about a specific model.
     */
    getModelInfo(model: string): IModelInfo {
        // Return model capabilities and limits
        return {
            name: model,
            maxTokens: 8192,
            supportsStreaming: false,
            costPer1kTokens: {
                prompt: 0.01,
                completion: 0.03
            }
        };
    }

    /**
     * Check if the provider is available and configured.
     * 
     * This is called before using the provider to ensure it's ready.
     */
    async isAvailable(): Promise<boolean> {
        // In a real implementation, you would:
        // 1. Check if API keys are configured
        // 2. Optionally ping the API to verify connectivity
        // 3. Check rate limits

        // For this example, always return true
        return true;
    }
}

/**
 * Example usage in an extension's activate() function:
 * 
 * ```typescript
 * import * as vscode from 'vscode';
 * import { IAI101API } from 'suika';
 * import { ExampleCustomProvider } from './example-provider';
 * 
 * export function activate(context: vscode.ExtensionContext) {
 *     const ai101 = vscode.extensions.getExtension('GoupilJeremy.suika');
 *     if (!ai101) return;
 * 
 *     const api: IAI101API = suika.exports;
 *     
 *     // Register the custom provider
 *     const provider = new ExampleCustomProvider();
 *     api.registerLLMProvider('example-custom-provider', provider);
 *     
 *     vscode.window.showInformationMessage('Custom LLM provider registered!');
 * }
 * ```
 */
