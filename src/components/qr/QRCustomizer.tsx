// QR Kod Özelleştirici bileşeni (QR Code Customizer Component)
// Accordion panel yapısında: FRAME, SHAPE & COLOR, LOGO

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, ChevronUp, Frame, Palette, ImageIcon } from 'lucide-react'
import QRFrameSelector from './QRFrameSelector'
import QRLogoUploader from './QRLogoUploader'

interface QRCustomizerProps {
  foregroundColor: string
  backgroundColor: string
  size: number
  errorCorrection: 'L' | 'M' | 'Q' | 'H'
  selectedFrame: string
  frameText: string
  frameColor: string
  logo: string | null
  logoSize: number
  onForegroundChange: (color: string) => void
  onBackgroundChange: (color: string) => void
  onSizeChange: (size: number) => void
  onErrorCorrectionChange: (level: 'L' | 'M' | 'Q' | 'H') => void
  onFrameChange: (frameId: string) => void
  onFrameTextChange: (text: string) => void
  onFrameColorChange: (color: string) => void
  onLogoChange: (logo: string | null) => void
  onLogoSizeChange: (size: number) => void
}

// Accordion Panel Bileşeni (Accordion Panel Component)
interface AccordionPanelProps {
  title: string
  icon: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  badge?: string
  children: React.ReactNode
  accentColor?: string
}

function AccordionPanel({ title, icon, isOpen, onToggle, badge, children, accentColor = 'bg-blue-500' }: AccordionPanelProps) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Panel Header */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 ${accentColor} text-white font-semibold transition-all hover:brightness-110`}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-sm uppercase tracking-wide">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-bold">
              {badge}
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {/* Panel Content */}
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-4 bg-white">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function QRCustomizer({
  foregroundColor,
  backgroundColor,
  size,
  errorCorrection,
  selectedFrame,
  frameText,
  frameColor,
  logo,
  logoSize,
  onForegroundChange,
  onBackgroundChange,
  onSizeChange,
  onErrorCorrectionChange,
  onFrameChange,
  onFrameTextChange,
  onFrameColorChange,
  onLogoChange,
  onLogoSizeChange,
}: QRCustomizerProps) {
  const t = useTranslations('generator')

  // Accordion state - varsayılan olarak FRAME açık
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({
    frame: true,
    shape: false,
    logo: false,
  })

  const togglePanel = (panel: string) => {
    setOpenPanels(prev => ({ ...prev, [panel]: !prev[panel] }))
  }

  // Önceden tanımlı renkler (Preset colors)
  const presetColors = [
    '#000000', '#1e40af', '#059669', '#dc2626',
    '#7c3aed', '#ea580c', '#0891b2', '#be185d',
  ]

  const bgPresetColors = [
    '#ffffff', '#f3f4f6', '#fef3c7', '#dbeafe', '#fce7f3', '#d1fae5'
  ]

  return (
    <div className="space-y-3">
      {/* FRAME Panel */}
      <AccordionPanel
        title={t('frameNew')}
        icon={<Frame className="w-5 h-5" />}
        isOpen={openPanels.frame}
        onToggle={() => togglePanel('frame')}
        badge="NEW!"
        accentColor="bg-cyan-500"
      >
        <QRFrameSelector
          selectedFrame={selectedFrame}
          frameText={frameText}
          frameColor={frameColor}
          onFrameChange={onFrameChange}
          onFrameTextChange={onFrameTextChange}
          onFrameColorChange={onFrameColorChange}
        />
      </AccordionPanel>

      {/* SHAPE & COLOR Panel */}
      <AccordionPanel
        title={t('shapeAndColor')}
        icon={<Palette className="w-5 h-5" />}
        isOpen={openPanels.shape}
        onToggle={() => togglePanel('shape')}
        accentColor="bg-gray-400"
      >
        <div className="space-y-5">
          {/* Ön plan rengi (Foreground color) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('foreground')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={foregroundColor}
                onChange={(e) => onForegroundChange(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
              <div className="flex gap-1.5 flex-wrap">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => onForegroundChange(color)}
                    className={`w-7 h-7 rounded-md border-2 transition-transform hover:scale-110 ${foregroundColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                      }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Arka plan rengi (Background color) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('background')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => onBackgroundChange(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
              <div className="flex gap-1.5 flex-wrap">
                {bgPresetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => onBackgroundChange(color)}
                    className={`w-7 h-7 rounded-md border-2 transition-transform hover:scale-110 ${backgroundColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                      }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select background color ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Boyut (Size) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('size')}: <span className="text-blue-600 font-bold">{size}px</span>
            </label>
            <input
              type="range"
              min="128"
              max="512"
              step="32"
              value={size}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>128px</span>
              <span>512px</span>
            </div>
          </div>

          {/* Hata Düzeltme Seviyesi (Error Correction Level) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('errorCorrection')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['L', 'M', 'Q', 'H'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => onErrorCorrectionChange(level)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${errorCorrection === level
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {level}
                  <span className="block text-xs opacity-75">
                    {level === 'L' && '7%'}
                    {level === 'M' && '15%'}
                    {level === 'Q' && '25%'}
                    {level === 'H' && '30%'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </AccordionPanel>

      {/* LOGO Panel */}
      <AccordionPanel
        title="LOGO"
        icon={<ImageIcon className="w-5 h-5" />}
        isOpen={openPanels.logo}
        onToggle={() => togglePanel('logo')}
        accentColor="bg-gray-400"
      >
        <QRLogoUploader
          logo={logo}
          logoSize={logoSize}
          onLogoChange={onLogoChange}
          onLogoSizeChange={onLogoSizeChange}
        />
      </AccordionPanel>
    </div>
  )
}

