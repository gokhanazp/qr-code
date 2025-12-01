-- vCard Fotoğraf Yükleme için Supabase Storage Bucket Oluşturma
-- (Create Supabase Storage Bucket for vCard Photo Upload)

-- Storage bucket oluştur (Create storage bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vcard-photos',
  'vcard-photos',
  true,  -- Public erişim (Public access)
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
) ON CONFLICT (id) DO NOTHING;

-- Herkese okuma izni (Public read access policy)
CREATE POLICY "Public read access for vcard photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'vcard-photos');

-- Authenticated kullanıcılara yükleme izni (Upload access for authenticated users)
CREATE POLICY "Authenticated users can upload vcard photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vcard-photos');

-- Anonim kullanıcılara da yükleme izni (Upload access for anonymous users - for guest uploads)
CREATE POLICY "Anonymous users can upload vcard photos"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'vcard-photos');

-- Kullanıcılar kendi yükledikleri fotoğrafları silebilir (Users can delete their own uploads)
CREATE POLICY "Users can delete own vcard photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'vcard-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Anonim kullanıcılar da silebilir (Anonymous users can also delete)
CREATE POLICY "Anonymous users can delete vcard photos"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'vcard-photos');

