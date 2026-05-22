<script lang="ts">
	import { NotesList } from '$lib/features/notes';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
</script>

<svelte:head>
	<title>Notes | design-starter</title>
	<meta name="description" content="Notes feature demo with Supabase CRUD and RLS." />
</svelte:head>

<main class="mx-auto max-w-3xl p-6">
	<NotesList
		notes={data.notes}
		signedIn={Boolean(data.user)}
		loading={false}
		loadError={data.notesError}
		actionData={form ?? null}
	/>
</main>
