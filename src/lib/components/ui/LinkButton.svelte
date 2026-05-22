<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { buttonClasses, type ButtonVariant, type ButtonSize } from './Button.svelte';

	interface Props extends Omit<HTMLAnchorAttributes, 'class'> {
		href: string;
		variant?: ButtonVariant;
		size?: ButtonSize;
		class?: string;
		children: Snippet;
	}

	let {
		href,
		variant = 'default',
		size = 'md',
		class: className,
		children,
		...rest
	}: Props = $props();
</script>

<a {href} class={buttonClasses({ variant, size, class: className })} {...rest}>
	{@render children()}
</a>
