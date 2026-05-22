<script lang="ts">
	import { Button, Card, Input, Label, Dialog } from '$lib/components/ui';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let dialogOpen = $state(false);
	let name = $state('');
</script>

<svelte:head>
	<title>design-starter</title>
	<meta name="description" content="design-starter template — fresh install" />
</svelte:head>

<main class="mx-auto max-w-2xl space-y-8 p-6">
	<header class="space-y-2">
		<h1 class="text-3xl font-semibold tracking-tight">design-starter</h1>
		<p class="text-muted-foreground text-sm">
			Fresh install. Replace this with your actual landing page or first feature. See <code
				class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">AGENTS.md</code
			>
			and
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">docs/</code> for what to do
			next.
		</p>
	</header>

	<Card class="space-y-3 p-6">
		<h2 class="text-lg font-medium">Feature demos</h2>
		<p class="text-muted-foreground text-sm">
			Use this section to open isolated feature examples while building the template.
		</p>
		<div class="flex flex-wrap gap-2">
			<a
				href="/notes"
				class="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
			>
				Open Notes feature
			</a>
		</div>
	</Card>

	<Card class="space-y-3 p-6">
		<h2 class="text-lg font-medium">Auth smoke test</h2>
		{#if data.user}
			<p class="text-sm">
				Logged in as <span class="font-medium">{data.user.email}</span>
				{#if data.user.isAdmin}
					<span class="text-muted-foreground">(admin)</span>
				{/if}
			</p>
			<form method="POST" action="/login?/signout">
				<Button type="submit" variant="outline">Logout</Button>
			</form>
		{:else}
			<p class="text-muted-foreground text-sm">You are currently logged out.</p>
			<div class="flex flex-wrap gap-2">
				<a
					href="/login"
					class="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
				>
					Login
				</a>
				<a
					href="/signup"
					class="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
				>
					Sign up
				</a>
			</div>
		{/if}
	</Card>

	<Card class="space-y-4 p-6">
		<div>
			<h2 class="text-lg font-medium">Primitive smoke test</h2>
			<p class="text-muted-foreground text-sm">
				If the styling here looks right in both light and dark mode, the design system is wired up.
			</p>
		</div>

		<div class="space-y-2">
			<Label for="name">Name</Label>
			<Input id="name" bind:value={name} placeholder="Type something" />
		</div>

		<div class="flex flex-wrap gap-2">
			<Button onclick={() => (dialogOpen = true)}>Open dialog</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="outline">Outline</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="destructive">Destructive</Button>
		</div>
	</Card>

	<Dialog bind:open={dialogOpen} title="Hello" description="This is a smoke-test dialog.">
		<p class="text-sm">
			If you can see this, focus is trapped here, ESC closes it, and the design tokens render.
		</p>
		{#snippet footer()}
			<Button variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
			<Button onclick={() => (dialogOpen = false)}>OK</Button>
		{/snippet}
	</Dialog>
</main>
