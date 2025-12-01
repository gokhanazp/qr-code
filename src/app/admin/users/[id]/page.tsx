// Admin User Detail Page
// Kullanıcı detay sayfası - Supabase ile

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Mail,
  Calendar,
  QrCode,
  Eye,
  Clock,
  Crown,
  Building2,
  Zap,
  ExternalLink,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Kullanıcı bilgilerini çek (Fetch user info)
  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !user) {
    notFound()
  }

  // Kullanıcının QR kodlarını çek (Fetch user's QR codes)
  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  // İstatistikler (Statistics)
  const totalQRCodes = qrCodes?.length || 0
  const activeQRCodes = qrCodes?.filter(qr => {
    if (!qr.expires_at) return true
    return new Date(qr.expires_at) > new Date()
  }).length || 0
  const expiredQRCodes = totalQRCodes - activeQRCodes
  const totalScans = qrCodes?.reduce((sum, qr) => sum + (qr.scan_count || 0), 0) || 0

  // Plan ikonu ve rengi (Plan icon and color)
  const plan = user.plan || 'free'
  const planConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    free: { icon: Zap, color: 'bg-gray-100 text-gray-600', label: 'Free' },
    pro: { icon: Crown, color: 'bg-blue-100 text-blue-600', label: 'Pro' },
    enterprise: { icon: Building2, color: 'bg-purple-100 text-purple-600', label: 'Enterprise' },
  }
  const { icon: PlanIcon, color: planColor, label: planLabel } = planConfig[plan] || planConfig.free

  // Kalan gün hesaplama (Calculate remaining days)
  const getRemainingDays = (expiresAt: string | null) => {
    if (!expiresAt) return null
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-6">
      {/* Geri Butonu (Back Button) */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kullanıcılara Dön
      </Link>

      {/* Kullanıcı Başlık Kartı (User Header Card) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.full_name || 'İsimsiz Kullanıcı'}
              </h1>
              <div className="flex items-center gap-2 text-gray-500 mt-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </div>
              <div className="flex items-center gap-2 text-gray-500 mt-1">
                <Calendar className="w-4 h-4" />
                Kayıt: {new Date(user.created_at).toLocaleDateString('tr-TR')}
              </div>
            </div>
          </div>
          {/* Plan Badge */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${planColor}`}>
            <PlanIcon className="w-5 h-5" />
            <span className="font-medium">{planLabel}</span>
          </div>
        </div>
      </div>

      {/* İstatistik Kartları (Stats Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <QrCode className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalQRCodes}</p>
              <p className="text-sm text-gray-500">Toplam QR</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeQRCodes}</p>
              <p className="text-sm text-gray-500">Aktif QR</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{expiredQRCodes}</p>
              <p className="text-sm text-gray-500">Süresi Dolmuş</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalScans}</p>
              <p className="text-sm text-gray-500">Toplam Tarama</p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Kodları Listesi (QR Codes List) */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">QR Kodları</h2>
        </div>

        {qrCodes && qrCodes.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {qrCodes.map((qr) => {
              const remainingDays = getRemainingDays(qr.expires_at)
              const isExpired = remainingDays !== null && remainingDays <= 0

              return (
                <div key={qr.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* QR Thumbnail */}
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <QrCode className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{qr.name || 'İsimsiz QR'}</p>
                        <p className="text-sm text-gray-500">{qr.type || 'url'} • {qr.scan_count || 0} tarama</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Süre Durumu (Duration Status) */}
                      {remainingDays !== null && (
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                          isExpired
                            ? 'bg-red-100 text-red-600'
                            : remainingDays <= 3
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-green-100 text-green-600'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {isExpired ? 'Süresi Doldu' : `${remainingDays} gün`}
                        </div>
                      )}
                      {remainingDays === null && (
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-600">
                          <Clock className="w-3 h-3" />
                          Sınırsız
                        </div>
                      )}
                      {/* Detay Linki (Detail Link) */}
                      <Link
                        href={`/admin/qrcodes/${qr.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <QrCode className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Bu kullanıcının henüz QR kodu yok</p>
          </div>
        )}
      </div>
    </div>
  )
}

