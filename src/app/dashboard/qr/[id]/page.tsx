// Dashboard - QR Kod Detay Sayfası
// Tek bir QR kodunu görüntüler ve yönetir
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Eye, Trash2, Download, ExternalLink, QrCode } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import QRPreviewClient from './QRPreviewClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function QRCodeDetailPage({ params }: PageProps) {
  const { id } = await params
  const t = await getTranslations('dashboard')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // QR kodunu getir
  const { data: qrCode, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !qrCode) {
    notFound()
  }

  // Kalan gün hesaplama
  const getRemainingDays = (expiresAt: string | null) => {
    if (!expiresAt) return null
    const now = new Date()
    const expires = new Date(expiresAt)
    const diffTime = expires.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const remainingDays = getRemainingDays(qrCode.expires_at)
  const isExpired = remainingDays !== null && remainingDays <= 0

  // QR içeriğini al
  const qrContent = qrCode.content?.encoded || ''
  const qrSettings = qrCode.settings || {}

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Geri Butonu */}
        <Link
          href="/dashboard/qr"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToList')}
        </Link>

        {/* Ana İçerik */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Başlık */}
          <div className={`px-6 py-4 border-b ${isExpired ? 'bg-red-50 border-red-200' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-xl font-bold ${isExpired ? 'text-red-800' : 'text-white'}`}>
                  {qrCode.name}
                </h1>
                <p className={`text-sm ${isExpired ? 'text-red-600' : 'text-white/80'} capitalize`}>
                  {qrCode.type} QR Kod
                </p>
              </div>
              {isExpired && (
                <span className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-full">
                  {t('expired')}
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Sol: QR Kod Önizleme */}
              <div className="flex flex-col items-center">
                <div className={`p-4 rounded-xl ${isExpired ? 'bg-red-50 opacity-50' : 'bg-gray-50'}`}>
                  <QRPreviewClient
                    content={qrContent}
                    foregroundColor={qrSettings.foregroundColor || '#000000'}
                    backgroundColor={qrSettings.backgroundColor || '#ffffff'}
                    size={qrSettings.size || 256}
                    errorCorrection={qrSettings.errorCorrection || 'M'}
                    selectedFrame={qrSettings.frame || 'none'}
                    frameText={qrSettings.frameText || ''}
                    frameColor={qrSettings.frameColor || '#000000'}
                    logo={qrSettings.logo || null}
                    logoSize={qrSettings.logoSize || 20}
                  />
                </div>

                {/* İndirme Butonları */}
                {!isExpired && (
                  <div className="flex gap-3 mt-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Download className="w-4 h-4" />
                      {t('downloadPNG')}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <Download className="w-4 h-4" />
                      {t('downloadSVG')}
                    </button>
                  </div>
                )}
              </div>

              {/* Sağ: Detaylar */}
              <div className="space-y-6">
                {/* İstatistikler */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">{t('totalScans')}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{qrCode.scan_count || 0}</p>
                  </div>

                  {remainingDays !== null && (
                    <div className={`rounded-xl p-4 ${isExpired ? 'bg-red-50' : remainingDays <= 3 ? 'bg-orange-50' : 'bg-green-50'}`}>
                      <div className={`flex items-center gap-2 mb-1 ${isExpired ? 'text-red-600' : remainingDays <= 3 ? 'text-orange-600' : 'text-green-600'}`}>
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{t('remainingTime')}</span>
                      </div>
                      <p className={`text-2xl font-bold ${isExpired ? 'text-red-700' : remainingDays <= 3 ? 'text-orange-700' : 'text-green-700'}`}>
                        {isExpired ? t('expired') : `${remainingDays} ${t('days')}`}
                      </p>
                    </div>
                  )}
                </div>

                {/* QR Bilgileri */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">{t('qrCodeInfo')}</h3>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">{t('createdAt')}</p>
                    <p className="text-gray-900">{new Date(qrCode.created_at).toLocaleDateString('tr-TR', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">{t('qrType')}</p>
                    <p className="text-gray-900 capitalize">{qrCode.type}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">{t('status')}</p>
                    <p className={`font-medium ${qrCode.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                      {qrCode.is_active ? t('active') : t('inactive')}
                    </p>
                  </div>
                </div>

                {/* Aksiyonlar */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                    {t('delete')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

