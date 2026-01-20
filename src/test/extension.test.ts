import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Suika Extension Integration Test Suite', () => {
	vscode.window.showInformationMessage('Starting Suika Integration Tests...');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('GoupilJeremy.suika'));
	});

	test('Extension should activate', async () => {
		const extension = vscode.extensions.getExtension('GoupilJeremy.suika');
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
			'suika.helloWorld',
			'suika.applyPreset',
			'suika.exportConfig',
			'suika.importConfig'
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
