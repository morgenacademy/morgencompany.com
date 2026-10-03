CREATE TABLE public.incompany_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.incompany_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert incompany requests"
  ON public.incompany_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);