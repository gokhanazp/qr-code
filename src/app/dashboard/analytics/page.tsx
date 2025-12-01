// Dashboard - Analytics sayfası
// QR kod tarama istatistiklerini gösterir
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BarChart3, TrendingUp, Eye, QrCode, Calendar, Globe } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function AnalyticsPage() {
  const t = await getTranslations('dashboard')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Kullanıcının QR kodlarını ve tarama sayılarını getir
  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', user.id)

  // Toplam tarama sayısı
  const totalScans = qrCodes?.reduce((acc, qr) => acc + (qr.scan_count || 0), 0) || 0
  const totalQRCodes = qrCodes?.length || 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('analytics')}</h1>
          <p className="text-gray-600 mt-1">{t('analyticsDesc')}</p>
        </div>

        {/* Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <QrCode className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('totalQRCodes')}</p>
                <p className="text-2xl font-bold text-gray-900">{totalQRCodes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('totalScans')}</p>
                <p className="text-2xl font-bold text-gray-900">{totalScans}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('avgScans')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalQRCodes > 0 ? Math.round(totalScans / totalQRCodes) : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('activeQRCodes')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {qrCodes?.filter(qr => !qr.expires_at || new Date(qr.expires_at) > new Date()).length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Kod Performans Tablosu */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{t('performance')}</h2>
          </div>

          {qrCodes && qrCodes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Kod</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('qrType')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('scans')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('createdAt')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {qrCodes.map((qr) => {
                    const isExpired = qr.expires_at && new Date(qr.expires_at) < new Date()
                    return (
                      <tr key={qr.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <QrCode className="w-5 h-5 text-gray-400" />
                            <span className="font-medium text-gray-900">{qr.name || qr.short_code}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{qr.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{qr.scan_count || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(qr.created_at).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {isExpired ? t('expired') : t('active')}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t('noQRCodes')}</p>
              <p className="text-sm text-gray-400">{t('noQRCodesDesc')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

