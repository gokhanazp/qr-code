'use client'

// Featured QR Codes Component
// Ana sayfada müşterilerin QR kodlarını ve önizlemelerini gösteren bileşen
// (Component to display customer QR codes with preview mockups on homepage)

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { QRCodeSVG } from 'qrcode.react'
import {
  Sparkles,
  Link as LinkIcon,
  Wifi,
  Mail,
  Phone,
  MessageSquare,
  User,
  FileText,
  MapPin,
  Calendar,
  Eye,
  Globe,
  Lock,
  Signal,
  Send,
  Clock,
  ExternalLink
} from 'lucide-react'

// QR kod tipi için ikon eşleşmesi
const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  url: LinkIcon,
  wifi: Wifi,
  email: Mail,
  phone: Phone,
  sms: MessageSquare,
  whatsapp: MessageSquare,
  vcard: User,
  text: FileText,
  location: MapPin,
  event: Calendar,
}

// QR kod tipi için renk eşleşmesi
const typeColors: Record<string, string> = {
  url: 'from-blue-500 to-indigo-500',
  wifi: 'from-green-500 to-emerald-500',
  email: 'from-red-500 to-pink-500',
  phone: 'from-amber-500 to-orange-500',
  sms: 'from-purple-500 to-violet-500',
  whatsapp: 'from-green-500 to-teal-500',
  vcard: 'from-cyan-500 to-blue-500',
  text: 'from-gray-500 to-slate-500',
  location: 'from-rose-500 to-red-500',
  event: 'from-indigo-500 to-purple-500',
}

interface FeaturedQR {
  id: string
  name: string
  type: string
  content: Record<string, unknown>
  settings: Record<string, unknown>
  short_code: string
  scan_count: number
  profile?: { full_name: string | null; plan: string } | null
}

// =============================================
// Önizleme Mockup Bileşenleri (Preview Mockups)
// =============================================

// URL Önizleme - Website mockup
function URLPreview({ content }: { content: Record<string, unknown> }) {
  const url = (content?.url as string) || 'example.com'
  const domain = url.replace(/^https?:\/\//, '').split('/')[0]

  return (
    <div className="bg-white rounded-lg shadow-inner border border-gray-200 overflow-hidden h-full">
      {/* Browser bar */}
      <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-b">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded px-2 py-0.5 text-[10px] text-gray-500 flex items-center gap-1 truncate">
          <Lock className="w-2.5 h-2.5 text-green-500" />
          <span className="truncate">{domain}</span>
        </div>
      </div>
      {/* Content */}
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gradient-to-r from-blue-200 to-blue-100 rounded w-3/4" />
        <div className="h-2 bg-gray-100 rounded w-full" />
        <div className="h-2 bg-gray-100 rounded w-5/6" />
        <div className="h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded mt-3 flex items-center justify-center">
          <ExternalLink className="w-3 h-3 text-white" />
        </div>
      </div>
    </div>
  )
}

// WiFi Önizleme - Bağlantı ekranı mockup
function WiFiPreview({ content }: { content: Record<string, unknown> }) {
  const ssid = (content?.ssid as string) || 'WiFi Network'

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 h-full p-3 flex flex-col items-center justify-center">
      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-2 shadow-lg">
        <Wifi className="w-6 h-6 text-white" />
      </div>
      <p className="text-[10px] text-gray-500 mb-1">Ağa Bağlan</p>
      <p className="font-semibold text-sm text-gray-800 truncate max-w-full">{ssid}</p>
      <div className="flex items-center gap-1 mt-2">
        <Signal className="w-3 h-3 text-green-500" />
        <span className="text-[9px] text-green-600">Güvenli</span>
      </div>
    </div>
  )
}

// vCard Önizleme - Kartvizit mockup
function VCardPreview({ content }: { content: Record<string, unknown> }) {
  const name = (content?.firstName as string) || (content?.name as string) || 'İsim Soyisim'
  const company = (content?.company as string) || (content?.organization as string) || ''

  return (
    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-200 h-full p-3">
      <div className="flex items-start gap-2">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-800 truncate">{name}</p>
          {company && <p className="text-[10px] text-gray-500 truncate">{company}</p>}
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
          <Phone className="w-3 h-3 text-cyan-500" />
          <span>+90 5xx xxx xx xx</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
          <Mail className="w-3 h-3 text-cyan-500" />
          <span>email@example.com</span>
        </div>
      </div>
    </div>
  )
}

// WhatsApp Önizleme
function WhatsAppPreview({ content }: { content: Record<string, unknown> }) {
  const phone = (content?.phone as string) || '+90 5xx'
  const message = (content?.message as string) || 'Merhaba!'

  return (
    <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg border border-green-200 h-full p-3">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-green-200">
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center shadow">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-semibold text-xs text-gray-800">WhatsApp</p>
          <p className="text-[9px] text-gray-500">{phone}</p>
        </div>
      </div>
      <div className="bg-white rounded-lg p-2 shadow-sm">
        <p className="text-[10px] text-gray-700 line-clamp-2">{message}</p>
        <div className="flex justify-end mt-1">
          <Send className="w-3 h-3 text-green-500" />
        </div>
      </div>
    </div>
  )
}

// Email Önizleme
function EmailPreview({ content }: { content: Record<string, unknown> }) {
  const email = (content?.email as string) || 'email@example.com'
  const subject = (content?.subject as string) || 'Konu'

  return (
    <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border border-red-200 h-full p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow">
          <Mail className="w-4 h-4 text-white" />
        </div>
        <p className="font-semibold text-xs text-gray-800">E-posta Gönder</p>
      </div>
      <div className="space-y-1.5 text-[10px]">
        <div className="flex gap-1">
          <span className="text-gray-500">Kime:</span>
          <span className="text-gray-700 truncate">{email}</span>
        </div>
        <div className="flex gap-1">
          <span className="text-gray-500">Konu:</span>
          <span className="text-gray-700 truncate">{subject}</span>
        </div>
      </div>
    </div>
  )
}

// Event Önizleme - Takvim kartı
function EventPreview({ content }: { content: Record<string, unknown> }) {
  const title = (content?.title as string) || (content?.summary as string) || 'Etkinlik'
  const location = (content?.location as string) || ''

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200 h-full p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center shadow">
          <Calendar className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-semibold text-xs text-gray-800 truncate">{title}</p>
          {location && (
            <p className="text-[9px] text-gray-500 flex items-center gap-0.5">
              <MapPin className="w-2 h-2" />{location}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 text-[10px] text-gray-600 mt-2">
        <Clock className="w-3 h-3 text-orange-500" />
        <span>Takvime Ekle</span>
      </div>
    </div>
  )
}

// Location Önizleme - Harita mockup
function LocationPreview({ content }: { content: Record<string, unknown> }) {
  const name = (content?.name as string) || 'Konum'

  return (
    <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-lg border border-rose-200 h-full overflow-hidden">
      {/* Harita mockup */}
      <div className="h-16 bg-gradient-to-br from-green-100 via-green-50 to-blue-50 relative">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-2 left-3 w-8 h-0.5 bg-gray-400" />
          <div className="absolute top-4 left-1 w-12 h-0.5 bg-gray-400" />
          <div className="absolute top-6 left-4 w-6 h-0.5 bg-gray-400" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
          <MapPin className="w-6 h-6 text-red-500 drop-shadow-lg" />
        </div>
      </div>
      <div className="p-2">
        <p className="font-semibold text-xs text-gray-800 truncate">{name}</p>
        <p className="text-[9px] text-gray-500">Haritada Aç</p>
      </div>
    </div>
  )
}

// Genel Önizleme - Diğer tipler için
function GenericPreview({ type, content }: { type: string; content: Record<string, unknown> }) {
  const Icon = typeIcons[type] || Globe
  const gradient = typeColors[type] || 'from-gray-500 to-slate-500'
  const text = (content?.text as string) || (content?.phone as string) || type

  return (
    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border border-gray-200 h-full p-3 flex flex-col items-center justify-center">
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center mb-2 shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="font-semibold text-sm text-gray-800 capitalize">{type}</p>
      <p className="text-[10px] text-gray-500 truncate max-w-full mt-1">{text}</p>
    </div>
  )
}

// Ana önizleme router
function PreviewMockup({ type, content }: { type: string; content: Record<string, unknown> }) {
  switch (type) {
    case 'url':
      return <URLPreview content={content} />
    case 'wifi':
      return <WiFiPreview content={content} />
    case 'vcard':
      return <VCardPreview content={content} />
    case 'whatsapp':
      return <WhatsAppPreview content={content} />
    case 'email':
      return <EmailPreview content={content} />
    case 'event':
      return <EventPreview content={content} />
    case 'location':
      return <LocationPreview content={content} />
    default:
      return <GenericPreview type={type} content={content} />
  }
}

export default function FeaturedQRCodes() {
  const t = useTranslations('home')
  const [qrCodes, setQrCodes] = useState<FeaturedQR[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const response = await fetch('/api/featured-qr')
        const data = await response.json()
        setQrCodes(data.qrCodes || [])
      } catch (error) {
        console.error('Featured QR fetch error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  // QR kodu için URL oluştur
  const getQRValue = (qr: FeaturedQR): string => {
    if (qr.short_code) {
      return `${typeof window !== 'undefined' ? window.location.origin : ''}/r/${qr.short_code}`
    }
    // Fallback: content'ten URL al
    const content = qr.content as Record<string, string>
    return content?.url || content?.text || ''
  }

  // Hiç QR kod yoksa gösterme
  if (!loading && qrCodes.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">
              {t('featuredShowcase')}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('featuredTitle')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('featuredSubtitle')}
          </p>
        </div>

        {/* QR Kodları Grid - Yeni Tasarım: QR + Önizleme yan yana */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex gap-4">
                    <div className="w-32 h-32 bg-gray-200 rounded-xl flex-shrink-0" />
                    <div className="flex-1 h-32 bg-gray-100 rounded-xl" />
                  </div>
                  <div className="mt-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {qrCodes.map((qr) => {
              const Icon = typeIcons[qr.type] || LinkIcon
              const gradient = typeColors[qr.type] || 'from-blue-500 to-indigo-500'
              const settings = qr.settings as Record<string, string>
              const content = qr.content as Record<string, unknown>

              return (
                <div
                  key={qr.id}
                  className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                >
                  {/* QR Kod + Önizleme Yan Yana */}
                  <div className="flex gap-4">
                    {/* Sol: QR Kod */}
                    <div className="relative flex-shrink-0">
                      <div className="w-32 h-32 bg-gradient-to-br from-gray-50 to-white rounded-xl p-2 border border-gray-100">
                        <QRCodeSVG
                          value={getQRValue(qr)}
                          size={112}
                          level="M"
                          fgColor={settings?.foregroundColor || '#000000'}
                          bgColor={settings?.backgroundColor || '#ffffff'}
                          className="w-full h-full"
                        />
                      </div>
                      {/* Tip badge */}
                      <div className={`absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center shadow-lg`}>
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>

                    {/* Sağ: Önizleme Mockup */}
                    <div className="flex-1 min-w-0 h-32">
                      <PreviewMockup type={qr.type} content={content} />
                    </div>
                  </div>

                  {/* Alt: Bilgiler */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {qr.name}
                        </h3>
                        <span className="text-xs text-gray-500 capitalize">
                          {qr.type} QR
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                        <Eye className="w-3.5 h-3.5" />
                        <span className="font-medium">{qr.scan_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

