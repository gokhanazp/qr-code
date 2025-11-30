// next-intl request yapılandırması
// Sunucu tarafında dil algılama
// Varsayılan: İngilizce, sadece cookie ile değiştirilebilir

import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { locales, defaultLocale, Locale } from './config'

export default getRequestConfig(async () => {
  // Sadece cookie'den dili kontrol et (manuel seçim)
  // Tarayıcı diline bakmıyoruz - varsayılan her zaman İngilizce
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Locale | undefined

  // Sadece geçerli bir cookie varsa o dili kullan, yoksa İngilizce
  const locale = (localeCookie && locales.includes(localeCookie))
    ? localeCookie
    : defaultLocale

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})

