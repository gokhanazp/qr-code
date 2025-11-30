// Dashboard QR Oluşturma Sayfası
// Kullanıcıların QR kod oluşturması için

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from '@/components/ui'
import { QRTypeSelector, QRContentForm, QRCustomizer, QRPreview } from '@/components/qr'

// QR kod tipleri
type QRType = 'URL' | 'TEXT' | 'EMAIL' | 'PHONE' | 'SMS' | 'WIFI' | 'VCARD' | 'LOCATION' | 'EVENT' | 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'TWITTER' | 'LINKEDIN' | 'YOUTUBE' | 'APP_STORE' | 'PDF' | 'IMAGE' | 'BITCOIN'

export default function CreateQRPage() {
  const t = useTranslations('generator')
  const router = useRouter()
  
  const [name, setName] = useState('')
  const [selectedType, setSelectedType] = useState<QRType>('URL')
  const [content, setContent] = useState('')
  const [foreground, setForeground] = useState('#000000')
  const [background, setBackground] = useState('#ffffff')
  const [size, setSize] = useState(256)
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  // QR kodu kaydet
  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a name for your QR code')
      return
    }
    if (!content.trim()) {
      setError('Please enter content for your QR code')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const response = await fetch('/api/qr/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type: selectedType,
          content,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save QR code')
      }

      router.push('/dashboard')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An error occurred')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        </div>

        {/* Hata mesajı */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol taraf - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* QR Kod Adı */}
            <Card>
              <CardHeader>
                <CardTitle>QR Code Name</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="My QR Code"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* QR Tipi Seçimi */}
            <QRTypeSelector
              selectedType={selectedType}
              onSelect={(type) => setSelectedType(type as QRType)}
            />

            {/* İçerik Formu */}
            <QRContentForm
              type={selectedType}
              content={content}
              onChange={setContent}
            />

            {/* Özelleştirme */}
            <QRCustomizer
              foreground={foreground}
              background={background}
              size={size}
              errorCorrection={errorCorrection}
              onForegroundChange={setForeground}
              onBackgroundChange={setBackground}
              onSizeChange={setSize}
              onErrorCorrectionChange={setErrorCorrection}
            />
          </div>

          {/* Sağ taraf - Önizleme */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <QRPreview
                content={content}
                foreground={foreground}
                background={background}
                size={size}
                errorCorrection={errorCorrection}
              />

              {/* Kaydet butonu */}
              <Button
                className="w-full"
                onClick={handleSave}
                isLoading={isSaving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save QR Code
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

