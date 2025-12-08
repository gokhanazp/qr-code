// Blog detay sayfası - SEO optimized blog post page
import { blogPosts } from '@/lib/blog-data'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, ArrowRight, QrCode } from 'lucide-react'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Dinamik SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts.find(p => p.slug === slug)
  
  if (!post) {
    return { title: 'Blog Yazısı Bulunamadı' }
  }

  return {
    title: `${post.title.tr} | QR Code Shine Blog`,
    description: post.excerpt.tr,
    keywords: [...post.keywords.tr, ...post.keywords.en],
    openGraph: {
      title: post.title.tr,
      description: post.excerpt.tr,
      type: 'article',
      publishedTime: post.date,
    },
    alternates: {
      languages: {
        'tr': `/blog/${slug}`,
        'en': `/en/blog/${slug}`,
      }
    }
  }
}

// Static paths oluştur (Static generation)
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const locale = await getLocale()
  const isEnglish = locale === 'en'
  
  const post = blogPosts.find(p => p.slug === slug)
  
  if (!post) {
    notFound()
  }

  // İlgili yazıları bul (Related posts)
  const relatedPosts = blogPosts
    .filter(p => p.slug !== slug && p.category === post.category)
    .slice(0, 3)

  const title = isEnglish ? post.title.en : post.title.tr
  const content = isEnglish ? post.content.en : post.content.tr
  const excerpt = isEnglish ? post.excerpt.en : post.excerpt.tr

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/blog" 
            className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isEnglish ? 'Back to Blog' : 'Blog\'a Dön'}
          </Link>
          <span className="inline-block px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full mb-4">
            {post.category}
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {title}
          </h1>
          <p className="text-xl text-blue-100 mb-6">{excerpt}</p>
          <div className="flex items-center gap-6 text-blue-200">
            <span className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {new Date(post.date).toLocaleDateString(isEnglish ? 'en-US' : 'tr-TR', { 
                year: 'numeric',
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {post.readTime}
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
            {/* Markdown içeriği render et */}
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded"
              dangerouslySetInnerHTML={{ 
                __html: content
                  .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-8 mb-4">$1</h3>')
                  .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-10 mb-4">$1</h2>')
                  .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-6">$1</h1>')
                  .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                  .replace(/\*(.*)\*/gim, '<em>$1</em>')
                  .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
                  .replace(/^✅ (.*$)/gim, '<p class="flex items-start gap-2"><span class="text-green-500">✅</span> $1</p>')
                  .replace(/^⚠️ (.*$)/gim, '<p class="flex items-start gap-2"><span>⚠️</span> $1</p>')
                  .replace(/^💡 (.*$)/gim, '<p class="flex items-start gap-2"><span>💡</span> $1</p>')
                  .replace(/^📌 (.*$)/gim, '<p class="flex items-start gap-2"><span>📌</span> $1</p>')
                  .replace(/^✨ (.*$)/gim, '<p class="flex items-start gap-2"><span>✨</span> $1</p>')
                  .replace(/\n\n/g, '</p><p class="mb-4">')
                  .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>')
              }}
            />
            
            {/* QR Kod Oluştur CTA */}
            {post.qrType && (
              <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-xl">
                    <QrCode className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {isEnglish ? 'Ready to create your QR code?' : 'QR kodunuzu oluşturmaya hazır mısınız?'}
                    </h3>
                    <p className="text-gray-600">
                      {isEnglish 
                        ? 'Create your QR code for free now'
                        : 'Şimdi ücretsiz QR kodunuzu oluşturun'}
                    </p>
                  </div>
                  <Link
                    href={`/qr-generator/${post.qrType}`}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    {isEnglish ? 'Create' : 'Oluştur'}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </article>
        </div>
      </section>
    </div>
  )
}

