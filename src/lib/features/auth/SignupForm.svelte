<script lang="ts">
	import { Button, Input, Label } from '$lib/components/ui';
	import type { CredentialsFormState } from './auth.types';

	interface Props {
		state?: CredentialsFormState;
		next?: string;
	}

	let { state, next }: Props = $props();

	const values = $derived(state?.values ?? { email: '', password: '' });
	const fieldErrors = $derived(state?.fieldErrors ?? {});
</script>

<form method="POST" action="?/signup" class="space-y-3" novalidate>
	{#if next}
		<input type="hidden" name="next" value={next} />
	{/if}

	<div class="space-y-1.5">
		<Label for="signup-email">Email</Label>
		<Input
			id="signup-email"
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

	<div class="space-y-1.5">
		<Label for="signup-password">Password</Label>
		<Input
			id="signup-password"
			type="password"
			name="password"
			autocomplete="new-password"
			required
			value={values.password}
			invalid={Boolean(fieldErrors.password)}
		/>
		{#if fieldErrors.password}
			<p class="text-destructive text-xs">{fieldErrors.password}</p>
		{/if}
	</div>

	{#if state?.formError}
		<p class="text-destructive text-xs">{state.formError}</p>
	{/if}

	<Button type="submit" class="w-full">Create account</Button>
</form>
