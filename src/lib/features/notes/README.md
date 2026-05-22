# Notes Feature

## 1. Purpose

The `notes` feature provides authenticated users with CRUD operations for personal notes (create, read, update, delete) using Supabase and RLS. It renders the full notes UI state (create form, list, empty state, validation errors) and does not implement authentication itself.

## 2. Public API

Exports from `index.ts` (client-safe):

- `NotesList: Component`
  - Props:
    - `notes: Note[]`
    - `signedIn: boolean`
    - `loading?: boolean`
    - `loadError?: string | null`
    - `actionData?: NotesActionData | null`
  - Events/callbacks: N/A (internal callbacks only)
  - Snippets/slots: N/A
- `NOTE_TITLE_MAX_LENGTH: 120`
- `NOTE_BODY_MAX_LENGTH: 5000`
- `BLANK_NOTE_FORM_VALUES: NoteFormValues`
- `sanitizeNoteFormValues(values: NoteFormValues): NoteFormValues`
- `validateNoteFormValues(values: NoteFormValues): NoteFormFieldErrors`
- `hasNoteFormErrors(errors: NoteFormFieldErrors): boolean`
- `createNoteFormState(mode, values, options?): NoteFormState`
- Types:
  - `Note`
  - `NoteFormMode`
  - `NoteFormValues`
  - `NoteFormFieldErrors`
  - `NoteFormState`
  - `NotesActionData`
  - `NotesLoadData`
  - `NotesMutationResult`

Exports from `index.server.ts` (server-only):

- `listNotesForUser(args: { supabase: App.Locals['supabase']; user: User | null }): Promise<NotesLoadData>`
- `createNoteAction(args, formData): Promise<NotesMutationResult>`
- `updateNoteAction(args, formData): Promise<NotesMutationResult>`
- `deleteNoteAction(args, formData): Promise<NotesMutationResult>`

## 3. Dependencies

- UI primitives:
  - `$lib/components/ui/Button.svelte`
  - `$lib/components/ui/Card.svelte`
  - `$lib/components/ui/Input.svelte`
  - `$lib/components/ui/Label.svelte`
  - `$lib/components/ui/Textarea.svelte`
- Utils:
  - `$lib/utils/format-date`
- Server/runtime:
  - Supabase client from `event.locals.supabase`

## 4. Database

- Reads/writes table: `public.notes`
- Relies on RLS policies:
  - `users can read their own notes`
  - `users can insert their own notes`
  - `users can update their own notes`
  - `users can delete their own notes`
- Uses generated type source: `$lib/types/database.types.ts`

## 5. State

- UI edit mode state is local to `NotesList` via `createNotesState()` in `notes.state.svelte.ts`.
- Form values and validation errors are server-driven through SvelteKit form actions (`actionData`).
- State does not persist beyond page reload/navigation and is not shared across features.

## 6. A11y notes

- All form controls use semantic elements with explicit `<Label for="...">` associations.
- Validation errors are rendered as text and linked via `aria-describedby` + `aria-invalid`.
- Async action success feedback uses `role="status"` with `aria-live="polite"`.
- Action controls use semantic `<button>` elements (no click handlers on non-interactive elements).

## 7. Out of scope

- No cross-user collaboration or shared notes.
- No rich text editing, tagging, or search.
- No offline sync or optimistic conflict resolution.
- No auth UI; unsigned users see a passive sign-in prompt only.
