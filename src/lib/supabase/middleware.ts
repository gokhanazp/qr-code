// Middleware için Supabase client
// Session yenileme ve auth kontrolü için kullanılır
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // İlk response'u oluştur
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Supabase client oluştur
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Request cookie'lerini güncelle
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Yeni response oluştur
          supabaseResponse = NextResponse.next({
            request,
          })
          // Response cookie'lerini güncelle
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ÖNEMLİ: getUser() her zaman çağrılmalı
  // Bu, auth token'ı yeniler ve session'ı kontrol eder
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: { user } } = await supabase.auth.getUser()

  return supabaseResponse
}

