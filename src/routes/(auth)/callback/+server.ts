import { redirect } from '@sveltejs/kit';
import type { EmailOtpType } from '@supabase/supabase-js';
import type { RequestHandler } from './$types';

const ALLOWED_EMAIL_OTP_TYPES: EmailOtpType[] = ['email', 'recovery', 'invite', 'email_change'];

function readNext(url: URL): string {
	const next = url.searchParams.get('next')?.trim();
	if (!next || !next.startsWith('/')) {
		return '/';
	}

	return next;
}

export const GET: RequestHandler = async ({ locals, url }) => {
	const next = readNext(url);
	const code = url.searchParams.get('code');
	const tokenHash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type');

	if (code) {
		const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			throw redirect(303, next);
		}
	}

	if (tokenHash && type && ALLOWED_EMAIL_OTP_TYPES.includes(type as EmailOtpType)) {
		const { error } = await locals.supabase.auth.verifyOtp({
			token_hash: tokenHash,
			type: type as EmailOtpType
		});

		if (!error) {
			throw redirect(303, next);
		}
	}

	throw redirect(303, '/login?error=auth_callback_failed');
};
