<script lang="ts">
	import { Button, Input, Label, Textarea } from '$lib/components/ui';
	import { NOTE_BODY_MAX_LENGTH, NOTE_TITLE_MAX_LENGTH } from './notes.utils';
	import type { NoteFormFieldErrors, NoteFormValues } from './notes.types';

	interface Props {
		action: string;
		submitLabel: string;
		values: NoteFormValues;
		fieldErrors?: NoteFormFieldErrors;
		formError?: string;
		noteId?: string;
		idPrefix: string;
		showCancel?: boolean;
		onCancel?: () => void;
	}

	let {
		action,
		submitLabel,
		values,
		fieldErrors = {},
		formError,
		noteId,
		idPrefix,
		showCancel = false,
		onCancel
	}: Props = $props();

	const titleInputId = $derived(`${idPrefix}-title`);
	const bodyInputId = $derived(`${idPrefix}-body`);
	const titleErrorId = $derived(`${idPrefix}-title-error`);
	const bodyErrorId = $derived(`${idPrefix}-body-error`);
	const formErrorId = $derived(`${idPrefix}-form-error`);
</script>

<form method="POST" {action} class="space-y-3" novalidate>
	{#if noteId}
		<input type="hidden" name="noteId" value={noteId} />
	{/if}

	<div class="space-y-1.5">
		<Label for={titleInputId}>Title</Label>
		<Input
			id={titleInputId}
			name="title"
			value={values.title}
			required
			maxlength={NOTE_TITLE_MAX_LENGTH}
			invalid={Boolean(fieldErrors.title)}
			aria-describedby={fieldErrors.title ? titleErrorId : undefined}
		/>
		{#if fieldErrors.title}
			<p id={titleErrorId} class="text-destructive text-xs">{fieldErrors.title}</p>
		{/if}
	</div>

	<div class="space-y-1.5">
		<Label for={bodyInputId}>Body</Label>
		<Textarea
			id={bodyInputId}
			name="body"
			value={values.body}
			rows={5}
			maxlength={NOTE_BODY_MAX_LENGTH}
			invalid={Boolean(fieldErrors.body)}
			aria-describedby={fieldErrors.body ? bodyErrorId : undefined}
		/>
		{#if fieldErrors.body}
			<p id={bodyErrorId} class="text-destructive text-xs">{fieldErrors.body}</p>
		{/if}
	</div>

	{#if formError}
		<p id={formErrorId} class="text-destructive text-xs">{formError}</p>
	{/if}

	<div class="flex items-center gap-2">
		<Button type="submit" size="sm">{submitLabel}</Button>
		{#if showCancel}
			<Button type="button" size="sm" variant="outline" onclick={() => onCancel?.()}>Cancel</Button>
		{/if}
	</div>
</form>
