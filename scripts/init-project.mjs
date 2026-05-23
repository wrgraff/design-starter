#!/usr/bin/env node

import { createInterface } from 'node:readline/promises';
import { existsSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const rootDir = process.cwd();
const currentYear = new Date().getFullYear();

const kebabCasePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function ensureFileExists(relativePath) {
	const absolutePath = path.join(rootDir, relativePath);
	if (!existsSync(absolutePath)) {
		throw new Error(`Required file is missing: ${relativePath}`);
	}
	return absolutePath;
}

async function readText(relativePath) {
	return readFile(ensureFileExists(relativePath), 'utf8');
}

async function writeText(relativePath, content) {
	await writeFile(path.join(rootDir, relativePath), content, 'utf8');
}

function escapeSingleQuotes(value) {
	return value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}

function removeBetween(content, startMarker, endMarker, replacement = '') {
	const startIndex = content.indexOf(startMarker);
	if (startIndex === -1) {
		return content;
	}
	const endIndex = content.indexOf(endMarker, startIndex);
	if (endIndex === -1) {
		return content;
	}

	return content.slice(0, startIndex) + replacement + content.slice(endIndex + endMarker.length);
}

async function askQuestion(rl, question, options = {}) {
	const { defaultValue, validate } = options;

	while (true) {
		const suffix = defaultValue ? ` (${defaultValue})` : '';
		const answer = (await rl.question(`${question}${suffix}: `)).trim();
		const value = answer || defaultValue || '';

		if (!validate) {
			return value;
		}

		const validation = validate(value);
		if (validation === true) {
			return value;
		}

		console.log(validation);
	}
}

function parseYesNo(value) {
	const normalized = value.toLowerCase();
	if (['y', 'yes'].includes(normalized)) {
		return true;
	}
	if (['n', 'no'].includes(normalized)) {
		return false;
	}
	return null;
}

async function configureContent({
	projectName,
	projectDescription,
	repoUrl,
	author,
	year,
	keepAuth
}) {
	const replacements = new Map([
		['{{PROJECT_NAME}}', projectName],
		['{{PROJECT_DESCRIPTION}}', projectDescription],
		['{{REPO_URL}}', repoUrl],
		['{{AUTHOR}}', author],
		['{{YEAR}}', String(year)]
	]);

	for (const file of ['README.md', 'LICENSE']) {
		let content = await readText(file);
		for (const [key, value] of replacements.entries()) {
			content = content.replaceAll(key, value);
		}
		content = content.replaceAll('design-starter', projectName);
		// Belt-and-suspenders: erase any leftover template origin traces
		content = content.replaceAll('svelte-pwa-template', projectName);
		await writeText(file, content);
	}

	const packageJsonPath = ensureFileExists('package.json');
	const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
	packageJson.name = projectName;
	packageJson.description = projectDescription;
	delete packageJson.scripts?.['init-project'];

	if (repoUrl) {
		packageJson.repository = repoUrl;
	} else {
		delete packageJson.repository;
	}

	await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, '\t')}\n`, 'utf8');

	let viteConfig = await readText('vite.config.ts');
	const escapedName = escapeSingleQuotes(projectName);
	const escapedDescription = escapeSingleQuotes(projectDescription);

	viteConfig = viteConfig.replace(/(name:\s*')[^']*(')/, `$1${escapedName}$2`);
	viteConfig = viteConfig.replace(/(short_name:\s*')[^']*(')/, `$1${escapedName}$2`);
	viteConfig = viteConfig.replace(/(description:\s*')[^']*(')/, `$1${escapedDescription}$2`);
	await writeText('vite.config.ts', viteConfig);

	let homePage = await readText('src/routes/+page.svelte');
	homePage = homePage.replaceAll('design-starter', projectName);
	await writeText('src/routes/+page.svelte', homePage);

	if (existsSync(path.join(rootDir, 'src/routes/notes/+page.svelte'))) {
		let notesPage = await readText('src/routes/notes/+page.svelte');
		notesPage = notesPage.replaceAll('design-starter', projectName);
		await writeText('src/routes/notes/+page.svelte', notesPage);
	}

	let envExample = await readText('.env.example');
	envExample = envExample.replace(
		/PUBLIC_SUPABASE_URL="[^"]*"/,
		'PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"'
	);
	envExample = envExample.replace(
		/PUBLIC_SUPABASE_ANON_KEY="[^"]*"/,
		'PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"'
	);

	if (!keepAuth) {
		envExample = removeBetween(
			envExample,
			'# ── Optional auth module ─────────────────────────────────────────\n',
			'\n\n# ── App ──────────────────────────────────────────────────────────\n',
			'# ── App ──────────────────────────────────────────────────────────\n'
		);
	}

	await writeText('.env.example', envExample);

	if (!keepAuth) {
		await rm(path.join(rootDir, 'src/lib/auth'), { recursive: true, force: true });
		await rm(path.join(rootDir, 'src/lib/features/auth'), { recursive: true, force: true });
		await rm(path.join(rootDir, 'src/routes/(auth)'), { recursive: true, force: true });
		await rm(path.join(rootDir, 'src/routes/signout'), { recursive: true, force: true });
		await rm(path.join(rootDir, 'docs/AUTH.md'), { force: true });

		let hooks = await readText('src/hooks.server.ts');
		hooks = hooks.replace("import { env } from '$env/dynamic/private';\n", '');
		hooks = hooks.replace("import { assignAdminRole, parseAdminEmails } from '$lib/auth';\n", '');
		hooks = hooks.replace('const adminEmails = parseAdminEmails(env.ADMIN_EMAILS);\n\n', '');
		hooks = hooks.replace(
			'event.locals.user = assignAdminRole(user, adminEmails);',
			'event.locals.user = user;'
		);
		await writeText('src/hooks.server.ts', hooks);

		let appTypes = await readText('src/app.d.ts');
		appTypes = appTypes.replace("import type { AuthUser } from '$lib/auth';\n", '');
		appTypes = appTypes.replaceAll('AuthUser | null', 'User | null');
		await writeText('src/app.d.ts', appTypes);

		let home = await readText('src/routes/+page.svelte');
		home = home.replace("import type { PageData } from './$types';\n\n", '');
		home = home.replace(
			`interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

`,
			''
		);
		home = removeBetween(
			home,
			`\t<Card class="space-y-3 p-6">
\t\t<h2 class="text-lg font-medium">Auth smoke test</h2>`,
			`\n\t</Card>\n\n\t<Card class="space-y-4 p-6">`,
			'\t<Card class="space-y-4 p-6">'
		);
		await writeText('src/routes/+page.svelte', home);
	}

	await rm(path.join(rootDir, 'PLAN.md'), { force: true });
	await rm(path.join(rootDir, 'docs/HANDOFF.md'), { force: true });
}

async function main() {
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout
	});

	try {
		console.log('Initializing project from template.\n');

		const projectName = await askQuestion(rl, 'Project name (kebab-case)', {
			defaultValue: 'my-project',
			validate: (value) =>
				kebabCasePattern.test(value) ||
				'Use kebab-case only: lowercase letters, numbers, and single dashes.'
		});

		const projectDescription = await askQuestion(rl, 'Project description (one line)', {
			defaultValue: 'SvelteKit project'
		});

		const repoUrl = await askQuestion(rl, 'Repository URL (optional)', {
			defaultValue: ''
		});

		const keepAuthRaw = await askQuestion(rl, 'Keep optional auth module? (y/n)', {
			defaultValue: 'y',
			validate: (value) => parseYesNo(value) !== null || 'Enter y/yes or n/no.'
		});
		const keepAuth = parseYesNo(keepAuthRaw);

		const author = await askQuestion(rl, 'Author name', {
			validate: (value) => value.trim().length > 0 || 'Author name is required.'
		});
		const yearRaw = await askQuestion(rl, 'License year', {
			defaultValue: String(currentYear),
			validate: (value) => /^\d{4}$/.test(value) || 'Year must have 4 digits.'
		});
		const year = Number.parseInt(yearRaw, 10);

		await configureContent({ projectName, projectDescription, repoUrl, author, year, keepAuth });

		// Last step: remove this one-shot initializer.
		await rm(path.join(rootDir, 'scripts/init-project.mjs'), { force: true });

		console.log('\nProject initialized.\n');
		console.log('Next steps:');
		console.log('1. cp .env.example .env');
		console.log(
			'2. Fill in PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY from Supabase Dashboard.'
		);
		console.log('3. pnpm check && pnpm lint && pnpm test && pnpm build');
		console.log('4. Commit the initialized project.');
	} finally {
		rl.close();
	}
}

main().catch((error) => {
	console.error('\nInitialization failed:');
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
});
