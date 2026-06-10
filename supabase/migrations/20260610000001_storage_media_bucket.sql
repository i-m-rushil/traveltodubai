-- Media storage bucket for dashboard image uploads (featured + inline post images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "media bucket: public read" ON storage.objects;
CREATE POLICY "media bucket: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "media bucket: publisher/admin upload" ON storage.objects;
CREATE POLICY "media bucket: publisher/admin upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND current_user_role() IN ('publisher', 'admin')
  );

DROP POLICY IF EXISTS "media bucket: publisher/admin update own" ON storage.objects;
CREATE POLICY "media bucket: publisher/admin update own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'media'
    AND current_user_role() IN ('publisher', 'admin')
  );

DROP POLICY IF EXISTS "media bucket: publisher/admin delete" ON storage.objects;
CREATE POLICY "media bucket: publisher/admin delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'media'
    AND current_user_role() IN ('publisher', 'admin')
  );
