// Araç Park QR Kod Önizleme ve İndirme Komponenti
// Sarı-siyah etiket formatında özel tasarım
// (Car Parking QR Code Preview with yellow-black label design)

'use client'

import { useRef, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Download, Check, Copy } from 'lucide-react'
import QRCode from 'qrcode'

interface ParkingQRPreviewProps {
  phone: string           // Telefon numarası
  topLabel?: string       // Üst etiket (örn: "TELEFON")
  bottomText?: string     // Alt metin (örn: "ARAÇ SAHİBİNE ULAŞMAK İÇİN KODU OKUT")
}

export default function ParkingQRPreview({
  phone,
  topLabel = 'TELEFON',
  bottomText = 'ARAÇ SAHİBİNE\nULAŞMAK İÇİN\nKODU OKUT'
}: ParkingQRPreviewProps) {
  const t = useTranslations('generator')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dataUrl, setDataUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  // Etiket boyutları (Label dimensions)
  const LABEL_WIDTH = 300
  const LABEL_HEIGHT = 450
  const QR_SIZE = 200
  const CORNER_RADIUS = 20

  useEffect(() => {
    generateParkingLabel()
  }, [phone, topLabel, bottomText])

  // Park etiketi oluştur (Generate parking label)
  const generateParkingLabel = async () => {
    const canvas = canvasRef.current
    if (!canvas || !phone) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas boyutları
    canvas.width = LABEL_WIDTH
    canvas.height = LABEL_HEIGHT

    // Arka plan temizle
    ctx.clearRect(0, 0, LABEL_WIDTH, LABEL_HEIGHT)

    // Siyah yuvarlatılmış dikdörtgen arka plan (Black rounded rectangle background)
    ctx.fillStyle = '#1a1a1a'
    roundRect(ctx, 0, 0, LABEL_WIDTH, LABEL_HEIGHT * 0.7, CORNER_RADIUS, CORNER_RADIUS, 0, 0)
    ctx.fill()

    // Sarı alt bant (Yellow bottom band)
    ctx.fillStyle = '#FFD700'
    roundRect(ctx, 0, LABEL_HEIGHT * 0.65, LABEL_WIDTH, LABEL_HEIGHT * 0.35, 0, 0, CORNER_RADIUS, CORNER_RADIUS)
    ctx.fill()

    // Beyaz QR kod arka planı (White QR background)
    const qrBgSize = QR_SIZE + 20
    const qrBgX = (LABEL_WIDTH - qrBgSize) / 2
    const qrBgY = 30
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(qrBgX, qrBgY, qrBgSize, qrBgSize)

    // QR kod oluştur
    const qrContent = `tel:${phone.replace(/\D/g, '')}`
    try {
      const qrDataUrl = await QRCode.toDataURL(qrContent, {
        width: QR_SIZE,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'H'
      })

      // QR kod çiz
      const qrImg = new window.Image()
      qrImg.onload = () => {
        const qrX = (LABEL_WIDTH - QR_SIZE) / 2
        const qrY = 40
        ctx.drawImage(qrImg, qrX, qrY, QR_SIZE, QR_SIZE)

        // Üst etiket metni (Top label text - e.g., "TELEFON")
        if (topLabel) {
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 24px Arial, sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(topLabel.toUpperCase(), LABEL_WIDTH / 2, QR_SIZE + 80)
        }

        // Alt metin - sarı bant üzerinde siyah (Bottom text on yellow band)
        if (bottomText) {
          ctx.fillStyle = '#000000'
          ctx.font = 'bold 22px Arial, sans-serif'
          ctx.textAlign = 'center'
          
          // Çok satırlı metin işle
          const lines = bottomText.split('\n')
          const lineHeight = 28
          const startY = LABEL_HEIGHT * 0.72
          
          lines.forEach((line, index) => {
            ctx.fillText(line.toUpperCase(), LABEL_WIDTH / 2, startY + (index * lineHeight))
          })
        }

        // Data URL kaydet
        setDataUrl(canvas.toDataURL('image/png'))
      }
      qrImg.src = qrDataUrl
    } catch (err) {
      console.error('QR oluşturma hatası:', err)
    }
  }

  // Yuvarlatılmış dikdörtgen çiz (Draw rounded rectangle)
  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    width: number, height: number,
    radiusTL: number, radiusTR: number,
    radiusBR: number, radiusBL: number
  ) => {
    ctx.beginPath()
    ctx.moveTo(x + radiusTL, y)
    ctx.lineTo(x + width - radiusTR, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radiusTR)
    ctx.lineTo(x + width, y + height - radiusBR)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radiusBR, y + height)
    ctx.lineTo(x + radiusBL, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radiusBL)
    ctx.lineTo(x, y + radiusTL)
    ctx.quadraticCurveTo(x, y, x + radiusTL, y)
    ctx.closePath()
  }

  // PNG olarak indir (Download as PNG)
  const downloadPNG = () => {
    if (!dataUrl) return
    setDownloading(true)
    
    const link = document.createElement('a')
    link.download = `arac-qr-${phone.replace(/\D/g, '').slice(-4)}.png`
    link.href = dataUrl
    link.click()
    
    setTimeout(() => setDownloading(false), 1000)
  }

  // Yüksek çözünürlükte indir (Download high resolution)
  const downloadHighRes = async () => {
    if (!phone) return
    setDownloading(true)

    // Yüksek çözünürlük için 3x boyut
    const scale = 3
    const canvas = document.createElement('canvas')
    canvas.width = LABEL_WIDTH * scale
    canvas.height = LABEL_HEIGHT * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.scale(scale, scale)

    // Siyah arka plan
    ctx.fillStyle = '#1a1a1a'
    roundRect(ctx, 0, 0, LABEL_WIDTH, LABEL_HEIGHT * 0.7, CORNER_RADIUS, CORNER_RADIUS, 0, 0)
    ctx.fill()

    // Sarı bant
    ctx.fillStyle = '#FFD700'
    roundRect(ctx, 0, LABEL_HEIGHT * 0.65, LABEL_WIDTH, LABEL_HEIGHT * 0.35, 0, 0, CORNER_RADIUS, CORNER_RADIUS)
    ctx.fill()

    // Beyaz QR arka planı
    const qrBgSize = QR_SIZE + 20
    const qrBgX = (LABEL_WIDTH - qrBgSize) / 2
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(qrBgX, 30, qrBgSize, qrBgSize)

    // QR kod
    const qrContent = `tel:${phone.replace(/\D/g, '')}`
    try {
      const qrDataUrl = await QRCode.toDataURL(qrContent, {
        width: QR_SIZE * scale,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'H'
      })

      const qrImg = new window.Image()
      qrImg.onload = () => {
        const qrX = (LABEL_WIDTH - QR_SIZE) / 2
        ctx.drawImage(qrImg, qrX, 40, QR_SIZE, QR_SIZE)

        // Üst etiket
        if (topLabel) {
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 24px Arial, sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(topLabel.toUpperCase(), LABEL_WIDTH / 2, QR_SIZE + 80)
        }

        // Alt metin
        if (bottomText) {
          ctx.fillStyle = '#000000'
          ctx.font = 'bold 22px Arial, sans-serif'
          ctx.textAlign = 'center'
          
          const lines = bottomText.split('\n')
          const lineHeight = 28
          const startY = LABEL_HEIGHT * 0.72
          
          lines.forEach((line, index) => {
            ctx.fillText(line.toUpperCase(), LABEL_WIDTH / 2, startY + (index * lineHeight))
          })
        }

        // İndir
        const link = document.createElement('a')
        link.download = `arac-qr-hd-${phone.replace(/\D/g, '').slice(-4)}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        
        setDownloading(false)
      }
      qrImg.src = qrDataUrl
    } catch (err) {
      console.error('HD QR oluşturma hatası:', err)
      setDownloading(false)
    }
  }

  // Kopyala
  const copyToClipboard = async () => {
    if (!dataUrl) return
    try {
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Kopyalama hatası:', err)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Önizleme */}
      <div className="bg-gray-100 p-4 rounded-2xl shadow-lg">
        <canvas
          ref={canvasRef}
          className="rounded-xl"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* İçerik yoksa mesaj */}
      {!phone && (
        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">
            {t('parkingEnterPhone') || 'QR kodu görmek için telefon numarası girin'}
          </p>
        </div>
      )}

      {/* İndirme Butonları */}
      {phone && dataUrl && (
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={downloadPNG}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            PNG
          </button>
          
          <button
            onClick={downloadHighRes}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            HD PNG
          </button>

          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? (t('copied') || 'Kopyalandı') : (t('copy') || 'Kopyala')}
          </button>
        </div>
      )}

      {/* Baskı Bilgisi */}
      {phone && (
        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200 max-w-xs">
          <p className="text-xs text-gray-600">
            💡 {t('parkingPrintTip') || 'HD PNG baskı için uygundur. Araç camına yapıştırılabilir etiket olarak bastırabilirsiniz.'}
          </p>
        </div>
      )}
    </div>
  )
}

