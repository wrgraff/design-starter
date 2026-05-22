# UI Primitives

API contracts for the design-system primitives in `src/lib/components/ui/`.

Each entry documents **what to pass**, **what to expect**, **what is not allowed**, and **what is guaranteed for accessibility**. The contracts are stable — implementations may be rewritten, but the inputs and behavior do not change without a version note and updates to all call sites (see `AGENTS.md` → _Legacy Policy_).

> Primitives are the **alphabet** features are written in. If a primitive does not exist for what you need, prefer extending an existing one or adding a new primitive over inlining a one-off in a feature.

## How to read this file

For every primitive:

- **Inputs** — props with types and notes.
- **Behavior** — what it does, including state changes, events, and side effects.
- **Constraints** — what callers must not do.
- **A11y** — accessibility guarantees built in.

## Conventions used across all primitives

- Components accept `class?: string` for caller-provided utility classes. The caller's classes are merged with the primitive's defaults via `cn()` from `$lib/utils/cn.ts`.
- Components accept `id?: string` and other relevant HTML attributes.
- Boolean props default to `false` unless noted.
- Callback props are named `onAction` (Svelte 5 lowercase: `onclick`, `onchange`, etc., for DOM events; PascalCase camelCase only for custom callbacks like `onSelect`).
- All primitives respect dark theme automatically.

---

## Button

`$lib/components/ui/Button.svelte`

A clickable action. Use for things that _do something_. For navigation, use `<a href>` (optionally with `<Button>`-like styling via the `link` variant on an anchor — but generally prefer a styled `<a>`).

### Inputs

| Prop                       | Type                                                                          | Default     | Notes                                       |
| -------------------------- | ----------------------------------------------------------------------------- | ----------- | ------------------------------------------- |
| `variant`                  | `'default' \| 'secondary' \| 'destructive' \| 'outline' \| 'ghost' \| 'link'` | `'default'` | Visual style.                               |
| `size`                     | `'sm' \| 'md' \| 'lg' \| 'icon'`                                              | `'md'`      | `'icon'` is square — for icon-only buttons. |
| `type`                     | `'button' \| 'submit' \| 'reset'`                                             | `'button'`  | Important to set inside forms.              |
| `disabled`                 | `boolean`                                                                     | `false`     | Pointer events disabled + visual fade.      |
| `loading`                  | `boolean`                                                                     | `false`     | Shows a spinner, disables interactions.     |
| `class`                    | `string`                                                                      | —           | Caller utility classes.                     |
| `children`                 | `Snippet`                                                                     | —           | Button content.                             |
| Other DOM `<button>` attrs | —                                                                             | —           | `aria-label`, `name`, `value`, etc.         |

### Behavior

- Default `type="button"` to prevent accidental form submission.
- `loading={true}` swaps the leading icon for a spinner and applies `aria-busy="true"`. Disables click while loading.
- `size="icon"` forces a square box; icon-only buttons must have an `aria-label`.

### Constraints

- Do not use a `<Button>` for navigation. Use `<LinkButton href>` or a plain `<a>`.
- Do not nest interactive elements inside `<Button>`.

### Utility: `buttonClasses()`

```ts
import { buttonClasses } from '$lib/components/ui';

buttonClasses({ variant?: ButtonVariant; size?: ButtonSize; class?: string }): string
```

Returns the full class string for a button-styled element. Use this when you need button styling on a non-`<button>` element (e.g. inside `<LinkButton>`). Prefer `<Button>` or `<LinkButton>` in markup — only call `buttonClasses()` directly when neither fits.

### A11y

- Always semantic `<button>`.
- Visible `focus-visible` ring (color: `ring`).
- `aria-busy` while loading.
- Disabled state is announced as `disabled` (native attribute, not `aria-disabled`).
- Icon-only buttons require `aria-label` — flagged at compile time by `svelte-check`.

---

## LinkButton

`$lib/components/ui/LinkButton.svelte`

A navigation link styled as a button. Use for things that _go somewhere_. For actions, use `<Button>`.

### Inputs

| Prop                  | Type                                                                          | Default     | Notes                               |
| --------------------- | ----------------------------------------------------------------------------- | ----------- | ----------------------------------- |
| `href`                | `string`                                                                      | —           | **Required.** The destination URL.  |
| `variant`             | `'default' \| 'secondary' \| 'destructive' \| 'outline' \| 'ghost' \| 'link'` | `'default'` | Visual style — same as `<Button>`.  |
| `size`                | `'sm' \| 'md' \| 'lg' \| 'icon'`                                              | `'md'`      | Same as `<Button>`.                 |
| `class`               | `string`                                                                      | —           | Caller utility classes.             |
| `children`            | `Snippet`                                                                     | —           | Link label.                         |
| Other DOM `<a>` attrs | —                                                                             | —           | `target`, `rel`, `aria-label`, etc. |

### Behavior

- Renders a semantic `<a href>` element with full button visual styling via `buttonClasses()`.
- Inherits all `variant` and `size` options from `Button`.

### Constraints

- Do not use `<LinkButton>` for actions that submit forms or trigger side effects — use `<Button type="submit">`.
- Do not use `href="#"` or `href="javascript:void(0)"` — those are actions, not navigation.

### A11y

- Native `<a>` element — announced as a link by screen readers.
- Visible `focus-visible` ring matching `<Button>`.

---

## Input

`$lib/components/ui/Input.svelte`

A single-line text input.

### Inputs

| Prop                      | Type      | Default  | Notes                                                                                                                                    |
| ------------------------- | --------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `type`                    | `string`  | `'text'` | Native input types: `'text'`, `'email'`, `'password'`, `'url'`, `'tel'`, `'search'`, `'number'`, `'date'`, `'datetime-local'`, `'time'`. |
| `value`                   | `string`  | `''`     | Bindable.                                                                                                                                |
| `placeholder`             | `string`  | —        |                                                                                                                                          |
| `disabled`                | `boolean` | `false`  |                                                                                                                                          |
| `readonly`                | `boolean` | `false`  |                                                                                                                                          |
| `required`                | `boolean` | `false`  |                                                                                                                                          |
| `invalid`                 | `boolean` | `false`  | Visual + `aria-invalid="true"`.                                                                                                          |
| `id`                      | `string`  | —        | Pair with `<Label for>`.                                                                                                                 |
| `class`                   | `string`  | —        |                                                                                                                                          |
| Other DOM `<input>` attrs | —         | —        | `name`, `autocomplete`, `min`, `max`, `pattern`, `aria-describedby`, ...                                                                 |

### Behavior

- Two-way binding via `bind:value`.
- `invalid` flips border to `destructive` and sets `aria-invalid`.
- Error message UI is the caller's responsibility — usually adjacent text with `id` linked via `aria-describedby`.

### Constraints

- Must have an associated `<Label>` or `aria-label`.
- For multi-line text, use `<Textarea>`.

### A11y

- Visible focus ring.
- `aria-invalid` when `invalid`.
- `aria-describedby` is honored if passed (link to error text).

---

## Textarea

`$lib/components/ui/Textarea.svelte`

Multi-line text input.

### Inputs

| Prop                                          | Type      | Default | Notes                        |
| --------------------------------------------- | --------- | ------- | ---------------------------- |
| `value`                                       | `string`  | `''`    | Bindable.                    |
| `placeholder`                                 | `string`  | —       |                              |
| `rows`                                        | `number`  | `3`     | Visible rows.                |
| `disabled`, `readonly`, `required`, `invalid` | `boolean` | `false` | Same semantics as `<Input>`. |
| `id`, `class`                                 | `string`  | —       |                              |
| Other DOM `<textarea>` attrs                  | —         | —       |                              |

### Behavior

- Two-way binding via `bind:value`.
- Vertical resize only (CSS).

### A11y

Same as `<Input>`.

---

## Label

`$lib/components/ui/Label.svelte`

A label for a form control.

### Inputs

| Prop       | Type      | Default | Notes                                                          |
| ---------- | --------- | ------- | -------------------------------------------------------------- |
| `for`      | `string`  | —       | The `id` of the labeled control. **Required for form labels.** |
| `class`    | `string`  | —       |                                                                |
| `children` | `Snippet` | —       | Label text.                                                    |

### Constraints

- The `for` attribute is required for form labels. Floating standalone labels without `for` are forbidden — use a plain `<span>` for those cases.

### A11y

- Native `<label for>` association.

---

## Card

`$lib/components/ui/Card.svelte`

A surface container. Common containers for grouped content.

### Inputs

| Prop       | Type      | Default | Notes |
| ---------- | --------- | ------- | ----- |
| `class`    | `string`  | —       |       |
| `children` | `Snippet` | —       |       |

### Behavior

- Renders a `<div>` with token-driven background, border, radius, and padding-free interior. Padding is the caller's responsibility via utility classes.

### Constraints

- No built-in padding. Choose with `p-4` / `p-5` / `p-6` depending on density.

### A11y

- No specific guarantees — it is a presentational surface.

### Subcomponents (optional, in same file)

- `<CardHeader>`, `<CardTitle>`, `<CardDescription>`, `<CardContent>`, `<CardFooter>` — semantic helpers for common card layouts.

---

## Dialog

`$lib/components/ui/Dialog.svelte`

A modal dialog with backdrop, focus trap, and escape-to-close.

### Inputs

| Prop          | Type         | Default | Notes                                           |
| ------------- | ------------ | ------- | ----------------------------------------------- |
| `open`        | `boolean`    | `false` | Bindable.                                       |
| `title`       | `string`     | —       | Required. Used as `aria-labelledby` target.     |
| `description` | `string`     | —       | Optional. Used as `aria-describedby` target.    |
| `dismissible` | `boolean`    | `true`  | If `false`, ESC and backdrop click are ignored. |
| `class`       | `string`     | —       |                                                 |
| `children`    | `Snippet`    | —       | Dialog body.                                    |
| `footer`      | `Snippet`    | —       | Optional footer (typically action buttons).     |
| `onclose`     | `() => void` | —       | Fires when the dialog closes for any reason.    |

### Behavior

- When `open` becomes `true`: focus moves into the dialog, scroll is locked on `<body>`, backdrop appears.
- When `open` becomes `false`: focus returns to the element that opened it, scroll unlocks.
- ESC closes when `dismissible`. Backdrop click closes when `dismissible`.
- Focus is trapped inside the dialog — Tab cycles within.

### Constraints

- Do not use for non-modal popovers — use `<Popover>` (planned).
- Do not stack dialogs more than 2 deep — UX problem.

### A11y

- `role="dialog"`, `aria-modal="true"`.
- `aria-labelledby` → `title`.
- `aria-describedby` → `description` if provided.
- Focus trap implemented per WAI-ARIA dialog pattern.

---

## Toast

`$lib/components/ui/Toast.svelte` (plus `toast.svelte.ts` store and `<ToastContainer>` in layout)

Ephemeral notifications.

### API

```ts
import { toast } from '$lib/components/ui';

toast.success('Saved');
toast.error('Could not save', { description: 'Try again in a moment.' });
toast.info('Sync in progress', { duration: 5000 });
toast.warning('Storage almost full');
toast({ title: 'Custom', variant: 'default', duration: 3000, action: { label: 'Undo', onclick: () => ... } });
```

### Options

| Option        | Type                                                       | Default                  | Notes                                                                                                                |
| ------------- | ---------------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `variant`     | `'default' \| 'success' \| 'error' \| 'warning' \| 'info'` | `'default'`              |                                                                                                                      |
| `title`       | `string`                                                   | —                        | The headline. Required when calling `toast({ ... })`. Helpers like `toast.success('msg')` use the argument as title. |
| `description` | `string`                                                   | —                        | Optional secondary text.                                                                                             |
| `duration`    | `number` (ms)                                              | `4000` (`error`: `6000`) | Set to `Infinity` for sticky.                                                                                        |
| `action`      | `{ label: string; onclick: () => void }`                   | —                        | Optional single action button.                                                                                       |

### Constraints

- One `<ToastContainer />` per app, mounted in the root layout.
- Toasts do not block flow — never use them for required user input.

### A11y

- `role="status"` for non-critical, `role="alert"` for `error`/`warning`.
- `aria-live` set accordingly.
- Auto-dismiss is paused on hover and on keyboard focus.

---

## Icon

`$lib/icons/Icon.svelte`

A thin wrapper around `@lucide/svelte` icons providing default sizing and `currentColor`.

### Usage (preferred): direct import

```svelte
<script>
  import { Home, Settings } from '@lucide/svelte';
</script>

<Home size={20} aria-hidden="true" />
```

### Usage (dynamic): the wrapper

```svelte
<script>
  import Icon from '$lib/icons/Icon.svelte';
</script>

<Icon name="Home" size="20" />
```

The wrapper accepts a Lucide icon name. Useful when the icon is data-driven. Direct import is preferred when the icon is known statically — better tree-shaking.

### A11y

- By default, icons are `aria-hidden="true"`. Override with explicit `aria-label` only when the icon stands alone (e.g. icon-only button — but in that case the `aria-label` belongs on the button, not the icon).

---

## Adding a Primitive

The right path when you find yourself building a UI pattern that recurs.

1. Confirm it is genuinely a primitive (no business meaning, reusable across features). If it is feature-specific, it belongs inside that feature.
2. Add the file to `src/lib/components/ui/<Name>.svelte`.
3. Export it from `src/lib/components/ui/index.ts`.
4. Add a contract entry to this file (`COMPONENTS.md`) following the format above.
5. Add component behavior tests in `<Name>.test.ts` and extend route/state a11y coverage in Playwright where relevant.
6. Use only design tokens. No hardcoded colors, spacings, fonts.

Once it exists, features should prefer it over building their own version.
