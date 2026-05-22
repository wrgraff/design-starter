#!/usr/bin/env node

import { createInterface } from 'node:readline/promises';
import { existsSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const rootDir = process.cwd();
const currentYear = new Date().getFullYear();

const kebabCasePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

function round(value, digits = 3) {
	const factor = 10 ** digits;
	return Math.round(value * factor) / factor;
}

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

function normalizeHex(value) {
	const raw = value.trim().toLowerCase();
	if (!raw.startsWith('#')) {
		return null;
	}

	const hex = raw.slice(1);
	if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/.test(hex)) {
		return null;
	}

	if (hex.length === 3) {
		const expanded = hex
			.split('')
			.map((char) => char + char)
			.join('');
		return `#${expanded}`;
	}

	return `#${hex}`;
}

function hexToSrgb(hex) {
	const normalized = normalizeHex(hex);
	if (!normalized) {
		throw new Error(`Invalid hex color: ${hex}`);
	}

	const value = normalized.slice(1);
	return {
		r: Number.parseInt(value.slice(0, 2), 16) / 255,
		g: Number.parseInt(value.slice(2, 4), 16) / 255,
		b: Number.parseInt(value.slice(4, 6), 16) / 255
	};
}

function srgbToLinear(channel) {
	return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(channel) {
	return channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;
}

function srgbToOklch({ r, g, b }) {
	const lr = srgbToLinear(r);
	const lg = srgbToLinear(g);
	const lb = srgbToLinear(b);

	const l = 0.412_221_470_8 * lr + 0.536_332_536_3 * lg + 0.051_445_992_9 * lb;
	const m = 0.211_903_498_2 * lr + 0.680_699_545_1 * lg + 0.107_396_956_6 * lb;
	const s = 0.088_302_461_9 * lr + 0.281_718_837_6 * lg + 0.629_978_700_5 * lb;

	const lRoot = Math.cbrt(l);
	const mRoot = Math.cbrt(m);
	const sRoot = Math.cbrt(s);

	const lLab = 0.210_454_255_3 * lRoot + 0.793_617_785 * mRoot - 0.004_072_046_8 * sRoot;
	const aLab = 1.977_998_495_1 * lRoot - 2.428_592_205 * mRoot + 0.450_593_709_9 * sRoot;
	const bLab = 0.025_904_037_1 * lRoot + 0.782_771_766_2 * mRoot - 0.808_675_766 * sRoot;

	const c = Math.sqrt(aLab * aLab + bLab * bLab);
	const h = ((Math.atan2(bLab, aLab) * 180) / Math.PI + 360) % 360;

	return { l: lLab, c, h };
}

function oklchToHex({ l, c, h }) {
	const hRad = (h * Math.PI) / 180;
	const aLab = c * Math.cos(hRad);
	const bLab = c * Math.sin(hRad);

	const lRoot = l + 0.396_337_777_4 * aLab + 0.215_803_757_3 * bLab;
	const mRoot = l - 0.105_561_345_8 * aLab - 0.063_854_172_8 * bLab;
	const sRoot = l - 0.089_484_177_5 * aLab - 1.291_485_548 * bLab;

	const lLin = lRoot ** 3;
	const mLin = mRoot ** 3;
	const sLin = sRoot ** 3;

	const rLin = 4.076_741_662_1 * lLin - 3.307_711_591_3 * mLin + 0.230_969_929_2 * sLin;
	const gLin = -1.268_438_004_6 * lLin + 2.609_757_401_1 * mLin - 0.341_319_396_5 * sLin;
	const bLin = -0.004_196_086_3 * lLin - 0.703_418_614_7 * mLin + 1.707_614_701 * sLin;

	const r = clamp(linearToSrgb(rLin), 0, 1);
	const g = clamp(linearToSrgb(gLin), 0, 1);
	const b = clamp(linearToSrgb(bLin), 0, 1);

	const toHex = (value) =>
		Math.round(value * 255)
			.toString(16)
			.padStart(2, '0');
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function formatOklch(color) {
	return `oklch(${round(color.l, 3)} ${round(color.c, 3)} ${round(color.h, 3)})`;
}

function parseOklch(input) {
	const match = input
		.trim()
		.match(
			/^oklch\(\s*([0-9]*\.?[0-9]+%?)\s+([0-9]*\.?[0-9]+)\s+(-?[0-9]*\.?[0-9]+)(?:\s*\/\s*[0-9]*\.?[0-9]+)?\s*\)$/i
		);

	if (!match) {
		return null;
	}

	const lightnessRaw = match[1];
	const lightness = lightnessRaw.endsWith('%')
		? Number.parseFloat(lightnessRaw) / 100
		: Number.parseFloat(lightnessRaw);
	const chroma = Number.parseFloat(match[2]);
	const hue = Number.parseFloat(match[3]);

	if (
		Number.isNaN(lightness) ||
		Number.isNaN(chroma) ||
		Number.isNaN(hue) ||
		lightness < 0 ||
		lightness > 1 ||
		chroma < 0
	) {
		return null;
	}

	return { l: lightness, c: chroma, h: ((hue % 360) + 360) % 360 };
}

function deriveDarkPrimary(lightPrimary) {
	return {
		l: clamp(Math.max(0.72, lightPrimary.l + 0.2), 0.72, 0.9),
		c: clamp(lightPrimary.c * 0.75, 0, 0.19),
		h: lightPrimary.h
	};
}

function parseBrandColor(input) {
	const value = input.trim();
	if (!value) {
		return null;
	}

	const hex = normalizeHex(value);
	if (hex) {
		const lightPrimary = srgbToOklch(hexToSrgb(hex));
		const darkPrimary = deriveDarkPrimary(lightPrimary);
		return {
			lightPrimary,
			darkPrimary,
			themeHex: hex
		};
	}

	const oklch = parseOklch(value);
	if (oklch) {
		const darkPrimary = deriveDarkPrimary(oklch);
		return {
			lightPrimary: oklch,
			darkPrimary,
			themeHex: oklchToHex(oklch)
		};
	}

	return null;
}

function escapeSingleQuotes(value) {
	return value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}

function replaceInBlock(fileContent, blockStart, variableName, value) {
	const startIndex = fileContent.indexOf(blockStart);
	if (startIndex === -1) {
		throw new Error(`Cannot find block start: ${blockStart}`);
	}

	const openingBraceIndex = fileContent.indexOf('{', startIndex);
	if (openingBraceIndex === -1) {
		throw new Error(`Cannot find opening brace for block: ${blockStart}`);
	}

	let depth = 0;
	let closingBraceIndex = -1;
	for (let index = openingBraceIndex; index < fileContent.length; index += 1) {
		if (fileContent[index] === '{') {
			depth += 1;
		} else if (fileContent[index] === '}') {
			depth -= 1;
			if (depth === 0) {
				closingBraceIndex = index;
				break;
			}
		}
	}

	if (closingBraceIndex === -1) {
		throw new Error(`Cannot find closing brace for block: ${blockStart}`);
	}

	const block = fileContent.slice(openingBraceIndex, closingBraceIndex + 1);
	const variablePattern = new RegExp(`(--${variableName}:\\s*)[^;]+;`);
	if (!variablePattern.test(block)) {
		throw new Error(`Cannot find CSS variable --${variableName}`);
	}

	const nextBlock = block.replace(variablePattern, `$1${value};`);
	return (
		fileContent.slice(0, openingBraceIndex) + nextBlock + fileContent.slice(closingBraceIndex + 1)
	);
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
	keepAuth,
	supabaseMode,
	brand
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
	viteConfig = viteConfig.replace(
		/(theme_color:\s*')[^']*(')/,
		`$1${brand ? brand.themeHex : '#0a0a0a'}$2`
	);
	await writeText('vite.config.ts', viteConfig);

	let appCss = await readText('src/app.css');
	if (brand) {
		appCss = replaceInBlock(appCss, '@theme', 'color-primary', formatOklch(brand.lightPrimary));
		appCss = replaceInBlock(appCss, '.dark', 'color-primary', formatOklch(brand.darkPrimary));
	}
	await writeText('src/app.css', appCss);

	let homePage = await readText('src/routes/+page.svelte');
	homePage = homePage.replaceAll('design-starter', projectName);
	await writeText('src/routes/+page.svelte', homePage);

	if (existsSync(path.join(rootDir, 'src/routes/notes/+page.svelte'))) {
		let notesPage = await readText('src/routes/notes/+page.svelte');
		notesPage = notesPage.replaceAll('design-starter', projectName);
		await writeText('src/routes/notes/+page.svelte', notesPage);
	}

	let envExample = await readText('.env.example');
	if (supabaseMode === 'remote') {
		envExample = envExample.replace(
			/PUBLIC_SUPABASE_URL="[^"]*"/,
			'PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"'
		);
		envExample = envExample.replace(
			/PUBLIC_SUPABASE_ANON_KEY="[^"]*"/,
			'PUBLIC_SUPABASE_ANON_KEY="your-production-anon-key-here"'
		);
	} else {
		envExample = envExample.replace(
			/PUBLIC_SUPABASE_URL="[^"]*"/,
			'PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"'
		);
		envExample = envExample.replace(
			/PUBLIC_SUPABASE_ANON_KEY="[^"]*"/,
			'PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"'
		);
	}

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

		const supabaseMode = await askQuestion(rl, 'Supabase mode (local/remote)', {
			defaultValue: 'local',
			validate: (value) =>
				['local', 'remote'].includes(value.toLowerCase()) || 'Enter local or remote.'
		});

		const brandRaw = await askQuestion(
			rl,
			'Base brand color (hex or OKLCH, blank to keep neutral)',
			{
				defaultValue: ''
			}
		);

		let brand = null;
		if (brandRaw.trim()) {
			brand = parseBrandColor(brandRaw);
			if (!brand) {
				throw new Error('Brand color is invalid. Use #RRGGBB, #RGB, or oklch(L C H).');
			}
		}

		const author = await askQuestion(rl, 'Author name', {
			validate: (value) => value.trim().length > 0 || 'Author name is required.'
		});
		const yearRaw = await askQuestion(rl, 'License year', {
			defaultValue: String(currentYear),
			validate: (value) => /^\d{4}$/.test(value) || 'Year must have 4 digits.'
		});
		const year = Number.parseInt(yearRaw, 10);

		await configureContent({
			projectName,
			projectDescription,
			repoUrl,
			author,
			year,
			keepAuth,
			supabaseMode: supabaseMode.toLowerCase(),
			brand
		});

		// Last step: remove this one-shot initializer.
		await rm(path.join(rootDir, 'scripts/init-project.mjs'), { force: true });

		console.log('\nProject initialized.\n');
		console.log('Next steps:');
		console.log('1. pnpm install');
		console.log('2. cp .env.example .env');
		console.log(`3. Configure .env values (${supabaseMode.toLowerCase()} Supabase selected).`);
		console.log('4. pnpm check && pnpm lint && pnpm test && pnpm build');
		console.log('5. Commit the initialized project.');
	} finally {
		rl.close();
	}
}

main().catch((error) => {
	console.error('\nInitialization failed:');
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
});
