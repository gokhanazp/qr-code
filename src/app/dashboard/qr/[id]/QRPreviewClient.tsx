'use client'

// QR Kod Önizleme Client Component (Frame destekli)
// Server component'tan gelen verileri gösterir
import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import QRCode from 'qrcode'
import { FRAME_TEMPLATES } from '@/components/qr/QRFrameSelector'

interface QRPreviewClientProps {
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
  qrName?: string
}

// Ref ile dışarıdan erişilebilir metodlar (Methods accessible from outside via ref)
export interface QRPreviewClientRef {
  downloadPNG: () => void
  downloadSVG: () => void
}

const QRPreviewClient = forwardRef<QRPreviewClientRef, QRPreviewClientProps>(({
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
  qrName = 'qr-code',
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  // Dışarıdan erişilebilir indirme metodları (Download methods accessible from outside)
  useImperativeHandle(ref, () => ({
    downloadPNG: () => {
      if (!canvasRef.current) return
      const link = document.createElement('a')
      link.download = `${qrName}.png`
      link.href = canvasRef.current.toDataURL('image/png')
      link.click()
    },
    downloadSVG: async () => {
      if (!content) return
      try {
        const svgString = await QRCode.toString(content, {
          type: 'svg',
          width: size,
          margin: 2,
          color: { dark: foregroundColor, light: backgroundColor },
          errorCorrectionLevel: errorCorrection as 'L' | 'M' | 'Q' | 'H',
        })
        const blob = new Blob([svgString], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `${qrName}.svg`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
      } catch (err) {
        console.error('SVG download error:', err)
      }
    }
  }))

  // Frame template'i bul
  const frameTemplate = FRAME_TEMPLATES.find(f => f.id === selectedFrame) || FRAME_TEMPLATES[0]

  // Yuvarlak köşeli dikdörtgen çiz
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

  useEffect(() => {
    if (!content || !canvasRef.current) return

    const generateQR = async () => {
      try {
        const frameStyle = frameTemplate.frameStyle || 'none'
        const hasFrame = selectedFrame !== 'none'

        // Frame için boyutları hesapla
        const framePadding = hasFrame ? 24 : 0
        const textHeight = hasFrame && frameTemplate.hasText && frameText ? 48 : 0
        const topTextHeight = (frameStyle === 'bubble-top' || frameStyle === 'bubble') && frameText ? 36 : 0

        const totalWidth = size + framePadding * 2
        const totalHeight = size + framePadding * 2 + textHeight + topTextHeight
        const frameBgColor = frameTemplate.backgroundColor || foregroundColor

        // Canvas boyutunu ayarla
        const canvas = canvasRef.current!
        canvas.width = hasFrame ? totalWidth : size
        canvas.height = hasFrame ? totalHeight : size

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Arka planı temizle
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const qrX = hasFrame ? framePadding : 0
        const qrY = hasFrame ? framePadding + topTextHeight : 0

        // Frame stiline göre çiz
        if (hasFrame) {
          if (frameStyle === 'simple' || frameStyle === 'video') {
            ctx.fillStyle = frameBgColor
            roundRect(ctx, 0, 0, totalWidth, totalHeight, 8)
            ctx.fill()
            ctx.fillStyle = backgroundColor
            roundRect(ctx, 12, 12, totalWidth - 24, size + framePadding, 6)
            ctx.fill()
          } else if (frameStyle === 'bubble-top') {
            ctx.fillStyle = frameBgColor
            roundRect(ctx, totalWidth/2 - 80, 0, 160, 30, 6)
            ctx.fill()
            ctx.beginPath()
            ctx.moveTo(totalWidth/2 - 10, 30)
            ctx.lineTo(totalWidth/2 + 10, 30)
            ctx.lineTo(totalWidth/2, 42)
            ctx.fill()
            ctx.fillStyle = '#ffffff'
            ctx.font = 'bold 16px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(frameText, totalWidth/2, 22)
          } else if (frameStyle === 'bubble') {
            ctx.strokeStyle = frameBgColor
            ctx.lineWidth = 6
            roundRect(ctx, framePadding, framePadding + topTextHeight, size, size, 0)
            ctx.stroke()
            ctx.fillStyle = foregroundColor
            ctx.font = 'bold 18px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(frameText, totalWidth/2, topTextHeight - 10)
          }
        }

        // QR kodu oluştur
        const qrDataUrlTemp = await QRCode.toDataURL(content, {
          width: size,
          margin: 2,
          color: { dark: foregroundColor, light: backgroundColor },
          errorCorrectionLevel: errorCorrection as 'L' | 'M' | 'Q' | 'H',
        })

        // QR kodunu çiz
        const qrImg = new Image()
        qrImg.onload = async () => {
          ctx.drawImage(qrImg, qrX, qrY, size, size)

          // Logo varsa ekle
          if (logo) {
            await new Promise<void>((resolve) => {
              const logoImg = new Image()
              logoImg.crossOrigin = 'anonymous'
              logoImg.onload = () => {
                const logoW = (size * logoSize) / 100
                const logoH = logoW * (logoImg.height / logoImg.width)
                const logoCenterX = qrX + size / 2
                const logoCenterY = qrY + size / 2

                ctx.fillStyle = '#ffffff'
                ctx.fillRect(logoCenterX - logoW / 2 - 4, logoCenterY - logoH / 2 - 4, logoW + 8, logoH + 8)
                ctx.drawImage(logoImg, logoCenterX - logoW / 2, logoCenterY - logoH / 2, logoW, logoH)
                resolve()
              }
              logoImg.onerror = () => resolve()
              logoImg.src = logo
            })
          }

          // Frame text ekle
          if (hasFrame && frameTemplate.hasText && frameText && frameStyle !== 'bubble-top' && frameStyle !== 'bubble') {
            const textY = qrY + size + 36

            if (frameStyle === 'simple' || frameStyle === 'video') {
              ctx.fillStyle = '#ffffff'
              ctx.font = 'bold 20px Arial'
              ctx.textAlign = 'center'
              ctx.fillText(frameText, totalWidth / 2, textY)
            } else if (frameStyle === 'badge') {
              ctx.save()
              ctx.translate(framePadding + 15, qrY + size - 10)
              ctx.rotate(-15 * Math.PI / 180)
              ctx.fillStyle = frameBgColor
              roundRect(ctx, 0, 0, 100, 26, 4)
              ctx.fill()
              ctx.fillStyle = '#ffffff'
              ctx.font = 'bold 14px Arial'
              ctx.textAlign = 'center'
              ctx.fillText(frameText, 50, 18)
              ctx.restore()
            } else if (frameStyle === 'text-bottom') {
              ctx.fillStyle = foregroundColor
              ctx.font = 'bold 24px Arial'
              ctx.textAlign = 'center'
              ctx.fillText(frameText, totalWidth / 2, textY + 6)
            } else if (frameStyle === 'tag') {
              const tagWidth = frameText.length * 12 + 24
              ctx.fillStyle = frameBgColor
              roundRect(ctx, totalWidth - tagWidth - 12, qrY + size - 12, tagWidth, 30, 4)
              ctx.fill()
              ctx.fillStyle = '#ffffff'
              ctx.font = 'bold 14px Arial'
              ctx.textAlign = 'center'
              ctx.fillText(frameText, totalWidth - tagWidth/2 - 12, qrY + size + 8)
            } else if (frameStyle === 'shopping') {
              const tagWidth = frameText.length * 10 + 30
              ctx.fillStyle = frameBgColor
              ctx.fillRect(totalWidth/2 - tagWidth/2, qrY + size + 6, tagWidth, 28)
              ctx.fillStyle = '#ffffff'
              ctx.font = 'bold 14px Arial'
              ctx.textAlign = 'center'
              ctx.fillText(frameText, totalWidth / 2, qrY + size + 26)
            }
          }

          setQrDataUrl(canvas.toDataURL('image/png'))
        }
        qrImg.src = qrDataUrlTemp

      } catch (err) {
        console.error('QR generation error:', err)
      }
    }

    generateQR()
  }, [content, foregroundColor, backgroundColor, size, errorCorrection, logo, logoSize, selectedFrame, frameText, frameTemplate])

  if (!content) {
    return (
      <div className="w-64 h-64 bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-gray-400 text-sm">QR Kod Yok</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        className="rounded-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  )
})

// Display name for debugging (Hata ayıklama için görünen isim)
QRPreviewClient.displayName = 'QRPreviewClient'

export default QRPreviewClient

