// Dashboard - QR Kod Detay Sayfası
// Tek bir QR kodunu görüntüler ve yönetir
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Eye, ExternalLink, Edit, Globe, Wifi, FileText, Mail, Phone, MessageSquare, MapPin, CalendarDays, Instagram, Twitter, Linkedin, Youtube, Facebook, Bitcoin } from 'lucide-react'
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

  // Tüm QR tipleri için veri tanımları
  interface AppDataType {
    appName?: string; developer?: string; appLogo?: string; title?: string
    description?: string; website?: string; iosUrl?: string; androidUrl?: string
    primaryColor?: string; secondaryColor?: string; textColor?: string
  }
  interface VCardDataType {
    firstName?: string; lastName?: string; title?: string; company?: string
    email?: string; phone?: string; mobile?: string; website?: string
    address?: string; city?: string; country?: string; notes?: string
  }
  interface WiFiDataType { ssid?: string; password?: string; encryption?: string; hidden?: boolean }
  interface EmailDataType { email?: string; subject?: string; body?: string }
  interface SMSDataType { phone?: string; message?: string }
  interface EventDataType { title?: string; location?: string; startDate?: string; endDate?: string; description?: string }
  interface LocationDataType { latitude?: string; longitude?: string; query?: string }
  interface SocialDataType { username?: string; url?: string }
  interface CryptoDataType { currency?: string; address?: string; amount?: string }

  // QR tipi kontrolü
  const qrType = qrCode.type?.toLowerCase() || ''
  const isAppType = qrType === 'app'
  const isVCardType = qrType === 'vcard'
  const isWiFiType = qrType === 'wifi'
  const isEmailType = qrType === 'email'
  const isSMSType = qrType === 'sms'
  const isPhoneType = qrType === 'phone'
  const isEventType = qrType === 'event'
  const isLocationData = qrType === 'location'
  const isUrlType = qrType === 'url'
  const isTextType = qrType === 'text'
  const isWhatsAppType = qrType === 'whatsapp'
  const isSocialType = ['instagram', 'twitter', 'linkedin', 'youtube', 'facebook'].includes(qrType)
  const isCryptoType = qrType === 'crypto'

  // Veri parse
  let appData: AppDataType = {}, vcardData: VCardDataType = {}, wifiData: WiFiDataType = {}
  let emailData: EmailDataType = {}, smsData: SMSDataType = {}, eventData: EventDataType = {}
  let locationData: LocationDataType = {}, socialData: SocialDataType = {}, cryptoData: CryptoDataType = {}
  let textContent = '', urlContent = '', phoneContent = '', whatsappData = { phone: '', message: '' }

  const contentObj = (qrCode.content || {}) as Record<string, unknown>
  const rawData = contentObj.raw as Record<string, unknown> || {}
  const encodedStr = (contentObj.encoded as string) || ''

  try {
    if (isAppType) appData = (rawData as AppDataType) || JSON.parse(encodedStr)
    if (isVCardType) vcardData = rawData as VCardDataType
    if (isWiFiType) wifiData = rawData as WiFiDataType
    if (isEmailType) emailData = rawData as EmailDataType
    if (isSMSType) smsData = rawData as SMSDataType
    if (isEventType) eventData = rawData as EventDataType
    if (isLocationData) locationData = rawData as LocationDataType
    if (isSocialType) socialData = rawData as SocialDataType
    if (isCryptoType) cryptoData = rawData as CryptoDataType
    if (isTextType) textContent = (rawData.text as string) || encodedStr
    if (isUrlType) urlContent = (rawData.url as string) || encodedStr
    if (isPhoneType) phoneContent = (rawData.phone as string) || encodedStr
    if (isWhatsAppType) whatsappData = { phone: (rawData.phone as string) || '', message: (rawData.message as string) || '' }
  } catch { /* ignore parse errors */ }

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
            {/* Ana Grid: Her zaman 3 kolonlu düzen */}
            <div className="grid gap-6 lg:grid-cols-3">

              {/* Sol Panel: QR Kod ve Detaylar (2 kolon) */}
              <div className="space-y-6 lg:col-span-2">
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

              </div>

              {/* Sağ Panel: QR Tipine Göre Önizleme (1 kolon) */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200 sticky top-4">

                  {/* APP Tipi - Landing Page Önizleme */}
                  {isAppType && (
                    <>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                        📱 Landing Page
                      </h3>
                      <div className="flex justify-center mb-3">
                        <div className="relative w-[160px]">
                          <div className="relative bg-gray-900 rounded-[1.5rem] p-1.5 shadow-xl">
                            <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-12 h-3 bg-black rounded-full z-10" />
                            <div className="relative rounded-[1.2rem] overflow-hidden" style={{ background: `linear-gradient(to bottom, ${appData.secondaryColor || '#a8e6cf'}, ${appData.primaryColor || '#2d8659'})`, aspectRatio: '9/18' }}>
                              <div className="px-2 py-4 flex flex-col items-center text-center h-full justify-center">
                                <p className="text-[8px] font-bold uppercase tracking-wider" style={{ color: appData.textColor || '#000' }}>{appData.appName || 'APP'}</p>
                                <p className="text-[5px] mb-1.5 opacity-70" style={{ color: appData.textColor || '#000' }}>{appData.developer || 'Developer'}</p>
                                <div className="bg-white/30 rounded-lg p-1 mb-1.5">
                                  {appData.appLogo ? <img src={appData.appLogo} alt="" className="w-8 h-8 object-contain" /> : <span className="text-xl">📱</span>}
                                </div>
                                <p className="text-[7px] font-bold leading-tight" style={{ color: appData.textColor || '#000' }}>{appData.title || 'Download App'}</p>
                                <div className="space-y-0.5 w-full px-2 mt-1">
                                  {appData.iosUrl && <img src="/img/apple-en.png" alt="" className="w-full h-auto rounded" />}
                                  {appData.androidUrl && <img src="/img/google-en.png" alt="" className="w-full h-auto rounded" />}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <a href={`/app/${qrCode.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md text-sm font-medium">
                        <ExternalLink className="w-4 h-4" /> Sayfayı Görüntüle
                      </a>
                    </>
                  )}

                  {/* vCard Tipi - Kartvizit */}
                  {isVCardType && (
                    <>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">👤 Kartvizit</h3>
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">{(vcardData.firstName || '?')[0]?.toUpperCase()}</div>
                          <div>
                            <h4 className="font-bold text-sm">{`${vcardData.firstName || ''} ${vcardData.lastName || ''}`}</h4>
                            {vcardData.title && <p className="text-white/80 text-xs">{vcardData.title}</p>}
                            {vcardData.company && <p className="text-white/70 text-[10px]">{vcardData.company}</p>}
                          </div>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          {vcardData.phone && <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {vcardData.phone}</p>}
                          {vcardData.email && <p className="flex items-center gap-2"><Mail className="w-3 h-3" /> {vcardData.email}</p>}
                          {vcardData.website && <p className="flex items-center gap-2"><Globe className="w-3 h-3" /> {vcardData.website}</p>}
                          {vcardData.address && <p className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {vcardData.address}</p>}
                        </div>
                      </div>
                    </>
                  )}

                  {/* URL Tipi */}
                  {isUrlType && (
                    <>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm"><Globe className="w-4 h-4 text-blue-600" /> Website URL</h3>
                      <div className="bg-white rounded-xl p-4 border-2 border-blue-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"><Globe className="w-6 h-6 text-blue-600" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">Hedef URL</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{urlContent || encodedStr}</p>
                          </div>
                        </div>
                        <a href={urlContent || encodedStr} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          <ExternalLink className="w-4 h-4" /> Siteyi Ziyaret Et
                        </a>
                      </div>
                    </>
                  )}

                  {/* WiFi Tipi */}
                  {isWiFiType && (
                    <>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm"><Wifi className="w-4 h-4 text-green-600" /> WiFi Ağı</h3>
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><Wifi className="w-6 h-6" /></div>
                          <div>
                            <p className="font-bold text-lg">{wifiData.ssid || 'WiFi Ağı'}</p>
                            <p className="text-white/70 text-xs">{wifiData.encryption || 'WPA2'} şifreli</p>
                          </div>
                        </div>
                        {wifiData.password && (
                          <div className="bg-white/20 rounded-lg p-3">
                            <p className="text-[10px] text-white/70 mb-1">Şifre</p>
                            <p className="font-mono text-sm tracking-wider">{wifiData.password}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Text Tipi */}
                  {isTextType && (
                    <>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm"><FileText className="w-4 h-4 text-purple-600" /> Metin</h3>
                      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white">
                        <div className="bg-white/20 rounded-lg p-3">
                          <p className="text-sm whitespace-pre-wrap break-words">{textContent || encodedStr || 'Metin içeriği'}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email Tipi */}
                  {isEmailType && (
                    <>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-red-500" /> E-posta</h3>
                      <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-xl p-4 text-white">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><span className="text-sm font-medium">{emailData.email || 'email@example.com'}</span></div>
                          {emailData.subject && <div className="bg-white/20 rounded-lg p-2"><p className="text-[10px] text-white/70">Konu</p><p className="text-xs">{emailData.subject}</p></div>}
                          {emailData.body && <div className="bg-white/20 rounded-lg p-2"><p className="text-[10px] text-white/70">Mesaj</p><p className="text-xs line-clamp-3">{emailData.body}</p></div>}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Phone Tipi */}
                  {isPhoneType && (
                    <>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-green-600" /> Telefon</h3>
                      <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-xl p-4 text-white text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3"><Phone className="w-8 h-8" /></div>
                        <p className="text-2xl font-bold tracking-wider">{phoneContent || 'Telefon No'}</p>
                        <p className="text-white/70 text-xs mt-2">Tara ve hemen ara</p>
                      </div>
                    </>
                  )}

                  {/* SMS Tipi */}
                  {isSMSType && (
                    <>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm"><MessageSquare className="w-4 h-4 text-blue-500" /> SMS</h3>
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
                        <div className="flex items-center gap-2 mb-3"><Phone className="w-4 h-4" /><span className="font-medium">{smsData.phone || 'Telefon No'}</span></div>
                        {smsData.message && <div className="bg-white/20 rounded-lg p-3"><p className="text-[10px] text-white/70 mb-1">Mesaj</p><p className="text-sm">{smsData.message}</p></div>}
                      </div>
                    </>
                  )}

                  {/* WhatsApp Tipi */}
                  {isWhatsAppType && (
                    <>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm"><MessageSquare className="w-4 h-4 text-green-500" /> WhatsApp</h3>
                      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">💬</div>
                          <div><p className="font-bold">{whatsappData.phone || 'WhatsApp'}</p><p className="text-white/70 text-xs">WhatsApp ile mesaj gönder</p></div>
                        </div>
                        {whatsappData.message && <div className="bg-white/20 rounded-lg p-3"><p className="text-xs">{whatsappData.message}</p></div>}
                      </div>
                    </>
                  )}

                  {/* Event Tipi */}
                  {isEventType && (
                    <>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm"><CalendarDays className="w-4 h-4 text-orange-500" /> Etkinlik</h3>
                      <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-white">
                        <h4 className="font-bold text-lg mb-2">{eventData.title || 'Etkinlik'}</h4>
                        {eventData.location && <p className="flex items-center gap-2 text-sm mb-2"><MapPin className="w-4 h-4" />{eventData.location}</p>}
                        {eventData.startDate && <p className="flex items-center gap-2 text-xs bg-white/20 rounded-lg p-2"><CalendarDays className="w-4 h-4" />{new Date(eventData.startDate).toLocaleString('tr-TR')}</p>}
                        {eventData.description && <p className="text-xs mt-2 text-white/80">{eventData.description}</p>}
                      </div>
                    </>
                  )}

                  {/* Location Tipi */}
                  {isLocationData && (
                    <>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-red-500" /> Konum</h3>
                      <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-xl p-4 text-white text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3"><MapPin className="w-8 h-8" /></div>
                        {locationData.query && <p className="font-medium mb-2">{locationData.query}</p>}
                        {(locationData.latitude && locationData.longitude) && <p className="text-xs text-white/70">{locationData.latitude}, {locationData.longitude}</p>}
                        <a href={`https://maps.google.com/?q=${locationData.latitude || ''},${locationData.longitude || ''}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors">
                          <ExternalLink className="w-4 h-4" /> Haritada Aç
                        </a>
                      </div>
                    </>
                  )}

                  {/* Social Media Tipi */}
                  {isSocialType && (
                    <>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm capitalize">
                        {qrType === 'instagram' && <Instagram className="w-4 h-4 text-pink-500" />}
                        {qrType === 'twitter' && <Twitter className="w-4 h-4 text-blue-400" />}
                        {qrType === 'linkedin' && <Linkedin className="w-4 h-4 text-blue-700" />}
                        {qrType === 'youtube' && <Youtube className="w-4 h-4 text-red-600" />}
                        {qrType === 'facebook' && <Facebook className="w-4 h-4 text-blue-600" />}
                        {qrType}
                      </h3>
                      <div className={`rounded-xl p-4 text-white ${qrType === 'instagram' ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400' : qrType === 'twitter' ? 'bg-blue-400' : qrType === 'linkedin' ? 'bg-blue-700' : qrType === 'youtube' ? 'bg-red-600' : 'bg-blue-600'}`}>
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            {qrType === 'instagram' && <Instagram className="w-8 h-8" />}
                            {qrType === 'twitter' && <Twitter className="w-8 h-8" />}
                            {qrType === 'linkedin' && <Linkedin className="w-8 h-8" />}
                            {qrType === 'youtube' && <Youtube className="w-8 h-8" />}
                            {qrType === 'facebook' && <Facebook className="w-8 h-8" />}
                          </div>
                          <p className="font-bold text-lg">@{socialData.username || 'kullanıcı'}</p>
                          {socialData.url && <a href={socialData.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors"><ExternalLink className="w-4 h-4" /> Profili Aç</a>}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Crypto Tipi */}
                  {isCryptoType && (
                    <>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm"><Bitcoin className="w-4 h-4 text-orange-500" /> Kripto</h3>
                      <div className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl p-4 text-white">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><Bitcoin className="w-6 h-6" /></div>
                          <div><p className="font-bold uppercase">{cryptoData.currency || 'BTC'}</p>{cryptoData.amount && <p className="text-white/70 text-xs">Miktar: {cryptoData.amount}</p>}</div>
                        </div>
                        {cryptoData.address && <div className="bg-white/20 rounded-lg p-2"><p className="text-[10px] text-white/70 mb-1">Cüzdan Adresi</p><p className="text-xs font-mono break-all">{cryptoData.address}</p></div>}
                      </div>
                    </>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

