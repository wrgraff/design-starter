# Handoff

You are an AI coding agent (likely Claude Code) picking up work on the **design-starter** template. This document is your brief.

**Before doing anything else: read [`../AGENTS.md`](../AGENTS.md) end-to-end.** It contains the mandatory rules. This file gives you context and the task list, not the rules.

After AGENTS.md, also skim [`../PLAN.md`](../PLAN.md) for the locked-in decisions and what is already done.

## Repository State

The template scaffolding is done: docs, configs, design tokens, base Supabase setup, UI primitives, smoke-test landing page. The repo should build and run. Your job is to add the remaining functional pieces: example features, the optional auth module, init script, CI, and a few small bits.

**Do not regress what is already there.** Read the existing files first. Match their style, conventions, and structure.

## Ground Rules

These are the most-likely-to-be-violated rules from `AGENTS.md`. Re-read them:

1. **Feature isolation.** All new business logic lives in `src/lib/features/<name>/` with a `README.md` contract, an `index.ts` public entry point, and internal files. Outside code imports only from `index.ts`. See `docs/FEATURES.md` for the full pattern.
2. **No hardcoded visual values.** No hex colors, no `bg-[#xxx]`, no custom fonts, no inline `style` for colors/sizes/shadows. Tokens only. See `docs/DESIGN-SYSTEM.md`.
3. **Svelte 5 runes only.** `$state`, `$derived`, `$effect`, `$props`. No `export let`, no `$:`, no `createEventDispatcher`, no `<slot />`, no `on:click` (use `onclick`). No React patterns.
4. **A11y is mandatory.** Semantic HTML, labels for inputs, `aria-label` on icon-only buttons, visible focus rings, no `<div onclick>`. See `docs/A11Y.md`.
5. **DB changes only via Supabase CLI migrations.** Every table needs RLS policies. Regenerate `src/lib/types/database.types.ts` via `pnpm db:types` after migrations.
6. **Update all call sites in the same task.** No compatibility shims. See `AGENTS.md` → _Legacy Policy_.
7. **Never modify user-authored copy/content** in markdown specs or seed data unprompted.

## Task List

Tasks are roughly ordered — earlier tasks unblock later ones. Each task is sized to be a single focused session.

### 1. Verify the build

Before adding anything, make sure the existing setup works.

```bash
pnpm install
cp .env.example .env
# .env can keep placeholder Supabase values for now — the landing page does not use Supabase yet
pnpm check
pnpm lint
pnpm build
```

If any of these fail, fix the underlying issue before proceeding. Likely first-run issues:

- **`@vite-pwa/sveltekit` needs PWA icons.** Either generate them (see Task 2) or temporarily comment out the `manifest.icons` block in `vite.config.ts` to unblock the build.
- **`database.types.ts` may need regeneration** if Supabase CLI is set up.
- **Lefthook hooks** install via `pnpm prepare`. If that fails on a CI machine, the `|| true` in the prepare script lets it pass.

Open the dev server and verify the smoke test:

```bash
pnpm dev
```

Visit `http://localhost:5173`. You should see the landing page with primitive examples. Toggle `<html class="dark">` via DevTools to verify dark theme.

### 2. PWA icons

Generate placeholder icons so the build does not warn.

- Source: pick one square SVG (`static/favicon.svg` is the current placeholder) or generate something neutral.
- Required outputs in `static/icons/`:
  - `icon-192.png` (192×192, any purpose)
  - `icon-512.png` (512×512, any purpose)
  - `icon-maskable-512.png` (512×512, maskable, with ~10% safe-zone padding all around)

Use [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) or any equivalent. Commit the generated files. Update `static/icons/README.md` if you change naming.

### 3. Initial Supabase config + migration

The Supabase CLI needs configuration files in `supabase/`. Initialize them:

```bash
pnpm supabase init
```

This creates `supabase/config.toml`. Review it:

- Default port `54321` for API, `54323` for Studio — keep.
- Auth providers: enable email + magic link by default; Google off until env vars are set.
- Site URL: `http://localhost:5173`.

Commit `supabase/config.toml`.

Create the first migration for the `notes` example feature (used in Task 4):

```bash
pnpm db:migration:new create_notes
```

In the new file under `supabase/migrations/`, write:

```sql
CREATE TABLE notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX notes_user_id_idx ON notes(user_id);
CREATE INDEX notes_created_at_idx ON notes(created_at DESC);

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

-- Auto-update updated_at on UPDATE
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();
```

Apply locally:

```bash
pnpm db:start
pnpm db:migrate
pnpm db:types
```

Commit the migration and the regenerated `database.types.ts`.

### 4. Example feature: `notes` (CRUD with Supabase)

This is the **canonical reference** for the feature pattern. Other features should look at this one for structure.

Create `src/lib/features/notes/` with:

```
src/lib/features/notes/
  README.md
  index.ts
  NotesList.svelte            ← list with empty/loading/error states
  NoteCard.svelte             ← one note row (internal)
  NoteForm.svelte             ← create + edit form
  notes.state.svelte.ts       ← optional: client-side optimistic state
  notes.server.ts             ← server-side helpers: list, create, update, delete
  notes.types.ts              ← Note type derived from Database
  notes.test.ts               ← tests for utils and components
```

`README.md` must follow the contract in `docs/FEATURES.md` → _The README Contract_ (Purpose, Public API, Dependencies, Database, State, A11y notes, Out of Scope).

Use the existing UI primitives. Use Supabase via `event.locals.supabase` server-side, or `import { supabase } from '$lib/supabase'` client-side. Wire up a demo route at `src/routes/notes/+page.svelte` + `+page.server.ts` that uses the feature.

This feature requires a user to be signed in (notes are user-owned). Until auth is wired up (Task 5), you can either:

- (a) Sign in once via Supabase Studio (`http://localhost:54323`) with a dev email, then use that user's session, or
- (b) Build the feature in a way that gracefully handles unauthenticated users (showing "Sign in to manage notes" instead of the form).

Prefer (b) — it lets the feature live in the template without the auth module.

Constraints:

- No optimistic updates that bypass server validation. Either await the server response or implement proper conflict resolution.
- All inputs have `<Label>` associations. Form has visible error states (use `invalid` prop on `<Input>` / `<Textarea>`).
- Date formatting goes in `src/lib/utils/format-date.ts` if you need it. Don't inline `new Date(...).toLocaleString()` in markup.

Tests:

- `notes.test.ts` covers any non-trivial pure functions and the form's validation behavior.
- Aim for the form behavior in particular (required title, max length if any, submit/cancel) being unit-testable.

### 5. Example feature: `theme-toggle`

Small UI-only feature managing the light/dark/system theme preference.

```
src/lib/features/theme-toggle/
  README.md
  index.ts
  ThemeToggle.svelte          ← the button (3-state cycle: light → dark → system → light)
  theme.state.svelte.ts       ← runes state: current preference + applied theme
  theme.test.ts
```

Behavior:

- Reads `localStorage.theme` (already set by the `<head>` script in `app.html`).
- Writes back to `localStorage` and toggles `.dark` on `<html>` when the user changes preference.
- Listens to `matchMedia('(prefers-color-scheme: dark)')` for system changes when preference is `system`.
- Button shows the current state (Sun / Moon / Monitor icons from Lucide). `aria-label` describes the current state ("Switch to dark theme" / etc.).

This feature has no dependencies on other features and no DB. It's a good example of a small self-contained feature.

Add the toggle to `src/routes/+layout.svelte` so it appears on every page. Tests cover the state transitions.

### 6. Optional auth module

The big one. Implement enough for: login, signup, logout, magic link, Google OAuth (configurable), session-aware UI.

```
src/lib/auth/
  providers.ts                ← which providers are enabled (toggle flags)
  require-user.ts             ← redirects to /login if no user
  index.ts

src/lib/features/auth/
  README.md
  index.ts
  LoginForm.svelte
  SignupForm.svelte
  MagicLinkForm.svelte
  ProviderButtons.svelte      ← Google etc.
  AuthCard.svelte             ← shared wrapper
  auth.state.svelte.ts        ← optional: in-flight states
  auth.server.ts              ← form actions for login/signup/logout
  auth.types.ts
  auth.test.ts

src/routes/(auth)/
  +layout.svelte              ← centered auth shell
  login/+page.svelte
  login/+page.server.ts       ← actions
  signup/+page.svelte
  signup/+page.server.ts
  callback/+server.ts         ← OAuth callback handler

src/routes/+layout.server.ts  ← already exists; verify it surfaces session/user
```

Use form actions (`?/login`, `?/signup`, `?/signout`) rather than client-side `supabase.auth.signIn()`. This keeps cookies authoritative on the server.

Provider config (`src/lib/auth/providers.ts`):

```ts
export const providers = {
  emailPassword: true,
  magicLink: true,
  google: false, // set true after configuring GOOGLE_CLIENT_ID in Supabase
  github: false
};
```

Admin role: in `hooks.server.ts`, after `safeGetSession`, check `event.locals.user.email` against `ADMIN_EMAILS` env var (comma-separated) and add `isAdmin: boolean` to `locals.user`. Update `app.d.ts` accordingly.

Add a small auth-aware UI to the landing page: "Logged in as ... [Logout]" / "[Login]". This lets you smoke-test without a separate route.

The module should be removable cleanly — see Task 7.

Tests cover: form validation, redirect behavior in `requireUser`, role assignment.

### 7. Init script: `scripts/init-project.mjs`

Interactive one-shot setup for new projects. Run via `pnpm init-project`.

Steps the script performs:

1. **Prompt:**
   - Project name (kebab-case, validated)
   - Project description (one line)
   - Repo URL (optional)
   - Keep optional auth module? (y/n)
   - Use local Supabase or remote? (local/remote)
   - Base brand color (hex or OKLCH; default: keep neutral)
   - Author name + year for LICENSE

2. **Replace placeholders** across files:
   - `{{PROJECT_NAME}}` → project name
   - `{{PROJECT_DESCRIPTION}}` → description
   - `{{REPO_URL}}` → repo URL
   - `{{AUTHOR}}` → author
   - `{{YEAR}}` → current year
   - `design-starter` references in package.json, vite.config.ts → project name

3. **If auth removed:** delete `src/lib/auth/`, `src/lib/features/auth/`, `src/routes/(auth)/`, the auth callback route, the auth migration (if separate), and remove `ADMIN_EMAILS` from `.env.example`. Delete `docs/AUTH.md` or rewrite as "auth removed".

4. **If brand color given:** update `--color-primary` and dark counterpart in `src/app.css`. Use OKLCH conversion if hex given.

5. **Update PWA manifest** in `vite.config.ts` with the new name and theme_color.

6. **Delete `scripts/init-project.mjs` and `PLAN.md` and `docs/HANDOFF.md`** as the last step — they're template-only artifacts.

7. **Remove the `init-project` script from package.json.**

8. **Print next steps** to the user.

Use only Node.js stdlib + `node:readline/promises` (or a small dep like `@clack/prompts` for nicer UX — your call, but document the choice). Don't add heavyweight CLI frameworks.

### 8. Contrast verification script: `scripts/check-contrast.mjs`

Validates WCAG contrast for token pairs. Run via `pnpm tokens:check-contrast`.

- Read `src/app.css` and parse the `@theme` and `.dark` blocks.
- Read `scripts/contrast-pairs.json` — list of `{ foreground: 'primary-foreground', background: 'primary' }` pairs.
- Compute WCAG contrast for each pair in both themes.
- Print a table; exit non-zero if any pair fails the required ratio.

For OKLCH parsing, you can either pull in `culori` (small) or implement OKLCH → sRGB conversion manually. Either is fine.

Create `scripts/contrast-pairs.json` with the default pairs:

```json
[
  { "fg": "foreground", "bg": "background", "min": 4.5, "context": "body text" },
  { "fg": "primary-foreground", "bg": "primary", "min": 4.5, "context": "primary button" },
  { "fg": "secondary-foreground", "bg": "secondary", "min": 4.5, "context": "secondary button" },
  {
    "fg": "destructive-foreground",
    "bg": "destructive",
    "min": 4.5,
    "context": "destructive button"
  },
  { "fg": "muted-foreground", "bg": "background", "min": 4.5, "context": "muted text" },
  { "fg": "card-foreground", "bg": "card", "min": 4.5, "context": "card text" }
]
```

### 9. Playwright + axe setup

Wire up E2E + a11y tests.

```
playwright.config.ts          ← config
tests/
  setup.ts                    ← already exists for Vitest; keep separate from Playwright
  e2e/
    smoke.spec.ts             ← landing page loads, dialog opens
    a11y.spec.ts              ← axe-core scan of landing page  @a11y tag
```

Use `@axe-core/playwright`. Tag a11y tests with `@a11y` so `pnpm test:a11y` (grep `@a11y`) picks them up.

A11y test pattern:

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('landing page has no detectable a11y issues @a11y', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

### 10. GitHub Actions CI

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm format:check
      - run: pnpm check
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

For a11y E2E in CI, add a separate job that starts the dev server, runs Playwright. Add Playwright browsers caching. This is optional for v1 — `pnpm test` is the floor.

### 11. README polish + final verification

Once everything works:

- Walk through `README.md` → _Quick Start_ on a clean clone. Update if anything is missing.
- Take screenshots of the landing page (light + dark) — optional but nice.
- Update `PLAN.md` → mark tasks done.
- Delete `docs/HANDOFF.md` and `PLAN.md` from the template? **No** — keep them as a reference for future template forks. The init-project script removes them only when initializing a downstream project.

## How to Approach Each Task

For each task in this list:

1. **Re-read the relevant doc** before starting. The docs are the spec.
   - Adding a feature? Re-read `docs/FEATURES.md`.
   - Touching the design system? Re-read `docs/DESIGN-SYSTEM.md`.
   - Database changes? Re-read `docs/DATABASE.md`.
2. **Start the dev server** (`pnpm dev`) and keep it open. Verify changes as you go.
3. **Run `pnpm check && pnpm lint && pnpm test` frequently.** Fix issues immediately, don't accumulate them.
4. **Commit per task** with a Conventional Commit message:
   - `chore(pwa): generate placeholder icons`
   - `feat(notes): add notes feature with CRUD`
   - `feat(auth): add optional auth module`
   - `chore(scripts): add init-project script`
5. **Update `PLAN.md`** with task progress as you go.

## Specific Things to Watch For

- **Tokens, not hex.** The single most common mistake when porting prototypes or adding features. Use tokens. Grep your diff: `git diff | grep -E '\[#[0-9a-fA-F]{3,8}\]'` — should return nothing.
- **`+page.server.ts` for DB reads, not `+page.ts`.** Server load runs server-side with the SSR Supabase client (carries cookies). Client load runs in the browser too — fine for some things, wrong for authenticated DB reads on first paint.
- **Form actions, not client-side mutations.** Especially for auth. `supabase.auth.signOut()` in a button handler does not invalidate server cookies — use `<form method="POST" action="?/signout">`.
- **`safeGetSession()` not `getSession()`.** The hook already provides `event.locals.user` which is validated. Use it. Direct `event.locals.supabase.auth.getSession()` returns un-validated JWT data.
- **A11y on Dialog.** The native `<dialog>` mostly handles focus, but `aria-labelledby` must point to a real `id` (already wired). Don't break it.
- **Migrations run in order.** Don't rename a migration file after it's been committed. If you mess up, write a new migration that reverses or fixes it.
- **`pnpm db:types` runs against the local DB.** If local DB is stopped, the script errors. Start it first: `pnpm db:start`.

## When You're Done

After completing tasks 1–11, the template is shippable v1. At that point:

- All `pnpm <script>` commands listed in `package.json` should work.
- A fresh clone + `pnpm init-project` + answer prompts + `pnpm install` + `pnpm dev` should produce a working app within ~5 minutes.
- CI should be green on the main branch.
- The example features (`notes`, `theme-toggle`) serve as the reference for porting future prototypes.

Push to a repo. Tag `v0.1.0`. Done.

## When You're Stuck

- Read the relevant `docs/` file. If unclear, re-read `AGENTS.md`.
- For Supabase-specific issues: <https://supabase.com/docs>.
- For SvelteKit issues: <https://svelte.dev/docs/kit>.
- For Tailwind v4 specifics: <https://tailwindcss.com/docs>.
- If a decision is needed that isn't in the docs, prefer the option that:
  1. Keeps features isolated.
  2. Uses tokens over hardcoded values.
  3. Is the simplest path to a working result.
  4. Can be rewritten cheaply if wrong.

Open a question to the maintainer rather than make a structural decision they didn't sign off on.
