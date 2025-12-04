-- Site Ayarları Tablosu (Site Settings Table)
-- Para birimi, dil ve diğer site geneli ayarlar için

-- =============================================
-- 1. SITE_SETTINGS TABLOSU
-- =============================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS etkinleştir
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir (Public read)
DROP POLICY IF EXISTS "Public read site settings" ON public.site_settings;
CREATE POLICY "Public read site settings" ON public.site_settings
  FOR SELECT TO public USING (true);

-- Sadece admin'ler yazabilir (Admin write)
DROP POLICY IF EXISTS "Admin write site settings" ON public.site_settings;
CREATE POLICY "Admin write site settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- Updated_at trigger
DROP TRIGGER IF EXISTS site_settings_updated_at ON public.site_settings;
CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- 2. VARSAYILAN AYARLAR (Default Settings)
-- =============================================
INSERT INTO public.site_settings (key, value, description)
VALUES 
  ('currency', 'TRY', 'Fiyatlandırma para birimi (TRY, USD, EUR)')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- 3. PRICING_PLANS CURRENCY GÜNCELLEMESİ
-- =============================================
-- Eğer currency kolonu yoksa ekle
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pricing_plans' AND column_name = 'currency'
  ) THEN
    ALTER TABLE public.pricing_plans ADD COLUMN currency TEXT DEFAULT 'TRY';
  END IF;
END $$;

-- Mevcut planların currency'sini TRY yap (eğer null ise)
UPDATE public.pricing_plans SET currency = 'TRY' WHERE currency IS NULL;

