import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ILLMProvider, ILLMResponse, ILLMOptions, IModelInfo } from '../../llm/provider.interface.js';
import { IAI101API } from '../extension-api.js';

describe('Extension API Interface', () => {
    describe('IAI101API Interface Contract', () => {
        it('should define registerLLMProvider method signature', () => {
            // This test validates that the interface exists and has the correct shape
            // We'll create a mock implementation to verify the contract
            const mockAPI: IAI101API = {
                registerLLMProvider: vi.fn()
            };

            expect(mockAPI).toHaveProperty('registerLLMProvider');
            expect(typeof mockAPI.registerLLMProvider).toBe('function');
        });

        it('should accept valid ILLMProvider implementation', () => {
            const mockProvider: ILLMProvider = {
                name: 'test-provider',
                generateCompletion: vi.fn(),
                estimateTokens: vi.fn(),
                getModelInfo: vi.fn(),
                isAvailable: vi.fn()
            };

            const mockAPI: IAI101API = {
                registerLLMProvider: vi.fn()
            };

            // Should not throw when called with valid provider
            expect(() => {
                mockAPI.registerLLMProvider('test-provider', mockProvider);
            }).not.toThrow();

            expect(mockAPI.registerLLMProvider).toHaveBeenCalledWith('test-provider', mockProvider);
        });

        it('should accept provider name as string', () => {
            const mockProvider: ILLMProvider = {
                name: 'test-provider',
                generateCompletion: vi.fn(),
                estimateTokens: vi.fn(),
                getModelInfo: vi.fn(),
                isAvailable: vi.fn()
            };

            const mockAPI: IAI101API = {
                registerLLMProvider: vi.fn()
            };

            mockAPI.registerLLMProvider('my-custom-llm', mockProvider);

            expect(mockAPI.registerLLMProvider).toHaveBeenCalledWith('my-custom-llm', mockProvider);
        });
    });

    describe('Type Exports', () => {
        it('should export ILLMProvider interface', () => {
            // This test ensures that ILLMProvider is properly exported from the API module
            // so that extension consumers can implement it
            const mockProvider: ILLMProvider = {
                name: 'test',
                generateCompletion: async (prompt: string, options?: ILLMOptions): Promise<ILLMResponse> => {
                    return {
                        text: 'test response',
                        tokens: { prompt: 10, completion: 20, total: 30 },
                        model: 'test-model',
                        finishReason: 'stop',
                        cost: 0.001
                    };
                },
                estimateTokens: async (text: string): Promise<number> => {
                    return text.length;
                },
                getModelInfo: (model: string): IModelInfo => {
                    return {
                        id: model,
                        name: 'Test Model',
                        contextWindow: 4096
                    };
                },
                isAvailable: async (): Promise<boolean> => {
                    return true;
                }
            };

            expect(mockProvider.name).toBe('test');
            expect(typeof mockProvider.generateCompletion).toBe('function');
            expect(typeof mockProvider.estimateTokens).toBe('function');
            expect(typeof mockProvider.getModelInfo).toBe('function');
            expect(typeof mockProvider.isAvailable).toBe('function');
        });
    });
});
