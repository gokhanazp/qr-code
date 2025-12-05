// Next.js Middleware - Session kontrolü ve URL yerelleştirme
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { locales, defaultLocale, pathnames, Locale } from '@/i18n/config'

// Türkçe URL'leri İngilizce eşdeğerlerine çeviren map
const turkishToEnglishPaths: Record<string, string> = {
  '/ozellikler': '/features',
  '/fiyatlandirma': '/pricing',
  '/iletisim': '/contact',
  '/hakkimizda': '/about',
  '/gizlilik': '/privacy',
  '/kullanim-kosullari': '/terms',
  '/qr-olusturucu': '/qr-generator',
  '/panel': '/dashboard',
  '/panel/analitik': '/dashboard/analytics',
  '/panel/abonelik': '/dashboard/subscription',
  '/ayarlar': '/settings',
  '/giris': '/auth/login',
  '/kayit': '/auth/register',
}

// Türkçe URL kontrolü - bu URL'ler Türkçe içerik göstermeli
function isTurkishUrl(pathname: string): boolean {
  // Tam eşleşme kontrol et
  if (Object.keys(turkishToEnglishPaths).includes(pathname)) {
    return true
  }
  // Dinamik route kontrol et (örn: /qr-olusturucu/url)
  for (const trPath of Object.keys(turkishToEnglishPaths)) {
    if (pathname.startsWith(trPath + '/')) {
      return true
    }
  }
  return false
}

// Dinamik route'ları işle (örn: /qr-olusturucu/url -> /qr-generator/url)
function translatePath(pathname: string): string {
  // Önce tam eşleşme kontrol et
  if (turkishToEnglishPaths[pathname]) {
    return turkishToEnglishPaths[pathname]
  }

  // Dinamik route'ları kontrol et
  for (const [trPath, enPath] of Object.entries(turkishToEnglishPaths)) {
    if (pathname.startsWith(trPath + '/')) {
      return pathname.replace(trPath, enPath)
    }
  }

  return pathname
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Statik dosyaları ve API route'larını atla
  // QR landing sayfaları (/app/, /r/, /v/) için sadece session güncelle ve pathname header ekle
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return await updateSession(request)
  }

  // QR landing sayfaları için session güncelle ve x-pathname header'ı ekle
  if (
    pathname.startsWith('/app/') ||
    pathname.startsWith('/r/') ||
    pathname.startsWith('/v/')
  ) {
    const response = await updateSession(request)
    response.headers.set('x-pathname', pathname)
    return response
  }

  // Türkçe URL ise ve dosya sisteminde karşılığı yoksa, yönlendir
  const translatedPath = translatePath(pathname)
  const urlIsTurkish = isTurkishUrl(pathname)

  // URL Türkçe ise dili Türkçe yap, değilse cookie'den veya varsayılandan al
  let locale: Locale
  if (urlIsTurkish) {
    locale = 'tr'
  } else {
    const localeCookie = request.cookies.get('NEXT_LOCALE')?.value as Locale | undefined
    locale = (localeCookie && locales.includes(localeCookie)) ? localeCookie : defaultLocale
  }

  if (translatedPath !== pathname) {
    // Türkçe URL'i İngilizce eşdeğerine internal rewrite yap
    // Bu sayede URL Türkçe kalır ama dosya sistemi İngilizce route'u kullanır
    const url = request.nextUrl.clone()
    url.pathname = translatedPath

    // x-pathname header'ı ekle (layout'ta admin kontrolü için)
    const response = NextResponse.rewrite(url)
    response.headers.set('x-pathname', pathname)
    // Türkçe URL'de dili Türkçe olarak ayarla
    response.cookies.set('NEXT_LOCALE', 'tr', { path: '/', maxAge: 60 * 60 * 24 * 365 })
    return response
  }

  // Session'ı güncelle ve kontrol et
  // x-pathname header'ı ekle
  const response = await updateSession(request)
  response.headers.set('x-pathname', pathname)
  return response
}

// Middleware'in çalışacağı route'lar
export const config = {
  matcher: [
    /*
     * Aşağıdaki path'ler hariç tüm request'lerde middleware çalışır:
     * - _next/static (statik dosyalar)
     * - _next/image (image optimization dosyaları)
     * - favicon.ico (favicon dosyası)
     * - Resim dosyaları (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

