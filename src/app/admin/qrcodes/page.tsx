// Admin QR Codes Page
// QR Kod yönetimi sayfası (Supabase ile)

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  QrCode,
  Clock,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Eye,
  Search,
  Filter,
  Star
} from 'lucide-react'
import FeaturedToggle from '@/components/admin/FeaturedToggle'

// Sayfa parametreleri için tip
interface PageProps {
  searchParams: Promise<{ filter?: string }>
}

export default async function AdminQRCodesPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const params = await searchParams
  const filter = params.filter
  const now = new Date()

  // QR kodları kullanıcı bilgileriyle birlikte çek
  let query = supabase
    .from('qr_codes')
    .select(`
      *,
      profile:profiles(id, email, full_name, plan)
    `)
    .order('created_at', { ascending: false })

  // Filtre uygula (Apply filter)
  if (filter === 'expired') {
    query = query.lt('expires_at', now.toISOString())
  } else if (filter === 'active') {
    query = query.or(`expires_at.is.null,expires_at.gt.${now.toISOString()}`)
  }

  const { data: qrCodes } = await query

  // İstatistikleri hesapla (Calculate stats)
  const totalQR = qrCodes?.length || 0
  const expiredQR = qrCodes?.filter(qr => qr.expires_at && new Date(qr.expires_at) < now).length || 0
  const activeQR = totalQR - expiredQR

  // Kalan gün hesapla (Calculate remaining days)
  const getRemainingDays = (expiresAt: string | null) => {
    if (!expiresAt) return null
    const expires = new Date(expiresAt)
    const diffTime = expires.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // QR tip renkleri (QR type colors)
  const typeColors: Record<string, string> = {
    url: 'bg-blue-100 text-blue-700',
    vcard: 'bg-purple-100 text-purple-700',
    wifi: 'bg-green-100 text-green-700',
    text: 'bg-gray-100 text-gray-700',
    email: 'bg-yellow-100 text-yellow-700',
    phone: 'bg-orange-100 text-orange-700',
    sms: 'bg-pink-100 text-pink-700',
  }

  return (
    <div>
      {/* Başlık ve İstatistikler (Header and Stats) */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">QR Kodları</h1>
          <p className="text-gray-500 mt-1">Tüm QR kodlarını yönetin</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
            <QrCode className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-900">{totalQR}</span>
            <span className="text-gray-500">toplam</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium text-green-700">{activeQR}</span>
            <span className="text-green-600">aktif</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="font-medium text-red-700">{expiredQR}</span>
            <span className="text-red-600">süresi dolmuş</span>
          </div>
        </div>
      </div>

      {/* Arama ve Filtreler (Search and Filters) */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="QR kod ara (isim, tip veya kullanıcı)..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <Link
              href="/admin/qrcodes"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !filter ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tümü
            </Link>
            <Link
              href="/admin/qrcodes?filter=active"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'active' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Aktif
            </Link>
            <Link
              href="/admin/qrcodes?filter=expired"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'expired' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Süresi Dolmuş
            </Link>
          </div>
        </div>
      </div>

      {/* QR Kodları Tablosu (QR Codes Table) */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">QR Kod</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Kullanıcı</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Tip</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Tarama</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Durum</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(qrCodes || []).map((qr) => {
                const remainingDays = getRemainingDays(qr.expires_at)
                const isExpired = remainingDays !== null && remainingDays < 0
                const profile = qr.profile as { email: string; full_name: string | null; plan: string } | null
                
                return (
                  <tr key={qr.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <QrCode className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{qr.name || qr.short_code}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(qr.created_at).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {profile ? (
                        <Link 
                          href={`/admin/users/${qr.user_id}`}
                          className="hover:text-blue-600"
                        >
                          <p className="font-medium text-gray-900">{profile.full_name || 'İsimsiz'}</p>
                          <p className="text-sm text-gray-500">{profile.email}</p>
                        </Link>
                      ) : (
                        <span className="text-gray-400">Bilinmiyor</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[qr.type] || 'bg-gray-100 text-gray-700'}`}>
                        {qr.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">{qr.scan_count || 0}</span>
                    </td>
                    <td className="py-4 px-6">
                      {isExpired ? (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm font-medium">Süresi doldu</span>
                        </div>
                      ) : remainingDays !== null ? (
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">{remainingDays} gün kaldı</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Süresiz</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {/* Featured Toggle - Ana sayfada göster/gizle */}
                        <FeaturedToggle
                          qrId={qr.id}
                          initialFeatured={qr.is_featured || false}
                        />
                        {qr.short_code && (
                          <a
                            href={`/r/${qr.short_code}`}
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="QR'ı Aç"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <Link
                          href={`/admin/qrcodes/${qr.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Detay"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Boş durum (Empty state) */}
        {(!qrCodes || qrCodes.length === 0) && (
          <div className="py-12 text-center">
            <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {filter === 'expired' ? 'Süresi dolmuş QR kod yok' : 'Henüz QR kod yok'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

