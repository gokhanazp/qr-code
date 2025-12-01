// vCard Telefon Önizleme Bileşeni (vCard Phone Preview Component)
// Telefon mockup içinde canlı vCard önizlemesi

'use client'

import { Phone, Mail, Globe, MapPin, UserPlus, Briefcase } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

interface VCardPhonePreviewProps {
  data: Record<string, string>
  primaryColor: string
  secondaryColor: string
}

export default function VCardPhonePreview({ data, primaryColor, secondaryColor }: VCardPhonePreviewProps) {
  const t = useTranslations('generator')
  const fullName = `${data.firstName || t('name')} ${data.lastName || t('surname')}`.trim()
  const hasContact = data.mobile || data.workPhone || data.email || data.website

  return (
    <div className="relative">
      {/* Telefon Çerçevesi (Phone Frame) */}
      <div className="relative w-[280px] h-[580px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
        {/* Dinamik Adası (Dynamic Island) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-20" />

        {/* Telefon Ekranı (Phone Screen) */}
        <div className="relative w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
          {/* Durum Çubuğu (Status Bar) */}
          <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-8 z-10">
            <span className="text-xs font-semibold text-white">9:41</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                <div className="w-1 h-1 bg-white rounded-full" />
                <div className="w-1 h-1 bg-white rounded-full" />
                <div className="w-1 h-1 bg-white rounded-full" />
                <div className="w-1 h-1 bg-white/50 rounded-full" />
              </div>
              <span className="text-xs text-white ml-1">5G</span>
              <div className="w-6 h-3 border border-white rounded-sm ml-1">
                <div className="w-4 h-full bg-white rounded-sm" />
              </div>
            </div>
          </div>

          {/* Gradyan Header */}
          <div
            className="h-48 flex flex-col items-center justify-center pt-8"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
            }}
          >
            {/* Profil Resmi / İsmin Baş Harfi (Profile Image / Initial) */}
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 border-2 border-white/30 overflow-hidden">
              {data.photo ? (
                // Yüklenen fotoğrafı göster (Show uploaded photo)
                <Image
                  src={data.photo}
                  alt={fullName}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  unoptimized // Supabase URL'leri için
                />
              ) : (
                // Baş harfi göster (Show initial)
                <span className="text-3xl font-bold text-white">
                  {(data.firstName?.[0] || 'Y').toUpperCase()}
                </span>
              )}
            </div>

            {/* İsim (Name) */}
            <h2 className="text-xl font-bold text-white text-center px-4">
              {fullName.toUpperCase()}
            </h2>

            {/* Ünvan (Title) */}
            {data.title && (
              <p className="text-sm text-white/80 mt-1">{data.title}</p>
            )}
          </div>
          
          {/* İçerik Alanı (Content Area) */}
          <div className="p-4 space-y-3">
            {/* Hızlı Aksiyonlar (Quick Actions) */}
            <div className="flex justify-center gap-4 -mt-6 mb-4">
              <ActionButton 
                icon={<Phone className="w-5 h-5" />} 
                color={primaryColor}
                active={!!data.mobile}
              />
              <ActionButton 
                icon={<Mail className="w-5 h-5" />} 
                color={primaryColor}
                active={!!data.email}
              />
              <ActionButton 
                icon={<Globe className="w-5 h-5" />} 
                color={primaryColor}
                active={!!data.website}
              />
            </div>

            {/* İletişim Bilgileri (Contact Info) */}
            {data.mobile && (
              <ContactItem
                icon={<Phone className="w-4 h-4" />}
                label={t('phone')}
                value={data.mobile}
                color={primaryColor}
              />
            )}

            {data.workPhone && (
              <ContactItem
                icon={<Phone className="w-4 h-4" />}
                label={t('work')}
                value={data.workPhone}
                color={primaryColor}
              />
            )}

            {data.email && (
              <ContactItem
                icon={<Mail className="w-4 h-4" />}
                label={t('email')}
                value={data.email}
                color={primaryColor}
              />
            )}

            {data.company && (
              <ContactItem
                icon={<Briefcase className="w-4 h-4" />}
                label={t('company')}
                value={data.company}
                color={primaryColor}
              />
            )}

            {data.website && (
              <ContactItem
                icon={<Globe className="w-4 h-4" />}
                label={t('website')}
                value={data.website}
                color={primaryColor}
              />
            )}

            {(data.city || data.country) && (
              <ContactItem
                icon={<MapPin className="w-4 h-4" />}
                label={t('location')}
                value={[data.city, data.country].filter(Boolean).join(', ')}
                color={primaryColor}
              />
            )}

            {/* Rehbere Ekle Butonu (Add to Contacts Button) */}
            <button
              className="w-full mt-4 py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-transform active:scale-95"
              style={{ backgroundColor: primaryColor }}
            >
              <UserPlus className="w-5 h-5" />
              {t('addContact')}
            </button>
          </div>
          
          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-900 rounded-full" />
        </div>
      </div>

      {/* Gölge Efekti (Shadow Effect) */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-4 bg-black/20 blur-xl rounded-full" />
    </div>
  )
}

// Hızlı Aksiyon Butonu (Quick Action Button)
interface ActionButtonProps {
  icon: React.ReactNode
  color: string
  active?: boolean
}

function ActionButton({ icon, color, active }: ActionButtonProps) {
  return (
    <button
      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
        active ? 'bg-white' : 'bg-gray-100'
      }`}
      style={{ color: active ? color : '#9CA3AF' }}
    >
      {icon}
    </button>
  )
}

// İletişim Bilgi Satırı (Contact Info Row)
interface ContactItemProps {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}

function ContactItem({ icon, label, value, color }: ContactItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
      </div>
    </div>
  )
}

