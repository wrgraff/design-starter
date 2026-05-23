# {{PROJECT_NAME}}

> {{PROJECT_DESCRIPTION}}

Built from **design-starter** — a SvelteKit + Supabase template designed for **AI-agent-driven development** with strict feature isolation, a token-driven design system, and a workflow for porting prototypes from Claude Design / Figma Make / Lovable.

## Rules

Implementation and styling rules are split out to:

- [`AGENTS.md`](./AGENTS.md)

`AGENTS.md` is the source of truth for agent-facing and engineering constraints (feature isolation, design tokens, a11y, Svelte 5 conventions, etc.).

Per-feature contracts live in:

- `src/lib/features/<name>/README.md`

UI primitive contracts in:

- [`docs/COMPONENTS.md`](./docs/COMPONENTS.md)

## Stack

- `SvelteKit` (Svelte 5, runes)
- `TypeScript` (strict)
- `Tailwind CSS v4` (CSS-first, `@theme` tokens in `src/app.css`)
- `@lucide/svelte` for icons
- `Supabase` for database, auth, storage
- `@vite-pwa/sveltekit` for PWA
- `@sveltejs/adapter-netlify` for deploy
- `Vitest` + `@axe-core/playwright`

## Quick Start

Prerequisites: Node.js 22+, pnpm 9+, Supabase CLI.

```bash
pnpm install
cp .env.example .env       # fill in Supabase URL and keys (see below)
pnpm dev                   # http://localhost:5173
```

### First-time: create and connect the database

1. Create a project at <https://supabase.com> → **New project**.
2. Project Settings → API → copy **Project URL** and **anon public** key into `.env`:
   ```env
   PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   ```
3. Link the CLI and push the schema:
   ```bash
   supabase login
   supabase link --project-ref <ref>
   pnpm db:push             # apply all migrations to the hosted DB
   pnpm db:types:linked     # regenerate TypeScript types
   ```

### Deploy to Netlify

See [`docs/DEPLOY.md`](./docs/DEPLOY.md) for the full guide. Short version:

1. Netlify → **Add new site** → import the repo.
2. Add env vars in Netlify → Site configuration → Environment variables  
   (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `PUBLIC_APP_URL`).
3. Trigger a deploy — done.

For Playwright E2E/a11y runs (first time on a machine), install browsers once:

```bash
pnpm exec playwright install chromium
```

## Scripts

- `pnpm dev` — local dev server
- `pnpm build` — production build
- `pnpm preview` — preview production build
- `pnpm check` — `svelte-check` (types + a11y compile checks)
- `pnpm lint` — ESLint
- `pnpm format` — Prettier write
- `pnpm test` — Vitest
- `pnpm test:e2e` — Playwright E2E suite
- `pnpm test:a11y` — Playwright + axe-core
- `pnpm test:a11y:full` — strict full-route accessibility suite
- `pnpm test:all` — full suite
- `pnpm tokens:check-contrast` — WCAG contrast checks for design tokens
- `pnpm db:push` — push migrations to hosted Supabase
- `pnpm db:migration:new <name>` — create a new migration file
- `pnpm db:diff` — diff local schema vs hosted
- `pnpm db:types:linked` — regenerate `src/lib/types/database.types.ts` from linked project
- `pnpm init-project` — initialize this template for a new project (one-time)

## Project Structure

- `src/app.css` — design tokens (`@theme`), light + dark
- `src/lib/components/ui/` — design-system primitives (Button, Input, Card, Dialog, ...)
- `src/lib/features/<name>/` — all business logic, isolated per feature
- `src/lib/icons/` — Lucide icon wrapper
- `src/lib/server/` — server-only code (service-role Supabase, etc.)
- `src/lib/utils/` — pure generic helpers
- `src/lib/types/` — shared types incl. generated DB types
- `src/routes/` — SvelteKit routes (layout only — no business logic here)
- `supabase/migrations/` — committed SQL migrations
- `prototypes/` — prototype specs (`.md`, committed) and exports (folders, gitignored)
- `docs/` — extended documentation
- `scripts/` — `init-project` and helpers

## Using as a Template

To start a new project from this template:

```bash
pnpm init-project
```

It asks: project name, description, repo URL, whether to keep the optional auth module, local vs remote Supabase, and a base brand color. Then it replaces placeholders across the repo and prints the next steps.

See [`docs/`](./docs) for the full picture.

## Documentation

- [`AGENTS.md`](./AGENTS.md) — rules for AI agents
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — high-level decisions
- [`docs/FEATURES.md`](./docs/FEATURES.md) — feature-folder pattern
- [`docs/IMPORTING-DESIGNS.md`](./docs/IMPORTING-DESIGNS.md) — porting prototypes
- [`docs/DESIGN-SYSTEM.md`](./docs/DESIGN-SYSTEM.md) — tokens, dark theme, extending
- [`docs/COMPONENTS.md`](./docs/COMPONENTS.md) — UI primitive contracts
- [`docs/A11Y.md`](./docs/A11Y.md) — accessibility requirements and testing
- [`docs/DATABASE.md`](./docs/DATABASE.md) — Supabase, migrations, RLS
- [`docs/AUTH.md`](./docs/AUTH.md) — optional auth module
- [`docs/PWA.md`](./docs/PWA.md) — PWA setup and offline
- [`docs/DEPLOY.md`](./docs/DEPLOY.md) — Netlify + Supabase production
- [`docs/CONVENTIONS.md`](./docs/CONVENTIONS.md) — file naming, commits, PRs

## License

MIT — see [`LICENSE`](./LICENSE).
