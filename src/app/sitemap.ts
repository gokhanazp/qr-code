// Sitemap Generator - SEO için dinamik sitemap
// Google, Bing ve diğer arama motorları için optimize edilmiş
// Production domain: qrcodeshine.com
// Hem Türkçe hem İngilizce URL'ler dahil

import { MetadataRoute } from 'next'
import { blogPosts } from '@/lib/blog-data'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qrcodeshine.com'

// QR kod tipleri - her biri için ayrı sayfa (HTML ve Parking dahil)
// TR slug'ı farklı olanlar için { en, tr } şeklinde tanımlanır
const qrTypes: Array<string | { en: string; tr: string }> = [
  'url', 'vcard', 'wifi', 'email', 'phone', 'sms', 'whatsapp',
  'text', 'instagram', 'twitter', 'linkedin', 'youtube', 'facebook',
  'event', 'location', 'bitcoin', 'app', 'html',
  { en: 'parking', tr: 'arac-park' }
]

// Statik sayfalar - EN ve TR URL'leri
const staticPages = [
  { en: '', tr: '', priority: 1.0, changeFreq: 'daily' as const },
  { en: '/features', tr: '/ozellikler', priority: 0.9, changeFreq: 'weekly' as const },
  { en: '/pricing', tr: '/fiyatlandirma', priority: 0.9, changeFreq: 'weekly' as const },
  { en: '/contact', tr: '/iletisim', priority: 0.7, changeFreq: 'monthly' as const },
  { en: '/about', tr: '/hakkimizda', priority: 0.7, changeFreq: 'monthly' as const },
  { en: '/faq', tr: '/faq', priority: 0.8, changeFreq: 'weekly' as const },
  { en: '/blog', tr: '/blog', priority: 0.9, changeFreq: 'daily' as const },
  { en: '/privacy', tr: '/gizlilik', priority: 0.3, changeFreq: 'yearly' as const },
  { en: '/terms', tr: '/kullanim-kosullari', priority: 0.3, changeFreq: 'yearly' as const },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date()
  const pages: MetadataRoute.Sitemap = []

  // === STATIK SAYFALAR (TR + EN) ===
  staticPages.forEach(({ en, tr, priority, changeFreq }) => {
    // İngilizce sayfa
    pages.push({
      url: `${baseUrl}${en}`,
      lastModified: currentDate,
      changeFrequency: changeFreq,
      priority,
    })
    // Türkçe sayfa (farklı URL ise)
    if (tr !== en) {
      pages.push({
        url: `${baseUrl}${tr}`,
        lastModified: currentDate,
        changeFrequency: changeFreq,
        priority,
      })
    }
  })

  // === QR GENERATOR SAYFALARI (TR + EN) ===
  qrTypes.forEach((type) => {
    // String ise EN ve TR aynı slug kullanır
    // Object ise { en, tr } farklı slug'lar kullanır
    const enSlug = typeof type === 'string' ? type : type.en
    const trSlug = typeof type === 'string' ? type : type.tr

    // İngilizce: /qr-generator/url veya /qr-generator/parking
    pages.push({
      url: `${baseUrl}/qr-generator/${enSlug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    })
    // Türkçe: /qr-olusturucu/url veya /qr-olusturucu/arac-park
    pages.push({
      url: `${baseUrl}/qr-olusturucu/${trSlug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    })
  })

  // === BLOG YAZILARI (TR + EN slug'lar) ===
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

