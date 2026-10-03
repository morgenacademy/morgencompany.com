
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('course-videos', 'course-videos', false, 524288000);

CREATE POLICY "Authenticated users can view videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Service role can upload videos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'course-videos');

CREATE POLICY "Service role can update videos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'course-videos');

CREATE POLICY "Service role can delete videos" ON storage.objects
  FOR DELETE USING (bucket_id = 'course-videos');
