// i18n yapılandırması
// Çoklu dil desteği için ayarlar

export const locales = ['en', 'tr'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

// Dil isimleri
export const localeNames: Record<Locale, string> = {
  en: 'English',
  tr: 'Türkçe',
}

// Dil bayrakları (emoji)
export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  tr: '🇹🇷',
}

