export type OAuthProvider = 'google' | 'github';

export interface AuthProviders {
	emailPassword: boolean;
	magicLink: boolean;
	google: boolean;
	github: boolean;
}

export const providers: AuthProviders = {
	emailPassword: true,
	magicLink: true,
	google: false,
	github: false
};

export function getEnabledOAuthProviders(config: AuthProviders = providers): OAuthProvider[] {
	const enabled: OAuthProvider[] = [];

	if (config.google) {
		enabled.push('google');
	}

	if (config.github) {
		enabled.push('github');
	}

	return enabled;
}
