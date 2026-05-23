# Conventions

This document covers the small, mechanical conventions used in this repository: file naming, commit messages, PR style, code comments. They are deliberately simple — the goal is "no decision needed, just follow the pattern".

For the larger rules (feature isolation, design tokens, a11y), see [`../AGENTS.md`](../AGENTS.md).

## File and Folder Naming

| Kind                                      | Case                                                                                                 | Example                                |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Folders                                   | `kebab-case`                                                                                         | `src/lib/features/song-list/`          |
| Svelte components                         | `PascalCase.svelte`                                                                                  | `SongList.svelte`, `SongRow.svelte`    |
| TypeScript files (utilities, types, etc.) | `kebab-case.ts`                                                                                      | `format-date.ts`, `song-list.types.ts` |
| Runes-based state files                   | `<name>.state.svelte.ts`                                                                             | `theme.state.svelte.ts`                |
| Server-only files                         | `<name>.server.ts` (inside features) or anywhere under `src/lib/server/`                             | `notes.server.ts`                      |
| Tests                                     | `<name>.test.ts`                                                                                     | `format-date.test.ts`                  |
| Migrations                                | `<timestamp>_<snake_case>.sql` (Supabase CLI does this for you)                                      | `20260101120000_create_notes.sql`      |
| Documentation                             | `UPPER-KEBAB.md` for top-level docs, `lower-case.md` inside subdirs if any                           | `DATABASE.md`                          |
| Routes                                    | SvelteKit conventions: `+page.svelte`, `+page.ts`, `+page.server.ts`, `+layout.svelte`, `+server.ts` | —                                      |

Component names are nouns. Helper functions are verbs (`formatDate`, not `dateFormatter`). Feature folder names are nouns describing the thing (`song-list`, not `list-songs`).

## Imports

- Use the `$lib` alias for anything in `src/lib`:
  ```ts
  import Button from '$lib/components/ui/Button.svelte';
  import { formatDate } from '$lib/utils/format-date';
  ```
- Use SvelteKit aliases (`$app/state`, `$app/navigation`, `$env/static/public`, etc.) directly.
- Inside a feature folder, use relative imports for sibling files (`./SongRow.svelte`).
- Never use `../../` to climb out of a feature. If you need code outside, use `$lib/...`.

Group imports in this order, separated by blank lines:

```ts
// 1. Node / framework
import { dev } from '$app/environment';

// 2. Third-party
import { Home } from '@lucide/svelte';

// 3. $lib (internal)
import Button from '$lib/components/ui/Button.svelte';
import type { Database } from '$lib/types/database.types';

// 4. Relative (same feature)
import SongRow from './SongRow.svelte';
import type { Song } from './song-list.types';
```

Prettier handles spacing; the order is your responsibility.

## Type Imports

Use inline `type` modifiers:

```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
```

ESLint is configured to prefer this style.

## Component Props

Always define a `Props` interface, even for one prop. Use `$props()` with destructuring:

```svelte
<script lang="ts">
  interface Props {
    title: string;
    description?: string;
    variant?: 'default' | 'compact';
    onclose?: () => void;
  }

  let { title, description, variant = 'default', onclose }: Props = $props();
</script>
```

Boolean props default to `false`. Other optionals get explicit defaults at destructuring.

## Comments

Most code does not need comments — well-named functions and types are usually enough. Add a comment when:

- The _why_ is non-obvious (a workaround, a tradeoff, an unintuitive ordering).
- A constraint comes from outside the code (a Supabase quirk, a browser bug).
- A pure function's behavior at edge cases needs to be explicit (especially in `utils/`).

Avoid:

- Restating what the code does.
- TODO comments without a linked issue or owner. (Use `TODO(<name>): ...` to claim it, or open an issue.)
- Banner comments / ASCII art / decorative blocks.

JSDoc is welcome on exported functions in `src/lib/utils/` and on feature `index.ts` exports — it surfaces in tooltips and improves agent comprehension.

```ts
/**
 * Format an ISO date string as a short local-time label.
 * Returns "Yesterday", "Today", or "MMM D" depending on recency.
 */
export function formatRelativeDate(iso: string): string {
  // ...
}
```

## Commit Messages

No strict format enforced. Keep messages short and descriptive — one line is enough for most changes. Explain _why_ in the body if the change is non-obvious.

## Versioning (if the project publishes anything)

Most projects from this template are applications, not libraries — no versioning needed. If a project does publish (e.g. a shared component package), use [Changesets](https://github.com/changesets/changesets):

```bash
pnpm add -D @changesets/cli
pnpm changeset init
```

And add `pnpm changeset` to your release workflow. Not included by default.

## Editor

Editor settings are pinned in `.editorconfig`, `.prettierrc.json`, `.vscode/settings.json`, and `.vscode/extensions.json`. If you open the project in VS Code, you will be prompted to install the recommended extensions — accept.

Tabs (size 2) for indentation. LF line endings. UTF-8. Trim trailing whitespace. Final newline.

For non-VS Code editors, install equivalents of:

- Svelte language server
- Tailwind CSS IntelliSense
- Prettier
- ESLint
- EditorConfig

## Markdown

For `.md` files inside this repo:

- Two-space indent (overrides project default of tabs).
- One H1 per file, at the top.
- ATX headings (`#`), not setext.
- Reference-style links optional; inline is fine.
- Wrap at ~100 chars where prose allows; tables and code do not need to wrap.

## Forbidden Conventions (anti-patterns we have rejected)

- `index.svelte` files. SvelteKit uses `+page.svelte` for that — there is no "index of a component folder".
- `*.style.ts` files. Tokens live in `app.css`. Per-component styles live in the component's `<style>` block (rarely needed — Tailwind handles most of it).
- `useXxx` or `withXxx` naming. Those are React idioms.
- Barrel files (`index.ts`) outside of feature folders' public surface. Inside features, `index.ts` is exactly the public-API file. Elsewhere, prefer direct imports.
- `helpers.ts` / `misc.ts` / `utils.ts` catch-all files. Name files by what they actually contain.
