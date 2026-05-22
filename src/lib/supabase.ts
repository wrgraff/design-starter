import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database.types';

/**
 * Browser-side Supabase client.
 *
 * Uses the anonymous public key. All queries pass through Row Level
 * Security policies and the user's session cookies. Safe to import from
 * any client-side code (`+page.svelte`, components, ...).
 *
 * For server-side access, use `event.locals.supabase` (set up in
 * `hooks.server.ts`). For service-role bypass-RLS access, see
 * `$lib/server/supabase-admin.ts` if/when it exists.
 *
 * See docs/DATABASE.md for the full picture.
 */
export const supabase = createBrowserClient<Database>(
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_ANON_KEY
);
