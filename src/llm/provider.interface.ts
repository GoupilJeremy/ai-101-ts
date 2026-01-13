/**
 * Interface for model information.
 */
export interface IModelInfo {
    /** The model ID (e.g., 'gpt-4') */
    id: string;
    /** The display name for the model */
    name: string;
    /** The maximum context window in tokens */
    contextWindow: number;
}

/**
 * Options for LLM completion requests.
 */
export interface ILLMOptions {
    /** The model to use */
    model?: string;
    /** Sampling temperature (0-2) */
    temperature?: number;
    /** Maximum number of tokens to generate */
    maxTokens?: number;
    /** Request timeout in milliseconds */
    timeout?: number;
}

/**
 * Response format for LLM completion requests.
 */
export interface ILLMResponse {
    /** The generated text content */
    text: string;
    /** Token usage statistics */
    tokens: {
        prompt: number;
        completion: number;
        total: number;
    };
    /** The model that generated the response */
    model: string;
    /** The reason why generation finished (e.g., 'stop', 'length') */
    finishReason: string;
    /** Estimated cost of the request in USD */
    cost: number;
}

/**
 * Common interface for all LLM providers (Adapter Pattern).
 */
export interface ILLMProvider {
    /** The provider name (e.g., 'openai') */
    readonly name: string;

    /**
     * Generates a completion for the given prompt.
     * @param prompt The input prompt.
     * @param options Request options.
     */
    generateCompletion(prompt: string, options?: ILLMOptions): Promise<ILLMResponse>;

    /**
     * Estimates the number of tokens in the given text.
     * @param text The input text.
     */
    estimateTokens(text: string): number;

    /**
     * Returns information about a specific model supported by this provider.
     * @param model The model ID.
     */
    getModelInfo(model: string): IModelInfo;

    /**
     * Checks if the provider is currently available (e.g., API key exists, network reachable).
     */
    isAvailable(): Promise<boolean>;
}
