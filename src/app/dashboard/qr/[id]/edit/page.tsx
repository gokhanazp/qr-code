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
  // Content yapısı: { encoded: string, raw: object, originalUrl: string }
  const qrContent = qrCode.content as { encoded?: string; raw?: Record<string, unknown>; originalUrl?: string } | null

  // rawContent'i düzgün şekilde al - tüm değerleri string'e çevir
  // rawContent properly - convert all values to strings
  const rawContentObj = qrContent?.raw || {}
  const rawContent: Record<string, string> = {}

  // Object değerlerini string'e çevir (Convert object values to strings)
  // Array ve Object değerlerini JSON string olarak sakla
  Object.entries(rawContentObj).forEach(([key, value]) => {
    if (typeof value === 'string') {
      rawContent[key] = value
    } else if (typeof value === 'boolean') {
      rawContent[key] = String(value)
    } else if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
      // Array veya Object ise JSON string olarak sakla (items gibi)
      rawContent[key] = JSON.stringify(value)
    } else if (value !== null && value !== undefined) {
      rawContent[key] = String(value)
    }
  })

  const originalUrl = qrContent?.originalUrl || ''

  // QR ayarlarını parse et (Parse QR settings)
  const qrSettings = (qrCode.settings as Record<string, unknown>) || {}

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-2 max-w-6xl">
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

