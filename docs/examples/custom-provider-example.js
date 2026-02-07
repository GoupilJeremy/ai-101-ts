/**
 * Example Custom LLM Provider Implementation
 *
 * This example demonstrates how to implement the ILLMProvider interface
 * for a custom or on-premise LLM provider.
 *
 * @example
 * ```typescript
 * // Usage example
 * const provider = new MyCustomLLMProvider('your-api-key');
 *
 * if (await provider.isAvailable()) {
 *   const response = await provider.generateCompletion(
 *     'Explain TypeScript generics',
 *     { temperature: 0.7, maxTokens: 500 }
 *   );
 *   console.log(response.text);
 * }
 * ```
 */
/**
 * Custom error class for LLM provider errors.
 *
 * @remarks
 * This error should be thrown for provider-specific failures such as:
 * - API authentication failures
 * - Rate limiting
 * - Invalid model selection
 * - Service unavailability
 */
export class LLMProviderError extends Error {
    code;
    isTransient;
    data;
    constructor(message, code, isTransient = false, data = {}) {
        super(message);
        this.code = code;
        this.isTransient = isTransient;
        this.data = data;
        this.name = 'LLMProviderError';
    }
}
/**
 * Example implementation of a custom LLM provider.
 *
 * @remarks
 * This example shows how to:
 * - Implement all required ILLMProvider methods
 * - Handle API key management securely
 * - Perform request/response handling
 * - Wrap errors appropriately
 * - Estimate tokens for cost tracking
 *
 * @public
 */
export class MyCustomLLMProvider {
    name = 'my-custom-llm';
    apiKey;
    baseUrl;
    defaultModel;
    /**
     * Creates a new instance of the custom LLM provider.
     *
     * @param apiKey - The API key for authentication
     * @param baseUrl - The base URL for the LLM API (optional)
     * @param defaultModel - The default model to use (optional)
     *
     * @example
     * ```typescript
     * const provider = new MyCustomLLMProvider(
     *   'sk-your-api-key',
     *   'https://api.example.com',
     *   'custom-model-v1'
     * );
     * ```
     */
    constructor(apiKey, baseUrl = 'https://api.mycustomllm.com', defaultModel = 'custom-model-v1') {
        if (!apiKey || apiKey.trim() === '') {
            throw new LLMProviderError('API key is required', 'AI101-AUTH-002', false, { provider: this.name });
        }
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.defaultModel = defaultModel;
    }
    /**
     * Generates a completion for the given prompt.
     *
     * @param prompt - The input text prompt
     * @param options - Optional request configuration
     * @returns Promise resolving to the LLM response
     *
     * @throws {LLMProviderError} When the API request fails
     */
    async generateCompletion(prompt, options) {
        // Validate input
        if (!prompt || prompt.trim() === '') {
            throw new LLMProviderError('Prompt cannot be empty', 'AI101-LLM-001', false, { provider: this.name });
        }
        const model = options?.model || this.defaultModel;
        const temperature = options?.temperature ?? 0.7;
        const maxTokens = options?.maxTokens ?? 1000;
        const timeout = options?.timeout ?? 30000;
        try {
            // Construct the API request
            const requestBody = {
                model,
                prompt,
                temperature,
                max_tokens: maxTokens,
            };
            // Make the API call with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            const response = await fetch(`${this.baseUrl}/v1/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            // Handle HTTP errors
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const isTransient = response.status === 429 || response.status >= 500;
                throw new LLMProviderError(errorData.message || `HTTP ${response.status}: ${response.statusText}`, 'AI101-LLM-001', isTransient, { provider: this.name, statusCode: response.status.toString() });
            }
            // Parse the response
            const data = await response.json();
            // Calculate cost (example pricing: $0.01 per 1K tokens)
            const promptTokens = await this.estimateTokens(prompt);
            const completionTokens = await this.estimateTokens(data.text || '');
            const totalTokens = promptTokens + completionTokens;
            const cost = (totalTokens / 1000) * 0.01;
            return {
                text: data.text || '',
                tokens: {
                    prompt: promptTokens,
                    completion: completionTokens,
                    total: totalTokens,
                },
                model: data.model || model,
                finishReason: data.finish_reason || 'stop',
                cost,
            };
        }
        catch (error) {
            // Handle abort/timeout errors
            if (error instanceof Error && error.name === 'AbortError') {
                throw new LLMProviderError(`Request timed out after ${timeout}ms`, 'AI101-LLM-001', true, { provider: this.name });
            }
            // Re-throw LLMProviderError as-is
            if (error instanceof LLMProviderError) {
                throw error;
            }
            // Wrap other errors
            throw new LLMProviderError(`Failed to generate completion: ${error instanceof Error ? error.message : String(error)}`, 'AI101-LLM-001', false, { provider: this.name });
        }
    }
    /**
     * Estimates the number of tokens in the given text.
     *
     * @param text - The text to tokenize
     * @returns Promise resolving to the estimated token count
     *
     * @remarks
     * This is a simple approximation. For production use, consider using
     * a proper tokenizer library specific to your model.
     */
    async estimateTokens(text) {
        // Simple approximation: ~1.3 tokens per word
        // For production, use a proper tokenizer like tiktoken
        const words = text.trim().split(/\s+/).length;
        return Math.ceil(words * 1.3);
    }
    /**
     * Returns information about a specific model.
     *
     * @param model - The model identifier
     * @returns Model information
     *
     * @throws {Error} When the model is not supported
     */
    getModelInfo(model) {
        // Define supported models
        const models = {
            'custom-model-v1': {
                id: 'custom-model-v1',
                name: 'Custom Model V1',
                contextWindow: 4096,
            },
            'custom-model-v2': {
                id: 'custom-model-v2',
                name: 'Custom Model V2',
                contextWindow: 8192,
            },
            'custom-model-large': {
                id: 'custom-model-large',
                name: 'Custom Model Large',
                contextWindow: 16384,
            },
        };
        const modelInfo = models[model];
        if (!modelInfo) {
            throw new Error(`Model '${model}' is not supported by ${this.name}`);
        }
        return modelInfo;
    }
    /**
     * Checks if the provider is currently available.
     *
     * @returns Promise resolving to true if available, false otherwise
     *
     * @remarks
     * This method verifies:
     * - API key is configured
     * - Service endpoint is reachable
     * - Authentication is valid
     */
    async isAvailable() {
        // Check if API key is configured
        if (!this.apiKey || this.apiKey.trim() === '') {
            return false;
        }
        try {
            // Perform a lightweight health check
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(`${this.baseUrl}/v1/health`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response.ok;
        }
        catch (error) {
            // Service is unavailable
            return false;
        }
    }
}
//# sourceMappingURL=custom-provider-example.js.map