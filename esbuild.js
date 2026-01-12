const esbuild = require("esbuild");
const fs = require('fs');
const path = require('path');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matchers',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

/**
 * @type {import('esbuild').Plugin}
 */
const copyHtmlPlugin = {
	name: 'copy-html',
	setup(build) {
		build.onEnd(() => {
			try {
				fs.copyFileSync(
					path.join(__dirname, 'src/webview/index.html'),
					path.join(__dirname, 'dist/index.html')
				);
				console.log('[build] copied index.html to dist/');
			} catch (e) {
				console.error('[build] failed to copy index.html', e);
			}
		});
	}
};

async function main() {
	const ctxExtension = await esbuild.context({
		entryPoints: [
			'src/extension.ts'
		],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'dist/extension.js',
		external: ['vscode'],
		logLevel: 'silent',
		plugins: [
			esbuildProblemMatcherPlugin,
		],
	});

	const ctxWebview = await esbuild.context({
		entryPoints: [
			'src/webview/main.ts'
		],
		bundle: true,
		format: 'iife',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'browser',
		outfile: 'dist/webview.js',
		logLevel: 'silent',
		plugins: [
			esbuildProblemMatcherPlugin,
			copyHtmlPlugin
		],
	});

	if (watch) {
		await Promise.all([
			ctxExtension.watch(),
			ctxWebview.watch()
		]);
	} else {
		await Promise.all([
			ctxExtension.rebuild(),
			ctxWebview.rebuild()
		]);
		await Promise.all([
			ctxExtension.dispose(),
			ctxWebview.dispose()
		]);
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
