// QR Kod Tipi Seçici bileşeni (QR Code Type Selector)
// qr-code.io tarzında büyük kartlarla QR kod türü seçimi

'use client'

import { useTranslations } from 'next-intl'
import {
  Link,
  Type,
  Mail,
  Phone,
  MessageSquare,
  Wifi,
  User,
  MapPin,
  Calendar,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Smartphone,
  FileText,
  Image as ImageIcon,
  Bitcoin,
  CheckCircle2,
} from 'lucide-react'
import clsx from 'clsx'

// QR kod tipleri - açıklamalar ve gradyan renklerle
export const qrTypes = [
  {
    id: 'URL',
    icon: Link,
    gradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50',
    borderActive: 'border-blue-500',
    description: 'Link to any website or page'
  },
  {
    id: 'VCARD',
    icon: User,
    gradient: 'from-indigo-500 to-purple-600',
    bgLight: 'bg-indigo-50',
    borderActive: 'border-indigo-500',
    description: 'Share contact information'
  },
  {
    id: 'WIFI',
    icon: Wifi,
    gradient: 'from-purple-500 to-pink-500',
    bgLight: 'bg-purple-50',
    borderActive: 'border-purple-500',
    description: 'Connect to WiFi instantly'
  },
  {
    id: 'EMAIL',
    icon: Mail,
    gradient: 'from-red-500 to-rose-600',
    bgLight: 'bg-red-50',
    borderActive: 'border-red-500',
    description: 'Send pre-filled emails'
  },
  {
    id: 'PHONE',
    icon: Phone,
    gradient: 'from-green-500 to-emerald-600',
    bgLight: 'bg-green-50',
    borderActive: 'border-green-500',
    description: 'Call a phone number'
  },
  {
    id: 'SMS',
    icon: MessageSquare,
    gradient: 'from-yellow-500 to-orange-500',
    bgLight: 'bg-yellow-50',
    borderActive: 'border-yellow-500',
    description: 'Send a text message'
  },
  {
    id: 'TEXT',
    icon: Type,
    gradient: 'from-gray-500 to-gray-600',
    bgLight: 'bg-gray-50',
    borderActive: 'border-gray-500',
    description: 'Display plain text'
  },
  {
    id: 'LOCATION',
    icon: MapPin,
    gradient: 'from-pink-500 to-rose-500',
    bgLight: 'bg-pink-50',
    borderActive: 'border-pink-500',
    description: 'Share a location on map'
  },
  {
    id: 'EVENT',
    icon: Calendar,
    gradient: 'from-orange-500 to-amber-600',
    bgLight: 'bg-orange-50',
    borderActive: 'border-orange-500',
    description: 'Add calendar event'
  },
  {
    id: 'WHATSAPP',
    icon: MessageSquare,
    gradient: 'from-emerald-500 to-green-600',
    bgLight: 'bg-emerald-50',
    borderActive: 'border-emerald-500',
    description: 'Start a WhatsApp chat'
  },
  {
    id: 'INSTAGRAM',
    icon: Instagram,
    gradient: 'from-fuchsia-500 to-pink-600',
    bgLight: 'bg-fuchsia-50',
    borderActive: 'border-fuchsia-500',
    description: 'Link to Instagram profile'
  },
  {
    id: 'FACEBOOK',
    icon: Facebook,
    gradient: 'from-blue-600 to-blue-700',
    bgLight: 'bg-blue-50',
    borderActive: 'border-blue-600',
    description: 'Link to Facebook page'
  },
  {
    id: 'TWITTER',
    icon: Type,
    gradient: 'from-sky-500 to-blue-500',
    bgLight: 'bg-sky-50',
    borderActive: 'border-sky-500',
    description: 'Link to Twitter/X profile'
  },
  {
    id: 'LINKEDIN',
    icon: Linkedin,
    gradient: 'from-blue-700 to-blue-800',
    bgLight: 'bg-blue-50',
    borderActive: 'border-blue-700',
    description: 'Link to LinkedIn profile'
  },
  {
    id: 'YOUTUBE',
    icon: Youtube,
    gradient: 'from-red-600 to-red-700',
    bgLight: 'bg-red-50',
    borderActive: 'border-red-600',
    description: 'Link to YouTube channel'
  },
  {
    id: 'APP',
    icon: Smartphone,
    gradient: 'from-cyan-500 to-blue-600',
    bgLight: 'bg-cyan-50',
    borderActive: 'border-cyan-500',
    description: 'App download landing page'
  },
  {
    id: 'PDF',
    icon: FileText,
    gradient: 'from-red-700 to-red-800',
    bgLight: 'bg-red-50',
    borderActive: 'border-red-700',
    description: 'Link to PDF document'
  },
  {
    id: 'IMAGE',
    icon: ImageIcon,
    gradient: 'from-teal-500 to-cyan-600',
    bgLight: 'bg-teal-50',
    borderActive: 'border-teal-500',
    description: 'Link to image file'
  },
  {
    id: 'BITCOIN',
    icon: Bitcoin,
    gradient: 'from-amber-500 to-yellow-600',
    bgLight: 'bg-amber-50',
    borderActive: 'border-amber-500',
    description: 'Bitcoin payment address'
  },
] as const

export type QRType = typeof qrTypes[number]['id']

interface QRTypeSelectorProps {
  selectedType: QRType
  onTypeChange: (type: QRType) => void
}

export default function QRTypeSelector({ selectedType, onTypeChange }: QRTypeSelectorProps) {
  const t = useTranslations('qrTypes')

  // QR tip isimlerini çeviri anahtarlarına dönüştür
  const getTranslationKey = (id: string): string => {
    const keyMap: Record<string, string> = {
      URL: 'url',
      TEXT: 'text',
      EMAIL: 'email',
      PHONE: 'phone',
      SMS: 'sms',
      WIFI: 'wifi',
      VCARD: 'vcard',
      LOCATION: 'location',
      EVENT: 'event',
      WHATSAPP: 'whatsapp',
      INSTAGRAM: 'instagram',
      FACEBOOK: 'facebook',
      TWITTER: 'twitter',
      LINKEDIN: 'linkedin',
      YOUTUBE: 'youtube',
      APP: 'app',
      PDF: 'pdf',
      IMAGE: 'image',
      BITCOIN: 'bitcoin',
    }
    return keyMap[id] || id.toLowerCase()
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {qrTypes.map(({ id, icon: Icon, gradient, bgLight, borderActive, description }) => {
        const isSelected = selectedType === id
        return (
          <button
            key={id}
            onClick={() => onTypeChange(id)}
            className={clsx(
              'group relative flex flex-col items-start p-5 rounded-2xl transition-all duration-300',
              'border-2 hover:shadow-lg hover:-translate-y-1',
              'min-h-[140px]',
              isSelected
                ? `${borderActive} ${bgLight} shadow-lg`
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            )}
          >
            {/* Seçim işareti (Check icon when selected) */}
            {isSelected && (
              <div className="absolute top-3 right-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
            )}

            {/* İkon (Icon with gradient background) */}
            <div className={clsx(
              'w-12 h-12 rounded-xl flex items-center justify-center mb-3',
              'bg-gradient-to-br text-white shadow-md',
              'group-hover:scale-110 transition-transform duration-300',
              gradient
            )}>
              <Icon className="w-6 h-6" />
            </div>

            {/* Başlık (Title) */}
            <h3 className="text-sm font-semibold text-gray-900 mb-1 text-left">
              {t(getTranslationKey(id))}
            </h3>

            {/* Açıklama (Description) */}
            <p className="text-xs text-gray-500 text-left line-clamp-2">
              {description}
            </p>
          </button>
        )
      })}
    </div>
  )
}

