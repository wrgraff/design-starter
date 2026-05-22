<script lang="ts">
	import { Button, Input, Label } from '$lib/components/ui';
	import type { MagicLinkFormState } from './auth.types';

	interface Props {
		state?: MagicLinkFormState;
		next?: string;
	}

	let { state, next }: Props = $props();

	const values = $derived(state?.values ?? { email: '' });
	const fieldErrors = $derived(state?.fieldErrors ?? {});
</script>

<form method="POST" action="?/magicLink" class="space-y-3" novalidate>
	{#if next}
		<input type="hidden" name="next" value={next} />
	{/if}

	<div class="space-y-1.5">
		<Label for="magic-link-email">Email</Label>
		<Input
			id="magic-link-email"
			type="email"
			name="email"
			autocomplete="email"
			required
			value={values.email}
			invalid={Boolean(fieldErrors.email)}
		/>
		{#if fieldErrors.email}
			<p class="text-destructive text-xs">{fieldErrors.email}</p>
		{/if}
	</div>

	{#if state?.formError}
		<p class="text-destructive text-xs">{state.formError}</p>
	{/if}

	<Button type="submit" variant="secondary" class="w-full">Send magic link</Button>
</form>
