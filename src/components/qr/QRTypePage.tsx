// QR Tipi Sayfası Bileşeni (QR Type Page Component)
// Her QR tipi için özel sayfa - SEO dostu

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Link as LinkIcon, Wifi, Mail, Phone, CreditCard, FileText, Calendar,
  MapPin, MessageCircle, Instagram, Twitter, Linkedin, Youtube, Facebook,
  Bitcoin, AppWindow, Image, QrCode, ArrowLeft, Save, Loader2, AlertCircle, CheckCircle, Code, Car, Utensils
} from 'lucide-react'
import clsx from 'clsx'
import QRContentForm from './QRContentForm'
import QRCustomizer from './QRCustomizer'
import QRPreview from './QRPreview'

import ParkingQRPreview from './ParkingQRPreview'
import { QRType } from './QRTypeSelector'
import { createClient } from '@/lib/supabase/client'

// QR tipi bilgileri - slug'dan QR type'a mapping (sadece icon ve gradient)
const qrTypeBaseConfig: Record<string, {
  type: QRType;
  nameKey: string;
  descKey: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}> = {
  url: { type: 'URL', nameKey: 'urlWebsite', descKey: 'linkToWebsite', icon: LinkIcon, gradient: 'from-blue-500 to-blue-600' },
  wifi: { type: 'WIFI', nameKey: 'wifiNetwork', descKey: 'shareWifi', icon: Wifi, gradient: 'from-green-500 to-emerald-600' },
  vcard: { type: 'VCARD', nameKey: 'vcardContact', descKey: 'digitalCard', icon: CreditCard, gradient: 'from-purple-500 to-purple-600' },
  email: { type: 'EMAIL', nameKey: 'email', descKey: 'sendEmail', icon: Mail, gradient: 'from-red-500 to-red-600' },
  phone: { type: 'PHONE', nameKey: 'phoneCall', descKey: 'quickDial', icon: Phone, gradient: 'from-emerald-500 to-emerald-600' },
  sms: { type: 'SMS', nameKey: 'smsMessage', descKey: 'sendTextMessage', icon: MessageCircle, gradient: 'from-blue-400 to-blue-500' },
  whatsapp: { type: 'WHATSAPP', nameKey: 'whatsapp', descKey: 'openWhatsApp', icon: MessageCircle, gradient: 'from-green-500 to-green-600' },
  text: { type: 'TEXT', nameKey: 'plainText', descKey: 'anyTextContent', icon: FileText, gradient: 'from-gray-500 to-gray-600' },
  instagram: { type: 'INSTAGRAM', nameKey: 'instagram', descKey: 'instagramProfile', icon: Instagram, gradient: 'from-pink-500 to-pink-600' },
  twitter: { type: 'TWITTER', nameKey: 'twitterX', descKey: 'twitterProfile', icon: Twitter, gradient: 'from-sky-500 to-sky-600' },
  linkedin: { type: 'LINKEDIN', nameKey: 'linkedin', descKey: 'linkedinProfile', icon: Linkedin, gradient: 'from-blue-600 to-blue-700' },
  youtube: { type: 'YOUTUBE', nameKey: 'youtube', descKey: 'youtubeChannel', icon: Youtube, gradient: 'from-red-600 to-red-700' },
  facebook: { type: 'FACEBOOK', nameKey: 'facebook', descKey: 'facebookPage', icon: Facebook, gradient: 'from-blue-500 to-blue-600' },
  event: { type: 'EVENT', nameKey: 'calendarEvent', descKey: 'addToCalendar', icon: Calendar, gradient: 'from-orange-500 to-orange-600' },
  location: { type: 'LOCATION', nameKey: 'location', descKey: 'mapCoordinates', icon: MapPin, gradient: 'from-red-500 to-rose-600' },
  bitcoin: { type: 'BITCOIN', nameKey: 'bitcoin', descKey: 'cryptoPayment', icon: Bitcoin, gradient: 'from-amber-500 to-amber-600' },
  app: { type: 'APP', nameKey: 'appStore', descKey: 'downloadAppLinks', icon: AppWindow, gradient: 'from-indigo-500 to-indigo-600' },
  pdf: { type: 'PDF', nameKey: 'pdfDocument', descKey: 'linkToPdf', icon: FileText, gradient: 'from-red-500 to-red-600' },
  image: { type: 'IMAGE', nameKey: 'image', descKey: 'linkToImage', icon: Image, gradient: 'from-violet-500 to-violet-600' },
  html: { type: 'HTML', nameKey: 'html', descKey: 'htmlCodeSnippet', icon: Code, gradient: 'from-orange-500 to-red-600' },
  parking: { type: 'PARKING', nameKey: 'parking', descKey: 'carOwnerContact', icon: Car, gradient: 'from-yellow-500 to-amber-600' },
  menu: { type: 'MENU', nameKey: 'menu', descKey: 'restaurantMenu', icon: Utensils, gradient: 'from-orange-500 to-red-600' },
}

interface QRTypePageProps {
  type: string
}

export default function QRTypePage({ type }: QRTypePageProps) {
  const t = useTranslations('generator')
  const baseConfig = qrTypeBaseConfig[type]

  // QR Kod durumu (QR Code state)
  const [content, setContent] = useState('')
  const [data, setData] = useState<Record<string, string>>({})

  // Özelleştirme durumu (Customization state)
  const [foregroundColor, setForegroundColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [size, setSize] = useState(256)
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M')

  // Frame durumu (Frame state)
  const [selectedFrame, setSelectedFrame] = useState('none')
  const [frameText, setFrameText] = useState('')
  const [frameColor, setFrameColor] = useState('#000000')

  // Logo durumu (Logo state)
  const [logo, setLogo] = useState<string | null>(null)
  const [logoSize, setLogoSize] = useState(20)

  // Kaydetme durumu (Save state)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [qrName, setQrName] = useState('')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [limits, setLimits] = useState<{ current: number; limit: number | string; plan: string } | null>(null)

  const router = useRouter()

  // Kullanıcı giriş durumunu kontrol et
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)

      // Limit bilgisini al
      if (user) {
        try {
          const res = await fetch('/api/qr/save')
          const data = await res.json()
          if (data.limits) {
            setLimits(data.limits)
          }
        } catch (e) {
          console.error('Limit fetch error:', e)
        }
      }
    }
    checkAuth()
  }, [])

  // İçerik değişikliği (Content change handler)
  const handleContentChange = (newContent: string, newData?: Record<string, string>) => {
    setContent(newContent)
    if (newData) setData(newData)
  }

  // QR kodunu kaydet
  const handleSaveQR = async () => {
    if (!content) {
      setSaveMessage({ type: 'error', text: t('pleaseEnterContent') })
      return
    }

    if (!qrName.trim()) {
      setSaveMessage({ type: 'error', text: t('pleaseEnterName') })
      return
    }

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const res = await fetch('/api/qr/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: qrName.trim(),
          type: baseConfig?.type || 'URL',
          content: content,
          rawContent: data,
          settings: {
            foregroundColor,
            backgroundColor,
            size,
            errorCorrection,
            frame: selectedFrame,
            frameText,
            frameColor,
            logo,
            logoSize
          }
        })
      })

      const result = await res.json()

      if (res.ok) {
        setSaveMessage({ type: 'success', text: t('savedSuccessfully') })
        setShowSaveModal(false)
        setQrName('')
        // Limitleri güncelle
        if (limits) {
          setLimits({ ...limits, current: (limits.current as number) + 1 })
        }
        // 2 saniye sonra dashboard'a yönlendir
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else if (res.status === 403) {
        setSaveMessage({ type: 'warning', text: result.message || t('limitReached') })
        setShowSaveModal(false)
      } else if (res.status === 401) {
        setSaveMessage({ type: 'error', text: t('pleaseLogin') })
        setShowSaveModal(false)
        setTimeout(() => router.push('/auth/login'), 1500)
      } else {
        setSaveMessage({ type: 'error', text: result.message || t('saveFailed') })
      }
    } catch (error) {
      console.error('Save error:', error)
      setSaveMessage({ type: 'error', text: t('errorOccurred') })
    } finally {
      setIsSaving(false)
    }
  }

  const IconComponent = baseConfig?.icon || QrCode



  // Diğer QR tipleri için standart sayfa
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className={clsx('bg-gradient-to-r text-white', baseConfig?.gradient || 'from-blue-600 to-blue-700')}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t('backToHome')}
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <IconComponent className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{baseConfig ? t(baseConfig.nameKey) : ''} {t('qrCodeGenerator')}</h1>
              <p className="text-white/80 mt-1">{baseConfig ? t(baseConfig.descKey) : ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Sol Panel - Form ve Özelleştirme */}
          <div className="xl:col-span-2 space-y-6">
            {/* İçerik Formu */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('enterContent')}</h2>
              <QRContentForm type={baseConfig?.type || 'URL'} content={content} data={data} onChange={handleContentChange} />
            </div>

            {/* Özelleştirme - Parking hariç diğer tipler için */}
            {type !== 'parking' && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('customize')}</h2>
                <QRCustomizer
                  foregroundColor={foregroundColor}
                  backgroundColor={backgroundColor}
                  size={size}
                  errorCorrection={errorCorrection}
                  selectedFrame={selectedFrame}
                  frameText={frameText}
                  frameColor={frameColor}
                  logo={logo}
                  logoSize={logoSize}
                  onForegroundChange={setForegroundColor}
                  onBackgroundChange={setBackgroundColor}
                  onSizeChange={setSize}
                  onErrorCorrectionChange={setErrorCorrection}
                  onFrameChange={setSelectedFrame}
                  onFrameTextChange={setFrameText}
                  onFrameColorChange={setFrameColor}
                  onLogoChange={setLogo}
                  onLogoSizeChange={setLogoSize}
                />
              </div>
            )}
          </div>

          {/* Sağ Panel - QR Önizleme */}
          <div className="xl:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className={clsx('px-6 py-4 bg-gradient-to-r', baseConfig?.gradient || 'from-blue-600 to-purple-600')}>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    {t('preview')}
                  </h3>
                </div>
                <div className="p-6">
                  {/* APP tipi için özel önizleme mesajı */}
                  {type === 'app' && content && (
                    <div className="mb-4 p-3 bg-cyan-50 border border-cyan-200 rounded-lg text-xs text-cyan-700">
                      📱 Kaydettiğinizde QR kod, güzel bir uygulama indirme sayfasına yönlendirecek.
                    </div>
                  )}

                  {/* PARKING tipi için özel önizleme */}
                  {type === 'parking' ? (
                    <ParkingQRPreview
                      phone={data.phone || ''}
                      topLabel={data.topLabel || 'TELEFON'}
                      bottomText={data.bottomText || 'ARAÇ SAHİBİNE\nULAŞMAK İÇİN\nKODU OKUT'}
                      labelColor={data.labelColor || '#FFD700'}
                      labelShape={(data.labelShape as 'rounded' | 'square' | 'pill') || 'rounded'}
                      isAuthenticated={isLoggedIn}
                    />
                  ) : (
                    <QRPreview
                      content={
                        type === 'app' && content ? `${window?.location?.origin || ''}/app/preview` :
                          type === 'menu' ? 'https://qrcodeshine.com/menu/preview' :
                            content
                      }
                      foregroundColor={foregroundColor}
                      backgroundColor={backgroundColor}
                      size={size}
                      errorCorrection={errorCorrection}
                      selectedFrame={selectedFrame}
                      frameText={frameText}
                      frameColor={frameColor}
                      logo={logo}
                      logoSize={logoSize}
                      isAuthenticated={isLoggedIn}
                    />
                  )}
                </div>
              </div>

              {/* Hesabıma Kaydet Butonu */}
              {content && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4">
                  {/* Mesaj Alanı */}
                  {saveMessage && (
                    <div className={clsx(
                      'mb-4 p-3 rounded-lg flex items-center gap-2 text-sm',
                      saveMessage.type === 'success' && 'bg-green-50 text-green-700 border border-green-200',
                      saveMessage.type === 'error' && 'bg-red-50 text-red-700 border border-red-200',
                      saveMessage.type === 'warning' && 'bg-amber-50 text-amber-700 border border-amber-200'
                    )}>
                      {saveMessage.type === 'success' && <CheckCircle className="w-4 h-4" />}
                      {saveMessage.type === 'error' && <AlertCircle className="w-4 h-4" />}
                      {saveMessage.type === 'warning' && <AlertCircle className="w-4 h-4" />}
                      {saveMessage.text}
                    </div>
                  )}

                  {/* Limit Bilgisi */}
                  {isLoggedIn && limits && (
                    <div className="mb-3 text-xs text-gray-500 flex items-center justify-between">
                      <span>{t('plan')}: <span className="font-medium capitalize">{limits.plan}</span></span>
                      <span>
                        {typeof limits.limit === 'number' ? (
                          <span className={limits.current >= limits.limit ? 'text-red-500' : ''}>
                            {limits.current}/{limits.limit} QR
                          </span>
                        ) : (
                          <span className="text-green-600">{t('unlimited')}</span>
                        )}
                      </span>
                    </div>
                  )}

                  {isLoggedIn ? (
                    showSaveModal ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder={t('qrNamePlaceholder')}
                          value={qrName}
                          onChange={(e) => setQrName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveQR}
                            disabled={isSaving}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isSaving ? t('saving') : t('save')}
                          </button>
                          <button
                            onClick={() => { setShowSaveModal(false); setQrName('') }}
                            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                          >
                            {t('cancel')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowSaveModal(true)}
                        disabled={!!(limits && typeof limits.limit === 'number' && limits.current >= limits.limit)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-5 h-5" />
                        {t('saveToAccount')}
                      </button>
                    )
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 text-center">
                        {t('loginToSave')}
                      </p>
                      <Link
                        href="/auth/login"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                      >
                        {t('login')}
                      </Link>
                    </div>
                  )}

                  {/* Free plan uyarısı */}
                  {isLoggedIn && limits?.plan === 'free' && (
                    <p className="mt-3 text-xs text-gray-500 text-center">
                      {t('freeValidityWarning')}{' '}
                      <Link href="/pricing" className="text-blue-600 hover:underline">{t('upgrade')}</Link>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

