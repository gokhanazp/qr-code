// Dashboard - QR Kod Düzenleme Sayfası
// Edit QR Code page - allows users to modify their QR codes

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import EditQRForm from './EditQRForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditQRCodePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const t = await getTranslations('dashboard')

  // Kullanıcı kontrolü (Authentication check)
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login')
  }

  // QR kodu getir (Fetch QR code)
  const { data: qrCode, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !qrCode) {
    notFound()
  }

  // QR içeriğini parse et (Parse QR content)
  const qrContent = qrCode.content as { encoded?: string; raw?: Record<string, string>; originalUrl?: string } | null
  const rawContent = qrContent?.raw || {}
  const originalUrl = qrContent?.originalUrl || ''

  // QR ayarlarını parse et (Parse QR settings)
  const qrSettings = (qrCode.settings as Record<string, unknown>) || {}

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Geri butonu (Back button) */}
        <Link
          href={`/dashboard/qr/${id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToDetails')}
        </Link>

        {/* Başlık (Title) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('editQRCode')}</h1>
          <p className="text-gray-500 mt-1">{t('editQRCodeDesc')}</p>
        </div>

        {/* Düzenleme formu (Edit form) */}
        <EditQRForm
          qrId={id}
          qrName={qrCode.name}
          qrType={qrCode.type}
          originalUrl={originalUrl}
          rawContent={rawContent}
          settings={qrSettings}
          isActive={qrCode.is_active}
        />
      </div>
    </div>
  )
}

