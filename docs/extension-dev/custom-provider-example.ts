/**
 * Example: Custom LLM Provider for AI-101 Extension
 * 
 * This example demonstrates how to create and register a custom LLM provider
 * with the AI-101 extension from another VSCode extension.
 * 
 * @packageDocumentation
 */

import * as vscode from 'vscode';
import { IAI101API, ILLMProvider, ILLMResponse, ILLMOptions, IModelInfo } from 'ai-101-ts';

/**
 * Example custom provider implementation for a company's internal LLM.
 */
class CompanyInternalLLMProvider implements ILLMProvider {
    readonly name = 'company-internal-llm';

    async generateCompletion(prompt: string, options?: ILLMOptions): Promise<ILLMResponse> {
        // Example: Call your company's internal LLM API
        const response = await fetch('https://internal-llm.company.com/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                temperature: options?.temperature || 0.7,
                max_tokens: options?.maxTokens || 1000
            })
        });

        const data = await response.json();

        return {
            text: data.generated_text,
            tokens: {
                prompt: data.usage.prompt_tokens,
                completion: data.usage.completion_tokens,
                total: data.usage.total_tokens
            },
            model: options?.model || 'company-model-v1',
            finishReason: data.finish_reason,
            cost: 0 // Internal model, no cost
        };
    }

    async estimateTokens(text: string): Promise<number> {
        // Simple approximation: ~4 characters per token
        return Math.ceil(text.length / 4);
    }

    getModelInfo(model: string): IModelInfo {
        return {
            id: model,
            name: 'Company Internal LLM',
            contextWindow: 8192
        };
    }

    async isAvailable(): Promise<boolean> {
        // Check if API key is configured
        const config = vscode.workspace.getConfiguration('companyLLM');
        const apiKey = config.get<string>('apiKey');
        return !!apiKey;
    }
}

/**
 * Extension activation function.
 * This is called when your extension is activated.
 */
export function activate(context: vscode.ExtensionContext) {
    // Step 1: Get the AI-101 extension
    const ai101Extension = vscode.extensions.getExtension('your-publisher.ai-101-ts');

    if (!ai101Extension) {
        vscode.window.showWarningMessage('AI-101 extension not found. Custom LLM provider not registered.');
        return;
    }

    // Step 2: Activate AI-101 if not already active
    ai101Extension.activate().then(() => {
        // Step 3: Get the public API
        const api: IAI101API = ai101Extension.exports;

        // Step 4: Create and register your custom provider
        try {
            const customProvider = new CompanyInternalLLMProvider();
            api.registerLLMProvider('company-internal-llm', customProvider);

            vscode.window.showInformationMessage('Company Internal LLM successfully registered with AI-101!');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to register custom LLM provider: ${error}`);
        }
    });
}

export function deactivate() {
    // Cleanup if needed
}
