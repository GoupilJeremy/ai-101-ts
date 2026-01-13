import * as assert from 'assert';
import * as vscode from 'vscode';

suite('AI 101 Extension Integration Test Suite', () => {
	vscode.window.showInformationMessage('Starting AI 101 Integration Tests...');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('GoupilJeremy.ai-101-ts'));
	});

	test('Extension should activate', async () => {
		const extension = vscode.extensions.getExtension('GoupilJeremy.ai-101-ts');
		if (extension) {
			await extension.activate();
			assert.strictEqual(extension.isActive, true);
		} else {
			assert.fail('Extension not found');
		}
	});

	test('Commands should be registered', async () => {
		const commands = await vscode.commands.getCommands(true);
		const ai101Commands = [
			'ai-101-ts.helloWorld',
			'ai-101-ts.applyPreset',
			'ai-101-ts.exportConfig',
			'ai-101-ts.importConfig'
		];

		for (const cmd of ai101Commands) {
			assert.ok(commands.includes(cmd), `Command ${cmd} should be registered`);
		}
	});

	test('Configuration defaults should be correct', () => {
		const config = vscode.workspace.getConfiguration('ai101');
		assert.strictEqual(config.get('llm.provider'), 'openai');
		assert.strictEqual(config.get('ui.transparency'), 'medium');
		assert.strictEqual(config.get('ui.mode'), 'learning');
		assert.strictEqual(config.get('performance.maxTokens'), 4096);
		assert.strictEqual(config.get('telemetry.enabled'), true);
	});
});
