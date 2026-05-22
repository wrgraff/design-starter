// ────────────────────────────────────────────────────────────────
// GENERATED FILE — do not edit by hand.
//
// Regenerate after every migration:
//   pnpm db:types
//
// This file is the placeholder stub. It will be overwritten by
// `supabase gen types typescript --local` with the real schema once
// you run `pnpm db:start && pnpm db:types`.
//
// See docs/DATABASE.md → Generated Types.
// ────────────────────────────────────────────────────────────────

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
	public: {
		Tables: Record<string, never>;
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
}
