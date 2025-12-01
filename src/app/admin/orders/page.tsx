// Admin Orders Page
// Sipariş yönetimi sayfası

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Filter,
  Search,
  Eye
} from 'lucide-react'
import OrderStatusButton from './OrderStatusButton'

// Sayfa parametreleri için tip
interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const params = await searchParams
  const statusFilter = params.status

  // Siparişleri çek (Fetch orders)
  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data: orders } = await query

  // İstatistikler (Stats)
  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter(o => o.status === 'pending').length || 0,
    completed: orders?.filter(o => o.status === 'completed').length || 0,
    cancelled: orders?.filter(o => o.status === 'cancelled').length || 0,
  }

  // Toplam gelir (Total revenue)
  const totalRevenue = orders
    ?.filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + Number(o.amount), 0) || 0

  // Durum renkleri (Status colors)
  const statusColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
    completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
    refunded: { bg: 'bg-purple-100', text: 'text-purple-700', icon: XCircle },
  }

  // Durum Türkçe karşılıkları (Status Turkish labels)
  const statusLabels: Record<string, string> = {
    pending: 'Bekliyor',
    completed: 'Tamamlandı',
    cancelled: 'İptal',
    refunded: 'İade',
  }

  return (
    <div>
      {/* Başlık ve İstatistikler (Header and Stats) */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Siparişler</h1>
          <p className="text-gray-500 mt-1">Paket yükseltme siparişlerini yönetin</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">Toplam Gelir</p>
            <p className="text-xl font-bold text-green-700">₺{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Durum Kartları (Status Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Link
          href="/admin/orders"
          className={`p-4 rounded-xl border transition-colors ${
            !statusFilter ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Toplam</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-gray-400" />
          </div>
        </Link>
        <Link
          href="/admin/orders?status=pending"
          className={`p-4 rounded-xl border transition-colors ${
            statusFilter === 'pending' ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200 hover:border-yellow-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Bekleyen</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </Link>
        <Link
          href="/admin/orders?status=completed"
          className={`p-4 rounded-xl border transition-colors ${
            statusFilter === 'completed' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-green-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tamamlanan</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </Link>
        <Link
          href="/admin/orders?status=cancelled"
          className={`p-4 rounded-xl border transition-colors ${
            statusFilter === 'cancelled' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200 hover:border-red-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">İptal</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </Link>
      </div>

      {/* Sipariş Tablosu (Orders Table) */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Sipariş</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Kullanıcı</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Plan Değişikliği</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Tutar</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Durum</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(orders || []).map((order) => {
                const status = statusColors[order.status] || statusColors.pending
                const StatusIcon = status.icon
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900 font-mono text-sm">
                          #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-900">{order.user_name || 'İsimsiz'}</p>
                      <p className="text-sm text-gray-500">{order.user_email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {order.from_plan}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {order.to_plan}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-gray-900">₺{Number(order.amount).toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <OrderStatusButton orderId={order.id} currentStatus={order.status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Boş durum (Empty state) */}
        {(!orders || orders.length === 0) && (
          <div className="py-12 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Henüz sipariş yok</p>
          </div>
        )}
      </div>
    </div>
  )
}

