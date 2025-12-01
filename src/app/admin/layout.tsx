// Admin Layout
// Admin paneli için özel layout (Supabase Auth ile)

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  LayoutDashboard,
  Users,
  QrCode,
  CreditCard,
  Settings,
  BarChart3,
  MessageSquare,
  ShoppingCart,
  DollarSign,
  Shield
} from 'lucide-react'

// Admin sidebar menü öğeleri (Admin sidebar menu items)
const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Kullanıcılar', icon: Users },
  { href: '/admin/qrcodes', label: 'QR Kodları', icon: QrCode },
  { href: '/admin/orders', label: 'Siparişler', icon: ShoppingCart },
  { href: '/admin/messages', label: 'Mesajlar', icon: MessageSquare },
  { href: '/admin/pricing', label: 'Fiyatlandırma', icon: DollarSign },
  { href: '/admin/subscriptions', label: 'Abonelikler', icon: CreditCard },
  { href: '/admin/analytics', label: 'Analitik', icon: BarChart3 },
  { href: '/admin/settings', label: 'Ayarlar', icon: Settings },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Supabase ile admin kontrolü (Admin check with Supabase)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // DEV MODE: Geçici olarak admin kontrolü atlanıyor
  // TODO: Production'da bu kısmı kaldırın
  const isDevelopment = process.env.NODE_ENV === 'development'

  if (!user && !isDevelopment) {
    redirect('/auth/login')
  }

  // Admin tablosunu kontrol et (Check admin_users table)
  let adminUser = null
  if (user) {
    const { data } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .single()
    adminUser = data
  }

  // Development modunda admin kontrolü atla
  // Production'da admin değilse dashboard'a yönlendir
  if (!adminUser && !isDevelopment) {
    redirect('/dashboard')
  }

  // Default role for development
  const userRole = adminUser?.role || 'super_admin'

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 min-h-screen fixed left-0 top-0 z-50">
          {/* Logo / Başlık */}
          <div className="p-4 border-b border-gray-800">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">Admin Panel</span>
                <p className="text-xs text-gray-400">{userRole === 'super_admin' ? 'Süper Admin' : 'Admin'}</p>
              </div>
            </Link>
          </div>

          {/* Menü */}
          <nav className="mt-4 px-3">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Alt kısım - Siteyi görüntüle */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 space-y-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Siteyi Görüntüle
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Ana Siteye Dön
            </Link>
          </div>
        </aside>

        {/* Ana içerik */}
        <main className="ml-64 flex-1 p-8 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}

