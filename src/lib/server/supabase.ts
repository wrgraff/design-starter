import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database.types';

/**
 * Create a per-request Supabase client for server-side use.
 *
 * Pass the cookie methods from the SvelteKit `event` so that the client
 * reads and writes the user's session cookies correctly.
 *
 * Used in `hooks.server.ts` to populate `event.locals.supabase`. Most code
 * should consume `event.locals.supabase` from `+page.server.ts` /
 * `+server.ts` rather than calling this helper directly.
 *
 * For service-role (bypass-RLS) access, create a separate client with
 * `SUPABASE_SERVICE_ROLE_KEY` in a file under `$lib/server/` and never
 * import it into client code.
 *
 * See docs/DATABASE.md → Browser vs Server Clients.
 */
export function createSupabaseServerClient(cookies: CookieMethodsServer) {
	return createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies
	});
}
