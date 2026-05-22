import type { User } from '@supabase/supabase-js';

export interface AuthUser extends User {
	isAdmin: boolean;
}

export function parseAdminEmails(value: string | undefined): Set<string> {
	if (!value) {
		return new Set();
	}

	const normalized = value
		.split(',')
		.map((entry) => entry.trim().toLowerCase())
		.filter(Boolean);

	return new Set(normalized);
}

export function assignAdminRole(user: User | null, adminEmails: Set<string>): AuthUser | null {
	if (!user) {
		return null;
	}

	const email = user.email?.toLowerCase() ?? '';
	const isAdmin = email.length > 0 && adminEmails.has(email);

	return {
		...user,
		isAdmin
	};
}
