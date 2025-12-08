// Fiyatlandırma Sayfası
// Paket planları ve fiyatları - Supabase'den dinamik çekme

import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getTranslations, getLocale } from 'next-intl/server'
import PricingClient from './PricingClient'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://qr-code-gamma-neon.vercel.app'

// Dinamik SEO Metadata - Dil bazlı
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seo')
  const locale = await getLocale()

  return {
    title: t('pricing.title'),
    description: t('pricing.description'),
    keywords: locale === 'tr'
      ? ['qr kod fiyat', 'qr kod paket', 'dinamik qr kod fiyat', 'kurumsal qr kod', 'ücretsiz qr kod']
      : ['qr code pricing', 'qr code plans', 'dynamic qr code price', 'enterprise qr code', 'free qr code'],
    openGraph: {
      title: t('pricing.title'),
      description: t('pricing.description'),
      url: `${siteUrl}/pricing`,
    },
    alternates: {
      canonical: `${siteUrl}/pricing`,
      languages: {
        'tr': '/fiyatlandirma',
        'en': '/pricing',
      },
    },
  }
}

// Fiyatlandırma planı tipi (Pricing plan type)
interface PricingPlan {
  id: string
  name: string
  name_tr: string
  description: string | null
  description_tr: string | null
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
  sort_order: number
}

export default async function PricingPage() {
  const supabase = await createClient()
  const t = await getTranslations('pricing')
  const ft = await getTranslations('pricing.features')

  // Supabase'den planları çek (Fetch plans from Supabase)
  const { data: dbPlans } = await supabase
    .from('pricing_plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // Fallback planlar (Supabase'de veri yoksa)
  const fallbackPlans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      name_tr: 'Ücretsiz',
      description: null,
      description_tr: null,
      price_monthly: 0,
      price_yearly: 0,
      currency: 'TRY',
      max_qr_codes: 2,
      qr_duration_days: 10,
      can_use_logo: false,
      can_use_frames: false,
      can_use_analytics: false,
      can_use_custom_colors: true,
      can_download_svg: false,
      can_download_pdf: false,
      max_scans_per_month: 100,
      features: [],
      is_popular: false,
      sort_order: 1,
    },
    {
      id: 'pro',
      name: 'Pro',
      name_tr: 'Pro',
      description: null,
      description_tr: null,
      price_monthly: 49,
      price_yearly: 490,
      currency: 'TRY',
      max_qr_codes: 50,
      qr_duration_days: null,
      can_use_logo: true,
      can_use_frames: true,
      can_use_analytics: true,
      can_use_custom_colors: true,
      can_download_svg: true,
      can_download_pdf: false,
      max_scans_per_month: null,
      features: [],
      is_popular: true,
      sort_order: 2,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      name_tr: 'Kurumsal',
      description: null,
      description_tr: null,
      price_monthly: 199,
      price_yearly: 1990,
      currency: 'TRY',
      max_qr_codes: -1,
      qr_duration_days: null,
      can_use_logo: true,
      can_use_frames: true,
      can_use_analytics: true,
      can_use_custom_colors: true,
      can_download_svg: true,
      can_download_pdf: true,
      max_scans_per_month: null,
      features: [],
      is_popular: false,
      sort_order: 3,
    },
  ]

  const plans = (dbPlans && dbPlans.length > 0 ? dbPlans : fallbackPlans) as PricingPlan[]

  // Dil bilgisini al (Get locale)
  const locale = await getLocale()

  // Çeviri metinlerini Client Component'e aktar
  const translations = {
    title: t('title'),
    subtitle: t('subtitle'),
    monthly: t('monthly'),
    yearly: t('yearly'),
    savePercent: t('savePercent'),
    perMonth: t('perMonth'),
    perYear: t('perYear'),
    getStarted: t('getStarted'),
    mostPopular: t('mostPopular'),
    contactForPayment: t('contactForPayment'),
    whatsappMessage: t('whatsappMessage'),
    unlimitedDuration: t('unlimitedDuration'),
    daysValidity: t('daysValidity'),
    addLogo: t('addLogo'),
    svgDownload: t('svgDownload'),
    features: {
      unlimited: ft('unlimited'),
      qrCodes: ft('qrCodes'),
      scans: ft('scans'),
      dynamicQR: ft('dynamicQR'),
      analytics: ft('analytics'),
      customDesign: ft('customDesign'),
      bulkCreate: ft('bulkCreate'),
      apiAccess: ft('apiAccess'),
    }
  }

  return <PricingClient plans={plans} translations={translations} locale={locale} />
}

