<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { pwaInfo } from 'virtual:pwa-info';
	import { onMount } from 'svelte';
	import { ThemeToggle } from '$lib/features/theme-toggle';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	// Eagerly register the PWA service worker on the client. The lazy import keeps
	// the registration code out of SSR (which has no `window`).
	onMount(async () => {
		if (pwaInfo) {
			const { registerSW } = await import('virtual:pwa-register');
			registerSW({ immediate: true });
		}
	});
</script>

<svelte:head>
	{#if pwaInfo}
		<link
			rel="manifest"
			href={pwaInfo.webManifest.href}
			crossorigin={pwaInfo.webManifest.useCredentials ? 'use-credentials' : undefined}
		/>
	{/if}
</svelte:head>

<div class="min-h-dvh">
	<header class="mx-auto flex w-full max-w-5xl justify-end px-4 pt-4">
		<ThemeToggle />
	</header>

	{@render children()}
</div>
