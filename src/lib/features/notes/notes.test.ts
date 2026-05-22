import { describe, expect, it } from 'vitest';
import {
	NOTE_BODY_MAX_LENGTH,
	NOTE_TITLE_MAX_LENGTH,
	createNoteFormState,
	hasNoteFormErrors,
	sanitizeNoteFormValues,
	validateNoteFormValues
} from './notes.utils';

describe('notes.utils', () => {
	it('requires a non-empty title after trimming', () => {
		const values = sanitizeNoteFormValues({ title: '   ', body: '' });
		const errors = validateNoteFormValues(values);

		expect(errors.title).toBe('Title is required.');
	});

	it('returns max-length errors for title and body', () => {
		const values = {
			title: 'x'.repeat(NOTE_TITLE_MAX_LENGTH + 1),
			body: 'y'.repeat(NOTE_BODY_MAX_LENGTH + 1)
		};

		const errors = validateNoteFormValues(values);

		expect(errors.title).toContain(String(NOTE_TITLE_MAX_LENGTH));
		expect(errors.body).toContain(String(NOTE_BODY_MAX_LENGTH));
	});

	it('keeps valid values error-free', () => {
		const values = sanitizeNoteFormValues({
			title: '  Valid title  ',
			body: 'Body text   '
		});

		const errors = validateNoteFormValues(values);

		expect(values.title).toBe('Valid title');
		expect(values.body).toBe('Body text');
		expect(errors).toEqual({});
	});
});

describe('note form state helpers', () => {
	it('marks state invalid when field errors exist', () => {
		const state = createNoteFormState(
			'create',
			{ title: '', body: '' },
			{
				fieldErrors: { title: 'Title is required.' }
			}
		);

		expect(hasNoteFormErrors(state.fieldErrors)).toBe(true);
	});

	it('can represent update mode with note id', () => {
		const state = createNoteFormState(
			'update',
			{ title: 'Draft', body: 'Body' },
			{ noteId: 'note-1' }
		);

		expect(state.mode).toBe('update');
		expect(state.noteId).toBe('note-1');
		expect(state.values.title).toBe('Draft');
	});
});
