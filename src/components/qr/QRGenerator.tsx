// QR Kod Oluşturucu Ana Bileşeni (QR Code Generator Main Component)
// Tek sayfa, tab yapısız basit tasarım

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { QrCode } from 'lucide-react'
import clsx from 'clsx'
import QRTypeSelector, { QRType, qrTypes } from './QRTypeSelector'
import QRContentForm from './QRContentForm'
import QRCustomizer from './QRCustomizer'
import QRPreview from './QRPreview'
import VCardForm from './VCardForm'

export default function QRGenerator() {
  const t = useTranslations('generator')

  // QR Kod durumu (QR Code state)
  const [qrType, setQrType] = useState<QRType>('URL')
  const [content, setContent] = useState('')
  const [data, setData] = useState<Record<string, string>>({})

  // Özelleştirme durumu (Customization state)
  const [foregroundColor, setForegroundColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [size, setSize] = useState(256)
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M')

  // Seçili tipin bilgisini al (Get selected type info)
  const selectedTypeInfo = qrTypes.find(t => t.id === qrType)

  // İçerik değişikliği (Content change handler)
  const handleContentChange = (newContent: string, newData?: Record<string, string>) => {
    setContent(newContent)
    if (newData) setData(newData)
  }

  // Tip değişikliği (Type change handler)
  const handleTypeChange = (type: QRType) => {
    setQrType(type)
    setContent('')
    setData({})
  }

  // vCard için özel görünüm (Special view for vCard)
  if (qrType === 'VCARD') {
    return (
      <div className="space-y-8">
        {/* Başlık ve Tip Değiştir Butonu (Header and Change Type Button) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={clsx(
              'w-14 h-14 rounded-2xl flex items-center justify-center',
              'bg-gradient-to-br text-white shadow-lg',
              selectedTypeInfo?.gradient
            )}>
              {selectedTypeInfo && <selectedTypeInfo.icon className="w-7 h-7" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Digital Business Card</h2>
              <p className="text-gray-500">Create your professional vCard</p>
            </div>
          </div>
          <button
            onClick={() => handleTypeChange('URL')}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            ← Change Type
          </button>
        </div>

        {/* vCard Form (telefon ve QR önizleme dahil) */}
        <VCardForm
          data={data}
          onChange={(newData) => setData(newData)}
        />
      </div>
    )
  }

  // Diğer QR tipleri için standart görünüm (Standard view for other QR types)
  return (
    <div className="space-y-8">
      {/* Başlık (Header) */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          {t('selectType')}
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Choose the type of QR code you want to create
        </p>
      </div>

      {/* QR Tip Seçici (QR Type Selector) */}
      <QRTypeSelector
        selectedType={qrType}
        onTypeChange={handleTypeChange}
      />

      {/* Ana İçerik - Sol Form, Sağ Önizleme (Main Content - Left Form, Right Preview) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Sol Panel - Form ve Özelleştirme (Left Panel - Form and Customization) */}
        <div className="xl:col-span-2 space-y-6">
          {/* İçerik Formu (Content Form) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className={clsx(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                'bg-gradient-to-br text-white',
                selectedTypeInfo?.gradient
              )}>
                {selectedTypeInfo && <selectedTypeInfo.icon className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedTypeInfo?.id || qrType}</h3>
                <p className="text-sm text-gray-500">{selectedTypeInfo?.description}</p>
              </div>
            </div>

            <QRContentForm
              type={qrType}
              content={content}
              data={data}
              onChange={handleContentChange}
            />
          </div>

          {/* Özelleştirme (Customization) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">{t('customize')}</h3>
            <QRCustomizer
              foregroundColor={foregroundColor}
              backgroundColor={backgroundColor}
              size={size}
              errorCorrection={errorCorrection}
              onForegroundChange={setForegroundColor}
              onBackgroundChange={setBackgroundColor}
              onSizeChange={setSize}
              onErrorCorrectionChange={setErrorCorrection}
            />
          </div>
        </div>

        {/* Sağ Panel - QR Önizleme (Right Panel - QR Preview) */}
        <div className="xl:col-span-1">
          <div className="sticky top-24">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              {/* Önizleme başlığı (Preview header) */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  {t('preview')}
                </h3>
              </div>

              {/* QR Kod önizleme (QR Code preview) */}
              <div className="p-6">
                <QRPreview
                  content={content}
                  foregroundColor={foregroundColor}
                  backgroundColor={backgroundColor}
                  size={size}
                  errorCorrection={errorCorrection}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

