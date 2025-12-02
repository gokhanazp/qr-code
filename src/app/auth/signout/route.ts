// Çıkış yapma route'u (Sign out route)
// Supabase session'ı sonlandırır ve login sayfasına yönlendirir
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Session'ı sonlandır
  await supabase.auth.signOut()

  // Request URL'inden base URL'i al (daha güvenilir)
  const requestUrl = new URL(request.url)
  const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`

  // Referer'dan nereden geldiğini kontrol et
  const referer = request.headers.get('referer') || ''

  // Admin panelinden çıkış yapıyorsa admin login'e yönlendir
  if (referer.includes('/admin')) {
    return NextResponse.redirect(new URL('/admin/login', baseUrl))
  }

  // Normal kullanıcılar için ana login sayfasına yönlendir
  return NextResponse.redirect(new URL('/auth/login', baseUrl))
}

