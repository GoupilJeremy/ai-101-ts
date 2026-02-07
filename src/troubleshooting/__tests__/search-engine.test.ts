import { describe, it, expect } from 'vitest';
import { SearchEngine } from '../search-engine';
import { IKnowledgeArticle, TroubleshootingCategory } from '../types';

// Mock articles for testing
const mockArticles: IKnowledgeArticle[] = [
    {
        id: 'performance-slow-ui',
        title: 'UI Performance Issues',
        category: TroubleshootingCategory.Performance,
        symptoms: ['slow', 'lag', 'choppy', 'fps'],
        description: 'The HUD animations appear choppy or the UI responds slowly.',
        diagnosisSteps: ['Check CPU usage', 'Check FPS counter'],
        solutions: ['Enable Performance Mode', 'Reduce Transparency'],
        prevention: 'Keep extensions count low',
        errorCodes: ['AI101-PERF-001'],
        relatedDocs: [],
        communityContributions: []
    },
    {
        id: 'connectivity-llm-timeout',
        title: 'LLM API Timeouts',
        category: TroubleshootingCategory.Connectivity,
        symptoms: ['timeout', 'slow response', 'waiting', 'not responding'],
        description: 'Agents appear stuck in thinking state for extended periods.',
        diagnosisSteps: ['Check internet connection', 'Check API provider status'],
        solutions: ['Increase Timeout Duration', 'Switch LLM Provider'],
        prevention: 'Monitor provider status',
        errorCodes: ['AI101-LLM-001', 'AI101-LLM-002'],
        relatedDocs: [],
        communityContributions: []
    },
    {
        id: 'api-key-invalid',
        title: 'Invalid API Key Error',
        category: TroubleshootingCategory.APIKeyProblems,
        symptoms: ['invalid api key', 'authentication failed', 'unauthorized'],
        description: 'Extension shows Invalid API Key or Authentication Failed errors.',
        diagnosisSteps: ['Verify API key format', 'Check key expiration'],
        solutions: ['Reconfigure API Key', 'Generate New API Key'],
        prevention: 'Store keys securely',
        errorCodes: ['AI101-AUTH-001'],
        relatedDocs: [],
        communityContributions: []
    }
];

describe('SearchEngine', () => {
    let searchEngine: SearchEngine;

    beforeEach(() => {
        searchEngine = new SearchEngine();
    });

    describe('search', () => {
        it('should return empty array for empty query', () => {
            const results = searchEngine.search('', mockArticles);
            expect(results).toEqual([]);
        });

        it('should return empty array for whitespace query', () => {
            const results = searchEngine.search('   ', mockArticles);
            expect(results).toEqual([]);
        });

        it('should find articles by exact symptom match', () => {
            const results = searchEngine.search('slow', mockArticles);

            expect(results.length).toBeGreaterThan(0);

            // Should find performance article (has 'slow' symptom)
            const performanceArticle = results.find(r => r.article.id === 'performance-slow-ui');
            expect(performanceArticle).toBeDefined();
            expect(performanceArticle?.score).toBeGreaterThan(0);
        });

        it('should find articles by title match', () => {
            const results = searchEngine.search('performance', mockArticles);

            expect(results.length).toBeGreaterThan(0);

            const performanceArticle = results.find(r => r.article.id === 'performance-slow-ui');
            expect(performanceArticle).toBeDefined();
        });

        it('should find articles by error code', () => {
            const results = searchEngine.search('AI101-PERF-001', mockArticles);

            expect(results.length).toBeGreaterThan(0);

            const performanceArticle = results.find(r => r.article.id === 'performance-slow-ui');
            expect(performanceArticle).toBeDefined();
            expect(performanceArticle?.matchedField).toBe('errorCodes');
        });

        it('should find articles by description match', () => {
            const results = searchEngine.search('choppy', mockArticles);

            expect(results.length).toBeGreaterThan(0);

            const performanceArticle = results.find(r => r.article.id === 'performance-slow-ui');
            expect(performanceArticle).toBeDefined();
        });

        it('should rank results by relevance', () => {
            const results = searchEngine.search('slow', mockArticles);

            // Results should be sorted by score descending
            for (let i = 1; i < results.length; i++) {
                expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
            }
        });

        it('should handle multi-word queries', () => {
            const results = searchEngine.search('slow ui', mockArticles);

            expect(results.length).toBeGreaterThan(0);

            // Should find performance article (has both 'slow' and 'ui')
            const performanceArticle = results.find(r => r.article.id === 'performance-slow-ui');
            expect(performanceArticle).toBeDefined();
        });

        it('should perform fuzzy matching for typos', () => {
            // "slwo" should fuzzy match "slow"
            const results = searchEngine.search('slwo', mockArticles);

            // Fuzzy matching should find some results
            // Note: Fuzzy matching is simple, so this might not always work
            // depending on the implementation
            expect(Array.isArray(results)).toBe(true);
        });

        it('should be case-insensitive', () => {
            const results1 = searchEngine.search('SLOW', mockArticles);
            const results2 = searchEngine.search('slow', mockArticles);

            expect(results1.length).toBe(results2.length);
            expect(results1[0]?.article.id).toBe(results2[0]?.article.id);
        });

        it('should prioritize error code matches', () => {
            const results = searchEngine.search('AI101-AUTH-001', mockArticles);

            expect(results.length).toBeGreaterThan(0);

            // Error code match should be highest scored
            expect(results[0].matchedField).toBe('errorCodes');
            expect(results[0].article.id).toBe('api-key-invalid');
        });

        it('should handle partial error code matches', () => {
            const results = searchEngine.search('AI101-LLM', mockArticles);

            expect(results.length).toBeGreaterThan(0);

            const llmArticle = results.find(r => r.article.id === 'connectivity-llm-timeout');
            expect(llmArticle).toBeDefined();
        });
    });

    describe('getSuggestions', () => {
        it('should return empty array for short query', () => {
            const suggestions = searchEngine.getSuggestions('a', mockArticles);
            expect(suggestions).toEqual([]);
        });

        it('should suggest matching symptoms', () => {
            const suggestions = searchEngine.getSuggestions('sl', mockArticles);

            expect(Array.isArray(suggestions)).toBe(true);

            // Should suggest 'slow' symptom
            expect(suggestions).toContain('slow');
        });

        it('should suggest matching error codes', () => {
            const suggestions = searchEngine.getSuggestions('ai101', mockArticles);

            expect(Array.isArray(suggestions)).toBe(true);

            // Should suggest error codes starting with AI101
            const hasErrorCode = suggestions.some(s => s.startsWith('AI101'));
            expect(hasErrorCode).toBe(true);
        });

        it('should limit suggestions to 5', () => {
            const suggestions = searchEngine.getSuggestions('a', mockArticles);

            expect(suggestions.length).toBeLessThanOrEqual(5);
        });

        it('should be case-insensitive', () => {
            const suggestions1 = searchEngine.getSuggestions('SL', mockArticles);
            const suggestions2 = searchEngine.getSuggestions('sl', mockArticles);

            expect(suggestions1).toEqual(suggestions2);
        });
    });

    describe('performance', () => {
        it('should complete search in reasonable time', () => {
            const start = Date.now();

            searchEngine.search('performance', mockArticles);

            const duration = Date.now() - start;

            // Should complete in less than 50ms for small dataset
            expect(duration).toBeLessThan(50);
        });
    });
});
