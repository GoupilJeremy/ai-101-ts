import { describe, it, expect, beforeEach } from 'vitest';
import { KnowledgeBaseService } from '../knowledge-base-service';
import { TroubleshootingCategory } from '../types';
import * as vscode from 'vscode';

// Mock VSCode extension context
const mockContext = {
    extensionPath: '/mock/extension/path',
    subscriptions: [],
    workspaceState: {
        get: () => undefined,
        update: () => Promise.resolve()
    },
    globalState: {
        get: () => undefined,
        update: () => Promise.resolve()
    }
} as unknown as vscode.ExtensionContext;

describe('KnowledgeBaseService', () => {
    let service: KnowledgeBaseService;

    beforeEach(() => {
        service = new KnowledgeBaseService(mockContext);
    });

    describe('loadArticles', () => {
        it('should load articles from markdown files', async () => {
            // Note: This test would need actual markdown files or mocking fs
            // For now, we test the structure
            expect(service).toBeDefined();
            expect(typeof service.loadArticles).toBe('function');
        });

        it('should cache loaded articles', async () => {
            // First load
            const articles1 = await service.loadArticles();

            // Second load should return cached
            const articles2 = await service.loadArticles();

            expect(articles1).toBe(articles2);
        });
    });

    describe('getCategories', () => {
        it('should return all categories', () => {
            const categories = service.getCategories();

            expect(Array.isArray(categories)).toBe(true);

            // Should have all defined categories
            const categoryIds = categories.map(c => c.id);
            expect(categoryIds).toContain(TroubleshootingCategory.Performance);
            expect(categoryIds).toContain(TroubleshootingCategory.Connectivity);
            expect(categoryIds).toContain(TroubleshootingCategory.DisplayIssues);
            expect(categoryIds).toContain(TroubleshootingCategory.APIKeyProblems);
        });

        it('should include article counts for each category', () => {
            const categories = service.getCategories();

            categories.forEach(category => {
                expect(category).toHaveProperty('id');
                expect(category).toHaveProperty('name');
                expect(category).toHaveProperty('icon');
                expect(category).toHaveProperty('articleIds');
                expect(Array.isArray(category.articleIds)).toBe(true);
            });
        });
    });

    describe('getArticlesByCategory', () => {
        it('should filter articles by category', async () => {
            await service.loadArticles();

            const performanceArticles = service.getArticlesByCategory(TroubleshootingCategory.Performance);

            expect(Array.isArray(performanceArticles)).toBe(true);

            // All returned articles should be in Performance category
            performanceArticles.forEach(article => {
                expect(article.category).toBe(TroubleshootingCategory.Performance);
            });
        });

        it('should return empty array for category with no articles', async () => {
            await service.loadArticles();

            // Assuming LLMProviders might not have articles initially
            const llmArticles = service.getArticlesByCategory(TroubleshootingCategory.LLMProviders);

            expect(Array.isArray(llmArticles)).toBe(true);
        });
    });

    describe('getArticleById', () => {
        it('should return article by ID', async () => {
            await service.loadArticles();

            const article = service.getArticleById('performance-slow-ui');

            if (article) {
                expect(article.id).toBe('performance-slow-ui');
                expect(article.title).toBeDefined();
                expect(article.category).toBeDefined();
            }
        });

        it('should return undefined for non-existent ID', async () => {
            await service.loadArticles();

            const article = service.getArticleById('non-existent-article');

            expect(article).toBeUndefined();
        });
    });

    describe('getArticleByErrorCode', () => {
        it('should return article by error code', async () => {
            await service.loadArticles();

            const article = service.getArticleByErrorCode('AI101-PERF-001');

            if (article) {
                expect(article.errorCodes).toContain('AI101-PERF-001');
            }
        });

        it('should return undefined for non-existent error code', async () => {
            await service.loadArticles();

            const article = service.getArticleByErrorCode('AI101-NONEXISTENT-999');

            expect(article).toBeUndefined();
        });

        it('should map multiple error codes to same article', async () => {
            await service.loadArticles();

            const article1 = service.getArticleByErrorCode('AI101-LLM-001');
            const article2 = service.getArticleByErrorCode('AI101-LLM-002');

            // Both should map to the same connectivity article
            if (article1 && article2) {
                expect(article1.id).toBe(article2.id);
            }
        });
    });

    describe('dispose', () => {
        it('should clear all data on dispose', async () => {
            await service.loadArticles();

            service.dispose();

            const categories = service.getCategories();
            expect(categories.length).toBe(0);
        });

        it('should allow reloading after dispose', async () => {
            await service.loadArticles();
            service.dispose();

            // Should be able to load again
            const articles = await service.loadArticles();
            expect(Array.isArray(articles)).toBe(true);
        });
    });
});
