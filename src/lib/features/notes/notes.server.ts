import type { User } from '@supabase/supabase-js';
import type { NoteFormValues, NotesLoadData, NotesMutationResult } from './notes.types';
import {
	BLANK_NOTE_FORM_VALUES,
	createNoteFormState,
	hasNoteFormErrors,
	sanitizeNoteFormValues,
	validateNoteFormValues
} from './notes.utils';

type NotesSupabaseClient = App.Locals['supabase'];

interface NotesServerContext {
	supabase: NotesSupabaseClient;
	user: User | null;
}

const NOTES_LOAD_ERROR = 'Could not load notes right now.';

function getFormString(formData: FormData, key: string): string {
	const value = formData.get(key);
	return typeof value === 'string' ? value : '';
}

function parseNoteValues(formData: FormData): NoteFormValues {
	return {
		title: getFormString(formData, 'title'),
		body: getFormString(formData, 'body')
	};
}

function parseNoteId(formData: FormData): string {
	return getFormString(formData, 'noteId').trim();
}

export async function listNotesForUser({
	supabase,
	user
}: NotesServerContext): Promise<NotesLoadData> {
	if (!user) {
		return { notes: [], notesError: null };
	}

	const { data, error } = await supabase
		.schema('public')
		.from('notes')
		.select('*')
		.eq('user_id', user.id)
		.order('created_at', { ascending: false });

	if (error) {
		return {
			notes: [],
			notesError: NOTES_LOAD_ERROR
		};
	}

	return {
		notes: data,
		notesError: null
	};
}

export async function createNoteAction(
	context: NotesServerContext,
	formData: FormData
): Promise<NotesMutationResult> {
	if (!context.user) {
		return {
			ok: false,
			status: 401,
			data: {
				formState: createNoteFormState('create', BLANK_NOTE_FORM_VALUES, {
					formError: 'Sign in to create notes.'
				})
			}
		};
	}

	const values = sanitizeNoteFormValues(parseNoteValues(formData));
	const fieldErrors = validateNoteFormValues(values);

	if (hasNoteFormErrors(fieldErrors)) {
		return {
			ok: false,
			status: 400,
			data: {
				formState: createNoteFormState('create', values, {
					fieldErrors
				})
			}
		};
	}

	const { error } = await context.supabase.schema('public').from('notes').insert({
		title: values.title,
		body: values.body,
		user_id: context.user.id
	});

	if (error) {
		return {
			ok: false,
			status: 500,
			data: {
				formState: createNoteFormState('create', values, {
					formError: 'Could not create the note. Please try again.'
				})
			}
		};
	}

	return {
		ok: true,
		message: 'Note created.'
	};
}

export async function updateNoteAction(
	context: NotesServerContext,
	formData: FormData
): Promise<NotesMutationResult> {
	const noteId = parseNoteId(formData);
	const values = sanitizeNoteFormValues(parseNoteValues(formData));

	if (!context.user) {
		return {
			ok: false,
			status: 401,
			data: {
				formState: createNoteFormState('update', values, {
					noteId: noteId || null,
					formError: 'Sign in to update notes.'
				})
			}
		};
	}

	if (!noteId) {
		return {
			ok: false,
			status: 400,
			data: {
				formState: createNoteFormState('update', values, {
					noteId: null,
					fieldErrors: {
						noteId: 'Missing note identifier.'
					}
				})
			}
		};
	}

	const fieldErrors = validateNoteFormValues(values);
	if (hasNoteFormErrors(fieldErrors)) {
		return {
			ok: false,
			status: 400,
			data: {
				formState: createNoteFormState('update', values, {
					noteId,
					fieldErrors
				})
			}
		};
	}

	const { data, error } = await context.supabase
		.schema('public')
		.from('notes')
		.update({
			title: values.title,
			body: values.body
		})
		.eq('id', noteId)
		.eq('user_id', context.user.id)
		.select('id');

	if (error) {
		return {
			ok: false,
			status: 500,
			data: {
				formState: createNoteFormState('update', values, {
					noteId,
					formError: 'Could not update the note. Please try again.'
				})
			}
		};
	}

	if (!data || data.length === 0) {
		return {
			ok: false,
			status: 400,
			data: {
				formState: createNoteFormState('update', values, {
					noteId,
					formError: 'Note not found.'
				})
			}
		};
	}

	return {
		ok: true,
		message: 'Note updated.'
	};
}

export async function deleteNoteAction(
	context: NotesServerContext,
	formData: FormData
): Promise<NotesMutationResult> {
	const noteId = parseNoteId(formData);

	if (!context.user) {
		return {
			ok: false,
			status: 401,
			data: {
				deleteError: {
					noteId,
					message: 'Sign in to delete notes.'
				}
			}
		};
	}

	if (!noteId) {
		return {
			ok: false,
			status: 400,
			data: {
				deleteError: {
					noteId: '',
					message: 'Missing note identifier.'
				}
			}
		};
	}

	const { data, error } = await context.supabase
		.schema('public')
		.from('notes')
		.delete()
		.eq('id', noteId)
		.eq('user_id', context.user.id)
		.select('id');

	if (error) {
		return {
			ok: false,
			status: 500,
			data: {
				deleteError: {
					noteId,
					message: 'Could not delete the note. Please try again.'
				}
			}
		};
	}

	if (!data || data.length === 0) {
		return {
			ok: false,
			status: 400,
			data: {
				deleteError: {
					noteId,
					message: 'Note not found.'
				}
			}
		};
	}

	return {
		ok: true,
		message: 'Note deleted.'
	};
}
