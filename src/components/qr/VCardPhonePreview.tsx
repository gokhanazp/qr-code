// vCard Telefon Önizleme Bileşeni (vCard Phone Preview Component)
// Telefon mockup içinde canlı vCard önizlemesi - Çoklu Şablon Desteği
// Premium Tasarımlar & Kusursuz Hizalama

'use client'

import { Phone, Mail, Globe, MapPin, UserPlus, Briefcase, Share2, Linkedin, Facebook, Twitter, Instagram, Youtube, User } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import clsx from 'clsx'

interface VCardPhonePreviewProps {
  data: Record<string, string>
  primaryColor: string
  secondaryColor: string
  template?: 'classic' | 'modern' | 'sleek'
}

export default function VCardPhonePreview({ data, primaryColor, secondaryColor, template = 'classic' }: VCardPhonePreviewProps) {
  const t = useTranslations('generator')
  const fullName = `${data.firstName || t('name')} ${data.lastName || t('surname')}`.trim()
  const jobTitle = data.title
  const company = data.company

  // Sosyal Medya İkonları
  const renderSocials = (color: string) => (
    <div className="flex justify-center gap-4 mt-6 pb-4">
      {['linkedin', 'twitter', 'instagram', 'facebook'].map((social, i) => (
        <div key={social}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          {social === 'linkedin' && <Linkedin className="w-4 h-4" />}
          {social === 'twitter' && <Twitter className="w-4 h-4" />}
          {social === 'instagram' && <Instagram className="w-4 h-4" />}
          {social === 'facebook' && <Facebook className="w-4 h-4" />}
        </div>
      ))}
    </div>
  )

  // --- 1. CLASSIC TEMPLATE: Dengeli & Kurumsal ---
  // Header gradyan, ortalanmış avatar, net bilgi listesi
  const renderClassic = () => (
    <div className="h-full bg-gray-50 flex flex-col items-center overflow-hidden font-sans">
      {/* Kavisli Header */}
      <div
        className="w-full h-40 flex-shrink-0 relative"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          borderBottomLeftRadius: '40px',
          borderBottomRightRadius: '40px'
        }}
      >
        <div className="absolute inset-0 bg-black/5" /> {/* Hafif doku */}
      </div>

      {/* Avatar & İsim Alanı */}
      <div className="-mt-16 flex flex-col items-center w-full px-4 relative z-10">
        <div className="w-28 h-28 rounded-full p-1 bg-white shadow-xl">
          <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 relative">
            {data.photo ? (
              <Image src={data.photo} alt={fullName} fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                <User className="w-10 h-10" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 text-center">
          <h2 className="text-xl font-bold text-gray-900 leading-tight">{fullName}</h2>
          {jobTitle && <p className="text-sm font-medium opacity-80 mt-1" style={{ color: primaryColor }}>{jobTitle.toUpperCase()}</p>}
          {company && <p className="text-xs text-gray-500 mt-0.5">{company}</p>}
        </div>

        {/* Action Bar */}
        <div className="flex gap-4 mt-5 mb-4 w-full justify-center">
          <ClassicActionButton icon={<Phone className="w-5 h-5" />} label="Call" active={!!data.mobile} color={primaryColor} />
          <ClassicActionButton icon={<Mail className="w-5 h-5" />} label="Email" active={!!data.email} color={primaryColor} />
          <ClassicActionButton icon={<Globe className="w-5 h-5" />} label="Web" active={!!data.website} color={primaryColor} />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="w-full px-4 flex-1 overflow-y-auto no-scrollbar pb-8 space-y-3">
        {data.mobile && <ContactCard icon={<Phone className="w-4 h-4" />} label={t('mobilePhone')} value={data.mobile} color={primaryColor} />}
        {data.email && <ContactCard icon={<Mail className="w-4 h-4" />} label={t('email')} value={data.email} color={primaryColor} />}
        {data.website && <ContactCard icon={<Globe className="w-4 h-4" />} label={t('website')} value={data.website} color={primaryColor} />}
        {(data.city || data.country) && <ContactCard icon={<MapPin className="w-4 h-4" />} label={t('location')} value={[data.city, data.country].filter(Boolean).join(', ')} color={primaryColor} />}

        <button
          className="w-full mt-4 py-3.5 rounded-xl text-white font-bold tracking-wide shadow-lg shadow-blue-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
        >
          <UserPlus className="w-5 h-5" />
          {t('saveContact')}
        </button>

        {renderSocials(primaryColor)}
      </div>
    </div>
  )

  // --- 2. MODERN TEMPLATE: Yüzen Kart & Glassmorphism ---
  // Tam ekran renkli arka plan, ortada yüzen beyaz kart
  const renderModern = () => (
    <div className="h-full flex flex-col relative overflow-hidden font-sans">
      {/* Full Background Gradient */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})` }} />

      {/* Decorative Circles */}
      <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-black/10 rounded-full blur-2xl" />

      {/* Main Floating Card */}
      <div className="absolute inset-x-4 top-24 bottom-8 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl flex flex-col items-center overflow-hidden">
        {/* Top Banner (Small color strip) */}
        <div className="w-full h-20 bg-gray-50 relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundColor: primaryColor }} />
        </div>

        {/* Avatar (Overlapping) */}
        <div className="-mt-12 w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
          <div className="w-full h-full rounded-xl overflow-hidden bg-gray-100 relative">
            {data.photo ? (
              <Image src={data.photo} alt={fullName} fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                <User className="w-8 h-8" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 text-center px-6 w-full flex-1 overflow-y-auto no-scrollbar">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">{fullName}</h2>
          {jobTitle && <p className="text-xs font-bold uppercase tracking-widest mt-1 opacity-70" style={{ color: primaryColor }}>{jobTitle}</p>}

          <div className="flex justify-center gap-4 my-6">
            <ModernIconBtn icon={<Phone className="w-5 h-5" />} active={!!data.mobile} color={primaryColor} />
            <ModernIconBtn icon={<Mail className="w-5 h-5" />} active={!!data.email} color={primaryColor} />
            <ModernIconBtn icon={<Globe className="w-5 h-5" />} active={!!data.website} color={primaryColor} />
          </div>

          <div className="space-y-4 text-left">
            {data.mobile && <ModernRow icon={<Phone className="w-4 h-4" />} label="Mobile" value={data.mobile} />}
            {data.email && <ModernRow icon={<Mail className="w-4 h-4" />} label="Email" value={data.email} />}
            {data.website && <ModernRow icon={<Globe className="w-4 h-4" />} label="Website" value={data.website} />}
          </div>

          <button
            className="w-full mt-8 py-3 rounded-xl text-white font-bold shadow-lg transform hover:-translate-y-1 transition-all"
            style={{ backgroundColor: primaryColor }}
          >
            {t('addContact')}
          </button>
          <div className="pb-6" />
        </div>
      </div>
    </div>
  )

  // --- 3. SLEEK TEMPLATE: Profesyonel & Minimalist ---
  // Geniş kapak görseli, üst üste binen avatar, temiz tipografi
  // --- 3. SLEEK TEMPLATE: Premium Dark (VIP Card Style) ---
  // Koyu mod, altın/neon detaylar, özel kulüp kartı görünümü
  const renderSleek = () => (
    <div className="h-full bg-gray-900 flex flex-col font-sans overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 opacity-20 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Accent Line */}
      <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` }} />

      <div className="flex-1 px-6 py-8 flex flex-col items-center relative z-10 overflow-y-auto no-scrollbar">
        {/* Avatar Container with Glow */}
        <div className="relative mb-6 group flex-shrink-0">
          <div
            className="absolute -inset-0.5 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"
            style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
          ></div>
          <div className="relative w-32 h-32 rounded-full border-4 border-gray-900 bg-gray-800 overflow-hidden">
            {data.photo ? (
              <Image src={data.photo} alt={fullName} fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                <User className="w-12 h-12" />
              </div>
            )}
          </div>
          {/* Pro/Verified Badge */}
          <div className="absolute bottom-1 right-1 bg-white text-gray-900 w-8 h-8 rounded-full flex items-center justify-center border-4 border-gray-900 shadow-sm">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="text-center w-full mb-8">
          <h2 className="text-2xl font-bold text-white tracking-wide">{fullName.toUpperCase()}</h2>
          {jobTitle && (
            <div className="inline-block mt-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <p className="text-xs font-medium tracking-widest text-gray-300 uppercase">{jobTitle}</p>
            </div>
          )}
        </div>

        <div className="w-full space-y-3">
          {data.mobile && <SleekDarkRow icon={<Phone className="w-4 h-4" />} value={data.mobile} label="Mobile" color={primaryColor} />}
          {data.email && <SleekDarkRow icon={<Mail className="w-4 h-4" />} value={data.email} label="Email" color={primaryColor} />}
          {data.website && <SleekDarkRow icon={<Globe className="w-4 h-4" />} value={data.website} label="Website" color={primaryColor} />}
          {data.address && <SleekDarkRow icon={<MapPin className="w-4 h-4" />} value={data.address} label="Location" color={primaryColor} />}

          <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/5">
            {['linkedin', 'twitter', 'instagram', 'facebook'].map((social) => (
              <div key={social} className="aspect-square rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer border border-white/5">
                {social === 'linkedin' && <Linkedin className="w-4 h-4" />}
                {social === 'twitter' && <Twitter className="w-4 h-4" />}
                {social === 'instagram' && <Instagram className="w-4 h-4" />}
                {social === 'facebook' && <Facebook className="w-4 h-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-[20px]" />

        <button
          className="w-full py-4 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3 relative overflow-hidden group flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
          }}
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative z-10">{t('saveContact')}</span>
          <UserPlus className="w-4 h-4 relative z-10" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="relative transform-gpu">
      {/* Telefon Çerçevesi */}
      <div className="relative w-[280px] h-[580px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl ring-4 ring-gray-900/50">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-30" />

        {/* Screen Container */}
        <div className="relative w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col backface-hidden">
          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-8 z-20 pointer-events-none">
            <span className={clsx("text-[10px] font-semibold", template === 'modern' ? "text-white" : "text-black mix-blend-difference")}>9:41</span>
            <div className="flex items-center gap-1">
              <div className={clsx("w-4 h-2.5 rounded-[2px] border", template === 'modern' ? "border-white" : "border-black mix-blend-difference")}>
                <div className={clsx("w-full h-full bg-current", template === 'modern' ? "text-white" : "text-black mix-blend-difference")} />
              </div>
            </div>
          </div>

          {/* Render Templates */}
          {template === 'modern' && renderModern()}
          {template === 'sleek' && renderSleek()}
          {template === 'classic' && renderClassic()}

          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full z-30 mix-blend-difference" />
        </div>
      </div>
    </div>
  )
}

// ---------------- SUB COMPONENTS ----------------

// 1. Classic Helper Components
function ClassicActionButton({ icon, label, active, color }: any) {
  return (
    <div className={clsx("flex flex-col items-center gap-1", !active && "opacity-30 grayscale")}>
      <div className="w-12 h-12 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-700 transition-transform active:scale-95" style={{ color: active ? color : undefined }}>
        {icon}
      </div>
      <span className="text-[10px] font-medium text-gray-400">{label}</span>
    </div>
  )
}

function ContactCard({ icon, label, value, color }: any) {
  return (
    <div className="flex items-center gap-4 p-3.5 bg-white rounded-2xl shadow-sm border border-gray-50/50">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  )
}

// 2. Modern Helper Components
function ModernIconBtn({ icon, active, color }: any) {
  return (
    <div
      className={clsx("w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all", active ? "bg-white shadow-lg" : "bg-gray-50 border-gray-100 opacity-50")}
      style={{ borderColor: active ? color : 'transparent', color: active ? color : '#999' }}
    >
      {icon}
    </div>
  )
}

function ModernRow({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4 py-1">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-gray-800">{value}</p>
        <p className="text-[10px] text-gray-400 uppercase font-medium">{label}</p>
      </div>
    </div>
  )
}

// 3. Sleek Helper Components
// 3. Sleek Helper Components
function SleekDarkRow({ icon, value, label, color }: any) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{value}</p>
        <p className="text-[10px] font-bold tracking-wider uppercase opacity-50 text-white mt-0.5">{label}</p>
      </div>
    </div>
  )
}
