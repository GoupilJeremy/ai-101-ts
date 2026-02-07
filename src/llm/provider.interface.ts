/**
 * Information about a specific LLM model.
 * 
 * @public
 * @remarks
 * This interface is part of the public API and follows semantic versioning.
 * Breaking changes will require a major version bump.
 * 
 * @since 0.0.1
 */
export interface IModelInfo {
    /**
     * The unique model identifier (e.g., 'gpt-4', 'claude-3-opus-20240229').
     * 
     * @remarks
     * This ID should match the identifier used by the underlying LLM provider's API.
     */
    id: string;

    /**
     * The human-readable display name for the model.
     * 
     * @example
     * ```typescript
     * name: "GPT-4 Turbo"
     * ```
     */
    name: string;

    /**
     * The maximum context window size in tokens.
     * 
     * @remarks
     * This represents the total number of tokens (prompt + completion) that the model can handle.
     * Implementations should account for this limit when constructing prompts.
     */
    contextWindow: number;
}

/**
 * Configuration options for LLM completion requests.
 * 
 * @public
 * @remarks
 * This interface is part of the public API and follows semantic versioning.
 * All properties are optional to allow provider-specific defaults.
 * 
 * @since 0.0.1
 */
export interface ILLMOptions {
    /**
     * The model identifier to use for this request.
     * 
     * @remarks
     * If not specified, the provider should use its default model.
     * The model ID should match one supported by the provider.
     */
    model?: string;

    /**
     * Sampling temperature controlling randomness (typically 0-2).
     * 
     * @remarks
     * - Lower values (e.g., 0.2) make output more focused and deterministic
     * - Higher values (e.g., 1.5) make output more creative and varied
     * - Default value is provider-specific
     * 
     * @defaultValue Provider-specific (typically 0.7-1.0)
     */
    temperature?: number;

    /**
     * Maximum number of tokens to generate in the completion.
     * 
     * @remarks
     * This limits the length of the generated response. The actual response
     * may be shorter if the model decides to stop earlier.
     * 
     * @defaultValue Provider-specific
     */
    maxTokens?: number;

    /**
     * Request timeout in milliseconds.
     * 
     * @remarks
     * If the request takes longer than this timeout, it should be aborted.
     * Implementations should throw an appropriate error on timeout.
     * 
     * @defaultValue Provider-specific (typically 30000-60000ms)
     */
    timeout?: number;
}

/**
 * Response from an LLM completion request.
 * 
 * @public
 * @remarks
 * This interface is part of the public API and follows semantic versioning.
 * Breaking changes will require a major version bump.
 * 
 * @since 0.0.1
 */
export interface ILLMResponse {
    /**
     * The generated text content from the LLM.
     * 
     * @remarks
     * This is the primary output of the completion request.
     */
    text: string;

    /**
     * Token usage statistics for this request.
     * 
     * @remarks
     * Useful for tracking costs and optimizing token usage.
     */
    tokens: {
        /** Number of tokens in the input prompt */
        prompt: number;
        /** Number of tokens in the generated completion */
        completion: number;
        /** Total tokens used (prompt + completion) */
        total: number;
    };

    /**
     * The model that generated this response.
     * 
     * @remarks
     * May differ from the requested model if the provider performed fallback.
     */
    model: string;

    /**
     * The reason why the generation finished.
     * 
     * @remarks
     * Common values include:
     * - 'stop': Natural completion point reached
     * - 'length': Maximum token limit reached
     * - 'content_filter': Content was filtered by safety systems
     * 
     * @example
     * ```typescript
     * if (response.finishReason === 'length') {
     *   console.warn('Response was truncated due to token limit');
     * }
     * ```
     */
    finishReason: string;

    /**
     * Estimated cost of this request in USD.
     * 
     * @remarks
     * Cost calculation should include both prompt and completion tokens
     * based on the provider's pricing model. May be 0 for local models.
     */
    cost: number;
}

/**
 * Common interface for all LLM providers using the Adapter Pattern.
 * 
 * @public
 * @remarks
 * This is the primary extension point for integrating custom LLM providers.
 * 
 * **Semantic Versioning Guarantee:**
 * - This interface follows semantic versioning (semver)
 * - Breaking changes require a major version bump
 * - New optional methods may be added in minor versions
 * - Implementations should handle unknown properties gracefully
 * 
 * **Deprecation Policy:**
 * - Deprecated methods will be marked with @deprecated tag
 * - Deprecated methods will remain functional for at least 2 minor versions
 * - Migration guides will be provided in deprecation notices
 * 
 * **Error Handling:**
 * - Implementations should throw {@link LLMProviderError} for provider-specific errors
 * - Network errors, authentication failures, and rate limits should be wrapped appropriately
 * 
 * @example
 * ```typescript
 * class MyCustomProvider implements ILLMProvider {
 *   readonly name = 'my-custom-provider';
 *   
 *   async generateCompletion(prompt: string, options?: ILLMOptions): Promise<ILLMResponse> {
 *     // Implementation
 *   }
 *   
 *   async estimateTokens(text: string): Promise<number> {
 *     // Implementation
 *   }
 *   
 *   getModelInfo(model: string): IModelInfo {
 *     // Implementation
 *   }
 *   
 *   async isAvailable(): Promise<boolean> {
 *     // Implementation
 *   }
 * }
 * ```
 * 
 * @since 0.0.1
 * @see {@link ILLMOptions} for request configuration
 * @see {@link ILLMResponse} for response format
 * @see {@link IModelInfo} for model information
 */
export interface ILLMProvider {
    /**
     * The unique name of this provider (e.g., 'openai', 'anthropic', 'custom').
     * 
     * @remarks
     * This name is used for provider identification and selection.
     * It should be lowercase and URL-safe (no spaces or special characters).
     * 
     * @example
     * ```typescript
     * readonly name = 'my-custom-llm';
     * ```
     */
    readonly name: string;

    /**
     * Generates a text completion for the given prompt.
     * 
     * @param prompt - The input text prompt to send to the LLM
     * @param options - Optional configuration for the request
     * @returns A promise that resolves to the LLM response
     * 
     * @throws {@link LLMProviderError} When the provider encounters an error
     * @throws {Error} When network or authentication issues occur
     * 
     * @remarks
     * This is the primary method for interacting with the LLM.
     * Implementations should:
     * - Validate the prompt is not empty
     * - Apply rate limiting if necessary
     * - Handle retries for transient failures
     * - Track token usage and costs
     * - Respect timeout settings
     * 
     * @example
     * ```typescript
     * const response = await provider.generateCompletion(
     *   'Explain quantum computing',
     *   { temperature: 0.7, maxTokens: 500 }
     * );
     * console.log(response.text);
     * ```
     */
    generateCompletion(prompt: string, options?: ILLMOptions): Promise<ILLMResponse>;

    /**
     * Estimates the number of tokens in the given text.
     * 
     * @param text - The text to tokenize and count
     * @returns A promise that resolves to the estimated token count
     * 
     * @remarks
     * Token estimation is used for:
     * - Validating prompts fit within context windows
     * - Optimizing token usage and costs
     * - Splitting large inputs into chunks
     * 
     * Implementations should use provider-specific tokenization when possible.
     * For providers without tokenization APIs, use approximations (e.g., word count * 1.3).
     * 
     * @example
     * ```typescript
     * const tokenCount = await provider.estimateTokens('Hello, world!');
     * console.log(`Estimated tokens: ${tokenCount}`);
     * ```
     */
    estimateTokens(text: string): Promise<number>;

    /**
     * Returns information about a specific model supported by this provider.
     * 
     * @param model - The model identifier to query
     * @returns Model information including context window and display name
     * 
     * @throws {Error} When the model is not supported by this provider
     * 
     * @remarks
     * This method should return synchronously as model information is typically static.
     * Implementations should maintain a registry of supported models.
     * 
     * @example
     * ```typescript
     * const modelInfo = provider.getModelInfo('gpt-4');
     * console.log(`Context window: ${modelInfo.contextWindow} tokens`);
     * ```
     */
    getModelInfo(model: string): IModelInfo;

    /**
     * Checks if the provider is currently available and ready to handle requests.
     * 
     * @returns A promise that resolves to true if available, false otherwise
     * 
     * @remarks
     * This method should verify:
     * - API keys or credentials are configured
     * - Network connectivity (if applicable)
     * - Provider service is reachable
     * - Any other prerequisites are met
     * 
     * This method should not throw errors; instead return false for unavailable state.
     * 
     * @example
     * ```typescript
     * if (await provider.isAvailable()) {
     *   const response = await provider.generateCompletion('Hello');
     * } else {
     *   console.error('Provider is not available');
     * }
     * ```
     */
    isAvailable(): Promise<boolean>;
}
