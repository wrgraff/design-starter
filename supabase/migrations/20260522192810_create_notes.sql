CREATE TABLE public.notes (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	title TEXT NOT NULL,
	body TEXT NOT NULL DEFAULT '',
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX notes_user_id_idx ON public.notes(user_id);
CREATE INDEX notes_created_at_idx ON public.notes(created_at DESC);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read their own notes"
	ON public.notes
	FOR SELECT
	USING (auth.uid() = user_id);

CREATE POLICY "users can insert their own notes"
	ON public.notes
	FOR INSERT
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update their own notes"
	ON public.notes
	FOR UPDATE
	USING (auth.uid() = user_id)
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can delete their own notes"
	ON public.notes
	FOR DELETE
	USING (auth.uid() = user_id);

CREATE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = now();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
	BEFORE UPDATE ON public.notes
	FOR EACH ROW
	EXECUTE FUNCTION public.trigger_set_updated_at();
