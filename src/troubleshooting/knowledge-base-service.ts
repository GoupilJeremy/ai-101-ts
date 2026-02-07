import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { IKnowledgeArticle, ICategory, TroubleshootingCategory } from './types';

/**
 * Service for loading and managing troubleshooting knowledge base articles
 * 
 * Implements IDisposable for proper cleanup on extension deactivation.
 * Articles are loaded from markdown files in docs/troubleshooting/ directory.
 */
export class KnowledgeBaseService implements vscode.Disposable {
    private articles: IKnowledgeArticle[] = [];
    private categories: ICategory[] = [];
    private articlesByCategory: Map<TroubleshootingCategory, IKnowledgeArticle[]> = new Map();
    private articlesById: Map<string, IKnowledgeArticle> = new Map();
    private articlesByErrorCode: Map<string, IKnowledgeArticle> = new Map();
    private isLoaded = false;

    constructor(private readonly context: vscode.ExtensionContext) { }

    /**
     * Load all articles from markdown files
     * Parses YAML frontmatter and markdown content
     */
    async loadArticles(): Promise<IKnowledgeArticle[]> {
        if (this.isLoaded) {
            return this.articles;
        }

        try {
            // Get locale for localized content
            const locale = vscode.env.language.startsWith('fr') ? 'fr' : 'en';

            // Build path to troubleshooting articles
            const docsPath = path.join(
                this.context.extensionPath,
                'docs',
                'troubleshooting',
                locale
            );

            // Check if localized directory exists, fallback to English
            let articlesPath = docsPath;
            try {
                await fs.access(docsPath);
            } catch {
                articlesPath = path.join(
                    this.context.extensionPath,
                    'docs',
                    'troubleshooting',
                    'en'
                );
            }

            // Read all markdown files
            const files = await fs.readdir(articlesPath);
            const markdownFiles = files.filter(f => f.endsWith('.md'));

            // Parse each article
            for (const file of markdownFiles) {
                const filePath = path.join(articlesPath, file);
                const content = await fs.readFile(filePath, 'utf-8');
                const article = this.parseArticle(content);

                if (article) {
                    this.articles.push(article);
                    this.articlesById.set(article.id, article);

                    // Index by error codes
                    for (const errorCode of article.errorCodes) {
                        this.articlesByErrorCode.set(errorCode, article);
                    }
                }
            }

            // Build category index
            this.buildCategoryIndex();

            this.isLoaded = true;
            return this.articles;
        } catch (error) {
            console.error('Failed to load knowledge base articles:', error);
            throw new Error(`Knowledge base loading failed: ${error}`);
        }
    }

    /**
     * Parse markdown article with YAML frontmatter
     */
    private parseArticle(content: string): IKnowledgeArticle | null {
        try {
            // Extract YAML frontmatter
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
            if (!frontmatterMatch) {
                return null;
            }

            const frontmatter = frontmatterMatch[1];
            const markdown = content.slice(frontmatterMatch[0].length).trim();

            // Parse YAML (simple parser for our needs)
            const metadata = this.parseYAML(frontmatter);

            // Extract sections from markdown
            const description = this.extractSection(markdown, '## Symptom Description');
            const diagnosisSteps = this.extractListItems(markdown, '## Diagnosis Steps');
            const solutions = this.extractSolutions(markdown);
            const prevention = this.extractSection(markdown, '## Prevention');

            return {
                id: metadata.id || '',
                title: metadata.title || '',
                category: metadata.category as TroubleshootingCategory || TroubleshootingCategory.Configuration,
                symptoms: metadata.symptoms || [],
                description,
                diagnosisSteps,
                solutions,
                prevention,
                errorCodes: metadata.errorCodes || [],
                relatedDocs: metadata.relatedDocs || [],
                communityContributions: [] // Future feature
            };
        } catch (error) {
            console.error('Failed to parse article:', error);
            return null;
        }
    }

    /**
     * Simple YAML parser for frontmatter
     */
    private parseYAML(yaml: string): any {
        const result: any = {};
        const lines = yaml.split('\n');
        let currentKey = '';
        let currentArray: string[] = [];

        for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed.startsWith('- ')) {
                // Array item
                currentArray.push(trimmed.slice(2));
            } else if (trimmed.includes(':')) {
                // Save previous array if exists
                if (currentKey && currentArray.length > 0) {
                    result[currentKey] = currentArray;
                    currentArray = [];
                }

                // Key-value pair
                const [key, ...valueParts] = trimmed.split(':');
                const value = valueParts.join(':').trim();
                currentKey = key.trim();

                if (value) {
                    result[currentKey] = value;
                }
            }
        }

        // Save last array
        if (currentKey && currentArray.length > 0) {
            result[currentKey] = currentArray;
        }

        return result;
    }

    /**
     * Extract section content from markdown
     */
    private extractSection(markdown: string, heading: string): string {
        const regex = new RegExp(`${heading}\\n\\n([\\s\\S]*?)(?=\\n## |$)`);
        const match = markdown.match(regex);
        return match ? match[1].trim() : '';
    }

    /**
     * Extract list items from a section
     */
    private extractListItems(markdown: string, heading: string): string[] {
        const section = this.extractSection(markdown, heading);
        const items: string[] = [];
        const lines = section.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.match(/^[\d]+\./)) {
                // Numbered list item
                items.push(trimmed.replace(/^[\d]+\.\s*/, ''));
            } else if (trimmed.startsWith('- ')) {
                // Bullet list item
                items.push(trimmed.slice(2));
            }
        }

        return items;
    }

    /**
     * Extract solutions from markdown (combines all solution sections)
     */
    private extractSolutions(markdown: string): string[] {
        const solutions: string[] = [];
        const solutionRegex = /### Solution \d+: ([^\n]+)/g;
        let match;

        while ((match = solutionRegex.exec(markdown)) !== null) {
            solutions.push(match[1]);
        }

        return solutions;
    }

    /**
     * Build category index from loaded articles
     */
    private buildCategoryIndex(): void {
        // Initialize categories
        const categoryDefinitions = [
            { id: TroubleshootingCategory.Performance, name: 'Performance', icon: '⚡' },
            { id: TroubleshootingCategory.Connectivity, name: 'Connectivity', icon: '🌐' },
            { id: TroubleshootingCategory.DisplayIssues, name: 'Display Issues', icon: '🖥️' },
            { id: TroubleshootingCategory.APIKeyProblems, name: 'API Key Problems', icon: '🔑' },
            { id: TroubleshootingCategory.Configuration, name: 'Configuration', icon: '⚙️' },
            { id: TroubleshootingCategory.Agents, name: 'Agents', icon: '🤖' },
            { id: TroubleshootingCategory.LLMProviders, name: 'LLM Providers', icon: '🧠' }
        ];

        for (const def of categoryDefinitions) {
            const articlesInCategory = this.articles.filter(a => a.category === def.id);
            this.articlesByCategory.set(def.id, articlesInCategory);

            this.categories.push({
                id: def.id,
                name: def.name,
                icon: def.icon,
                articleIds: articlesInCategory.map(a => a.id)
            });
        }
    }

    /**
     * Get all categories with article counts
     */
    getCategories(): ICategory[] {
        return this.categories;
    }

    /**
     * Get articles filtered by category
     */
    getArticlesByCategory(category: TroubleshootingCategory): IKnowledgeArticle[] {
        return this.articlesByCategory.get(category) || [];
    }

    /**
     * Get article by ID
     */
    getArticleById(id: string): IKnowledgeArticle | undefined {
        return this.articlesById.get(id);
    }

    /**
     * Get article by error code
     */
    getArticleByErrorCode(code: string): IKnowledgeArticle | undefined {
        return this.articlesByErrorCode.get(code);
    }

    /**
     * Dispose resources
     */
    dispose(): void {
        this.articles = [];
        this.categories = [];
        this.articlesByCategory.clear();
        this.articlesById.clear();
        this.articlesByErrorCode.clear();
        this.isLoaded = false;
    }
}
