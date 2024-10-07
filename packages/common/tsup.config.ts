import { defineConfig } from 'tsup';

export default defineConfig({
	entry: {
		index: 'src/index.ts',
		enums: 'src/enums/index.ts',
		interfaces: 'src/interfaces/index.ts',
		schemas: 'src/schemas/index.ts',
		util: 'src/util/index.ts'
	},
	format: ['cjs', 'esm'],
	dts: true,
	target: 'esnext'
});
