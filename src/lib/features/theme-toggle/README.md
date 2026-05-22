# Theme Toggle Feature

## 1. Purpose

The `theme-toggle` feature provides a global light/dark/system preference switcher and keeps `<html class="dark">` and `localStorage.theme` synchronized with user choice. It does not implement broader appearance settings beyond the three-theme cycle.

## 2. Public API

Exports from `index.ts`:

- `ThemeToggle: Component`
  - Props: N/A
  - Events/callbacks: N/A
  - Snippets/slots: N/A
- Types:
  - `ThemePreference = 'light' | 'dark' | 'system'`
  - `AppliedTheme = 'light' | 'dark'`

## 3. Dependencies

- UI primitives:
  - `$lib/components/ui/Button.svelte`
- Icons:
  - `@lucide/svelte` (`Sun`, `Moon`, `Monitor`)

## 4. Database

N/A

## 5. State

- Theme preference state is owned inside `theme.state.svelte.ts` via runes.
- Preference persists in `localStorage.theme`.
- Applied theme updates `<html class="dark">` and listens to `matchMedia('(prefers-color-scheme: dark)')` when preference is `system`.

## 6. A11y notes

- Toggle uses semantic `<button>` via the `Button` primitive.
- Icon-only control always has `aria-label` describing the next switch action.
- `title` mirrors `aria-label` for extra discoverability.

## 7. Out of scope

- No per-route theming.
- No extra themes beyond `light`, `dark`, `system`.
- No persistence outside browser `localStorage`.
