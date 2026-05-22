-- Ensure notes schema exists even if an earlier template migration was empty.
-- This migration is idempotent and safe to run in environments where `notes`
-- already exists.

CREATE TABLE IF NOT EXISTS public.notes (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	title TEXT NOT NULL,
	body TEXT NOT NULL DEFAULT '',
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notes_user_id_idx ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON public.notes(created_at DESC);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_policies
		WHERE schemaname = 'public'
			AND tablename = 'notes'
			AND policyname = 'users can read their own notes'
	) THEN
		CREATE POLICY "users can read their own notes"
			ON public.notes
			FOR SELECT
			USING (auth.uid() = user_id);
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM pg_policies
		WHERE schemaname = 'public'
			AND tablename = 'notes'
			AND policyname = 'users can insert their own notes'
	) THEN
		CREATE POLICY "users can insert their own notes"
			ON public.notes
			FOR INSERT
			WITH CHECK (auth.uid() = user_id);
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM pg_policies
		WHERE schemaname = 'public'
			AND tablename = 'notes'
			AND policyname = 'users can update their own notes'
	) THEN
		CREATE POLICY "users can update their own notes"
			ON public.notes
			FOR UPDATE
			USING (auth.uid() = user_id)
			WITH CHECK (auth.uid() = user_id);
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM pg_policies
		WHERE schemaname = 'public'
			AND tablename = 'notes'
			AND policyname = 'users can delete their own notes'
	) THEN
		CREATE POLICY "users can delete their own notes"
			ON public.notes
			FOR DELETE
			USING (auth.uid() = user_id);
	END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = now();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.notes;
CREATE TRIGGER set_updated_at
	BEFORE UPDATE ON public.notes
	FOR EACH ROW
	EXECUTE FUNCTION public.trigger_set_updated_at();
