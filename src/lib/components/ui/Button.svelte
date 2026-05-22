<script lang="ts" module>
	export type ButtonVariant =
		| 'default'
		| 'secondary'
		| 'destructive'
		| 'outline'
		| 'ghost'
		| 'link';

	export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

	export const buttonVariants: Record<ButtonVariant, string> = {
		default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
		secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
		destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
		outline:
			'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
		ghost: 'hover:bg-accent hover:text-accent-foreground',
		link: 'text-primary underline-offset-4 hover:underline'
	};

	export const buttonSizes: Record<ButtonSize, string> = {
		sm: 'h-8 rounded-md px-3 text-sm',
		md: 'h-9 px-4 py-2 text-sm',
		lg: 'h-10 rounded-md px-6 text-base',
		icon: 'h-9 w-9'
	};

	import { cn } from '$lib/utils/cn';

	export interface ButtonStyleProps {
		variant?: ButtonVariant;
		size?: ButtonSize;
		class?: string;
	}

	export function buttonClasses({
		variant = 'default',
		size = 'md',
		class: className
	}: ButtonStyleProps = {}): string {
		return cn(
			'inline-flex items-center justify-center gap-2 rounded-md font-medium',
			'focus-visible:ring-ring transition-colors focus-visible:ring-2 focus-visible:ring-offset-2',
			'focus-visible:ring-offset-background focus-visible:outline-none',
			'disabled:pointer-events-none disabled:opacity-50',
			buttonVariants[variant],
			buttonSizes[size],
			className
		);
	}
</script>

<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { Loader2 } from '@lucide/svelte';

	interface Props extends Omit<HTMLButtonAttributes, 'class'> {
		variant?: ButtonVariant;
		size?: ButtonSize;
		loading?: boolean;
		class?: string;
		children: Snippet;
	}

	let {
		variant = 'default',
		size = 'md',
		loading = false,
		disabled,
		type = 'button',
		class: className,
		children,
		...rest
	}: Props = $props();
</script>

<button
	{type}
	disabled={disabled || loading}
	aria-busy={loading || undefined}
	class={buttonClasses({ variant, size, class: className })}
	{...rest}
>
	{#if loading}
		<Loader2 size={16} class="animate-spin" aria-hidden="true" />
	{/if}
	{@render children()}
</button>
