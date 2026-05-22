// See https://svelte.dev/docs/kit/types#app for details on the App namespace.

import type { Session, User } from '@supabase/supabase-js';
import type { AuthUser } from '$lib/auth';
import type { createSupabaseServerClient } from '$lib/server/supabase';

declare global {
	namespace App {
		// Error type — extend for typed structured errors.
		// interface Error {}

		interface Locals {
			supabase: ReturnType<typeof createSupabaseServerClient>;
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
			user: AuthUser | null;
		}

		interface PageData {
			session: Session | null;
			user: AuthUser | null;
		}

		// interface PageState {}
		// interface Platform {}
	}
}

export {};
