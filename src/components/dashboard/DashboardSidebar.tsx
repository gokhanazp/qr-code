'use client'

// Dashboard Sidebar Component
// Çoklu dil desteği ile sidebar menü
// Scroll durumuna göre dinamik pozisyonlama

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  QrCode,
  CreditCard,
  Settings,
  BarChart3,
  Plus
} from 'lucide-react'

export default function DashboardSidebar() {
  const t = useTranslations('dashboard.sidebar')
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  // Scroll durumunu izle (Header ile senkronize)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll() // İlk değeri ayarla
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Dashboard sidebar menü öğeleri (çeviri anahtarları ile)
  const menuItems = [
    { href: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
    { href: '/dashboard/qr', labelKey: 'myQRCodes', icon: QrCode },
    { href: '/dashboard/analytics', labelKey: 'analytics', icon: BarChart3 },
    { href: '/dashboard/subscription', labelKey: 'subscription', icon: CreditCard },
    { href: '/settings', labelKey: 'settings', icon: Settings },
  ]

  // Aktif menü öğesini kontrol et
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  // Scroll edildiğinde top-bar kaybolur, header kalır
  // top-bar: 40px (h-10), header: 64px (h-16)
  // Scroll edilmemişken: 40 + 64 = 104px
  // Scroll edildiğinde: 64px (sadece header)
  const topOffset = scrolled ? 'top-16' : 'top-[104px]'

  return (
    <aside className={`w-64 bg-white border-r border-gray-200 fixed left-0 ${topOffset} bottom-0 overflow-y-auto z-40 transition-all duration-300`}>
      <div className="p-4">
        <Link href="/qr-generator">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5" />
            <span>{t('createQRCode')}</span>
          </button>
        </Link>
      </div>
      <nav className="px-4 pb-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${active ? 'text-blue-600' : ''}`} />
                  <span>{t(item.labelKey)}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

