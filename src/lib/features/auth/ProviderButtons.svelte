<script lang="ts">
	import { Button } from '$lib/components/ui';
	import type { OAuthProvider } from '$lib/auth';

	interface Props {
		enabledProviders: OAuthProvider[];
		providerError?: string;
		next?: string;
	}

	let { enabledProviders, providerError, next }: Props = $props();

	function label(provider: OAuthProvider): string {
		switch (provider) {
			case 'google':
				return 'Continue with Google';
			case 'github':
				return 'Continue with GitHub';
		}
	}
</script>

{#if enabledProviders.length > 0}
	<div class="space-y-2">
		{#each enabledProviders as provider (provider)}
			<form method="POST" action={`?/oauth-${provider}`}>
				{#if next}
					<input type="hidden" name="next" value={next} />
				{/if}
				<Button type="submit" variant="outline" class="w-full">{label(provider)}</Button>
			</form>
		{/each}

		{#if providerError}
			<p class="text-destructive text-xs">{providerError}</p>
		{/if}
	</div>
{/if}
