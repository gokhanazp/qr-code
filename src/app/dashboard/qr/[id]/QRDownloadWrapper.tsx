'use client'

// QR Kod İndirme Wrapper Component
// QRPreviewClient'ı sarmalayarak indirme butonlarını yönetir

import { useRef } from 'react'
import { Download } from 'lucide-react'
import QRPreviewClient, { QRPreviewClientRef } from './QRPreviewClient'

interface QRDownloadWrapperProps {
  content: string
  foregroundColor: string
  backgroundColor: string
  size: number
  errorCorrection: string
  selectedFrame?: string
  frameText?: string
  frameColor?: string
  logo?: string | null
  logoSize?: number
  qrName: string
  isExpired: boolean
  downloadPNGLabel: string
  downloadSVGLabel: string
}

export default function QRDownloadWrapper({
  content,
  foregroundColor,
  backgroundColor,
  size,
  errorCorrection,
  selectedFrame = 'none',
  frameText = '',
  frameColor = '#000000',
  logo = null,
  logoSize = 20,
  qrName,
  isExpired,
  downloadPNGLabel,
  downloadSVGLabel,
}: QRDownloadWrapperProps) {
  // QRPreviewClient ref'i ile indirme metodlarına erişim
  const qrRef = useRef<QRPreviewClientRef>(null)

  // PNG indirme işlemi
  const handleDownloadPNG = () => {
    qrRef.current?.downloadPNG()
  }

  // SVG indirme işlemi
  const handleDownloadSVG = () => {
    qrRef.current?.downloadSVG()
  }

  return (
    <div className="flex flex-col items-center">
      {/* QR Kod Önizleme */}
      <div className={`p-4 rounded-xl ${isExpired ? 'bg-red-50 opacity-50' : 'bg-gray-50'}`}>
        <QRPreviewClient
          ref={qrRef}
          content={content}
          foregroundColor={foregroundColor}
          backgroundColor={backgroundColor}
          size={size}
          errorCorrection={errorCorrection}
          selectedFrame={selectedFrame}
          frameText={frameText}
          frameColor={frameColor}
          logo={logo}
          logoSize={logoSize}
          qrName={qrName}
        />
      </div>

      {/* İndirme Butonları */}
      {!isExpired && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleDownloadPNG}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            {downloadPNGLabel}
          </button>
          <button
            onClick={handleDownloadSVG}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            {downloadSVGLabel}
          </button>
        </div>
      )}
    </div>
  )
}

