# Agent Rules

Source of truth for implementation rules. Read relevant sections for your task — not all of `docs/` upfront.

## Workflow

- **Complete the task. Do not run quality checks after individual edits.** `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm build` run via Lefthook on commit/push automatically. Run them manually only when explicitly asked.
- Read only the docs you need: feature `README.md` if changing a feature, `docs/DATABASE.md` if touching migrations, etc.
- A11y audits, contrast checks, full test suites: apply best-effort during implementation. Run audits (`pnpm test:a11y:full`, `pnpm tokens:check-contrast`) only when explicitly asked.
- Do not bypass Lefthook hooks with `--no-verify`.

## Technology Stack

- `SvelteKit` (Svelte 5, runes) + `TypeScript` (strict).
- `Tailwind CSS v4` — CSS-first, tokens defined in `src/app.css` `@theme`.
- `Supabase` (Postgres + Auth) — hosted project, no local Docker.
- `@lucide/svelte` for icons. `pnpm` as package manager. `@sveltejs/adapter-netlify` for deploy.
- No React. No Vue. No CSS-in-JS. No icon fonts. No npm/yarn.

## Sources of Truth

| What               | Where                                                   |
| ------------------ | ------------------------------------------------------- |
| Design tokens      | `src/app.css` (`@theme`)                                |
| UI primitives      | `src/lib/components/ui/` + `docs/COMPONENTS.md`         |
| Business logic     | `src/lib/features/<name>/`                              |
| DB schema          | `supabase/migrations/*.sql`                             |
| Generated DB types | `src/lib/types/database.types.ts` (do not edit by hand) |
| Env vars           | `.env.example`                                          |
| Prototype specs    | `prototypes/*.md`                                       |

## Feature Isolation (Mandatory)

All business logic lives in `src/lib/features/<name>/`. This is the most important rule.

```
src/lib/features/<name>/
  README.md              ← required: purpose, API, deps, database, state, a11y notes, out of scope
  index.ts               ← public entry point (required)
  index.server.ts        ← server-only public entry (optional)
  <Component>.svelte
  <name>.state.svelte.ts
  <name>.types.ts
  <name>.server.ts
  <name>.test.ts
```

- Import from a feature only via its `index.ts` / `index.server.ts`. Never import internals.
- Features communicate via props/events at the route level. No global stores shared between features.
- Routes (`+page.svelte`, `+layout.svelte`) contain only layout composition — no business logic.
- Generic, reusable, non-business code → `$lib/utils/` or `$lib/components/ui/`.

## Prototypes Policy (Mandatory)

- Prototype code in `prototypes/` must **never** be imported into or copy-pasted into `src/`.
- Read prototypes to understand intent and flows. Write fresh code in this project's architecture.
- Visual values from prototypes (hex, paddings, fonts) must never be copied — replace with design tokens.
- See `docs/IMPORTING-DESIGNS.md` for the porting procedure.

## Svelte 5 Conventions (Mandatory)

Use runes only: `$state`, `$derived`, `$effect`, `$props`, `$bindable`. Use callback props for events. Use `Snippet` + `{@render children?.()}` for children.

Forbidden:

- `export let` (Svelte 4 props)
- `$:` reactive statements
- `createEventDispatcher`
- `<slot />` and named slots
- `on:click` event syntax (use `onclick`)
- `.js` source files in `src/` (use `.ts`)
- React syntax: `useState`, `useEffect`, `className`, `onClick`, JSX

## Styling (Mandatory)

All visual values come from tokens in `src/app.css`. Both light and dark themes must work.

Forbidden:

- Arbitrary Tailwind values: `bg-[#3b82f6]`, `text-[#666]`, `rounded-[7px]`, `p-[13px]`
- Hardcoded hex in `style="..."` or CSS files outside `src/app.css`
- Custom font declarations inside components
- Modifying tokens inside feature files

If a needed value is missing from tokens, add a new token to `src/app.css`. See `docs/DESIGN-SYSTEM.md`.

## Accessibility (Best Effort)

Apply accessible patterns by default. Run full audits only when explicitly asked.

Always required (architectural, not audit-dependent):

- Semantic HTML: `<button>` for actions, `<a href>` for navigation, never `<div onclick>`.
- Every form input has `<label>` or `aria-label`. Every icon-only button has `aria-label`.
- Every image has `alt`. Visible focus ring on all interactive elements.
- `tabindex` ≤ `0`.

For full a11y checklist and testing procedure: `docs/A11Y.md`.

## Database Rules (Mandatory)

- All schema changes via migrations: `pnpm db:migration:new <name>`. Do not hand-edit committed migrations.
- After schema changes: `pnpm db:types:linked` to regenerate `src/lib/types/database.types.ts`.
- Every table must have RLS policies.
- Service-role key only in `$lib/server/`. Never in client code.
- No SQL strings concatenated from user input — use Supabase query builder or parameterized RPC.

## Imports

- Use `$lib` alias for internal imports. Use `$app/*` for SvelteKit primitives.
- Never use deep relative paths (`../../../`) to escape a feature folder.
- Inside a feature, relative imports (`./SomeInternal.svelte`) are preferred.

## Content Safety (Mandatory)

Never change user-authored copy (texts in `.md` specs, seed data, route content) unless explicitly asked. If a task seems to require copy changes, ask first.

## Implementation Priority

- Architecture consistency and feature isolation over pixel-perfect prototype matching.
- Small visual differences are acceptable if they preserve the design system.
- Do not add new tokens/primitives just to match a minor prototype detail when an existing pattern works.

## Legacy Policy

When an API/contract changes, update all call sites in the same task. No compatibility shims, dual-parameter support, or fallback branches unless explicitly requested.

## Commands

| Task                         | Command                        |
| ---------------------------- | ------------------------------ |
| Dev server                   | `pnpm dev`                     |
| Type-check                   | `pnpm check`                   |
| Lint                         | `pnpm lint`                    |
| Format                       | `pnpm format`                  |
| Unit tests                   | `pnpm test`                    |
| A11y E2E                     | `pnpm test:a11y`               |
| Full a11y suite              | `pnpm test:a11y:full`          |
| Contrast check               | `pnpm tokens:check-contrast`   |
| Build                        | `pnpm build`                   |
| New migration                | `pnpm db:migration:new <name>` |
| Push migrations to hosted DB | `pnpm db:push`                 |
| Create/reset dev user        | `pnpm db:seed`                 |
| Regenerate DB types          | `pnpm db:types:linked`         |
| Diff schema                  | `pnpm db:diff`                 |
| Init project from template   | `pnpm init-project`            |

Lefthook gates: `pre-commit` runs format/lint/import check. `pre-push` runs `pnpm check` + `pnpm test`.

## Project Structure

```
src/
  app.css                  ← Tailwind v4 + design tokens (@theme)
  hooks.server.ts          ← request-scoped Supabase server hook
  lib/
    components/ui/         ← design-system primitives
    features/<name>/       ← all business logic, isolated
    server/                ← server-only code
    auth/                  ← optional auth module
    icons/Icon.svelte      ← Lucide wrapper
    utils/                 ← pure generic helpers
    types/                 ← shared types incl. database.types.ts
    supabase.ts            ← browser Supabase client
  routes/                  ← layout only, no business logic
supabase/
  migrations/              ← committed SQL migrations
  seed.sql                 ← dev fixtures
prototypes/
  *.md                     ← committed specs
  */                       ← gitignored exports
docs/                      ← extended documentation (read when relevant)
scripts/                   ← init-project, seed-dev-user
```

## Where to Look (Read When Relevant)

- Importing designs / porting prototypes: `docs/IMPORTING-DESIGNS.md`
- Feature-folder pattern: `docs/FEATURES.md`
- Design system, adding tokens: `docs/DESIGN-SYSTEM.md`
- UI primitive contracts: `docs/COMPONENTS.md`
- A11y checklist and testing: `docs/A11Y.md`
- Database / migrations / RLS: `docs/DATABASE.md`
- Auth module: `docs/AUTH.md`
- PWA: `docs/PWA.md`
- Deploy: `docs/DEPLOY.md`
- Architecture overview: `docs/ARCHITECTURE.md`

## When Unsure

- Prefer an existing UI primitive over building a new one.
- Prefer a new design token over a hardcoded value.
- Prefer a small new feature folder over extending an unrelated one.
- Prefer asking one focused question over making three assumptions.
