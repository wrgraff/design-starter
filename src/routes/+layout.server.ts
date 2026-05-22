import type { LayoutServerLoad } from './$types';

/**
 * Surface session + user to every page via `data.session` / `data.user`.
 * Set in `hooks.server.ts`. Server load runs on every navigation.
 */
export const load: LayoutServerLoad = async ({ locals }) => ({
	session: locals.session,
	user: locals.user
});
