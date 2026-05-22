# {{PROJECT_NAME}}

> {{PROJECT_DESCRIPTION}}

Built from **svelte-pwa-template** — a SvelteKit + Supabase template designed for **AI-agent-driven development** with strict feature isolation, a token-driven design system, and a workflow for porting prototypes from Claude Design / Figma Make / Lovable.

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

Prerequisites: Node.js 20+, pnpm 9+, Docker (for local Supabase), Supabase CLI.

```bash
pnpm install
cp .env.example .env       # fill in values
pnpm db:start              # local Supabase (Docker)
pnpm db:migrate            # apply migrations
pnpm db:types              # generate TS types
pnpm dev                   # http://localhost:5173
```

## Scripts

- `pnpm dev` — local dev server
- `pnpm build` — production build
- `pnpm preview` — preview production build
- `pnpm check` — `svelte-check` (types + a11y compile checks)
- `pnpm lint` — ESLint
- `pnpm format` — Prettier write
- `pnpm test` — Vitest
- `pnpm test:a11y` — Playwright + axe-core
- `pnpm test:all` — full suite
- `pnpm db:start` / `pnpm db:stop` — local Supabase
- `pnpm db:migration:new <name>` — new migration
- `pnpm db:migrate` — apply migrations
- `pnpm db:reset` — reset local DB
- `pnpm db:types` — regenerate `src/lib/types/database.types.ts`
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

It asks: project name, description, repo URL, whether to keep the optional auth module, local vs remote Supabase, and a base brand color. Then it replaces placeholders across the repo, installs deps, and prints the next steps.

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
