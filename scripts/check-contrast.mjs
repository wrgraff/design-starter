#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const appCssPath = path.join(process.cwd(), 'src/app.css');
const pairsPath = path.join(process.cwd(), 'scripts/contrast-pairs.json');

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

function round(value, digits = 2) {
	const multiplier = 10 ** digits;
	return Math.round(value * multiplier) / multiplier;
}

function extractBlock(content, selector) {
	const startIndex = content.indexOf(selector);
	if (startIndex === -1) {
		throw new Error(`Cannot find block: ${selector}`);
	}

	const openBraceIndex = content.indexOf('{', startIndex);
	if (openBraceIndex === -1) {
		throw new Error(`Cannot find opening brace for block: ${selector}`);
	}

	let depth = 0;
	for (let index = openBraceIndex; index < content.length; index += 1) {
		if (content[index] === '{') {
			depth += 1;
		}
		if (content[index] === '}') {
			depth -= 1;
			if (depth === 0) {
				return content.slice(openBraceIndex + 1, index);
			}
		}
	}

	throw new Error(`Cannot find closing brace for block: ${selector}`);
}

function parseVariables(blockText) {
	const variables = new Map();
	const declarationPattern = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi;
	let match = declarationPattern.exec(blockText);

	while (match) {
		variables.set(match[1], match[2].trim());
		match = declarationPattern.exec(blockText);
	}

	return variables;
}

function parseOklch(value) {
	const pattern =
		/^oklch\(\s*([0-9]*\.?[0-9]+%?)\s+([0-9]*\.?[0-9]+)\s+(-?[0-9]*\.?[0-9]+)(?:\s*\/\s*([0-9]*\.?[0-9]+))?\s*\)$/i;
	const match = value.match(pattern);
	if (!match) {
		return null;
	}

	const lightnessRaw = match[1];
	const l = lightnessRaw.endsWith('%')
		? Number.parseFloat(lightnessRaw) / 100
		: Number.parseFloat(lightnessRaw);
	const c = Number.parseFloat(match[2]);
	const h = Number.parseFloat(match[3]);
	const alpha = match[4] ? Number.parseFloat(match[4]) : 1;

	if (
		Number.isNaN(l) ||
		Number.isNaN(c) ||
		Number.isNaN(h) ||
		Number.isNaN(alpha) ||
		l < 0 ||
		l > 1 ||
		c < 0 ||
		alpha < 0 ||
		alpha > 1
	) {
		return null;
	}

	return { l, c, h: ((h % 360) + 360) % 360, alpha };
}

function parseHex(value) {
	const normalized = value.trim().toLowerCase();
	if (!normalized.startsWith('#')) {
		return null;
	}

	const hex = normalized.slice(1);
	if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/.test(hex)) {
		return null;
	}

	const expanded =
		hex.length === 3
			? hex
					.split('')
					.map((char) => char + char)
					.join('')
			: hex;

	return {
		r: Number.parseInt(expanded.slice(0, 2), 16) / 255,
		g: Number.parseInt(expanded.slice(2, 4), 16) / 255,
		b: Number.parseInt(expanded.slice(4, 6), 16) / 255,
		a: 1
	};
}

function parseRgb(value) {
	const normalized = value.trim();
	const rgbPattern =
		/^rgb\(\s*([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)(?:\s*\/\s*([0-9]*\.?[0-9]+))?\s*\)$/i;
	const match = normalized.match(rgbPattern);
	if (!match) {
		return null;
	}

	const r = Number.parseFloat(match[1]);
	const g = Number.parseFloat(match[2]);
	const b = Number.parseFloat(match[3]);
	const a = match[4] ? Number.parseFloat(match[4]) : 1;

	if (
		Number.isNaN(r) ||
		Number.isNaN(g) ||
		Number.isNaN(b) ||
		Number.isNaN(a) ||
		r < 0 ||
		r > 255 ||
		g < 0 ||
		g > 255 ||
		b < 0 ||
		b > 255 ||
		a < 0 ||
		a > 1
	) {
		return null;
	}

	return {
		r: r / 255,
		g: g / 255,
		b: b / 255,
		a
	};
}

function linearToSrgb(channel) {
	return channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;
}

function oklchToSrgb(color) {
	const hRad = (color.h * Math.PI) / 180;
	const aLab = color.c * Math.cos(hRad);
	const bLab = color.c * Math.sin(hRad);

	const lRoot = color.l + 0.396_337_777_4 * aLab + 0.215_803_757_3 * bLab;
	const mRoot = color.l - 0.105_561_345_8 * aLab - 0.063_854_172_8 * bLab;
	const sRoot = color.l - 0.089_484_177_5 * aLab - 1.291_485_548 * bLab;

	const lLinear = lRoot ** 3;
	const mLinear = mRoot ** 3;
	const sLinear = sRoot ** 3;

	const rLinear = 4.076_741_662_1 * lLinear - 3.307_711_591_3 * mLinear + 0.230_969_929_2 * sLinear;
	const gLinear =
		-1.268_438_004_6 * lLinear + 2.609_757_401_1 * mLinear - 0.341_319_396_5 * sLinear;
	const bLinear = -0.004_196_086_3 * lLinear - 0.703_418_614_7 * mLinear + 1.707_614_701 * sLinear;

	return {
		r: clamp(linearToSrgb(rLinear), 0, 1),
		g: clamp(linearToSrgb(gLinear), 0, 1),
		b: clamp(linearToSrgb(bLinear), 0, 1),
		a: color.alpha
	};
}

function parseColor(value) {
	const oklch = parseOklch(value);
	if (oklch) {
		return oklchToSrgb(oklch);
	}

	const hex = parseHex(value);
	if (hex) {
		return hex;
	}

	const rgb = parseRgb(value);
	if (rgb) {
		return rgb;
	}

	throw new Error(`Unsupported color format: ${value}`);
}

function toLinear(channel) {
	return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance({ r, g, b }) {
	const rLinear = toLinear(r);
	const gLinear = toLinear(g);
	const bLinear = toLinear(b);
	return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

function blend(foreground, background) {
	const alpha = foreground.a ?? 1;
	if (alpha >= 1) {
		return { r: foreground.r, g: foreground.g, b: foreground.b, a: 1 };
	}

	return {
		r: foreground.r * alpha + background.r * (1 - alpha),
		g: foreground.g * alpha + background.g * (1 - alpha),
		b: foreground.b * alpha + background.b * (1 - alpha),
		a: 1
	};
}

function contrastRatio(foreground, background) {
	const foregroundLuminance = relativeLuminance(foreground);
	const backgroundLuminance = relativeLuminance(background);
	const lighter = Math.max(foregroundLuminance, backgroundLuminance);
	const darker = Math.min(foregroundLuminance, backgroundLuminance);
	return (lighter + 0.05) / (darker + 0.05);
}

function resolveThemeColor(variables, tokenName) {
	const fullToken = `color-${tokenName}`;
	const value = variables.get(fullToken);
	if (!value) {
		throw new Error(`Missing token: --${fullToken}`);
	}
	return parseColor(value);
}

function formatRow(columns, widths) {
	return columns.map((value, index) => String(value).padEnd(widths[index])).join('  ');
}

function printResults(results) {
	const header = ['Theme', 'Context', 'Pair', 'Ratio', 'Min', 'Status'];
	const rows = results.map((result) => [
		result.theme,
		result.context,
		`${result.fg} on ${result.bg}`,
		round(result.ratio, 2).toFixed(2),
		result.min.toFixed(1),
		result.ok ? 'PASS' : 'FAIL'
	]);

	const widths = header.map((value, index) =>
		Math.max(value.length, ...rows.map((row) => String(row[index]).length))
	);

	console.log(formatRow(header, widths));
	console.log(widths.map((width) => '-'.repeat(width)).join('  '));
	for (const row of rows) {
		console.log(formatRow(row, widths));
	}
}

async function main() {
	const [appCss, pairsRaw] = await Promise.all([
		readFile(appCssPath, 'utf8'),
		readFile(pairsPath, 'utf8')
	]);

	const pairs = JSON.parse(pairsRaw);
	if (!Array.isArray(pairs) || pairs.length === 0) {
		throw new Error('contrast-pairs.json must be a non-empty array.');
	}

	const lightBlock = extractBlock(appCss, '@theme');
	const darkBlock = extractBlock(appCss, '.dark');

	const lightVariables = parseVariables(lightBlock);
	const darkVariables = parseVariables(darkBlock);

	const results = [];
	for (const pair of pairs) {
		if (!pair || typeof pair !== 'object') {
			throw new Error('Each pair must be an object.');
		}
		const { fg, bg, min, context } = pair;
		if (!fg || !bg || typeof min !== 'number') {
			throw new Error(`Invalid pair entry: ${JSON.stringify(pair)}`);
		}

		for (const [theme, variables] of [
			['light', lightVariables],
			['dark', darkVariables]
		]) {
			const background = resolveThemeColor(variables, bg);
			const foregroundRaw = resolveThemeColor(variables, fg);
			const foreground = blend(foregroundRaw, background);
			const ratio = contrastRatio(foreground, background);
			results.push({
				theme,
				context: context ?? '',
				fg,
				bg,
				min,
				ratio,
				ok: ratio >= min
			});
		}
	}

	printResults(results);

	const failures = results.filter((result) => !result.ok);
	if (failures.length > 0) {
		console.error(`\nContrast check failed: ${failures.length} pair(s) below minimum ratio.`);
		process.exit(1);
	}

	console.log('\nContrast check passed.');
}

main().catch((error) => {
	console.error('Contrast check failed with an error:');
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
});
