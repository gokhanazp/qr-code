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

// URL yerelleştirme - Dile göre URL'ler (Localized pathnames)
// İngilizce URL'ler varsayılan, Türkçe URL'ler özel tanımlı
export const pathnames = {
  '/': '/',
  '/features': {
    en: '/features',
    tr: '/ozellikler'
  },
  '/pricing': {
    en: '/pricing',
    tr: '/fiyatlandirma'
  },
  '/contact': {
    en: '/contact',
    tr: '/iletisim'
  },
  '/about': {
    en: '/about',
    tr: '/hakkimizda'
  },
  '/blog': {
    en: '/blog',
    tr: '/blog'
  },
  '/privacy': {
    en: '/privacy',
    tr: '/gizlilik'
  },
  '/terms': {
    en: '/terms',
    tr: '/kullanim-kosullari'
  },
  '/qr-generator': {
    en: '/qr-generator',
    tr: '/qr-olusturucu'
  },
  '/qr-generator/[type]': {
    en: '/qr-generator/[type]',
    tr: '/qr-olusturucu/[type]'
  },
  '/dashboard': {
    en: '/dashboard',
    tr: '/panel'
  },
  '/dashboard/qr': {
    en: '/dashboard/qr',
    tr: '/panel/qr'
  },
  '/dashboard/qr/[id]': {
    en: '/dashboard/qr/[id]',
    tr: '/panel/qr/[id]'
  },
  '/dashboard/analytics': {
    en: '/dashboard/analytics',
    tr: '/panel/analitik'
  },
  '/dashboard/subscription': {
    en: '/dashboard/subscription',
    tr: '/panel/abonelik'
  },
  '/settings': {
    en: '/settings',
    tr: '/ayarlar'
  },
  '/auth/login': {
    en: '/auth/login',
    tr: '/giris'
  },
  '/auth/register': {
    en: '/auth/register',
    tr: '/kayit'
  }
} as const

// Pathname tipini dışa aktar
export type AppPathnames = keyof typeof pathnames

