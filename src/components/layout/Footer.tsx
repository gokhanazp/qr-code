// Footer bileşeni
// Site alt bilgi alanı

'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { QrCode } from 'lucide-react'
import { getLocalizedPathname } from '@/i18n/navigation'
import { Locale } from '@/i18n/config'

export default function Footer() {
  const t = useTranslations('footer')
  const common = useTranslations('common')
  const locale = useLocale() as Locale

  // Yerelleştirilmiş link yardımcı fonksiyonu (Localized link helper)
  const localizedHref = (path: string) => getLocalizedPathname(path, locale)

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Marka ve açıklama */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <QrCode className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-white">{common('appName')}</span>
            </Link>
            <p className="text-gray-400 max-w-md">{t('description')}</p>
          </div>

          {/* Ürün linkleri */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('product')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={localizedHref('/features')} className="hover:text-white transition-colors">
                  {common('features')}
                </Link>
              </li>
              <li>
                <Link href={localizedHref('/pricing')} className="hover:text-white transition-colors">
                  {common('pricing')}
                </Link>
              </li>
              <li>
                <Link href={localizedHref('/qr-generator')} className="hover:text-white transition-colors">
                  {t('qrGenerator')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Şirket ve yasal linkler */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('company')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={localizedHref('/about')} className="hover:text-white transition-colors">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href={localizedHref('/blog')} className="hover:text-white transition-colors">
                  {t('blog')}
                </Link>
              </li>
              <li>
                <Link href={localizedHref('/faq')} className="hover:text-white transition-colors">
                  {t('faq')}
                </Link>
              </li>
              <li>
                <Link href={localizedHref('/contact')} className="hover:text-white transition-colors">
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link href={localizedHref('/privacy')} className="hover:text-white transition-colors">
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link href={localizedHref('/terms')} className="hover:text-white transition-colors">
                  {t('terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Alt kısım - Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>{t('copyright')}</p>
        </div>
      </div>
    </footer>
  )
}

