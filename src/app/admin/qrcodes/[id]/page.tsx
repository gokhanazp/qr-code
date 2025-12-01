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

interface PageProps {
  params: Promise<{ id: string }>
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
  }

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR İçeriği (QR Content) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            QR İçeriği
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 break-all">
            <code className="text-sm text-gray-700">{qrCode.content || qrCode.data || '-'}</code>
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

