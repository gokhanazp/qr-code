// Ana Sayfa - Home Page
// QR Kod Generator ana sayfası - SEO optimized - Modern tasarım

import { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import { useTranslations } from 'next-intl'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://qr-code-gamma-neon.vercel.app'

// Dinamik SEO Metadata - Dil bazlı
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seo')
  const locale = await getLocale()

  return {
    title: t('home.title'),
    description: t('home.description'),
    keywords: locale === 'tr'
      ? ['qr kod oluşturucu', 'ücretsiz qr kod', 'qr kod yapma', 'karekod', 'wifi qr kod', 'whatsapp qr kod', 'vcard qr kod', 'dinamik qr kod']
      : ['qr code generator', 'free qr code', 'qr code maker', 'wifi qr code', 'whatsapp qr code', 'vcard qr code', 'dynamic qr code'],
    openGraph: {
      title: t('home.ogTitle'),
      description: t('home.ogDescription'),
      url: siteUrl,
      type: 'website',
    },
    alternates: {
      canonical: siteUrl,
      languages: {
        'tr': '/',
        'en': '/',
      },
    },
  }
}
import {
  QrCode, Zap, Shield, Globe, Smartphone, BarChart3, Sparkles, Play,
  Link as LinkIcon, Wifi, Mail, Phone, CreditCard, FileText, Calendar,
  MapPin, MessageCircle, Instagram, Twitter, Linkedin, Youtube, Facebook,
  Bitcoin, AppWindow, ArrowRight, CheckCircle2, Star, Code
} from 'lucide-react'
import FAQ from '@/components/FAQ'

// QR tipleri - icon ve gradient bilgileri (text çeviriden gelecek)
const qrTypesConfig = [
  { type: 'url', icon: LinkIcon, gradient: 'from-blue-500 to-blue-600', color: 'bg-blue-500', popular: true },
  { type: 'vcard', icon: CreditCard, gradient: 'from-purple-500 to-purple-600', color: 'bg-purple-500', popular: true },
  { type: 'wifi', icon: Wifi, gradient: 'from-green-500 to-emerald-600', color: 'bg-green-500', popular: true },
  { type: 'email', icon: Mail, gradient: 'from-red-500 to-red-600', color: 'bg-red-500', popular: true },
  { type: 'phone', icon: Phone, gradient: 'from-emerald-500 to-emerald-600', color: 'bg-emerald-500' },
  { type: 'sms', icon: MessageCircle, gradient: 'from-blue-400 to-blue-500', color: 'bg-blue-400' },
  { type: 'whatsapp', icon: MessageCircle, gradient: 'from-green-500 to-green-600', color: 'bg-green-500', popular: true },
  { type: 'text', icon: FileText, gradient: 'from-gray-500 to-gray-600', color: 'bg-gray-500' },
  { type: 'instagram', icon: Instagram, gradient: 'from-pink-500 to-pink-600', color: 'bg-pink-500' },
  { type: 'twitter', icon: Twitter, gradient: 'from-sky-500 to-sky-600', color: 'bg-sky-500' },
  { type: 'linkedin', icon: Linkedin, gradient: 'from-blue-600 to-blue-700', color: 'bg-blue-600' },
  { type: 'youtube', icon: Youtube, gradient: 'from-red-600 to-red-700', color: 'bg-red-600' },
  { type: 'facebook', icon: Facebook, gradient: 'from-blue-500 to-blue-600', color: 'bg-blue-500' },
  { type: 'event', icon: Calendar, gradient: 'from-orange-500 to-orange-600', color: 'bg-orange-500' },
  { type: 'location', icon: MapPin, gradient: 'from-red-500 to-rose-600', color: 'bg-red-500' },
  { type: 'bitcoin', icon: Bitcoin, gradient: 'from-amber-500 to-amber-600', color: 'bg-amber-500' },
  { type: 'app', icon: AppWindow, gradient: 'from-indigo-500 to-indigo-600', color: 'bg-indigo-500', popular: true },
  { type: 'html', icon: Code, gradient: 'from-orange-500 to-red-500', color: 'bg-orange-500' },
]

// Özellikler config - text çeviriden gelecek
const featuresConfig = [
  { key: 'lightningFast', icon: Zap, color: 'bg-amber-500' },
  { key: 'securePrivate', icon: Shield, color: 'bg-green-500' },
  { key: 'worksEverywhere', icon: Globe, color: 'bg-blue-500' },
  { key: 'mobileFriendly', icon: Smartphone, color: 'bg-purple-500' },
  { key: 'trackScans', icon: BarChart3, color: 'bg-pink-500' },
  { key: 'customizable', icon: QrCode, color: 'bg-indigo-500' },
]

export default function HomePage() {
  const t = useTranslations('home')
  const tQr = useTranslations('qrTypes')
  const tFeatures = useTranslations('features')

  // İstatistikler - çeviriden
  const stats = [
    { value: '10M+', label: t('qrCodesCreated') },
    { value: '50M+', label: t('totalScans') },
    { value: '190+', label: t('countries') },
    { value: '99.9%', label: t('uptime') },
  ]

  // QR tipleri - config + çeviri birleşimi
  const qrTypes = qrTypesConfig.map(qr => ({
    ...qr,
    name: tQr(qr.type),
    desc: tQr(`${qr.type}Desc`),
  }))

  // Özellikler - config + çeviri birleşimi
  const features = featuresConfig.map(f => ({
    ...f,
    title: tFeatures(f.key),
    desc: tFeatures(`${f.key}Desc`),
  }))

  return (
    <div className="bg-white">
      {/* Hero Section - Modern gradient mesh tasarım */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Gradient mesh arka plan */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" />

        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23000000'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Sol taraf - İçerik */}
            <div className="text-center lg:text-left">
              {/* Rozet */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-200/50 rounded-full text-sm mb-6">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700 font-medium">{t('trustedBy')}</span>
              </div>

              {/* Başlık */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                <span className="text-gray-900">{t('title').split(' ').slice(0, -2).join(' ')}</span>
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {' '}{t('title').split(' ').slice(-2).join(' ')}
                </span>
              </h1>

              {/* Alt başlık */}
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                {t('subtitle')}
              </p>

              {/* CTA Butonları */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                <Link href="#qr-types">
                  <button className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all">
                    {t('generateButton')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link href="/pricing">
                  <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                    <Play className="w-5 h-5" />
                    {t('learnMore')}
                  </button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>{t('freeToUse')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>{t('noSignup')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>{t('rating')}</span>
                </div>
              </div>
            </div>

            {/* Sağ taraf - QR Code görselleştirmesi */}
            <div className="relative flex justify-center lg:justify-end">
              {/* Ana QR kod kartı */}
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-20 scale-110" />

                {/* Kart */}
                <div className="relative bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-8 border border-gray-100">
                  {/* QR Code placeholder */}
                  <div className="w-64 h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden">
                    {/* QR pattern - Sabit desen (Fixed pattern to prevent hydration error) */}
                    <div className="grid grid-cols-8 gap-1 p-6">
                      {/* 8x8 = 64 hücreli sabit QR deseni */}
                      {[
                        1,1,1,1,1,1,0,0, 0,0,0,0,0,1,1,0, 1,0,1,0,1,0,1,0,
                        0,1,0,1,0,1,0,1, 1,0,0,1,1,0,0,1, 0,1,1,0,0,1,1,0,
                        1,1,0,0,1,1,0,0, 0,0,1,1,1,1,1,1
                      ].map((filled, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-sm ${
                            filled ? 'bg-gray-900' : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                    {/* Center logo */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center">
                        <QrCode className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  {/* İndirme butonları */}
                  <div className="flex gap-3">
                    <button className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl text-sm">
                      {t('downloadPng')}
                    </button>
                    <button className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl text-sm hover:bg-gray-200 transition-colors">
                      {t('downloadSvg')}
                    </button>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg px-4 py-2 flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{t('secure')}</span>
                </div>

                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg px-4 py-2 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{t('instant')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* İstatistikler */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QR Types Section - Modern tasarım */}
      <section id="qr-types" className="py-20 lg:py-28 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Başlık */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-sm mb-4">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700 font-medium">{t('qrTypesCount')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {t('chooseQrType')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('qrTypeDesc')}
            </p>
          </div>

          {/* Popular QR Types - Öne Çıkanlar */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full" />
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('mostPopular')}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {qrTypes.filter(t => t.popular).map((qr) => (
                <Link
                  key={qr.type}
                  href={`/qr-generator/${qr.type}`}
                  className="group relative bg-white rounded-2xl p-6 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Hover gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${qr.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity`} />

                  {/* Top accent line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${qr.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`} />

                  <div className="relative flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${qr.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                      <qr.icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-2 mb-1">
                        {qr.name}
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </h4>
                      <p className="text-sm text-gray-500">{qr.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Tüm QR Tipleri */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-gradient-to-b from-gray-400 to-gray-500 rounded-full" />
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('allQrTypes')}</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {qrTypes.map((qr) => (
                <Link
                  key={qr.type}
                  href={`/qr-generator/${qr.type}`}
                  className="group flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-xl hover:shadow-gray-200/50 hover:border-transparent transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl ${qr.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-sm`}>
                    <qr.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors text-sm truncate">{qr.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Özellikler Section - Modern */}
      <section className="py-20 lg:py-28 bg-gray-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-100/50 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full text-sm mb-4">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span className="text-indigo-700 font-medium">{t('whyChooseUs')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {t('everythingYouNeed')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('featuresDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 border border-gray-100"
              >
                {/* Hover effect line */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-t-2xl`} />

                <div className={`w-14 h-14 ${feature.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - Ana sayfada 5 soru göster */}
      <FAQ limit={5} />

      {/* CTA Section - Modern gradient */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />

        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>

        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-6">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-white/90 font-medium">{t('getStartedToday')}</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {t('readyToCreate')}
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            {t('ctaDesc')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <button className="group flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                {t('getStartedFree')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/pricing">
              <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 backdrop-blur-sm transition-all">
                {t('viewPricing')}
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
