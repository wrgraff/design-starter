# Importing Designs

How to port a prototype from **Claude Design, Figma Make, Lovable, v0, bolt.new** or any other UI-generation tool into this project.

## The Rule

Prototypes are **references**, not source code.

- We do **not** import their code.
- We do **not** convert their code line-by-line.
- We do **not** copy their colors, spacing, fonts, radii, shadows, or any visual values.
- We **do** read them, understand the flows and business logic, and write **fresh code** in this repository's architecture as a new feature in `src/lib/features/<name>/`.

The output of a porting task is a new feature folder with our design system, our primitives, our patterns. The prototype is closed by the time the feature is done.

## The Prototype Folder Convention

```
prototypes/
  README.md                   ← (committed) explains the convention
  song-list-v1.md             ← (committed) the spec / TZ for this iteration
  song-list-v1/               ← (gitignored) the raw export from the tool
  settings-v2.md              ← (committed) spec for another iteration
  settings-v2/                ← (gitignored) raw export
```

- Spec files (`*.md`) and `prototypes/README.md` are committed.
- Prototype code folders are gitignored. They live on the maintainer's machine only.

### What the spec file should contain

The spec is the source of truth for _what_ the feature must do. It supersedes the prototype when they disagree. A good spec includes:

- **Goal** — one paragraph about what user problem this feature solves.
- **Flows** — primary user flows as numbered steps.
- **States** — empty, loading, error, success, partial, offline.
- **Data** — what reads, what writes, expected shape.
- **Out of scope** — explicit non-goals.
- **Open questions** — things you do not yet know.

If your spec is missing and you only have a prototype, write the spec first by inspecting the prototype.

## The Porting Procedure

### 1. Read the spec, then the prototype

- Start with `prototypes/<name>.md`. Understand what the feature is supposed to do, not how it looks.
- Then look at `prototypes/<name>/` to see how the maintainer envisioned the flow. The visuals are not authoritative — they are a starting point for layout and interaction.

### 2. Identify the feature boundary

- One feature per coherent piece of business logic.
- If the prototype contains a screen with a header, a list, and a settings dropdown, that is probably 3 features (or 1 layout + 2 features), not 1.
- A useful test: could you reasonably delete this folder and rewrite it without touching anything else? If no, the boundary is wrong.

### 3. Check what already exists

Before writing anything, look at:

- `src/lib/components/ui/` — UI primitives (Button, Input, Card, Dialog, ...). Use these.
- `src/lib/features/` — existing features. If a feature already covers part of this, extend it rather than duplicating.
- `src/lib/utils/` — generic helpers.
- `docs/COMPONENTS.md` — primitive contracts.

If 80% of the prototype is "a styled button" + "a styled input", you already have the building blocks. The porting work is the composition and the business logic, not the visuals.

### 4. Create the feature folder

```
src/lib/features/<name>/
  README.md
  index.ts
  <Component>.svelte
  <name>.state.svelte.ts   ← only if there is real state
  <name>.server.ts         ← only if there is server work
  <name>.utils.ts          ← only if there are reusable pure helpers
  <name>.types.ts
  <name>.test.ts
```

Write `README.md` first. It is the contract. See `AGENTS.md` → _Feature README Contract_ for the required sections.

### 5. Write the feature using our system

- Markup: semantic HTML. `<button>` for actions. `<a href>` for navigation. Labels for inputs.
- Layout: Tailwind utility classes that map to our tokens.
- Colors / spacing / radii / shadows / fonts: tokens only. If a token is missing, add it to `src/app.css` and document it in `docs/DESIGN-SYSTEM.md`.
- Components: our primitives from `$lib/components/ui/`.
- Icons: `import { Home } from '@lucide/svelte'` or `<Icon name="..." />` from `$lib/icons/Icon.svelte`.
- State: Svelte 5 runes (`$state`, `$derived`, `$effect`).
- Data: Supabase via the clients in `$lib/supabase.ts` (browser) and `$lib/server/supabase.ts` (server).
- A11y: see `docs/A11Y.md` and the feature's `README.md` "A11y notes" section.

### 6. Test

- Unit tests for `<name>.utils.ts` and state logic — `<name>.test.ts`.
- Component tests for non-trivial interaction — same file, using `@testing-library/svelte`.
- A11y E2E test if the feature has its own screen — `tests/<name>.a11y.spec.ts`.

### 7. Wire it up

- Import the feature from a route via `import { ... } from '$lib/features/<name>'`.
- Routes contain layout only. No business logic in `+page.svelte`.

### 8. Verify

```bash
pnpm format
pnpm check
pnpm lint
pnpm test
pnpm test:a11y
pnpm dev          # eyeball in light + dark, with keyboard navigation
```

Commit:

```
feat(<name>): port from prototypes/<name>-vN
```

## A Worked Example

Suppose `prototypes/stat-card-v1/` contains a React component generated by Figma Make:

```tsx
export function StatCard({ label, value, trend }: Props) {
  return (
    <div
      className="rounded-[12px] border border-[#e5e7eb] bg-white p-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="text-[12px] tracking-wider text-[#6b7280] uppercase">{label}</div>
      <div className="mt-[8px] text-[28px] font-semibold text-[#111827]">{value}</div>
      {trend !== undefined && (
        <div className={`mt-[12px] text-[14px] ${trend > 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}
```

And `prototypes/stat-card-v1.md` says:

> A dashboard card that shows a single metric. Three slots: label, value, optional trend (% with arrow). Trend up is success-colored, down is destructive-colored. Used on the home dashboard, 4 across on desktop, 2 on tablet, 1 on mobile.

The resulting feature looks like this:

```
src/lib/features/stat-card/
  README.md
  index.ts
  StatCard.svelte
  stat-card.types.ts
  stat-card.test.ts
```

**`README.md`** (excerpt):

> **Purpose** — Display a single labeled metric with optional percentage trend.
>
> **Public API** — `<StatCard label value trend? />` from `index.ts`. Props: `label: string`, `value: string | number`, `trend?: number` (positive = up = success, negative = down = destructive).
>
> **Dependencies** — `$lib/components/ui/Card.svelte`.
>
> **Database** — N/A.
>
> **State** — None. Pure presentation.
>
> **A11y notes** — Trend direction is conveyed by both color _and_ arrow glyph (color is not the only signal). Decorative arrow is `aria-hidden`; trend is announced as plain text.
>
> **Out of scope** — No interaction. No tooltips. No animation. No "vs last period" comparison labels.

**`index.ts`**:

```ts
export { default as StatCard } from './StatCard.svelte';
export type { StatCardProps } from './stat-card.types';
```

**`stat-card.types.ts`**:

```ts
export interface StatCardProps {
  label: string;
  value: string | number;
  trend?: number;
}
```

**`StatCard.svelte`**:

```svelte
<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import type { StatCardProps } from './stat-card.types';

  let { label, value, trend }: StatCardProps = $props();
</script>

<Card class="p-5">
  <div class="text-muted-foreground text-xs tracking-wider uppercase">{label}</div>
  <div class="text-foreground mt-2 text-3xl font-semibold">{value}</div>
  {#if trend !== undefined}
    <div class="mt-3 text-sm" class:text-success={trend > 0} class:text-destructive={trend < 0}>
      <span aria-hidden="true">{trend > 0 ? '↑' : '↓'}</span>
      {Math.abs(trend)}%
    </div>
  {/if}
</Card>
```

What we kept from the prototype: the three pieces of data (label, value, trend), the conditional rendering, the visual hierarchy (small label, big value, smaller trend), the up/down color signaling.

What we threw away:

- `bg-white`, `border border-[#e5e7eb]`, `rounded-[12px]`, custom shadow → all handled by `<Card>` primitive
- `text-[#6b7280]`, `text-[#111827]` → `text-muted-foreground`, `text-foreground` tokens
- `text-[#10b981]`, `text-[#ef4444]` → `text-success`, `text-destructive` tokens
- `text-[12px]`, `text-[28px]`, `text-[14px]` → typography scale (`text-xs`, `text-3xl`, `text-sm`)
- `p-[20px]`, `mt-[8px]`, `mt-[12px]` → spacing scale (`p-5`, `mt-2`, `mt-3`)
- `font-['Inter']` → global font, removed
- React patterns → Svelte 5 runes

What we added: a11y improvement (arrow `aria-hidden` so it's not announced as "up arrow"; color paired with glyph so it's not the only signal).

## Anti-patterns to Grep For

Before committing a ported feature, check your diff:

```bash
git diff --cached -- 'src/**' | grep -E '\[#[0-9a-fA-F]{3,8}\]'    # arbitrary hex
git diff --cached -- 'src/**' | grep -E "font-\['"                  # custom font family
git diff --cached -- 'src/**' | grep -E 'style="[^"]*(color|font|background|shadow)' # inline visual style
git diff --cached -- 'src/**' | grep -E 'className='                # React leftover
git diff --cached -- 'src/**' | grep -E 'useState|useEffect|useRef|useMemo' # React hooks
git diff --cached -- 'src/**' | grep -E 'onClick|onChange|onSubmit'  # camelCase events
```

All should return zero matches. If any match, fix before committing.

## When the Design Needs Something New

Sometimes a prototype legitimately needs a color, spacing value, or component that does not yet exist. The path is:

1. Add a semantic token to `src/app.css` (`@theme`) — name by meaning (`--color-warning`), not by hue (`--color-orange-500`).
2. Add the dark-theme counterpart.
3. Document the new token in `docs/DESIGN-SYSTEM.md`.
4. Use the token in the feature.

If the prototype needs a brand-new UI primitive (not just a token), the path is:

1. Confirm with the maintainer that this is genuinely a new primitive and not a feature-specific composition.
2. Add it to `src/lib/components/ui/`.
3. Document its contract in `docs/COMPONENTS.md` (Inputs / Behavior / Constraints / A11y).
4. Use it in the feature.

Never inline a one-off.
