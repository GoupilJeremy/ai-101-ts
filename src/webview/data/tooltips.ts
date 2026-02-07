/**
 * Tooltip Content Registry
 * Provides contextual tooltip content for all UI elements with i18n and mode-awareness support.
 * 
 * Content structure:
 * - id: Unique identifier for the tooltip
 * - default: Default content (fallback)
 * - learning: Detailed, educational content for Learning Mode
 * - expert: Concise, technical content for Expert Mode
 * - shortcuts: Keyboard shortcuts (optional)
 * - glossaryTerms: Terms that link to glossary (optional)
 */

export const tooltipContent = {
    // ============================================================
    // Agent Tooltips
    // ============================================================
    'agent-context': {
        default: {
            title: 'Context Agent',
            description: 'Analyzes project files and provides context to other agents.',
            shortcuts: ['Shift+F10: Show tooltip'],
        },
        learning: {
            title: 'Context Agent',
            description: 'This agent is responsible for loading and analyzing your project files. It identifies relevant code, dependencies, and patterns to provide context for other agents. Think of it as the "librarian" that knows where everything is.',
            whenToUse: 'Activated automatically when you request code generation or analysis.',
            shortcuts: ['Shift+F10: Show tooltip'],
            glossaryTerms: ['context', 'token-budget'],
        },
        expert: {
            title: 'Context Agent',
            description: 'File discovery & token optimization. Provides context to downstream agents.',
            shortcuts: ['Shift+F10'],
        },
    },

    'agent-architect': {
        default: {
            title: 'Architect Agent',
            description: 'Analyzes project structure and ensures code fits design patterns.',
            shortcuts: ['Shift+F10: Show tooltip'],
        },
        learning: {
            title: 'Architect Agent',
            description: 'The Architect Agent examines your project\'s file structure, import patterns, and existing code to understand the architectural style. It ensures new code suggestions align with your project\'s design patterns and best practices.',
            whenToUse: 'Activated when generating code that needs to integrate with existing architecture.',
            shortcuts: ['Shift+F10: Show tooltip'],
            glossaryTerms: ['architecture', 'design-patterns'],
        },
        expert: {
            title: 'Architect Agent',
            description: 'Structural analysis & pattern detection. Enforces architectural consistency.',
            shortcuts: ['Shift+F10'],
        },
    },

    'agent-coder': {
        default: {
            title: 'Coder Agent',
            description: 'Generates code based on context and architectural guidance.',
            shortcuts: ['Shift+F10: Show tooltip'],
        },
        learning: {
            title: 'Coder Agent',
            description: 'This agent writes the actual code! It receives context from the Context Agent and architectural guidance from the Architect Agent, then generates code that fits your project. It focuses on implementing features while following best practices.',
            whenToUse: 'Activated when you request code generation or modifications.',
            shortcuts: ['Shift+F10: Show tooltip'],
            glossaryTerms: ['code-generation', 'llm-provider'],
        },
        expert: {
            title: 'Coder Agent',
            description: 'Code generation with context & architectural constraints.',
            shortcuts: ['Shift+F10'],
        },
    },

    'agent-reviewer': {
        default: {
            title: 'Reviewer Agent',
            description: 'Validates code quality, security, and identifies potential risks.',
            shortcuts: ['Shift+F10: Show tooltip'],
        },
        learning: {
            title: 'Reviewer Agent',
            description: 'The Reviewer Agent acts as a quality gatekeeper. It examines generated code for security vulnerabilities, performance issues, edge cases, and potential bugs. It provides proactive warnings before you accept suggestions.',
            whenToUse: 'Activated automatically after code generation to validate suggestions.',
            shortcuts: ['Shift+F10: Show tooltip'],
            glossaryTerms: ['code-review', 'security', 'edge-cases'],
        },
        expert: {
            title: 'Reviewer Agent',
            description: 'Security validation & risk identification. Proactive quality gates.',
            shortcuts: ['Shift+F10'],
        },
    },

    // ============================================================
    // Vital Signs Tooltips
    // ============================================================
    'vital-signs-tokens': {
        default: {
            title: 'Token Usage',
            description: 'Current token count for LLM context.',
        },
        learning: {
            title: 'Token Usage',
            description: 'Tokens are the units that LLM providers use to measure text. Each word is roughly 1-2 tokens. This shows how many tokens are currently being used for context (files, conversation history). Higher token usage means more context but also higher costs.',
            whenToUse: 'Monitor this to understand context size and costs.',
            glossaryTerms: ['tokens', 'token-budget', 'llm-provider'],
        },
        expert: {
            title: 'Token Usage',
            description: 'Current LLM context size in tokens.',
        },
    },

    'vital-signs-cost': {
        default: {
            title: 'Session Cost',
            description: 'Estimated cost for current session.',
        },
        learning: {
            title: 'Session Cost',
            description: 'This shows the estimated cost of your current session based on LLM API usage. Costs are calculated from token usage and the pricing of your selected LLM provider (OpenAI, Anthropic, etc.).',
            whenToUse: 'Monitor to stay within budget.',
            glossaryTerms: ['cost-tracking', 'llm-provider', 'budget'],
        },
        expert: {
            title: 'Session Cost',
            description: 'Real-time cost tracking based on token usage & provider pricing.',
        },
    },

    'vital-signs-files': {
        default: {
            title: 'Context Files',
            description: 'Number of files currently loaded in context.',
            shortcuts: ['Click: View file list'],
        },
        learning: {
            title: 'Context Files',
            description: 'This shows how many files are currently loaded and being analyzed by the Context Agent. More files provide better context but use more tokens. Click to see the full list of loaded files.',
            whenToUse: 'Click to manage which files are in context.',
            shortcuts: ['Click: View file list'],
            glossaryTerms: ['context', 'token-budget'],
        },
        expert: {
            title: 'Context Files',
            description: 'Active context file count. Click to view/manage.',
            shortcuts: ['Click: View list'],
        },
    },

    'vital-signs-phase': {
        default: {
            title: 'Development Phase',
            description: 'Current project phase (Prototype, Production, Debug).',
        },
        learning: {
            title: 'Development Phase',
            description: 'The extension automatically detects your development phase based on your activity. Prototype mode focuses on rapid iteration, Production mode emphasizes quality and testing, and Debug mode helps troubleshoot issues.',
            whenToUse: 'Agents adapt their behavior based on the detected phase.',
            glossaryTerms: ['development-phase'],
        },
        expert: {
            title: 'Development Phase',
            description: 'Auto-detected phase: Prototype | Production | Debug.',
        },
    },

    // ============================================================
    // Mode Tooltips
    // ============================================================
    'mode-learning': {
        default: {
            title: 'Learning Mode',
            description: 'Detailed explanations and educational content.',
            shortcuts: ['Cmd/Ctrl+Shift+L: Toggle'],
        },
        learning: {
            title: 'Learning Mode',
            description: 'In Learning Mode, the extension provides detailed explanations, educational content, and step-by-step guidance. Perfect for developers who want to understand how AI agents work and learn best practices.',
            whenToUse: 'Use when you want to learn and understand the reasoning behind suggestions.',
            shortcuts: ['Cmd/Ctrl+Shift+L: Toggle Learning Mode'],
            glossaryTerms: ['user-modes'],
        },
        expert: {
            title: 'Learning Mode',
            description: 'Verbose mode with detailed explanations.',
            shortcuts: ['Cmd/Ctrl+Shift+L'],
        },
    },

    'mode-expert': {
        default: {
            title: 'Expert Mode',
            description: 'Concise, technical information for experienced developers.',
            shortcuts: ['Cmd/Ctrl+Shift+E: Toggle'],
        },
        learning: {
            title: 'Expert Mode',
            description: 'Expert Mode provides concise, technical information without lengthy explanations. Tooltips are shorter, and the interface assumes you understand the concepts. Ideal for experienced developers who want efficiency.',
            whenToUse: 'Use when you\'re familiar with the extension and want minimal distractions.',
            shortcuts: ['Cmd/Ctrl+Shift+E: Toggle Expert Mode'],
            glossaryTerms: ['user-modes'],
        },
        expert: {
            title: 'Expert Mode',
            description: 'Concise mode for experienced users.',
            shortcuts: ['Cmd/Ctrl+Shift+E'],
        },
    },

    'mode-focus': {
        default: {
            title: 'Focus Mode (DND)',
            description: 'Hides agents and minimizes distractions.',
            shortcuts: ['Cmd/Ctrl+Shift+F: Toggle'],
        },
        learning: {
            title: 'Focus Mode (Do Not Disturb)',
            description: 'Focus Mode hides all agent visualizations and minimizes UI elements to reduce distractions. Agents still work in the background, but you won\'t see their status updates. Perfect for deep work sessions.',
            whenToUse: 'Use when you need to concentrate without visual distractions.',
            shortcuts: ['Cmd/Ctrl+Shift+F: Toggle Focus Mode'],
            glossaryTerms: ['user-modes', 'focus-mode'],
        },
        expert: {
            title: 'Focus Mode',
            description: 'DND mode. Agents hidden, background processing active.',
            shortcuts: ['Cmd/Ctrl+Shift+F'],
        },
    },

    'mode-team': {
        default: {
            title: 'Team Mode',
            description: 'Shows agent labels and detailed metrics for collaboration.',
            shortcuts: ['Cmd/Ctrl+Shift+T: Toggle'],
        },
        learning: {
            title: 'Team Mode',
            description: 'Team Mode displays agent labels and detailed metrics, making it easier to discuss AI-assisted development with teammates. Useful for pair programming, code reviews, or teaching others how to use the extension.',
            whenToUse: 'Use when collaborating with others or presenting your workflow.',
            shortcuts: ['Cmd/Ctrl+Shift+T: Toggle Team Mode'],
            glossaryTerms: ['user-modes', 'team-mode'],
        },
        expert: {
            title: 'Team Mode',
            description: 'Collaboration mode with visible labels & metrics.',
            shortcuts: ['Cmd/Ctrl+Shift+T'],
        },
    },

    // ============================================================
    // Alert Level Tooltips
    // ============================================================
    'alert-info': {
        default: {
            title: 'Info Alert',
            description: 'Informational message or suggestion.',
            shortcuts: ['Click: View details', 'Drag: Move to TODO or Dismiss'],
        },
        learning: {
            title: 'Info Alert (Level 1)',
            description: 'Info alerts provide helpful suggestions or informational messages. They don\'t require immediate action but may improve your code. Click to see details, or drag to your TODO list or dismiss.',
            whenToUse: 'Review when convenient. Not urgent.',
            shortcuts: ['Click: View details', 'Drag: Move to TODO or Dismiss'],
            glossaryTerms: ['alert-system', 'severity-levels'],
        },
        expert: {
            title: 'Info Alert',
            description: 'L1: Informational. Non-blocking.',
            shortcuts: ['Click: Details', 'Drag: TODO/Dismiss'],
        },
    },

    'alert-warning': {
        default: {
            title: 'Warning Alert',
            description: 'Potential issue that should be reviewed.',
            shortcuts: ['Click: View details', 'Drag: Move to TODO or Dismiss'],
        },
        learning: {
            title: 'Warning Alert (Level 2)',
            description: 'Warning alerts indicate potential issues that should be reviewed soon. They might point out code smells, performance concerns, or edge cases. Click to see the reasoning and suggested fixes.',
            whenToUse: 'Review before committing code.',
            shortcuts: ['Click: View details', 'Drag: Move to TODO or Dismiss'],
            glossaryTerms: ['alert-system', 'severity-levels', 'code-smells'],
        },
        expert: {
            title: 'Warning Alert',
            description: 'L2: Potential issue. Review recommended.',
            shortcuts: ['Click: Details', 'Drag: TODO/Dismiss'],
        },
    },

    'alert-critical': {
        default: {
            title: 'Critical Alert',
            description: 'Serious issue requiring attention.',
            shortcuts: ['Click: View details and fixes'],
        },
        learning: {
            title: 'Critical Alert (Level 3)',
            description: 'Critical alerts highlight serious issues like security vulnerabilities, logic errors, or breaking changes. These should be addressed before deploying code. Click to see detailed reasoning and recommended fixes.',
            whenToUse: 'Address immediately. May block deployment.',
            shortcuts: ['Click: View details and fixes'],
            glossaryTerms: ['alert-system', 'severity-levels', 'security'],
        },
        expert: {
            title: 'Critical Alert',
            description: 'L3: Serious issue. Immediate attention required.',
            shortcuts: ['Click: Details'],
        },
    },

    'alert-urgent': {
        default: {
            title: 'Urgent Alert',
            description: 'Immediate action required to prevent errors.',
            shortcuts: ['Click: View details and fixes'],
        },
        learning: {
            title: 'Urgent Alert (Level 4)',
            description: 'Urgent alerts indicate critical issues that will cause immediate failures or data loss. These are the highest priority and must be fixed before running code. Examples: null pointer errors, infinite loops, or data corruption risks.',
            whenToUse: 'Fix immediately. Code will fail if not addressed.',
            shortcuts: ['Click: View details and fixes'],
            glossaryTerms: ['alert-system', 'severity-levels'],
        },
        expert: {
            title: 'Urgent Alert',
            description: 'L4: Critical failure imminent. Fix now.',
            shortcuts: ['Click: Details'],
        },
    },
};

/**
 * Escape HTML special characters to prevent XSS attacks.
 * @param {string} text - Text to escape
 * @returns {string} Escaped text safe for HTML interpolation
 */
export function escapeHTML(text: string): string {
    if (!text) { return ''; }
    const div = typeof document !== 'undefined' ? document.createElement('div') : null;
    if (div) {
        div.textContent = text;
        return div.innerHTML;
    }
    // Fallback for non-browser environments
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Get tooltip content for a given element ID and user mode.
 * @param {string} id - The tooltip content ID
 * @param {string} mode - User mode: 'learning', 'expert', or 'default'
 * @returns {object|null} Tooltip content object or null if not found
 */
export function getTooltipContent(id: string, mode: string = 'default'): any {
    const content = (tooltipContent as any)[id];
    if (!content) {
        console.warn(`Tooltip content not found for ID: ${id}`);
        return null;
    }

    // Return mode-specific content, fallback to default
    return content[mode] || content.default || null;
}

/**
 * Format tooltip content as HTML with XSS protection.
 * @param {object} content - Tooltip content object
 * @returns {string} HTML string (sanitized)
 */
export function formatTooltipHTML(content: any): string {
    if (!content) { return ''; }

    // Escape all text content to prevent XSS
    const safeTitle = escapeHTML(content.title);
    const safeDescription = escapeHTML(content.description);
    const safeWhenToUse = escapeHTML(content.whenToUse);

    let html = `<div class="tooltip__header">
        <span class="tooltip__title">${safeTitle}</span>
    </div>`;

    if (safeDescription) {
        html += `<div class="tooltip__description">${safeDescription}</div>`;
    }

    if (safeWhenToUse) {
        html += `<div class="tooltip__when-to-use">
            <strong>When to use:</strong> ${safeWhenToUse}
        </div>`;
    }

    if (content.shortcuts && content.shortcuts.length > 0) {
        html += `<div class="tooltip__shortcuts">
            <strong>Shortcuts:</strong> ${content.shortcuts.map((s: string) => `<kbd class="tooltip__shortcut">${escapeHTML(s)}</kbd>`).join(' ')}
        </div>`;
    }

    if (content.glossaryTerms && content.glossaryTerms.length > 0) {
        html += `<div class="tooltip__glossary">
            <strong>Learn more:</strong> ${content.glossaryTerms.map((term: string) =>
            `<a href="#" class="tooltip__link" data-glossary-term="${escapeHTML(term)}">${escapeHTML(term)}</a>`
        ).join(', ')}
        </div>`;
    }

    return html;
}

export default {
    tooltipContent,
    getTooltipContent,
    formatTooltipHTML,
    escapeHTML,
};

