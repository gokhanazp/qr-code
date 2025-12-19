// QR Frame Seçici bileşeni (QR Frame Selector Component)
// Görsel thumbnail önizlemeli çerçeve tasarımları sunar

'use client'

import { useTranslations } from 'next-intl'
import { X, Check } from 'lucide-react'

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
  frameStyle: 'none' | 'simple' | 'bubble' | 'bubble-top' | 'video' | 'badge' | 'arrow' | 'text-bottom' | 'shopping' | 'tag' | 'chat' | 'gift' | 'envelope' | 'delivery' | 'hand-tray' | 'phone' | 'coffee' | 'menu' | 'cocktail' | 'cloche' | 'external'
  backgroundColor?: string
  textColor?: string
  externalId?: string
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
  // Dışarıdan gelen SVG frame'ler (1-30, 15 hariç) - Premium Frames
  ...Array.from({ length: 30 }, (_, i) => i + 1)
    .filter(id => id !== 15)
    .map(id => ({
      id: `frame-${id}`,
      name: `Frame ${id}`,
      borderRadius: 4,
      borderWidth: 0,
      padding: 0,
      hasText: true,
      textPosition: 'bottom' as const,
      defaultText: 'Tarat',
      frameStyle: 'external' as const,
      backgroundColor: '#000000',
      externalId: id.toString()
    })),
]

interface QRFrameSelectorProps {
  selectedFrame: string
  frameText: string
  frameColor: string
  onFrameChange: (frameId: string) => void
  onFrameTextChange: (text: string) => void
  onFrameColorChange: (color: string) => void
}

// Frame thumbnail komponenti - Her frame için farklı tasarım - SVG tabanlı yüksek kalite
const FrameThumbnail = ({ frame, isSelected }: { frame: FrameType; isSelected: boolean }) => {
  // Renk belirle (Premium Indigo tone)
  const color = frame.id === 'none' ? 'text-gray-300' : isSelected ? 'text-blue-600' : 'text-slate-700'
  const bgColor = isSelected ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-gray-100'

  if (frame.id === 'none') {
    return (
      <div className={`w-full aspect-square flex items-center justify-center rounded-xl border border-dashed transition-all ${isSelected ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200 bg-gray-50/50'}`}>
        <X className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
      </div>
    )
  }

  if (frame.frameStyle === 'external') {
    return (
      <div className={`w-full aspect-square relative p-1 rounded-xl border transition-all shadow-sm ${bgColor}`}>
        <img
          src={`/img/frame/${frame.externalId}.svg`}
          alt={frame.name}
          className="w-full h-full object-contain"
        />
        {/* Önizleme üzerine sembolik QR */}
        <div className="absolute top-[15%] left-[15%] w-[70%] h-[50%] border border-blue-400/30 border-dashed rounded flex items-center justify-center">
          <div className="w-4 h-4 bg-blue-400/10" />
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full aspect-square flex items-center justify-center p-1.5 rounded-xl border transition-all shadow-sm ${bgColor}`}>
      <svg viewBox="0 0 40 40" className={`w-full h-full ${color}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Simplified Frame Styles */}
        {frame.id === 'simple' && (
          <>
            <rect x="2" y="2" width="36" height="36" rx="4" fill="currentColor" fillOpacity="0.1" />
            <rect x="2" y="2" width="36" height="36" rx="4" stroke="currentColor" strokeWidth="1.5" />
            <rect x="2" y="28" width="36" height="10" rx="0" fill="currentColor" />
            <rect x="12" y="32" width="16" height="2" rx="1" fill="white" />
          </>
        )}

        {frame.id === 'bubble-top' && (
          <>
            <rect x="4" y="10" width="32" height="26" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <rect x="10" y="2" width="20" height="8" rx="2" fill="currentColor" />
            <path d="M18 10 L20 13 L22 10" fill="currentColor" />
          </>
        )}

        {frame.id === 'border' && (
          <>
            <rect x="4" y="6" width="32" height="30" rx="1" stroke="#10b981" strokeWidth="2" strokeDasharray="1 1.5" />
            <rect x="10" y="2" width="20" height="8" rx="2" fill="#10b981" />
          </>
        )}

        {frame.id === 'video' && (
          <>
            <rect x="2" y="2" width="36" height="36" rx="4" fill="#3b82f6" />
            <rect x="5" y="5" width="30" height="26" rx="2" fill="white" />
            <circle cx="10" cy="33" r="2.5" fill="white" />
            <rect x="15" y="32.5" width="15" height="1.5" rx="0.75" fill="white" />
          </>
        )}

        {frame.id === 'badge' && (
          <>
            <rect x="4" y="4" width="32" height="32" rx="2" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.2" fill="currentColor" fillOpacity="0.02" />
            <path d="M2 28 L22 28 L20 36 L0 36 Z" fill="#10b981" transform="rotate(-10 10 32)" />
            <rect x="4" y="31" width="12" height="2" rx="1" fill="white" transform="rotate(-10 10 32)" />
          </>
        )}

        {frame.id === 'arrow' && (
          <>
            <rect x="4" y="4" width="32" height="28" rx="2" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.2" />
            <path d="M28 34 C 24 34, 18 34, 18 30 C 18 26, 18 26, 18 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M15 28 L18 26 L21 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}

        {frame.id === 'text-bottom' && (
          <>
            <rect x="8" y="2" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" />
            <rect x="6" y="30" width="28" height="6" rx="1.5" fill="currentColor" />
          </>
        )}

        {frame.id === 'shopping' && (
          <>
            <path d="M15 10 C 15 6, 25 6, 25 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <rect x="8" y="10" width="24" height="22" rx="2" stroke="currentColor" strokeWidth="1.5" fill="white" />
            <rect x="12" y="31" width="16" height="6" rx="1" fill="currentColor" />
          </>
        )}

        {frame.id === 'tag' && (
          <>
            <rect x="4" y="4" width="32" height="32" rx="2" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.2" />
            <rect x="20" y="28" width="18" height="10" rx="2" fill="#1e293b" />
            <rect x="25" y="32" width="8" height="2" rx="1" fill="white" fillOpacity="0.5" />
          </>
        )}

        {frame.id === 'chat' && (
          <>
            <rect x="4" y="6" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 30 L16 35 L20 30" fill="currentColor" />
            <rect x="10" y="31" width="20" height="6" rx="3" fill="currentColor" fillOpacity="0.1" />
          </>
        )}

        {frame.id === 'gift' && (
          <>
            <rect x="4" y="10" width="32" height="26" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M20 10 L20 36 M4 20 L36 20" stroke="currentColor" strokeWidth="2" />
            <path d="M20 10 Q15 2 10 10 Q15 15 20 10 Q25 15 30 10 Q25 2 20 10" fill="currentColor" />
          </>
        )}

        {frame.id === 'envelope' && (
          <>
            <rect x="4" y="10" width="32" height="26" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 12 L20 22 L36 12" stroke="currentColor" strokeWidth="1.5" />
          </>
        )}

        {frame.id === 'delivery' && (
          <>
            <rect x="4" y="6" width="32" height="24" rx="2" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
            <circle cx="10" cy="34" r="3" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="30" cy="34" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 34 L12 28 L28 28 L34 34" stroke="currentColor" strokeWidth="1.5" />
          </>
        )}

        {frame.id === 'phone' && (
          <>
            <rect x="8" y="2" width="24" height="36" rx="4" stroke="currentColor" strokeWidth="2" />
            <rect x="18" y="4" width="4" height="1" rx="0.5" fill="currentColor" />
            <circle cx="20" cy="35" r="1.5" fill="currentColor" />
          </>
        )}

        {frame.id === 'coffee' && (
          <>
            <path d="M10 12 L30 12 L26 36 L14 36 Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 8 L30 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <rect x="12" y="18" width="16" height="8" rx="1" fill="currentColor" fillOpacity="0.1" />
          </>
        )}

        {frame.id === 'menu' && (
          <>
            <rect x="6" y="4" width="28" height="32" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 4 L12 36" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
            <rect x="16" y="10" width="12" height="2" rx="1" fill="currentColor" fillOpacity="0.3" />
            <rect x="16" y="16" width="12" height="2" rx="1" fill="currentColor" fillOpacity="0.3" />
          </>
        )}

        {frame.id === 'cocktail' && (
          <>
            <path d="M8 8 L32 8 L20 24 Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M20 24 L20 36 M12 36 L28 36" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="26" cy="12" r="2" fill="currentColor" fillOpacity="0.3" />
          </>
        )}

        {frame.id === 'cloche' && (
          <>
            <path d="M6 30 A 14 14 0 0 1 34 30 L 6 30" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="20" cy="16" r="2" fill="currentColor" />
            <rect x="4" y="30" width="32" height="3" rx="1.5" fill="currentColor" />
          </>
        )}

        {/* Minimal QR Icon - Optimized for Thumbnails */}
        {frame.id !== 'none' && (
          <g transform={
            frame.id === 'bubble-top' ? 'translate(8, 14) scale(0.6)' :
              frame.id === 'shopping' ? 'translate(10, 13) scale(0.5)' :
                frame.id === 'text-bottom' ? 'translate(11, 5) scale(0.45)' :
                  frame.id === 'phone' ? 'translate(12, 8) scale(0.4)' :
                    frame.id === 'coffee' ? 'translate(12, 14) scale(0.4)' :
                      frame.id === 'chat' ? 'translate(11, 8) scale(0.45)' :
                        frame.id === 'gift' ? 'translate(11, 13) scale(0.45)' :
                          frame.id === 'envelope' ? 'translate(11, 13) scale(0.45)' :
                            frame.id === 'delivery' ? 'translate(11, 8) scale(0.45)' :
                              frame.id === 'menu' ? 'translate(14, 8) scale(0.4)' :
                                frame.id === 'cocktail' ? 'translate(12, 10) scale(0.4)' :
                                  frame.id === 'cloche' ? 'translate(12, 20) scale(0.4)' :
                                    frame.id === 'hand-tray' ? 'translate(12, 8) scale(0.4)' :
                                      'translate(8, 8) scale(0.6)'
          }>
            <rect x="0" y="0" width="10" height="10" stroke="currentColor" strokeWidth="2.5" rx="1" />
            <rect x="3" y="3" width="4" height="4" fill="currentColor" />

            <rect x="30" y="0" width="10" height="10" stroke="currentColor" strokeWidth="2.5" rx="1" />
            <rect x="33" y="3" width="4" height="4" fill="currentColor" />

            <rect x="0" y="30" width="10" height="10" stroke="currentColor" strokeWidth="2.5" rx="1" />
            <rect x="3" y="33" width="4" height="4" fill="currentColor" />

            {/* A few strategically placed dots */}
            <rect x="15" y="2" width="5" height="5" rx="1" fill="currentColor" fillOpacity="0.5" />
            <rect x="23" y="15" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity="0.3" />
            <rect x="2" y="18" width="5" height="5" rx="1" fill="currentColor" fillOpacity="0.4" />
            <rect x="15" y="32" width="10" height="5" rx="1" fill="currentColor" fillOpacity="0.6" />
          </g>
        )}
      </svg>
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

  const premiumFrames = FRAME_TEMPLATES.filter(f => f.frameStyle === 'external')

  return (
    <div className="space-y-6">
      {/* Frame Selection Area */}
      <div className="space-y-4">
        {/* Special 'None' Frame */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 group transition-all hover:bg-white hover:border-blue-100">
          <button
            onClick={() => onFrameChange('none')}
            className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-xl border-2 transition-all ${selectedFrame === 'none'
              ? 'border-blue-600 bg-blue-50 text-blue-600'
              : 'border-dashed border-gray-300 bg-white text-gray-300 group-hover:border-blue-200'
              }`}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-700">{t('noFrame') || 'Çerçeve Yok'}</h4>
            <p className="text-[10px] text-gray-400 font-medium">{t('noFrameDesc') || 'Sadece QR kodunu göster'}</p>
          </div>
          {selectedFrame === 'none' && (
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Categories Grid */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="max-h-[380px] overflow-y-auto px-4 py-4 custom-scrollbar">

            {/* Premium Section Only */}
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{t('premiumFrames') || 'Premium Çerçeveler'}</h4>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {premiumFrames.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => {
                      onFrameChange(frame.id)
                      if (frame.hasText && (!frameText || frameText === '')) {
                        onFrameTextChange(frame.defaultText)
                      }
                    }}
                    className={`group relative p-1 rounded-xl border-2 transition-all hover:scale-[1.05] active:scale-95 ${selectedFrame === frame.id
                      ? 'border-blue-600 ring-4 ring-blue-50 shadow-md'
                      : 'border-transparent bg-gray-50 hover:bg-white hover:border-gray-200 shadow-sm'
                      }`}
                  >
                    <FrameThumbnail frame={frame} isSelected={selectedFrame === frame.id} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frame Text Input - En altta ve çok belirgin */}
      {currentFrame.hasText && selectedFrame !== 'none' && (
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-1 px-1.5 pb-1.5 rounded-[22px] shadow-xl shadow-blue-500/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-[18px] p-5">
            <div className="flex items-center justify-between mb-4">
              <label className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">
                {t('frameText') || 'ÇERÇEVE METNİ'}
              </label>
              <span className="text-[10px] font-bold text-gray-300 bg-gray-50 px-2 py-0.5 rounded-full">
                {frameText.length}/25
              </span>
            </div>
            <div className="relative group">
              <input
                type="text"
                value={frameText}
                onChange={(e) => onFrameTextChange(e.target.value)}
                placeholder="Tarat"
                maxLength={25}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 font-bold text-center text-xl tracking-[0.1em] transition-all shadow-inner"
              />
              <div className="absolute inset-0 rounded-2xl ring-4 ring-blue-500/0 group-focus-within:ring-blue-500/5 pointer-events-none transition-all" />
            </div>
            <p className="mt-3 text-[10px] text-gray-400 text-center font-medium opacity-70">
              {t('hintFrameText') || 'Çerçeve üzerinde görünecek metni buraya yazın'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
