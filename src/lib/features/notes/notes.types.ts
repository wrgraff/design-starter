import type { Database } from '$lib/types/database.types';

export type Note = Database['public']['Tables']['notes']['Row'];

export interface NoteFormValues {
	title: string;
	body: string;
}

export interface NoteFormFieldErrors {
	title?: string;
	body?: string;
	noteId?: string;
}

export type NoteFormMode = 'create' | 'update';

export interface NoteFormState {
	mode: NoteFormMode;
	noteId: string | null;
	values: NoteFormValues;
	fieldErrors: NoteFormFieldErrors;
	formError?: string;
}

export interface NotesActionData {
	formState?: NoteFormState;
	deleteError?: {
		noteId: string;
		message: string;
	};
	message?: string;
}

export interface NotesLoadData {
	notes: Note[];
	notesError: string | null;
}

export type NotesMutationResult =
	| {
			ok: true;
			message: string;
	  }
	| {
			ok: false;
			status: 400 | 401 | 500;
			data: NotesActionData;
	  };
