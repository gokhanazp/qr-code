'use client'

// Admin Sidebar Component
// Mobilde hamburger menü, masaüstünde sabit sidebar

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  QrCode,
  CreditCard,
  Settings,
  MessageSquare,
  ShoppingCart,
  DollarSign,
  Shield,
  LogOut,
  Menu,
  X,
  ExternalLink
} from 'lucide-react'

// Admin sidebar menü öğeleri
const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Kullanıcılar', icon: Users },
  { href: '/admin/qrcodes', label: 'QR Kodları', icon: QrCode },
  { href: '/admin/orders', label: 'Siparişler', icon: ShoppingCart },
  { href: '/admin/messages', label: 'Mesajlar', icon: MessageSquare },
  { href: '/admin/pricing', label: 'Fiyatlandırma', icon: DollarSign },
  { href: '/admin/subscriptions', label: 'Abonelikler', icon: CreditCard },
  { href: '/admin/settings', label: 'Ayarlar', icon: Settings },
]

interface AdminSidebarProps {
  userEmail: string
  userRole: string
}

export default function AdminSidebar({ userEmail, userRole }: AdminSidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Aktif sayfa kontrolü
  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  // Sidebar içeriği (hem mobil hem masaüstü için ortak)
  const SidebarContent = () => (
    <>
      {/* Logo / Başlık */}
      <div className="p-4 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
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
      <nav className="mt-4 px-3 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Alt kısım - Kullanıcı bilgisi ve çıkış */}
      <div className="border-t border-gray-800 mt-auto">
        {/* Kullanıcı bilgisi */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
              {userEmail?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userEmail}</p>
              <p className="text-xs text-gray-400">{userRole === 'super_admin' ? 'Süper Admin' : 'Admin'}</p>
            </div>
          </div>
        </div>

        {/* Linkler */}
        <div className="p-4 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Siteyi Görüntüle
          </Link>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
              Çıkış Yap
            </button>
          </form>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobil Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center justify-between p-3">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold">Admin</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobil Menü Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobil Sidebar */}
      <aside className={`lg:hidden fixed top-14 left-0 bottom-0 w-72 bg-gray-900 z-50 transform transition-transform duration-300 flex flex-col ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </aside>

      {/* Masaüstü Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-gray-900 min-h-screen fixed left-0 top-0 z-50">
        <SidebarContent />
      </aside>
    </>
  )
}

