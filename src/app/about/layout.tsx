// About Layout - SEO metadata için
// Türkçe URL (/hakkimizda) geldiğinde Türkçe metadata gösterir

import { Metadata } from 'next'
import { headers } from 'next/headers'
import { getLocale } from 'next-intl/server'

// Site URL'si
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qr-code-gamma-neon.vercel.app'

// Türkçe URL'leri kontrol et
const turkishPaths = ['/hakkimizda']

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  
  // URL Türkçe mi kontrol et
  const isTurkishUrl = turkishPaths.some(p => pathname.startsWith(p))
  
  // URL'e göre dili belirle
  const locale = isTurkishUrl ? 'tr' : await getLocale()
  
  const title = locale === 'tr' ? 'Hakkımızda' : 'About Us'
  const description = locale === 'tr' 
    ? 'QR Kod Oluşturucu hakkında bilgi edinin. Misyonumuz ve vizyonumuz.'
    : 'Learn about QR Code Generator. Our mission and vision.'

  return {
    title,
    description,
    alternates: {
      canonical: isTurkishUrl ? `${siteUrl}/hakkimizda` : `${siteUrl}/about`,
      languages: {
        'en': `${siteUrl}/about`,
        'tr': `${siteUrl}/hakkimizda`,
      }
    },
    openGraph: {
      title: locale === 'tr' ? 'Hakkımızda | QR Kod Oluşturucu' : 'About Us | QR Code Generator',
      description,
      url: isTurkishUrl ? `${siteUrl}/hakkimizda` : `${siteUrl}/about`,
      locale: locale === 'tr' ? 'tr_TR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: locale === 'tr' ? 'Hakkımızda | QR Kod Oluşturucu' : 'About Us | QR Code Generator',
      description,
    }
  }
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

