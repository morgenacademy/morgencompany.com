-- Create table for general contact requests
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  newsletter BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create contact requests"
ON public.contact_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(trim(name)) BETWEEN 1 AND 100
  AND char_length(trim(email)) BETWEEN 3 AND 255
  AND position('@' in email) > 1
  AND char_length(trim(message)) BETWEEN 1 AND 1000
);

CREATE POLICY "Admins can view contact requests"
ON public.contact_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create table for newsletter signups
CREATE TABLE IF NOT EXISTS public.newsletter_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(trim(email)) BETWEEN 3 AND 255
  AND position('@' in email) > 1
  AND (first_name IS NULL OR char_length(trim(first_name)) <= 100)
);

CREATE POLICY "Admins can view newsletter signups"
ON public.newsletter_signups
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON public.contact_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_signups_created_at ON public.newsletter_signups(created_at DESC);