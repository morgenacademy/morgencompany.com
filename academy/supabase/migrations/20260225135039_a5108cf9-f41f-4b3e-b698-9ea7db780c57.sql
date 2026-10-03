
-- Create role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: users can read their own roles
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Update storage policies: admin can upload
DROP POLICY IF EXISTS "Service role can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Service role can update videos" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete videos" ON storage.objects;

CREATE POLICY "Admin can upload videos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'course-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update videos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'course-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete videos" ON storage.objects
  FOR DELETE USING (bucket_id = 'course-videos' AND public.has_role(auth.uid(), 'admin'));
