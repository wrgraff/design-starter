<script lang="ts">
	import { getEnabledOAuthProviders, providers } from '$lib/auth';
	import {
		AuthCard,
		LoginForm,
		MagicLinkForm,
		ProviderButtons,
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
	<title>Login | design-starter</title>
	<meta name="description" content="Sign in to your account." />
</svelte:head>

<AuthCard title="Sign in" description="Use your email and password, magic link, or provider login.">
	{#if form?.message}
		<p class="text-success text-sm" role="status" aria-live="polite">{form.message}</p>
	{/if}

	{#if ui.mode === 'password'}
		<LoginForm state={form?.login} {next} />
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
		Local dev: email links are available in
		<a class="text-primary underline-offset-4 hover:underline" href="http://127.0.0.1:54324"
			>Mailpit</a
		>.
	</p>

	{#snippet footer()}
		<p class="text-muted-foreground">
			No account yet?
			<a class="text-primary underline-offset-4 hover:underline" href={`/signup${nextQuery}`}
				>Sign up</a
			>
		</p>
	{/snippet}
</AuthCard>
