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
const copyAssetsPlugin = {
	name: 'copy-assets',
	setup(build) {
		build.onEnd(() => {
			try {
				const assets = ['index.html', 'index.css'];
				assets.forEach(asset => {
					fs.copyFileSync(
						path.join(__dirname, 'src/webview', asset),
						path.join(__dirname, 'dist', asset)
					);
				});
				console.log('[build] copied assets to dist/');
			} catch (e) {
				console.error('[build] failed to copy assets', e);
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
			copyAssetsPlugin
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
