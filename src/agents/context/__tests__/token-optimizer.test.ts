import { expect } from 'chai';
import { TokenOptimizer } from '../token-optimizer.js';
import { LLMProviderManager } from '../../../llm/provider-manager.js';
import { OpenAIProvider } from '../../../llm/providers/openai-provider.js';

describe('TokenOptimizer', () => {
    let tokenOptimizer: TokenOptimizer;

    beforeEach(() => {
        const llmManager = LLMProviderManager.getInstance();
        llmManager.registerProvider('openai', new OpenAIProvider());
        tokenOptimizer = new TokenOptimizer(llmManager);
    });

    describe('estimateTokens', () => {
        it('should estimate tokens for simple text', async () => {
            const text = 'Hello world';
            const tokens = await tokenOptimizer.estimateTokens(text);
            expect(tokens).to.be.a('number');
            expect(tokens).to.be.greaterThan(0);
        });

        it('should estimate tokens accurately', async () => {
            const text = 'This is a test sentence for token estimation.';
            const tokens = await tokenOptimizer.estimateTokens(text);
            // tiktoken would give exact count, but for test, just check it's reasonable
            expect(tokens).to.be.within(5, 20);
        });
    });

    describe('optimizeFiles', () => {
        it('should optimize files within token limit', async () => {
            const files = [
                { path: 'file1.ts', content: 'function test() { return true; }' },
                { path: 'file2.ts', content: 'const x = 1;' }
            ];
            const result = await tokenOptimizer.optimizeFiles(files);
            expect(result.content).to.be.a('string');
            expect(result.truncatedCount).to.be.a('number');
        });
    });
});