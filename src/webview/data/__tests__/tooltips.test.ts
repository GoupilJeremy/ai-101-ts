import { describe, it, expect, beforeEach } from 'vitest';
import {
    tooltipContent,
    getTooltipContent,
    formatTooltipHTML,
    escapeHTML
} from '../../data/tooltips.js';

describe('Tooltip Content Registry', () => {
    describe('getTooltipContent', () => {
        it('should return default content when mode is default', () => {
            const content = getTooltipContent('agent-context', 'default');
            expect(content).toBeDefined();
            expect(content.title).toBe('Context Agent');
            expect(content.description).toBeDefined();
        });

        it('should return learning content when mode is learning', () => {
            const content = getTooltipContent('agent-context', 'learning');
            expect(content).toBeDefined();
            expect(content.title).toBe('Context Agent');
            expect(content.whenToUse).toBeDefined();
            expect(content.glossaryTerms).toBeDefined();
            expect(content.glossaryTerms.length).toBeGreaterThan(0);
        });

        it('should return expert content when mode is expert', () => {
            const content = getTooltipContent('agent-architect', 'expert');
            expect(content).toBeDefined();
            expect(content.title).toBe('Architect Agent');
            // Expert mode should have shorter description
            expect(content.description.length).toBeLessThan(100);
        });

        it('should fallback to default if mode not found', () => {
            const content = getTooltipContent('vital-signs-tokens', 'unknown-mode');
            expect(content).toBeDefined();
            expect(content.title).toBe('Token Usage');
        });

        it('should return null for unknown tooltip ID', () => {
            const content = getTooltipContent('unknown-tooltip-id', 'default');
            expect(content).toBeNull();
        });

        it('should have content for all agents', () => {
            const agents = ['agent-context', 'agent-architect', 'agent-coder', 'agent-reviewer'];
            agents.forEach(agentId => {
                const content = getTooltipContent(agentId, 'default');
                expect(content).toBeDefined();
                expect(content.title).toBeDefined();
            });
        });

        it('should have content for all vital signs', () => {
            const vitalSigns = ['vital-signs-tokens', 'vital-signs-cost', 'vital-signs-files', 'vital-signs-phase'];
            vitalSigns.forEach(id => {
                const content = getTooltipContent(id, 'default');
                expect(content).toBeDefined();
                expect(content.title).toBeDefined();
            });
        });

        it('should have content for all alert levels', () => {
            const alerts = ['alert-info', 'alert-warning', 'alert-critical', 'alert-urgent'];
            alerts.forEach(id => {
                const content = getTooltipContent(id, 'default');
                expect(content).toBeDefined();
                expect(content.title).toBeDefined();
            });
        });
    });

    describe('formatTooltipHTML', () => {
        it('should return empty string for null content', () => {
            const html = formatTooltipHTML(null);
            expect(html).toBe('');
        });

        it('should include title in header', () => {
            const content = { title: 'Test Title', description: 'Test description' };
            const html = formatTooltipHTML(content);
            expect(html).toContain('tooltip__title');
            expect(html).toContain('Test Title');
        });

        it('should include description if present', () => {
            const content = { title: 'Test', description: 'My description' };
            const html = formatTooltipHTML(content);
            expect(html).toContain('tooltip__description');
            expect(html).toContain('My description');
        });

        it('should include whenToUse if present', () => {
            const content = { title: 'Test', whenToUse: 'Use when testing' };
            const html = formatTooltipHTML(content);
            expect(html).toContain('tooltip__when-to-use');
            expect(html).toContain('Use when testing');
        });

        it('should include shortcuts with kbd elements', () => {
            const content = { title: 'Test', shortcuts: ['Ctrl+S', 'Cmd+Enter'] };
            const html = formatTooltipHTML(content);
            expect(html).toContain('tooltip__shortcuts');
            expect(html).toContain('<kbd');
            expect(html).toContain('Ctrl+S');
        });

        it('should include glossary terms as links', () => {
            const content = { title: 'Test', glossaryTerms: ['token-budget', 'context'] };
            const html = formatTooltipHTML(content);
            expect(html).toContain('tooltip__glossary');
            expect(html).toContain('tooltip__link');
            expect(html).toContain('data-glossary-term="token-budget"');
        });
    });

    describe('escapeHTML', () => {
        it('should escape HTML special characters', () => {
            const escaped = escapeHTML('<script>alert("xss")</script>');
            expect(escaped).not.toContain('<script>');
            expect(escaped).toContain('&lt;');
            expect(escaped).toContain('&gt;');
        });

        it('should escape ampersands', () => {
            const escaped = escapeHTML('Tom & Jerry');
            expect(escaped).toContain('&amp;');
        });

        it('should escape quotes', () => {
            const escaped = escapeHTML('Say "hello"');
            expect(escaped).toContain('&quot;');
        });

        it('should return empty string for null/undefined', () => {
            expect(escapeHTML(null as any)).toBe('');
            expect(escapeHTML(undefined as any)).toBe('');
        });

        it('should handle empty strings', () => {
            expect(escapeHTML('')).toBe('');
        });
    });

    describe('Tooltip Content Structure', () => {
        it('should have all required modes for each tooltip', () => {
            Object.keys(tooltipContent).forEach(key => {
                const tooltip = (tooltipContent as any)[key];
                expect(tooltip.default).toBeDefined();
                expect(tooltip.default.title).toBeDefined();
            });
        });

        it('should have learning mode with extra fields', () => {
            const learning = getTooltipContent('agent-context', 'learning');
            expect(learning.whenToUse).toBeDefined();
            expect(learning.glossaryTerms).toBeDefined();
        });

        it('should have expert mode with concise descriptions', () => {
            const expert = getTooltipContent('agent-context', 'expert');
            const learning = getTooltipContent('agent-context', 'learning');
            expect(expert.description.length).toBeLessThan(learning.description.length);
        });
    });

    describe('Accessibility Compliance', () => {
        it('should generate HTML with proper structure for screen readers', () => {
            const content = getTooltipContent('agent-context', 'learning');
            const html = formatTooltipHTML(content);

            // Should have semantic structure
            expect(html).toContain('class="tooltip__header"');
            expect(html).toContain('class="tooltip__title"');
            expect(html).toContain('class="tooltip__description"');
        });

        it('should have accessible link markup for glossary terms', () => {
            const content = getTooltipContent('agent-context', 'learning');
            const html = formatTooltipHTML(content);

            // Links should have href and data attributes
            expect(html).toMatch(/<a href="#"/);
            expect(html).toMatch(/data-glossary-term="[^"]+"/);
        });

        it('should use kbd element for shortcuts (semantic HTML)', () => {
            const content = getTooltipContent('alert-info', 'default');
            const html = formatTooltipHTML(content);

            // Shortcuts should use kbd for accessibility
            expect(html).toContain('<kbd class="tooltip__shortcut">');
        });
    });
});
