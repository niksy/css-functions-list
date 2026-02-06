import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

export default defineConfig([
	{
		input: 'index.js',
		output: {
			cleanDir: true,
			dir: 'dist',
			format: 'esm',
			sourcemap: true
		},
		external: [/^[^./]/],
		transform: {
			target: ['node12']
		},
		plugins: [dts({ sourcemap: true })]
	},
	{
		input: 'index.js',
		output: {
			dir: 'dist',
			format: 'cjs',
			entryFileNames: '[name].cjs',
			exports: 'auto',
			sourcemap: true
		},
		external: [/^[^./]/],
		transform: {
			target: ['node12']
		}
	}
]);
