import * as vscode from 'vscode';
import * as path from 'path';

/**
 * FileLoader handles intelligent discovery and loading of relevant project files
 * for context optimization in AI suggestions.
 */
export class FileLoader {
    private workspaceRoot: string;

    constructor() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            this.workspaceRoot = '';
        } else {
            this.workspaceRoot = workspaceFolders[0].uri.fsPath;
        }
    }

    /**
     * Discovers and loads relevant files based on the current context.
     * @param currentFile The currently active file path
     * @param maxFiles Maximum number of files to load
     * @returns Array of file paths and their contents
     */
    public async discoverAndLoadFiles(currentFile?: string, maxFiles: number = 10): Promise<Array<{ path: string, content: string }>> {
        const startTime = Date.now();
        const files: Array<{ path: string, content: string }> = [];

        try {
            let currentContent: string | null = null;

            // Priority 1: Current file
            if (currentFile) {
                currentContent = await this.loadFileContent(currentFile);
                if (currentContent) {
                    files.push({ path: currentFile, content: currentContent });
                }
            }

            // Priority 2: Import dependencies
            const importFiles = await this.discoverImportDependencies(currentFile, currentContent ?? undefined);
            for (const importFile of importFiles) {
                if (files.length >= maxFiles) { break; }
                if (!files.some(f => f.path === importFile)) {
                    const content = await this.loadFileContent(importFile);
                    if (content) {
                        files.push({ path: importFile, content });
                    }
                }
            }

            // Priority 3: Recent files
            const recentFiles = await this.getRecentFiles();
            for (const recentFile of recentFiles) {
                if (files.length >= maxFiles) { break; }
                if (!files.some(f => f.path === recentFile)) {
                    const content = await this.loadFileContent(recentFile);
                    if (content) {
                        files.push({ path: recentFile, content });
                    }
                }
            }

            // Priority 4: Similar files
            const similarFiles = await this.discoverSimilarFiles(currentFile);
            for (const similarFile of similarFiles) {
                if (files.length >= maxFiles) { break; }
                if (!files.some(f => f.path === similarFile)) {
                    const content = await this.loadFileContent(similarFile);
                    if (content) {
                        files.push({ path: similarFile, content });
                    }
                }
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            if (duration > 500) {
                console.warn(`File discovery took ${duration}ms, exceeding 500ms target`);
            }

            return files;
        } catch (error) {
            console.error('Error in file discovery:', error);
            return files;
        }
    }

    /**
     * Analyzes import statements in the current file to find dependencies.
     */
    private async discoverImportDependencies(currentFile?: string, currentContent?: string | null): Promise<string[]> {
        if (!currentFile) { return []; }

        const content = currentContent ?? await this.loadFileContent(currentFile);
        if (!content) { return []; }

        const dependencies: string[] = [];
        const importRegex = /(?:import|from|require)\s+['"]([^'"]+)['"]/g;
        let match;

        while ((match = importRegex.exec(content)) !== null) {
            const importPath = match[1];
            const resolvedPath = await this.resolveImportPath(importPath, currentFile);
            if (resolvedPath && !dependencies.includes(resolvedPath)) {
                dependencies.push(resolvedPath);
            }
        }

        return dependencies;
    }

    /**
     * Resolves an import path to an absolute file path.
     */
    private async resolveImportPath(importPath: string, currentFile: string): Promise<string | null> {
        // Handle relative imports
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
            const currentDir = path.dirname(currentFile);
            const resolvedPath = path.resolve(currentDir, importPath);

            // Try different extensions
            const extensions = ['.ts', '.js', '.tsx', '.jsx', '.json'];
            for (const ext of extensions) {
                const filePath = resolvedPath + ext;
                if (await this.fileExists(filePath)) {
                    return filePath;
                }
                // Try index files in directories
                const indexPath = path.join(resolvedPath, 'index' + ext);
                if (await this.fileExists(indexPath)) {
                    return indexPath;
                }
            }
        }

        // Handle absolute imports from workspace root
        if (importPath.startsWith('/')) {
            const absolutePath = path.join(this.workspaceRoot, importPath);
            if (await this.fileExists(absolutePath)) {
                return absolutePath;
            }
        }

        // Use VSCode's workspace.findFiles for more complex resolution
        try {
            const pattern = `**/${importPath}.ts`;
            const files = await vscode.workspace.findFiles(pattern, null, 1);
            if (files.length > 0) {
                return files[0].fsPath;
            }
        } catch (error) {
            // Ignore errors in file finding
        }

        return null;
    }

    /**
     * Gets recently opened files from VSCode.
     */
    private async getRecentFiles(): Promise<string[]> {
        const recentDocs = vscode.workspace.textDocuments
            .filter(doc => !doc.isUntitled && doc.uri.scheme === 'file')
            .map(doc => doc.uri.fsPath)
            .slice(0, 5); // Limit to 5 recent files

        return recentDocs;
    }

    /**
     * Discovers files with similar names or paths.
     */
    private async discoverSimilarFiles(currentFile?: string): Promise<string[]> {
        if (!currentFile) { return []; }

        const currentFileName = path.basename(currentFile, path.extname(currentFile));
        const currentDir = path.dirname(currentFile);

        try {
            // Find files with similar names in the same directory
            const pattern = `${currentDir}/${currentFileName}*`;
            const files = await vscode.workspace.findFiles(pattern, null, 5);

            return files
                .map(uri => uri.fsPath)
                .filter(filePath => filePath !== currentFile);
        } catch (error) {
            return [];
        }
    }

    /**
     * Loads content of a file.
     */
    private async loadFileContent(filePath: string): Promise<string | null> {
        try {
            const uri = vscode.Uri.file(filePath);
            const content = await vscode.workspace.fs.readFile(uri);
            return content.toString();
        } catch (error) {
            return null;
        }
    }

    /**
     * Public method to load a specific file's content.
     */
    public async loadSpecificFile(filePath: string): Promise<string | null> {
        return this.loadFileContent(filePath);
    }

    /**
     * Checks if a file exists.
     */
    private async fileExists(filePath: string): Promise<boolean> {
        try {
            await vscode.workspace.fs.stat(vscode.Uri.file(filePath));
            return true;
        } catch (error) {
            return false;
        }
    }
}