import { redirect } from '@sveltejs/kit';
import type { AuthUser } from './admin';

interface RequireUserOptions {
	next?: string;
}

function createLoginRedirectUrl(next?: string): string {
	if (!next) {
		return '/login';
	}

	return `/login?next=${encodeURIComponent(next)}`;
}

export function requireUser(
	locals: Pick<App.Locals, 'user'>,
	options: RequireUserOptions = {}
): AuthUser {
	if (!locals.user) {
		throw redirect(303, createLoginRedirectUrl(options.next));
	}

	return locals.user;
}
