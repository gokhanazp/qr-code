// Dashboard - QR Kod Detay Sayfası
// Tek bir QR kodunu görüntüler ve yönetir
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Eye, Download, ExternalLink, QrCode } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import QRPreviewClient from './QRPreviewClient'
import DeleteQRButton from '../DeleteQRButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function QRCodeDetailPage({ params }: PageProps) {
  const { id } = await params
  const t = await getTranslations('dashboard')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // QR kodunu getir
  const { data: qrCode, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !qrCode) {
    notFound()
  }

  // Kalan gün hesaplama
  const getRemainingDays = (expiresAt: string | null) => {
    if (!expiresAt) return null
    const now = new Date()
    const expires = new Date(expiresAt)
    const diffTime = expires.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const remainingDays = getRemainingDays(qrCode.expires_at)
  const isExpired = remainingDays !== null && remainingDays <= 0

  // APP veri tipi tanımı (App data type definition)
  interface AppDataType {
    appName?: string
    developer?: string
    appLogo?: string
    title?: string
    description?: string
    website?: string
    iosUrl?: string
    androidUrl?: string
    primaryColor?: string
    secondaryColor?: string
    textColor?: string
  }

  // vCard veri tipi tanımı (vCard data type definition)
  interface VCardDataType {
    firstName?: string
    lastName?: string
    title?: string
    company?: string
    email?: string
    phone?: string
    mobile?: string
    website?: string
    address?: string
    city?: string
    country?: string
    notes?: string
  }

  // APP ve vCard için özel veri parse
  const isAppType = qrCode.type === 'app'
  const isVCardType = qrCode.type === 'vcard'
  let appData: AppDataType = {}
  let vcardData: VCardDataType = {}

  // APP verileri parse - raw veya encoded'dan al
  if (isAppType && qrCode.content) {
    try {
      const contentObj = qrCode.content as Record<string, unknown>
      // Önce raw'dan al (rawContent olarak kaydediliyor)
      if (contentObj.raw && typeof contentObj.raw === 'object') {
        appData = contentObj.raw as AppDataType
      }
      // Yoksa encoded JSON string'den parse et
      else if (contentObj.encoded && typeof contentObj.encoded === 'string') {
        appData = JSON.parse(contentObj.encoded) as AppDataType
      }
    } catch { appData = {} }
  }

  // vCard verileri parse
  if (isVCardType && qrCode.content) {
    try {
      const contentObj = qrCode.content as Record<string, unknown>
      if (contentObj.raw && typeof contentObj.raw === 'object') {
        vcardData = contentObj.raw as VCardDataType
      }
    } catch { vcardData = {} }
  }

  // QR içeriğini al - APP tipi için landing page URL'si kullan
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://qr-code-gamma-neon.vercel.app'
  const qrContent = isAppType
    ? `${baseUrl}/app/${qrCode.id}`
    : (qrCode.content?.encoded || '')
  const qrSettings = qrCode.settings || {}

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Geri Butonu */}
        <Link
          href="/dashboard/qr"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToList')}
        </Link>

        {/* Ana İçerik */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Başlık */}
          <div className={`px-6 py-4 border-b ${isExpired ? 'bg-red-50 border-red-200' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-xl font-bold ${isExpired ? 'text-red-800' : 'text-white'}`}>
                  {qrCode.name}
                </h1>
                <p className={`text-sm ${isExpired ? 'text-red-600' : 'text-white/80'} capitalize`}>
                  {qrCode.type} QR Kod
                </p>
              </div>
              {isExpired && (
                <span className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-full">
                  {t('expired')}
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* APP Tipi - Telefon Mockup Önizleme */}
            {isAppType && (
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  📱 Landing Page Önizleme
                </h3>
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                  {/* Telefon Mockup */}
                  <div className="flex justify-center mx-auto lg:mx-0">
                    <div className="relative w-[200px]">
                      <div className="relative bg-black rounded-[2rem] p-2 shadow-2xl">
                        <div
                          className="relative rounded-[1.5rem] overflow-hidden"
                          style={{
                            background: `linear-gradient(to bottom, ${appData.secondaryColor || '#a8e6cf'}, ${appData.primaryColor || '#2d8659'})`,
                            aspectRatio: '9/16'
                          }}
                        >
                          <div className="px-3 py-4 flex flex-col items-center text-center h-full">
                            <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: appData.textColor || '#000000' }}>
                              {appData.appName || 'APP NAME'}
                            </p>
                            <p className="text-[7px] mb-3 opacity-70" style={{ color: appData.textColor || '#000000' }}>
                              {appData.developer || 'Developer'}
                            </p>
                            <div className="bg-white/30 rounded-2xl p-2 mb-2">
                              {appData.appLogo ? (
                                <img src={appData.appLogo} alt="Logo" className="max-w-[60px] max-h-[60px] object-contain" />
                              ) : (
                                <span className="text-3xl">📱</span>
                              )}
                            </div>
                            <p className="text-[9px] font-bold leading-tight mb-1" style={{ color: appData.textColor || '#000000' }}>
                              {appData.title || 'Download Our App!'}
                            </p>
                            <p className="text-[7px] italic mb-2 opacity-60" style={{ color: appData.textColor || '#000000' }}>HEMEN İNDİR!</p>
                            <div className="space-y-1 w-full px-2">
                              {appData.iosUrl && <img src="/img/apple-en.png" alt="App Store" className="w-full h-auto rounded" />}
                              {appData.androidUrl && <img src="/img/google-en.png" alt="Google Play" className="w-full h-auto rounded" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Landing Page Link */}
                  <div className="flex-1 space-y-3">
                    <a
                      href={`/app/${qrCode.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Landing Page&apos;i Görüntüle
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* vCard Tipi - Kartvizit Önizleme */}
            {isVCardType && (
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  👤 Kartvizit Önizleme
                </h3>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white max-w-md">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                      {(vcardData.firstName || '')[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">{`${vcardData.firstName || ''} ${vcardData.lastName || ''}`}</h4>
                      {vcardData.title && <p className="text-white/80">{vcardData.title}</p>}
                      {vcardData.company && <p className="text-white/70 text-sm">{vcardData.company}</p>}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    {vcardData.phone && <p className="flex items-center gap-2">📞 {vcardData.phone}</p>}
                    {vcardData.email && <p className="flex items-center gap-2">✉️ {vcardData.email}</p>}
                    {vcardData.website && <p className="flex items-center gap-2">🌐 {vcardData.website}</p>}
                    {vcardData.address && <p className="flex items-center gap-2">📍 {vcardData.address}</p>}
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {/* Sol: QR Kod Önizleme */}
              <div className="flex flex-col items-center">
                <div className={`p-4 rounded-xl ${isExpired ? 'bg-red-50 opacity-50' : 'bg-gray-50'}`}>
                  <QRPreviewClient
                    content={qrContent}
                    foregroundColor={qrSettings.foregroundColor || '#000000'}
                    backgroundColor={qrSettings.backgroundColor || '#ffffff'}
                    size={qrSettings.size || 256}
                    errorCorrection={qrSettings.errorCorrection || 'M'}
                    selectedFrame={qrSettings.frame || 'none'}
                    frameText={qrSettings.frameText || ''}
                    frameColor={qrSettings.frameColor || '#000000'}
                    logo={qrSettings.logo || null}
                    logoSize={qrSettings.logoSize || 20}
                  />
                </div>

                {/* İndirme Butonları */}
                {!isExpired && (
                  <div className="flex gap-3 mt-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Download className="w-4 h-4" />
                      {t('downloadPNG')}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <Download className="w-4 h-4" />
                      {t('downloadSVG')}
                    </button>
                  </div>
                )}
              </div>

              {/* Sağ: Detaylar */}
              <div className="space-y-6">
                {/* İstatistikler */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">{t('totalScans')}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{qrCode.scan_count || 0}</p>
                  </div>

                  {remainingDays !== null && (
                    <div className={`rounded-xl p-4 ${isExpired ? 'bg-red-50' : remainingDays <= 3 ? 'bg-orange-50' : 'bg-green-50'}`}>
                      <div className={`flex items-center gap-2 mb-1 ${isExpired ? 'text-red-600' : remainingDays <= 3 ? 'text-orange-600' : 'text-green-600'}`}>
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{t('remainingTime')}</span>
                      </div>
                      <p className={`text-2xl font-bold ${isExpired ? 'text-red-700' : remainingDays <= 3 ? 'text-orange-700' : 'text-green-700'}`}>
                        {isExpired ? t('expired') : `${remainingDays} ${t('days')}`}
                      </p>
                    </div>
                  )}
                </div>

                {/* QR Bilgileri */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">{t('qrCodeInfo')}</h3>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">{t('createdAt')}</p>
                    <p className="text-gray-900">{new Date(qrCode.created_at).toLocaleDateString('tr-TR', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">{t('qrType')}</p>
                    <p className="text-gray-900 capitalize">{qrCode.type}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">{t('status')}</p>
                    <p className={`font-medium ${qrCode.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                      {qrCode.is_active ? t('active') : t('inactive')}
                    </p>
                  </div>
                </div>

                {/* Aksiyonlar */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <DeleteQRButton
                    qrId={qrCode.id}
                    qrName={qrCode.name}
                    variant="full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

