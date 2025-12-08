// Robots.txt Generator - SEO için arama motoru botları kuralları
// robots.txt dosyası arama motorlarının siteyi nasıl tarayacağını belirler

import { MetadataRoute } from 'next'

// Production domain: qrcodeshine.com
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qrcodeshine.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Tüm botlar için genel kurallar
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // API route'ları indeksleme
          '/admin/',         // Admin paneli gizle
          '/dashboard/',     // Kullanıcı paneli gizle
          '/auth/',          // Auth sayfaları gizle
          '/settings/',      // Ayarlar sayfası gizle
          '/_next/',         // Next.js internal dosyaları
          '/private/',       // Özel sayfalar
          '/checkout/',      // Ödeme sayfaları
          '/app/',           // QR landing sayfaları (dinamik)
          '/r/',             // Redirect sayfaları
          '/v/',             // Viewer sayfaları
          '/html/',          // HTML viewer sayfaları
        ],
      },
      {
        // Google bot için özel kurallar
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/blog/',
          '/qr-generator/',
          '/features',
          '/pricing',
          '/faq',
          '/contact',
          '/about',
        ],
        disallow: ['/api/', '/admin/', '/dashboard/', '/auth/', '/settings/'],
      },
      {
        // Bing bot için kurallar
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/', '/auth/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}

