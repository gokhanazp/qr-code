// Admin Subscriptions Page
// Abonelik yönetimi sayfası

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  CreditCard,
  Crown,
  Building2,
  Zap,
  Users,
  Calendar,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'

// Abonelik istatistik kartı bileşeni
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color,
  subtext 
}: { 
  title: string
  value: number | string
  icon: React.ElementType
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  subtext?: string
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${colors[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
        </div>
      </div>
    </div>
  )
}

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient()

  // Kullanıcıları plan bazında getir
  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, full_name, plan, created_at')
    .order('created_at', { ascending: false })

  // Plan istatistikleri
  const stats = {
    total: users?.length || 0,
    free: users?.filter(u => u.plan === 'free' || !u.plan).length || 0,
    pro: users?.filter(u => u.plan === 'pro').length || 0,
    enterprise: users?.filter(u => u.plan === 'enterprise').length || 0,
  }

  // Plan badge bileşeni
  const PlanBadge = ({ plan }: { plan: string | null }) => {
    const planConfig: Record<string, { bg: string; text: string; icon: React.ElementType; label: string }> = {
      free: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Zap, label: 'Free' },
      pro: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Crown, label: 'Pro' },
      enterprise: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Building2, label: 'Enterprise' },
    }
    const config = planConfig[plan || 'free'] || planConfig.free
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Abonelik Yönetimi</h1>
      <p className="text-gray-600 mb-8">Kullanıcı aboneliklerini görüntüleyin ve yönetin</p>

      {/* İstatistik kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Toplam Kullanıcı" value={stats.total} icon={Users} color="blue" />
        <StatCard title="Free Plan" value={stats.free} icon={Zap} color="green" subtext={`%${stats.total > 0 ? Math.round((stats.free / stats.total) * 100) : 0}`} />
        <StatCard title="Pro Plan" value={stats.pro} icon={Crown} color="purple" subtext={`%${stats.total > 0 ? Math.round((stats.pro / stats.total) * 100) : 0}`} />
        <StatCard title="Enterprise" value={stats.enterprise} icon={Building2} color="orange" subtext={`%${stats.total > 0 ? Math.round((stats.enterprise / stats.total) * 100) : 0}`} />
      </div>

      {/* Abonelik listesi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Tüm Abonelikler</h2>
          <Link href="/admin/pricing" className="text-sm text-blue-600 hover:text-blue-700">
            Fiyatları Düzenle →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kayıt Tarihi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name || 'İsimsiz'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <PlanBadge plan={user.plan} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/admin/users?id=${user.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Detay
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Henüz kullanıcı bulunmuyor
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

