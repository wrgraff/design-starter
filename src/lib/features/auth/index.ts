export { default as AuthCard } from './AuthCard.svelte';
export { default as LoginForm } from './LoginForm.svelte';
export { default as SignupForm } from './SignupForm.svelte';
export { default as MagicLinkForm } from './MagicLinkForm.svelte';
export { default as ProviderButtons } from './ProviderButtons.svelte';

export { createAuthUiState } from './auth.state.svelte';
export type { LoginMode } from './auth.state.svelte';

export type {
	AuthActionData,
	CredentialsFormState,
	MagicLinkFormState,
	CredentialsValues,
	MagicLinkValues,
	CredentialsErrors,
	MagicLinkErrors,
	OAuthStartResult,
	AuthMutationResult,
	AuthRouteOptions
} from './auth.types';
