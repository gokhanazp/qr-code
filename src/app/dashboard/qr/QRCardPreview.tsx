'use client'

// QR Kart Önizleme - APP ve vCard tipi için mini preview
// Mini preview component for APP and vCard types

import { QrCode, User, Phone, Mail, Globe, Building } from 'lucide-react'

interface QRCardPreviewProps {
  type: string
  content: unknown
}

// APP tipi için verileri parse et
function parseAppData(content: unknown): Record<string, string> {
  if (!content) return {}
  try {
    if (typeof content === 'object') {
      const obj = content as Record<string, unknown>
      // Önce raw içindeki verileri kontrol et (kaydetme sırasında rawContent olarak gönderiliyor)
      if (obj.raw && typeof obj.raw === 'object') {
        return obj.raw as Record<string, string>
      }
      // encoded içindeki JSON string'i parse et
      if (obj.encoded && typeof obj.encoded === 'string') {
        try {
          return JSON.parse(obj.encoded) as Record<string, string>
        } catch { /* ignore */ }
      }
      return obj as Record<string, string>
    }
    if (typeof content === 'string') {
      return JSON.parse(content)
    }
  } catch { /* ignore */ }
  return {}
}

// vCard tipi için verileri parse et
function parseVCardData(content: unknown): Record<string, string> {
  if (!content) return {}
  try {
    if (typeof content === 'object') {
      const obj = content as Record<string, unknown>
      if (obj.raw && typeof obj.raw === 'object') return obj.raw as Record<string, string>
      return obj as Record<string, string>
    }
  } catch { /* ignore */ }
  return {}
}

export default function QRCardPreview({ type, content }: QRCardPreviewProps) {
  // APP tipi önizlemesi
  if (type === 'app') {
    const data = parseAppData(content)
    const primaryColor = data.primaryColor || '#2d8659'
    const secondaryColor = data.secondaryColor || '#a8e6cf'
    
    return (
      <div 
        className="w-16 h-16 rounded-lg overflow-hidden flex flex-col items-center justify-center p-1"
        style={{ background: `linear-gradient(to bottom, ${secondaryColor}, ${primaryColor})` }}
      >
        {data.appLogo ? (
          <img 
            src={data.appLogo} 
            alt="App" 
            className="w-8 h-8 object-contain bg-white/30 rounded p-0.5"
          />
        ) : (
          <div className="w-8 h-8 bg-white/30 rounded flex items-center justify-center">
            <span className="text-lg">📱</span>
          </div>
        )}
        <p className="text-[6px] text-white font-bold mt-0.5 truncate w-full text-center">
          {data.appName || 'APP'}
        </p>
      </div>
    )
  }

  // vCard tipi önizlemesi
  if (type === 'vcard') {
    const data = parseVCardData(content)
    const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim()
    
    return (
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg overflow-hidden flex flex-col items-center justify-center p-1 text-white">
        <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center mb-0.5">
          <User className="w-4 h-4" />
        </div>
        <p className="text-[6px] font-bold truncate w-full text-center">
          {fullName || 'Kişi'}
        </p>
        <div className="flex gap-1 mt-0.5">
          {data.phone && <Phone className="w-2 h-2 opacity-70" />}
          {data.email && <Mail className="w-2 h-2 opacity-70" />}
          {data.website && <Globe className="w-2 h-2 opacity-70" />}
          {data.company && <Building className="w-2 h-2 opacity-70" />}
        </div>
      </div>
    )
  }

  // Diğer tipler için varsayılan ikon
  return (
    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
      <QrCode className="w-8 h-8 text-gray-600" />
    </div>
  )
}

