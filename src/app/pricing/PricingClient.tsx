// Fiyatlandırma Client Component
// Aylık/Yıllık toggle için client-side state gerekiyor

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, X, MessageCircle } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { trackWhatsAppClick } from '@/components/analytics/GoogleAnalytics'

// Fiyatlandırma planı tipi
interface PricingPlan {
  id: string
  name: string
  name_tr: string
  price_monthly: number
  price_yearly: number
  currency: string
  max_qr_codes: number
  qr_duration_days: number | null
  can_use_logo: boolean
  can_use_frames: boolean
  can_use_analytics: boolean
  can_use_custom_colors: boolean
  can_download_svg: boolean
  can_download_pdf: boolean
  max_scans_per_month: number | null
  features: string[]
  is_popular: boolean
}

interface Translations {
  title: string
  subtitle: string
  monthly: string
  yearly: string
  savePercent: string
  perMonth: string
  perYear: string
  getStarted: string
  mostPopular: string
  contactForPayment: string
  whatsappMessage: string
  unlimitedDuration: string
  daysValidity: string
  addLogo: string
  svgDownload: string
  features: {
    unlimited: string
    qrCodes: string
    scans: string
    dynamicQR: string
    analytics: string
    customDesign: string
    bulkCreate: string
    apiAccess: string
  }
}

interface PricingClientProps {
  plans: PricingPlan[]
  translations: Translations
  locale: string
}

// WhatsApp numarası (WhatsApp number)
const WHATSAPP_NUMBER = '905375102084'

export default function PricingClient({ plans, translations: t, locale }: PricingClientProps) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')

  // Para birimi sembolü (Currency symbol)
  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      TRY: '₺',
      USD: '$',
      EUR: '€',
    }
    return symbols[currency] || currency
  }

  // WhatsApp mesajı oluştur (Generate WhatsApp message)
  const getWhatsAppUrl = (planName: string) => {
    const message = t.whatsappMessage.replace('{plan}', planName)
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  }

  // Plan adını dile göre al (Get plan name by locale)
  const getPlanName = (plan: PricingPlan) => {
    return locale === 'tr' ? (plan.name_tr || plan.name) : plan.name
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık (Header) */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.title}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t.subtitle}</p>

          {/* Faturalama aralığı seçici (Billing interval selector) */}
          <div className="mt-8 inline-flex items-center p-1 bg-gray-200 rounded-lg">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingInterval === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.monthly}
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingInterval === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.yearly}
              <span className="ml-2 text-xs text-green-600 font-semibold">{t.savePercent}</span>
            </button>
          </div>
        </div>

        {/* Paket kartları (Plan cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const price = billingInterval === 'monthly' ? plan.price_monthly : plan.price_yearly
            const currencySymbol = getCurrencySymbol(plan.currency)
            const planName = getPlanName(plan)
            const isFree = plan.id === 'free'

            return (
              <Card
                key={plan.id}
                className={`relative ${plan.is_popular ? 'border-2 border-blue-500 shadow-xl' : ''}`}
              >
                {/* Popüler rozet (Popular badge) */}
                {plan.is_popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      {t.mostPopular}
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan adı ve fiyat (Plan name and price) */}
                  <h3 className="text-xl font-bold text-gray-900">{planName}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      {currencySymbol}{price}
                    </span>
                    <span className="ml-2 text-gray-500">
                      {billingInterval === 'monthly' ? t.perMonth : t.perYear}
                    </span>
                  </div>

                  {/* CTA butonu - Free için kayıt, diğerleri için WhatsApp */}
                  {isFree ? (
                    <Link href="/auth/register">
                      <Button className="w-full mt-6" variant="outline">
                        {t.getStarted}
                      </Button>
                    </Link>
                  ) : (
                    <a
                      href={getWhatsAppUrl(planName)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackWhatsAppClick(`pricing_${plan.id}`)}
                      className="block mt-6"
                    >
                      <Button
                        className={`w-full flex items-center justify-center gap-2 ${
                          plan.is_popular
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-300'
                        }`}
                        variant={plan.is_popular ? 'primary' : 'outline'}
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        {t.contactForPayment}
                      </Button>
                    </a>
                  )}



                  {/* Özellikler listesi (Features list) */}
                  <ul className="mt-8 space-y-4">
                    {/* QR Kod Sayısı */}
                    <FeatureItem
                      included={true}
                      text={`${plan.max_qr_codes === -1 ? t.features.unlimited : plan.max_qr_codes} ${t.features.qrCodes}`}
                    />
                    {/* QR Süresi */}
                    <FeatureItem
                      included={true}
                      text={plan.qr_duration_days === null
                        ? t.unlimitedDuration
                        : t.daysValidity.replace('{days}', String(plan.qr_duration_days))}
                    />
                    {/* Tarama Sayısı */}
                    <FeatureItem
                      included={true}
                      text={`${plan.max_scans_per_month === null ? t.features.unlimited : plan.max_scans_per_month.toLocaleString()} ${t.features.scans}`}
                    />
                    {/* Logo */}
                    <FeatureItem
                      included={plan.can_use_logo}
                      text={t.addLogo}
                    />
                    {/* Analitik */}
                    <FeatureItem
                      included={plan.can_use_analytics}
                      text={t.features.analytics}
                    />
                    {/* SVG İndirme */}
                    <FeatureItem
                      included={plan.can_download_svg}
                      text={t.svgDownload}
                    />
                    {/* PDF İndirme / API */}
                    <FeatureItem
                      included={plan.can_download_pdf}
                      text={t.features.apiAccess}
                    />
                  </ul>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Özellik satır komponenti (Feature item component)
function FeatureItem({ included, text }: { included: boolean; text: string }) {
  return (
    <li className="flex items-center gap-3">
      {included ? (
        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
      ) : (
        <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
      )}
      <span className={included ? 'text-gray-700' : 'text-gray-400'}>{text}</span>
    </li>
  )
}

