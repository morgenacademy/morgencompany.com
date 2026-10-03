DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_signups;
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(trim(email)) BETWEEN 3 AND 255
  AND position('@' in email) > 1
  AND char_length(trim(coalesce(first_name, ''))) BETWEEN 1 AND 100
);