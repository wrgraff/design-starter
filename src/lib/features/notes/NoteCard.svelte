<script lang="ts">
	import { Button, Card } from '$lib/components/ui';
	import { formatDateTime } from '$lib/utils/format-date';
	import NoteForm from './NoteForm.svelte';
	import type { Note, NoteFormState } from './notes.types';

	interface Props {
		note: Note;
		isEditing: boolean;
		formState: NoteFormState | null;
		deleteErrorMessage?: string | null;
		onStartEditing: (noteId: string) => void;
		onCancelEditing: () => void;
	}

	let {
		note,
		isEditing,
		formState,
		deleteErrorMessage = null,
		onStartEditing,
		onCancelEditing
	}: Props = $props();

	const updatedAtLabel = $derived(formatDateTime(note.updated_at));
	const createdAtLabel = $derived(formatDateTime(note.created_at));
</script>

<Card class="space-y-4 p-4">
	{#if isEditing}
		<div class="space-y-2">
			<h3 class="text-base font-semibold">Edit note</h3>
			<NoteForm
				action="?/update"
				submitLabel="Save"
				noteId={note.id}
				values={formState?.values ?? { title: note.title, body: note.body }}
				fieldErrors={formState?.fieldErrors ?? {}}
				formError={formState?.formError}
				idPrefix={`note-edit-${note.id}`}
				showCancel={true}
				onCancel={onCancelEditing}
			/>
		</div>
	{:else}
		<div class="space-y-2">
			<h3 class="text-base font-semibold">{note.title}</h3>
			<p class="text-sm whitespace-pre-wrap">{note.body || 'No content yet.'}</p>
			<p class="text-muted-foreground text-xs">
				Created {createdAtLabel}. Updated {updatedAtLabel}.
			</p>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<Button size="sm" variant="outline" onclick={() => onStartEditing(note.id)}>Edit</Button>

			<form method="POST" action="?/delete">
				<input type="hidden" name="noteId" value={note.id} />
				<Button type="submit" size="sm" variant="destructive">Delete</Button>
			</form>
		</div>

		{#if deleteErrorMessage}
			<p class="text-destructive text-xs">{deleteErrorMessage}</p>
		{/if}
	{/if}
</Card>
