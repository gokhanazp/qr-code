// next-intl request yapılandırması
// Sunucu tarafında dil algılama
// URL Türkçe ise Türkçe, değilse cookie veya varsayılan

import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import { locales, defaultLocale, Locale } from './config'

// Türkçe URL'leri kontrol et (Check Turkish URLs)
const turkishUrlPrefixes = [
  '/ozellikler', '/fiyatlandirma', '/iletisim', '/hakkimizda',
  '/gizlilik', '/kullanim-kosullari', '/qr-olusturucu',
  '/panel', '/ayarlar', '/giris', '/kayit'
]

function getLocaleFromUrl(pathname: string): Locale | null {
  for (const prefix of turkishUrlPrefixes) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      return 'tr'
    }
  }
  return null
}

export default getRequestConfig(async () => {
  // URL'den pathname al
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  // URL'den dili kontrol et (Türkçe URL = Türkçe içerik)
  const urlLocale = getLocaleFromUrl(pathname)

  // Cookie'den dili kontrol et
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Locale | undefined
  const cookieLocale = (localeCookie && locales.includes(localeCookie)) ? localeCookie : null

  // Öncelik: URL > Cookie > Varsayılan
  const locale = urlLocale || cookieLocale || defaultLocale

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})

