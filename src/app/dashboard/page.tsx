// Dashboard Sayfası
// Kullanıcı ana paneli

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { QrCode, BarChart3, Clock, Plus, ExternalLink, Eye } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui'

export default async function DashboardPage() {
  // Oturum kontrolü
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }

  const t = await getTranslations('dashboard')

  // Kullanıcı verilerini çek
  const [qrCodes, subscription] = await Promise.all([
    prisma.qRCode.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.subscription.findUnique({
      where: { userId: session.user.id },
      include: { plan: true },
    }),
  ])

  // İstatistikler
  const totalScans = qrCodes.reduce((sum, qr) => sum + qr.scanCount, 0)
  const activeQRCodes = qrCodes.filter(qr => qr.isActive).length

  // Abonelik kalan gün hesaplama
  const daysRemaining = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hoşgeldin mesajı */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('welcome')}, {session.user.name || session.user.email}
          </p>
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
                <p className="text-2xl font-bold text-gray-900">{qrCodes.length}</p>
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
            <Link href="/dashboard/qr/create">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                {t('createNew')}
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {qrCodes.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {qrCodes.map((qr) => (
                  <div key={qr.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <QrCode className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{qr.name}</p>
                        <p className="text-sm text-gray-500">{qr.type} • {qr.scanCount} scans</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        qr.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {qr.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <Link href={`/dashboard/qr/${qr.id}`}>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t('noQRCodes')}</p>
                <Link href="/dashboard/qr/create" className="mt-4 inline-block">
                  <Button>{t('createNew')}</Button>
                </Link>
              </div>
            )}
          </CardContent>
          {qrCodes.length > 0 && (
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

