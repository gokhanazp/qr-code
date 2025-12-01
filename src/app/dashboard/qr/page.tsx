// Dashboard - QR Kodlarım sayfası
// Kullanıcının oluşturduğu tüm QR kodlarını listeler
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { QrCode, Plus, ExternalLink, Trash2, Calendar, Eye } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function MyQRCodesPage() {
  const t = await getTranslations('dashboard')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Kullanıcının QR kodlarını getir
  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Kalan gün hesaplama fonksiyonu
  const getRemainingDays = (expiresAt: string | null) => {
    if (!expiresAt) return null
    const now = new Date()
    const expires = new Date(expiresAt)
    const diffTime = expires.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('myQRCodes')}</h1>
            <p className="text-gray-600 mt-1">{t('myQRCodesDesc')}</p>
          </div>
          <Link
            href="/qr-generator/url"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('newQRCode')}
          </Link>
        </div>

        {/* QR Kod Listesi */}
        {qrCodes && qrCodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qrCodes.map((qr) => {
              const remainingDays = getRemainingDays(qr.expires_at)
              const isExpired = remainingDays !== null && remainingDays <= 0
              
              return (
                <div
                  key={qr.id}
                  className={`bg-white rounded-xl shadow-sm border p-6 ${
                    isExpired ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  {/* QR Kod Önizleme */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {qr.name || qr.type}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">{qr.type}</p>
                    </div>
                  </div>

                  {/* Süre Bilgisi */}
                  {remainingDays !== null && (
                    <div className={`flex items-center gap-2 text-sm mb-4 ${
                      isExpired ? 'text-red-600' : remainingDays <= 3 ? 'text-orange-600' : 'text-gray-600'
                    }`}>
                      <Calendar className="w-4 h-4" />
                      {isExpired ? (
                        <span>{t('expired')}</span>
                      ) : (
                        <span>{remainingDays} {t('daysLeft')}</span>
                      )}
                    </div>
                  )}

                  {/* İstatistikler */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{qr.scan_count || 0} {t('scans')}</span>
                    </div>
                  </div>

                  {/* Aksiyonlar */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/qr/${qr.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t('view')}
                    </Link>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={t('delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noQRCodes')}</h3>
            <p className="text-gray-500 mb-6">{t('noQRCodesDesc')}</p>
            <Link
              href="/qr-generator/url"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('createNew')}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

