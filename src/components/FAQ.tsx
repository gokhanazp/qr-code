// FAQ Bileşeni - Accordion yapısında SSS
// SEO uyumlu, çok dilli, erişilebilir tasarım
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, HelpCircle } from 'lucide-react'

// FAQ item type tanımı
interface FAQItem {
  question: string
  answer: string
}

interface FAQProps {
  // Anasayfada compact görünüm için limit (opsiyonel)
  limit?: number
  // Başlık gösterilsin mi? (opsiyonel, default: true)
  showTitle?: boolean
}

export default function FAQ({ limit, showTitle = true }: FAQProps) {
  const t = useTranslations('faq')
  // Açık olan sorunun indeksi (-1 = hiçbiri açık değil)
  const [openIndex, setOpenIndex] = useState<number>(-1)

  // FAQ verileri - çeviriden alınıyor
  const faqItems: FAQItem[] = [
    { question: t('q1'), answer: t('a1') },
    { question: t('q2'), answer: t('a2') },
    { question: t('q3'), answer: t('a3') },
    { question: t('q4'), answer: t('a4') },
    { question: t('q5'), answer: t('a5') },
    { question: t('q6'), answer: t('a6') },
    { question: t('q7'), answer: t('a7') },
    { question: t('q8'), answer: t('a8') },
    { question: t('q9'), answer: t('a9') },
    { question: t('q10'), answer: t('a10') },
  ]

  // Limit varsa sadece o kadar göster
  const displayItems = limit ? faqItems.slice(0, limit) : faqItems

  // Accordion toggle fonksiyonu
  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index)
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        {showTitle && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-sm mb-4">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700 font-medium">{t('badge')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
        )}

        {/* FAQ Accordion listesi */}
        <div className="space-y-4">
          {displayItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Soru butonu */}
              <button
                onClick={() => toggleItem(index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="text-lg font-semibold text-gray-900 pr-4">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Cevap alanı - animasyonlu açılma/kapanma */}
              <div
                id={`faq-answer-${index}`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Daha fazla soru linki (limit varsa göster) */}
        {limit && faqItems.length > limit && (
          <div className="text-center mt-8">
            <a
              href="/faq"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              {t('viewAll')}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}

