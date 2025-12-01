// Dashboard - Abonelik Yönetimi sayfası
// Kullanıcının abonelik durumunu ve plan bilgilerini gösterir
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CreditCard, Check, Zap, Crown, Building2 } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function SubscriptionPage() {
  const t = await getTranslations('dashboard')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Kullanıcının mevcut planı (şimdilik free varsayıyoruz)
  const currentPlan = 'free'

  const plans = [
    {
      id: 'free',
      name: t('freePlan'),
      price: '₺0',
      period: t('perMonth'),
      descriptionKey: 'freePlanDesc',
      icon: Zap,
      color: 'gray',
      features: [
        `2 QR`,
        t('tenDays'),
        'PNG',
      ],
    },
    {
      id: 'pro',
      name: t('proPlan'),
      price: '₺49',
      period: t('perMonth'),
      descriptionKey: 'proPlanDesc',
      icon: Crown,
      color: 'blue',
      popular: true,
      features: [
        `50 QR`,
        t('unlimited'),
        'Logo',
        'SVG & WEBP',
        t('analytics'),
      ],
    },
    {
      id: 'enterprise',
      name: t('enterprisePlan'),
      price: '₺199',
      period: t('perMonth'),
      descriptionKey: 'enterprisePlanDesc',
      icon: Building2,
      color: 'purple',
      features: [
        `${t('unlimited')} QR`,
        t('unlimited'),
        t('apiAccess'),
        t('prioritySupport'),
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">{t('subscription')}</h1>
          <p className="text-gray-600 mt-2">{t('currentPlan')}: <span className="font-semibold capitalize">{currentPlan}</span></p>
        </div>

        {/* Plan Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isCurrentPlan = plan.id === currentPlan
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-sm border-2 p-6 ${
                  plan.popular ? 'border-blue-500' : 'border-gray-200'
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {t('recommended')}
                    </span>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {t('currentPlan')}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                    plan.color === 'blue' ? 'bg-blue-100' :
                    plan.color === 'purple' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      plan.color === 'blue' ? 'text-blue-600' :
                      plan.color === 'purple' ? 'text-purple-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                  >
                    {t('currentPlan')}
                  </button>
                ) : (
                  <Link
                    href={`/checkout/${plan.id}`}
                    className={`block w-full py-3 text-center rounded-lg font-medium transition-colors ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('selectPlan')}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

