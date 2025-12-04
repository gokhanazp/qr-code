// Admin Settings Page
// Admin paneli ayarları

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import {
  Settings,
  Shield,
  Users,
  Bell,
  Database,
  Globe,
  Lock,
  Mail,
  Sliders,
  QrCode
} from 'lucide-react'
import LanguageSelector from './LanguageSelector'
import PlanLimitsEditor from './PlanLimitsEditor'
import CurrencySelector from '@/components/admin/CurrencySelector'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const cookieStore = await cookies()

  // Mevcut dili al (Get current locale from cookie)
  const currentLocale = cookieStore.get('NEXT_LOCALE')?.value || 'tr'

  // Para birimi ayarını al (Get currency setting)
  const { data: currencySetting } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'currency')
    .single()

  const currentCurrency = currencySetting?.value || 'TRY'

  // Admin kullanıcılarını getir
  const { data: adminUsers } = await supabase
    .from('admin_users')
    .select('*, profile:profiles(email, full_name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Ayarlar</h1>
      <p className="text-gray-600 mb-8">Admin paneli ve site ayarları</p>

      {/* Plan Limitleri - Üst kısımda tam genişlikte */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Sliders className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Plan Limitleri</h2>
            <p className="text-sm text-gray-500">Kullanıcı planlarına göre QR kod limitleri ve özellikleri</p>
          </div>
        </div>
        <PlanLimitsEditor />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Kullanıcıları */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Admin Kullanıcıları</h2>
              <p className="text-sm text-gray-500">Yönetici erişimi olan kullanıcılar</p>
            </div>
          </div>

          <div className="space-y-3">
            {adminUsers && adminUsers.length > 0 ? (
              adminUsers.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{admin.profile?.full_name || 'İsimsiz'}</p>
                    <p className="text-sm text-gray-500">{admin.profile?.email}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    admin.role === 'super_admin' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {admin.role === 'super_admin' ? 'Süper Admin' : 'Admin'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Admin kullanıcı bulunamadı</p>
            )}
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Not:</strong> Yeni admin eklemek için Supabase SQL Editor kullanın:
            </p>
            <code className="text-xs text-yellow-700 block mt-2">
              INSERT INTO admin_users (user_id, role) VALUES (&apos;USER_ID&apos;, &apos;admin&apos;);
            </code>
          </div>
        </div>

        {/* Dil Ayarları - Client Component */}
        <LanguageSelector currentLocale={currentLocale} />

        {/* Para Birimi Ayarları - Client Component */}
        <CurrencySelector currentCurrency={currentCurrency} />

        {/* Site Ayarları */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Site Ayarları</h2>
              <p className="text-sm text-gray-500">Genel site yapılandırması</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Adı</label>
              <input
                type="text"
                defaultValue="QR Code Generator"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site URL</label>
              <input
                type="text"
                defaultValue="https://qrcodegenerator.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled
              />
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            * Site ayarları şu anda salt okunur moddadır. Değişiklikler için kod tabanını düzenleyin.
          </p>
        </div>

        {/* Veritabanı Bilgisi */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Veritabanı</h2>
              <p className="text-sm text-gray-500">Supabase bağlantı durumu</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Bağlantı Durumu</span>
              <span className="flex items-center gap-2 text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Bağlı
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Sağlayıcı</span>
              <span className="font-medium text-gray-900">Supabase</span>
            </div>
          </div>
        </div>

        {/* Güvenlik */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Güvenlik</h2>
              <p className="text-sm text-gray-500">Güvenlik ayarları ve bilgileri</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Row Level Security</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Aktif</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">SSL/TLS</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Aktif</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

