import { ILLMProvider, ILLMOptions, ILLMResponse } from './provider.interface.js';
import { ConfigurationManager } from '../config/configuration-manager.js';
import { LLMProviderError } from '../errors/llm-provider-error.js';
import { HybridLLMCache } from './cache.js';
import { RateLimiter } from './rate-limiter.js';
import { BudgetExceededError } from '../errors/budget-exceeded-error.js';

/**
 * Supported agent types in the system.
 */
export type AgentType = 'architect' | 'coder' | 'reviewer' | 'context';

/**
 * Manages LLM providers, handles registration, and orchestrates calls with fallbacks.
 */
export class LLMProviderManager {
    private static instance: LLMProviderManager;
    private providers: Map<string, ILLMProvider> = new Map();
    private cache: HybridLLMCache | undefined;

    private constructor() { }

    /**
     * Gets the singleton instance of LLMProviderManager.
     */
    public static getInstance(): LLMProviderManager {
        if (!LLMProviderManager.instance) {
            LLMProviderManager.instance = new LLMProviderManager();
        }
        return LLMProviderManager.instance;
    }

    /**
     * Initializes the manager with a storage path for the cache.
     * @param storagePath Absolute path where cache data should be stored.
     */
    public initialize(storagePath: string): void {
        this.cache = new HybridLLMCache(storagePath);
    }

    /**
     * Registers a new LLM provider.
     * @param name The unique name of the provider.
     * @param provider The provider implementation.
     */
    public registerProvider(name: string, provider: ILLMProvider): void {
        this.providers.set(name, provider);
    }

    /**
     * Retrieves a registered provider by name.
     * @param name The provider name.
     */
    public getProvider(name: string): ILLMProvider | undefined {
        return this.providers.get(name);
    }

    /**
     * Executes an LLM call using the preferred provider for the given agent.
     * Implements automatic fallback logic and caching.
     * @param agent The agent type triggering the call.
     * @param prompt The input prompt.
     * @param options Request options.
     */
    public async callLLM(agent: AgentType, prompt: string, options: ILLMOptions = {}): Promise<ILLMResponse> {
        // 1. Cache Check
        let cacheKey: string | undefined;
        if (this.cache) {
            // Include model and key options in cache key generation for uniqueness
            const context = JSON.stringify({
                model: options.model,
                temperature: options.temperature,
                maxTokens: options.maxTokens
            });
            cacheKey = this.cache.generateKey(agent, prompt, context);
            const cachedResponse = await this.cache.get(cacheKey);
            if (cachedResponse) {
                console.log(`Cache hit for agent '${agent}'`);
                return cachedResponse;
            }
        }

        // 2. Budget Check (Pre-call)
        try {
            RateLimiter.getInstance().checkBudget();
        } catch (error) {
            if (error instanceof BudgetExceededError) {
                throw error;
            }
            throw error;
        }

        // 3. Provider Selection
        const config = ConfigurationManager.getInstance().getSettings();
        const preferredProviderName = config.llm.agentProviders[agent] || config.llm.provider;

        const provider = this.getProvider(preferredProviderName);
        if (!provider) {
            throw new LLMProviderError(`Preferred provider '${preferredProviderName}' not registered`, 'PROVIDER_NOT_FOUND', false);
        }

        // Check if primary is available
        if (!(await provider.isAvailable())) {
            console.warn(`Primary provider '${preferredProviderName}' is not available, attempting fallback...`);
            const fallbackResponse = await this.callWithFallback(agent, prompt, options, [preferredProviderName]);
            if (this.cache && cacheKey) {
                await this.cache.set(cacheKey, agent, fallbackResponse);
            }
            return fallbackResponse;
        }

        let response: ILLMResponse;
        try {
            response = await provider.generateCompletion(prompt, options);
        } catch (error: any) {
            // Check if it's a transient error that warrants a fallback
            if (error instanceof LLMProviderError && error.isTransient) {
                console.warn(`Primary provider '${preferredProviderName}' failed with transient error: ${error.message}. Attempting fallback...`);
                response = await this.callWithFallback(agent, prompt, options, [preferredProviderName]);
            } else {
                // Non-transient errors (like Auth failures or invalid models) should bubble up
                throw error;
            }
        }

        // 4. Store in Cache and Record Usage
        if (this.cache && cacheKey) {
            await this.cache.set(cacheKey, agent, response);
        }

        RateLimiter.getInstance().recordUsage(response.tokens.total, response.cost);

        return response;
    }

    /**
     * Attempts to call alternative providers in order when the primary choice fails.
     */
    private async callWithFallback(agent: AgentType, prompt: string, options: ILLMOptions, attempted: string[]): Promise<ILLMResponse> {
        const fallbackOrder = ['openai', 'anthropic']; // Preferred fallback order
        const errors: { provider: string; error: string }[] = [];

        for (const providerName of fallbackOrder) {
            // Skip if already attempted
            if (attempted.includes(providerName)) continue;

            const provider = this.getProvider(providerName);
            if (!provider) continue;

            // Check availability before call
            if (!(await provider.isAvailable())) {
                console.log(`Fallback provider '${providerName}' is not available (key missing?)`);
                continue;
            }

            try {
                console.log(`Attempting fallback call to '${providerName}' for agent '${agent}'`);
                return await provider.generateCompletion(prompt, options);
            } catch (error: any) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                errors.push({ provider: providerName, error: errorMessage });
                console.warn(`Fallback to '${providerName}' failed: ${errorMessage}`);

                // If it's not a transient error, we might want to stop, but for fallbacks 
                // we usually want to try the next one anyway.
                attempted.push(providerName);
            }
        }

        throw new LLMProviderError(
            `All configured LLM providers failed for agent '${agent}'. Attempts: ${attempted.join(', ')}. Details: ${JSON.stringify(errors)}`,
            'ALL_PROVIDERS_FAILED',
            false
        );
    }
}
