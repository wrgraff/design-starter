<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
		class?: string;
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div class={cn('bg-card text-card-foreground rounded-lg border shadow-sm', className)} {...rest}>
	{@render children()}
</div>
