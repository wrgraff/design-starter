declare module 'virtual:pwa-info' {
	export interface PwaInfo {
		webManifest: {
			href: string;
			useCredentials: boolean;
			linkTag: string;
		};
	}

	export const pwaInfo: PwaInfo | undefined;
}

declare module 'virtual:pwa-register' {
	type RegisterSWOptions = {
		immediate?: boolean;
		onNeedRefresh?: () => void;
		onOfflineReady?: () => void;
		onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
		onRegisterError?: (error: unknown) => void;
	};

	export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}
