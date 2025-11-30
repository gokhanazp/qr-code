// QR Kod Özelleştirici bileşeni
// Renk, boyut ve hata düzeltme ayarları

'use client'

import { useTranslations } from 'next-intl'

interface QRCustomizerProps {
  foregroundColor: string
  backgroundColor: string
  size: number
  errorCorrection: 'L' | 'M' | 'Q' | 'H'
  onForegroundChange: (color: string) => void
  onBackgroundChange: (color: string) => void
  onSizeChange: (size: number) => void
  onErrorCorrectionChange: (level: 'L' | 'M' | 'Q' | 'H') => void
}

export default function QRCustomizer({
  foregroundColor,
  backgroundColor,
  size,
  errorCorrection,
  onForegroundChange,
  onBackgroundChange,
  onSizeChange,
  onErrorCorrectionChange,
}: QRCustomizerProps) {
  const t = useTranslations('generator')

  // Önceden tanımlı renkler
  const presetColors = [
    '#000000', // Siyah
    '#1e40af', // Koyu mavi
    '#059669', // Yeşil
    '#dc2626', // Kırmızı
    '#7c3aed', // Mor
    '#ea580c', // Turuncu
    '#0891b2', // Cyan
    '#be185d', // Pembe
  ]

  return (
    <div className="space-y-6">
      {/* Ön plan rengi */}
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
          <div className="flex gap-1">
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => onForegroundChange(color)}
                className={`w-6 h-6 rounded border-2 ${
                  foregroundColor === color ? 'border-blue-500' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Arka plan rengi */}
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
          <div className="flex gap-1">
            {['#ffffff', '#f3f4f6', '#fef3c7', '#dbeafe', '#fce7f3', '#d1fae5'].map((color) => (
              <button
                key={color}
                onClick={() => onBackgroundChange(color)}
                className={`w-6 h-6 rounded border-2 ${
                  backgroundColor === color ? 'border-blue-500' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select background color ${color}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Boyut */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('size')}: {size}px
        </label>
        <input
          type="range"
          min="128"
          max="512"
          step="32"
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>128px</span>
          <span>512px</span>
        </div>
      </div>

      {/* Hata Düzeltme Seviyesi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('errorCorrection')}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(['L', 'M', 'Q', 'H'] as const).map((level) => (
            <button
              key={level}
              onClick={() => onErrorCorrectionChange(level)}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                errorCorrection === level
                  ? 'bg-blue-600 text-white'
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
        <p className="text-xs text-gray-500 mt-2">
          Higher levels allow more damage but result in denser QR codes.
        </p>
      </div>
    </div>
  )
}

