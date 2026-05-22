export type LoginMode = 'password' | 'magic-link';

export function createAuthUiState(initialMode: LoginMode = 'password') {
	let mode = $state<LoginMode>(initialMode);

	function showPassword() {
		mode = 'password';
	}

	function showMagicLink() {
		mode = 'magic-link';
	}

	function toggleMode() {
		mode = mode === 'password' ? 'magic-link' : 'password';
	}

	return {
		get mode() {
			return mode;
		},
		showPassword,
		showMagicLink,
		toggleMode
	};
}
