// Admin Dashboard
// Yönetici ana paneli (Supabase ile)

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui'
import {
  Users,
  QrCode,
  CreditCard,
  TrendingUp,
  MessageSquare,
  ShoppingCart,
  AlertTriangle,
  Clock
} from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const now = new Date()

  // Paralel sorgularla istatistikleri çek (Fetch stats with parallel queries)
  const [
    usersResult,
    qrCodesResult,
    expiredQRResult,
    messagesResult,
    ordersResult,
    recentUsersResult,
    recentOrdersResult
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('qr_codes').select('id', { count: 'exact' }),
    supabase.from('qr_codes').select('id', { count: 'exact' }).lt('expires_at', now.toISOString()),
    supabase.from('contact_messages').select('id', { count: 'exact' }).eq('is_read', false),
    supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
  ])

  const stats = {
    totalUsers: usersResult.count || 0,
    totalQRCodes: qrCodesResult.count || 0,
    expiredQRCodes: expiredQRResult.count || 0,
    unreadMessages: messagesResult.count || 0,
    pendingOrders: ordersResult.count || 0,
  }

  const recentUsers = recentUsersResult.data || []
  const recentOrders = recentOrdersResult.data || []

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Uyarı kartları - Bekleyen işlemler (Warning cards - Pending actions) */}
      {(stats.unreadMessages > 0 || stats.pendingOrders > 0 || stats.expiredQRCodes > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.unreadMessages > 0 && (
            <Link href="/admin/messages" className="block">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 hover:bg-yellow-100 transition-colors">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">{stats.unreadMessages} okunmamış mesaj</span>
                </div>
              </div>
            </Link>
          )}
          {stats.pendingOrders > 0 && (
            <Link href="/admin/orders" className="block">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 hover:bg-blue-100 transition-colors">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">{stats.pendingOrders} bekleyen sipariş</span>
                </div>
              </div>
            </Link>
          )}
          {stats.expiredQRCodes > 0 && (
            <Link href="/admin/qrcodes?filter=expired" className="block">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 hover:bg-red-100 transition-colors">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-800">{stats.expiredQRCodes} süresi dolmuş QR</span>
                </div>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* İstatistik kartları (Stat cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Toplam Kullanıcı"
          value={stats.totalUsers}
          icon={Users}
          color="blue"
          href="/admin/users"
        />
        <StatCard
          title="Toplam QR Kod"
          value={stats.totalQRCodes}
          icon={QrCode}
          color="green"
          href="/admin/qrcodes"
        />
        <StatCard
          title="Süresi Dolan QR"
          value={stats.expiredQRCodes}
          icon={Clock}
          color="red"
          href="/admin/qrcodes?filter=expired"
        />
        <StatCard
          title="Bekleyen Sipariş"
          value={stats.pendingOrders}
          icon={ShoppingCart}
          color="orange"
          href="/admin/orders"
        />
      </div>

      {/* İki sütunlu bölüm (Two column section) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Son kullanıcılar (Recent users) */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Son Kayıt Olan Kullanıcılar</h2>
            <Link href="/admin/users" className="text-sm text-blue-600 hover:text-blue-700">
              Tümünü Gör →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div key={user.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{user.full_name || 'İsimsiz'}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.plan === 'enterprise'
                        ? 'bg-purple-100 text-purple-700'
                        : user.plan === 'pro'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.plan || 'free'}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(user.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                Henüz kullanıcı yok
              </div>
            )}
          </div>
        </div>

        {/* Son siparişler (Recent orders) */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Son Siparişler</h2>
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700">
              Tümünü Gör →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{order.user_name || order.user_email}</p>
                    <p className="text-sm text-gray-500">
                      {order.from_plan} → {order.to_plan}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">₺{order.amount}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {order.status === 'completed' ? 'Tamamlandı' :
                       order.status === 'pending' ? 'Bekliyor' : 'İptal'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                Henüz sipariş yok
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// İstatistik kart komponenti (Stat card component)
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  href
}: {
  title: string
  value: number
  icon: React.ElementType
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  href?: string
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
  }

  const content = (
    <Card className={href ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}

