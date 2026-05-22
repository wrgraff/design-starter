# Plan

Status and roadmap for the **design-starter** template.

Read this together with [`AGENTS.md`](./AGENTS.md) (the rules) and [`docs/HANDOFF.md`](./docs/HANDOFF.md) (instructions for the agent picking up the next batch of work).

## What This Is

A SvelteKit + Supabase + PWA template built for **AI-agent-driven development**. Features are isolated in self-contained folders, the design system is token-based, and prototypes are imported as references — never copied as code.

## Locked-in Decisions

| Topic                   | Decision                                                                                | Notes                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Framework               | SvelteKit 2 + Svelte 5 (runes)                                                          | TypeScript strict. No React, no Vue.                                                   |
| Styling                 | Tailwind v4 with `@theme` tokens in `src/app.css`                                       | No `tailwind.config.js`. No CSS-in-JS.                                                 |
| Design tokens           | Semantic names (`primary`, `muted-foreground`, ...), shadcn-style                       | Light + dark, both calibrated for WCAG AA.                                             |
| Icons                   | `@lucide/svelte` (component-based, tree-shakeable)                                      | NOT icon fonts. NOT Material Symbols.                                                  |
| Backend                 | Supabase (Postgres + Auth + Storage)                                                    | Local via Supabase CLI, prod via hosted project.                                       |
| Auth                    | Optional module, removable at template init                                             | Email/password + magic link + Google by default.                                       |
| PWA                     | `@vite-pwa/sveltekit` with autoUpdate strategy                                          | Installable, offline-aware, manifest + service worker.                                 |
| Deploy                  | Netlify with `@sveltejs/adapter-netlify`                                                | Adapter swappable in one line.                                                         |
| Package manager         | pnpm 9+                                                                                 | Not npm, not yarn.                                                                     |
| Architecture            | Feature folders in `src/lib/features/<name>/`                                           | Each feature is a firewall: bad code stays inside its folder, rewritable from scratch. |
| Prototypes              | `prototypes/<name>.md` (spec, committed) + `prototypes/<name>/` (code dump, gitignored) | Never imported, never copied. Read for logic only.                                     |
| A11y                    | WCAG 2.1 AA baseline, treated as a separate layer                                       | Compile-time + axe + manual. See `docs/A11Y.md`.                                       |
| Template name           | `design-starter`                                                                        |                                                                                        |
| Database types          | Committed to repo (`src/lib/types/database.types.ts`)                                   | Regenerated via `pnpm db:types` after every migration.                                 |
| Class merging           | `cn()` from `$lib/utils/cn` using `clsx` + `tailwind-merge`                             |                                                                                        |
| Implementation priority | Consistency, isolation, code reuse > pixel-perfect matching                             | When in doubt, pick the clean version.                                                 |
| Legacy policy           | Update all call sites in the same task                                                  | No compatibility shims unless explicitly asked.                                        |
| Content safety          | Never modify user-authored content/copy unprompted                                      |                                                                                        |

## Progress

### Done

- **Documentation** (15 markdown files):
  - `AGENTS.md` — agent rules with mandatory blocks, forbidden patterns, pre-merge checklist
  - `README.md`, `CONTRIBUTING.md`, `LICENSE`
  - `docs/ARCHITECTURE.md`, `docs/FEATURES.md`, `docs/IMPORTING-DESIGNS.md`
  - `docs/DESIGN-SYSTEM.md`, `docs/COMPONENTS.md`, `docs/A11Y.md`
  - `docs/DATABASE.md`, `docs/AUTH.md`, `docs/PWA.md`, `docs/DEPLOY.md`
  - `docs/CONVENTIONS.md`
  - `prototypes/README.md`
- **Configs**: `package.json`, `tsconfig.json`, `svelte.config.js`, `vite.config.ts`, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `lefthook.yml`, `netlify.toml`, `.gitignore`, `.env.example`, `.editorconfig`, `.npmrc`, `.nvmrc`, `.vscode/extensions.json`, `.vscode/settings.json`
- **Base source**:
  - `src/app.html` (PWA meta + no-flash dark theme script)
  - `src/app.css` (Tailwind v4 + full token system, light + dark, motion, base styles)
  - `src/app.d.ts` (Locals/PageData types for Supabase session)
  - `src/hooks.server.ts` (per-request Supabase client + `safeGetSession()` helper)
  - `src/lib/supabase.ts` (browser client)
  - `src/lib/server/supabase.ts` (server client factory)
  - `src/lib/types/database.types.ts` (placeholder stub, overwritten by `pnpm db:types`)
  - `src/lib/utils/cn.ts` + `utils/index.ts`
  - `src/lib/icons/Icon.svelte` + `icons/index.ts`
  - `src/lib/components/ui/`: `Button`, `Input`, `Textarea`, `Label`, `Card`, `Dialog` + `index.ts`
- **Routes**: `src/routes/+layout.svelte` (imports app.css, registers SW), `src/routes/+layout.server.ts` (surfaces session/user), `src/routes/+page.svelte` (smoke test of primitives)
- **Static**: `static/favicon.svg`, `static/icons/README.md` (placeholder notes)
- **Tests**: `tests/setup.ts`, Playwright E2E + axe (`tests/e2e/*`)

### Completed In This Cycle

1. **Build verification** — `check/lint/build` fixed and green.
2. **PWA icons** — generated and wired.
3. **Supabase setup** — `supabase/config.toml`, initial `notes` migration, generated DB types.
4. **Feature `notes`** — isolated CRUD feature + route integration + tests.
5. **Feature `theme-toggle`** — isolated feature with persisted preference and route-level integration.
6. **Optional auth module** — login/signup/magic-link/OAuth callback routes + server actions + admin role wiring.
7. **`init-project` script** — interactive initializer with optional auth removal and token/manifest updates.
8. **Token contrast script** — `scripts/check-contrast.mjs` + `scripts/contrast-pairs.json`.
9. **Playwright + axe** — `playwright.config.ts`, smoke test, a11y test.
10. **CI workflow** — `.github/workflows/ci.yml` with quality + e2e jobs.
11. **README polish + final verification** — scripts/docs aligned to current behavior.

## How to Continue

Open the repo in Claude Code (or Cursor / Aider / similar) and point it at [`docs/HANDOFF.md`](./docs/HANDOFF.md). That file remains the handoff playbook for future template iterations.

For human reference:

```bash
# First time setup
pnpm install
cp .env.example .env  # leave Supabase placeholders for now
pnpm db:start          # requires Docker + Supabase CLI
pnpm db:migrate
pnpm db:types
pnpm dev               # http://localhost:5173
```
