// Sitemap Generator - SEO için dinamik sitemap
// Google, Bing ve diğer arama motorları için optimize edilmiş
// Production domain: qrcodeshine.com

import { MetadataRoute } from 'next'
import { blogPosts } from '@/lib/blog-data'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qrcodeshine.com'

// QR kod tipleri - her biri için ayrı sayfa (HTML dahil)
const qrTypes = [
  'url', 'vcard', 'wifi', 'email', 'phone', 'sms', 'whatsapp',
  'text', 'instagram', 'twitter', 'linkedin', 'youtube', 'facebook',
  'event', 'location', 'bitcoin', 'app', 'html'
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
    { path: '/blog', priority: 0.9, changeFreq: 'daily' as const },
    { path: '/privacy', priority: 0.3, changeFreq: 'yearly' as const },
    { path: '/terms', priority: 0.3, changeFreq: 'yearly' as const },
  ]

  const pages: MetadataRoute.Sitemap = []

  // Ana sayfalar
  staticPages.forEach(({ path, priority, changeFreq }) => {
    pages.push({
      url: `${baseUrl}${path}`,
      lastModified: currentDate,
      changeFrequency: changeFreq,
      priority,
    })
  })

  // QR Generator sayfaları - her tip için ayrı sayfa
  qrTypes.forEach((type) => {
    pages.push({
      url: `${baseUrl}/qr-generator/${type}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    })
  })

  // Blog yazıları - Türkçe ve İngilizce slug'lar
  blogPosts.forEach((post) => {
    // Türkçe blog sayfası
    pages.push({
      url: `${baseUrl}/blog/${post.slug.tr}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly',
      priority: 0.8,
    })
    // İngilizce blog sayfası
    pages.push({
      url: `${baseUrl}/blog/${post.slug.en}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly',
      priority: 0.8,
    })
  })

  return pages
}

