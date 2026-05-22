import { fail, redirect } from '@sveltejs/kit';
import { getEnabledOAuthProviders, providers } from '$lib/auth';
import {
	loginWithPassword,
	readNextFromFormData,
	readNextFromUrl,
	requestMagicLink,
	startOAuth
} from '$lib/features/auth/index.server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) {
		throw redirect(303, readNextFromUrl(url));
	}

	return {
		next: readNextFromUrl(url)
	};
};

export const actions: Actions = {
	login: async ({ locals, request, url }) => {
		const formData = await request.formData();
		const next = readNextFromFormData(formData) ?? readNextFromUrl(url);
		const result = await loginWithPassword({ supabase: locals.supabase }, formData, {
			origin: url.origin,
			next
		});

		if (!result.ok) {
			return fail(result.status, result.data);
		}

		throw redirect(303, result.redirectTo ?? '/');
	},

	magicLink: async ({ locals, request, url }) => {
		const formData = await request.formData();
		const next = readNextFromFormData(formData) ?? readNextFromUrl(url);
		const result = await requestMagicLink({ supabase: locals.supabase }, formData, {
			origin: url.origin,
			next
		});

		if (!result.ok) {
			return fail(result.status, result.data);
		}

		return { message: result.message };
	},

	'oauth-google': async ({ locals, request, url }) => {
		const formData = await request.formData();
		const next = readNextFromFormData(formData) ?? readNextFromUrl(url);
		const enabled = getEnabledOAuthProviders(providers);
		if (!enabled.includes('google')) {
			return fail(400, { providerError: 'Google login is currently disabled.' });
		}

		const oauth = await startOAuth({ supabase: locals.supabase }, 'google', {
			origin: url.origin,
			next
		});

		if (!oauth) {
			return fail(500, { providerError: 'Could not start Google auth. Try again.' });
		}

		throw redirect(303, oauth.url);
	},

	'oauth-github': async ({ locals, request, url }) => {
		const formData = await request.formData();
		const next = readNextFromFormData(formData) ?? readNextFromUrl(url);
		const enabled = getEnabledOAuthProviders(providers);
		if (!enabled.includes('github')) {
			return fail(400, { providerError: 'GitHub login is currently disabled.' });
		}

		const oauth = await startOAuth({ supabase: locals.supabase }, 'github', {
			origin: url.origin,
			next
		});

		if (!oauth) {
			return fail(500, { providerError: 'Could not start GitHub auth. Try again.' });
		}

		throw redirect(303, oauth.url);
	}
};
