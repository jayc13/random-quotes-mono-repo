import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import path from 'path';

export default defineWorkersConfig({
	test: {
		watch: false,
		silent: true,
		path: './src/services/**/*.test.ts',
		coverage: {
			enabled: true,
			include: [
				'src/services/*.{ts,tsx}',
				'src/controllers/*.{ts,tsx}',
				'src/validators/*.{ts,tsx}',
			],
			provider: 'istanbul',
			reporter: ['text', 'html'],
		},
		poolOptions: {
			workers: {
				wrangler: { configPath: './wrangler.jsonc' },
			},
		},
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	},
});
