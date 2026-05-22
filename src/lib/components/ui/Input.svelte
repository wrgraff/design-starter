<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils/cn';

	interface Props extends Omit<HTMLInputAttributes, 'class' | 'type'> {
		type?: string;
		value?: string | number | null;
		invalid?: boolean;
		class?: string;
	}

	let {
		type = 'text',
		value = $bindable(''),
		invalid = false,
		class: className,
		...rest
	}: Props = $props();
</script>

<input
	{type}
	bind:value
	aria-invalid={invalid || undefined}
	class={cn(
		'border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm',
		'transition-colors',
		'file:text-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium',
		'placeholder:text-muted-foreground',
		'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
		'disabled:cursor-not-allowed disabled:opacity-50',
		invalid && 'border-destructive ring-destructive/20 focus-visible:ring-destructive',
		className
	)}
	{...rest}
/>
