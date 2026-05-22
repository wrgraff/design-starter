<script lang="ts">
	import type { HTMLLabelAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';

	interface Props extends Omit<HTMLLabelAttributes, 'class'> {
		class?: string;
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<label
	class={cn(
		'text-sm leading-none font-medium',
		'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
		className
	)}
	{...rest}
>
	{@render children()}
</label>
