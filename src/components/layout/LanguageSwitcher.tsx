// Dil Değiştirici bileşeni
// Çoklu dil desteği için dil seçimi

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Globe } from 'lucide-react'
import { locales, localeNames, localeFlags, Locale } from '@/i18n/config'

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLocale, setCurrentLocale] = useState<Locale>('en')
  const router = useRouter()

  // Mevcut dili cookie'den oku (client-side, useEffect içinde)
  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('NEXT_LOCALE='))
    const locale = (cookie?.split('=')[1] as Locale) || 'en'
    setCurrentLocale(locale)
  }, [])

  // Dil değiştir
  const changeLocale = (locale: Locale) => {
    // Cookie'ye kaydet (1 yıl geçerli)
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=${60 * 60 * 24 * 365}`
    setIsOpen(false)
    // Hard navigation ile sayfayı tamamen yenile (cache'i bypass et)
    window.location.href = window.location.pathname
  }

  return (
    <div className="relative">
      {/* Dil seçici butonu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm">{localeFlags[currentLocale]}</span>
      </button>

      {/* Dropdown menü */}
      {isOpen && (
        <>
          {/* Arka plan overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menü içeriği */}
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => changeLocale(locale)}
                className={`
                  flex items-center gap-3 w-full px-4 py-2 text-left text-sm
                  hover:bg-gray-100 transition-colors
                  ${currentLocale === locale ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                `}
              >
                <span>{localeFlags[locale]}</span>
                <span>{localeNames[locale]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

