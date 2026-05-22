export function createNotesState(initialEditingNoteId: string | null = null) {
	let editingNoteId = $state<string | null>(initialEditingNoteId);

	function startEditing(noteId: string) {
		editingNoteId = noteId;
	}

	function stopEditing() {
		editingNoteId = null;
	}

	function isEditing(noteId: string): boolean {
		return editingNoteId === noteId;
	}

	return {
		get editingNoteId() {
			return editingNoteId;
		},
		startEditing,
		stopEditing,
		isEditing
	};
}
