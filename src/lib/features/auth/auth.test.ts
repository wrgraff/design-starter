import { describe, expect, it } from 'vitest';
import { assignAdminRole, parseAdminEmails, requireUser } from '$lib/auth';
import { validateCredentials, validateMagicLink } from './auth.server';

describe('auth validation', () => {
	it('requires valid credentials', () => {
		expect(validateCredentials({ email: '', password: '' })).toEqual({
			email: 'Email is required.',
			password: 'Password is required.'
		});

		expect(validateCredentials({ email: 'wrong', password: '123' })).toEqual({
			email: 'Enter a valid email address.',
			password: 'Password must be at least 6 characters.'
		});
	});

	it('requires valid email for magic link', () => {
		expect(validateMagicLink({ email: '' })).toEqual({ email: 'Email is required.' });
		expect(validateMagicLink({ email: 'not-an-email' })).toEqual({
			email: 'Enter a valid email address.'
		});
		expect(validateMagicLink({ email: 'user@example.com' })).toEqual({});
	});
});

describe('requireUser', () => {
	it('redirects to login when user is missing', () => {
		let thrown: unknown;

		try {
			requireUser({ user: null }, { next: '/notes' });
		} catch (error) {
			thrown = error;
		}

		expect(thrown).toMatchObject({ status: 303, location: '/login?next=%2Fnotes' });
	});
});

describe('admin role assignment', () => {
	it('marks users in ADMIN_EMAILS as admins', () => {
		const admins = parseAdminEmails('admin@example.com, second@example.com');
		const user = {
			id: '123',
			aud: 'authenticated',
			role: 'authenticated',
			email: 'admin@example.com',
			created_at: new Date().toISOString(),
			app_metadata: {},
			user_metadata: {}
		} as const;

		const assigned = assignAdminRole(user, admins);

		expect(assigned?.isAdmin).toBe(true);
		expect(assignAdminRole({ ...user, email: 'other@example.com' }, admins)?.isAdmin).toBe(false);
	});
});
