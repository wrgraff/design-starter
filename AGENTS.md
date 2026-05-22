# Agent Rules

This file is the source of truth for implementation rules that AI agents must follow in this repository.

Read this file first before making any changes. For deeper context, see `docs/` and the per-feature `README.md` files in `src/lib/features/<name>/`.

## Operating Assumption

- This repository is built to be developed primarily through AI agents (Claude Code, Cursor, Codex, Aider, etc.).
- The human maintainer writes minimal code by hand. Architecture, decomposition, and documentation must support delegating work to agents safely.
- Every feature must be small enough to be rewritten from scratch by a single agent task without touching anything outside its folder.

## Technology Stack

- `SvelteKit` (Svelte 5, runes) as framework.
- `TypeScript` (strict) as language.
- `Tailwind CSS v4` (CSS-first config via `@theme` in `src/app.css`) for utility styling.
- Custom design tokens (CSS variables) — the single source of truth for visual values.
- `@lucide/svelte` for icons (component-based, tree-shakeable, not a font).
- `Supabase` (Postgres + Auth + Storage) — local via Supabase CLI, prod via hosted project.
- `@vite-pwa/sveltekit` for PWA (manifest + service worker).
- `@sveltejs/adapter-netlify` for deploy.
- `pnpm` as package manager. Do not use npm or yarn.
- `Vitest` for unit/component tests, `@axe-core/playwright` for a11y E2E.
- `ESLint`, `Prettier`, `svelte-check`, `Lefthook` for quality gates.
- No React. No Vue. No CSS-in-JS. No icon fonts.

## Architecture and Sources of Truth (Mandatory)

- Source of truth for design tokens: `src/app.css` (`@theme` block) — colors, spacing, typography, radii, shadows, transitions.
- Source of truth for UI primitives: `src/lib/components/ui/*.svelte` (Button, Input, Card, Dialog, etc.).
- Source of truth for UI primitive contracts: `docs/COMPONENTS.md`.
- Source of truth for icons: `src/lib/icons/Icon.svelte` (thin wrapper) and direct named imports from `@lucide/svelte`.
- Source of truth for business logic: `src/lib/features/<name>/`. Each feature is a self-contained unit with its own README contract.
- Source of truth for database schema: `supabase/migrations/*.sql`.
- Source of truth for generated DB types: `src/lib/types/database.types.ts` (regenerated via `pnpm db:types`, do not edit by hand).
- Source of truth for environment variables: `.env.example` (keys + descriptions).
- Source of truth for project specs/TZ: `prototypes/*.md` paired with `prototypes/<name>/` exported prototype folder.

## Feature Isolation (Mandatory)

This is the most important architectural rule of this repository.

- Every piece of business logic lives in `src/lib/features/<name>/`.
- A feature folder has exactly this shape:
  ```
  src/lib/features/<name>/
    README.md             ← feature contract (REQUIRED)
    index.ts              ← public entry point for client/shared code (REQUIRED)
    index.server.ts       ← public entry point for server-only code (optional)
    <Component>.svelte    ← Svelte components
    <name>.state.svelte.ts ← runes-based state (if any)
    <name>.types.ts       ← feature-local types
    <name>.server.ts      ← server-only code (if any)
    <name>.utils.ts       ← pure helpers (if any)
    <name>.test.ts        ← tests
  ```
- Code outside the feature must import only from the feature's public entry points (`index.ts` and, for server files only, `index.server.ts`). Importing internals (`features/<name>/SomeInternalThing.svelte`) is forbidden.
- A feature may depend on:
  - UI primitives from `$lib/components/ui/`
  - Icons from `$lib/icons/` or `@lucide/svelte`
  - Generic utils from `$lib/utils/`
  - Generic types from `$lib/types/`
  - Server clients from `$lib/server/`
  - Other features only via their public `index.ts`
- A feature must not import another feature's internals.
- A feature must not write to global stores or singletons that other features read. Communication between features goes through:
  - Props/events at the route level (preferred), or
  - Explicit, narrowly-typed cross-feature APIs documented in both READMEs.
- `routes/+page.svelte` and `+layout.svelte` files contain only layout composition. No business logic. They import and arrange features.
- If a piece of code is generic enough to be reused by multiple features and has no business meaning, it belongs in `$lib/utils/` or `$lib/components/ui/`, not in a feature.

## Feature README Contract (Mandatory)

Every feature must have a `README.md` with these sections, in this order:

1. **Purpose** — one paragraph: what this feature does and what it does not do.
2. **Public API** — what is exported from `index.ts`. For each export: type signature, props, events/callbacks, slots/snippets.
3. **Dependencies** — list of `$lib/components/ui/*`, `$lib/utils/*`, `$lib/server/*`, other features used. If the list is long, the feature is probably too big.
4. **Database** — tables/views/RPC functions this feature reads or writes. RLS policies it relies on.
5. **State** — what state it owns, where it lives, how it survives navigation.
6. **A11y notes** — non-trivial a11y decisions (focus order, live regions, keyboard shortcuts).
7. **Out of scope** — explicit non-goals to prevent scope creep when extending.

If a section does not apply, write "N/A" — do not omit it.

## Prototypes Policy (Mandatory)

- Prototypes from Claude Design, Figma Make, Lovable, v0, bolt.new, etc. live in `prototypes/`.
- A prototype is named: a spec file `prototypes/<name>.md` paired with a folder `prototypes/<name>/`.
- The `.md` spec is the source of truth for the prototype's intent. The folder is the visual reference.
- Spec files (`prototypes/*.md`) and `prototypes/README.md` are committed.
- Prototype code folders (`prototypes/<name>/`) are gitignored.
- Code from `prototypes/` must never be imported into `src/`.
- Code from `prototypes/` must never be copy-pasted into `src/`. Read it, understand the logic and flows, write fresh code in this repository's architecture.
- Visual values from prototypes (hex colors, paddings, fonts, shadows, custom radii) must never be copied. Replace with design tokens. If a token is missing, add it via the design-system process — see `docs/DESIGN-SYSTEM.md`.
- See `docs/IMPORTING-DESIGNS.md` for the full porting procedure.

## Svelte 5 Conventions (Mandatory)

- Use runes only: `$state`, `$derived`, `$effect`, `$props`, `$bindable`.
- Use `let { ... } = $props()`. Do not use `export let`.
- Use callback props for events. Do not use `createEventDispatcher`.
- For children, use `Snippet` typing and `{@render children?.()}`. Do not use `<slot />`.
- For DOM events use lowercase: `onclick`, `oninput`, `onchange`. Do not use `on:click` (Svelte 4) or `onClick` (React).
- Component files: `PascalCase.svelte`.
- All other source files: `kebab-case.ts`.

Forbidden:

- `export let foo` (Svelte 4 props)
- `$:` reactive statements (Svelte 4 reactivity)
- `createEventDispatcher` and `dispatch('event')`
- `<slot />` and named slots
- `on:click` event syntax
- React syntax: `useState`, `useEffect`, `useMemo`, `className`, `onClick`, JSX, `.tsx`
- `.js` source files in `src/` (use `.ts`)

## Styling (Mandatory)

- All visual values must come from design tokens defined in `src/app.css` under `@theme`.
- Use Tailwind utility classes that map to tokens: `bg-primary`, `text-foreground`, `text-muted-foreground`, `rounded-md`, `shadow-sm`, etc.
- Both light and dark themes must work. Dark theme is activated by `.dark` class on `<html>`. Every token must have a dark counterpart.
- Inline styles are allowed only for explicit, data-driven exceptions where class-only styling is impractical (for example, a dynamic CSS variable on a single element). Do not use inline styles as a default.

Forbidden:

- Arbitrary Tailwind values for visual properties: `bg-[#3b82f6]`, `text-[#666]`, `rounded-[7px]`, `shadow-[0_4px_12px_rgba(0,0,0,0.1)]`, `p-[13px]`, `text-[15px]`
- Hardcoded hex colors in `style="..."` or in CSS files outside `src/app.css`
- Custom font-family declarations inside components (`font-['Inter']`, `style="font-family: ..."`)
- Importing colors/sizes/fonts from `tailwindcss/colors` or any other framework default palette
- Modifying tokens inside feature files — only `src/app.css` defines tokens

If the design needs a value that does not exist in tokens, add a new token. See `docs/DESIGN-SYSTEM.md` → _Adding a token_.

## Accessibility (Mandatory)

- Target WCAG 2.1 AA as a minimum baseline.
- Accessibility is a non-negotiable quality gate for this repository.
- All interactive elements must be reachable by keyboard with a visible focus ring (`focus-visible` styles, not removed by CSS reset).
- Interactive elements must have semantic HTML: `<button>` for actions, `<a href>` for navigation, never `<div onclick>`.
- Every form input has an associated `<label for="...">` or `aria-label`.
- Every icon-only button has `aria-label`.
- Every image has `alt` (empty `alt=""` for purely decorative images).
- Color is never the only signal — pair color with text or icon.
- Live regions (`aria-live`) for async status updates (toasts, validation, loading).
- Text/background contrast ≥ 4.5:1 (≥ 3:1 for large text). The token system is calibrated for this — using tokens is enough.
- Any change that introduces or modifies UI/UX states (including forms, dialogs, validation, and loading/error states) must include or update a11y tests.
- Run `pnpm test:a11y:full` and `pnpm tokens:check-contrast` before opening a PR. Svelte's compile-time a11y warnings are treated as errors.

Forbidden:

- `<div onclick>` for actions (use `<button>`)
- `tabindex` greater than `0`
- Custom focus styles that remove the focus ring without a replacement
- Color-only error states (a red border alone is not sufficient)
- Decorative elements that capture keyboard focus

See `docs/A11Y.md` for the full checklist and testing procedure.

## Implementation Priority (Mandatory)

- Consistency, isolation, and code reuse have the highest priority.
- Pixel-perfect matching of prototypes is secondary to architecture consistency.
- Small visual differences are acceptable if they preserve the design system.
- Do not introduce new tokens, primitives, or components solely to match a minor visual detail in a prototype when an existing pattern already solves the UI.
- If you must choose: a clean, isolated, system-consistent feature beats a visually exact one.

## Legacy Policy (Mandatory)

- Default behavior: when an API/contract changes inside the repository, update all call sites in the same task.
- Do not add fallback branches, compatibility shims, dual-parameter support, or "legacy support" code unless the user explicitly requests it.
- If a feature's public API changes, update its README contract and all importers in the same task.
- Do not preserve old behavior "just in case".

## Database Rules (Mandatory)

- All schema changes happen via Supabase CLI migrations: `pnpm db:migration:new <name>`.
- Do not hand-edit migration files after they have been committed and applied.
- After any schema change, run `pnpm db:types` to regenerate `src/lib/types/database.types.ts`.
- Every table must have RLS (Row Level Security) policies. New tables without RLS policies will fail review.
- Server-only Supabase access (service-role key) lives only in `$lib/server/`. Never expose service-role keys to client code.
- Client-side Supabase uses anon key + RLS for authorization.

Forbidden:

- `service_role` key imported into anything not in `$lib/server/`
- SQL strings concatenated from user input (use Supabase query builder or parameterized RPC)
- Disabling RLS on a table to "fix" a permission issue (fix the policy instead)

## Optional Auth Module

- Auth is provided as a removable module in `src/lib/auth/` and `src/lib/features/auth/`.
- The `pnpm init-project` script removes these and strips the `(auth)` route group when a project does not need auth.
- See `docs/AUTH.md` for how to add providers, protected routes, and admin roles.

## Imports

- Use the `$lib` alias for all internal imports: `import Button from '$lib/components/ui/Button.svelte'`.
- Use the `$app/*` aliases for SvelteKit primitives.
- Never use deep relative paths (`../../../`) to escape a feature folder. If you need to reach outside your folder, use `$lib/...`.
- Inside a feature folder, relative imports (`./SomeInternal.svelte`) are preferred.

## Content Safety (Mandatory)

- Never change user-authored content/copy (texts in `.md` spec files, seed data, route content) unless the user explicitly asks for that exact change.
- "Content/copy" means wording, punctuation, casing, sentence order, labels, headings, list item text, and translations.
- Structural changes to data are allowed (moving fields, splitting one field into arrays/objects) as long as original text is preserved exactly.
- If a task seems to require copy changes, stop and ask the user before editing any copy.

## Commands

| Task                                       | Command                        |
| ------------------------------------------ | ------------------------------ |
| Install deps                               | `pnpm install`                 |
| Initialize this template for a new project | `pnpm init-project`            |
| Dev server                                 | `pnpm dev`                     |
| Type-check + a11y compile checks           | `pnpm check`                   |
| Lint                                       | `pnpm lint`                    |
| Format (write)                             | `pnpm format`                  |
| Format check                               | `pnpm format:check`            |
| Unit/component tests                       | `pnpm test`                    |
| A11y E2E tests                             | `pnpm test:a11y`               |
| Full A11y suite                            | `pnpm test:a11y:full`          |
| All tests                                  | `pnpm test:all`                |
| Token contrast checks                      | `pnpm tokens:check-contrast`   |
| Build                                      | `pnpm build`                   |
| Preview build                              | `pnpm preview`                 |
| Start local Supabase                       | `pnpm db:start`                |
| Stop local Supabase                        | `pnpm db:stop`                 |
| New migration                              | `pnpm db:migration:new <name>` |
| Apply migrations                           | `pnpm db:migrate`              |
| Reset local DB                             | `pnpm db:reset`                |
| Regenerate DB types                        | `pnpm db:types`                |

Lefthook gates are split intentionally:

- On `pre-commit`: formatting/lint/import guard.
- On `pre-push`: `pnpm check`, `pnpm test`, `pnpm build`.

Always run the full quality gate before opening a PR. Do not bypass hooks with `--no-verify` unless explicitly asked.

## Project Structure

```
src/
  app.css                       ← Tailwind v4 + design tokens (@theme)
  app.html                      ← shell, PWA meta
  hooks.server.ts               ← request-scoped Supabase server hook
  lib/
    components/ui/              ← design-system primitives
    components/                 ← project-specific composites (rare — prefer features/)
    features/<name>/            ← all business logic, isolated
    server/                     ← server-only code
    auth/                       ← optional auth module (removed if disabled)
    icons/Icon.svelte           ← Lucide wrapper
    utils/                      ← pure generic helpers
    types/                      ← shared types incl. database.types.ts
    supabase.ts                 ← browser-side Supabase client
  routes/
    +layout.svelte              ← root layout
    +page.svelte                ← home
supabase/
  config.toml
  migrations/                   ← committed
  seed.sql
prototypes/
  README.md                     ← committed
  *.md                          ← committed specs
  */                            ← gitignored exports
docs/                           ← deeper documentation
scripts/                        ← init-project, etc.
static/                         ← PWA manifest, icons
tests/                          ← E2E tests
```

## Where to Look

- Importing designs: `docs/IMPORTING-DESIGNS.md`
- Feature-folder pattern: `docs/FEATURES.md`
- Design system: `docs/DESIGN-SYSTEM.md`
- UI primitive contracts: `docs/COMPONENTS.md`
- A11y: `docs/A11Y.md`
- Database / Supabase: `docs/DATABASE.md`
- Auth: `docs/AUTH.md`
- PWA: `docs/PWA.md`
- Deploy: `docs/DEPLOY.md`
- Naming, commits, PRs: `docs/CONVENTIONS.md`
- Architecture overview: `docs/ARCHITECTURE.md`

## Pre-merge Checklist

- [ ] All new business logic lives in `src/lib/features/<name>/` with a `README.md`.
- [ ] No imports from other features' internals — only via `index.ts`.
- [ ] No hardcoded hex colors, magic spacing, custom fonts, or arbitrary Tailwind values in components.
- [ ] All interactive elements are semantic HTML with visible focus styles.
- [ ] All form inputs have labels; icon-only buttons have `aria-label`.
- [ ] UI changes include updated/added a11y tests (`@a11y` / `@a11y-full`) for affected routes/components.
- [ ] Dark theme works for everything you added.
- [ ] Database changes are in `supabase/migrations/`, types regenerated, RLS in place.
- [ ] Feature README is updated when its public API changes.
- [ ] `docs/COMPONENTS.md` is updated when a primitive's contract changes.
- [ ] `pnpm format && pnpm check && pnpm lint && pnpm test:all && pnpm test:a11y:full && pnpm tokens:check-contrast` passes.
- [ ] No code or visual values copied from `prototypes/`.

## When Unsure

- Prefer an existing UI primitive over building a new one.
- Prefer a new design token over a hardcoded value.
- Prefer a small new feature folder over extending an unrelated existing feature.
- Prefer asking the user one focused question over making three assumptions.
- Prefer reading `docs/` and feature `README.md` files over guessing.
