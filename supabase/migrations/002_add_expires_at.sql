-- QR Code Generator - Expires At ve Plan Limitleri
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- =============================================
-- 1. QR_CODES tablosuna expires_at sütunu ekle
-- =============================================
ALTER TABLE public.qr_codes 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Mevcut free kullanıcıların QR kodlarına 10 gün süre ekle
UPDATE public.qr_codes qr
SET expires_at = qr.created_at + INTERVAL '10 days'
FROM public.profiles p
WHERE qr.user_id = p.id 
AND p.plan = 'free'
AND qr.expires_at IS NULL;

-- =============================================
-- 2. PLAN_LIMITS tablosu (Plan kısıtlamaları)
-- =============================================
CREATE TABLE IF NOT EXISTS public.plan_limits (
  plan TEXT PRIMARY KEY CHECK (plan IN ('free', 'pro', 'enterprise')),
  max_qr_codes INTEGER NOT NULL,
  qr_duration_days INTEGER, -- NULL = sınırsız
  can_use_logo BOOLEAN DEFAULT FALSE,
  can_use_frames BOOLEAN DEFAULT FALSE,
  can_use_analytics BOOLEAN DEFAULT FALSE,
  max_scans_per_month INTEGER -- NULL = sınırsız
);

-- Plan limitlerini ekle
INSERT INTO public.plan_limits (plan, max_qr_codes, qr_duration_days, can_use_logo, can_use_frames, can_use_analytics, max_scans_per_month)
VALUES 
  ('free', 2, 10, FALSE, FALSE, FALSE, 100),
  ('pro', 50, NULL, TRUE, TRUE, TRUE, 10000),
  ('enterprise', -1, NULL, TRUE, TRUE, TRUE, NULL) -- -1 = sınırsız
ON CONFLICT (plan) DO UPDATE SET
  max_qr_codes = EXCLUDED.max_qr_codes,
  qr_duration_days = EXCLUDED.qr_duration_days,
  can_use_logo = EXCLUDED.can_use_logo,
  can_use_frames = EXCLUDED.can_use_frames,
  can_use_analytics = EXCLUDED.can_use_analytics,
  max_scans_per_month = EXCLUDED.max_scans_per_month;

-- RLS - Herkes plan limitlerini okuyabilir
ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;

-- Önce mevcut policy'yi sil (varsa)
DROP POLICY IF EXISTS "Anyone can view plan limits" ON public.plan_limits;

CREATE POLICY "Anyone can view plan limits" ON public.plan_limits
  FOR SELECT USING (true);

-- =============================================
-- 3. Aktif QR kod sayısını kontrol eden fonksiyon
-- =============================================
CREATE OR REPLACE FUNCTION public.get_user_active_qr_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.qr_codes
    WHERE user_id = p_user_id
    AND is_active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. QR oluşturma limiti kontrol fonksiyonu
-- =============================================
CREATE OR REPLACE FUNCTION public.can_create_qr(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_plan TEXT;
  v_limit INTEGER;
  v_current INTEGER;
BEGIN
  -- Kullanıcının planını al
  SELECT plan INTO v_plan FROM public.profiles WHERE id = p_user_id;
  
  -- Plan limitini al
  SELECT max_qr_codes INTO v_limit FROM public.plan_limits WHERE plan = v_plan;
  
  -- Mevcut aktif QR sayısını al
  v_current := public.get_user_active_qr_count(p_user_id);
  
  -- -1 = sınırsız
  IF v_limit = -1 THEN
    RETURN jsonb_build_object('can_create', TRUE, 'current', v_current, 'limit', 'unlimited', 'plan', v_plan);
  END IF;
  
  IF v_current >= v_limit THEN
    RETURN jsonb_build_object('can_create', FALSE, 'current', v_current, 'limit', v_limit, 'plan', v_plan);
  END IF;
  
  RETURN jsonb_build_object('can_create', TRUE, 'current', v_current, 'limit', v_limit, 'plan', v_plan);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. Trigger: QR oluşturulduğunda expires_at ayarla
-- =============================================
CREATE OR REPLACE FUNCTION public.set_qr_expiry()
RETURNS TRIGGER AS $$
DECLARE
  v_plan TEXT;
  v_duration INTEGER;
BEGIN
  -- Kullanıcının planını al
  SELECT plan INTO v_plan FROM public.profiles WHERE id = NEW.user_id;
  
  -- Plan süresini al
  SELECT qr_duration_days INTO v_duration FROM public.plan_limits WHERE plan = v_plan;
  
  -- Süre varsa expires_at ayarla
  IF v_duration IS NOT NULL THEN
    NEW.expires_at := NOW() + (v_duration || ' days')::INTERVAL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_qr_expiry_trigger ON public.qr_codes;
CREATE TRIGGER set_qr_expiry_trigger
  BEFORE INSERT ON public.qr_codes
  FOR EACH ROW EXECUTE FUNCTION public.set_qr_expiry();

-- =============================================
-- 6. qr_count otomatik güncelleme trigger'ı
-- =============================================
CREATE OR REPLACE FUNCTION public.update_qr_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET qr_count = qr_count + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET qr_count = qr_count - 1 WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_qr_count_trigger ON public.qr_codes;
CREATE TRIGGER update_qr_count_trigger
  AFTER INSERT OR DELETE ON public.qr_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_qr_count();

