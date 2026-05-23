# Architecture

This document explains _what is built and why_. For _what the rules are_, see [`../AGENTS.md`](../AGENTS.md). For per-topic detail, see the other docs in this folder.

## Goal

Build small-to-medium web applications quickly, by delegating most of the work to AI agents, without accumulating technical debt.

That goal drives every architectural choice below.

## The Layers

The project has four well-defined layers. Each layer depends only on the ones below it.

```
┌──────────────────────────────────────────────────────────────┐
│  Routes (src/routes/)                                        │
│  Layout composition. No business logic.                      │
└──────────────────────────────────────────────────────────────┘
                              ▲
┌──────────────────────────────────────────────────────────────┐
│  Features (src/lib/features/<name>/)                         │
│  Business logic. Each feature is isolated and replaceable.   │
└──────────────────────────────────────────────────────────────┘
                              ▲
┌──────────────────────────────────────────────────────────────┐
│  Primitives (src/lib/components/ui/, icons/, utils/, ...)    │
│  Reusable building blocks. No business meaning on their own. │
└──────────────────────────────────────────────────────────────┘
                              ▲
┌──────────────────────────────────────────────────────────────┐
│  Tokens (src/app.css `@theme`)                               │
│  Colors, spacing, typography, radii, shadows, motion.        │
│  The single source of visual truth.                          │
└──────────────────────────────────────────────────────────────┘
```

Things never go sideways or up:

- Tokens know nothing about primitives.
- Primitives know nothing about features.
- Features know nothing about routes.
- A feature never imports another feature's internals — only its public API.

## Why Feature Folders

The single most important architectural decision in this repository.

A feature folder (`src/lib/features/<name>/`) is a **firewall**: bad code inside it stays inside it. You can delete the folder and rewrite it from scratch without touching anything else.

This matters because:

- Agents vary in capability — some will produce code you want to discard.
- Requirements shift — what made sense in week 1 looks wrong by week 5.
- Throwing out and rewriting is fine if the cost is bounded. With a feature folder, the cost is "delete folder, write again". With a tangled cross-cutting structure, the cost is "rewrite the project".

The full rules are in [`FEATURES.md`](./FEATURES.md). The README contract inside each feature is the load-bearing piece — it defines the public API so the firewall stays sealed.

## Why Tokens (Not Hardcoded Values)

A token is a semantic name (`--color-primary`) mapped to a concrete value (`oklch(...)`).

Hardcoded values in components produce three problems:

1. **Inconsistency.** Five components use five slightly different greys.
2. **Inflexibility.** Changing the brand color is a project-wide search-and-replace.
3. **Theming impossibility.** Dark mode requires touching every component.

Tokens solve all three. The cost is one extra layer of indirection. The benefit is that the entire visual language can be retuned by editing one file (`src/app.css`).

Details in [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md).

## Why Supabase

We chose Supabase over Postgres + ORM + auth + storage + realtime + cron, because Supabase is all of those wired together correctly out of the box. For the scale of projects this template targets (small-to-medium, single-developer-with-agents), that is a big win.

The downsides are:

- You are coupled to Supabase's choices (e.g. RLS as the only authorization mechanism on the wire).

The upsides:

- Migrations are normal SQL files, committed to the repo. If you ever leave Supabase, you take your schema with you.
- Auth, RLS, storage, realtime — none of which we have to implement.
- Hosted project — no local Docker required. Schema changes are pushed via `pnpm db:push`.

Details in [`DATABASE.md`](./DATABASE.md).

## Why SvelteKit (and Svelte 5)

- Svelte 5 runes are precise and require no boilerplate. Code stays close to the model.
- SvelteKit handles routing, SSR, endpoints, and the build pipeline.
- File-based routing reads like a directory listing of the app's screens — easy for agents and humans.
- Compiled output is small. PWA installability and offline work better when the bundle is small.

This template does not abstract SvelteKit — it embraces it. Use `+page.svelte`, `+layout.svelte`, `+server.ts`, `+page.server.ts` as documented.

## Why Tailwind v4 (CSS-First)

Tailwind v4 lets us define the entire design system inside `src/app.css` using `@theme`. No JS config, no PostCSS config, no `tailwind.config.js`. Tokens are CSS variables, mapped automatically to utility classes.

This collapses two ideas into one file:

- "Here are the design tokens."
- "Here is the Tailwind config."

That is the whole appeal — fewer moving parts, one source of truth.

## Why PWA

For small projects, "installable, offline-aware web app" covers a surprising amount of what you would otherwise need a native app for. The cost is low (a manifest + a service worker), the benefit is real (a tab on the user's home screen, basic offline behavior, push capability if needed later).

The template includes PWA setup with `@vite-pwa/sveltekit`. You can disable it in `vite.config.ts` if a given project does not need it.

Details in [`PWA.md`](./PWA.md).

## Why Netlify

The reference project this template was inspired by deploys to Netlify. SvelteKit has a first-party Netlify adapter. Netlify's build environment is fast and predictable. Preview deploys per branch work out of the box.

Vercel and Cloudflare Pages are also good choices — switching adapters is a one-file change. See [`DEPLOY.md`](./DEPLOY.md) for details and alternatives.

## Data Flow

```
Browser                          Server                      Supabase
─────────────────────────────────────────────────────────────────────
src/lib/supabase.ts        →   anon key + RLS         →     Postgres
(browser-side client)          (subject to user's
                                session cookie)

src/routes/.../+server.ts  →   src/lib/server/         →     Postgres
(API route or load fn)         supabase.ts
                               (anon or service-role,
                                request-scoped)
```

Two clients:

- **Browser client** (`$lib/supabase.ts`) — uses the anonymous public key. All queries are bound by the signed-in user's session (via cookies) and by RLS policies on the tables. Safe to expose to the page bundle.
- **Server client** (`$lib/server/supabase.ts`) — created per-request in `hooks.server.ts`. Either user-scoped (anon key, but reads cookies → respects the user's session) or admin-scoped (service-role key — never sent to the browser, used for tasks like seeding or trusted background work).

Most reads and writes go through the user-scoped clients. RLS is what makes this safe.

Details in [`DATABASE.md`](./DATABASE.md).

## Prototypes → Features

The expected workflow:

1. Generate a UI prototype somewhere (Claude Design, Figma Make, Lovable, ...).
2. Drop the export into `prototypes/<name>/` (gitignored).
3. Write `prototypes/<name>.md` — the spec / TZ for what to build.
4. Ask an agent: _"Port `prototypes/<name>` into `src/lib/features/<name>/` following `docs/IMPORTING-DESIGNS.md`."_
5. Agent produces a clean feature folder with our tokens, our primitives, our conventions.
6. Commit the feature. The prototype stays locally for reference; the spec stays committed as design history.

The spec is the source of truth for _what_ to build. The prototype is the visual reference for _how_ it might look and flow. Neither's code ever enters `src/`.

Details in [`IMPORTING-DESIGNS.md`](./IMPORTING-DESIGNS.md).

## What This Template Is Not

- Not a SaaS starter. There is no billing, no team management, no admin dashboard out of the box.
- Not a CMS or page builder. Pages are code, not data.
- Not opinionated about state management beyond Svelte's runes. There is no global store framework; features own their state.
- Not multi-tenant or i18n-ready by default. Either can be added if a project needs them — there is nothing in the way — but they are not part of the baseline.

## Where Things Go

| You want to add…                          | It goes in…                                                                          |
| ----------------------------------------- | ------------------------------------------------------------------------------------ |
| A new screen                              | `src/routes/<path>/+page.svelte` — composition only                                  |
| A new feature (business logic)            | `src/lib/features/<name>/`                                                           |
| A new UI primitive (Button-like reusable) | `src/lib/components/ui/<Name>.svelte` + entry in `COMPONENTS.md`                     |
| A new icon                                | Just import it from `@lucide/svelte`                                                 |
| A new design token                        | `src/app.css` `@theme` block + entry in `DESIGN-SYSTEM.md`                           |
| A new pure helper                         | `src/lib/utils/<name>.ts`                                                            |
| A shared type                             | `src/lib/types/<name>.ts`                                                            |
| Server-only code                          | `src/lib/server/<name>.ts` (suffix `.server.ts` for files in features)               |
| A new DB table                            | `pnpm db:migration:new <name>` → write SQL + RLS                                     |
| A new env variable                        | `.env.example` (documented) + use via `$env/static/public` or `$env/dynamic/private` |
| A new prototype                           | `prototypes/<name>.md` + `prototypes/<name>/`                                        |
