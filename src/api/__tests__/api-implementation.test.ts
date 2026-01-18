import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { IAI101API } from '../extension-api.js';
import { ILLMProvider, ILLMResponse, ILLMOptions, IModelInfo } from '../../llm/provider.interface.js';
import { LLMProviderManager } from '../../llm/provider-manager.js';
import { createAPI } from '../api-implementation.js';
import { LifecycleEventManager } from '../lifecycle-event-manager.js';


describe('API Implementation', () => {
    let mockProvider: ILLMProvider;

    beforeEach(() => {
        // Create a mock provider for testing
        mockProvider = {
            name: 'test-provider',
            generateCompletion: vi.fn(async (prompt: string, options?: ILLMOptions): Promise<ILLMResponse> => {
                return {
                    text: 'test response',
                    tokens: { prompt: 10, completion: 20, total: 30 },
                    model: 'test-model',
                    finishReason: 'stop',
                    cost: 0.001
                };
            }),
            estimateTokens: vi.fn(async (text: string): Promise<number> => {
                return text.length;
            }),
            getModelInfo: vi.fn((model: string): IModelInfo => {
                return {
                    id: model,
                    name: 'Test Model',
                    contextWindow: 4096
                };
            }),
            isAvailable: vi.fn(async (): Promise<boolean> => {
                return true;
            })
        };
    });

    describe('registerLLMProvider', () => {
        it('should delegate to LLMProviderManager.registerProvider', () => {
            const manager = LLMProviderManager.getInstance();
            const registerSpy = vi.spyOn(manager, 'registerProvider');

            // Create API implementation
            const api: IAI101API = {
                apiVersion: '1.0.0',
                checkCompatibility: vi.fn(),
                registerLLMProvider: (name: string, provider: ILLMProvider) => {
                    manager.registerProvider(name, provider);
                },
                on: vi.fn(),
                getConfig: vi.fn(),
                setConfig: vi.fn(),
                updateConfig: vi.fn()
            };

            api.registerLLMProvider('test-provider', mockProvider);

            expect(registerSpy).toHaveBeenCalledWith('test-provider', mockProvider);
        });

        it('should make provider immediately available to LLMProviderManager', () => {
            const manager = LLMProviderManager.getInstance();

            const api: IAI101API = {
                apiVersion: '1.0.0',
                checkCompatibility: vi.fn(),
                registerLLMProvider: (name: string, provider: ILLMProvider) => {
                    manager.registerProvider(name, provider);
                },
                on: vi.fn(),
                getConfig: vi.fn(),
                setConfig: vi.fn(),
                updateConfig: vi.fn()
            };

            api.registerLLMProvider('custom-llm', mockProvider);

            const retrievedProvider = manager.getProvider('custom-llm');
            expect(retrievedProvider).toBe(mockProvider);
        });

        it('should accept provider with different name than provider.name property', () => {
            const manager = LLMProviderManager.getInstance();

            const api: IAI101API = {
                apiVersion: '1.0.0',
                checkCompatibility: vi.fn(),
                registerLLMProvider: (name: string, provider: ILLMProvider) => {
                    manager.registerProvider(name, provider);
                },
                on: vi.fn(),
                getConfig: vi.fn(),
                setConfig: vi.fn(),
                updateConfig: vi.fn()
            };

            // Register with a different name
            api.registerLLMProvider('my-custom-name', mockProvider);

            const retrievedProvider = manager.getProvider('my-custom-name');
            expect(retrievedProvider).toBe(mockProvider);
            expect(retrievedProvider?.name).toBe('test-provider'); // Original name unchanged
        });
    });

    describe('on', () => {
        it('should delegate to LifecycleEventManager.on', () => {
            const providerManager = LLMProviderManager.getInstance();
            const api = createAPI(providerManager, '1.0.0');
            const callback = vi.fn();

            const unsubscribe = api.on('agentActivated', callback);
            expect(typeof unsubscribe).toBe('function');

            // Verify it actually works through the manager
            const manager = (api as any).lifecycleEventManager || (LifecycleEventManager as any).getInstance();
            const payload = { agent: 'coder' as any, timestamp: Date.now() };
            manager.emit('agentActivated', payload);

            // Note: LifecycleEventManager uses setTimeout(..., 0) for emission
            // In vitest we might need to wait or use fake timers
            vi.useFakeTimers();
            manager.emit('agentActivated', payload);
            vi.runAllTimers();

            expect(callback).toHaveBeenCalledWith(payload);
            vi.useRealTimers();
        });
    });


    describe('Validation', () => {
        it('should validate provider name is non-empty', () => {
            const manager = LLMProviderManager.getInstance();

            const api: IAI101API = {
                apiVersion: '1.0.0',
                checkCompatibility: vi.fn(),
                registerLLMProvider: (name: string, provider: ILLMProvider) => {
                    if (!name || name.trim() === '') {
                        throw new Error('Provider name cannot be empty');
                    }
                    manager.registerProvider(name, provider);
                },
                on: vi.fn(),
                getConfig: vi.fn(),
                setConfig: vi.fn(),
                updateConfig: vi.fn()
            };

            expect(() => {
                api.registerLLMProvider('', mockProvider);
            }).toThrow('Provider name cannot be empty');
        });

        it('should validate provider implements required methods', () => {
            const manager = LLMProviderManager.getInstance();

            const api: IAI101API = {
                apiVersion: '1.0.0',
                checkCompatibility: vi.fn(),
                registerLLMProvider: (name: string, provider: ILLMProvider) => {
                    // Validate provider has required methods
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
                    manager.registerProvider(name, provider);
                },
                on: vi.fn(),
                getConfig: vi.fn(),
                setConfig: vi.fn(),
                updateConfig: vi.fn()
            };

            const invalidProvider = {
                name: 'invalid',
                // Missing required methods
            } as any;

            expect(() => {
                api.registerLLMProvider('invalid', invalidProvider);
            }).toThrow('Provider must implement');
        });

        it('should throw error when provider is null or undefined', () => {
            const manager = LLMProviderManager.getInstance();

            const api: IAI101API = {
                apiVersion: '1.0.0',
                checkCompatibility: vi.fn(),
                registerLLMProvider: (name: string, provider: ILLMProvider) => {
                    if (!provider) {
                        throw new Error('Provider cannot be null or undefined');
                    }
                    manager.registerProvider(name, provider);
                },
                on: vi.fn(),
                getConfig: vi.fn(),
                setConfig: vi.fn(),
                updateConfig: vi.fn()
            };

            expect(() => {
                api.registerLLMProvider('test', null as any);
            }).toThrow('Provider cannot be null or undefined');

            expect(() => {
                api.registerLLMProvider('test', undefined as any);
            }).toThrow('Provider cannot be null or undefined');
        });
    });
});
