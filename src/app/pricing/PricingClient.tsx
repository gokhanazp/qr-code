// Fiyatlandırma Client Component
// Aylık/Yıllık toggle için client-side state gerekiyor

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { Button, Card } from '@/components/ui'

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
}

export default function PricingClient({ plans, translations: t }: PricingClientProps) {
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

            return (
              <Card
                key={plan.id}
                className={`relative ${plan.is_popular ? 'border-2 border-blue-500 shadow-xl' : ''}`}
              >
                {/* Popüler rozet (Popular badge) */}
                {plan.is_popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      En Popüler
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan adı ve fiyat (Plan name and price) */}
                  <h3 className="text-xl font-bold text-gray-900">{plan.name_tr || plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      {currencySymbol}{price}
                    </span>
                    <span className="ml-2 text-gray-500">
                      {billingInterval === 'monthly' ? t.perMonth : t.perYear}
                    </span>
                  </div>

                  {/* CTA butonu (CTA button) */}
                  <Link href={plan.id === 'free' ? '/auth/register' : `/checkout/${plan.id}`}>
                    <Button
                      className="w-full mt-6"
                      variant={plan.is_popular ? 'primary' : 'outline'}
                    >
                      {t.getStarted}
                    </Button>
                  </Link>

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
                      text={plan.qr_duration_days === null ? 'Sınırsız süre' : `${plan.qr_duration_days} gün geçerlilik`}
                    />
                    {/* Tarama Sayısı */}
                    <FeatureItem
                      included={true}
                      text={`${plan.max_scans_per_month === null ? t.features.unlimited : plan.max_scans_per_month.toLocaleString()} ${t.features.scans}`}
                    />
                    {/* Logo */}
                    <FeatureItem
                      included={plan.can_use_logo}
                      text="Logo ekleme"
                    />
                    {/* Analitik */}
                    <FeatureItem
                      included={plan.can_use_analytics}
                      text={t.features.analytics}
                    />
                    {/* SVG İndirme */}
                    <FeatureItem
                      included={plan.can_download_svg}
                      text="SVG & WEBP indirme"
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

