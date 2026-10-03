DROP POLICY IF EXISTS "Anyone can insert incompany requests" ON public.incompany_requests;
CREATE POLICY "Anyone can insert incompany requests"
ON public.incompany_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(trim(name)) BETWEEN 1 AND 100
  AND char_length(trim(email)) BETWEEN 3 AND 255
  AND position('@' in email) > 1
  AND (remarks IS NULL OR char_length(trim(remarks)) <= 1000)
);

DROP POLICY IF EXISTS "Anyone can insert into waitlist" ON public.waitlist;
CREATE POLICY "Anyone can insert into waitlist"
ON public.waitlist
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(trim(first_name)) BETWEEN 1 AND 100
  AND char_length(trim(email)) BETWEEN 3 AND 255
  AND position('@' in email) > 1
  AND char_length(trim(course_id)) BETWEEN 1 AND 100
);