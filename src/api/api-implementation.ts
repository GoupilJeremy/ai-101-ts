import { IAI101API } from './extension-api.js';
import { ILLMProvider } from '../llm/provider.interface.js';
import { LLMProviderManager } from '../llm/provider-manager.js';
import { AI101Events, Unsubscribe } from './events.js';
import { LifecycleEventManager } from './lifecycle-event-manager.js';


/**
 * Creates the public API implementation for the AI-101 extension.
 * 
 * @param providerManager - The LLM provider manager singleton instance
 * @returns The API object to be exported from activate()
 * 
 * @internal
 */
export function createAPI(providerManager: LLMProviderManager): IAI101API {
    return {
        registerLLMProvider(name: string, provider: ILLMProvider): void {
            // Validation: Name must be non-empty
            if (!name || name.trim() === '') {
                throw new Error('Provider name cannot be empty');
            }

            // Validation: Provider cannot be null or undefined
            if (!provider) {
                throw new Error('Provider cannot be null or undefined');
            }

            // Validation: Provider must implement all required methods
            if (!provider.generateCompletion || typeof provider.generateCompletion !== 'function') {
                throw new Error('Provider must implement generateCompletion method');
            }
            if (!provider.estimateTokens || typeof provider.estimateTokens !== 'function') {
                throw new Error('Provider must implement estimateTokens method');
            }
            if (!provider.getModelInfo || typeof provider.getModelInfo !== 'function') {
                throw new Error('Provider must implement getModelInfo method');
            }
            if (!provider.isAvailable || typeof provider.isAvailable !== 'function') {
                throw new Error('Provider must implement isAvailable method');
            }

            // Validation: Check for reserved names (optional - can be added later)
            const reservedNames = ['openai', 'anthropic'];
            if (reservedNames.includes(name.toLowerCase())) {
                throw new Error(`Provider name '${name}' is reserved and cannot be used`);
            }

            // Check if provider already exists
            const existingProvider = providerManager.getProvider(name);
            if (existingProvider) {
                throw new Error(`Provider with name '${name}' is already registered`);
            }

            // Delegate to LLMProviderManager
            providerManager.registerProvider(name, provider);
        },

        on<K extends keyof AI101Events>(event: K, callback: (payload: AI101Events[K]) => void): Unsubscribe {
            return LifecycleEventManager.getInstance().on(event, callback);
        }
    };
}

