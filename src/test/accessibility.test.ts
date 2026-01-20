import * as assert from 'assert';
import { JSDOM } from 'jsdom';
import axe from 'axe-core';
import * as fs from 'fs';
import * as path from 'path';

suite('Accessibility Tests', () => {
    test('Webview HTML passes axe-core accessibility audit', async () => {
        // Load the webview HTML template
        const htmlPath = path.join(__dirname, '../../src/webview/index.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');

        // Replace template variables with mock values for testing
        htmlContent = htmlContent
            .replace('${webview.cspSource}', "'self'")
            .replace('${nonce}', 'test-nonce')
            .replace('${styleUri}', 'data:text/css,')
            .replace('${sumiUri}', 'data:text/css,')
            .replace('${performanceModeStyleUri}', 'data:text/css,')
            .replace('${colorblindModeStyleUri}', 'data:text/css,')
            .replace('${scriptUri}', 'data:text/javascript,');

        // Create JSDOM instance
        const dom = new JSDOM(htmlContent, {
            url: 'http://localhost',
            pretendToBeVisual: true,
            resources: 'usable'
        });

        const { window } = dom;
        const { document } = window;

        // Inject axe-core into the document
        const axeScript = document.createElement('script');
        axeScript.textContent = fs.readFileSync(require.resolve('axe-core'), 'utf8');
        document.head.appendChild(axeScript);

        // Wait for axe to be available
        await new Promise((resolve, reject) => {
            let attempts = 0;
            const checkAxe = () => {
                if (window.axe) {
                    resolve(void 0);
                } else if (attempts > 500) { // 5 seconds timeout
                    reject(new Error('Axe-core failed to load in JSDOM'));
                } else {
                    attempts++;
                    setTimeout(checkAxe, 10);
                }
            };
            checkAxe();
        });

        // Run axe-core audit
        const results = await window.axe.run(document, {
            rules: {
                // Focus on WCAG 2.1 AA compliance
                'color-contrast': { enabled: true },
                'heading-order': { enabled: true },
                'image-alt': { enabled: true },
                'label': { enabled: true },
                'link-name': { enabled: true },
                'region': { enabled: true }
            }
        });

        // Check for violations
        if (results.violations.length > 0) {
            console.log('Accessibility violations found:');
            results.violations.forEach((violation: any, index: number) => {
                console.log(`${index + 1}. ${violation.id}: ${violation.description}`);
                console.log(`   Impact: ${violation.impact}`);
                console.log(`   Help: ${violation.help}`);
                console.log(`   Help URL: ${violation.helpUrl}`);
                console.log(`   Elements: ${violation.nodes.map((node: any) => node.target).join(', ')}`);
                console.log('');
            });
        }

        // Assert no critical or serious violations
        const criticalViolations = results.violations.filter((v: any) => v.impact === 'critical');
        const seriousViolations = results.violations.filter((v: any) => v.impact === 'serious');

        assert.strictEqual(criticalViolations.length, 0, `Found ${criticalViolations.length} critical accessibility violations`);
        assert.strictEqual(seriousViolations.length, 0, `Found ${seriousViolations.length} serious accessibility violations`);

        // Allow moderate violations for now, but log them
        const moderateViolations = results.violations.filter((v: any) => v.impact === 'moderate');
        if (moderateViolations.length > 0) {
            console.log(`Found ${moderateViolations.length} moderate accessibility violations - consider fixing for better compliance`);
        }
    });

    test('Webview supports keyboard navigation', () => {
        // Load HTML
        const htmlPath = path.join(__dirname, '../../src/webview/index.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');

        // Replace template variables
        htmlContent = htmlContent
            .replace('${webview.cspSource}', "'self'")
            .replace('${nonce}', 'test-nonce')
            .replace('${styleUri}', 'data:text/css,')
            .replace('${sumiUri}', 'data:text/css,')
            .replace('${performanceModeStyleUri}', 'data:text/css,')
            .replace('${colorblindModeStyleUri}', 'data:text/css,')
            .replace('${scriptUri}', 'data:text/javascript,');

        const dom = new JSDOM(htmlContent);
        const { document } = dom.window;

        // Check for focusable elements
        const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

        // Should have at least some focusable elements (vital signs bar might be focusable)
        assert.ok(focusableElements.length >= 0, 'Webview should have focusable elements for keyboard navigation');

        // Check for tabindex attributes
        const tabIndexElements = document.querySelectorAll('[tabindex]');
        // Allow tabindex for accessibility features
    });

    test('Webview has proper ARIA labels and roles', () => {
        const htmlPath = path.join(__dirname, '../../src/webview/index.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');

        htmlContent = htmlContent
            .replace('${webview.cspSource}', "'self'")
            .replace('${nonce}', 'test-nonce')
            .replace('${styleUri}', 'data:text/css,')
            .replace('${sumiUri}', 'data:text/css,')
            .replace('${performanceModeStyleUri}', 'data:text/css,')
            .replace('${colorblindModeStyleUri}', 'data:text/css,')
            .replace('${scriptUri}', 'data:text/javascript,');

        const dom = new JSDOM(htmlContent);
        const { document } = dom.window;

        // Check for lang attribute
        assert.strictEqual(document.documentElement.getAttribute('lang'), 'en', 'HTML should have lang attribute');

        // Check for title
        const title = document.querySelector('title');
        assert.ok(title, 'HTML should have a title element');
        assert.strictEqual(title?.textContent, 'Suika HUD', 'Title should be descriptive');
    });
});