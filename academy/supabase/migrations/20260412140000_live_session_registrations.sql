CREATE TABLE IF NOT EXISTS public.live_session_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  session_title TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  seats INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  newsletter BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT live_session_registrations_session_email_key UNIQUE (session_id, email)
);

ALTER TABLE public.live_session_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create live session registrations"
ON public.live_session_registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(trim(session_id)) BETWEEN 1 AND 120
  AND char_length(trim(session_title)) BETWEEN 1 AND 160
  AND char_length(trim(name)) BETWEEN 1 AND 100
  AND char_length(trim(email)) BETWEEN 3 AND 255
  AND position('@' in email) > 1
  AND (company IS NULL OR char_length(trim(company)) <= 120)
  AND seats BETWEEN 1 AND 8
  AND (notes IS NULL OR char_length(trim(notes)) <= 1000)
);

CREATE POLICY "Admins can view live session registrations"
ON public.live_session_registrations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_live_session_registrations_created_at
ON public.live_session_registrations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_live_session_registrations_scheduled_for
ON public.live_session_registrations(scheduled_for ASC);
