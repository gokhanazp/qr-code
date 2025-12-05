// Features Layout - SEO metadata için
// Türkçe URL (/ozellikler) geldiğinde Türkçe metadata gösterir

import { Metadata } from 'next'
import { headers } from 'next/headers'
import { getLocale, getTranslations } from 'next-intl/server'

// Site URL'si
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qrcodeshine.com'

// Türkçe URL'leri kontrol et
const turkishPaths = ['/ozellikler']

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  
  // URL Türkçe mi kontrol et
  const isTurkishUrl = turkishPaths.some(p => pathname.startsWith(p))
  
  // URL'e göre dili belirle (Türkçe URL = Türkçe metadata)
  const locale = isTurkishUrl ? 'tr' : await getLocale()
  const t = await getTranslations({ locale, namespace: 'seo' })
  
  const title = locale === 'tr' ? 'Özellikler' : 'Features'
  const description = locale === 'tr' 
    ? 'QR kod oluşturucu özelliklerimizi keşfedin. Logo ekleme, analitik, dinamik QR kodları ve daha fazlası.'
    : 'Discover our QR code generator features. Logo upload, analytics, dynamic QR codes and more.'

  return {
    title,
    description,
    alternates: {
      canonical: isTurkishUrl ? `${siteUrl}/ozellikler` : `${siteUrl}/features`,
      languages: {
        'en': `${siteUrl}/features`,
        'tr': `${siteUrl}/ozellikler`,
      }
    },
    openGraph: {
      title: locale === 'tr' ? 'Özellikler | QR Code Shine' : 'Features | QR Code Shine',
      description,
      url: isTurkishUrl ? `${siteUrl}/ozellikler` : `${siteUrl}/features`,
      locale: locale === 'tr' ? 'tr_TR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: locale === 'tr' ? 'Özellikler | QR Code Shine' : 'Features | QR Code Shine',
      description,
    }
  }
}

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

