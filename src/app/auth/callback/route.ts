// OAuth Callback Route
// Google OAuth ve email doğrulama sonrası yönlendirme işler
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // next parametresi varsa oraya yönlendir, yoksa dashboard'a
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    // Auth code'u session'a çevir
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Başarılı - yönlendir
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Hata durumunda login sayfasına yönlendir
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
}

