// Next.js Middleware - Session kontrolü ve URL yerelleştirme
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { locales, defaultLocale, pathnames, Locale } from '@/i18n/config'

// Blog slug çevirileri (TR -> EN ve EN -> TR)
const blogSlugMap: Record<string, { tr: string; en: string }> = {
  'url-qr-kod-nasil-olusturulur': { tr: 'url-qr-kod-nasil-olusturulur', en: 'how-to-create-url-qr-code' },
  'how-to-create-url-qr-code': { tr: 'url-qr-kod-nasil-olusturulur', en: 'how-to-create-url-qr-code' },
  'wifi-qr-kod-olusturma': { tr: 'wifi-qr-kod-olusturma', en: 'wifi-qr-code-generator' },
  'wifi-qr-code-generator': { tr: 'wifi-qr-kod-olusturma', en: 'wifi-qr-code-generator' },
  'vcard-qr-kod-dijital-kartvizit': { tr: 'vcard-qr-kod-dijital-kartvizit', en: 'vcard-qr-code-digital-business-card' },
  'vcard-qr-code-digital-business-card': { tr: 'vcard-qr-kod-dijital-kartvizit', en: 'vcard-qr-code-digital-business-card' },
  'whatsapp-qr-kod-isletmeler-icin': { tr: 'whatsapp-qr-kod-isletmeler-icin', en: 'whatsapp-qr-code-for-business' },
  'whatsapp-qr-code-for-business': { tr: 'whatsapp-qr-kod-isletmeler-icin', en: 'whatsapp-qr-code-for-business' },
  'instagram-qr-kod-takipci-kazanma': { tr: 'instagram-qr-kod-takipci-kazanma', en: 'instagram-qr-code-gain-followers' },
  'instagram-qr-code-gain-followers': { tr: 'instagram-qr-kod-takipci-kazanma', en: 'instagram-qr-code-gain-followers' },
  'etkinlik-qr-kod-event-yonetimi': { tr: 'etkinlik-qr-kod-event-yonetimi', en: 'event-qr-code-calendar-integration' },
  'event-qr-code-calendar-integration': { tr: 'etkinlik-qr-kod-event-yonetimi', en: 'event-qr-code-calendar-integration' },
  'konum-qr-kod-google-maps': { tr: 'konum-qr-kod-google-maps', en: 'location-qr-code-google-maps' },
  'location-qr-code-google-maps': { tr: 'konum-qr-kod-google-maps', en: 'location-qr-code-google-maps' },
}

// QR tipi slug çevirileri (TR -> EN)
// Türkçe slug girilirse İngilizce eşdeğerine çevirir
const qrTypeSlugMap: Record<string, string> = {
  'arac-park': 'parking',
  // Gelecekte diğer Türkçe sluglar buraya eklenebilir
  // 'web-sitesi': 'url',
  // 'wifi-ag': 'wifi',
}

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
// QR tipi slug'larını da çevirir (örn: /qr-olusturucu/arac-park -> /qr-generator/parking)
function translatePath(pathname: string): string {
  // Önce tam eşleşme kontrol et
  if (turkishToEnglishPaths[pathname]) {
    return turkishToEnglishPaths[pathname]
  }

  // Dinamik route'ları kontrol et
  for (const [trPath, enPath] of Object.entries(turkishToEnglishPaths)) {
    if (pathname.startsWith(trPath + '/')) {
      let translatedPath = pathname.replace(trPath, enPath)

      // QR generator için slug çevirisi yap
      if (enPath === '/qr-generator') {
        const slug = translatedPath.replace('/qr-generator/', '')
        if (qrTypeSlugMap[slug]) {
          translatedPath = `/qr-generator/${qrTypeSlugMap[slug]}`
        }
      }

      return translatedPath
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
    pathname.startsWith('/v/') ||
    pathname.startsWith('/menu/')
  ) {
    const response = await updateSession(request)
    response.headers.set('x-pathname', pathname)
    return response
  }

  // Blog detay sayfası - dil değiştiğinde doğru slug'a yönlendir
  if (pathname.startsWith('/blog/')) {
    const slug = pathname.replace('/blog/', '')
    const slugMapping = blogSlugMap[slug]

    if (slugMapping) {
      const localeCookie = request.cookies.get('NEXT_LOCALE')?.value as Locale | undefined
      const cookieLocale = (localeCookie && locales.includes(localeCookie)) ? localeCookie : defaultLocale
      const targetSlug = cookieLocale === 'tr' ? slugMapping.tr : slugMapping.en

      // Mevcut slug, hedef slug'dan farklıysa redirect yap
      if (slug !== targetSlug) {
        const url = request.nextUrl.clone()
        url.pathname = `/blog/${targetSlug}`
        return NextResponse.redirect(url)
      }
    }

    // Redirect gerekmiyorsa normal işleme devam et
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
    // x-url-locale header'ı ekle (URL'den algılanan dil)
    const response = NextResponse.rewrite(url)
    response.headers.set('x-pathname', pathname)
    response.headers.set('x-url-locale', 'tr') // URL Türkçe olduğunu belirt
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

