import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	createNoteAction,
	deleteNoteAction,
	listNotesForUser,
	updateNoteAction
} from '$lib/features/notes/index.server';

export const load: PageServerLoad = async ({ locals }) => {
	const { notes, notesError } = await listNotesForUser({
		supabase: locals.supabase,
		user: locals.user
	});

	return {
		notes,
		notesError
	};
};

export const actions: Actions = {
	create: async ({ locals, request }) => {
		const result = await createNoteAction(
			{ supabase: locals.supabase, user: locals.user },
			await request.formData()
		);

		if (!result.ok) {
			return fail(result.status, result.data);
		}

		return { message: result.message };
	},

	update: async ({ locals, request }) => {
		const result = await updateNoteAction(
			{ supabase: locals.supabase, user: locals.user },
			await request.formData()
		);

		if (!result.ok) {
			return fail(result.status, result.data);
		}

		return { message: result.message };
	},

	delete: async ({ locals, request }) => {
		const result = await deleteNoteAction(
			{ supabase: locals.supabase, user: locals.user },
			await request.formData()
		);

		if (!result.ok) {
			return fail(result.status, result.data);
		}

		return { message: result.message };
	}
};
