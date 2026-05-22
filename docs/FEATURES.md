# Features

This document explains the feature-folder architecture, which is the core organizing principle of this repository.

## Why

This repository is built to be developed primarily through AI agents. Agents do good work in narrow, well-defined scopes and bad work in wide, ambiguous ones. Some agents are smarter than others, and some will produce code you will want to throw out and rewrite later.

The feature-folder pattern exists to make that throw-out-and-rewrite cheap.

A feature folder is a **firewall**:

- Bad code written inside it stays inside it.
- It can be deleted and rewritten from scratch without touching anything outside.
- It has a public contract (`README.md` + `index.ts`) that other code depends on. The contract is small and stable, the internals are anything.

## Anatomy

```
src/lib/features/<name>/
  README.md                  ← contract: what this feature does, its public API
  index.ts                   ← public entry point for client/shared code
  index.server.ts            ← public entry point for server-only code (required when the feature has server code)
  <Component>.svelte         ← one or more Svelte components
  <name>.state.svelte.ts     ← runes-based state (optional)
  <name>.server.ts           ← server-only code (optional)
  <name>.utils.ts            ← pure helpers (optional)
  <name>.types.ts            ← feature-local types
  <name>.test.ts             ← tests
```

The folder name is `kebab-case`. Component files are `PascalCase.svelte`. Everything else is `kebab-case.ts`.

## Public Surface

The only files other code may import from are:

- `index.ts` (client/shared imports)
- `index.server.ts` (server-only imports from `+page.server.ts` / `+server.ts` / server modules)

Good:

```ts
import { SongList } from '$lib/features/song-list';
import type { Song } from '$lib/features/song-list';
```

Forbidden:

```ts
import SongRow from '$lib/features/song-list/SongRow.svelte'; // internal
import { sortSongs } from '$lib/features/song-list/song-list.utils'; // internal
```

If something must be importable from outside, export it from `index.ts`. If it should not be importable from outside, do not export it. This is how the firewall works.

For server-only helpers, export from `index.server.ts` and import **only from server contexts** (`+page.server.ts`, `+server.ts`, `*.server.ts`). `index.server.ts` is **required whenever the feature has any server-side code** — not optional. SvelteKit enforces the `.server` naming convention at compile time: if server-only code (e.g. service-role Supabase client, secret env vars) is imported without the `.server` suffix, it will leak into the browser bundle and cause a build error. Making `index.server.ts` the explicit boundary turns that runtime risk into a compile-time check.

## What May a Feature Depend On

Allowed dependencies:

- `$lib/components/ui/*` — design-system primitives
- `$lib/icons/*` and `@lucide/svelte` — icons
- `$lib/utils/*` — generic pure helpers
- `$lib/types/*` — shared types incl. `database.types.ts`
- `$lib/server/*` — server clients (in `.server.ts` files only)
- `$app/*` — SvelteKit primitives
- Other features — but only via their `index.ts`

Forbidden:

- Direct imports from `prototypes/`
- Deep imports into another feature's internals
- Global stores or singletons that multiple features write to

## Communication Between Features

Most features should be independent. When two features need to communicate, prefer in this order:

1. **Composition at the route level.** Parent route passes data and callbacks through props.
2. **Explicit cross-feature API.** Feature A exports a typed function/store from its `index.ts`, Feature B imports it. Document the dependency in both READMEs.
3. **Context (Svelte `setContext` / `getContext`).** For deeply nested cases where prop-drilling is impractical. Document the context key and shape.

Avoid: global mutable stores shared across unrelated features. They make features impossible to isolate or rewrite.

## The README Contract

Every feature has a `README.md` with these sections, in order. If a section does not apply, write "N/A". Do not omit.

### 1. Purpose

One paragraph. What this feature does. What it does not do.

### 2. Public API

What `index.ts` exports. For each export:

- Type signature
- Props (name, type, required/optional, default, description)
- Events / callback props
- Slots / snippets
- Exposed methods (rare)

### 3. Dependencies

List of:

- UI primitives used (`$lib/components/ui/*`)
- Utils used (`$lib/utils/*`)
- Server modules used (`$lib/server/*`)
- Other features used (and which of their exports)

If the list is long (more than ~6 items), the feature is probably too big — consider splitting.

### 4. Database

- Tables / views / RPC this feature reads or writes
- RLS policies relied on
- Generated types used from `database.types.ts`

### 5. State

- What state this feature owns
- Where it lives (component-local, feature-level store, context, server)
- How it survives navigation (or does not)
- Whether it is shared with other features

### 6. A11y notes

Non-trivial accessibility decisions:

- Focus order and focus management
- Keyboard shortcuts and how to discover them
- Live regions (`aria-live`) and what triggers them
- ARIA roles used and why
- Anything that required a deliberate decision rather than just "follow the AGENTS.md rules"

### 7. Out of Scope

Explicit non-goals to prevent scope creep when extending. Examples:

- "Does not handle bulk operations"
- "Read-only — does not write"
- "English only — no i18n"

## Sizing Heuristics

A feature folder should generally:

- Have between 1 and ~6 Svelte components.
- Have at most ~6 dependencies in its README.
- Be reasonably re-implementable from scratch in a single agent session.

If it grows past these, consider splitting. Two small features that talk via clear APIs are easier to maintain than one big feature with a tangled internal structure.

## Naming

- Folder name describes _what_ the feature is in the user's language, not how it is implemented.
  - Good: `song-list`, `signup`, `profile-editor`, `transcribe-button`.
  - Bad: `use-songs-hook`, `song-fetcher`, `auth-helper`, `with-modal`.
- Prefer noun phrases (`profile-editor`) over verb phrases (`edit-profile`) — features describe things, not actions.
- For variants, suffix: `song-list`, `song-list-compact`. Do not nest variants inside `song-list/`.

## Rewriting a Feature

Because of the firewall, rewriting is straightforward:

1. Read the current `README.md`. That is the contract you must preserve.
2. Read the tests. They are the executable contract.
3. Delete everything in the folder except `README.md`.
4. Rewrite. The tests are the acceptance criteria.
5. Update `README.md` only if the public API genuinely needs to change. If it does, you also update all importers in the same task (see `AGENTS.md` → _Legacy Policy_).

A prompt that works well for an agent:

> Rewrite the feature at `src/lib/features/<name>/`. Read its `README.md` and tests first — they define the contract you must preserve. Use design tokens, our UI primitives, and Svelte 5 runes. Do not change the public API. Run `pnpm test` to verify.

## What Does Not Go in `features/`

- UI primitives (`Button`, `Input`, `Card`, `Dialog`, ...) — these are in `src/lib/components/ui/`. They are not features; they are the alphabet features are built from.
- Generic pure helpers (date formatting, deep equality, etc.) — these are in `src/lib/utils/`.
- Database types, environment types, shared domain types — in `src/lib/types/`.
- Supabase client setup, server-side service-role access — in `src/lib/server/` and `src/lib/supabase.ts`.
- Icons — in `src/lib/icons/`.
- Layout shells, page routing — in `src/routes/`.

The distinction: if a thing has _no business meaning on its own_ and is reusable across features, it is infrastructure (`components/ui`, `utils`, `types`, `server`). If a thing represents _a slice of what the app does for the user_, it is a feature.
