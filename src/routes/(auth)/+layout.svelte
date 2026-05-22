<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<main class="mx-auto flex min-h-dvh w-full max-w-5xl items-center justify-center px-4 py-10">
	{@render children()}
</main>
