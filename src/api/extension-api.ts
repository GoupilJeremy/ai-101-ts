import { ILLMProvider } from '../llm/provider.interface.js';
import { AI101Events, Unsubscribe } from './events.js';
import { IAI101Config, ConfigurationScope } from './configuration-types.js';


/**
 * Public API exposed by the AI-101 extension to other extensions.
 * 
 * @public
 * @remarks
 * This interface follows semantic versioning. Breaking changes require a major version bump.
 * 
 * **Usage Example:**
 * ```typescript
 * // In another extension's activate() function:
 * const ai101Extension = vscode.extensions.getExtension('your-publisher.ai-101-ts');
 * if (ai101Extension) {
 *   const api: IAI101API = ai101Extension.exports;
 *   
 *   // Register your custom provider
 *   api.registerLLMProvider('my-company-llm', myProviderInstance);
 * }
 * ```
 * 
 * @since 0.0.1
 */
export interface IAI101API {
    /**
     * The current version of the AI-101 API.
     * Follows Semantic Versioning (Major.Minor.Patch).
     * 
     * @example "1.2.3"
     * @since 0.0.1
     */
    readonly apiVersion: string;

    /**
     * Checks if the current API version satisfies the required version range.
     * 
     * @param requiredVersion - A semver range (e.g., "^1.0.0", ">=1.2.0")
     * @returns True if the current version satisfies the range, false otherwise
     * 
     * @remarks
     * Extensions should use this to guard against breaking changes or ensure
     * required features are available in the installed version of AI-101.
     * 
     * @example
     * ```typescript
     * if (!api.checkCompatibility('^1.0.0')) {
     *   vscode.window.showErrorMessage('This extension requires AI-101 version 1.x.x');
     *   return;
     * }
     * ```
     * 
     * @since 0.0.1
     */
    checkCompatibility(requiredVersion: string): boolean;

    /**
     * Registers a custom LLM provider with the AI-101 extension.
     * 
     * @param name - Unique identifier for the provider (lowercase, URL-safe)
     * @param provider - Implementation of the ILLMProvider interface
     * 
     * @throws {Error} When a provider with the same name already exists
     * @throws {Error} When the provider implementation is invalid
     * 
     * @remarks
     * Once registered, the provider becomes immediately available for use by agents.
     * The provider name must be unique across all registered providers.
     * 
     * **Validation:**
     * - Name must be a non-empty string
     * - Provider must implement all required ILLMProvider methods
     * - Name cannot conflict with built-in providers (openai, anthropic)
     * 
     * @example
     * ```typescript
     * class MyCustomProvider implements ILLMProvider {
     *   readonly name = 'my-custom-provider';
     *   // ... implement required methods
     * }
     * 
     * api.registerLLMProvider('my-custom-provider', new MyCustomProvider());
     * ```
     * 
     * @since 0.0.1
     */
    registerLLMProvider(name: string, provider: ILLMProvider): void;

    /**
     * Subscribes to AI-101 lifecycle events.
     * 
     * @param event - The name of the event to subscribe to
     * @param callback - Function called when the event occurs
     * @returns An unsubscribe function to stop receiving events
     * 
     * @remarks
     * Supported events include agent activation, state changes, and suggestion lifecycle.
     * Multiple subscribers can listen to the same event.
     * 
     * @example
     * ```typescript
     * const unsubscribe = api.on('suggestionAccepted', (event) => {
     *   console.log(`User accepted suggestion ${event.id} from ${event.agent}`);
     * });
     * 
     * // Later, to stop listening:
     * unsubscribe();
     * ```
     * 
     * @since 0.0.1
     */
    on<K extends keyof AI101Events>(event: K, callback: (payload: AI101Events[K]) => void): Unsubscribe;

    /**
     * Gets the value of an AI-101 configuration setting.
     * 
     * @param key - The configuration key (e.g., 'ui.mode')
     * @returns The current value of the configuration setting
     * 
     * @since 0.0.1
     */
    getConfig<K extends keyof IAI101Config>(key: K): IAI101Config[K];

    /**
     * Sets the value of an AI-101 configuration setting.
     * 
     * @param key - The configuration key (e.g., 'ui.mode')
     * @param value - The new value to set
     * @param scope - The configuration scope (default: 'user')
     * @returns A promise that resolves when the update is complete
     * 
     * @throws {Error} If the value is invalid for the specified key
     * 
     * @since 0.0.1
     */
    setConfig<K extends keyof IAI101Config>(key: K, value: IAI101Config[K], scope?: ConfigurationScope): Promise<void>;

    /**
     * Updates multiple AI-101 configuration settings simultaneously.
     * 
     * @param config - A partial configuration object containing keys to update
     * @param scope - The configuration scope (default: 'user')
     * @returns A promise that resolves when all updates are complete
     * 
     * @throws {Error} If any value is invalid
     * 
     * @since 0.0.1
     */
    updateConfig(config: Partial<IAI101Config>, scope?: ConfigurationScope): Promise<void>;

}
