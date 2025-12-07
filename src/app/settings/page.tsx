// Ayarlar sayfası
// Kullanıcı profil ve hesap ayarları
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, Lock, Bell, Shield, CreditCard, Trash2 } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import DeleteAccountButton from '@/components/settings/DeleteAccountButton'

export default async function SettingsPage() {
  const t = await getTranslations('dashboard')
  const tCommon = await getTranslations('common')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('settings')}</h1>
          <p className="text-gray-600 mt-1">{t('settingsDesc')}</p>
        </div>

        {/* Profil Bölümü */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('profileInfo')}</h2>
              <p className="text-sm text-gray-500">{t('profileInfoDesc')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('fullName')}</label>
              <input
                type="text"
                defaultValue={user.user_metadata?.full_name || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('fullName')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">{user.email}</span>
              </div>
            </div>
          </div>

          <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            {tCommon('save')}
          </button>
        </div>

        {/* Güvenlik Bölümü */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('security')}</h2>
              <p className="text-sm text-gray-500">{t('securityDesc')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <button className="flex items-center gap-3 w-full px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Lock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{t('changePassword')}</p>
                <p className="text-sm text-gray-500">{t('securityDesc')}</p>
              </div>
            </button>
          </div>
        </div>

        {/* Bildirimler Bölümü */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('notifications')}</h2>
              <p className="text-sm text-gray-500">{t('notificationsDesc')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-gray-700">{t('emailNotificationsDesc')}</span>
              <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700">{t('marketingEmailsDesc')}</span>
              <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
            </label>
          </div>
        </div>

        {/* Abonelik Bölümü */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('subscription')}</h2>
              <p className="text-sm text-gray-500">{t('subscriptionDesc')}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">{t('freePlan')}</p>
              <p className="text-sm text-gray-500">2 QR, {t('tenDays')}</p>
            </div>
            <a
              href="/pricing"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
            >
              {t('upgradePlan')}
            </a>
          </div>
        </div>

        {/* Hesabı Sil Bölümü (Delete Account Section) */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Hesabı Sil</h2>
              <p className="text-sm text-gray-500">Hesabınızı ve tüm verilerinizi kalıcı olarak silin</p>
            </div>
          </div>

          <div className="p-4 bg-red-50 rounded-lg mb-4">
            <p className="text-sm text-red-600">
              <strong>Uyarı:</strong> Hesabınızı sildiğinizde tüm QR kodlarınız, tarama verileri ve hesap bilgileriniz kalıcı olarak silinecektir. Bu işlem geri alınamaz.
            </p>
          </div>

          <DeleteAccountButton />
        </div>
      </div>
    </div>
  )
}

