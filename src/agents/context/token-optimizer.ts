/**
 * TokenOptimizer handles token estimation and optimization for LLM context limits.
 * Ensures context stays within budget while preserving the most important information.
 */
export class TokenOptimizer {
    private static readonly DEFAULT_MAX_TOKENS = 10000;
    private static readonly TOKEN_PER_CHAR = 0.25; // Rough estimate

    private encoding: any;

    /**
     * Estimates the number of tokens in a given text.
     */
    public async estimateTokens(text: string): Promise<number> {
        try {
            const encoding = await this.getEncoding();
            return encoding.encode(text).length;
        } catch (error) {
            // Fallback to character-based estimation
            return Math.ceil(text.length * TokenOptimizer.TOKEN_PER_CHAR);
        }
    }

    /**
     * Optimizes a collection of files to fit within token limits.
     * @param files Array of file objects with path and content
     * @param maxTokens Maximum allowed tokens
     * @returns Optimized file contents
     */
    public async optimizeFiles(
        files: Array<{ path: string, content: string }>,
        maxTokens: number = TokenOptimizer.DEFAULT_MAX_TOKENS
    ): Promise<string> {
        if (files.length === 0) return '';

        // Calculate tokens for each file
        const filesWithTokens = await Promise.all(
            files.map(async (file) => ({
                ...file,
                tokens: await this.estimateTokens(file.content)
            }))
        );

        // Sort by priority (current file first, then by token count ascending for smaller files)
        filesWithTokens.sort((a, b) => {
            // Current file has highest priority
            if (a.path.includes('active') || a.path.includes('current')) return -1;
            if (b.path.includes('active') || b.path.includes('current')) return 1;

            // Then prioritize smaller files to fit more
            return a.tokens - b.tokens;
        });

        let totalTokens = 0;
        const optimizedFiles: Array<{ path: string, content: string }> = [];

        for (const file of filesWithTokens) {
            const newTotal = totalTokens + file.tokens;

            if (newTotal <= maxTokens) {
                optimizedFiles.push(file);
                totalTokens = newTotal;
            } else {
                // Try to truncate this file to fit remaining tokens
                const remainingTokens = maxTokens - totalTokens;
                if (remainingTokens > 100) { // Only include if we can fit meaningful content
                    const truncatedContent = await this.truncateFile(file, remainingTokens);
                    if (truncatedContent) {
                        optimizedFiles.push({
                            path: file.path,
                            content: truncatedContent
                        });
                        break; // No more files after truncation
                    }
                } else {
                    break; // No more space
                }
            }
        }

        // Format the output
        return this.formatOptimizedContext(optimizedFiles);
    }

    /**
     * Truncates a file's content to fit within token limit while preserving important parts.
     */
    private async truncateFile(
        file: { path: string, content: string, tokens: number },
        maxTokens: number
    ): Promise<string | null> {
        const content = file.content;

        // Try to keep function signatures and class definitions
        const lines = content.split('\n');
        const importantLines: string[] = [];
        let tokensUsed = 0;

        // First pass: collect important structural elements
        for (const line of lines) {
            const trimmed = line.trim();

            // Keep imports, exports, class/function declarations
            if (
                trimmed.startsWith('import ') ||
                trimmed.startsWith('export ') ||
                trimmed.startsWith('class ') ||
                trimmed.startsWith('function ') ||
                trimmed.startsWith('const ') && trimmed.includes('=') ||
                trimmed.startsWith('interface ') ||
                trimmed.startsWith('type ')
            ) {
                const lineTokens = await this.estimateTokens(line + '\n');
                if (tokensUsed + lineTokens <= maxTokens) {
                    importantLines.push(line);
                    tokensUsed += lineTokens;
                } else {
                    break;
                }
            }
        }

        // If we have important lines, use them
        if (importantLines.length > 0) {
            return importantLines.join('\n') + '\n\n// ... (truncated for token limit)';
        }

        // Fallback: truncate from the beginning
        const charsPerToken = 4; // Rough estimate
        const maxChars = maxTokens * charsPerToken;
        if (content.length <= maxChars) {
            return content;
        }

        return content.substring(0, maxChars) + '\n\n// ... (truncated for token limit)';
    }

    /**
     * Formats the optimized context for LLM consumption.
     */
    private formatOptimizedContext(files: Array<{ path: string, content: string }>): string {
        return files.map(file =>
            `--- FILE: ${file.path} ---\n${file.content}\n`
        ).join('\n');
    }

    /**
     * Gets the tiktoken encoding for accurate token counting.
     */
    private async getEncoding() {
        if (!this.encoding) {
            try {
                const { getEncoding } = await import('js-tiktoken');
                this.encoding = getEncoding('cl100k_base');
            } catch (error) {
                // Return a mock encoding for test environments
                this.encoding = {
                    encode: (text: string) => ({ length: Math.ceil(text.length * TokenOptimizer.TOKEN_PER_CHAR) })
                };
            }
        }
        return this.encoding;
    }

    /**
     * Validates if content fits within token limits.
     */
    public async validateTokenLimit(content: string, maxTokens: number = TokenOptimizer.DEFAULT_MAX_TOKENS): Promise<boolean> {
        const tokens = await this.estimateTokens(content);
        return tokens <= maxTokens;
    }
}