<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Card } from '$lib/components/ui';

	interface Props {
		title: string;
		description?: string;
		children: Snippet;
		footer?: Snippet;
	}

	let { title, description, children, footer }: Props = $props();
</script>

<Card class="w-full max-w-md space-y-5 p-6">
	<header class="space-y-1">
		<h1 class="text-xl font-semibold tracking-tight">{title}</h1>
		{#if description}
			<p class="text-muted-foreground text-sm">{description}</p>
		{/if}
	</header>

	<div class="space-y-4">
		{@render children()}
	</div>

	{#if footer}
		<footer class="border-border border-t pt-4 text-sm">
			{@render footer()}
		</footer>
	{/if}
</Card>
