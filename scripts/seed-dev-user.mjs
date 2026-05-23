#!/usr/bin/env node

// Creates (or resets password of) a dev user on the linked Supabase project.
// Run once after db:push: pnpm db:seed
// Requires SUPABASE_SERVICE_ROLE_KEY in .env.

import { createClient } from '@supabase/supabase-js';

const url = process.env.PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
	console.error('Missing PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
	console.error('Uncomment SUPABASE_SERVICE_ROLE_KEY in .env and fill in the value.');
	process.exit(1);
}

const supabase = createClient(url, serviceKey, {
	auth: { autoRefreshToken: false, persistSession: false }
});

const DEV_EMAIL = 'hi@arturtrifonov.com';
const DEV_PASSWORD = 'devTe5tPass';

const { data, error: listError } = await supabase.auth.admin.listUsers();
if (listError) throw listError;

const existing = data.users.find((u) => u.email === DEV_EMAIL);

if (existing) {
	const { error } = await supabase.auth.admin.updateUserById(existing.id, {
		password: DEV_PASSWORD
	});
	if (error) throw error;
	console.log(`Dev user password reset: ${DEV_EMAIL}`);
} else {
	const { error } = await supabase.auth.admin.createUser({
		email: DEV_EMAIL,
		password: DEV_PASSWORD,
		email_confirm: true
	});
	if (error) throw error;
	console.log(`Dev user created: ${DEV_EMAIL}`);
}
