// QR Logo Yükleyici bileşeni (QR Logo Uploader Component)
// QR kodun ortasına logo ekleme özelliği

'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'

interface QRLogoUploaderProps {
  logo: string | null
  logoSize: number
  onLogoChange: (logo: string | null) => void
  onLogoSizeChange: (size: number) => void
}

export default function QRLogoUploader({
  logo,
  logoSize,
  onLogoChange,
  onLogoSizeChange,
}: QRLogoUploaderProps) {
  const t = useTranslations('generator')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  // Dosya seçme işlemi (File selection handler)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Dosya tipi kontrolü (File type check)
    if (!file.type.startsWith('image/')) {
      setError(t('logoError') || 'Please select an image file')
      return
    }

    // Dosya boyutu kontrolü - max 2MB (File size check)
    if (file.size > 2 * 1024 * 1024) {
      setError(t('logoSizeError') || 'Image must be less than 2MB')
      return
    }

    setError(null)

    // Dosyayı base64'e çevir (Convert file to base64)
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      onLogoChange(result)
    }
    reader.readAsDataURL(file)
  }

  // Logoyu kaldır (Remove logo)
  const handleRemoveLogo = () => {
    onLogoChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Başlık (Title) */}
      <label className="block text-sm font-medium text-gray-700">
        {t('logo') || 'Logo'} <span className="text-gray-400 font-normal">(optional)</span>
      </label>

      {/* Upload Alanı veya Logo Önizleme (Upload area or logo preview) */}
      {!logo ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
        >
          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 font-medium">
            {t('uploadLogo') || 'Click to upload logo'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PNG, JPG, SVG (max 2MB)
          </p>
        </div>
      ) : (
        <div className="relative border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center gap-4">
            {/* Logo Önizleme (Logo preview) */}
            <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
              <img
                src={logo}
                alt="Logo"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            {/* Logo Bilgisi (Logo info) */}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                {t('logoUploaded') || 'Logo uploaded'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {t('logoTip') || 'Will appear in the center of QR code'}
              </p>
            </div>
            
            {/* Kaldır Butonu (Remove button) */}
            <button
              onClick={handleRemoveLogo}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title={t('removeLogo') || 'Remove logo'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Gizli File Input (Hidden file input) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Hata Mesajı (Error message) */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Logo Boyutu Slider - Sadece logo varken göster (Logo size slider) */}
      {logo && (
        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('logoSize') || 'Logo Size'}: {logoSize}%
          </label>
          <input
            type="range"
            min="15"
            max="35"
            step="5"
            value={logoSize}
            onChange={(e) => onLogoSizeChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{t('small') || 'Small'}</span>
            <span>{t('large') || 'Large'}</span>
          </div>
        </div>
      )}

      {/* Logo İpucu (Logo tip) */}
      <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
        💡 {t('logoHighErrorTip') || 'Tip: Use High (H) error correction when adding a logo for better scanning'}
      </p>
    </div>
  )
}

