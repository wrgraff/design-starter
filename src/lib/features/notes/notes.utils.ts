import type { NoteFormFieldErrors, NoteFormState, NoteFormValues } from './notes.types';

export const NOTE_TITLE_MAX_LENGTH = 120;
export const NOTE_BODY_MAX_LENGTH = 5000;

export const BLANK_NOTE_FORM_VALUES: NoteFormValues = {
	title: '',
	body: ''
};

export function sanitizeNoteFormValues(values: NoteFormValues): NoteFormValues {
	return {
		title: values.title.trim(),
		body: values.body.trimEnd()
	};
}

export function validateNoteFormValues(values: NoteFormValues): NoteFormFieldErrors {
	const errors: NoteFormFieldErrors = {};

	if (values.title.length === 0) {
		errors.title = 'Title is required.';
	}

	if (values.title.length > NOTE_TITLE_MAX_LENGTH) {
		errors.title = `Title must be ${NOTE_TITLE_MAX_LENGTH} characters or fewer.`;
	}

	if (values.body.length > NOTE_BODY_MAX_LENGTH) {
		errors.body = `Body must be ${NOTE_BODY_MAX_LENGTH} characters or fewer.`;
	}

	return errors;
}

export function hasNoteFormErrors(errors: NoteFormFieldErrors): boolean {
	return Object.values(errors).some(Boolean);
}

export function createNoteFormState(
	mode: NoteFormState['mode'],
	values: NoteFormValues,
	options?: {
		noteId?: string | null;
		fieldErrors?: NoteFormFieldErrors;
		formError?: string;
	}
): NoteFormState {
	return {
		mode,
		noteId: options?.noteId ?? null,
		values,
		fieldErrors: options?.fieldErrors ?? {},
		formError: options?.formError
	};
}
