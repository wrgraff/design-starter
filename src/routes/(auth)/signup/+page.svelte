<script lang="ts">
	import { getEnabledOAuthProviders, providers } from '$lib/auth';
	import {
		AuthCard,
		MagicLinkForm,
		ProviderButtons,
		SignupForm,
		createAuthUiState
	} from '$lib/features/auth';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	const ui = createAuthUiState('password');
	const enabledProviders = getEnabledOAuthProviders(providers);
	const hasOAuth = enabledProviders.length > 0;
	const next = $derived(data.next);
	const nextQuery = $derived(next === '/' ? '' : `?next=${encodeURIComponent(next)}`);
</script>

<svelte:head>
	<title>Sign up | design-starter</title>
	<meta name="description" content="Create an account." />
</svelte:head>

<AuthCard title="Create account" description="Sign up with password, magic link, or provider auth.">
	{#if form?.message}
		<p class="text-success text-sm" role="status" aria-live="polite">{form.message}</p>
	{/if}

	{#if ui.mode === 'password'}
		<SignupForm state={form?.signup} {next} />
	{:else}
		<MagicLinkForm state={form?.magicLink} {next} />
	{/if}

	<button
		type="button"
		class="text-primary text-sm underline-offset-4 hover:underline"
		onclick={ui.toggleMode}
	>
		{ui.mode === 'password' ? 'Use magic link instead' : 'Use password instead'}
	</button>

	{#if hasOAuth}
		<div class="space-y-2">
			<p class="text-muted-foreground text-xs tracking-wide uppercase">Or continue with</p>
			<ProviderButtons {enabledProviders} providerError={form?.providerError} {next} />
		</div>
	{/if}

	<p class="text-muted-foreground text-xs">
		Local dev: confirmation and magic-link emails are available in
		<a class="text-primary underline-offset-4 hover:underline" href="http://127.0.0.1:54324"
			>Mailpit</a
		>.
	</p>

	{#snippet footer()}
		<p class="text-muted-foreground">
			Already have an account?
			<a class="text-primary underline-offset-4 hover:underline" href={`/login${nextQuery}`}
				>Log in</a
			>
		</p>
	{/snippet}
</AuthCard>
