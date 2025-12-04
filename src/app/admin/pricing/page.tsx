// Admin Pricing Page
// Fiyatlandırma yönetimi sayfası

import { createClient } from '@/lib/supabase/server'
import { DollarSign, Edit, Save, Crown, Building2, Zap, Check, X } from 'lucide-react'
import PricingEditor from './PricingEditor'

// Para birimi sembolü helper fonksiyonu (Currency symbol helper)
const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
  }
  return symbols[currency] || currency
}

export default async function AdminPricingPage() {
  const supabase = await createClient()

  // Fiyatlandırma planlarını çek (Fetch pricing plans)
  const { data: plans } = await supabase
    .from('pricing_plans')
    .select('*')
    .order('sort_order', { ascending: true })

  // Site ayarlarından para birimini al (Get currency from site settings)
  const { data: currencySetting } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'currency')
    .single()

  const currency = currencySetting?.value || 'TRY'
  const currencySymbol = getCurrencySymbol(currency)

  // Plan ikonları (Plan icons)
  const planIcons: Record<string, React.ElementType> = {
    free: Zap,
    pro: Crown,
    enterprise: Building2,
  }

  // Plan renkleri (Plan colors)
  const planGradients: Record<string, string> = {
    free: 'from-gray-500 to-gray-600',
    pro: 'from-blue-500 to-indigo-600',
    enterprise: 'from-purple-500 to-pink-600',
  }

  return (
    <div>
      {/* Başlık (Header) */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fiyatlandırma Yönetimi</h1>
          <p className="text-gray-500 mt-1">Plan fiyatlarını ve özelliklerini düzenleyin</p>
        </div>
      </div>

      {/* Plan Kartları (Plan Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(plans || []).map((plan) => {
          const PlanIcon = planIcons[plan.id] || Zap
          const features = Array.isArray(plan.features) ? plan.features : []

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border ${plan.is_popular ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'} overflow-hidden`}
            >
              {/* Plan Başlığı (Plan Header) */}
              <div className={`bg-gradient-to-r ${planGradients[plan.id]} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <PlanIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      <p className="text-white/80 text-sm">{plan.name_tr}</p>
                    </div>
                  </div>
                  {plan.is_popular && (
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                      Popüler
                    </span>
                  )}
                </div>
              </div>

              {/* Fiyat Bilgisi (Price Info) */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">{currencySymbol}{plan.price_monthly}</span>
                  <span className="text-gray-500">/ay</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Yıllık: {currencySymbol}{plan.price_yearly}/yıl
                </p>
              </div>

              {/* Plan Limitleri (Plan Limits) */}
              <div className="p-6 border-b border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Max QR Kod</span>
                  <span className="font-medium text-gray-900">
                    {plan.max_qr_codes === -1 ? 'Sınırsız' : plan.max_qr_codes}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">QR Süresi</span>
                  <span className="font-medium text-gray-900">
                    {plan.qr_duration_days ? `${plan.qr_duration_days} gün` : 'Sınırsız'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Aylık Tarama</span>
                  <span className="font-medium text-gray-900">
                    {plan.max_scans_per_month ? plan.max_scans_per_month.toLocaleString() : 'Sınırsız'}
                  </span>
                </div>
              </div>

              {/* Özellikler (Features) */}
              <div className="p-6 border-b border-gray-100">
                <h4 className="text-sm font-medium text-gray-500 mb-3">ÖZELLİKLER</h4>
                <div className="space-y-2">
                  <FeatureRow label="Logo Kullanımı" enabled={plan.can_use_logo} />
                  <FeatureRow label="Çerçeve Kullanımı" enabled={plan.can_use_frames} />
                  <FeatureRow label="Analitik" enabled={plan.can_use_analytics} />
                  <FeatureRow label="SVG İndirme" enabled={plan.can_download_svg} />
                  <FeatureRow label="PDF İndirme" enabled={plan.can_download_pdf} />
                </div>
              </div>

              {/* Düzenle Butonu (Edit Button) */}
              <div className="p-6">
                <PricingEditor plan={plan} currencySymbol={currencySymbol} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Planlar yoksa (If no plans) */}
      {(!plans || plans.length === 0) && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Henüz plan tanımlanmamış</p>
          <p className="text-sm text-gray-400 mt-1">
            Migration dosyasını çalıştırarak varsayılan planları ekleyin
          </p>
        </div>
      )}
    </div>
  )
}

// Özellik satırı komponenti (Feature row component)
function FeatureRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600 text-sm">{label}</span>
      {enabled ? (
        <Check className="w-5 h-5 text-green-500" />
      ) : (
        <X className="w-5 h-5 text-gray-300" />
      )}
    </div>
  )
}

