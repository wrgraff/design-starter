import { describe, expect, it } from 'vitest';
import {
	getNextThemePreference,
	getToggleAriaLabel,
	readStoredThemePreference,
	resolveAppliedTheme
} from './theme.state.svelte';

describe('theme.state', () => {
	it('cycles preference light -> dark -> system -> light', () => {
		expect(getNextThemePreference('light')).toBe('dark');
		expect(getNextThemePreference('dark')).toBe('system');
		expect(getNextThemePreference('system')).toBe('light');
	});

	it('maps labels to the next action', () => {
		expect(getToggleAriaLabel('light')).toBe('Switch to dark theme');
		expect(getToggleAriaLabel('dark')).toBe('Switch to system theme');
		expect(getToggleAriaLabel('system')).toBe('Switch to light theme');
	});

	it('resolves applied theme from preference and system setting', () => {
		expect(resolveAppliedTheme('light', true)).toBe('light');
		expect(resolveAppliedTheme('dark', false)).toBe('dark');
		expect(resolveAppliedTheme('system', true)).toBe('dark');
		expect(resolveAppliedTheme('system', false)).toBe('light');
	});

	it('falls back to system when storage value is invalid', () => {
		expect(readStoredThemePreference('light')).toBe('light');
		expect(readStoredThemePreference('dark')).toBe('dark');
		expect(readStoredThemePreference('system')).toBe('system');
		expect(readStoredThemePreference('broken')).toBe('system');
		expect(readStoredThemePreference(null)).toBe('system');
	});
});
