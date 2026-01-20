import * as vscode from 'vscode';
import { KnowledgeBaseService } from './knowledge-base-service';
import { SearchEngine } from './search-engine';
import { IKnowledgeArticle, ITroubleshootingSearchResult } from './types';

/**
 * Webview provider for troubleshooting knowledge base
 * 
 * Implements vscode.WebviewViewProvider for sidebar panel integration.
 * Provides searchable interface for troubleshooting articles.
 */
export class TroubleshootingWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'suika.troubleshootingView';

    private view?: vscode.WebviewView;
    private searchEngine: SearchEngine;

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly knowledgeBase: KnowledgeBaseService
    ) {
        this.searchEngine = new SearchEngine();
    }

    /**
     * Resolve webview view
     */
    async resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        token: vscode.CancellationToken
    ): Promise<void> {
        this.view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri]
        };

        // Load articles
        await this.knowledgeBase.loadArticles();

        // Set HTML content
        webviewView.webview.html = this.getHtmlContent(webviewView.webview);

        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage(async (message) => {
            await this.handleMessage(message);
        });

        // Send initial data
        this.sendCategories();
    }

    /**
     * Handle messages from webview
     */
    private async handleMessage(message: any): Promise<void> {
        switch (message.type) {
            case 'search':
                await this.handleSearch(message.query);
                break;

            case 'getArticle':
                await this.handleGetArticle(message.articleId);
                break;

            case 'filterByCategory':
                await this.handleFilterByCategory(message.category);
                break;

            case 'feedback':
                await this.handleFeedback(message.articleId, message.helpful);
                break;
        }
    }

    /**
     * Handle search query
     */
    private async handleSearch(query: string): Promise<void> {
        const articles = await this.knowledgeBase.loadArticles();
        const results = this.searchEngine.search(query, articles);

        this.view?.webview.postMessage({
            type: 'searchResults',
            results: results.map(r => ({
                id: r.article.id,
                title: r.article.title,
                category: r.article.category,
                description: r.article.description.substring(0, 150) + '...',
                score: r.score,
                matchedField: r.matchedField
            }))
        });
    }

    /**
     * Handle get article by ID
     */
    private async handleGetArticle(articleId: string): Promise<void> {
        const article = this.knowledgeBase.getArticleById(articleId);

        if (article) {
            this.view?.webview.postMessage({
                type: 'articleDetail',
                article: this.serializeArticle(article)
            });
        }
    }

    /**
     * Handle filter by category
     */
    private async handleFilterByCategory(category: string): Promise<void> {
        const articles = this.knowledgeBase.getArticlesByCategory(category as any);

        this.view?.webview.postMessage({
            type: 'categoryArticles',
            articles: articles.map(a => ({
                id: a.id,
                title: a.title,
                category: a.category,
                description: a.description.substring(0, 150) + '...'
            }))
        });
    }

    /**
     * Handle user feedback
     */
    private async handleFeedback(articleId: string, helpful: boolean): Promise<void> {
        // Log feedback for analytics (future feature)
        console.log(`Article ${articleId} feedback: ${helpful ? 'helpful' : 'not helpful'}`);

        // Could send telemetry event here
        vscode.window.showInformationMessage('Thank you for your feedback!');
    }

    /**
     * Send categories to webview
     */
    private sendCategories(): void {
        const categories = this.knowledgeBase.getCategories();

        this.view?.webview.postMessage({
            type: 'categories',
            categories: categories.map(c => ({
                id: c.id,
                name: c.name,
                icon: c.icon,
                count: c.articleIds.length
            }))
        });
    }

    /**
     * Serialize article for webview
     */
    private serializeArticle(article: IKnowledgeArticle): any {
        return {
            id: article.id,
            title: article.title,
            category: article.category,
            symptoms: article.symptoms,
            description: article.description,
            diagnosisSteps: article.diagnosisSteps,
            solutions: article.solutions,
            prevention: article.prevention,
            errorCodes: article.errorCodes,
            relatedDocs: article.relatedDocs
        };
    }

    /**
     * Get HTML content for webview
     */
    private getHtmlContent(webview: vscode.Webview): string {
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'media', 'troubleshooting.css')
        );

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${this.getNonce()}' 'unsafe-inline';">
  <title>Suika Troubleshooting</title>
  <style>
    ${this.getInlineStyles()}
  </style>
</head>
<body>
  <div class="troubleshooting-container">
    <!-- Search Section -->
    <div class="search-section">
      <input 
        type="text" 
        id="searchInput" 
        class="search-input" 
        placeholder="Search by symptom, error code, or keyword..."
        autocomplete="off"
      />
      <div id="searchSuggestions" class="search-suggestions"></div>
    </div>

    <!-- Categories Section -->
    <div class="categories-section">
      <h3>Browse by Category</h3>
      <div id="categoriesContainer" class="categories-container"></div>
    </div>

    <!-- Results Section -->
    <div id="resultsSection" class="results-section" style="display: none;">
      <div class="results-header">
        <h3 id="resultsTitle">Search Results</h3>
        <button id="clearResults" class="clear-button">Clear</button>
      </div>
      <div id="resultsContainer" class="results-container"></div>
    </div>

    <!-- Article Detail Section -->
    <div id="articleSection" class="article-section" style="display: none;">
      <button id="backButton" class="back-button">← Back to Results</button>
      <div id="articleContainer" class="article-container"></div>
      
      <!-- Feedback Section -->
      <div class="feedback-section">
        <p>Was this article helpful?</p>
        <button id="feedbackYes" class="feedback-button feedback-yes">👍 Yes</button>
        <button id="feedbackNo" class="feedback-button feedback-no">👎 No</button>
      </div>
    </div>
  </div>

  <script nonce="${this.getNonce()}">
    ${this.getInlineScript()}
  </script>
</body>
</html>`;
    }

    /**
     * Get inline styles (sumi-e aesthetic)
     */
    private getInlineStyles(): string {
        return `
      :root {
        --bg-color: var(--vscode-editor-background);
        --fg-color: var(--vscode-editor-foreground);
        --border-color: var(--vscode-panel-border);
        --hover-bg: var(--vscode-list-hoverBackground);
        --active-bg: var(--vscode-list-activeSelectionBackground);
        --input-bg: var(--vscode-input-background);
        --input-border: var(--vscode-input-border);
        --button-bg: var(--vscode-button-background);
        --button-fg: var(--vscode-button-foreground);
        --button-hover-bg: var(--vscode-button-hoverBackground);
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: var(--vscode-font-family);
        font-size: var(--vscode-font-size);
        color: var(--fg-color);
        background-color: var(--bg-color);
        padding: 16px;
      }

      .troubleshooting-container {
        max-width: 800px;
        margin: 0 auto;
      }

      /* Search Section */
      .search-section {
        margin-bottom: 24px;
      }

      .search-input {
        width: 100%;
        padding: 12px 16px;
        background: var(--input-bg);
        border: 1px solid var(--input-border);
        border-radius: 4px;
        color: var(--fg-color);
        font-size: 14px;
        transition: border-color 0.2s;
      }

      .search-input:focus {
        outline: none;
        border-color: var(--button-bg);
      }

      /* Categories */
      .categories-section h3 {
        margin-bottom: 12px;
        font-size: 16px;
        font-weight: 600;
      }

      .categories-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
      }

      .category-card {
        padding: 16px;
        background: var(--hover-bg);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
      }

      .category-card:hover {
        background: var(--active-bg);
        transform: translateY(-2px);
      }

      .category-icon {
        font-size: 24px;
        margin-bottom: 8px;
      }

      .category-name {
        font-size: 13px;
        font-weight: 500;
      }

      .category-count {
        font-size: 11px;
        opacity: 0.7;
        margin-top: 4px;
      }

      /* Results */
      .results-section {
        margin-top: 24px;
      }

      .results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .results-header h3 {
        font-size: 16px;
        font-weight: 600;
      }

      .clear-button, .back-button {
        padding: 6px 12px;
        background: var(--button-bg);
        color: var(--button-fg);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.2s;
      }

      .clear-button:hover, .back-button:hover {
        background: var(--button-hover-bg);
      }

      .back-button {
        margin-bottom: 16px;
      }

      .result-item {
        padding: 16px;
        background: var(--hover-bg);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        margin-bottom: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .result-item:hover {
        background: var(--active-bg);
        transform: translateX(4px);
      }

      .result-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .result-category {
        display: inline-block;
        padding: 2px 8px;
        background: var(--button-bg);
        color: var(--button-fg);
        border-radius: 3px;
        font-size: 11px;
        margin-bottom: 8px;
      }

      .result-description {
        font-size: 12px;
        opacity: 0.8;
        line-height: 1.5;
      }

      /* Article Detail */
      .article-section {
        margin-top: 24px;
      }

      .article-container h1 {
        font-size: 24px;
        margin-bottom: 16px;
      }

      .article-container h2 {
        font-size: 18px;
        margin-top: 24px;
        margin-bottom: 12px;
      }

      .article-container p, .article-container li {
        line-height: 1.6;
        margin-bottom: 12px;
      }

      .article-container ul, .article-container ol {
        margin-left: 24px;
      }

      .article-container code {
        background: var(--input-bg);
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 12px;
      }

      /* Feedback */
      .feedback-section {
        margin-top: 32px;
        padding: 16px;
        background: var(--hover-bg);
        border-radius: 6px;
        text-align: center;
      }

      .feedback-section p {
        margin-bottom: 12px;
        font-size: 14px;
      }

      .feedback-button {
        padding: 8px 16px;
        margin: 0 8px;
        background: var(--button-bg);
        color: var(--button-fg);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s;
      }

      .feedback-button:hover {
        background: var(--button-hover-bg);
        transform: scale(1.05);
      }
    `;
    }

    /**
     * Get inline script
     */
    private getInlineScript(): string {
        return `
      const vscode = acquireVsCodeApi();
      let currentArticleId = null;
      let searchTimeout = null;

      // Search input handler with debouncing
      document.getElementById('searchInput').addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          if (query.length > 0) {
            vscode.postMessage({ type: 'search', query });
          } else {
            document.getElementById('resultsSection').style.display = 'none';
          }
        }, 300); // 300ms debounce
      });

      // Handle messages from extension
      window.addEventListener('message', (event) => {
        const message = event.data;

        switch (message.type) {
          case 'categories':
            renderCategories(message.categories);
            break;

          case 'searchResults':
            renderSearchResults(message.results);
            break;

          case 'categoryArticles':
            renderSearchResults(message.articles);
            break;

          case 'articleDetail':
            renderArticleDetail(message.article);
            break;
        }
      });

      // Render categories
      function renderCategories(categories) {
        const container = document.getElementById('categoriesContainer');
        container.innerHTML = categories.map(cat => \`
          <div class="category-card" onclick="filterByCategory('\${cat.id}')">
            <div class="category-icon">\${cat.icon}</div>
            <div class="category-name">\${cat.name}</div>
            <div class="category-count">\${cat.count} articles</div>
          </div>
        \`).join('');
      }

      // Render search results
      function renderSearchResults(results) {
        const section = document.getElementById('resultsSection');
        const container = document.getElementById('resultsContainer');
        
        if (results.length === 0) {
          container.innerHTML = '<p>No results found. Try different keywords.</p>';
        } else {
          container.innerHTML = results.map(result => \`
            <div class="result-item" onclick="viewArticle('\${result.id}')">
              <div class="result-category">\${result.category}</div>
              <div class="result-title">\${result.title}</div>
              <div class="result-description">\${result.description}</div>
            </div>
          \`).join('');
        }

        section.style.display = 'block';
        document.getElementById('articleSection').style.display = 'none';
      }

      // Filter by category
      function filterByCategory(category) {
        vscode.postMessage({ type: 'filterByCategory', category });
        document.getElementById('resultsTitle').textContent = 'Category: ' + category;
      }

      // View article detail
      function viewArticle(articleId) {
        currentArticleId = articleId;
        vscode.postMessage({ type: 'getArticle', articleId });
      }

      // Render article detail
      function renderArticleDetail(article) {
        const container = document.getElementById('articleContainer');
        
        container.innerHTML = \`
          <h1>\${article.title}</h1>
          
          <h2>Symptom Description</h2>
          <p>\${article.description}</p>

          <h2>Diagnosis Steps</h2>
          <ol>
            \${article.diagnosisSteps.map(step => \`<li>\${step}</li>\`).join('')}
          </ol>

          <h2>Solutions</h2>
          <ol>
            \${article.solutions.map(solution => \`<li>\${solution}</li>\`).join('')}
          </ol>

          <h2>Prevention</h2>
          <p>\${article.prevention}</p>

          \${article.errorCodes.length > 0 ? \`
            <h2>Related Error Codes</h2>
            <p>\${article.errorCodes.join(', ')}</p>
          \` : ''}
        \`;

        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('articleSection').style.display = 'block';
      }

      // Clear results
      document.getElementById('clearResults').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        document.getElementById('resultsSection').style.display = 'none';
      });

      // Back button
      document.getElementById('backButton').addEventListener('click', () => {
        document.getElementById('articleSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';
      });

      // Feedback buttons
      document.getElementById('feedbackYes').addEventListener('click', () => {
        vscode.postMessage({ type: 'feedback', articleId: currentArticleId, helpful: true });
      });

      document.getElementById('feedbackNo').addEventListener('click', () => {
        vscode.postMessage({ type: 'feedback', articleId: currentArticleId, helpful: false });
      });
    `;
    }

    /**
     * Generate nonce for CSP
     */
    private getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}
