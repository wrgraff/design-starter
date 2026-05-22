import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			// Netlify edge functions: set to true if you need them
			edge: false,
			// Split routes into separate functions (default: true) — keeps cold starts small
			split: true
		}),

		alias: {
			$lib: 'src/lib',
			'$lib/*': 'src/lib/*'
		},

		// Strict CSP-friendly inline scripts disabled by default; opt-in per project
		csp: {
			mode: 'auto'
		},

		// Service worker is handled by @vite-pwa/sveltekit, disable SvelteKit's built-in
		serviceWorker: {
			register: false
		}
	},

	// Promote a11y warnings to be visible during dev and CI
	// (svelte-check treats them as errors via our pnpm check script)
	compilerOptions: {
		runes: true
	}
};

export default config;
