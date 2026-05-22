import type { OAuthProvider } from '$lib/auth';

export interface CredentialsValues {
	email: string;
	password: string;
}

export interface MagicLinkValues {
	email: string;
}

export interface CredentialsErrors {
	email?: string;
	password?: string;
}

export interface MagicLinkErrors {
	email?: string;
}

export interface CredentialsFormState {
	values: CredentialsValues;
	fieldErrors: CredentialsErrors;
	formError?: string;
}

export interface MagicLinkFormState {
	values: MagicLinkValues;
	fieldErrors: MagicLinkErrors;
	formError?: string;
}

export interface AuthActionData {
	login?: CredentialsFormState;
	signup?: CredentialsFormState;
	magicLink?: MagicLinkFormState;
	providerError?: string;
	message?: string;
}

export type AuthMutationResult =
	| {
			ok: true;
			redirectTo?: string;
			message?: string;
	  }
	| {
			ok: false;
			status: 400 | 401 | 500;
			data: AuthActionData;
	  };

export interface AuthRouteOptions {
	origin: string;
	next: string;
}

export interface OAuthStartResult {
	url: string;
	provider: OAuthProvider;
}
