/**
 * Knowledge Base Types for AI-101 Troubleshooting System
 * 
 * Defines the data structures for the searchable troubleshooting knowledge base.
 * Articles are stored as markdown files with YAML frontmatter and loaded at runtime.
 */

/**
 * Category enum for organizing troubleshooting articles
 */
export enum TroubleshootingCategory {
    Performance = 'Performance',
    Connectivity = 'Connectivity',
    DisplayIssues = 'DisplayIssues',
    APIKeyProblems = 'APIKeyProblems',
    Configuration = 'Configuration',
    Agents = 'Agents',
    LLMProviders = 'LLMProviders'
}

/**
 * Community contribution to an article
 */
export interface ICommunityContribution {
    readonly id: string;
    readonly author: string;
    readonly content: string;
    readonly upvotes: number;
    readonly dateAdded: Date;
    readonly moderated: boolean;
}

/**
 * Knowledge base article interface
 * Represents a single troubleshooting article with all metadata
 */
export interface IKnowledgeArticle {
    readonly id: string;
    readonly title: string;
    readonly category: TroubleshootingCategory;
    readonly symptoms: readonly string[];
    readonly description: string;
    readonly diagnosisSteps: readonly string[];
    readonly solutions: readonly string[];
    readonly prevention: string;
    readonly errorCodes: readonly string[];
    readonly relatedDocs: readonly string[];
    readonly communityContributions: readonly ICommunityContribution[];
}

/**
 * Category metadata with article references
 */
export interface ICategory {
    readonly id: TroubleshootingCategory;
    readonly name: string;
    readonly icon: string;
    readonly articleIds: readonly string[];
}

/**
 * Search result with relevance scoring
 */
export interface ITroubleshootingSearchResult {
    readonly article: IKnowledgeArticle;
    readonly score: number;
    readonly matchedField: 'title' | 'symptoms' | 'description' | 'solutions' | 'errorCodes';
}
