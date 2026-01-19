import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { ILLMResponse } from './provider.interface.js';

interface ICacheEntry {
    response: ILLMResponse;
    timestamp: number;
    agent: string;
}

export interface ICacheStats {
    hits: number;
    misses: number;
    hitRate: number;
    costSaved: number;
}

/**
 * Two-tier cache for LLM responses (L1 Memory + L2 File System).
 */
export class HybridLLMCache {
    private l1Cache: Map<string, ICacheEntry> = new Map();
    private readonly l1MaxEntries = 100;
    private readonly ttl = 7 * 24 * 60 * 60 * 1000; // 7 days
    private cacheDir: string;

    private stats: ICacheStats = {
        hits: 0,
        misses: 0,
        hitRate: 0,
        costSaved: 0
    };

    constructor(storagePath: string) {
        this.cacheDir = path.join(storagePath, '.cache');
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
    }

    /**
     * Generates a unique cache key based on agent, prompt, and optional context snippet.
     */
    public generateKey(agent: string, prompt: string, context?: string): string {
        const contextSnippet = context ? context.substring(0, 100) : '';
        const rawKey = `${agent}:${prompt}:${contextSnippet}`;
        return crypto.createHash('sha256').update(rawKey).digest('hex');
    }

    /**
     * Retrieves an entry from cache, checking L1 then L2.
     */
    public async get(key: string): Promise<ILLMResponse | null> {
        // L1 check
        let entry: ICacheEntry | null | undefined = this.l1Cache.get(key);
        if (entry) {
            if (this.isExpired(entry)) {
                this.l1Cache.delete(key);
            } else {
                this.updateStats(true, entry.response.cost);
                return entry.response;
            }
        }

        // L2 check
        entry = this.readFromL2(key);
        if (entry) {
            if (this.isExpired(entry)) {
                this.deleteFromL2(key);
            } else {
                // Feed L1
                this.addToL1(key, entry);
                this.updateStats(true, entry.response.cost);
                return entry.response;
            }
        }

        this.updateStats(false, 0);
        return null;
    }

    /**
     * Stores an entry in both L1 and L2 caches.
     */
    public async set(key: string, agent: string, response: ILLMResponse): Promise<void> {
        const entry: ICacheEntry = {
            response,
            timestamp: Date.now(),
            agent
        };

        this.addToL1(key, entry);
        this.writeToL2(key, entry);
    }

    public getStats(): ICacheStats {
        return { ...this.stats };
    }

    private isExpired(entry: ICacheEntry): boolean {
        return Date.now() - entry.timestamp > this.ttl;
    }

    private addToL1(key: string, entry: ICacheEntry): void {
        // Simple LRU: if full, delete first key (oldest inserted)
        if (this.l1Cache.size >= this.l1MaxEntries) {
            const firstKey = this.l1Cache.keys().next().value;
            if (firstKey) {this.l1Cache.delete(firstKey);}
        }
        this.l1Cache.set(key, entry);
    }

    private writeToL2(key: string, entry: ICacheEntry): void {
        try {
            const filePath = path.join(this.cacheDir, `${key}.json`);
            fs.writeFileSync(filePath, JSON.stringify(entry), 'utf8');
        } catch (error) {
            console.error('Failed to write to L2 cache:', error);
        }
    }

    private readFromL2(key: string): ICacheEntry | null {
        try {
            const filePath = path.join(this.cacheDir, `${key}.json`);
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Failed to read from L2 cache:', error);
        }
        return null;
    }

    private deleteFromL2(key: string): void {
        try {
            const filePath = path.join(this.cacheDir, `${key}.json`);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.error('Failed to delete from L2 cache:', error);
        }
    }

    private updateStats(hit: boolean, costSaved: number): void {
        if (hit) {
            this.stats.hits++;
            this.stats.costSaved += costSaved;
        } else {
            this.stats.misses++;
        }

        const total = this.stats.hits + this.stats.misses;
        this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
    }
}
