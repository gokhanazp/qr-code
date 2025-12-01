// FAQ Sayfası - Sıkça Sorulan Sorular
// SEO optimized, JSON-LD structured data içerir
import { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'
import FAQ from '@/components/FAQ'
import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'

// SEO Meta Tags
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('faq')
  const locale = await getLocale()
  
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    keywords: locale === 'tr' 
      ? 'qr kod sss, qr kod sıkça sorulan sorular, qr kod yardım, qr kod nasıl oluşturulur'
      : 'qr code faq, qr code frequently asked questions, qr code help, how to create qr code',
    alternates: {
      canonical: '/faq',
      languages: {
        'tr': '/tr/faq',
        'en': '/en/faq',
      },
    },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      type: 'website',
    },
  }
}

export default async function FAQPage() {
  const t = await getTranslations('faq')
  const locale = await getLocale()

  // JSON-LD Structured Data - SEO için önemli
  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': t('q1'),
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': t('a1'),
        },
      },
      {
        '@type': 'Question',
        'name': t('q2'),
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': t('a2'),
        },
      },
      {
        '@type': 'Question',
        'name': t('q3'),
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': t('a3'),
        },
      },
      {
        '@type': 'Question',
        'name': t('q4'),
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': t('a4'),
        },
      },
      {
        '@type': 'Question',
        'name': t('q5'),
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': t('a5'),
        },
      },
      {
        '@type': 'Question',
        'name': t('q6'),
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': t('a6'),
        },
      },
      {
        '@type': 'Question',
        'name': t('q7'),
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': t('a7'),
        },
      },
      {
        '@type': 'Question',
        'name': t('q8'),
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': t('a8'),
        },
      },
      {
        '@type': 'Question',
        'name': t('q9'),
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': t('a9'),
        },
      },
      {
        '@type': 'Question',
        'name': t('q10'),
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': t('a10'),
        },
      },
    ],
  }

  return (
    <>
      {/* JSON-LD Script - SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('pageTitle')}
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              {t('pageSubtitle')}
            </p>
          </div>
        </section>

        {/* FAQ Bileşeni */}
        <FAQ showTitle={false} />

        {/* İletişim CTA */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t('stillHaveQuestions')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('contactUsDesc')}
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                {t('contactUs')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

