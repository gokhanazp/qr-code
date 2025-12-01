-- Admin Panel için Yeni Tablolar
-- (Admin Panel New Tables)
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- =============================================
-- 1. CONTACT_MESSAGES TABLOSU (İletişim Mesajları)
-- =============================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS etkinleştir
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Herkes mesaj oluşturabilir (iletişim formu için)
DROP POLICY IF EXISTS "Anyone can create contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can create contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

-- Sadece admin'ler mesajları görebilir (admin kontrolü uygulama katmanında yapılacak)
DROP POLICY IF EXISTS "Service role can manage contact messages" ON public.contact_messages;
CREATE POLICY "Service role can manage contact messages" ON public.contact_messages
  FOR ALL USING (true);

-- =============================================
-- 2. ORDERS TABLOSU (Siparişler/Abonelik Değişiklikleri)
-- =============================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  from_plan TEXT NOT NULL,
  to_plan TEXT NOT NULL CHECK (to_plan IN ('free', 'pro', 'enterprise')),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  payment_method TEXT,
  payment_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS etkinleştir
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi siparişlerini görebilir
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- Service role tüm siparişleri yönetebilir
DROP POLICY IF EXISTS "Service role can manage orders" ON public.orders;
CREATE POLICY "Service role can manage orders" ON public.orders
  FOR ALL USING (true);

-- =============================================
-- 3. PRICING_PLANS TABLOSU (Dinamik Fiyatlandırma)
-- =============================================
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id TEXT PRIMARY KEY CHECK (id IN ('free', 'pro', 'enterprise')),
  name TEXT NOT NULL,
  name_tr TEXT NOT NULL,
  description TEXT,
  description_tr TEXT,
  price_monthly DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'TRY',
  max_qr_codes INTEGER NOT NULL DEFAULT 2,
  qr_duration_days INTEGER, -- NULL = sınırsız
  can_use_logo BOOLEAN DEFAULT FALSE,
  can_use_frames BOOLEAN DEFAULT FALSE,
  can_use_analytics BOOLEAN DEFAULT FALSE,
  can_use_custom_colors BOOLEAN DEFAULT FALSE,
  can_download_svg BOOLEAN DEFAULT FALSE,
  can_download_pdf BOOLEAN DEFAULT FALSE,
  max_scans_per_month INTEGER, -- NULL = sınırsız
  features JSONB DEFAULT '[]', -- Ek özellikler listesi
  is_popular BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS etkinleştir
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

-- Herkes planları görebilir
DROP POLICY IF EXISTS "Anyone can view pricing plans" ON public.pricing_plans;
CREATE POLICY "Anyone can view pricing plans" ON public.pricing_plans
  FOR SELECT USING (is_active = true);

-- Service role planları yönetebilir
DROP POLICY IF EXISTS "Service role can manage pricing plans" ON public.pricing_plans;
CREATE POLICY "Service role can manage pricing plans" ON public.pricing_plans
  FOR ALL USING (true);

-- Varsayılan planları ekle
INSERT INTO public.pricing_plans (id, name, name_tr, description, description_tr, price_monthly, price_yearly, max_qr_codes, qr_duration_days, can_use_logo, can_use_frames, can_use_analytics, can_use_custom_colors, can_download_svg, can_download_pdf, max_scans_per_month, features, is_popular, sort_order)
VALUES 
  ('free', 'Free', 'Ücretsiz', 'Perfect for trying out', 'Denemek için ideal', 0, 0, 2, 10, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, 100, '["2 QR Codes", "10 Days Validity", "PNG Download", "Basic Colors"]'::jsonb, FALSE, 1),
  ('pro', 'Pro', 'Pro', 'For professionals and small businesses', 'Profesyoneller ve küçük işletmeler için', 49, 470, 50, NULL, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 10000, '["50 QR Codes", "Unlimited Validity", "Logo Support", "All Formats", "Analytics", "Custom Frames"]'::jsonb, TRUE, 2),
  ('enterprise', 'Enterprise', 'Kurumsal', 'For large organizations', 'Büyük organizasyonlar için', 199, 1910, -1, NULL, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, NULL, '["Unlimited QR Codes", "API Access", "Priority Support", "White Label", "Bulk Generation"]'::jsonb, FALSE, 3)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_tr = EXCLUDED.name_tr,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  max_qr_codes = EXCLUDED.max_qr_codes,
  features = EXCLUDED.features;

-- =============================================
-- 4. ADMIN_USERS TABLOSU (Admin Kullanıcıları)
-- =============================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS etkinleştir
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Service role admin'leri yönetebilir
DROP POLICY IF EXISTS "Service role can manage admin users" ON public.admin_users;
CREATE POLICY "Service role can manage admin users" ON public.admin_users
  FOR ALL USING (true);

-- =============================================
-- 5. TRIGGER'LAR (Otomatik updated_at)
-- =============================================
DROP TRIGGER IF EXISTS contact_messages_updated_at ON public.contact_messages;
CREATE TRIGGER contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS pricing_plans_updated_at ON public.pricing_plans;
CREATE TRIGGER pricing_plans_updated_at
  BEFORE UPDATE ON public.pricing_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- 6. INDEX'LER (Performans için)
-- =============================================
CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON public.contact_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- =============================================
-- 7. ADMIN KONTROL FONKSİYONU
-- =============================================
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

