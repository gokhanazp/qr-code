// Sitemap Generator
// SEO için dinamik sitemap oluşturur

import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://qrcodegenerator.com'

export default function sitemap(): MetadataRoute.Sitemap {
  // Statik sayfalar
  const staticPages = [
    '',
    '/pricing',
    '/features',
    '/auth/login',
    '/auth/register',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
  ]

  // Dil varyasyonları
  const locales = ['en', 'tr']

  // Tüm sayfaları oluştur
  const pages: MetadataRoute.Sitemap = []

  staticPages.forEach((page) => {
    // Ana dil (İngilizce)
    pages.push({
      url: `${baseUrl}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' ? 'daily' : 'weekly',
      priority: page === '' ? 1 : 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}${page}`,
          tr: `${baseUrl}/tr${page}`,
        },
      },
    })
  })

  return pages
}

