// QR Kod Redirect Sayfası - Tarama sonrası yönlendirme
// QR Code Redirect Page - Handles scan and redirect with validation

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { AlertTriangle, Clock, XCircle, QrCode } from 'lucide-react'
import Link from 'next/link'
import { trackQRScan } from '@/lib/trackScan'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function QRRedirectPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // QR kodu veritabanından bul - önce id ile, sonra short_code ile dene
  // (Find QR code in database - try id first, then short_code)
  let qrCode = null
  let error = null

  // Önce UUID formatında mı kontrol et (Check if UUID format first)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

  if (isUUID) {
    // UUID ise id ile ara (If UUID, search by id)
    const result = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', id)
      .single()
    qrCode = result.data
    error = result.error
  }

  // UUID değilse veya bulunamadıysa short_code ile dene
  // (If not UUID or not found, try short_code)
  if (!qrCode) {
    const result = await supabase
      .from('qr_codes')
      .select('*')
      .eq('short_code', id)
      .single()
    qrCode = result.data
    error = result.error
  }

  // QR kod bulunamadı (QR code not found)
  if (error || !qrCode) {
    return <ErrorPage type="not_found" />
  }

  // ÖNCELİKLE: QR kod pasif mi kontrol et (FIRST: Check if QR code is inactive)
  // Pasif QR kodlar tarama sayısını artırmamalı
  if (qrCode.is_active === false) {
    return <ErrorPage type="inactive" qrName={qrCode.name} />
  }

  // ÖNCELİKLE: Süre dolmuş mu kontrol et (FIRST: Check if QR code is expired)
  // Süresi dolmuş QR kodlar tarama sayısını artırmamalı
  if (qrCode.expires_at) {
    const expiresAt = new Date(qrCode.expires_at)
    const now = new Date()

    if (expiresAt < now) {
      return <ErrorPage type="expired" qrName={qrCode.name} expiresAt={qrCode.expires_at} />
    }
  }

  // Kontroller geçtiyse: Tarama sayısını artır ve detaylı tarama kaydı oluştur
  // If checks passed: Increment scan count and create detailed scan record
  await Promise.all([
    supabase
      .from('qr_codes')
      .update({ scan_count: (qrCode.scan_count || 0) + 1 })
      .eq('id', id),
    trackQRScan(id) // IP, OS, browser, country, city bilgileriyle kayıt
  ])

  // İçeriği al ve yönlendir (Get content and redirect)
  const content = qrCode.content
  const qrType = qrCode.type?.toLowerCase()

  // Özel tipler için landing page'e yönlendir
  // (Redirect to landing page for special types)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qrcodeshine.com'

  // APP tipi için /app/[id] sayfasına yönlendir
  if (qrType === 'app') {
    redirect(`${baseUrl}/app/${qrCode.id}`)
  }

  // vCard tipi için /v/[id] sayfasına yönlendir
  if (qrType === 'vcard') {
    redirect(`${baseUrl}/v/${qrCode.id}`)
  }

  // HTML tipi için /html/[id] sayfasına yönlendir
  if (qrType === 'html') {
    redirect(`${baseUrl}/html/${qrCode.id}`)
  }

  let redirectUrl: string | null = null

  // Content'ten URL çıkar (Extract URL from content)
  // Öncelik: originalUrl > raw.url > encoded (eski format için)
  // Priority: originalUrl > raw.url > encoded (for backwards compatibility)
  if (typeof content === 'string') {
    redirectUrl = content
  } else if (content && typeof content === 'object') {
    // Yeni format: originalUrl alanı (hedef URL burada saklanır)
    // New format: originalUrl field (target URL is stored here)
    if (content.originalUrl) {
      redirectUrl = content.originalUrl
    } else if (content.raw) {
      // raw içinden URL bul (for vcard, app etc.)
      const raw = content.raw as Record<string, string>
      redirectUrl = raw.url || raw.link || raw.website || null
    } else if (content.encoded && !content.encoded.includes('/r/')) {
      // Eski format için encoded kullan (encoded /r/ içermiyorsa)
      // Use encoded for old format (if encoded doesn't contain /r/)
      redirectUrl = content.encoded
    }
  }

  // URL varsa yönlendir (Redirect if URL exists)
  if (redirectUrl && (redirectUrl.startsWith('http://') || redirectUrl.startsWith('https://'))) {
    redirect(redirectUrl)
  }

  // URL yoksa içeriği göster (Show content if no URL)
  return <ContentPage qrCode={qrCode} />
}

// Hata Sayfası Bileşeni (Error Page Component)
interface ErrorPageProps {
  type: 'not_found' | 'inactive' | 'expired'
  qrName?: string
  expiresAt?: string
}

function ErrorPage({ type, qrName, expiresAt }: ErrorPageProps) {
  const configs = {
    not_found: {
      icon: <XCircle className="w-16 h-16 text-red-500" />,
      title: 'QR Kod Bulunamadı',
      titleEn: 'QR Code Not Found',
      message: 'Bu QR kod artık mevcut değil veya silinmiş olabilir.',
      messageEn: 'This QR code no longer exists or may have been deleted.',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    inactive: {
      icon: <AlertTriangle className="w-16 h-16 text-yellow-500" />,
      title: 'QR Kod Pasif',
      titleEn: 'QR Code Inactive',
      message: 'Bu QR kod şu anda pasif durumda ve kullanılamıyor.',
      messageEn: 'This QR code is currently inactive and cannot be used.',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    expired: {
      icon: <Clock className="w-16 h-16 text-orange-500" />,
      title: 'QR Kod Süresi Dolmuş',
      titleEn: 'QR Code Expired',
      message: `Bu QR kodun süresi ${expiresAt ? new Date(expiresAt).toLocaleDateString('tr-TR') : ''} tarihinde dolmuştur.`,
      messageEn: `This QR code expired on ${expiresAt ? new Date(expiresAt).toLocaleDateString('en-US') : ''}.`,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
  }

  const config = configs[type]

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className={`max-w-md w-full ${config.bgColor} ${config.borderColor} border-2 rounded-2xl p-8 text-center shadow-lg`}>
        <div className="flex justify-center mb-6">
          {config.icon}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {config.title}
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          {config.titleEn}
        </p>

        {qrName && (
          <p className="text-gray-600 mb-4 px-4 py-2 bg-white rounded-lg">
            <span className="font-medium">QR:</span> {qrName}
          </p>
        )}
        
        <p className="text-gray-600 mb-2">
          {config.message}
        </p>
        <p className="text-gray-400 text-sm mb-8">
          {config.messageEn}
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl 
                   hover:bg-blue-700 transition-colors font-medium"
        >
          <QrCode className="w-5 h-5" />
          Yeni QR Kod Oluştur
        </Link>
      </div>
    </div>
  )
}

// İçerik Sayfası (Content Page) - URL olmayan içerikler için
interface ContentPageProps {
  qrCode: {
    name: string
    type: string
    content: unknown
  }
}

function ContentPage({ qrCode }: ContentPageProps) {
  // İçeriği güvenli string'e çevir
  const getContentString = (content: unknown): string => {
    if (typeof content === 'string') return content
    if (content && typeof content === 'object') {
      const obj = content as Record<string, unknown>
      if (obj.encoded && typeof obj.encoded === 'string') return obj.encoded
      if (obj.raw) return JSON.stringify(obj.raw, null, 2)
      return JSON.stringify(content, null, 2)
    }
    return String(content)
  }

  const contentStr = getContentString(qrCode.content)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <QrCode className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900 text-center mb-2">
          {qrCode.name}
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          {qrCode.type.toUpperCase()} QR Kod
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-500 mb-2">İçerik / Content:</p>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap break-all font-mono">
            {contentStr}
          </pre>
        </div>

        <Link
          href="/"
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3
                   bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          <QrCode className="w-5 h-5" />
          Yeni QR Kod Oluştur
        </Link>
      </div>
    </div>
  )
}

