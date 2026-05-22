import { defineConfig, devices } from '@playwright/test';

const port = Number.parseInt(process.env.PLAYWRIGHT_PORT ?? '4173', 10);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	timeout: 30_000,
	reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
	use: {
		baseURL,
		trace: 'on-first-retry',
		video: 'retain-on-failure',
		screenshot: 'only-on-failure'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	],
	webServer: {
		command: `pnpm exec vite dev --host 127.0.0.1 --port ${port} --strictPort`,
		url: baseURL,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000
	}
});
