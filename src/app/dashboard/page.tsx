// Dashboard Sayfası
// Supabase Auth ile kullanıcı paneli

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { QrCode, BarChart3, Clock, Plus, ExternalLink, Eye, LogOut } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui'

export default async function DashboardPage() {
  // Supabase client oluştur
  const supabase = await createClient()

  // Oturum kontrolü
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const t = await getTranslations('dashboard')

  // Kullanıcı profilini çek
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Kullanıcının QR kodlarını çek
  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Abonelik bilgisini çek
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // İstatistikler
  const qrList = qrCodes || []
  const totalScans = qrList.reduce((sum, qr) => sum + (qr.scan_count || 0), 0)
  const activeQRCodes = qrList.filter(qr => qr.is_active).length

  // Abonelik kalan gün hesaplama
  const daysRemaining = subscription?.current_period_end
    ? Math.max(0, Math.ceil((new Date(subscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  // Kullanıcı adı
  const userName = profile?.full_name || user.user_metadata?.full_name || user.email

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hoşgeldin mesajı */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-600 mt-1">
              {t('welcome')}, {userName}
            </p>
          </div>
          <form action="/auth/signout" method="POST">
            <Button type="submit" variant="outline" leftIcon={<LogOut className="w-4 h-4" />}>
              Çıkış Yap
            </Button>
          </form>
        </div>

        {/* İstatistik kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Toplam QR Kodlar */}
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <QrCode className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('myQRCodes')}</p>
                <p className="text-2xl font-bold text-gray-900">{qrList.length}</p>
              </div>
            </CardContent>
          </Card>

          {/* Toplam Tarama */}
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 bg-green-100 rounded-xl">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('totalScans')}</p>
                <p className="text-2xl font-bold text-gray-900">{totalScans}</p>
              </div>
            </CardContent>
          </Card>

          {/* Aktif QR Kodlar */}
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('activeQRCodes')}</p>
                <p className="text-2xl font-bold text-gray-900">{activeQRCodes}</p>
              </div>
            </CardContent>
          </Card>

          {/* Abonelik */}
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('subscription')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscription ? `${daysRemaining} ${t('days')}` : 'Free'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Kodlar Listesi */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('myQRCodes')}</CardTitle>
            <Link href="/qr-generator/url">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                {t('createNew')}
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {qrList.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {qrList.map((qr) => {
                  // Kalan gün hesapla
                  const expiresAt = qr.expires_at ? new Date(qr.expires_at) : null
                  const now = new Date()
                  const daysLeft = expiresAt
                    ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                    : null
                  const isExpired = daysLeft !== null && daysLeft <= 0

                  return (
                    <div key={qr.id} className="py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <QrCode className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{qr.name}</p>
                          <p className="text-sm text-gray-500">
                            {qr.type?.toUpperCase()} • {qr.scan_count || 0} tarama
                            {daysLeft !== null && (
                              <span className={daysLeft <= 3 ? 'text-amber-600 ml-2' : 'ml-2'}>
                                • {isExpired ? 'Süresi doldu' : `${daysLeft} gün kaldı`}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isExpired ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                            Süresi Doldu
                          </span>
                        ) : (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            qr.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {qr.is_active ? 'Aktif' : 'Pasif'}
                          </span>
                        )}
                        <Link href={`/dashboard/qr/${qr.id}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t('noQRCodes')}</p>
                <Link href="/qr-generator/url" className="mt-4 inline-block">
                  <Button>{t('createNew')}</Button>
                </Link>
              </div>
            )}
          </CardContent>
          {qrList.length > 0 && (
            <CardFooter className="justify-center">
              <Link href="/dashboard/qr">
                <Button variant="ghost">{t('viewAll')}</Button>
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}

