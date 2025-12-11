'use client'

// Featured QR Codes Component
// Ana sayfada müşterilerin QR kodlarını gösteren bileşen
// (Component to display customer QR codes on homepage)

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
  Eye
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

        {/* QR Kodları Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="w-full aspect-square bg-gray-200 rounded-xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {qrCodes.map((qr) => {
              const Icon = typeIcons[qr.type] || LinkIcon
              const gradient = typeColors[qr.type] || 'from-blue-500 to-indigo-500'
              const settings = qr.settings as Record<string, string>
              
              return (
                <div 
                  key={qr.id}
                  className="group bg-white rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                >
                  {/* QR Kod */}
                  <div className="relative mb-4">
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                      <QRCodeSVG
                        value={getQRValue(qr)}
                        size={180}
                        level="M"
                        fgColor={settings?.foregroundColor || '#000000'}
                        bgColor={settings?.backgroundColor || '#ffffff'}
                        className="w-full h-auto"
                      />
                    </div>
                    {/* Tip badge */}
                    <div className={`absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center shadow-lg`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Bilgiler */}
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {qr.name}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500 capitalize">
                        {qr.type}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Eye className="w-3 h-3" />
                        <span>{qr.scan_count || 0}</span>
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

