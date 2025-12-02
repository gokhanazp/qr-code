// Dashboard - QR Kod Detay Sayfası
// Tek bir QR kodunu görüntüler ve yönetir
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Eye, ExternalLink, Edit } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import QRDownloadWrapper from './QRDownloadWrapper'
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

  // localhost URL'lerini düzelt (Fix localhost URLs)
  const fixLocalhostUrl = (url: string): string => {
    if (!url) return url
    return url
      .replace(/http:\/\/localhost:\d+/g, baseUrl)
      .replace(/https:\/\/localhost:\d+/g, baseUrl)
  }

  const rawContent = qrCode.content?.encoded || ''
  const qrContent = isAppType
    ? `${baseUrl}/app/${qrCode.id}`
    : fixLocalhostUrl(rawContent)
  const qrSettings = qrCode.settings || {}

  return (
    <div className="py-4">
      <div className="max-w-7xl mx-auto">
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
            {/* Ana Grid: QR Kod (Sol) + Önizleme (Sağ) */}
            <div className={`grid gap-6 ${isAppType || isVCardType ? 'lg:grid-cols-3' : 'md:grid-cols-2'}`}>

              {/* Sol Panel: QR Kod ve Detaylar */}
              <div className={`space-y-6 ${isAppType || isVCardType ? 'lg:col-span-2' : ''}`}>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* QR Kod Önizleme ve İndirme */}
                  <QRDownloadWrapper
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
                    qrName={qrCode.name || 'qr-code'}
                    isExpired={isExpired}
                    downloadPNGLabel={t('downloadPNG')}
                    downloadSVGLabel={t('downloadSVG')}
                  />

                  {/* Detaylar */}
                  <div className="space-y-4">
                    {/* İstatistikler */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Eye className="w-4 h-4" />
                          <span className="text-xs">{t('totalScans')}</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{qrCode.scan_count || 0}</p>
                      </div>

                      {remainingDays !== null && (
                        <div className={`rounded-xl p-3 ${isExpired ? 'bg-red-50' : remainingDays <= 3 ? 'bg-orange-50' : 'bg-green-50'}`}>
                          <div className={`flex items-center gap-2 mb-1 ${isExpired ? 'text-red-600' : remainingDays <= 3 ? 'text-orange-600' : 'text-green-600'}`}>
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs">{t('remainingTime')}</span>
                          </div>
                          <p className={`text-xl font-bold ${isExpired ? 'text-red-700' : remainingDays <= 3 ? 'text-orange-700' : 'text-green-700'}`}>
                            {isExpired ? t('expired') : `${remainingDays} ${t('days')}`}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* QR Bilgileri */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{t('qrCodeInfo')}</h3>

                      <div className="bg-gray-50 rounded-lg p-2.5">
                        <p className="text-[10px] text-gray-500 mb-0.5">{t('createdAt')}</p>
                        <p className="text-gray-900 text-sm">{new Date(qrCode.created_at).toLocaleDateString('tr-TR', {
                          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 rounded-lg p-2.5">
                          <p className="text-[10px] text-gray-500 mb-0.5">{t('qrType')}</p>
                          <p className="text-gray-900 text-sm capitalize">{qrCode.type}</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-2.5">
                          <p className="text-[10px] text-gray-500 mb-0.5">{t('status')}</p>
                          <p className={`font-medium text-sm ${qrCode.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                            {qrCode.is_active ? t('active') : t('inactive')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Aksiyonlar */}
                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      <Link
                        href={`/dashboard/qr/${qrCode.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        {t('edit')}
                      </Link>
                      <DeleteQRButton
                        qrId={qrCode.id}
                        qrName={qrCode.name}
                        variant="full"
                      />
                    </div>
                  </div>
                </div>

                {/* vCard Tipi - Kartvizit Önizleme (Sol panelde alt kısımda) */}
                {isVCardType && (
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-white/90">
                      👤 Kartvizit Önizleme
                    </h3>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
                        {(vcardData.firstName || '')[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold">{`${vcardData.firstName || ''} ${vcardData.lastName || ''}`}</h4>
                        {vcardData.title && <p className="text-white/80 text-sm">{vcardData.title}</p>}
                        {vcardData.company && <p className="text-white/70 text-xs">{vcardData.company}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {vcardData.phone && <p className="flex items-center gap-2 text-white/90">📞 {vcardData.phone}</p>}
                      {vcardData.email && <p className="flex items-center gap-2 text-white/90">✉️ {vcardData.email}</p>}
                      {vcardData.website && <p className="flex items-center gap-2 text-white/90">🌐 {vcardData.website}</p>}
                      {vcardData.address && <p className="flex items-center gap-2 text-white/90">📍 {vcardData.address}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Sağ Panel: Landing Page Önizleme (APP tipi için) */}
              {isAppType && (
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200 sticky top-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                      📱 Landing Page Önizleme
                    </h3>

                    {/* Telefon Mockup */}
                    <div className="flex justify-center mb-3">
                      <div className="relative w-[180px]">
                        <div className="relative bg-gray-900 rounded-[2rem] p-1.5 shadow-2xl">
                          {/* Notch */}
                          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-black rounded-full z-10" />
                          <div
                            className="relative rounded-[1.5rem] overflow-hidden"
                            style={{
                              background: `linear-gradient(to bottom, ${appData.secondaryColor || '#a8e6cf'}, ${appData.primaryColor || '#2d8659'})`,
                              aspectRatio: '9/19'
                            }}
                          >
                            <div className="px-3 py-6 flex flex-col items-center text-center h-full justify-center">
                              <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: appData.textColor || '#000000' }}>
                                {appData.appName || 'APP NAME'}
                              </p>
                              <p className="text-[6px] mb-2 opacity-70" style={{ color: appData.textColor || '#000000' }}>
                                {appData.developer || 'Developer'}
                              </p>
                              <div className="bg-white/30 rounded-xl p-1.5 mb-2">
                                {appData.appLogo ? (
                                  <img src={appData.appLogo} alt="Logo" className="w-10 h-10 object-contain" />
                                ) : (
                                  <span className="text-2xl">📱</span>
                                )}
                              </div>
                              <p className="text-[8px] font-bold leading-tight mb-1" style={{ color: appData.textColor || '#000000' }}>
                                {appData.title || 'Download Our App!'}
                              </p>
                              <div className="space-y-1 w-full px-3 mt-1">
                                {appData.iosUrl && <img src="/img/apple-en.png" alt="App Store" className="w-full h-auto rounded" />}
                                {appData.androidUrl && <img src="/img/google-en.png" alt="Google Play" className="w-full h-auto rounded" />}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Landing Page Butonu */}
                    <a
                      href={`/app/${qrCode.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Landing Page&apos;i Görüntüle
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

