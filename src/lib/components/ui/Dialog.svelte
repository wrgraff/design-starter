<script lang="ts">
	import type { Snippet } from 'svelte';
	import { X } from '@lucide/svelte';
	import { cn } from '$lib/utils/cn';

	interface Props {
		open: boolean;
		title: string;
		description?: string;
		dismissible?: boolean;
		class?: string;
		children: Snippet;
		footer?: Snippet;
		onclose?: () => void;
	}

	let {
		open = $bindable(),
		title,
		description,
		dismissible = true,
		class: className,
		children,
		footer,
		onclose
	}: Props = $props();

	let dialogEl: HTMLDialogElement;

	// Stable IDs for ARIA wiring across re-renders.
	const titleId = `dialog-title-${crypto.randomUUID()}`;
	const descId = `dialog-desc-${crypto.randomUUID()}`;

	$effect(() => {
		if (!dialogEl) return;
		if (open && !dialogEl.open) {
			dialogEl.showModal();
		} else if (!open && dialogEl.open) {
			dialogEl.close();
		}
	});

	function close() {
		if (open) {
			open = false;
			onclose?.();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (!dismissible) return;
		// Backdrop click registers on the <dialog> itself (target === currentTarget)
		// whereas clicks inside the content land on child elements.
		if (event.target === dialogEl) {
			close();
		}
	}

	function handleCancel(event: Event) {
		// Native <dialog> 'cancel' fires on Escape.
		if (!dismissible) {
			event.preventDefault();
			return;
		}
		// Let the native close happen; sync state afterwards.
		queueMicrotask(close);
	}
</script>

<dialog
	bind:this={dialogEl}
	aria-labelledby={titleId}
	aria-describedby={description ? descId : undefined}
	onclick={handleBackdropClick}
	oncancel={handleCancel}
	class={cn(
		'bg-card text-card-foreground border-border max-w-[calc(100vw-2rem)] rounded-lg border p-0 shadow-xl',
		'w-full flex-col open:flex sm:max-w-md',
		'm-auto',
		className
	)}
>
	<div class="flex items-start justify-between gap-4 px-6 pt-6 pb-2">
		<div class="min-w-0">
			<h2 id={titleId} class="text-lg leading-none font-semibold">{title}</h2>
			{#if description}
				<p id={descId} class="text-muted-foreground mt-1.5 text-sm">{description}</p>
			{/if}
		</div>
		{#if dismissible}
			<button
				type="button"
				onclick={close}
				aria-label="Close dialog"
				class={cn(
					'text-muted-foreground hover:text-foreground -mt-1 -mr-2 rounded-md p-1',
					'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none'
				)}
			>
				<X size={18} aria-hidden="true" />
			</button>
		{/if}
	</div>

	<div class="px-6 py-4">
		{@render children()}
	</div>

	{#if footer}
		<div class="border-border flex justify-end gap-2 border-t px-6 py-4">
			{@render footer()}
		</div>
	{/if}
</dialog>
