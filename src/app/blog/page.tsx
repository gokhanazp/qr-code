// Blog sayfası - Blog yazıları listesi
// Blog page - Blog posts list
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { blogPosts } from '@/lib/blog-data'
import { getLocale } from 'next-intl/server'
import type { Metadata } from 'next'

// SEO Metadata
export const metadata: Metadata = {
  title: 'QR Kod Blog - Rehberler ve İpuçları | QR Code Shine',
  description: 'QR kod oluşturma, kullanım alanları ve en iyi uygulamalar hakkında kapsamlı rehberler. WiFi, vCard, WhatsApp, Instagram QR kod rehberleri.',
  keywords: ['qr kod blog', 'qr code rehber', 'qr kod nasıl yapılır', 'qr kod kullanımı'],
  openGraph: {
    title: 'QR Kod Blog - Rehberler ve İpuçları',
    description: 'QR kod oluşturma ve kullanım rehberleri',
    type: 'website',
  }
}

// QR tipi emojileri
const qrTypeEmojis: Record<string, string> = {
  url: '🔗',
  wifi: '📶',
  vcard: '👤',
  whatsapp: '💬',
  instagram: '📸',
  event: '📅',
  location: '📍',
  email: '📧',
  phone: '📞',
  sms: '💬',
  text: '📝',
  bitcoin: '₿',
  pdf: '📄',
  image: '🖼️',
  html: '🌐',
}

export default async function BlogPage() {
  const locale = await getLocale()
  const isEnglish = locale === 'en'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {isEnglish ? 'QR Code Blog' : 'QR Kod Blog'}
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            {isEnglish
              ? 'Guides, tutorials and tips about QR codes'
              : 'QR kodlar hakkında rehberler, öğreticiler ve ipuçları'}
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.slug}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
              >
                {/* QR tipi emoji görseli */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <span className="text-7xl">
                    {post.qrType ? qrTypeEmojis[post.qrType] || '📱' : '📱'}
                  </span>
                </div>
                <div className="p-6">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full mb-3">
                    {post.category}
                  </span>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {isEnglish ? post.title.en : post.title.tr}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {isEnglish ? post.excerpt.en : post.excerpt.tr}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.date).toLocaleDateString(isEnglish ? 'en-US' : 'tr-TR', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </span>
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      {isEnglish ? 'Read' : 'Oku'} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - QR Kod Oluştur */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {isEnglish ? 'Ready to Create Your QR Code?' : 'QR Kodunuzu Oluşturmaya Hazır mısınız?'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isEnglish
              ? 'Create professional QR codes for free in seconds'
              : 'Saniyeler içinde ücretsiz profesyonel QR kodlar oluşturun'}
          </p>
          <Link
            href="/qr-generator/url"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isEnglish ? 'Create QR Code' : 'QR Kod Oluştur'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  )
}

