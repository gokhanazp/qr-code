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

  // Login sayfasına yönlendir
  return NextResponse.redirect(new URL('/auth/login', baseUrl))
}

