import { redirect } from '@sveltejs/kit';
import { signOut } from '$lib/features/auth/index.server';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
	await signOut({ supabase: locals.supabase });
	throw redirect(303, '/login');
};
