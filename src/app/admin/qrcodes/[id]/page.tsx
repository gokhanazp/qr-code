// Admin QR Code Detail Page
// QR kod detay sayfası - Supabase ile

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  QrCode,
  Eye,
  Clock,
  Calendar,
  User,
  ExternalLink,
  Link as LinkIcon,
  AlertTriangle,
  CheckCircle,
  Globe,
  Copy
} from 'lucide-react'
import QRManageActions from '@/components/admin/QRManageActions'
import AdminDeleteQRButton from '@/components/admin/AdminDeleteQRButton'

interface PageProps {
  params: Promise<{ id: string }>
}

// Helper: Nesneyi string'e dönüştür (Convert object to string)
function safeString(value: unknown): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (typeof value === 'object') {
    // raw veya encoded varsa onu kullan (use raw or encoded if available)
    const obj = value as Record<string, unknown>
    if (obj.raw && typeof obj.raw === 'string') return obj.raw
    if (obj.encoded && typeof obj.encoded === 'string') return obj.encoded
    // Değilse JSON olarak göster (otherwise show as JSON)
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

export default async function AdminQRCodeDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // QR kod bilgilerini çek (Fetch QR code info)
  const { data: qrCode, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !qrCode) {
    notFound()
  }

  // Kullanıcı bilgilerini çek (Fetch owner info)
  const { data: owner } = await supabase
    .from('profiles')
    .select('id, email, full_name, plan')
    .eq('id', qrCode.user_id)
    .single()

  // Kalan gün hesaplama (Calculate remaining days)
  const getRemainingDays = () => {
    if (!qrCode.expires_at) return null
    const now = new Date()
    const expires = new Date(qrCode.expires_at)
    const diff = expires.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const remainingDays = getRemainingDays()
  const isExpired = remainingDays !== null && remainingDays <= 0

  // QR tipi gösterimi (QR type display)
  const qrTypeLabels: Record<string, string> = {
    url: 'URL / Website',
    text: 'Metin',
    email: 'E-posta',
    phone: 'Telefon',
    sms: 'SMS',
    wifi: 'WiFi',
    vcard: 'vCard / Kartvizit',
    location: 'Konum',
    event: 'Etkinlik',
    app: '📱 App Download',
  }

  // APP tipi için verileri parse et (Parse APP data)
  const isAppType = qrCode.type === 'app'
  let appData: Record<string, unknown> = {}
  if (isAppType && qrCode.content) {
    try {
      const contentObj = qrCode.content as Record<string, unknown>
      // Önce raw'dan al (rawContent olarak kaydediliyor)
      if (contentObj.raw && typeof contentObj.raw === 'object') {
        appData = contentObj.raw as Record<string, unknown>
      }
      // Yoksa encoded JSON string'den parse et
      else if (contentObj.encoded && typeof contentObj.encoded === 'string') {
        appData = JSON.parse(contentObj.encoded)
      }
      // String ise doğrudan parse et
      else if (typeof qrCode.content === 'string') {
        appData = JSON.parse(qrCode.content)
      }
    } catch {
      appData = {}
    }
  }

  // QR içeriğini güvenli şekilde al (Get QR content safely)
  const qrContent = safeString(qrCode.content) !== '-'
    ? safeString(qrCode.content)
    : safeString(qrCode.data)

  return (
    <div className="space-y-6">
      {/* Geri Butonu (Back Button) */}
      <Link
        href="/admin/qrcodes"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        QR Kodlara Dön
      </Link>

      {/* Başlık ve Durum (Header and Status) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* QR Preview */}
            <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-200">
              <QrCode className="w-10 h-10 text-gray-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {qrCode.name || 'İsimsiz QR Kod'}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                  {qrTypeLabels[qrCode.type] || qrCode.type}
                </span>
                {/* Durum Badge (Status Badge) */}
                {isExpired ? (
                  <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm">
                    <AlertTriangle className="w-3 h-3" />
                    Süresi Dolmuş
                  </span>
                ) : remainingDays !== null ? (
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                    remainingDays <= 3 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                  }`}>
                    <Clock className="w-3 h-3" />
                    {remainingDays} gün kaldı
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                    <CheckCircle className="w-3 h-3" />
                    Sınırsız
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* İstatistik Kartları (Stats Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{qrCode.scan_count || 0}</p>
              <p className="text-sm text-gray-500">Toplam Tarama</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {new Date(qrCode.created_at).toLocaleDateString('tr-TR')}
              </p>
              <p className="text-sm text-gray-500">Oluşturulma</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {qrCode.expires_at
                  ? new Date(qrCode.expires_at).toLocaleDateString('tr-TR')
                  : 'Sınırsız'
                }
              </p>
              <p className="text-sm text-gray-500">Son Kullanma</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {qrCode.last_scanned_at
                  ? new Date(qrCode.last_scanned_at).toLocaleDateString('tr-TR')
                  : '-'
                }
              </p>
              <p className="text-sm text-gray-500">Son Tarama</p>
            </div>
          </div>
        </div>
      </div>

      {/* APP Tipi için Telefon Mockup Önizleme */}
      {isAppType && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            📱 App Landing Page Önizleme
          </h2>
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Telefon Mockup */}
            <div className="flex justify-center">
              <div className="relative w-[220px]">
                <div className="relative bg-black rounded-[2rem] p-2 shadow-2xl">
                  <div
                    className="relative rounded-[1.5rem] overflow-hidden"
                    style={{
                      background: `linear-gradient(to bottom, ${appData.secondaryColor || '#a8e6cf'}, ${appData.primaryColor || '#2d8659'})`,
                      aspectRatio: '9/16'
                    }}
                  >
                    {/* Paylaş ikonu */}
                    <div className="absolute top-3 right-3 z-10">
                      <svg className="w-4 h-4 opacity-80" style={{ color: (appData.textColor as string) || '#000000' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </div>

                    <div className="px-3 py-4 flex flex-col items-center text-center h-full">
                      {/* App Name & Developer */}
                      <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5" style={{ color: (appData.textColor as string) || '#000000' }}>
                        {(appData.appName as string) || 'APP NAME'}
                      </p>
                      <p className="text-[8px] mb-3 opacity-70" style={{ color: (appData.textColor as string) || '#000000' }}>
                        {(appData.developer as string) || 'Developer'}
                      </p>

                      {/* Logo */}
                      <div className="bg-white/30 rounded-2xl p-3 mb-3">
                        {appData.appLogo ? (
                          <img src={appData.appLogo as string} alt="Logo" className="max-w-[70px] max-h-[70px] object-contain" />
                        ) : (
                          <span className="text-4xl">📱</span>
                        )}
                      </div>

                      {/* Title */}
                      <p className="text-[10px] font-bold leading-tight mb-1 px-1" style={{ color: (appData.textColor as string) || '#000000' }}>
                        {(appData.title as string) || 'Download Our App!'}
                      </p>

                      {/* HEMEN İNDİR */}
                      <p className="text-[8px] italic mb-2 opacity-60" style={{ color: (appData.textColor as string) || '#000000' }}>HEMEN İNDİR!</p>

                      {/* Store Buttons */}
                      <div className="space-y-1 w-full px-2">
                        {(appData.iosUrl || !appData.androidUrl) && (
                          <img src="/img/apple-en.png" alt="App Store" className="w-full h-auto rounded" />
                        )}
                        {(appData.androidUrl || !appData.iosUrl) && (
                          <img src="/img/google-en.png" alt="Google Play" className="w-full h-auto rounded" />
                        )}
                      </div>

                      {/* Website */}
                      {appData.website && (
                        <p className="text-[7px] mt-auto pt-1 opacity-60" style={{ color: (appData.textColor as string) || '#000000' }}>
                          {(appData.website as string).replace(/^https?:\/\//, '')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* App Bilgileri */}
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">App Adı</p>
                  <p className="text-sm font-medium">{String(appData.appName) || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Geliştirici</p>
                  <p className="text-sm font-medium">{String(appData.developer) || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Başlık</p>
                  <p className="text-sm font-medium">{String(appData.title) || '-'}</p>
                </div>
                {appData.iosUrl && (
                  <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                    <p className="text-xs text-gray-500 mb-1">App Store URL</p>
                    <a href={String(appData.iosUrl)} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                      {String(appData.iosUrl)}
                    </a>
                  </div>
                )}
                {appData.androidUrl && (
                  <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Google Play URL</p>
                    <a href={String(appData.androidUrl)} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                      {String(appData.androidUrl)}
                    </a>
                  </div>
                )}
                {appData.website && (
                  <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Website</p>
                    <a
                      href={String(appData.website).startsWith('http') ? String(appData.website) : `https://${appData.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {String(appData.website)}
                    </a>
                  </div>
                )}
              </div>

              {/* Renk Ayarları */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Renk Şeması</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded border" style={{ backgroundColor: (appData.primaryColor as string) || '#2d8659' }} />
                    <span className="text-xs">Primary</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded border" style={{ backgroundColor: (appData.secondaryColor as string) || '#a8e6cf' }} />
                    <span className="text-xs">Secondary</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded border" style={{ backgroundColor: (appData.textColor as string) || '#000000' }} />
                    <span className="text-xs">Text</span>
                  </div>
                </div>
              </div>

              {/* Landing Page Linki */}
              <a
                href={qrCode.short_url || `/app/${qrCode.id}`}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR İçeriği (QR Content) - APP tipi değilse göster */}
        {!isAppType && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            QR İçeriği
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 break-all">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {qrContent}
            </pre>
          </div>
          {qrCode.short_url && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-1">Kısa URL:</p>
              <div className="flex items-center gap-2">
                <code className="text-sm text-blue-600">{qrCode.short_url}</code>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Sahibi (Owner) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Sahibi
          </h2>
          {owner ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {owner.full_name?.[0]?.toUpperCase() || owner.email?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{owner.full_name || 'İsimsiz'}</p>
                  <p className="text-sm text-gray-500">{owner.email}</p>
                </div>
              </div>
              <Link
                href={`/admin/users/${owner.id}`}
                className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Profili Gör
              </Link>
            </div>
          ) : (
            <p className="text-gray-500">Kullanıcı bulunamadı</p>
          )}
        </div>
      </div>

      {/* QR Kod Yönetimi - Aktif/Pasif ve Süre Uzatma (QR Management) */}
      <QRManageActions
        qrId={qrCode.id}
        isActive={qrCode.is_active ?? true}
        expiresAt={qrCode.expires_at}
      />

      {/* Tehlikeli İşlemler (Dangerous Actions) */}
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Tehlikeli Bölge
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Bu işlemler geri alınamaz. QR kodu sildiğinizde tüm tarama verileri de silinecek.
        </p>
        <AdminDeleteQRButton qrId={qrCode.id} qrName={qrCode.name} />
      </div>

      {/* Ayarlar (Settings) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">QR Kod Ayarları</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Ön Plan Rengi</p>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: qrCode.foreground_color || '#000000' }}
              />
              <span className="text-sm font-mono">{qrCode.foreground_color || '#000000'}</span>
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Arka Plan Rengi</p>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: qrCode.background_color || '#FFFFFF' }}
              />
              <span className="text-sm font-mono">{qrCode.background_color || '#FFFFFF'}</span>
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Logo</p>
            <span className="text-sm">{qrCode.logo_url ? 'Var' : 'Yok'}</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Hata Düzeltme</p>
            <span className="text-sm">{qrCode.error_correction || 'M'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

