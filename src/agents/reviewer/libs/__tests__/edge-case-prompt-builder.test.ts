import * as assert from 'assert';
import { EdgeCasePromptBuilder } from '../edge-case-prompt-builder';

describe('EdgeCasePromptBuilder', () => {
    it('should build comprehensive edge case prompts', () => {
        const prompt = EdgeCasePromptBuilder.buildSystemPrompt();

        assert.ok(prompt.includes('EDGE CASE ANALYSIS'), 'Should include header');
        assert.ok(prompt.includes('Null/Undefined Handling'), 'Should include Null category');
        assert.ok(prompt.includes('Async Error Handling'), 'Should include Async category');
        assert.ok(prompt.includes('Boundary Conditions'), 'Should include Boundary category');
        assert.ok(prompt.includes('Internationalization'), 'Should include i18n category');
    });

    it('should provide valid JSON output format instruction', () => {
        const prompt = EdgeCasePromptBuilder.buildSystemPrompt();
        assert.ok(prompt.includes('JSON OUTPUT FORMAT'), 'Should specify JSON format');
        assert.ok(prompt.includes('"type": "null_undefined"'), 'Should provide type examples');
    });
});
