// QR Kod Önizleme bileşeni (QR Code Preview Component)
// Modern tasarımlı QR kodu gösterme ve indirme (Frame ve Logo destekli)
// İndirme için üyelik gerekli (Authentication required for download)
// Watermark koruması: Giriş yapmayan kullanıcılar için

'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import { Download, Copy, Check, Image, FileType, Share2, Smartphone, LogIn, Lock } from 'lucide-react'
import clsx from 'clsx'
import { FRAME_TEMPLATES } from './QRFrameSelector'

interface QRPreviewProps {
  content: string
  foregroundColor: string
  backgroundColor: string
  size: number
  errorCorrection: 'L' | 'M' | 'Q' | 'H'
  // Frame özellikleri (Frame properties)
  selectedFrame?: string
  frameText?: string
  frameColor?: string
  // Logo özellikleri (Logo properties)
  logo?: string | null
  logoSize?: number
  // Authentication durumu (Authentication state)
  isAuthenticated?: boolean
}

export default function QRPreview({
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
  isAuthenticated = false,
}: QRPreviewProps) {
  const t = useTranslations('generator')
  const locale = useLocale()
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [activeDownload, setActiveDownload] = useState<string | null>(null)

  // Frame template'i bul (Find frame template)
  const frameTemplate = FRAME_TEMPLATES.find(f => f.id === selectedFrame) || FRAME_TEMPLATES[0]

  // Watermark ekle - Giriş yapmamış kullanıcılar için (Add watermark for non-authenticated users)
  const addWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (isAuthenticated) return // Giriş yapmışsa watermark ekleme

    ctx.save()

    // Yarı saydam beyaz overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
    ctx.fillRect(0, 0, width, height)

    // Çapraz watermark metni - 3 satır
    ctx.translate(width / 2, height / 2)
    ctx.rotate(-Math.PI / 6) // -30 derece

    // Font boyutunu canvas boyutuna göre ayarla
    const fontSize = Math.max(12, Math.min(20, width / 12))
    ctx.font = `bold ${fontSize}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'

    const spacing = fontSize * 2.5
    ctx.fillText('QRCodeShine.com', 0, -spacing)
    ctx.fillText('QRCodeShine.com', 0, 0)
    ctx.fillText('QRCodeShine.com', 0, spacing)

    // Alt mesaj - "Ücretsiz Kayıt Ol"
    ctx.font = `bold ${fontSize * 0.6}px Arial, sans-serif`
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
    ctx.fillText(
      locale === 'tr' ? '★ Ücretsiz kayıt ol ★' : '★ Sign up free ★',
      0,
      spacing * 1.6
    )

    ctx.restore()
  }

  // Yuvarlak köşeli dikdörtgen çiz (Draw rounded rectangle)
  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  // Renk ayarlama - daha koyu/açık (Adjust color - darker/lighter)
  const adjustColor = (hex: string, amount: number): string => {
    const num = parseInt(hex.replace('#', ''), 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + amount))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }

  // Logo'yu yükle ve canvas'a çiz (Load and draw logo on canvas)
  const drawLogoOnCanvas = (ctx: CanvasRenderingContext2D, canvasSize: number, logoSrc: string, logoPct: number): Promise<void> => {
    return new Promise((resolve) => {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        // Logo boyutunu hesapla (Calculate logo size)
        const logoW = canvasSize * (logoPct / 100)
        const logoH = (img.height / img.width) * logoW
        const x = (canvasSize - logoW) / 2
        const y = (canvasSize - logoH) / 2

        // Logo arka planı - beyaz yuvarlak (Logo background - white circle)
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(canvasSize / 2, canvasSize / 2, Math.max(logoW, logoH) / 2 + 8, 0, Math.PI * 2)
        ctx.fill()

        // Logo'yu çiz (Draw logo)
        ctx.drawImage(img, x, y, logoW, logoH)
        resolve()
      }
      img.onerror = () => resolve()
      img.src = logoSrc
    })
  }

  // QR kodu oluştur (Generate QR code)
  useEffect(() => {
    if (!content || !canvasRef.current) return

    const generateQR = async () => {
      try {
        const basePreviewSize = 200
        const frameStyle = frameTemplate.frameStyle || 'none'
        const hasFrame = selectedFrame !== 'none'

        // Frame için boyutları hesapla (Calculate dimensions for frame)
        const framePadding = hasFrame ? 16 : 0
        const textHeight = hasFrame && frameTemplate.hasText && frameText ? 32 : 0
        const topTextHeight = (frameStyle === 'bubble-top' || frameStyle === 'bubble') && frameText ? 24 : 0

        const totalWidth = basePreviewSize + framePadding * 2
        const totalHeight = basePreviewSize + framePadding * 2 + textHeight + topTextHeight

        // Canvas boyutunu ayarla (Set canvas size)
        const canvas = canvasRef.current!
        canvas.width = hasFrame ? totalWidth : basePreviewSize
        canvas.height = hasFrame ? totalHeight : basePreviewSize

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Arka planı temizle (Clear background)
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const qrX = hasFrame ? framePadding : 0
        const qrY = hasFrame ? framePadding + topTextHeight : 0
        const qrSize = basePreviewSize
        const frameBgColor = frameTemplate.backgroundColor || foregroundColor

        // Frame stiline göre çiz (Draw based on frame style)
        if (hasFrame) {
          if (frameStyle === 'simple') {
            // Siyah çerçeve, altta text
            ctx.fillStyle = frameBgColor
            roundRect(ctx, 0, 0, totalWidth, totalHeight, 6)
            ctx.fill()
            ctx.fillStyle = backgroundColor
            roundRect(ctx, 8, 8, totalWidth - 16, basePreviewSize + framePadding, 4)
            ctx.fill()
          } else if (frameStyle === 'bubble-top') {
            // Üstte konuşma balonu
            ctx.fillStyle = frameBgColor
            roundRect(ctx, totalWidth/2 - 50, 0, 100, 20, 4)
            ctx.fill()
            // Balon üçgeni
            ctx.beginPath()
            ctx.moveTo(totalWidth/2 - 6, 20)
            ctx.lineTo(totalWidth/2 + 6, 20)
            ctx.lineTo(totalWidth/2, 28)
            ctx.fill()
            // Text
            ctx.fillStyle = '#ffffff'
            ctx.font = 'bold 11px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(frameText, totalWidth/2, 15)
          } else if (frameStyle === 'bubble') {
            // Yeşil kenarlık, üstte text
            ctx.strokeStyle = frameBgColor
            ctx.lineWidth = 4
            roundRect(ctx, framePadding, framePadding + topTextHeight, basePreviewSize, basePreviewSize, 0)
            ctx.stroke()
            // Üstteki text
            ctx.fillStyle = foregroundColor
            ctx.font = 'bold 12px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(frameText, totalWidth/2, topTextHeight - 6)
          } else if (frameStyle === 'video') {
            // Mavi çerçeve, play butonu
            ctx.fillStyle = frameBgColor
            roundRect(ctx, 0, 0, totalWidth, totalHeight, 6)
            ctx.fill()
            ctx.fillStyle = backgroundColor
            roundRect(ctx, 8, 8, totalWidth - 16, basePreviewSize + framePadding, 4)
            ctx.fill()
          } else if (frameStyle === 'badge') {
            // Yeşil rozet sol alt köşede
            ctx.strokeStyle = '#e5e7eb'
            ctx.lineWidth = 1
            ctx.strokeRect(framePadding, framePadding, basePreviewSize, basePreviewSize)
          } else if (frameStyle === 'text-bottom' || frameStyle === 'arrow' || frameStyle === 'tag' || frameStyle === 'shopping') {
            // Sadece QR göster, text/dekor aşağıda
            ctx.strokeStyle = '#e5e7eb'
            ctx.lineWidth = 1
            ctx.strokeRect(qrX, qrY, qrSize, qrSize)
          }
        }

        // QR kodu oluştur (Generate QR code)
        const qrDataUrl = await QRCode.toDataURL(content, {
          width: qrSize,
          margin: 2,
          color: {
            dark: foregroundColor,
            light: backgroundColor,
          },
          errorCorrectionLevel: errorCorrection,
        })

        // QR kodunu çiz (Draw QR code)
        const qrImg = new window.Image()
        qrImg.onload = async () => {
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

          // Logo ekle (Add logo)
          if (logo) {
            const logoCenterX = qrX + qrSize / 2
            const logoCenterY = qrY + qrSize / 2
            const logoW = qrSize * (logoSize / 100)

            ctx.fillStyle = '#ffffff'
            ctx.beginPath()
            ctx.arc(logoCenterX, logoCenterY, logoW / 2 + 5, 0, Math.PI * 2)
            ctx.fill()

            const logoImg = new window.Image()
            logoImg.onload = () => {
              const actualLogoH = (logoImg.height / logoImg.width) * logoW
              ctx.drawImage(logoImg, logoCenterX - logoW / 2, logoCenterY - actualLogoH / 2, logoW, actualLogoH)
            }
            logoImg.src = logo
          }

          // Frame text ekle (Add frame text)
          if (hasFrame && frameTemplate.hasText && frameText && frameStyle !== 'bubble-top' && frameStyle !== 'bubble') {
            const textY = qrY + qrSize + 24

            if (frameStyle === 'simple' || frameStyle === 'video') {
              ctx.fillStyle = '#ffffff'
              ctx.font = 'bold 14px Arial'
              ctx.textAlign = 'center'
              ctx.fillText(frameText, totalWidth / 2, textY)

              // Video için play butonu
              if (frameStyle === 'video') {
                const btnX = totalWidth / 2 - 60
                const btnY = textY - 12
                ctx.fillStyle = '#ffffff'
                ctx.beginPath()
                ctx.arc(btnX, btnY, 8, 0, Math.PI * 2)
                ctx.fill()
                ctx.fillStyle = frameBgColor
                ctx.beginPath()
                ctx.moveTo(btnX - 2, btnY - 4)
                ctx.lineTo(btnX - 2, btnY + 4)
                ctx.lineTo(btnX + 4, btnY)
                ctx.fill()
              }
            } else if (frameStyle === 'badge') {
              // Yeşil rozet sol alt köşede
              ctx.save()
              ctx.translate(framePadding + 10, qrY + qrSize - 5)
              ctx.rotate(-15 * Math.PI / 180)
              ctx.fillStyle = frameBgColor
              roundRect(ctx, 0, 0, 70, 18, 3)
              ctx.fill()
              ctx.fillStyle = '#ffffff'
              ctx.font = 'bold 10px Arial'
              ctx.textAlign = 'center'
              ctx.fillText(frameText, 35, 13)
              ctx.restore()
            } else if (frameStyle === 'text-bottom') {
              ctx.fillStyle = foregroundColor
              ctx.font = 'bold 18px Arial'
              ctx.textAlign = 'center'
              ctx.fillText(frameText, totalWidth / 2, textY + 4)
            } else if (frameStyle === 'tag') {
              // Siyah etiket sağ alt köşede
              const tagWidth = frameText.length * 8 + 16
              ctx.fillStyle = frameBgColor
              roundRect(ctx, totalWidth - tagWidth - 8, qrY + qrSize - 8, tagWidth, 20, 3)
              ctx.fill()
              ctx.fillStyle = '#ffffff'
              ctx.font = 'bold 10px Arial'
              ctx.textAlign = 'center'
              ctx.fillText(frameText, totalWidth - tagWidth/2 - 8, qrY + qrSize + 6)
            } else if (frameStyle === 'arrow') {
              // Ok ve italik text
              ctx.fillStyle = foregroundColor
              ctx.font = 'italic 14px Arial'
              ctx.textAlign = 'left'
              ctx.fillText(frameText, qrX + qrSize - 50, textY)
              // Ok çiz
              ctx.strokeStyle = foregroundColor
              ctx.lineWidth = 2
              ctx.beginPath()
              ctx.moveTo(qrX + qrSize - 60, textY - 20)
              ctx.quadraticCurveTo(qrX + qrSize - 80, textY - 30, qrX + qrSize - 70, textY - 50)
              ctx.stroke()
            } else if (frameStyle === 'shopping') {
              // Etiket ortalı alt
              const tagWidth = frameText.length * 7 + 20
              ctx.fillStyle = frameBgColor
              ctx.fillRect(totalWidth/2 - tagWidth/2, qrY + qrSize + 4, tagWidth, 18)
              ctx.fillStyle = '#ffffff'
              ctx.font = 'bold 10px Arial'
              ctx.textAlign = 'center'
              ctx.fillText(frameText, totalWidth / 2, qrY + qrSize + 16)
            }
          }

          // Önizlemeye watermark ekle (Add watermark to preview)
          addWatermark(ctx, canvas.width, canvas.height)
        }
        qrImg.src = qrDataUrl

        // İndirme için ayrı canvas oluştur (Create separate canvas for download)
        const downloadCanvas = document.createElement('canvas')
        const downloadCtx = downloadCanvas.getContext('2d')

        if (downloadCtx) {
          const dlFrameStyle = frameTemplate.frameStyle || 'none'
          const dlHasFrame = selectedFrame !== 'none'
          const dlPadding = dlHasFrame ? 24 : 0
          const dlTextHeight = dlHasFrame && frameTemplate.hasText && frameText ? 48 : 0
          const dlTopTextHeight = (dlFrameStyle === 'bubble-top' || dlFrameStyle === 'bubble') && frameText ? 36 : 0

          const dlTotalWidth = size + dlPadding * 2
          const dlTotalHeight = size + dlPadding * 2 + dlTextHeight + dlTopTextHeight
          const dlFrameBgColor = frameTemplate.backgroundColor || foregroundColor

          downloadCanvas.width = dlHasFrame ? dlTotalWidth : size
          downloadCanvas.height = dlHasFrame ? dlTotalHeight : size

          // Arka planı temizle (Clear background)
          downloadCtx.fillStyle = backgroundColor
          downloadCtx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height)

          const dlQrX = dlHasFrame ? dlPadding : 0
          const dlQrY = dlHasFrame ? dlPadding + dlTopTextHeight : 0

          // Frame stiline göre çiz (Draw based on frame style)
          if (dlHasFrame) {
            if (dlFrameStyle === 'simple' || dlFrameStyle === 'video') {
              downloadCtx.fillStyle = dlFrameBgColor
              roundRect(downloadCtx, 0, 0, dlTotalWidth, dlTotalHeight, 8)
              downloadCtx.fill()
              downloadCtx.fillStyle = backgroundColor
              roundRect(downloadCtx, 12, 12, dlTotalWidth - 24, size + dlPadding, 6)
              downloadCtx.fill()
            } else if (dlFrameStyle === 'bubble-top') {
              downloadCtx.fillStyle = dlFrameBgColor
              roundRect(downloadCtx, dlTotalWidth/2 - 80, 0, 160, 30, 6)
              downloadCtx.fill()
              downloadCtx.beginPath()
              downloadCtx.moveTo(dlTotalWidth/2 - 10, 30)
              downloadCtx.lineTo(dlTotalWidth/2 + 10, 30)
              downloadCtx.lineTo(dlTotalWidth/2, 42)
              downloadCtx.fill()
              downloadCtx.fillStyle = '#ffffff'
              downloadCtx.font = 'bold 16px Arial'
              downloadCtx.textAlign = 'center'
              downloadCtx.fillText(frameText, dlTotalWidth/2, 22)
            } else if (dlFrameStyle === 'bubble') {
              downloadCtx.strokeStyle = dlFrameBgColor
              downloadCtx.lineWidth = 6
              roundRect(downloadCtx, dlPadding, dlPadding + dlTopTextHeight, size, size, 0)
              downloadCtx.stroke()
              downloadCtx.fillStyle = foregroundColor
              downloadCtx.font = 'bold 18px Arial'
              downloadCtx.textAlign = 'center'
              downloadCtx.fillText(frameText, dlTotalWidth/2, dlTopTextHeight - 10)
            }
          }

          // QR kodu çiz (Draw QR code)
          const qrDataUrlTemp = await QRCode.toDataURL(content, {
            width: size,
            margin: 2,
            color: { dark: foregroundColor, light: backgroundColor },
            errorCorrectionLevel: errorCorrection,
          })

          const downloadQrImg = new window.Image()
          downloadQrImg.onload = async () => {
            downloadCtx.drawImage(downloadQrImg, dlQrX, dlQrY, size, size)

            // Logo ekle (Add logo)
            if (logo) {
              const logoCenterX = dlQrX + size / 2
              const logoCenterY = dlQrY + size / 2
              const logoW = size * (logoSize / 100)

              downloadCtx.fillStyle = '#ffffff'
              downloadCtx.beginPath()
              downloadCtx.arc(logoCenterX, logoCenterY, logoW / 2 + 10, 0, Math.PI * 2)
              downloadCtx.fill()

              const downloadLogoImg = new window.Image()
              downloadLogoImg.crossOrigin = 'anonymous'
              await new Promise<void>((resolve) => {
                downloadLogoImg.onload = () => {
                  const actualLogoH = (downloadLogoImg.height / downloadLogoImg.width) * logoW
                  downloadCtx.drawImage(downloadLogoImg, logoCenterX - logoW / 2, logoCenterY - actualLogoH / 2, logoW, actualLogoH)
                  resolve()
                }
                downloadLogoImg.onerror = () => resolve()
                downloadLogoImg.src = logo
              })
            }

            // Frame text ekle (Add frame text for download)
            if (dlHasFrame && frameTemplate.hasText && frameText && dlFrameStyle !== 'bubble-top' && dlFrameStyle !== 'bubble') {
              const dlTextY = dlQrY + size + 36

              if (dlFrameStyle === 'simple' || dlFrameStyle === 'video') {
                downloadCtx.fillStyle = '#ffffff'
                downloadCtx.font = 'bold 20px Arial'
                downloadCtx.textAlign = 'center'
                downloadCtx.fillText(frameText, dlTotalWidth / 2, dlTextY)
              } else if (dlFrameStyle === 'badge') {
                downloadCtx.save()
                downloadCtx.translate(dlPadding + 15, dlQrY + size - 10)
                downloadCtx.rotate(-15 * Math.PI / 180)
                downloadCtx.fillStyle = dlFrameBgColor
                roundRect(downloadCtx, 0, 0, 100, 26, 4)
                downloadCtx.fill()
                downloadCtx.fillStyle = '#ffffff'
                downloadCtx.font = 'bold 14px Arial'
                downloadCtx.textAlign = 'center'
                downloadCtx.fillText(frameText, 50, 18)
                downloadCtx.restore()
              } else if (dlFrameStyle === 'text-bottom') {
                downloadCtx.fillStyle = foregroundColor
                downloadCtx.font = 'bold 24px Arial'
                downloadCtx.textAlign = 'center'
                downloadCtx.fillText(frameText, dlTotalWidth / 2, dlTextY + 6)
              } else if (dlFrameStyle === 'tag') {
                const tagWidth = frameText.length * 12 + 24
                downloadCtx.fillStyle = dlFrameBgColor
                roundRect(downloadCtx, dlTotalWidth - tagWidth - 12, dlQrY + size - 12, tagWidth, 30, 4)
                downloadCtx.fill()
                downloadCtx.fillStyle = '#ffffff'
                downloadCtx.font = 'bold 14px Arial'
                downloadCtx.textAlign = 'center'
                downloadCtx.fillText(frameText, dlTotalWidth - tagWidth/2 - 12, dlQrY + size + 8)
              } else if (dlFrameStyle === 'shopping') {
                const tagWidth = frameText.length * 10 + 30
                downloadCtx.fillStyle = dlFrameBgColor
                downloadCtx.fillRect(dlTotalWidth/2 - tagWidth/2, dlQrY + size + 6, tagWidth, 28)
                downloadCtx.fillStyle = '#ffffff'
                downloadCtx.font = 'bold 14px Arial'
                downloadCtx.textAlign = 'center'
                downloadCtx.fillText(frameText, dlTotalWidth / 2, dlQrY + size + 26)
              }
            }

            setQrDataUrl(downloadCanvas.toDataURL('image/png'))
          }
          downloadQrImg.src = qrDataUrlTemp
        }
      } catch (err) {
        console.error('QR Code generation error:', err)
      }
    }

    generateQR()
  }, [content, foregroundColor, backgroundColor, size, errorCorrection, logo, logoSize, selectedFrame, frameText, frameTemplate, isAuthenticated])

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
            <div className="relative">
              <canvas ref={canvasRef} className="rounded-lg" />
              {/* Watermark varsa önizleme badge'i */}
              {!isAuthenticated && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                  {locale === 'tr' ? 'Önizleme' : 'Preview'}
                </div>
              )}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center bg-gray-50 text-gray-400 rounded-lg"
              style={{ width: 200, height: 200 }}
            >
              <Smartphone className="w-12 h-12 mb-3 text-gray-300" />
              <span className="text-sm font-medium">{t('qrPreview')}</span>
              <span className="text-xs text-gray-400 mt-1">{t('enterContentToGenerate')}</span>
            </div>
          )}
        </div>
      </div>

      {/* QR Kod bilgisi (QR Code info) */}
      {content && (
        <div className="text-center text-sm text-gray-500">
          <span>{size}×{size}px</span>
          <span className="mx-2">•</span>
          <span>{t('errorCorrection')}: {errorCorrection}</span>
        </div>
      )}

      {/* İndirme Butonları (Download Buttons) */}
      {content && (
        <div className="w-full space-y-3">
          {/* Üye değilse giriş yapma uyarısı (Login prompt if not authenticated) */}
          {!isAuthenticated ? (
            <>
              {/* Giriş Yap butonu (Login button) */}
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
              >
                <LogIn className="w-5 h-5" />
                {t('loginToDownload') || 'İndirmek için Giriş Yap'}
              </button>

              {/* Bilgi mesajı (Info message) */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      {t('downloadRequiresLogin') || 'İndirme için üyelik gerekli'}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      {t('downloadRequiresLoginDesc') || 'QR kodunuzu PNG, SVG formatlarında indirmek için ücretsiz hesap oluşturun.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Kayıt ol linki (Register link) */}
              <div className="text-center">
                <span className="text-sm text-gray-500">
                  {t('noAccount') || 'Hesabınız yok mu?'}{' '}
                </span>
                <button
                  onClick={() => router.push('/auth/register')}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {t('registerNow') || 'Ücretsiz Kayıt Ol'}
                </button>
              </div>
            </>
          ) : (
            <>
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
                      {t('copied') || 'Kopyalandı!'}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      {t('copy') || 'Kopyala'}
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
                  {t('share') || 'Paylaş'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* İpucu (Tip) */}
      {!content && (
        <p className="text-xs text-gray-400 text-center px-4">
          {t('selectTypeAndEnter')}
        </p>
      )}
    </div>
  )
}

