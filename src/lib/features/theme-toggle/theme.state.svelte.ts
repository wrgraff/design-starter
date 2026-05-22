export type ThemePreference = 'light' | 'dark' | 'system';
export type AppliedTheme = 'light' | 'dark';

const THEME_PREFERENCE_CYCLE: ThemePreference[] = ['light', 'dark', 'system'];
const STORAGE_KEY = 'theme';

export function readStoredThemePreference(value: string | null): ThemePreference {
	if (value === 'light' || value === 'dark' || value === 'system') {
		return value;
	}

	return 'system';
}

export function getNextThemePreference(current: ThemePreference): ThemePreference {
	const index = THEME_PREFERENCE_CYCLE.indexOf(current);
	const nextIndex = (index + 1) % THEME_PREFERENCE_CYCLE.length;
	return THEME_PREFERENCE_CYCLE[nextIndex] ?? 'light';
}

export function getToggleAriaLabel(current: ThemePreference): string {
	switch (current) {
		case 'light':
			return 'Switch to dark theme';
		case 'dark':
			return 'Switch to system theme';
		case 'system':
			return 'Switch to light theme';
	}
}

export function resolveAppliedTheme(
	preference: ThemePreference,
	systemPrefersDark: boolean
): AppliedTheme {
	if (preference === 'dark') {
		return 'dark';
	}

	if (preference === 'light') {
		return 'light';
	}

	return systemPrefersDark ? 'dark' : 'light';
}

export function createThemeState() {
	let preference = $state<ThemePreference>('system');
	let systemPrefersDark = $state(false);
	let cleanupMediaListener: (() => void) | null = null;

	const appliedTheme = $derived(resolveAppliedTheme(preference, systemPrefersDark));
	const toggleAriaLabel = $derived(getToggleAriaLabel(preference));

	function persistPreference(nextPreference: ThemePreference) {
		try {
			localStorage.setItem(STORAGE_KEY, nextPreference);
		} catch {
			// Ignore storage errors in restricted browser contexts.
		}
	}

	function applyToDom(nextAppliedTheme: AppliedTheme) {
		document.documentElement.classList.toggle('dark', nextAppliedTheme === 'dark');
	}

	function updatePreference(nextPreference: ThemePreference) {
		preference = nextPreference;
		persistPreference(nextPreference);
		applyToDom(resolveAppliedTheme(nextPreference, systemPrefersDark));
	}

	function cyclePreference() {
		updatePreference(getNextThemePreference(preference));
	}

	function start() {
		if (typeof window === 'undefined' || cleanupMediaListener) {
			return;
		}

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		systemPrefersDark = mediaQuery.matches;

		let storedPreference: ThemePreference = 'system';
		try {
			storedPreference = readStoredThemePreference(localStorage.getItem(STORAGE_KEY));
		} catch {
			// Ignore storage errors in restricted browser contexts.
		}
		preference = storedPreference;
		applyToDom(resolveAppliedTheme(storedPreference, mediaQuery.matches));

		const handleChange = (event: MediaQueryListEvent) => {
			systemPrefersDark = event.matches;
			if (preference === 'system') {
				applyToDom(resolveAppliedTheme(preference, event.matches));
			}
		};

		mediaQuery.addEventListener('change', handleChange);
		cleanupMediaListener = () => {
			mediaQuery.removeEventListener('change', handleChange);
		};
	}

	function stop() {
		if (cleanupMediaListener) {
			cleanupMediaListener();
			cleanupMediaListener = null;
		}
	}

	return {
		get preference() {
			return preference;
		},
		get appliedTheme() {
			return appliedTheme;
		},
		get toggleAriaLabel() {
			return toggleAriaLabel;
		},
		start,
		stop,
		updatePreference,
		cyclePreference
	};
}
