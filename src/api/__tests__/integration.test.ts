import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IAI101API } from '../extension-api.js';
import { ILLMProvider, ILLMResponse, ILLMOptions, IModelInfo } from '../../llm/provider.interface.js';
import { createAPI } from '../api-implementation.js';
import { LLMProviderManager } from '../../llm/provider-manager.js';

/**
 * Integration tests simulating a second extension consuming the AI-101 API.
 * 
 * This demonstrates the real-world usage pattern where another VSCode extension
 * would call vscode.extensions.getExtension('publisher.ai-101-ts').exports
 * to get the API and register a custom provider.
 */
describe('Extension API Integration', () => {
    let api: IAI101API;
    let providerManager: LLMProviderManager;

    beforeEach(() => {
        // Simulate what happens when another extension activates AI-101
        providerManager = LLMProviderManager.getInstance();
        api = createAPI(providerManager);
    });

    describe('Real-world usage scenario', () => {
        it('should allow external extension to register custom provider', () => {
            // Simulate a custom provider from another extension
            class CompanyInternalLLM implements ILLMProvider {
                readonly name = 'company-internal-llm';

                async generateCompletion(prompt: string, options?: ILLMOptions): Promise<ILLMResponse> {
                    return {
                        text: `Internal LLM response to: ${prompt}`,
                        tokens: { prompt: 10, completion: 50, total: 60 },
                        model: 'company-model-v1',
                        finishReason: 'stop',
                        cost: 0
                    };
                }

                async estimateTokens(text: string): Promise<number> {
                    return Math.ceil(text.length / 4);
                }

                getModelInfo(model: string): IModelInfo {
                    return {
                        id: model,
                        name: 'Company Internal Model',
                        contextWindow: 8192
                    };
                }

                async isAvailable(): Promise<boolean> {
                    return true;
                }
            }

            const customProvider = new CompanyInternalLLM();

            // Register the provider through the public API
            api.registerLLMProvider('company-internal-llm', customProvider);

            // Verify it's available in the manager
            const registered = providerManager.getProvider('company-internal-llm');
            expect(registered).toBeDefined();
            expect(registered?.name).toBe('company-internal-llm');
        });

        it('should allow multiple external extensions to register different providers', () => {
            // Extension 1: Company A's LLM
            class CompanyAProvider implements ILLMProvider {
                readonly name = 'company-a-llm';
                async generateCompletion(): Promise<ILLMResponse> {
                    return {
                        text: 'Company A response',
                        tokens: { prompt: 5, completion: 10, total: 15 },
                        model: 'company-a-model',
                        finishReason: 'stop',
                        cost: 0
                    };
                }
                async estimateTokens(text: string): Promise<number> { return text.length; }
                getModelInfo(): IModelInfo {
                    return { id: 'company-a-model', name: 'Company A', contextWindow: 4096 };
                }
                async isAvailable(): Promise<boolean> { return true; }
            }

            // Extension 2: Company B's LLM
            class CompanyBProvider implements ILLMProvider {
                readonly name = 'company-b-llm';
                async generateCompletion(): Promise<ILLMResponse> {
                    return {
                        text: 'Company B response',
                        tokens: { prompt: 5, completion: 10, total: 15 },
                        model: 'company-b-model',
                        finishReason: 'stop',
                        cost: 0
                    };
                }
                async estimateTokens(text: string): Promise<number> { return text.length; }
                getModelInfo(): IModelInfo {
                    return { id: 'company-b-model', name: 'Company B', contextWindow: 4096 };
                }
                async isAvailable(): Promise<boolean> { return true; }
            }

            // Both extensions register their providers
            api.registerLLMProvider('company-a-llm', new CompanyAProvider());
            api.registerLLMProvider('company-b-llm', new CompanyBProvider());

            // Verify both are available
            const providerA = providerManager.getProvider('company-a-llm');
            const providerB = providerManager.getProvider('company-b-llm');

            expect(providerA).toBeDefined();
            expect(providerB).toBeDefined();
            expect(providerA?.name).toBe('company-a-llm');
            expect(providerB?.name).toBe('company-b-llm');
        });

        it('should prevent duplicate registration', () => {
            class TestProvider implements ILLMProvider {
                readonly name = 'test-provider';
                async generateCompletion(): Promise<ILLMResponse> {
                    return {
                        text: 'test',
                        tokens: { prompt: 1, completion: 1, total: 2 },
                        model: 'test',
                        finishReason: 'stop',
                        cost: 0
                    };
                }
                async estimateTokens(text: string): Promise<number> { return text.length; }
                getModelInfo(): IModelInfo {
                    return { id: 'test', name: 'Test', contextWindow: 4096 };
                }
                async isAvailable(): Promise<boolean> { return true; }
            }

            // First registration should succeed
            api.registerLLMProvider('duplicate-test', new TestProvider());

            // Second registration with same name should fail
            expect(() => {
                api.registerLLMProvider('duplicate-test', new TestProvider());
            }).toThrow('Provider with name \'duplicate-test\' is already registered');
        });

        it('should prevent registration of reserved provider names', () => {
            class CustomProvider implements ILLMProvider {
                readonly name = 'custom';
                async generateCompletion(): Promise<ILLMResponse> {
                    return {
                        text: 'test',
                        tokens: { prompt: 1, completion: 1, total: 2 },
                        model: 'test',
                        finishReason: 'stop',
                        cost: 0
                    };
                }
                async estimateTokens(text: string): Promise<number> { return text.length; }
                getModelInfo(): IModelInfo {
                    return { id: 'test', name: 'Test', contextWindow: 4096 };
                }
                async isAvailable(): Promise<boolean> { return true; }
            }

            // Attempting to register with reserved names should fail
            expect(() => {
                api.registerLLMProvider('openai', new CustomProvider());
            }).toThrow('Provider name \'openai\' is reserved');

            expect(() => {
                api.registerLLMProvider('anthropic', new CustomProvider());
            }).toThrow('Provider name \'anthropic\' is reserved');
        });
    });

    describe('Error handling for external extensions', () => {
        it('should provide clear error when provider is invalid', () => {
            const invalidProvider = {
                name: 'invalid',
                // Missing required methods
            } as any;

            expect(() => {
                api.registerLLMProvider('invalid', invalidProvider);
            }).toThrow('Provider must implement');
        });

        it('should provide clear error when name is empty', () => {
            const validProvider: ILLMProvider = {
                name: 'valid',
                async generateCompletion(): Promise<ILLMResponse> {
                    return {
                        text: 'test',
                        tokens: { prompt: 1, completion: 1, total: 2 },
                        model: 'test',
                        finishReason: 'stop',
                        cost: 0
                    };
                },
                async estimateTokens(text: string): Promise<number> { return text.length; },
                getModelInfo(): IModelInfo {
                    return { id: 'test', name: 'Test', contextWindow: 4096 };
                },
                async isAvailable(): Promise<boolean> { return true; }
            };

            expect(() => {
                api.registerLLMProvider('', validProvider);
            }).toThrow('Provider name cannot be empty');

            expect(() => {
                api.registerLLMProvider('   ', validProvider);
            }).toThrow('Provider name cannot be empty');
        });
    });
});
