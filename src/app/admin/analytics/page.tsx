// Admin Analytics Page
// Site geneli analitik verileri

import { createClient } from '@/lib/supabase/server'
import {
  BarChart3,
  TrendingUp,
  Eye,
  QrCode,
  Users,
  Calendar,
  Globe,
  Smartphone
} from 'lucide-react'

// İstatistik kartı bileşeni
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color,
  change
}: { 
  title: string
  value: number | string
  icon: React.ElementType
  color: 'blue' | 'green' | 'purple' | 'orange'
  change?: string
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${colors[color]} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {change && (
          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            {change}
          </span>
        )}
      </div>
    </div>
  )
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Toplam kullanıcı ve QR kod sayıları
  const [usersResult, qrCodesResult, recentUsersResult, recentQRResult] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('qr_codes').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString()),
    supabase.from('qr_codes').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString()),
  ])

  // QR kod türlerine göre dağılım
  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select('type, scan_count')

  // Toplam tarama sayısı
  const totalScans = qrCodes?.reduce((sum, qr) => sum + (qr.scan_count || 0), 0) || 0

  // Tür bazında dağılım
  const typeDistribution = qrCodes?.reduce((acc, qr) => {
    acc[qr.type] = (acc[qr.type] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // En popüler QR türleri
  const sortedTypes = Object.entries(typeDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const stats = {
    totalUsers: usersResult.count || 0,
    totalQRCodes: qrCodesResult.count || 0,
    totalScans,
    recentUsers: recentUsersResult.count || 0,
    recentQRCodes: recentQRResult.count || 0,
  }

  // QR türü etiketleri
  const typeLabels: Record<string, string> = {
    url: 'URL',
    vcard: 'vCard',
    wifi: 'WiFi',
    text: 'Metin',
    email: 'E-posta',
    phone: 'Telefon',
    sms: 'SMS',
    location: 'Konum',
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Analitik</h1>
      <p className="text-gray-600 mb-8">Site geneli istatistikler ve analizler</p>

      {/* Ana istatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Toplam Kullanıcı" value={stats.totalUsers} icon={Users} color="blue" change={`+${stats.recentUsers} (30 gün)`} />
        <StatCard title="Toplam QR Kod" value={stats.totalQRCodes} icon={QrCode} color="green" change={`+${stats.recentQRCodes} (30 gün)`} />
        <StatCard title="Toplam Tarama" value={stats.totalScans.toLocaleString('tr-TR')} icon={Eye} color="purple" />
        <StatCard title="Ort. Tarama/QR" value={stats.totalQRCodes > 0 ? Math.round(stats.totalScans / stats.totalQRCodes) : 0} icon={TrendingUp} color="orange" />
      </div>

      {/* QR Kod türleri dağılımı */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">QR Kod Türleri Dağılımı</h2>
          <div className="space-y-4">
            {sortedTypes.length > 0 ? sortedTypes.map(([type, count]) => {
              const percentage = stats.totalQRCodes > 0 ? Math.round((count / stats.totalQRCodes) * 100) : 0
              return (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{typeLabels[type] || type}</span>
                    <span className="font-medium">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            }) : (
              <p className="text-gray-500 text-center py-4">Henüz veri yok</p>
            )}
          </div>
        </div>

        {/* Özet kartı */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Özet</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">Son 30 günde yeni kullanıcı</span>
              </div>
              <span className="font-bold text-blue-600">{stats.recentUsers}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <QrCode className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Son 30 günde oluşturulan QR</span>
              </div>
              <span className="font-bold text-green-600">{stats.recentQRCodes}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-purple-600" />
                <span className="text-gray-700">En popüler QR türü</span>
              </div>
              <span className="font-bold text-purple-600">{sortedTypes[0] ? typeLabels[sortedTypes[0][0]] || sortedTypes[0][0] : '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

