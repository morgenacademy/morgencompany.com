ALTER TABLE public.waitlist ADD COLUMN newsletter boolean NOT NULL DEFAULT true;
ALTER TABLE public.incompany_requests ADD COLUMN newsletter boolean NOT NULL DEFAULT true;