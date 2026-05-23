# Database

This project uses **Supabase** (Postgres + Auth + Storage + Realtime). This document is the operational guide.

For the _why_, see [`ARCHITECTURE.md`](./ARCHITECTURE.md) → _Why Supabase_. For _the rules_, see [`../AGENTS.md`](../AGENTS.md) → _Database Rules_.

## Setup

This project uses a **hosted Supabase project** — no local Docker required. Migrations live in `supabase/migrations/` as plain SQL files committed to the repo, and are pushed to the hosted DB via the CLI.

### First-time

1. Create a project at <https://supabase.com> → **New project**.
2. Project Settings → API → copy **Project URL** and **anon public** key into `.env`:
   ```env
   PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   ```
3. Link the CLI and push the schema:
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   pnpm db:push           # apply all migrations to the hosted DB
   pnpm db:types:linked   # regenerate src/lib/types/database.types.ts
   ```

For production/Netlify env vars see [`DEPLOY.md`](./DEPLOY.md).

## Daily Workflow

### Add or change a table

```bash
pnpm db:migration:new add_songs_table
# Creates supabase/migrations/<timestamp>_add_songs_table.sql

# Edit the new file — write CREATE TABLE / ALTER TABLE / etc.
# Always add RLS policies in the same migration.

pnpm db:push             # apply to hosted DB
pnpm db:types:linked     # regenerate src/lib/types/database.types.ts
```

Commit both the migration file and the regenerated types file.

### Inspect the schema

Supabase Studio: <https://supabase.com/dashboard> → your project → Table Editor / SQL Editor.

## Row Level Security (RLS)

RLS is the authorization layer. The anon key is "public" — anyone with it can attempt any query. RLS policies decide which queries actually succeed.

**Every table must have RLS enabled.** Tables without policies are inaccessible by default — that is the safe state.

Pattern: for a typical user-owned table:

```sql
-- Migration: create table notes
CREATE TABLE notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read their own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users can insert their own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update their own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can delete their own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);
```

Patterns for common cases:

| Need                                         | Policy shape                                                                                 |
| -------------------------------------------- | -------------------------------------------------------------------------------------------- |
| User-owned rows                              | `auth.uid() = user_id`                                                                       |
| Public read, owner write                     | `SELECT USING (true)` + write policies scoped to owner                                       |
| Admin override                               | Check a `role` column on a `profiles` table, or check `auth.email() = ANY(ARRAY['admin@…'])` |
| Public anonymous-only insert (e.g. waitlist) | `INSERT WITH CHECK (true)` + `SELECT` disabled                                               |

When policies start getting complex, write them as **security definer functions** instead — easier to test and audit.

Forbidden: disabling RLS on a table to "fix" a permission issue. Fix the policy, not the safety net.

## Generated Types

`src/lib/types/database.types.ts` is generated from the linked hosted project by:

```bash
pnpm db:types:linked
```

This produces a fully-typed `Database` interface used by both clients:

```ts
import type { Database } from '$lib/types/database.types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient<Database>(url, key);

// Now supabase.from('notes').select() is fully typed end-to-end.
```

**Do not edit `database.types.ts` by hand.** Regenerate after every migration.

The file is committed to the repo so that fresh clones and CI builds have IntelliSense and type-checking immediately. The downside is noisy diffs on every schema change — accept those as the price.

## Browser vs Server Clients

Two clients live in the code:

### Browser client — `src/lib/supabase.ts`

```ts
import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database.types';

export const supabase = createBrowserClient<Database>(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY
);
```

Uses the anonymous key. Reads/writes go through RLS. Safe to use in `+page.svelte` or any client-side code.

### Server client — `src/lib/server/supabase.ts`

Created per-request in `src/hooks.server.ts`. Attached to `event.locals.supabase`. Use it in `+page.server.ts`, `+server.ts`, and form actions.

```ts
// +page.server.ts
export const load = async ({ locals }) => {
  const { data, error } = await locals.supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return { notes: data };
};
```

Server-side queries respect the user's session cookie, so RLS works the same way as on the client.

### Service-role client

The service-role key **bypasses RLS**. Use it only for trusted server-side tasks (background jobs, admin operations, seeding). Never expose to the browser.

```ts
// src/lib/server/supabase-admin.ts
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

export const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
```

Only imported from files under `src/lib/server/` or routes that already are server-only.

## Seeding

`supabase/seed.sql` holds dev fixtures. Run them via the Supabase Studio SQL editor (Dashboard → SQL Editor) — seeds are not pushed by the CLI.

For idempotent fixtures:

```sql
INSERT INTO notes (id, user_id, title, body) VALUES
  ('00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000000',
   'Welcome',
   'This is a seeded note.')
ON CONFLICT (id) DO NOTHING;
```

## Realtime

Realtime is enabled per-table:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
```

Subscribe from the browser:

```ts
supabase
  .channel('notes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, (payload) => {
    // update local state
  })
  .subscribe();
```

Used sparingly — most features do not need realtime. See `src/lib/features/notes/` for an example, if the optional notes feature is kept.

## Storage

Buckets are created via migration or via Supabase Studio. RLS-style policies apply.

For uploads, prefer server-side signed URLs over direct browser uploads — gives more control and audit.

## Troubleshooting

| Symptom                                                                       | Likely cause                                                                              |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `relation "X" does not exist`                                                 | Migration not applied. Run `pnpm db:push`.                                                |
| `new row violates row-level security policy`                                  | Missing or incorrect RLS policy. Check the policy against the operation.                  |
| Types out of date / `Property 'foo' does not exist on type` after a migration | Regenerate: `pnpm db:types:linked`.                                                       |
| Anon key works but inserts silently return empty data                         | RLS policy returning no rows from `SELECT` after insert — see `auth.uid()` in the policy. |

For Supabase-specific docs: <https://supabase.com/docs>.
