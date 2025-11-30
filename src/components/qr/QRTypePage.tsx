// QR Tipi Sayfası Bileşeni (QR Type Page Component)
// Her QR tipi için özel sayfa - SEO dostu

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Link as LinkIcon, Wifi, Mail, Phone, CreditCard, FileText, Calendar,
  MapPin, MessageCircle, Instagram, Twitter, Linkedin, Youtube, Facebook,
  Bitcoin, AppWindow, Image, QrCode, ArrowLeft
} from 'lucide-react'
import clsx from 'clsx'
import QRContentForm from './QRContentForm'
import QRCustomizer from './QRCustomizer'
import QRPreview from './QRPreview'
import VCardForm from './VCardForm'
import { QRType } from './QRTypeSelector'

// QR tipi bilgileri - slug'dan QR type'a mapping
const qrTypeConfig: Record<string, {
  type: QRType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}> = {
  url: { type: 'URL', name: 'URL / Website', description: 'Link to any website', icon: LinkIcon, gradient: 'from-blue-500 to-blue-600' },
  wifi: { type: 'WIFI', name: 'WiFi Network', description: 'Share WiFi credentials', icon: Wifi, gradient: 'from-green-500 to-emerald-600' },
  vcard: { type: 'VCARD', name: 'vCard / Contact', description: 'Digital business card', icon: CreditCard, gradient: 'from-purple-500 to-purple-600' },
  email: { type: 'EMAIL', name: 'Email', description: 'Send pre-filled email', icon: Mail, gradient: 'from-red-500 to-red-600' },
  phone: { type: 'PHONE', name: 'Phone Call', description: 'Quick dial number', icon: Phone, gradient: 'from-emerald-500 to-emerald-600' },
  sms: { type: 'SMS', name: 'SMS Message', description: 'Send text message', icon: MessageCircle, gradient: 'from-blue-400 to-blue-500' },
  whatsapp: { type: 'WHATSAPP', name: 'WhatsApp', description: 'Open WhatsApp chat', icon: MessageCircle, gradient: 'from-green-500 to-green-600' },
  text: { type: 'TEXT', name: 'Plain Text', description: 'Any text content', icon: FileText, gradient: 'from-gray-500 to-gray-600' },
  instagram: { type: 'INSTAGRAM', name: 'Instagram', description: 'Instagram profile', icon: Instagram, gradient: 'from-pink-500 to-pink-600' },
  twitter: { type: 'TWITTER', name: 'Twitter / X', description: 'Twitter profile', icon: Twitter, gradient: 'from-sky-500 to-sky-600' },
  linkedin: { type: 'LINKEDIN', name: 'LinkedIn', description: 'LinkedIn profile', icon: Linkedin, gradient: 'from-blue-600 to-blue-700' },
  youtube: { type: 'YOUTUBE', name: 'YouTube', description: 'YouTube channel', icon: Youtube, gradient: 'from-red-600 to-red-700' },
  facebook: { type: 'FACEBOOK', name: 'Facebook', description: 'Facebook page', icon: Facebook, gradient: 'from-blue-500 to-blue-600' },
  event: { type: 'EVENT', name: 'Calendar Event', description: 'Add to calendar', icon: Calendar, gradient: 'from-orange-500 to-orange-600' },
  location: { type: 'LOCATION', name: 'Location', description: 'Map coordinates', icon: MapPin, gradient: 'from-red-500 to-rose-600' },
  bitcoin: { type: 'BITCOIN', name: 'Bitcoin', description: 'Crypto payment', icon: Bitcoin, gradient: 'from-amber-500 to-amber-600' },
  app: { type: 'APP', name: 'App Store', description: 'Download app links', icon: AppWindow, gradient: 'from-indigo-500 to-indigo-600' },
  pdf: { type: 'PDF', name: 'PDF Document', description: 'Link to PDF file', icon: FileText, gradient: 'from-red-500 to-red-600' },
  image: { type: 'IMAGE', name: 'Image', description: 'Link to image', icon: Image, gradient: 'from-violet-500 to-violet-600' },
}

interface QRTypePageProps {
  type: string
}

export default function QRTypePage({ type }: QRTypePageProps) {
  const config = qrTypeConfig[type]
  
  // QR Kod durumu (QR Code state)
  const [content, setContent] = useState('')
  const [data, setData] = useState<Record<string, string>>({})

  // Özelleştirme durumu (Customization state)
  const [foregroundColor, setForegroundColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [size, setSize] = useState(256)
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M')

  // İçerik değişikliği (Content change handler)
  const handleContentChange = (newContent: string, newData?: Record<string, string>) => {
    setContent(newContent)
    if (newData) setData(newData)
  }

  const IconComponent = config?.icon || QrCode

  // vCard için özel sayfa
  if (type === 'vcard') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link href="/" className="inline-flex items-center gap-2 text-purple-200 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <CreditCard className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Digital Business Card</h1>
                <p className="text-purple-200 mt-1">Create a professional vCard QR code with custom design</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* vCard Form */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <VCardForm data={data} onChange={(newData) => setData(newData)} />
        </div>
      </div>
    )
  }

  // Diğer QR tipleri için standart sayfa
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className={clsx('bg-gradient-to-r text-white', config?.gradient || 'from-blue-600 to-blue-700')}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <IconComponent className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{config?.name} QR Code Generator</h1>
              <p className="text-white/80 mt-1">{config?.description}</p>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Enter Content</h2>
              <QRContentForm type={config?.type || 'URL'} content={content} data={data} onChange={handleContentChange} />
            </div>

            {/* Özelleştirme */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customize Design</h2>
              <QRCustomizer
                foregroundColor={foregroundColor} backgroundColor={backgroundColor}
                size={size} errorCorrection={errorCorrection}
                onForegroundChange={setForegroundColor} onBackgroundChange={setBackgroundColor}
                onSizeChange={setSize} onErrorCorrectionChange={setErrorCorrection}
              />
            </div>
          </div>

          {/* Sağ Panel - QR Önizleme */}
          <div className="xl:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className={clsx('px-6 py-4 bg-gradient-to-r', config?.gradient || 'from-blue-600 to-purple-600')}>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Preview
                  </h3>
                </div>
                <div className="p-6">
                  <QRPreview content={content} foregroundColor={foregroundColor} backgroundColor={backgroundColor} size={size} errorCorrection={errorCorrection} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

