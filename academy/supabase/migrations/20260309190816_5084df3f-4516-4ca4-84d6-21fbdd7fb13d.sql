
CREATE TABLE public.lesson_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id text NOT NULL,
  lesson_id text NOT NULL,
  video_url text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, lesson_id)
);

ALTER TABLE public.lesson_videos ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage lesson videos"
ON public.lesson_videos
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Authenticated users can read (to play videos)
CREATE POLICY "Authenticated users can read lesson videos"
ON public.lesson_videos
FOR SELECT
TO authenticated
USING (true);
