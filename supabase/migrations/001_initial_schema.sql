-- QR Code Generator - Veritabanı Şeması
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın
-- NOT: Bu script birden fazla kez çalıştırılabilir (idempotent)

-- =============================================
-- 1. PROFILES TABLOSU (Kullanıcı profilleri)
-- =============================================
-- auth.users tablosuyla 1:1 ilişki
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  qr_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) etkinleştir
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Önce mevcut policy'leri sil (varsa)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Kullanıcılar sadece kendi profillerini görebilir
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Kullanıcılar sadece kendi profillerini güncelleyebilir
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- 2. QR_CODES TABLOSU (Oluşturulan QR kodları)
-- =============================================
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'url', 'vcard', 'wifi', 'text', etc.
  content JSONB NOT NULL, -- QR içeriği (tip'e göre değişir)
  settings JSONB DEFAULT '{}', -- renk, boyut, frame, logo ayarları
  short_code TEXT UNIQUE, -- dinamik QR için kısa kod
  is_dynamic BOOLEAN DEFAULT FALSE,
  scan_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS etkinleştir
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Önce mevcut policy'leri sil (varsa)
DROP POLICY IF EXISTS "Users can view own QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can create own QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can update own QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can delete own QR codes" ON public.qr_codes;

-- Kullanıcılar sadece kendi QR kodlarını görebilir
CREATE POLICY "Users can view own QR codes" ON public.qr_codes
  FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcılar kendi QR kodlarını oluşturabilir
CREATE POLICY "Users can create own QR codes" ON public.qr_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi QR kodlarını güncelleyebilir
CREATE POLICY "Users can update own QR codes" ON public.qr_codes
  FOR UPDATE USING (auth.uid() = user_id);

-- Kullanıcılar kendi QR kodlarını silebilir
CREATE POLICY "Users can delete own QR codes" ON public.qr_codes
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 3. QR_SCANS TABLOSU (Tarama istatistikleri)
-- =============================================
CREATE TABLE IF NOT EXISTS public.qr_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id UUID REFERENCES public.qr_codes(id) ON DELETE CASCADE NOT NULL,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  browser TEXT,
  os TEXT
);

-- RLS etkinleştir
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- Önce mevcut policy'leri sil (varsa)
DROP POLICY IF EXISTS "Users can view own QR scans" ON public.qr_scans;
DROP POLICY IF EXISTS "Anyone can create scan records" ON public.qr_scans;

-- Kullanıcılar kendi QR kodlarının taramalarını görebilir
CREATE POLICY "Users can view own QR scans" ON public.qr_scans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.qr_codes
      WHERE qr_codes.id = qr_scans.qr_code_id
      AND qr_codes.user_id = auth.uid()
    )
  );

-- Herkes tarama kaydı oluşturabilir (anonim taramalar için)
CREATE POLICY "Anyone can create scan records" ON public.qr_scans
  FOR INSERT WITH CHECK (true);

-- =============================================
-- 4. SUBSCRIPTIONS TABLOSU (Abonelikler)
-- =============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS etkinleştir
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Önce mevcut policy'leri sil (varsa)
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;

-- Kullanıcılar sadece kendi aboneliklerini görebilir
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- 5. TRIGGER: Yeni kullanıcı için profil oluştur
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı auth.users tablosuna bağla
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 6. TRIGGER: updated_at otomatik güncelleme
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Profiles için
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- QR Codes için
DROP TRIGGER IF EXISTS qr_codes_updated_at ON public.qr_codes;
CREATE TRIGGER qr_codes_updated_at
  BEFORE UPDATE ON public.qr_codes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Subscriptions için
DROP TRIGGER IF EXISTS subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- 7. INDEX'ler (Performans için)
-- =============================================
CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON public.qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_short_code ON public.qr_codes(short_code);
CREATE INDEX IF NOT EXISTS idx_qr_scans_qr_code_id ON public.qr_scans(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_scanned_at ON public.qr_scans(scanned_at);

