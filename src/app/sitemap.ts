// Sitemap Generator - SEO için dinamik sitemap
// Türkiye ve dünya için optimize edilmiş

import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://qrcodegenerator.com'

// QR kod tipleri - her biri için ayrı sayfa
const qrTypes = [
  'url', 'vcard', 'wifi', 'email', 'phone', 'sms', 'whatsapp',
  'text', 'instagram', 'twitter', 'linkedin', 'youtube', 'facebook',
  'event', 'location', 'bitcoin', 'app'
]

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date()

  // Statik sayfalar - öncelik ve güncelleme sıklığı ile
  const staticPages = [
    { path: '', priority: 1.0, changeFreq: 'daily' as const },
    { path: '/pricing', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/features', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/about', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/contact', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/faq', priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/blog', priority: 0.8, changeFreq: 'daily' as const },
    { path: '/privacy', priority: 0.3, changeFreq: 'yearly' as const },
    { path: '/terms', priority: 0.3, changeFreq: 'yearly' as const },
    { path: '/auth/login', priority: 0.5, changeFreq: 'monthly' as const },
    { path: '/auth/register', priority: 0.5, changeFreq: 'monthly' as const },
  ]

  const pages: MetadataRoute.Sitemap = []

  // Ana sayfalar
  staticPages.forEach(({ path, priority, changeFreq }) => {
    pages.push({
      url: `${baseUrl}${path}`,
      lastModified: currentDate,
      changeFrequency: changeFreq,
      priority,
      alternates: {
        languages: {
          'tr-TR': `${baseUrl}${path}`,
          'en-US': `${baseUrl}/en${path}`,
          'x-default': `${baseUrl}${path}`,
        },
      },
    })
  })

  // QR Generator sayfaları - her tip için ayrı sayfa
  qrTypes.forEach((type) => {
    pages.push({
      url: `${baseUrl}/qr-generator/${type}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
      alternates: {
        languages: {
          'tr-TR': `${baseUrl}/qr-generator/${type}`,
          'en-US': `${baseUrl}/en/qr-generator/${type}`,
          'x-default': `${baseUrl}/qr-generator/${type}`,
        },
      },
    })
  })

  return pages
}

