-- Fix Security Definer View - Add security_invoker=true
-- Ref: https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view

CREATE OR REPLACE VIEW public.featured_qr_codes WITH (security_invoker = true) AS
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

-- View için SELECT izni (Ensure permissions are kept/re-applied)
GRANT SELECT ON public.featured_qr_codes TO anon, authenticated;
