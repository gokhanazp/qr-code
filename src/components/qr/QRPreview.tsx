// QR Kod Önizleme bileşeni (QR Code Preview Component)
// Modern tasarımlı QR kodu gösterme ve indirme

'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import QRCode from 'qrcode'
import { Download, Copy, Check, Image, FileType, Share2, Smartphone } from 'lucide-react'
import clsx from 'clsx'

interface QRPreviewProps {
  content: string
  foregroundColor: string
  backgroundColor: string
  size: number
  errorCorrection: 'L' | 'M' | 'Q' | 'H'
}

export default function QRPreview({
  content,
  foregroundColor,
  backgroundColor,
  size,
  errorCorrection,
}: QRPreviewProps) {
  const t = useTranslations('generator')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [activeDownload, setActiveDownload] = useState<string | null>(null)

  // QR kodu oluştur (Generate QR code)
  useEffect(() => {
    if (!content || !canvasRef.current) return

    const generateQR = async () => {
      try {
        // Canvas'a QR kodu çiz (Draw QR code to canvas)
        await QRCode.toCanvas(canvasRef.current, content, {
          width: 200, // Sabit önizleme boyutu
          margin: 2,
          color: {
            dark: foregroundColor,
            light: backgroundColor,
          },
          errorCorrectionLevel: errorCorrection,
        })

        // Data URL olarak da sakla - indirme için (Store as data URL for download)
        const dataUrl = await QRCode.toDataURL(content, {
          width: size, // İndirme için seçilen boyut
          margin: 2,
          color: {
            dark: foregroundColor,
            light: backgroundColor,
          },
          errorCorrectionLevel: errorCorrection,
        })
        setQrDataUrl(dataUrl)
      } catch (err) {
        console.error('QR Code generation error:', err)
      }
    }

    generateQR()
  }, [content, foregroundColor, backgroundColor, size, errorCorrection])

  // PNG olarak indir (Download as PNG)
  const downloadPNG = () => {
    if (!qrDataUrl) return
    setActiveDownload('png')
    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = qrDataUrl
    link.click()
    setTimeout(() => setActiveDownload(null), 1000)
  }

  // SVG olarak indir (Download as SVG)
  const downloadSVG = async () => {
    if (!content) return
    setActiveDownload('svg')
    try {
      const svgString = await QRCode.toString(content, {
        type: 'svg',
        width: size,
        margin: 2,
        color: {
          dark: foregroundColor,
          light: backgroundColor,
        },
        errorCorrectionLevel: errorCorrection,
      })
      const blob = new Blob([svgString], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = 'qrcode.svg'
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('SVG generation error:', err)
    }
    setTimeout(() => setActiveDownload(null), 1000)
  }

  // Panoya kopyala (Copy to clipboard)
  const copyToClipboard = async () => {
    if (!canvasRef.current) return
    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvasRef.current?.toBlob(resolve)
      })
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ])
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      console.error('Copy error:', err)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* QR Kod Önizleme Alanı (QR Code Preview Area) */}
      <div className="relative group">
        {/* Dekoratif arka plan (Decorative background) */}
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 blur-lg group-hover:opacity-30 transition-opacity" />

        {/* QR Kod kartı (QR Code card) */}
        <div
          className="relative bg-white p-4 rounded-2xl shadow-xl"
          style={{ backgroundColor }}
        >
          {content ? (
            <canvas ref={canvasRef} className="rounded-lg" />
          ) : (
            <div
              className="flex flex-col items-center justify-center bg-gray-50 text-gray-400 rounded-lg"
              style={{ width: 200, height: 200 }}
            >
              <Smartphone className="w-12 h-12 mb-3 text-gray-300" />
              <span className="text-sm font-medium">QR Preview</span>
              <span className="text-xs text-gray-400 mt-1">Enter content to generate</span>
            </div>
          )}
        </div>
      </div>

      {/* QR Kod bilgisi (QR Code info) */}
      {content && (
        <div className="text-center text-sm text-gray-500">
          <span>{size}×{size}px</span>
          <span className="mx-2">•</span>
          <span>Error correction: {errorCorrection}</span>
        </div>
      )}

      {/* İndirme Butonları (Download Buttons) */}
      {content && (
        <div className="w-full space-y-3">
          {/* PNG İndirme (PNG Download) */}
          <button
            onClick={downloadPNG}
            className={clsx(
              'w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200',
              'bg-gradient-to-r from-blue-600 to-blue-700 text-white',
              'hover:from-blue-700 hover:to-blue-800 hover:shadow-lg',
              activeDownload === 'png' && 'scale-95'
            )}
          >
            <Image className="w-5 h-5" />
            {t('downloadPNG')}
          </button>

          {/* SVG İndirme (SVG Download) */}
          <button
            onClick={downloadSVG}
            className={clsx(
              'w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200',
              'bg-white border-2 border-gray-200 text-gray-700',
              'hover:border-gray-300 hover:bg-gray-50 hover:shadow-md',
              activeDownload === 'svg' && 'scale-95'
            )}
          >
            <FileType className="w-5 h-5" />
            {t('downloadSVG')}
          </button>

          {/* Diğer seçenekler (Other options) */}
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200',
                'bg-gray-100 text-gray-700 hover:bg-gray-200',
                copied && 'bg-green-100 text-green-700'
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={() => {
                if (navigator.share && qrDataUrl) {
                  navigator.share({
                    title: 'QR Code',
                    text: 'Check out my QR code!',
                    url: qrDataUrl
                  }).catch(() => {})
                }
              }}
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      )}

      {/* İpucu (Tip) */}
      {!content && (
        <p className="text-xs text-gray-400 text-center px-4">
          Select a QR type and enter your content to see a preview
        </p>
      )}
    </div>
  )
}

