// QR Frame Seçici bileşeni (QR Frame Selector Component)
// Görsel thumbnail önizlemeli çerçeve tasarımları sunar

'use client'

import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'

// Frame tipleri tanımı (Frame types definition)
export interface FrameType {
  id: string
  name: string
  borderRadius: number
  borderWidth: number
  padding: number
  hasText: boolean
  textPosition: 'top' | 'bottom'
  defaultText: string
  frameStyle: 'none' | 'simple' | 'bubble' | 'bubble-top' | 'video' | 'badge' | 'arrow' | 'text-bottom' | 'shopping' | 'tag'
  backgroundColor?: string
  textColor?: string
}

// Önceden tanımlı frame'ler (Predefined frames)
export const FRAME_TEMPLATES: FrameType[] = [
  {
    id: 'none',
    name: 'None',
    borderRadius: 0,
    borderWidth: 0,
    padding: 0,
    hasText: false,
    textPosition: 'bottom',
    defaultText: '',
    frameStyle: 'none',
  },
  {
    id: 'simple',
    name: 'Simple',
    borderRadius: 4,
    borderWidth: 8,
    padding: 8,
    hasText: true,
    textPosition: 'bottom',
    defaultText: 'SCAN ME',
    frameStyle: 'simple',
    backgroundColor: '#000000',
  },
  {
    id: 'bubble-top',
    name: 'Bubble Top',
    borderRadius: 4,
    borderWidth: 2,
    padding: 10,
    hasText: true,
    textPosition: 'top',
    defaultText: 'SCAN ME',
    frameStyle: 'bubble-top',
    backgroundColor: '#333333',
  },
  {
    id: 'border',
    name: 'Border',
    borderRadius: 0,
    borderWidth: 3,
    padding: 6,
    hasText: true,
    textPosition: 'top',
    defaultText: 'SCAN ME',
    frameStyle: 'bubble',
    backgroundColor: '#4CAF50',
  },
  {
    id: 'video',
    name: 'Video',
    borderRadius: 4,
    borderWidth: 4,
    padding: 10,
    hasText: true,
    textPosition: 'bottom',
    defaultText: 'WATCH NOW',
    frameStyle: 'video',
    backgroundColor: '#2196F3',
  },
  {
    id: 'badge',
    name: 'Badge',
    borderRadius: 8,
    borderWidth: 0,
    padding: 12,
    hasText: true,
    textPosition: 'bottom',
    defaultText: 'SCAN ME',
    frameStyle: 'badge',
    backgroundColor: '#4CAF50',
  },
  {
    id: 'arrow',
    name: 'Arrow',
    borderRadius: 0,
    borderWidth: 0,
    padding: 8,
    hasText: true,
    textPosition: 'bottom',
    defaultText: 'Scan me',
    frameStyle: 'arrow',
    backgroundColor: '#000000',
  },
  {
    id: 'text-bottom',
    name: 'Text Bottom',
    borderRadius: 0,
    borderWidth: 0,
    padding: 8,
    hasText: true,
    textPosition: 'bottom',
    defaultText: 'SCAN ME',
    frameStyle: 'text-bottom',
    backgroundColor: '#000000',
  },
  {
    id: 'shopping',
    name: 'Shopping',
    borderRadius: 4,
    borderWidth: 0,
    padding: 12,
    hasText: true,
    textPosition: 'bottom',
    defaultText: 'SCAN ME',
    frameStyle: 'shopping',
    backgroundColor: '#000000',
  },
  {
    id: 'tag',
    name: 'Tag',
    borderRadius: 4,
    borderWidth: 0,
    padding: 10,
    hasText: true,
    textPosition: 'bottom',
    defaultText: 'SCAN ME',
    frameStyle: 'tag',
    backgroundColor: '#1a1a1a',
  },
]

interface QRFrameSelectorProps {
  selectedFrame: string
  frameText: string
  frameColor: string
  onFrameChange: (frameId: string) => void
  onFrameTextChange: (text: string) => void
  onFrameColorChange: (color: string) => void
}

// Mini QR kod SVG komponenti (Mini QR code SVG component)
const MiniQRCode = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 21 21" className={className} fill="currentColor">
    <rect x="0" y="0" width="7" height="7" />
    <rect x="2" y="2" width="3" height="3" fill="white" />
    <rect x="3" y="3" width="1" height="1" />
    <rect x="14" y="0" width="7" height="7" />
    <rect x="16" y="2" width="3" height="3" fill="white" />
    <rect x="17" y="3" width="1" height="1" />
    <rect x="0" y="14" width="7" height="7" />
    <rect x="2" y="16" width="3" height="3" fill="white" />
    <rect x="3" y="17" width="1" height="1" />
    <rect x="8" y="0" width="1" height="1" />
    <rect x="10" y="0" width="1" height="1" />
    <rect x="8" y="2" width="1" height="1" />
    <rect x="10" y="2" width="2" height="1" />
    <rect x="9" y="4" width="1" height="1" />
    <rect x="11" y="4" width="1" height="1" />
    <rect x="8" y="6" width="2" height="1" />
    <rect x="11" y="6" width="1" height="1" />
    <rect x="0" y="8" width="1" height="1" />
    <rect x="2" y="8" width="2" height="1" />
    <rect x="5" y="8" width="1" height="1" />
    <rect x="8" y="8" width="1" height="1" />
    <rect x="10" y="8" width="1" height="1" />
    <rect x="12" y="8" width="1" height="1" />
    <rect x="0" y="10" width="1" height="1" />
    <rect x="3" y="10" width="1" height="1" />
    <rect x="5" y="10" width="2" height="1" />
    <rect x="9" y="10" width="2" height="1" />
    <rect x="0" y="12" width="2" height="1" />
    <rect x="4" y="12" width="1" height="1" />
    <rect x="6" y="12" width="1" height="1" />
    <rect x="8" y="12" width="2" height="1" />
    <rect x="11" y="12" width="1" height="1" />
    <rect x="14" y="8" width="2" height="1" />
    <rect x="17" y="8" width="2" height="1" />
    <rect x="20" y="8" width="1" height="1" />
    <rect x="14" y="10" width="1" height="1" />
    <rect x="16" y="10" width="1" height="1" />
    <rect x="19" y="10" width="2" height="1" />
    <rect x="14" y="12" width="2" height="1" />
    <rect x="17" y="12" width="1" height="1" />
    <rect x="19" y="12" width="1" height="1" />
    <rect x="8" y="14" width="1" height="1" />
    <rect x="10" y="14" width="2" height="1" />
    <rect x="14" y="14" width="1" height="1" />
    <rect x="16" y="14" width="2" height="1" />
    <rect x="19" y="14" width="2" height="1" />
    <rect x="8" y="16" width="2" height="1" />
    <rect x="11" y="16" width="1" height="1" />
    <rect x="14" y="16" width="1" height="2" />
    <rect x="16" y="16" width="1" height="1" />
    <rect x="18" y="16" width="1" height="1" />
    <rect x="20" y="16" width="1" height="1" />
    <rect x="9" y="18" width="1" height="1" />
    <rect x="11" y="18" width="2" height="1" />
    <rect x="16" y="18" width="2" height="1" />
    <rect x="8" y="20" width="2" height="1" />
    <rect x="11" y="20" width="1" height="1" />
    <rect x="14" y="20" width="3" height="1" />
    <rect x="18" y="20" width="1" height="1" />
    <rect x="20" y="20" width="1" height="1" />
  </svg>
)

// Frame thumbnail komponenti - Her frame için farklı tasarım
const FrameThumbnail = ({ frame }: { frame: FrameType; isSelected: boolean }) => {
  // None - X işareti
  if (frame.id === 'none') {
    return (
      <div className="w-full aspect-square flex items-center justify-center bg-gray-100 rounded">
        <X className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
      </div>
    )
  }

  // Simple - Siyah çerçeve, altta text
  if (frame.id === 'simple') {
    return (
      <div className="w-full aspect-square flex flex-col items-center justify-center p-0.5">
        <div className="bg-black p-1 rounded-sm">
          <div className="bg-white p-0.5">
            <MiniQRCode className="w-7 h-7 text-gray-800" />
          </div>
          <div className="text-[5px] text-white font-bold text-center mt-0.5">SCAN ME</div>
        </div>
      </div>
    )
  }

  // Bubble Top - Üstte konuşma balonu
  if (frame.id === 'bubble-top') {
    return (
      <div className="w-full aspect-square flex flex-col items-center justify-center p-0.5">
        <div className="relative">
          {/* Üstteki balon */}
          <div className="bg-gray-800 text-white text-[5px] font-bold px-1.5 py-0.5 rounded-sm mb-0.5 relative">
            SCAN ME
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-transparent border-t-gray-800" />
          </div>
          {/* QR */}
          <div className="bg-white border border-gray-300 p-0.5">
            <MiniQRCode className="w-7 h-7 text-gray-800" />
          </div>
        </div>
      </div>
    )
  }

  // Border - Yeşil kenarlık, üstte text
  if (frame.id === 'border') {
    return (
      <div className="w-full aspect-square flex flex-col items-center justify-center p-0.5">
        <div className="relative">
          {/* Üstteki text */}
          <div className="text-[5px] font-bold text-center mb-0.5 text-gray-700">SCAN ME</div>
          {/* Yeşil kenarlıklı QR */}
          <div className="border-2 border-green-500 p-0.5 bg-white">
            <MiniQRCode className="w-7 h-7 text-gray-800" />
          </div>
        </div>
      </div>
    )
  }

  // Video - Mavi çerçeve, play butonu
  if (frame.id === 'video') {
    return (
      <div className="w-full aspect-square flex flex-col items-center justify-center p-0.5">
        <div className="bg-blue-500 p-1 rounded-sm">
          <div className="bg-white p-0.5">
            <MiniQRCode className="w-7 h-7 text-gray-800" />
          </div>
          <div className="flex items-center justify-center gap-0.5 mt-0.5">
            <div className="w-2 h-2 bg-white rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-l-[3px] border-y-[2px] border-transparent border-l-blue-500 ml-0.5" />
            </div>
            <span className="text-[4px] text-white font-bold">WATCH NOW</span>
          </div>
        </div>
      </div>
    )
  }

  // Badge - Yeşil rozet/banner
  if (frame.id === 'badge') {
    return (
      <div className="w-full aspect-square flex flex-col items-center justify-center p-0.5">
        <div className="relative">
          <div className="bg-white border border-gray-200 p-0.5 rounded-sm">
            <MiniQRCode className="w-7 h-7 text-gray-800" />
          </div>
          {/* Yeşil banner - sol alt köşede */}
          <div className="absolute -bottom-1 -left-1 bg-green-500 text-white text-[4px] font-bold px-1 py-0.5 rounded-sm transform -rotate-12">
            SCAN ME
          </div>
        </div>
      </div>
    )
  }

  // Arrow - Ok işareti ile
  if (frame.id === 'arrow') {
    return (
      <div className="w-full aspect-square flex flex-col items-center justify-center p-0.5">
        <div className="relative">
          <div className="bg-white border border-gray-200 p-0.5">
            <MiniQRCode className="w-7 h-7 text-gray-800" />
          </div>
          {/* Ok ve text */}
          <div className="absolute -bottom-2 -right-1 flex items-end">
            <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12c0-4 3-8 8-8" />
              <path d="M12 4l-2 2 2 2" />
            </svg>
            <span className="text-[5px] font-medium italic text-gray-700">Scan me</span>
          </div>
        </div>
      </div>
    )
  }

  // Text Bottom - Büyük text altta
  if (frame.id === 'text-bottom') {
    return (
      <div className="w-full aspect-square flex flex-col items-center justify-center p-0.5">
        <div className="flex flex-col items-center">
          <div className="bg-white border border-gray-200 p-0.5">
            <MiniQRCode className="w-6 h-6 text-gray-800" />
          </div>
          <div className="text-[7px] font-black text-gray-800 mt-0.5 tracking-tight">SCAN ME</div>
        </div>
      </div>
    )
  }

  // Shopping - Alışveriş çantası
  if (frame.id === 'shopping') {
    return (
      <div className="w-full aspect-square flex flex-col items-center justify-center p-0.5">
        <div className="relative">
          {/* Çanta sapı */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 border-2 border-gray-800 border-b-0 rounded-t-full" />
          {/* Çanta gövdesi */}
          <div className="bg-white border-2 border-gray-800 p-0.5 rounded-b-sm mt-1">
            <MiniQRCode className="w-6 h-6 text-gray-800" />
          </div>
          {/* Etiket */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[4px] font-bold px-1 py-0.5">
            SCAN ME
          </div>
        </div>
      </div>
    )
  }

  // Tag - Siyah etiket
  if (frame.id === 'tag') {
    return (
      <div className="w-full aspect-square flex flex-col items-center justify-center p-0.5">
        <div className="relative">
          <div className="bg-white border border-gray-200 p-0.5">
            <MiniQRCode className="w-7 h-7 text-gray-800" />
          </div>
          {/* Siyah etiket - sağ alt köşe */}
          <div className="absolute -bottom-1 -right-1 bg-gray-900 text-white text-[4px] font-bold px-1.5 py-0.5 rounded-sm">
            SCAN ME
          </div>
        </div>
      </div>
    )
  }

  // Varsayılan fallback
  return (
    <div className="w-full aspect-square flex items-center justify-center bg-gray-100 rounded">
      <MiniQRCode className="w-8 h-8 text-gray-600" />
    </div>
  )
}

export default function QRFrameSelector({
  selectedFrame,
  frameText,
  frameColor,
  onFrameChange,
  onFrameTextChange,
  onFrameColorChange,
}: QRFrameSelectorProps) {
  const t = useTranslations('generator')

  const currentFrame = FRAME_TEMPLATES.find(f => f.id === selectedFrame) || FRAME_TEMPLATES[0]

  return (
    <div className="space-y-4">
      {/* Frame Grid - Görsel thumbnail'lar */}
      <div className="grid grid-cols-5 gap-2">
        {FRAME_TEMPLATES.map((frame) => (
          <button
            key={frame.id}
            onClick={() => {
              onFrameChange(frame.id)
              if (frame.hasText) {
                onFrameTextChange(frame.defaultText)
              }
            }}
            className={`relative p-1.5 rounded-lg border-2 transition-all hover:scale-105 ${
              selectedFrame === frame.id
                ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            title={frame.name}
          >
            <FrameThumbnail frame={frame} isSelected={selectedFrame === frame.id} />
          </button>
        ))}
      </div>

      {/* Frame Text Input - Sadece text destekleyen frame'lerde göster */}
      {currentFrame.hasText && selectedFrame !== 'none' && (
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('frameText') || 'Frame Text'}
            </label>
            <input
              type="text"
              value={frameText}
              onChange={(e) => onFrameTextChange(e.target.value.toUpperCase())}
              placeholder="SCAN ME"
              maxLength={20}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-center uppercase"
            />
          </div>
        </div>
      )}
    </div>
  )
}

