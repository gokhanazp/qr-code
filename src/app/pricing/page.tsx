// Fiyatlandırma Sayfası
// Paket planları ve fiyatları

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { Button, Card } from '@/components/ui'

// Paket planları
const plans = [
  {
    id: 'free',
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    features: {
      qrCodes: 5,
      scans: 100,
      dynamicQR: false,
      analytics: false,
      customDesign: true,
      bulkCreate: false,
      apiAccess: false,
    },
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 9.99, yearly: 99.99 },
    features: {
      qrCodes: 50,
      scans: 10000,
      dynamicQR: true,
      analytics: true,
      customDesign: true,
      bulkCreate: true,
      apiAccess: false,
    },
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: { monthly: 29.99, yearly: 299.99 },
    features: {
      qrCodes: -1, // unlimited
      scans: -1,
      dynamicQR: true,
      analytics: true,
      customDesign: true,
      bulkCreate: true,
      apiAccess: true,
    },
    popular: false,
  },
]

export default function PricingPage() {
  const t = useTranslations('pricing')
  const ft = useTranslations('pricing.features')
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('subtitle')}</p>

          {/* Faturalama aralığı seçici */}
          <div className="mt-8 inline-flex items-center p-1 bg-gray-200 rounded-lg">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingInterval === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('monthly')}
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingInterval === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('yearly')}
              <span className="ml-2 text-xs text-green-600 font-semibold">{t('savePercent')}</span>
            </button>
          </div>
        </div>

        {/* Paket kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${plan.popular ? 'border-2 border-blue-500 shadow-xl' : ''}`}
            >
              {/* Popüler rozet */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan adı ve fiyat */}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price[billingInterval]}
                  </span>
                  <span className="ml-2 text-gray-500">
                    {billingInterval === 'monthly' ? t('perMonth') : t('perYear')}
                  </span>
                </div>

                {/* CTA butonu */}
                <Link href={plan.id === 'free' ? '/auth/register' : `/checkout/${plan.id}`}>
                  <Button
                    className="w-full mt-6"
                    variant={plan.popular ? 'primary' : 'outline'}
                  >
                    {t('getStarted')}
                  </Button>
                </Link>

                {/* Özellikler listesi */}
                <ul className="mt-8 space-y-4">
                  <FeatureItem
                    included={true}
                    text={`${plan.features.qrCodes === -1 ? ft('unlimited') : plan.features.qrCodes} ${ft('qrCodes')}`}
                  />
                  <FeatureItem
                    included={true}
                    text={`${plan.features.scans === -1 ? ft('unlimited') : plan.features.scans.toLocaleString()} ${ft('scans')}`}
                  />
                  <FeatureItem included={plan.features.dynamicQR} text={ft('dynamicQR')} />
                  <FeatureItem included={plan.features.analytics} text={ft('analytics')} />
                  <FeatureItem included={plan.features.customDesign} text={ft('customDesign')} />
                  <FeatureItem included={plan.features.bulkCreate} text={ft('bulkCreate')} />
                  <FeatureItem included={plan.features.apiAccess} text={ft('apiAccess')} />
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// Özellik satır komponenti
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

