// vCard Landing Page - QR kod taratıldığında açılan sayfa
// Telefon mockup tasarımına benzer güzel bir landing page

import { Phone, Mail, Globe, MapPin, Briefcase, UserPlus, Download } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { getTranslations } from 'next-intl/server'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// vCard verilerini URL-safe base64'den decode et (Decode vCard data from URL-safe base64)
function decodeVCardData(encodedData: string): Record<string, string> | null {
  try {
    // URL-safe karakterleri standart base64'e çevir (Convert URL-safe chars to standard base64)
    let base64 = encodedData.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    const decoded = decodeURIComponent(escape(atob(base64)))
    const parsed = JSON.parse(decoded)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, string>
    }
    return null
  } catch {
    return null
  }
}

// Kaydedilmiş vCard'ı veritabanından çek (Load saved vCard from DB by UUID)
async function loadVCardFromDb(uuid: string): Promise<Record<string, string> | null> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('qr_codes')
      .select('content')
      .eq('id', uuid)
      .single()
    if (error || !data) return null
    const content = data.content as { raw?: Record<string, unknown> } | null
    const raw = content?.raw || {}
    // Tüm değerleri string'e çevir (mobile, workPhone, primaryColor vb.)
    const out: Record<string, string> = {}
    for (const [k, v] of Object.entries(raw)) {
      if (v == null) continue
      out[k] = typeof v === 'string' ? v : String(v)
    }
    return out
  } catch {
    return null
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
  const t = await getTranslations('generator')

  // Önce UUID mi diye bak: kaydedilmiş QR taraması bu yola düşer.
  // Değilse base64-encoded JSON olarak decode etmeyi dene (önizleme akışı).
  let data: Record<string, string> = {}
  if (UUID_REGEX.test(id)) {
    data = (await loadVCardFromDb(id)) || {}
  } else {
    data = decodeVCardData(id) || {}
  }

  const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || t('defaultContactName')
  const primaryColor = data.primaryColor || '#527AC9'
  const secondaryColor = data.secondaryColor || '#7EC09F'
  const template = (data.template === 'modern' || data.template === 'sleek') ? data.template : 'classic'
  const vCardContent = generateVCardFile(data)
  const vCardDataUri = `data:text/vcard;charset=utf-8,${encodeURIComponent(vCardContent)}`
  const addressJoined = [data.street, data.city, data.state, data.zip, data.country].filter(Boolean).join(', ')
  const downloadName = `${fullName.replace(/\s+/g, '_')}.vcf`

  const labels = {
    mobile: t('mobilePhone'),
    work: t('workPhone'),
    email: t('email'),
    website: t('website'),
    address: t('address'),
    saveContact: t('saveContact'),
    downloadVCard: t('downloadVCard'),
    createdWith: t('createdWith'),
  }

  if (template === 'modern') {
    return (
      <ModernLayout
        data={data} fullName={fullName}
        primaryColor={primaryColor} secondaryColor={secondaryColor}
        addressJoined={addressJoined} vCardDataUri={vCardDataUri} downloadName={downloadName}
        labels={labels}
      />
    )
  }

  if (template === 'sleek') {
    return (
      <SleekLayout
        data={data} fullName={fullName}
        primaryColor={primaryColor} secondaryColor={secondaryColor}
        addressJoined={addressJoined} vCardDataUri={vCardDataUri} downloadName={downloadName}
        labels={labels}
      />
    )
  }

  // Default: Classic template
  return (
    <div className="h-screen h-[100dvh] flex flex-col bg-gray-100 overflow-hidden">
      {/* Header Gradient */}
      <div
        className="pt-8 pb-12 flex flex-col items-center relative flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
        }}
      >
        <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-xl mb-4 overflow-hidden">
          {data.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.photo} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-bold text-white">
              {(data.firstName?.[0] || 'C').toUpperCase()}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-white text-center px-4 uppercase tracking-wide">{fullName}</h1>
        {data.title && (
          <p className="text-white/90 mt-1 text-sm uppercase tracking-wider">{data.title}</p>
        )}
        {data.company && (
          <p className="text-white/70 text-sm flex items-center gap-1 mt-1">
            <Briefcase className="w-4 h-4" />
            {data.company}
          </p>
        )}

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H0Z" fill="#f3f4f6" />
          </svg>
        </div>
      </div>

      {/* Ortadaki scrollable alan */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="max-w-md mx-auto w-full px-4 -mt-8 pb-6 relative z-10">
          <div className="flex justify-center gap-4 mb-5">
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

          <div className="space-y-2.5">
            <ContactCard icon={<Phone />} label={labels.mobile} value={data.mobile} href={`tel:${data.mobile}`} color={primaryColor} />
            <ContactCard icon={<Phone />} label={labels.work} value={data.workPhone} href={`tel:${data.workPhone}`} color={primaryColor} />
            <ContactCard icon={<Mail />} label={labels.email} value={data.email} href={`mailto:${data.email}`} color={primaryColor} />
            <ContactCard icon={<Globe />} label={labels.website} value={data.website} href={data.website} color={primaryColor} />
            <ContactCard icon={<MapPin />} label={labels.address} value={addressJoined} color={primaryColor} multiline />
          </div>
        </div>
      </div>

      {/* Sabit alt buton barı */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 pt-3 pb-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="max-w-md mx-auto w-full space-y-2">
          <a href={vCardDataUri} download={downloadName}
            className="w-full py-3.5 rounded-2xl text-white font-semibold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
            style={{ backgroundColor: primaryColor }}>
            <UserPlus className="w-5 h-5" />
            {labels.saveContact}
          </a>
          <a href={vCardDataUri} download={downloadName}
            className="w-full py-2.5 rounded-xl bg-gray-50 text-gray-700 font-medium flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-100 transition-all text-sm">
            <Download className="w-4 h-4" />
            {labels.downloadVCard}
          </a>
          <p className="text-center text-gray-400 text-[10px] pt-1">{labels.createdWith}</p>
        </div>
      </div>
    </div>
  )
}

interface LayoutProps {
  data: Record<string, string>
  fullName: string
  primaryColor: string
  secondaryColor: string
  addressJoined: string
  vCardDataUri: string
  downloadName: string
  labels: {
    mobile: string; work: string; email: string; website: string; address: string
    saveContact: string; downloadVCard: string; createdWith: string
  }
}

// MODERN — Tam ekran gradient + ortada yüzen beyaz kart
function ModernLayout({ data, fullName, primaryColor, secondaryColor, addressJoined, vCardDataUri, downloadName, labels }: LayoutProps) {
  return (
    <div className="h-screen h-[100dvh] flex flex-col relative overflow-hidden" style={{ background: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})` }}>
      {/* Dekor blur daireler */}
      <div className="absolute top-[-60px] right-[-60px] w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-60px] w-56 h-56 bg-black/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md mx-auto w-full px-4 pt-6 pb-2 relative z-10 flex-1 flex flex-col min-h-0">
        {/* Yüzen kart - viewport'a kilitlenir */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Üst banner */}
          <div className="h-12 relative flex-shrink-0" style={{ backgroundColor: `${primaryColor}15` }} />

          {/* Avatar overlap */}
          <div className="flex justify-center -mt-10 px-6 flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg overflow-hidden">
              <div className="w-full h-full rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                {data.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.photo} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-gray-400">{(data.firstName?.[0] || 'C').toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>

          {/* İsim & Ünvan */}
          <div className="text-center px-6 mt-3 flex-shrink-0">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">{fullName}</h1>
            {data.title && (
              <p className="text-[11px] font-bold uppercase tracking-widest mt-1" style={{ color: primaryColor }}>{data.title}</p>
            )}
            {data.company && <p className="text-xs text-gray-500 mt-1">{data.company}</p>}
          </div>

          {/* Hızlı aksiyonlar */}
          <div className="flex justify-center gap-3 mt-4 px-6 flex-shrink-0">
            {data.mobile && (
              <a href={`tel:${data.mobile}`} className="w-11 h-11 rounded-full bg-white border-2 shadow-md flex items-center justify-center" style={{ borderColor: primaryColor, color: primaryColor }}>
                <Phone className="w-4 h-4" />
              </a>
            )}
            {data.email && (
              <a href={`mailto:${data.email}`} className="w-11 h-11 rounded-full bg-white border-2 shadow-md flex items-center justify-center" style={{ borderColor: primaryColor, color: primaryColor }}>
                <Mail className="w-4 h-4" />
              </a>
            )}
            {data.website && (
              <a href={data.website} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-white border-2 shadow-md flex items-center justify-center" style={{ borderColor: primaryColor, color: primaryColor }}>
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* İletişim listesi - sadece bu kısım scroll olur */}
          <div className="px-6 mt-4 flex-1 overflow-y-auto overscroll-contain min-h-0">
            <div className="space-y-2 pb-2">
              <ModernRow icon={<Phone className="w-4 h-4" />} label={labels.mobile} value={data.mobile} href={data.mobile ? `tel:${data.mobile}` : undefined} />
              <ModernRow icon={<Phone className="w-4 h-4" />} label={labels.work} value={data.workPhone} href={data.workPhone ? `tel:${data.workPhone}` : undefined} />
              <ModernRow icon={<Mail className="w-4 h-4" />} label={labels.email} value={data.email} href={data.email ? `mailto:${data.email}` : undefined} />
              <ModernRow icon={<Globe className="w-4 h-4" />} label={labels.website} value={data.website} href={data.website} />
              <ModernRow icon={<MapPin className="w-4 h-4" />} label={labels.address} value={addressJoined} multiline />
            </div>
          </div>

          {/* Sabit buton barı - kart içinde */}
          <div className="px-6 pt-3 pb-4 space-y-2 flex-shrink-0 border-t border-gray-100">
            <a href={vCardDataUri} download={downloadName}
              className="w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
              style={{ backgroundColor: primaryColor }}>
              <UserPlus className="w-4 h-4" />
              {labels.saveContact}
            </a>
            <a href={vCardDataUri} download={downloadName}
              className="w-full py-2.5 rounded-xl bg-gray-50 text-gray-700 font-medium flex items-center justify-center gap-2 border border-gray-200 text-sm">
              <Download className="w-4 h-4" />
              {labels.downloadVCard}
            </a>
          </div>
        </div>

        <p className="text-center text-white/80 text-[10px] pt-2 flex-shrink-0">{labels.createdWith}</p>
      </div>
    </div>
  )
}

// SLEEK — Koyu tema, premium kart görünümü
function SleekLayout({ data, fullName, primaryColor, secondaryColor, addressJoined, vCardDataUri, downloadName, labels }: LayoutProps) {
  return (
    <div className="h-screen h-[100dvh] flex flex-col bg-gray-900 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 opacity-20 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" style={{ backgroundColor: primaryColor }} />

      {/* Üst aksent çizgisi */}
      <div className="h-1.5 w-full flex-shrink-0 relative z-10" style={{ background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` }} />

      {/* Üst sabit kısım: avatar + isim */}
      <div className="max-w-md mx-auto w-full px-6 pt-6 pb-4 relative z-10 flex-shrink-0">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full blur opacity-60" style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }} />
            <div className="relative w-24 h-24 rounded-full border-4 border-gray-900 bg-gray-800 overflow-hidden flex items-center justify-center">
              {data.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.photo} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-gray-400">{(data.firstName?.[0] || 'C').toUpperCase()}</span>
              )}
            </div>
            <div className="absolute bottom-1 right-1 bg-white text-gray-900 w-7 h-7 rounded-full flex items-center justify-center border-4 border-gray-900 shadow-sm">
              <Briefcase className="w-3 h-3" />
            </div>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-xl font-bold text-white tracking-wide uppercase">{fullName}</h1>
          {data.title && (
            <div className="inline-block mt-1.5 px-3 py-0.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <p className="text-[11px] font-medium tracking-widest text-gray-300 uppercase">{data.title}</p>
            </div>
          )}
          {data.company && <p className="text-gray-400 text-xs mt-1.5">{data.company}</p>}
        </div>
      </div>

      {/* Ortadaki scrollable iletişim listesi */}
      <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 relative z-10">
        <div className="max-w-md mx-auto w-full px-6 pb-4 space-y-2.5">
          <SleekRow icon={<Phone className="w-4 h-4" />} label={labels.mobile} value={data.mobile} href={data.mobile ? `tel:${data.mobile}` : undefined} color={primaryColor} />
          <SleekRow icon={<Phone className="w-4 h-4" />} label={labels.work} value={data.workPhone} href={data.workPhone ? `tel:${data.workPhone}` : undefined} color={primaryColor} />
          <SleekRow icon={<Mail className="w-4 h-4" />} label={labels.email} value={data.email} href={data.email ? `mailto:${data.email}` : undefined} color={primaryColor} />
          <SleekRow icon={<Globe className="w-4 h-4" />} label={labels.website} value={data.website} href={data.website} color={primaryColor} />
          <SleekRow icon={<MapPin className="w-4 h-4" />} label={labels.address} value={addressJoined} color={primaryColor} multiline />
        </div>
      </div>

      {/* Sabit alt buton barı */}
      <div className="flex-shrink-0 bg-gray-900/95 backdrop-blur-md border-t border-white/10 px-6 pt-3 pb-3 relative z-10">
        <div className="max-w-md mx-auto w-full space-y-2">
          <a href={vCardDataUri} download={downloadName}
            className="w-full py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all uppercase tracking-widest text-xs"
            style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
            <UserPlus className="w-4 h-4" />
            {labels.saveContact}
          </a>
          <a href={vCardDataUri} download={downloadName}
            className="w-full py-2.5 rounded-xl bg-white/5 text-white font-medium flex items-center justify-center gap-2 border border-white/10 text-sm">
            <Download className="w-4 h-4" />
            {labels.downloadVCard}
          </a>
          <p className="text-center text-gray-500 text-[10px] pt-1">{labels.createdWith}</p>
        </div>
      </div>
    </div>
  )
}

// Modern alt-bileşeni
interface RowProps {
  icon: React.ReactNode
  label: string
  value?: string
  href?: string
  multiline?: boolean
}
function ModernRow({ icon, label, value, href, multiline }: RowProps) {
  if (!value) return null
  const content = (
    <div className="flex items-start gap-3 py-2">
      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{label}</p>
        <p className={`text-sm font-semibold text-gray-900 ${multiline ? 'break-words' : 'truncate'}`}>{value}</p>
      </div>
    </div>
  )
  if (href) {
    return <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{content}</a>
  }
  return content
}

// Sleek alt-bileşeni
interface SleekRowProps extends RowProps { color: string }
function SleekRow({ icon, label, value, href, color, multiline }: SleekRowProps) {
  if (!value) return null
  const content = (
    <div className="flex items-start gap-4 p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg flex-shrink-0" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0 self-center">
        <p className={`text-sm font-semibold text-white ${multiline ? 'break-words' : 'truncate'}`}>{value}</p>
        <p className="text-[10px] font-bold tracking-wider uppercase opacity-50 text-white mt-0.5">{label}</p>
      </div>
    </div>
  )
  if (href) {
    return <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{content}</a>
  }
  return content
}

// İletişim Kartı Bileşeni (Contact Card Component)
interface ContactCardProps {
  icon: React.ReactNode
  label: string
  value?: string
  href?: string
  color: string
  multiline?: boolean
}

function ContactCard({ icon, label, value, href, color, multiline = false }: ContactCardProps) {
  if (!value) return null

  const content = (
    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0 self-center">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className={`text-gray-900 font-medium ${multiline ? 'break-words whitespace-normal' : 'truncate'}`}>
          {value}
        </p>
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

