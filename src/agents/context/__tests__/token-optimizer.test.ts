import * as assert from 'assert';
import { TokenOptimizer } from '../token-optimizer.js';

suite('TokenOptimizer Test Suite', () => {
    let optimizer: TokenOptimizer;

    setup(() => {
        optimizer = new TokenOptimizer();
    });

    test('Should estimate tokens for text', async () => {
        const text = 'Hello world';
        const tokens = await optimizer.estimateTokens(text);

        assert.ok(typeof tokens === 'number');
        assert.ok(tokens > 0);
    });

    test('Should optimize files within token limit', async () => {
        const files = [
            { path: '/test/file1.ts', content: 'function test() { return true; }' },
            { path: '/test/file2.ts', content: 'const x = 42;' }
        ];

        const result = await optimizer.optimizeFiles(files, 100);

        assert.ok(result.length > 0);
        assert.ok(result.includes('--- FILE:'));
        assert.ok(result.includes('function test'));
        assert.ok(result.includes('const x = 42'));
    });

    test('Should truncate files when over limit', async () => {
        const largeContent = 'x'.repeat(10000); // Very large content
        const files = [
            { path: '/test/large.ts', content: largeContent }
        ];

        const result = await optimizer.optimizeFiles(files, 50);

        assert.ok(result.length > 0);
        assert.ok(result.includes('truncated'));
        assert.ok(result.length < largeContent.length);
    });

    test('Should prioritize current file', async () => {
        const files = [
            { path: '/test/other.ts', content: 'const other = 1;' },
            { path: '/test/current.ts', content: 'const current = 2;' }
        ];

        const result = await optimizer.optimizeFiles(files, 100);

        // Current file should appear first in the output
        const currentIndex = result.indexOf('/test/current.ts');
        const otherIndex = result.indexOf('/test/other.ts');

        assert.ok(currentIndex < otherIndex);
    });

    test('Should preserve important code structures when truncating', async () => {
        const content = `
        // Some comments
        import { something } from 'module';
        export class MyClass {
            constructor() {}
            method() { return 'test'; }
        }
        // More code here
        `.repeat(100); // Make it large

        const files = [{ path: '/test/class.ts', content }];
        const result = await optimizer.optimizeFiles(files, 100);

        // Should preserve exports and imports
        assert.ok(result.includes('export class') || result.includes('import'));
    });

    test('Should validate token limits', async () => {
        const shortText = 'Hello';
        const longText = 'x'.repeat(10000);

        const shortValid = await optimizer.validateTokenLimit(shortText, 10);
        const longValid = await optimizer.validateTokenLimit(longText, 10);

        assert.strictEqual(shortValid, true);
        assert.strictEqual(longValid, false);
    });

    test('Should handle empty file list', async () => {
        const result = await optimizer.optimizeFiles([], 100);

        assert.strictEqual(result, '');
    });
});