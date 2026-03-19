import {defineConfig} from 'orval';

export default defineConfig({
	backend: {
		input: {
			target: './merged.yaml'
		},
		output: {
			target: './src/lib/api/index.ts',
			mode: 'tags-split',
			client: 'fetch',
			clean: true
		}
	}
});
