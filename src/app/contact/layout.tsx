// Contact Layout - SEO metadata için
// Türkçe URL (/iletisim) geldiğinde Türkçe metadata gösterir

import { Metadata } from 'next'
import { headers } from 'next/headers'
import { getLocale } from 'next-intl/server'

// Site URL'si
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qr-code-gamma-neon.vercel.app'

// Türkçe URL'leri kontrol et
const turkishPaths = ['/iletisim']

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  
  // URL Türkçe mi kontrol et
  const isTurkishUrl = turkishPaths.some(p => pathname.startsWith(p))
  
  // URL'e göre dili belirle
  const locale = isTurkishUrl ? 'tr' : await getLocale()
  
  const title = locale === 'tr' ? 'İletişim' : 'Contact'
  const description = locale === 'tr' 
    ? 'Bizimle iletişime geçin. Sorularınız için email, telefon veya WhatsApp ile ulaşabilirsiniz.'
    : 'Contact us. Reach us via email, phone or WhatsApp for your questions.'

  return {
    title,
    description,
    alternates: {
      canonical: isTurkishUrl ? `${siteUrl}/iletisim` : `${siteUrl}/contact`,
      languages: {
        'en': `${siteUrl}/contact`,
        'tr': `${siteUrl}/iletisim`,
      }
    },
    openGraph: {
      title: locale === 'tr' ? 'İletişim | QR Kod Oluşturucu' : 'Contact | QR Code Generator',
      description,
      url: isTurkishUrl ? `${siteUrl}/iletisim` : `${siteUrl}/contact`,
      locale: locale === 'tr' ? 'tr_TR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: locale === 'tr' ? 'İletişim | QR Kod Oluşturucu' : 'Contact | QR Code Generator',
      description,
    }
  }
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

