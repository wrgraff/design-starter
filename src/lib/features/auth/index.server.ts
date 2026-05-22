export {
	EMPTY_CREDENTIALS_VALUES,
	EMPTY_MAGIC_LINK_VALUES,
	readNextFromUrl,
	readNextFromFormData,
	sanitizeCredentials,
	sanitizeMagicLinkValues,
	validateCredentials,
	validateMagicLink,
	loginWithPassword,
	signupWithPassword,
	requestMagicLink,
	startOAuth,
	signOut
} from './auth.server';

export type {
	AuthActionData,
	AuthMutationResult,
	AuthRouteOptions,
	OAuthStartResult
} from './auth.types';
