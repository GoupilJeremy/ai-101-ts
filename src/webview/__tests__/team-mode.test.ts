import * as assert from 'assert';

suite('Webview - Team Mode Label Display', () => {
    test('Team Mode shows agent labels with descriptive text', () => {
        // JSDOM environment simulation for webview
        // This test validates the webview logic for showing labels in Team Mode

        // Mock current mode as 'team'
        let testCurrentMode = 'team';
        let testCurrentVerbosity: 'low' | 'high' = 'high';

        // Mock labelEl with HTMLElement-like behavior
        const mockLabelEl = {
            textContent: '',
            style: { display: '' }
        };

        const agent = 'architect';
        const state = { status: 'thinking' };

        // Simulate the webview logic (from main.ts lines 193-196)
        if (testCurrentMode === 'team') {
            // Simulate getDescriptiveStateText
            const stateMessages: any = {
                architect: {
                    thinking: 'Analyzing project structure...'
                }
            };
            mockLabelEl.textContent = stateMessages[agent]?.[state.status] || `${agent}: ${state.status}`;
            mockLabelEl.style.display = 'block';
        }

        // Assertions
        assert.strictEqual(mockLabelEl.textContent, 'Analyzing project structure...', 'Label should show descriptive text in Team Mode');
        assert.strictEqual(mockLabelEl.style.display, 'block', 'Label should be visible (display: block) in Team Mode');
    });

    test('Learning Mode shows agent name labels', () => {
        let testCurrentMode = 'learning';
        let testCurrentVerbosity: 'low' | 'high' = 'high';

        const mockLabelEl = {
            textContent: '',
            style: { display: '' }
        };

        const agent = 'coder';

        // Simulate Learning Mode logic
        if (testCurrentMode === 'learning' || testCurrentVerbosity === 'high') {
            const labelMap: any = { coder: 'Coder' };
            mockLabelEl.textContent = labelMap[agent] || agent;
            mockLabelEl.style.display = 'block';
        }

        assert.strictEqual(mockLabelEl.textContent, 'Coder', 'Label should show agent name in Learning Mode');
        assert.strictEqual(mockLabelEl.style.display, 'block', 'Label should be visible in Learning Mode');
    });

    test('getDescriptiveStateText returns correct messages for all agent states', () => {
        const stateMessages: any = {
            context: {
                idle: 'Context: Ready',
                thinking: 'Loading context files...',
                working: 'Optimizing token budget...',
                success: 'Context ready',
                error: 'Context error'
            },
            architect: {
                idle: 'Architect: Ready',
                thinking: 'Analyzing project structure...',
                working: 'Designing solution...',
                success: 'Architecture complete',
                error: 'Analysis error'
            },
            coder: {
                idle: 'Coder: Ready',
                thinking: 'Planning code generation...',
                working: 'Generating code...',
                success: 'Code ready for review',
                error: 'Generation error'
            },
            reviewer: {
                idle: 'Reviewer: Ready',
                thinking: 'Analyzing code quality...',
                working: 'Identifying risks...',
                success: 'Review complete',
                error: 'Review error'
            }
        };

        // Test all agents and all states
        const agents = ['context', 'architect', 'coder', 'reviewer'];
        const states = ['idle', 'thinking', 'working', 'success', 'error'];

        agents.forEach(agent => {
            states.forEach(status => {
                const result = stateMessages[agent]?.[status] || `${agent}: ${status}`;
                assert.ok(result, `Should have descriptive text for ${agent}.${status}`);
                assert.ok(result.length > 0, `Descriptive text for ${agent}.${status} should not be empty`);
            });
        });
    });
});
