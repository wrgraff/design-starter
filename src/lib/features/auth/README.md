# Auth Feature

## 1. Purpose

The `auth` feature provides UI and server-action helpers for login, signup, magic-link sign-in, OAuth provider sign-in, and sign-out using Supabase Auth cookies. It handles auth form rendering/validation feedback but does not own route protection rules outside `requireUser()`.

## 2. Public API

Exports from `index.ts` (client-safe):

- `AuthCard: Component`
- `LoginForm: Component`
- `SignupForm: Component`
- `MagicLinkForm: Component`
- `ProviderButtons: Component`
- `createAuthUiState(initialMode?: 'password' | 'magic-link')`
- Types:
  - `AuthActionData`
  - `CredentialsFormState`
  - `MagicLinkFormState`
  - `CredentialsValues`
  - `MagicLinkValues`
  - `CredentialsErrors`
  - `MagicLinkErrors`
  - `OAuthStartResult`
  - `AuthMutationResult`
  - `AuthRouteOptions`
  - `LoginMode`

Exports from `index.server.ts` (server-only):

- `readNextFromUrl(url: URL): string`
- `validateCredentials(values): CredentialsErrors`
- `validateMagicLink(values): MagicLinkErrors`
- `loginWithPassword(context, formData, options): Promise<AuthMutationResult>`
- `signupWithPassword(context, formData, options): Promise<AuthMutationResult>`
- `requestMagicLink(context, formData, options): Promise<AuthMutationResult>`
- `startOAuth(context, provider, options): Promise<OAuthStartResult | null>`
- `signOut(context): Promise<void>`

## 3. Dependencies

- UI primitives:
  - `$lib/components/ui/Button.svelte`
  - `$lib/components/ui/Card.svelte`
  - `$lib/components/ui/Input.svelte`
  - `$lib/components/ui/Label.svelte`
- Auth config:
  - `$lib/auth/providers.ts`
- Supabase server client from `event.locals.supabase`

## 4. Database

- Uses Supabase Auth (`auth.users`, sessions managed via cookies).
- Relies on Supabase auth provider configuration and redirect URLs.

## 5. State

- Form values/errors are server-driven via SvelteKit `form` action data.
- Login view mode (`password`/`magic-link`) is local runes state in `auth.state.svelte.ts`.
- No cross-feature mutable shared state.

## 6. A11y notes

- All auth inputs have explicit `<Label for="...">` connections.
- Validation and auth errors are shown as visible text near fields.
- Provider/auth actions are semantic `<button>` controls in real `<form>` elements.

## 7. Out of scope

- Multi-factor auth.
- Password reset flow.
- Profile editing and account settings.
- Non-email auth methods beyond configured OAuth provider buttons.
