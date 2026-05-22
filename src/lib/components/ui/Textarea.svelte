<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils/cn';

	interface Props extends Omit<HTMLTextareaAttributes, 'class'> {
		value?: string | null;
		invalid?: boolean;
		class?: string;
	}

	let {
		value = $bindable(''),
		invalid = false,
		rows = 3,
		class: className,
		...rest
	}: Props = $props();
</script>

<textarea
	bind:value
	{rows}
	aria-invalid={invalid || undefined}
	class={cn(
		'border-input bg-background flex w-full rounded-md border px-3 py-2 text-sm shadow-sm',
		'transition-colors',
		'placeholder:text-muted-foreground',
		'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
		'disabled:cursor-not-allowed disabled:opacity-50',
		'resize-y',
		invalid && 'border-destructive ring-destructive/20 focus-visible:ring-destructive',
		className
	)}
	{...rest}
></textarea>
