<script lang="ts">
	import { icons } from '@lucide/svelte';
	import type { ComponentProps } from 'svelte';
	import { cn } from '$lib/utils/cn';

	/**
	 * Generic icon wrapper for cases where the icon name is dynamic
	 * (data-driven, configured, etc).
	 *
	 * For statically-known icons, prefer the direct import:
	 *   import { Home } from '@lucide/svelte';
	 *   <Home size={20} />
	 *
	 * That gives better tree-shaking — the wrapper is convenient but pulls
	 * the full Lucide namespace into the bundle that uses it.
	 *
	 * See docs/COMPONENTS.md → Icon.
	 */

	type LucideIconName = keyof typeof icons;

	interface Props extends Omit<ComponentProps<typeof icons.X>, 'class'> {
		name: LucideIconName;
		class?: string;
	}

	let { name, class: className, size = 18, ...rest }: Props = $props();

	const Component = $derived(icons[name]);
</script>

{#if Component}
	<Component {size} class={cn(className)} aria-hidden="true" {...rest} />
{/if}
