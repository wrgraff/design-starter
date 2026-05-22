import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { env } from '$env/dynamic/private';
import { assignAdminRole, parseAdminEmails } from '$lib/auth';
import { createSupabaseServerClient } from '$lib/server/supabase';

const adminEmails = parseAdminEmails(env.ADMIN_EMAILS);

/**
 * Attach a per-request Supabase client and a safe session helper to
 * `event.locals`. Subsequent hooks and loaders can use these.
 *
 * Reads and writes session cookies through SvelteKit's cookies API.
 */
const supabase: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createSupabaseServerClient({
		getAll: () => event.cookies.getAll(),
		setAll: (cookiesToSet) => {
			cookiesToSet.forEach(({ name, value, options }) => {
				event.cookies.set(name, value, { ...options, path: '/' });
			});
		}
	});

	/**
	 * Returns a validated session and user, or nulls.
	 *
	 * `supabase.auth.getSession()` reads from cookies and is fast but trusts
	 * the JWT signature. `getUser()` makes a server call and is authoritative.
	 * We combine them so consumers get both without two await sites.
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		if (!session) {
			return { session: null, user: null };
		}

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();

		if (error) {
			// JWT validation failed — treat as anonymous.
			return { session: null, user: null };
		}

		return { session, user };
	};

	return resolve(event, {
		// Supabase needs to set these response headers to work over SSR;
		// SvelteKit strips others by default for safety.
		filterSerializedResponseHeaders: (name) =>
			name === 'content-range' || name === 'x-supabase-api-version'
	});
};

/**
 * Populate locals.session and locals.user once per request so that pages
 * and endpoints can read them without awaiting.
 */
const session: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = assignAdminRole(user, adminEmails);
	return resolve(event);
};

export const handle = sequence(supabase, session);
