// Admin Users Page
// Kullanıcı yönetimi sayfası (Supabase ile)

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Search,
  Eye,
  QrCode,
  Clock,
  Users,
  Crown,
  Building2,
  Zap
} from 'lucide-react'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // Tüm kullanıcıları ve QR kodlarını çek
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Her kullanıcı için QR kod sayısını al
  const usersWithQRCount = await Promise.all(
    (users || []).map(async (user) => {
      const { count } = await supabase
        .from('qr_codes')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)

      // Süresi dolmamış aktif QR sayısı
      const { count: activeCount } = await supabase
        .from('qr_codes')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

      return {
        ...user,
        qr_count: count || 0,
        active_qr_count: activeCount || 0,
      }
    })
  )

  // Plan ikonları (Plan icons)
  const planIcons: Record<string, React.ElementType> = {
    free: Zap,
    pro: Crown,
    enterprise: Building2,
  }

  // Plan renkleri (Plan colors)
  const planColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-700',
    pro: 'bg-blue-100 text-blue-700',
    enterprise: 'bg-purple-100 text-purple-700',
  }

  return (
    <div>
      {/* Başlık (Header) */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kullanıcılar</h1>
          <p className="text-gray-500 mt-1">Tüm kayıtlı kullanıcıları yönetin</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
            <Users className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-900">{usersWithQRCount.length}</span>
            <span className="text-gray-500">kullanıcı</span>
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
              placeholder="Kullanıcı ara (isim veya e-posta)..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Tüm Planlar</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Kullanıcı Tablosu (Users Table) */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Kullanıcı</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Plan</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">QR Kodları</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Kayıt Tarihi</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usersWithQRCount.map((user) => {
                const PlanIcon = planIcons[user.plan || 'free'] || Zap
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name || 'İsimsiz'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${planColors[user.plan || 'free']}`}>
                        <PlanIcon className="w-3 h-3" />
                        {(user.plan || 'free').charAt(0).toUpperCase() + (user.plan || 'free').slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-gray-900">
                          <QrCode className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{user.qr_count}</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-600 text-sm">
                          <Clock className="w-3 h-3" />
                          <span>{user.active_qr_count} aktif</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Detay
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Boş durum (Empty state) */}
        {usersWithQRCount.length === 0 && (
          <div className="py-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Henüz kayıtlı kullanıcı yok</p>
          </div>
        )}
      </div>
    </div>
  )
}

