// Pricing Layout - SEO metadata için
// Türkçe URL (/fiyatlandirma) geldiğinde Türkçe metadata gösterir

import { Metadata } from 'next'
import { headers } from 'next/headers'
import { getLocale } from 'next-intl/server'

// Site URL'si
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qrcodeshine.com'

// Türkçe URL'leri kontrol et
const turkishPaths = ['/fiyatlandirma']

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  
  // URL Türkçe mi kontrol et
  const isTurkishUrl = turkishPaths.some(p => pathname.startsWith(p))
  
  // URL'e göre dili belirle
  const locale = isTurkishUrl ? 'tr' : await getLocale()
  
  const title = locale === 'tr' ? 'Fiyatlandırma' : 'Pricing'
  const description = locale === 'tr' 
    ? 'QR kod oluşturucu fiyatlarımızı inceleyin. Ücretsiz, Pro ve Enterprise planlarımız mevcut.'
    : 'Check our QR code generator pricing. Free, Pro and Enterprise plans available.'

  return {
    title,
    description,
    alternates: {
      canonical: isTurkishUrl ? `${siteUrl}/fiyatlandirma` : `${siteUrl}/pricing`,
      languages: {
        'en': `${siteUrl}/pricing`,
        'tr': `${siteUrl}/fiyatlandirma`,
      }
    },
    openGraph: {
      title: locale === 'tr' ? 'Fiyatlandırma | QR Code Shine' : 'Pricing | QR Code Shine',
      description,
      url: isTurkishUrl ? `${siteUrl}/fiyatlandirma` : `${siteUrl}/pricing`,
      locale: locale === 'tr' ? 'tr_TR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: locale === 'tr' ? 'Fiyatlandırma | QR Code Shine' : 'Pricing | QR Code Shine',
      description,
    }
  }
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

