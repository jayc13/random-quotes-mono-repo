import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
	test: {
		watch: false,
		path: './src/services/**/*.test.ts',
		coverage: {
			enabled: true,
			include: ['src/services/*.{ts,tsx}'],
			provider: 'istanbul',
			reporter: ['text', 'html'],
		},
		poolOptions: {
			workers: {
				wrangler: { configPath: './wrangler.jsonc' },
			},
		},
	},
});
