<script lang="ts">
	import { Card } from '$lib/components/ui';
	import NoteCard from './NoteCard.svelte';
	import NoteForm from './NoteForm.svelte';
	import { createNotesState } from './notes.state.svelte';
	import { BLANK_NOTE_FORM_VALUES } from './notes.utils';
	import type { Note, NotesActionData } from './notes.types';

	interface Props {
		notes: Note[];
		signedIn: boolean;
		loading?: boolean;
		loadError?: string | null;
		actionData?: NotesActionData | null;
	}

	let { notes, signedIn, loading = false, loadError = null, actionData = null }: Props = $props();

	const notesState = createNotesState();

	const createFormState = $derived(
		actionData?.formState?.mode === 'create' ? actionData.formState : null
	);

	$effect(() => {
		if (actionData?.formState?.mode === 'update' && actionData.formState.noteId) {
			notesState.startEditing(actionData.formState.noteId);
		}
	});
</script>

<section class="space-y-6">
	<header class="space-y-2">
		<h1 class="text-2xl font-semibold tracking-tight">Notes</h1>
		<p class="text-muted-foreground text-sm">Create and manage personal notes in Supabase.</p>
	</header>

	{#if actionData?.message}
		<p class="text-success text-sm" role="status" aria-live="polite">{actionData.message}</p>
	{/if}

	{#if !signedIn}
		<Card class="space-y-2 p-4">
			<h2 class="text-base font-semibold">Sign in required</h2>
			<p class="text-muted-foreground text-sm">Sign in to manage notes.</p>
		</Card>
	{:else}
		<Card class="space-y-4 p-4">
			<h2 class="text-base font-semibold">Create note</h2>
			<NoteForm
				action="?/create"
				submitLabel="Create"
				values={createFormState?.values ?? BLANK_NOTE_FORM_VALUES}
				fieldErrors={createFormState?.fieldErrors ?? {}}
				formError={createFormState?.formError}
				idPrefix="note-create"
			/>
		</Card>
	{/if}

	{#if loading}
		<Card class="p-4">
			<p class="text-muted-foreground text-sm">Loading notes...</p>
		</Card>
	{:else if loadError}
		<Card class="space-y-2 p-4">
			<h2 class="text-base font-semibold">Could not load notes</h2>
			<p class="text-destructive text-sm">{loadError}</p>
		</Card>
	{:else if signedIn && notes.length === 0}
		<Card class="p-4">
			<p class="text-muted-foreground text-sm">No notes yet. Create your first note above.</p>
		</Card>
	{:else if signedIn}
		<ul class="space-y-3">
			{#each notes as note (note.id)}
				<li>
					<NoteCard
						{note}
						isEditing={notesState.isEditing(note.id)}
						formState={actionData?.formState?.mode === 'update' &&
						actionData.formState.noteId === note.id
							? actionData.formState
							: null}
						deleteErrorMessage={actionData?.deleteError?.noteId === note.id
							? actionData.deleteError.message
							: null}
						onStartEditing={notesState.startEditing}
						onCancelEditing={notesState.stopEditing}
					/>
				</li>
			{/each}
		</ul>
	{/if}
</section>
