// Dashboard - Analytics sayfası
// QR kod tarama istatistiklerini gösterir (Zaman, OS, Ülke, Şehir)
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TrendingUp, Eye, QrCode, Globe, Users } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import AnalyticsCharts from './AnalyticsCharts'

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
    .select('id, scan_count, expires_at')
    .eq('user_id', user.id)

  // Unique tarama sayısı için qr_scans tablosundan al
  const qrCodeIds = qrCodes?.map(qr => qr.id) || []
  const { data: scans } = qrCodeIds.length > 0
    ? await supabase
        .from('qr_scans')
        .select('ip_address')
        .in('qr_code_id', qrCodeIds)
    : { data: [] }

  // Toplam tarama sayısı
  const totalScans = qrCodes?.reduce((acc, qr) => acc + (qr.scan_count || 0), 0) || 0
  const totalQRCodes = qrCodes?.length || 0
  const uniqueIPs = new Set(scans?.map(s => s.ip_address).filter(ip => ip && ip !== 'Unknown') || [])
  const uniqueScans = uniqueIPs.size
  const activeQRs = qrCodes?.filter(qr => !qr.expires_at || new Date(qr.expires_at) > new Date()).length || 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('analytics')}</h1>
          <p className="text-gray-600 mt-1">{t('analyticsDesc')}</p>
        </div>

        {/* Özet Kartları */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('totalQRCodes')}</p>
                <p className="text-xl font-bold text-gray-900">{totalQRCodes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('totalScans')}</p>
                <p className="text-xl font-bold text-gray-900">{totalScans.toLocaleString('tr-TR')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Unique Tarama</p>
                <p className="text-xl font-bold text-gray-900">{uniqueScans.toLocaleString('tr-TR')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('activeQRCodes')}</p>
                <p className="text-xl font-bold text-gray-900">{activeQRs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analitik Grafikler ve Tablolar */}
        <AnalyticsCharts />
      </div>
    </div>
  )
}

