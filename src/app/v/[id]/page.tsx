// vCard Landing Page - QR kod taratıldığında açılan sayfa
// Telefon mockup tasarımına benzer güzel bir landing page

import { Phone, Mail, Globe, MapPin, Briefcase, UserPlus, Download } from 'lucide-react'

// vCard verilerini URL-safe base64'den decode et (Decode vCard data from URL-safe base64)
function decodeVCardData(encodedData: string): Record<string, string> {
  try {
    // URL-safe karakterleri standart base64'e çevir (Convert URL-safe chars to standard base64)
    // - -> +, _ -> /, padding ekle
    let base64 = encodedData.replace(/-/g, '+').replace(/_/g, '/')
    // Padding ekle (Add padding)
    while (base64.length % 4) {
      base64 += '='
    }
    // Base64 decode, sonra UTF-8 decode
    const decoded = decodeURIComponent(escape(atob(base64)))
    return JSON.parse(decoded)
  } catch (error) {
    console.error('vCard decode error:', error)
    return {}
  }
}

// vCard dosyası oluştur
function generateVCardFile(data: Record<string, string>): string {
  return `BEGIN:VCARD
VERSION:3.0
N:${data.lastName || ''};${data.firstName || ''};;;
FN:${data.firstName || ''} ${data.lastName || ''}
ORG:${data.company || ''}
TITLE:${data.title || ''}
TEL;TYPE=WORK,VOICE:${data.workPhone || ''}
TEL;TYPE=CELL,VOICE:${data.mobile || ''}
EMAIL:${data.email || ''}
URL:${data.website || ''}
ADR;TYPE=WORK:;;${data.street || ''};${data.city || ''};${data.state || ''};${data.zip || ''};${data.country || ''}
NOTE:${data.note || ''}
END:VCARD`
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function VCardLandingPage({ params }: PageProps) {
  const { id } = await params
  const data = decodeVCardData(id)
  
  const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Contact'
  const primaryColor = data.primaryColor || '#527AC9'
  const secondaryColor = data.secondaryColor || '#7EC09F'
  const vCardContent = generateVCardFile(data)
  const vCardDataUri = `data:text/vcard;charset=utf-8,${encodeURIComponent(vCardContent)}`

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Gradient - İsim ve profil dahil (Including name and profile) */}
      <div
        className="pt-12 pb-16 flex flex-col items-center relative"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
        }}
      >
        {/* Profil Resmi / Baş Harf (Profile / Initial) */}
        <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-xl mb-4">
          <span className="text-4xl font-bold text-white">
            {(data.firstName?.[0] || 'C').toUpperCase()}
          </span>
        </div>

        {/* İsim ve Ünvan - Gradient içinde (Name and Title - Inside gradient) */}
        <h1 className="text-2xl font-bold text-white text-center px-4 uppercase tracking-wide">
          {fullName}
        </h1>
        {data.title && (
          <p className="text-white/90 mt-1 text-sm uppercase tracking-wider">{data.title}</p>
        )}
        {data.company && (
          <p className="text-white/70 text-sm flex items-center gap-1 mt-1">
            <Briefcase className="w-4 h-4" />
            {data.company}
          </p>
        )}

        {/* Dalga Şekli (Wave Shape) */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H0Z" fill="#f3f4f6" />
          </svg>
        </div>
      </div>

      {/* İçerik Alanı (Content Area) */}
      <div className="max-w-md mx-auto px-4 -mt-8 pb-8 relative z-10">

        {/* Hızlı Aksiyonlar (Quick Actions) */}
        <div className="flex justify-center gap-4 mb-6">
          {data.mobile && (
            <a href={`tel:${data.mobile}`} className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform" style={{ color: primaryColor }}>
              <Phone className="w-6 h-6" />
            </a>
          )}
          {data.email && (
            <a href={`mailto:${data.email}`} className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform" style={{ color: primaryColor }}>
              <Mail className="w-6 h-6" />
            </a>
          )}
          {data.website && (
            <a href={data.website} target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform" style={{ color: primaryColor }}>
              <Globe className="w-6 h-6" />
            </a>
          )}
        </div>

        {/* İletişim Kartları (Contact Cards) */}
        <div className="space-y-3">
          <ContactCard icon={<Phone />} label="Mobile" value={data.mobile} href={`tel:${data.mobile}`} color={primaryColor} />
          <ContactCard icon={<Phone />} label="Work" value={data.workPhone} href={`tel:${data.workPhone}`} color={primaryColor} />
          <ContactCard icon={<Mail />} label="Email" value={data.email} href={`mailto:${data.email}`} color={primaryColor} />
          <ContactCard icon={<Globe />} label="Website" value={data.website} href={data.website} color={primaryColor} />
          <ContactCard icon={<MapPin />} label="Address" value={[data.street, data.city, data.country].filter(Boolean).join(', ')} color={primaryColor} />
        </div>

        {/* Rehbere Ekle Butonu (Add to Contacts Button) */}
        <a
          href={vCardDataUri}
          download={`${fullName.replace(/\s+/g, '_')}.vcf`}
          className="w-full mt-8 py-4 rounded-2xl text-white font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-95"
          style={{ backgroundColor: primaryColor }}
        >
          <UserPlus className="w-6 h-6" />
          Add to Contacts
        </a>

        {/* Download vCard */}
        <a
          href={vCardDataUri}
          download={`${fullName.replace(/\s+/g, '_')}.vcf`}
          className="w-full mt-3 py-3 rounded-xl bg-white text-gray-700 font-medium flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 transition-all"
        >
          <Download className="w-5 h-5" />
          Download vCard
        </a>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-8">
          Created with QR Code Shine
        </p>
      </div>
    </div>
  )
}

// İletişim Kartı Bileşeni (Contact Card Component)
interface ContactCardProps {
  icon: React.ReactNode
  label: string
  value?: string
  href?: string
  color: string
}

function ContactCard({ icon, label, value, href, color }: ContactCardProps) {
  if (!value) return null

  const content = (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-gray-900 font-medium truncate">{value}</p>
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
        {content}
      </a>
    )
  }

  return content
}

