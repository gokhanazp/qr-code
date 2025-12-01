// Dil Değiştirici Client Component
// Admin panelde site dili değiştirmek için

'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Globe, Check, Loader2 } from 'lucide-react'

interface LanguageSelectorProps {
  currentLocale: string
}

const languages = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
]

export default function LanguageSelector({ currentLocale }: LanguageSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [selectedLocale, setSelectedLocale] = useState(currentLocale || 'tr')

  // Dil değiştirme işlevi (Language change function)
  const handleLanguageChange = (newLocale: string) => {
    setSelectedLocale(newLocale)
    
    // Cookie'ye kaydet (Save to cookie)
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`
    
    // Mevcut path'i yeni locale ile oluştur (Build new path with locale)
    startTransition(() => {
      // Sayfa yenile (Refresh page)
      router.refresh()
      // Ana sayfaya yönlendir (Redirect to home)
      window.location.href = `/${newLocale}`
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Globe className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Dil Ayarları</h2>
          <p className="text-sm text-gray-500">Site dilini değiştir</p>
        </div>
      </div>

      <div className="space-y-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            disabled={isPending}
            className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
              selectedLocale === lang.code
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{lang.flag}</span>
              <div className="text-left">
                <p className="font-medium text-gray-900">{lang.name}</p>
                <p className="text-sm text-gray-500">
                  {lang.code === 'tr' ? 'Tüm içerik Türkçe görünür' : 'All content appears in English'}
                </p>
              </div>
            </div>
            
            {isPending && selectedLocale === lang.code ? (
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
            ) : selectedLocale === lang.code ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-indigo-600 font-medium">Aktif</span>
                <Check className="w-5 h-5 text-indigo-600" />
              </div>
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Not:</strong> Dil değişikliği tüm site için geçerli olacaktır. 
          Değişiklik anında uygulanır ve tarayıcınızda bir yıl boyunca hatırlanır.
        </p>
      </div>
    </div>
  )
}

