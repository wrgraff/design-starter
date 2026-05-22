# Design System

The design system is a set of **semantic tokens** defined as CSS variables in `src/app.css`, mapped automatically by Tailwind v4 to utility classes.

This document is the contract for the visual language. If you ever wonder _"what color is a destructive action?"_ or _"what radius do cards use?"_ — the answer is here, and the implementation is in `app.css`.

## Principles

1. **Semantic, not descriptive.** Tokens are named by _meaning_ (`--color-primary`, `--color-muted-foreground`), never by _appearance_ (`--color-blue-500`, `--color-grey-2`). The same token gives different concrete values in light and dark.
2. **One source of truth.** All visual values live in `src/app.css`. No component declares its own color, font, or shadow.
3. **Pair foreground with background.** Every background token has a matching foreground token that meets WCAG AA contrast on it.
4. **Dark first-class.** Dark theme is not an afterthought. Every token has a dark counterpart in the `.dark { … }` block.
5. **Add tokens, don't inline.** When the design needs a new value, add a token. Never hardcode.

## Where the Tokens Live

`src/app.css` has this structure:

```css
@import 'tailwindcss';

/* Custom dark mode variant — activated by .dark on <html> */
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* Colors (light theme defaults) */
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.145 0 0);
  /* ...etc */

  /* Typography */
  --font-sans: 'Inter Variable', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  /* Radii, shadows, motion ...  */
}

/* Dark theme overrides */
.dark {
  --color-background: oklch(0.145 0 0);
  --color-foreground: oklch(0.985 0 0);
  /* ...etc */
}

/* Base styles */
@layer base {
  html {
    font-family: var(--font-sans);
  }
  body {
    @apply bg-background text-foreground;
  }
  /* ...etc */
}
```

When you write `<div class="bg-primary text-primary-foreground">`, Tailwind generates the CSS from those `--color-primary*` tokens. No `tailwind.config.js`. No PostCSS.

## Color Tokens

The full semantic palette. Each token has a paired `*-foreground` for text/icons placed on top.

| Token                                    | Use for                                                       |
| ---------------------------------------- | ------------------------------------------------------------- |
| `background` / `foreground`              | App background and default text                               |
| `card` / `card-foreground`               | Card surfaces                                                 |
| `popover` / `popover-foreground`         | Floating surfaces (dropdowns, popovers, command palettes)     |
| `primary` / `primary-foreground`         | Primary brand actions (main CTA)                              |
| `secondary` / `secondary-foreground`     | Secondary actions, soft surfaces                              |
| `muted` / `muted-foreground`             | Lower-emphasis text and surfaces                              |
| `accent` / `accent-foreground`           | Hover/active states, subtle highlights                        |
| `destructive` / `destructive-foreground` | Destructive actions, errors                                   |
| `success` / `success-foreground`         | Successful operations, positive trends                        |
| `warning` / `warning-foreground`         | Warnings, attention-required states                           |
| `info` / `info-foreground`               | Informational notices                                         |
| `border`                                 | Default border for inputs, cards, separators                  |
| `input`                                  | Border for form fields specifically (often equal to `border`) |
| `ring`                                   | Focus ring color                                              |

Tailwind utilities mapped: `bg-primary`, `text-primary-foreground`, `border-border`, `ring-ring`, etc.

## Typography Tokens

```css
--font-sans: 'Inter Variable', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, SF Mono, monospace;

--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;
--text-5xl: 3rem;
```

Use `text-sm`, `text-lg`, `font-sans`, `font-mono`. Never custom px sizes.

## Spacing

Tailwind v4's default spacing scale is used (`p-1`, `p-2`, `p-3`, … `p-12`, `p-16`, ...). Each unit is `0.25rem` (4px) by default. If the design needs different rhythm, override `--spacing-*` in `@theme`.

Use the scale. Do not use arbitrary `p-[13px]`.

## Radii

```css
--radius-sm: 0.25rem;
--radius-md: 0.375rem;
--radius-lg: 0.5rem;
--radius-xl: 0.75rem;
--radius-2xl: 1rem;
--radius-full: 9999px;
```

Components pick a tier (`rounded-md`, `rounded-lg`, `rounded-full`). Cards and dialogs default to `rounded-lg` or `rounded-xl`.

## Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

For dark mode, shadows are often unhelpful (no light source contrast). Either use a lighter token or skip shadows and rely on borders and surface lightness. The dark `.dark { … }` block overrides shadows to a subtler set.

## Motion

```css
--transition-fast: 120ms;
--transition-base: 200ms;
--transition-slow: 320ms;

--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

Components use these via `transition-[property] duration-[token]`. Long looping animations or vestibular-triggering motion must be disabled under `prefers-reduced-motion: reduce` — handled in `app.css` globally:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Dark Theme

Dark theme is activated by toggling `.dark` on the `<html>` element. The `@custom-variant dark` declaration in `app.css` lets Tailwind generate `dark:` variants automatically.

Theme toggling lives in `src/lib/features/theme-toggle/` (if present) or as a simple inline script that runs before hydration to avoid flash. The recommended pattern:

```svelte
<!-- src/app.html -->
<script>
  (function () {
    var t = localStorage.getItem('theme') || 'system';
    var dark =
      t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  })();
</script>
```

This blocks the first paint very briefly but eliminates flash-of-wrong-theme. The user-facing toggle then sets `localStorage` and adds/removes the class.

## Adding a Token

The right path when you find yourself wanting a hardcoded value.

1. **Decide if it is genuinely new.** Look at the existing tokens — there is often one that fits if you accept slightly different visuals.
2. **Choose a semantic name.** Name by _meaning_, not by _appearance_. `--color-tag-personal` is fine. `--color-purple-3` is not.
3. **Add to light first.** In `@theme` in `app.css`. Use OKLCH for colors when possible — it interpolates predictably for hover/active states.
4. **Add the dark counterpart.** Put it inside `.dark { … }`. Verify contrast against the corresponding background.
5. **If it is a color, add a `-foreground` token if anything will be drawn on top of it.**
6. **Update this file.** Add the token to the table in the relevant section.
7. **If a new combination of foreground/background is introduced, add it to `scripts/contrast-pairs.json`** so `pnpm tokens:check-contrast` verifies it.

Verify with:

```bash
pnpm format
pnpm check
pnpm tokens:check-contrast
```

Then use the token by its Tailwind utility (`bg-tag-personal`, `text-tag-personal-foreground`).

## Brand Color

A project usually has a brand color that drives `--color-primary` and a handful of accents. The `pnpm init-project` script asks for a base color and writes a sensible starting palette into `app.css`.

To change it later, edit the `--color-primary` (and any derived tokens) in both the `@theme` block and the `.dark` block, and verify contrast.

For accent palettes, prefer OKLCH-based generation over manual tinkering — small lightness/chroma steps from a single hue give visually consistent ramps. The `init-project` script does this; for manual updates, [oklch.com](https://oklch.com) is a useful playground.

## Typography in Practice

The base font is loaded via `@import` in `app.css` or via a `<link>` in `app.html`. Variable fonts are preferred for size — one file covers all weights.

For headings, prefer the typography scale + token-driven font weight + token-driven color (`text-foreground` for primary, `text-muted-foreground` for secondary). Do not invent new sizes.

## Verifying Contrast

WCAG AA: 4.5:1 for normal text, 3:1 for large text and UI components.

```bash
pnpm tokens:check-contrast
```

This script reads tokens from `app.css` and verifies the foreground/background pairs listed in `scripts/contrast-pairs.json`. Add to that file whenever you introduce a new combination.

## Replacing the Design System

This template's design system is intentionally not the source of identity for a specific project — it is a sensible starting point. To replace it entirely (different look, different naming conventions, different scales):

1. Edit `src/app.css` — replace tokens.
2. Update `src/lib/components/ui/*` — primitives use semantic token names, so most of the work is verifying nothing is hardcoded.
3. Update this file (`DESIGN-SYSTEM.md`).

Because primitives and features use semantic class names (`bg-primary`, not `bg-blue-500`), replacing the design system does not require touching feature code. That is by design.
