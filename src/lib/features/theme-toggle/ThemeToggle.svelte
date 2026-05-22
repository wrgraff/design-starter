<script lang="ts">
	import { onMount } from 'svelte';
	import { Monitor, Moon, Sun } from '@lucide/svelte';
	import { Button } from '$lib/components/ui';
	import { createThemeState } from './theme.state.svelte';

	const theme = createThemeState();

	onMount(() => {
		theme.start();
		return () => theme.stop();
	});
</script>

<Button
	type="button"
	variant="ghost"
	size="icon"
	aria-label={theme.toggleAriaLabel}
	title={theme.toggleAriaLabel}
	onclick={theme.cyclePreference}
>
	{#if theme.preference === 'light'}
		<Sun size={16} aria-hidden="true" />
	{:else if theme.preference === 'dark'}
		<Moon size={16} aria-hidden="true" />
	{:else}
		<Monitor size={16} aria-hidden="true" />
	{/if}
</Button>
