// vCard Fotoğraf Yükleme Bileşeni (vCard Photo Upload Component)
// Supabase Storage'a fotoğraf yükler ve URL döndürür

'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, ImagePlus, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

interface VCardPhotoUploadProps {
  value: string  // Mevcut fotoğraf URL'si (Current photo URL)
  onChange: (url: string) => void  // URL değiştiğinde callback
}

export default function VCardPhotoUpload({ value, onChange }: VCardPhotoUploadProps) {
  const t = useTranslations('generator')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Dosya seçildiğinde (When file is selected)
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Dosya tipi kontrolü (File type validation)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError(t('photoTypeError') || 'Lütfen JPG, PNG, GIF veya WebP formatında bir resim seçin')
      return
    }

    // Dosya boyutu kontrolü - 5MB (File size validation - 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t('photoSizeError') || 'Resim 5MB\'dan küçük olmalı')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Benzersiz dosya adı oluştur (Generate unique file name)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      const filePath = `vcard/${fileName}`

      // Supabase Storage'a yükle (Upload to Supabase Storage)
      const { error: uploadError } = await supabase.storage
        .from('vcard-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setError(t('uploadError') || 'Yükleme başarısız oldu')
        return
      }

      // Public URL al (Get public URL)
      const { data: { publicUrl } } = supabase.storage
        .from('vcard-photos')
        .getPublicUrl(filePath)

      // URL'yi parent'a gönder (Send URL to parent)
      onChange(publicUrl)
    } catch (err) {
      console.error('Upload error:', err)
      setError(t('uploadError') || 'Yükleme başarısız oldu')
    } finally {
      setIsUploading(false)
      // Input'u temizle (Clear input)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Fotoğrafı kaldır (Remove photo)
  const handleRemove = async () => {
    if (!value) return

    try {
      // URL'den dosya yolunu çıkar (Extract file path from URL)
      const url = new URL(value)
      const pathMatch = url.pathname.match(/vcard-photos\/(.+)$/)
      
      if (pathMatch) {
        const filePath = pathMatch[1]
        await supabase.storage.from('vcard-photos').remove([filePath])
      }
    } catch (err) {
      console.error('Delete error:', err)
    }

    // URL'yi temizle (Clear URL)
    onChange('')
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {t('photo')} <span className="text-gray-400 font-normal">({t('optional')})</span>
      </label>
      
      {/* Yükleme Alanı veya Önizleme (Upload Area or Preview) */}
      {value ? (
        // Fotoğraf Önizleme (Photo Preview)
        <div className="relative w-24 h-24 group">
          <Image
            src={value}
            alt="vCard Photo"
            fill
            className="object-cover rounded-xl border-2 border-gray-200"
          />
          {/* Silme Butonu (Delete Button) */}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Yükleme Alanı (Upload Area)
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`
            w-24 h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all
            ${isUploading 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}
          `}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          ) : (
            <>
              <ImagePlus className="w-8 h-8 text-blue-400" />
              <span className="text-xs text-gray-400 mt-1">{t('uploadPhoto') || 'Yükle'}</span>
            </>
          )}
        </div>
      )}

      {/* Gizli Dosya Input (Hidden File Input) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Hata Mesajı (Error Message) */}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}

