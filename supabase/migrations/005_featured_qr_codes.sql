-- Featured QR Codes - Ana sayfada gösterilecek müşteri QR kodları
-- (Featured QR Codes - Customer QR codes to display on homepage)
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- =============================================
-- 1. QR_CODES tablosuna is_featured sütunu ekle
-- =============================================
ALTER TABLE public.qr_codes 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Index ekle - featured sorguları için
CREATE INDEX IF NOT EXISTS idx_qr_codes_featured 
ON public.qr_codes(is_featured) 
WHERE is_featured = TRUE;

-- =============================================
-- 2. Featured QR kodları public olarak okuma izni
-- =============================================
-- Herkes featured QR kodları görebilir (ana sayfa için)
DROP POLICY IF EXISTS "Anyone can view featured QR codes" ON public.qr_codes;
CREATE POLICY "Anyone can view featured QR codes" ON public.qr_codes
  FOR SELECT USING (is_featured = TRUE);

-- =============================================
-- 3. Yardımcı view - Featured QR kodları kolay çekmek için
-- =============================================
CREATE OR REPLACE VIEW public.featured_qr_codes AS
SELECT 
  qr.id,
  qr.name,
  qr.type,
  qr.content,
  qr.settings,
  qr.short_code,
  qr.scan_count,
  qr.created_at,
  p.full_name as owner_name,
  p.plan as owner_plan
FROM public.qr_codes qr
LEFT JOIN public.profiles p ON qr.user_id = p.id
WHERE qr.is_featured = TRUE
  AND qr.is_active = TRUE
  AND (qr.expires_at IS NULL OR qr.expires_at > NOW())
ORDER BY qr.scan_count DESC, qr.created_at DESC
LIMIT 12;

-- View için SELECT izni
GRANT SELECT ON public.featured_qr_codes TO anon, authenticated;

