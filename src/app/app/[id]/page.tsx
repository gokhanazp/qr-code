// App Download Landing Page - QR kod taratıldığında açılan uygulama indirme sayfası
// Mobil uyumlu, güzel bir tasarım ile App Store ve Google Play linkleri
// Welcome Screen (logo büyüme animasyonu) + Primary/Secondary renk sistemi

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AlertTriangle, Clock } from 'lucide-react'
import Link from 'next/link'
import ShareButton from './ShareButton'
import WelcomeScreen from './WelcomeScreen'
import Image from 'next/image'
import { trackQRScan } from '@/lib/trackScan'

interface PageProps {
  params: Promise<{ id: string }>
}

// App verisi tipi (App data type)
interface AppData {
  appName: string
  developer: string
  appLogo: string
  title: string
  description: string
  website: string
  iosUrl: string
  androidUrl: string
  primaryColor?: string
  secondaryColor?: string
  textColor?: string
  welcomeScreenEnabled?: boolean
  welcomeLogo?: string
  gradient?: string // Eski sistem için geriye uyumluluk
}

export default async function AppLandingPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // QR kodu veritabanından bul (Find QR code in database)
  const { data: qrCode, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('id', id)
    .single()

  // QR kod bulunamadı
  if (error || !qrCode) {
    notFound()
  }

  // ÖNCELİKLE: QR kod pasif mi kontrol et (FIRST: Check if QR code is inactive)
  // Pasif QR kodlar tarama sayısını artırmamalı
  if (qrCode.is_active === false) {
    return <ErrorPage type="inactive" />
  }

  // ÖNCELİKLE: Süre dolmuş mu kontrol et (FIRST: Check if QR code is expired)
  // Süresi dolmuş QR kodlar tarama sayısını artırmamalı
  if (qrCode.expires_at) {
    const expiresAt = new Date(qrCode.expires_at)
    if (expiresAt < new Date()) {
      return <ErrorPage type="expired" expiresAt={qrCode.expires_at} />
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

  // Content'ten app verilerini çıkar
  let appData: AppData = {
    appName: '', developer: '', appLogo: '', title: '', 
    description: '', website: '', iosUrl: '', androidUrl: ''
  }

  try {
    const content = qrCode.content
    // Önce raw'dan al (rawContent olarak kaydediliyor - tam veriler burada)
    if (content?.raw && typeof content.raw === 'object') {
      appData = content.raw as AppData
    }
    // Yoksa encoded JSON string'den parse et (eski kayıtlar için)
    else if (content?.encoded && typeof content.encoded === 'string') {
      appData = JSON.parse(content.encoded)
    }
    // String ise doğrudan parse et
    else if (typeof content === 'string') {
      appData = JSON.parse(content)
    }
  } catch {
    // Parse hatası - varsayılan değerler kullanılacak
  }

  // Renkleri al (Get colors) - Gradient sistemi
  // Primary = Gradient alt (koyu), Secondary = Gradient üst (açık), Text = Yazı rengi
  const primaryColor = appData.primaryColor || '#2d8659'
  const secondaryColor = appData.secondaryColor || '#a8e6cf'
  const textColor = appData.textColor || '#000000'

  // Welcome Screen ayarları
  const welcomeScreenEnabled = appData.welcomeScreenEnabled !== false // varsayılan açık
  const welcomeLogo = appData.welcomeLogo || appData.appLogo // varsayılan App Logo

  return (
    <>
      {/* Welcome Screen - Logo büyüme animasyonu (sadece açıksa) */}
      {welcomeScreenEnabled && (
        <WelcomeScreen logo={welcomeLogo} primaryColor={primaryColor} secondaryColor={secondaryColor} />
      )}

      <div
        className="h-[100dvh] flex flex-col"
        style={{ background: `linear-gradient(to bottom, ${secondaryColor}, ${primaryColor})` }}
      >
        {/* Share Button - Sağ üst köşe */}
        <div className="absolute top-4 right-4 z-10">
          <ShareButton appName={appData.appName} title={appData.title} secondaryColor={textColor} />
        </div>

        {/* Ana İçerik Container */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-8">
          {/* App Name & Developer */}
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold uppercase tracking-wider" style={{ color: textColor }}>
              {appData.appName || 'App Name'}
            </h2>
            <p className="text-sm opacity-70 mt-1" style={{ color: textColor }}>
              {appData.developer || 'Developer'}
            </p>
          </div>

          {/* App Logo */}
          <div className="bg-white/25 rounded-3xl p-4 shadow-xl mb-4">
            {appData.appLogo ? (
              <img
                src={appData.appLogo}
                alt={appData.appName}
                className="w-24 h-24 object-contain"
              />
            ) : (
              <span className="text-6xl block">📱</span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-lg font-bold text-center leading-snug px-4 mb-2" style={{ color: textColor }}>
            {appData.title || 'Download Our App'}
          </h1>

          {/* Description */}
          {appData.description && (
            <p className="text-sm italic opacity-60 text-center mb-4" style={{ color: textColor }}>
              {appData.description}
            </p>
          )}

          {/* Download Buttons - Büyük ve belirgin */}
          <div className="w-full max-w-xs space-y-3 mt-2">
            {appData.iosUrl && (
              <a
                href={appData.iosUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-transform hover:scale-105 active:scale-95"
              >
                <img
                  src="/img/apple-en.png"
                  alt="Download on the App Store"
                  className="w-full h-14 object-contain"
                />
              </a>
            )}

            {appData.androidUrl && (
              <a
                href={appData.androidUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-transform hover:scale-105 active:scale-95"
              >
                <img
                  src="/img/google-en.png"
                  alt="Get it on Google Play"
                  className="w-full h-14 object-contain"
                />
              </a>
            )}
          </div>

          {/* Website Link */}
          {appData.website && (
            <a
              href={appData.website.startsWith('http') ? appData.website : `https://${appData.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: textColor }}
            >
              <span className="text-sm underline">{appData.website.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
        </div>

        {/* Footer - En altta */}
        <div className="py-3 text-center">
          <p className="text-xs opacity-40" style={{ color: textColor }}>
            Powered by QR Code Generator
          </p>
        </div>
      </div>
    </>
  )
}

// Hata Sayfası Bileşeni (Error Page Component)
interface ErrorPageProps {
  type: 'inactive' | 'expired'
  expiresAt?: string
}

function ErrorPage({ type, expiresAt }: ErrorPageProps) {
  const isExpired = type === 'expired'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
          {isExpired ? (
            <Clock className="w-10 h-10 text-orange-400" />
          ) : (
            <AlertTriangle className="w-10 h-10 text-yellow-400" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          {isExpired ? 'QR Kod Süresi Dolmuş' : 'QR Kod Pasif'}
        </h1>
        <p className="text-white/50 text-sm mb-2">
          {isExpired ? 'QR Code Expired' : 'QR Code Inactive'}
        </p>

        {isExpired && expiresAt && (
          <p className="text-orange-400/80 text-sm mb-6">
            Bitiş: {new Date(expiresAt).toLocaleDateString('tr-TR')}
          </p>
        )}

        <p className="text-white/60 text-sm mb-8">
          {isExpired
            ? 'Bu QR kodun geçerlilik süresi sona ermiştir.'
            : 'Bu QR kod şu anda aktif değil.'}
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition-colors font-medium"
        >
          Yeni QR Kod Oluştur
        </Link>
      </div>
    </div>
  )
}

