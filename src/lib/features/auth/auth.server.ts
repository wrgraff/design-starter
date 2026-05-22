import type { OAuthProvider } from '$lib/auth';
import type {
	AuthMutationResult,
	AuthRouteOptions,
	CredentialsErrors,
	CredentialsValues,
	MagicLinkErrors,
	MagicLinkValues,
	OAuthStartResult
} from './auth.types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export const EMPTY_CREDENTIALS_VALUES: CredentialsValues = {
	email: '',
	password: ''
};

export const EMPTY_MAGIC_LINK_VALUES: MagicLinkValues = {
	email: ''
};

interface AuthContext {
	supabase: App.Locals['supabase'];
}

function getString(formData: FormData, key: string): string {
	const value = formData.get(key);
	return typeof value === 'string' ? value : '';
}

export function readNextFromUrl(url: URL): string {
	const next = url.searchParams.get('next')?.trim();
	if (!next || !next.startsWith('/')) {
		return '/';
	}

	return next;
}

export function readNextFromFormData(formData: FormData): string | null {
	const next = getString(formData, 'next').trim();
	if (!next || !next.startsWith('/')) {
		return null;
	}

	return next;
}

export function sanitizeCredentials(values: CredentialsValues): CredentialsValues {
	return {
		email: values.email.trim().toLowerCase(),
		password: values.password
	};
}

export function sanitizeMagicLinkValues(values: MagicLinkValues): MagicLinkValues {
	return {
		email: values.email.trim().toLowerCase()
	};
}

export function validateCredentials(values: CredentialsValues): CredentialsErrors {
	const errors: CredentialsErrors = {};

	if (!values.email) {
		errors.email = 'Email is required.';
	} else if (!EMAIL_PATTERN.test(values.email)) {
		errors.email = 'Enter a valid email address.';
	}

	if (!values.password) {
		errors.password = 'Password is required.';
	} else if (values.password.length < MIN_PASSWORD_LENGTH) {
		errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
	}

	return errors;
}

export function validateMagicLink(values: MagicLinkValues): MagicLinkErrors {
	const errors: MagicLinkErrors = {};

	if (!values.email) {
		errors.email = 'Email is required.';
	} else if (!EMAIL_PATTERN.test(values.email)) {
		errors.email = 'Enter a valid email address.';
	}

	return errors;
}

function hasErrors(errors: Array<string | undefined>): boolean {
	return errors.some(Boolean);
}

function parseCredentials(formData: FormData): CredentialsValues {
	return sanitizeCredentials({
		email: getString(formData, 'email'),
		password: getString(formData, 'password')
	});
}

function parseMagicLink(formData: FormData): MagicLinkValues {
	return sanitizeMagicLinkValues({
		email: getString(formData, 'email')
	});
}

function callbackUrl({ origin, next }: AuthRouteOptions): string {
	const callback = new URL('/callback', origin);
	callback.searchParams.set('next', next);
	return callback.toString();
}

export async function loginWithPassword(
	context: AuthContext,
	formData: FormData,
	options: AuthRouteOptions
): Promise<AuthMutationResult> {
	const values = parseCredentials(formData);
	const fieldErrors = validateCredentials(values);

	if (hasErrors(Object.values(fieldErrors))) {
		return {
			ok: false,
			status: 400,
			data: {
				login: {
					values,
					fieldErrors
				}
			}
		};
	}

	const { error } = await context.supabase.auth.signInWithPassword(values);

	if (error) {
		return {
			ok: false,
			status: 401,
			data: {
				login: {
					values,
					fieldErrors: {},
					formError: 'Invalid email or password.'
				}
			}
		};
	}

	return {
		ok: true,
		redirectTo: options.next
	};
}

export async function signupWithPassword(
	context: AuthContext,
	formData: FormData,
	options: AuthRouteOptions
): Promise<AuthMutationResult> {
	const values = parseCredentials(formData);
	const fieldErrors = validateCredentials(values);

	if (hasErrors(Object.values(fieldErrors))) {
		return {
			ok: false,
			status: 400,
			data: {
				signup: {
					values,
					fieldErrors
				}
			}
		};
	}

	const { error } = await context.supabase.auth.signUp({
		email: values.email,
		password: values.password,
		options: {
			emailRedirectTo: callbackUrl(options)
		}
	});

	if (error) {
		return {
			ok: false,
			status: 500,
			data: {
				signup: {
					values,
					fieldErrors: {},
					formError: 'Could not create account. Please try again.'
				}
			}
		};
	}

	return {
		ok: true,
		message: 'Account created. Check your email to confirm sign in.'
	};
}

export async function requestMagicLink(
	context: AuthContext,
	formData: FormData,
	options: AuthRouteOptions
): Promise<AuthMutationResult> {
	const values = parseMagicLink(formData);
	const fieldErrors = validateMagicLink(values);

	if (hasErrors(Object.values(fieldErrors))) {
		return {
			ok: false,
			status: 400,
			data: {
				magicLink: {
					values,
					fieldErrors
				}
			}
		};
	}

	const { error } = await context.supabase.auth.signInWithOtp({
		email: values.email,
		options: {
			emailRedirectTo: callbackUrl(options)
		}
	});

	if (error) {
		return {
			ok: false,
			status: 500,
			data: {
				magicLink: {
					values,
					fieldErrors: {},
					formError: 'Could not send magic link. Please try again.'
				}
			}
		};
	}

	return {
		ok: true,
		message: 'Magic link sent. Check your email.'
	};
}

export async function startOAuth(
	context: AuthContext,
	provider: OAuthProvider,
	options: AuthRouteOptions
): Promise<OAuthStartResult | null> {
	const { data, error } = await context.supabase.auth.signInWithOAuth({
		provider,
		options: {
			redirectTo: callbackUrl(options)
		}
	});

	if (error || !data.url) {
		return null;
	}

	return {
		url: data.url,
		provider
	};
}

export async function signOut(context: AuthContext): Promise<void> {
	await context.supabase.auth.signOut();
}
