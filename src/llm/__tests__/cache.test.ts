import { describe, test, suite, beforeEach, afterEach, vi } from 'vitest';
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { HybridLLMCache } from '../cache.js';
import { ILLMResponse } from '../provider.interface.js';

suite('HybridLLMCache Test Suite', () => {
    let cache: HybridLLMCache;
    let tempDir: string;

    beforeEach(async () => {
        tempDir = path.join(os.tmpdir(), `ai101-cache-test-${Date.now()}`);
        cache = await HybridLLMCache.create(tempDir);
    });

    afterEach(async () => {
        if (fs.existsSync(tempDir)) {
            await fs.promises.rm(tempDir, { recursive: true, force: true });
        }
    });

    const mockResponse: ILLMResponse = {
        text: 'Hello from cache',
        tokens: { prompt: 5, completion: 5, total: 10 },
        model: 'test-model',
        finishReason: 'stop',
        cost: 0.001
    };

    test('generateKey should return a consistent hash', () => {
        const key1 = cache.generateKey('coder', 'Hello world');
        const key2 = cache.generateKey('coder', 'Hello world');
        const key3 = cache.generateKey('architect', 'Hello world');

        assert.strictEqual(key1, key2);
        assert.notStrictEqual(key1, key3);
        assert.strictEqual(typeof key1, 'string');
        assert.strictEqual(key1.length, 64); // SHA-256 hex
    });

    test('set and get (L1 hit)', async () => {
        const key = cache.generateKey('coder', 'Test prompt');
        await cache.set(key, 'coder', mockResponse);

        const result = await cache.get(key);
        assert.notStrictEqual(result, null);
        assert.strictEqual(result?.text, mockResponse.text);

        const stats = cache.getStats();
        assert.strictEqual(stats.hits, 1);
    });

    test('get (L2 hit)', async () => {
        const key = cache.generateKey('coder', 'L2 prompt');
        await cache.set(key, 'coder', mockResponse);

        // Clear L1 to force L2 check
        (cache as any).l1Cache.clear();
        assert.strictEqual((cache as any).l1Cache.size, 0);

        const result = await cache.get(key);
        assert.notStrictEqual(result, null);
        assert.strictEqual(result?.text, mockResponse.text);

        // Should have re-populated L1
        assert.strictEqual((cache as any).l1Cache.size, 1);
    });

    test('get (Miss)', async () => {
        const result = await cache.get('non-existent');
        assert.strictEqual(result, null);

        const stats = cache.getStats();
        assert.strictEqual(stats.misses, 1);
    });

    test('Cache expiration', async () => {
        const key = cache.generateKey('coder', 'Expired prompt');
        await cache.set(key, 'coder', mockResponse);

        // Manually manipulate timestamp in L1
        const entry = (cache as any).l1Cache.get(key);
        entry.timestamp = Date.now() - (8 * 24 * 60 * 60 * 1000); // 8 days ago

        // Also ensure L2 is deleted or expired. For this test, deleting is simpler to verify L1 logic.
        (cache as any).deleteFromL2(key);

        const result = await cache.get(key);
        assert.strictEqual(result, null); // Should be expired in L1 and missing in L2
        assert.strictEqual((cache as any).l1Cache.has(key), false);
    });

    test('L1 Max Entries (LRU)', async () => {
        const max = (cache as any).l1MaxEntries;
        for (let i = 0; i < max + 10; i++) {
            const key = `key-${i}`;
            await cache.set(key, 'coder', mockResponse);
        }

        assert.strictEqual((cache as any).l1Cache.size, max);
        // First key should have been evicted from L1 (but still in L2)
        assert.strictEqual((cache as any).l1Cache.has('key-0'), false);

        const result = await cache.get('key-0'); // Should hit L2 and re-enter L1
        assert.notStrictEqual(result, null);
    });

    test('Stats tracking hit rate and cost saved', async () => {
        const key = cache.generateKey('coder', 'Stats test');
        await cache.set(key, 'coder', mockResponse);

        await cache.get(key); // Hit
        await cache.get(key); // Hit
        await cache.get('non-existent'); // Miss

        const stats = cache.getStats();
        assert.strictEqual(stats.hits, 2);
        assert.strictEqual(stats.misses, 1);
        assert.strictEqual(stats.hitRate, 2 / 3);
        assert.strictEqual(stats.costSaved, mockResponse.cost * 2);
    });
});
