import { IKnowledgeArticle, ITroubleshootingSearchResult } from './types';

/**
 * Search engine for troubleshooting knowledge base
 * 
 * Implements fuzzy matching, relevance scoring, and multi-word query support.
 * Optimized for fast in-memory search (<50ms for 100+ articles).
 */
export class SearchEngine {
    /**
     * Search articles by query string
     * Returns results sorted by relevance score (highest first)
     */
    search(query: string, articles: IKnowledgeArticle[]): ITroubleshootingSearchResult[] {
        if (!query || query.trim().length === 0) {
            return [];
        }

        const queryLower = query.toLowerCase().trim();
        const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);

        const results: ITroubleshootingSearchResult[] = [];

        for (const article of articles) {
            const scoreResult = this.scoreArticle(article, queryLower, queryWords);

            if (scoreResult.score > 0) {
                results.push({
                    article,
                    score: scoreResult.score,
                    matchedField: scoreResult.matchedField
                });
            }
        }

        // Sort by score descending
        results.sort((a, b) => b.score - a.score);

        return results;
    }

    /**
     * Score an article against query
     * Returns score and which field matched best
     */
    private scoreArticle(
        article: IKnowledgeArticle,
        queryLower: string,
        queryWords: string[]
    ): { score: number; matchedField: ITroubleshootingSearchResult['matchedField'] } {
        let maxScore = 0;
        let bestField: ITroubleshootingSearchResult['matchedField'] = 'description';

        // Check error codes first (highest priority)
        const errorCodeScore = this.scoreErrorCodes(article.errorCodes, queryLower, queryWords);
        if (errorCodeScore > maxScore) {
            maxScore = errorCodeScore;
            bestField = 'errorCodes';
        }

        // Check title (high priority)
        const titleScore = this.scoreField(article.title, queryLower, queryWords, 100);
        if (titleScore > maxScore) {
            maxScore = titleScore;
            bestField = 'title';
        }

        // Check symptoms (high priority)
        const symptomsScore = this.scoreSymptoms(article.symptoms, queryLower, queryWords);
        if (symptomsScore > maxScore) {
            maxScore = symptomsScore;
            bestField = 'symptoms';
        }

        // Check description (medium priority)
        const descriptionScore = this.scoreField(article.description, queryLower, queryWords, 20);
        if (descriptionScore > maxScore) {
            maxScore = descriptionScore;
            bestField = 'description';
        }

        // Check solutions (medium priority)
        const solutionsScore = this.scoreSolutions(article.solutions, queryLower, queryWords);
        if (solutionsScore > maxScore) {
            maxScore = solutionsScore;
            bestField = 'solutions';
        }

        return { score: maxScore, matchedField: bestField };
    }

    /**
     * Score a single text field
     */
    private scoreField(
        text: string,
        queryLower: string,
        queryWords: string[],
        baseScore: number
    ): number {
        const textLower = text.toLowerCase();
        let score = 0;

        // Exact match = highest score
        if (textLower.includes(queryLower)) {
            score += baseScore;
        }

        // Word matches
        for (const word of queryWords) {
            if (textLower.includes(word)) {
                score += baseScore / queryWords.length;
            } else {
                // Fuzzy match (simple substring tolerance)
                const fuzzyScore = this.fuzzyMatch(textLower, word);
                if (fuzzyScore > 0) {
                    score += (baseScore / queryWords.length) * fuzzyScore;
                }
            }
        }

        return score;
    }

    /**
     * Score symptoms array
     */
    private scoreSymptoms(
        symptoms: readonly string[],
        queryLower: string,
        queryWords: string[]
    ): number {
        let score = 0;

        for (const symptom of symptoms) {
            const symptomLower = symptom.toLowerCase();

            // Exact symptom match = very high score
            if (symptomLower === queryLower) {
                score += 100;
            } else if (symptomLower.includes(queryLower)) {
                score += 50;
            }

            // Word matches in symptoms
            for (const word of queryWords) {
                if (symptomLower.includes(word)) {
                    score += 10;
                } else {
                    // Fuzzy match
                    const fuzzyScore = this.fuzzyMatch(symptomLower, word);
                    if (fuzzyScore > 0) {
                        score += 5 * fuzzyScore;
                    }
                }
            }
        }

        return score;
    }

    /**
     * Score error codes
     */
    private scoreErrorCodes(
        errorCodes: readonly string[],
        queryLower: string,
        queryWords: string[]
    ): number {
        let score = 0;

        for (const code of errorCodes) {
            const codeLower = code.toLowerCase();

            // Exact error code match = highest priority
            if (codeLower === queryLower) {
                score += 200;
            } else if (codeLower.includes(queryLower)) {
                score += 150;
            }

            // Partial matches
            for (const word of queryWords) {
                if (codeLower.includes(word)) {
                    score += 50;
                }
            }
        }

        return score;
    }

    /**
     * Score solutions array
     */
    private scoreSolutions(
        solutions: readonly string[],
        queryLower: string,
        queryWords: string[]
    ): number {
        let score = 0;

        for (const solution of solutions) {
            const solutionLower = solution.toLowerCase();

            if (solutionLower.includes(queryLower)) {
                score += 15;
            }

            for (const word of queryWords) {
                if (solutionLower.includes(word)) {
                    score += 5;
                }
            }
        }

        return score;
    }

    /**
     * Simple fuzzy matching using substring similarity
     * Returns score between 0 and 1
     */
    private fuzzyMatch(text: string, query: string): number {
        // Simple approach: check if most characters from query appear in text
        if (query.length < 3) {
            return 0; // Too short for fuzzy matching
        }

        let matchedChars = 0;
        let lastIndex = -1;

        for (const char of query) {
            const index = text.indexOf(char, lastIndex + 1);
            if (index > lastIndex) {
                matchedChars++;
                lastIndex = index;
            }
        }

        const similarity = matchedChars / query.length;

        // Only consider it a match if >70% of characters match in order
        return similarity > 0.7 ? similarity : 0;
    }

    /**
     * Get search suggestions based on partial query
     * Returns common symptoms and error codes that match
     */
    getSuggestions(query: string, articles: IKnowledgeArticle[]): string[] {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const queryLower = query.toLowerCase();
        const suggestions = new Set<string>();

        for (const article of articles) {
            // Suggest matching symptoms
            for (const symptom of article.symptoms) {
                if (symptom.toLowerCase().startsWith(queryLower)) {
                    suggestions.add(symptom);
                }
            }

            // Suggest matching error codes
            for (const code of article.errorCodes) {
                if (code.toLowerCase().includes(queryLower)) {
                    suggestions.add(code);
                }
            }
        }

        return Array.from(suggestions).slice(0, 5); // Limit to 5 suggestions
    }
}
