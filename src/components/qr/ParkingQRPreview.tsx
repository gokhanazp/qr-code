// Araç Park QR Kod Önizleme ve İndirme Komponenti
// Sarı-siyah etiket formatında özel tasarım
// İndirme için kayıt zorunlu + Watermark koruması
// (Car Parking QR Code Preview with yellow-black label design)

'use client'

import { useRef, useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Download, Check, Copy, Lock, LogIn } from 'lucide-react'
import Link from 'next/link'
import QRCode from 'qrcode'

interface ParkingQRPreviewProps {
  phone: string           // Telefon numarası
  topLabel?: string       // Üst etiket (örn: "TELEFON")
  bottomText?: string     // Alt metin (örn: "ARAÇ SAHİBİNE ULAŞMAK İÇİN KODU OKUT")
  isAuthenticated?: boolean // Kullanıcı giriş yapmış mı?
}

export default function ParkingQRPreview({
  phone,
  topLabel = 'TELEFON',
  bottomText = 'ARAÇ SAHİBİNE\nULAŞMAK İÇİN\nKODU OKUT',
  isAuthenticated = false
}: ParkingQRPreviewProps) {
  const t = useTranslations('generator')
  const locale = useLocale()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dataUrl, setDataUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Etiket boyutları (Label dimensions)
  const LABEL_WIDTH = 300
  const LABEL_HEIGHT = 450
  const QR_SIZE = 200
  const CORNER_RADIUS = 20

  useEffect(() => {
    generateParkingLabel()
  }, [phone, topLabel, bottomText, isAuthenticated])

  // Watermark ekle - Giriş yapmamış kullanıcılar için (Add watermark for non-authenticated users)
  // Minimal watermark - QR'ı taranamaz yapar ama estetik görünür
  // Parking etiketi için özel - QR kod üst kısımda
  const addWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (isAuthenticated) return

    ctx.save()

    // QR kod pozisyonu (parking etiketinde QR üstte)
    const qrTop = 30
    const qrLeft = (width - 200) / 2
    const qrSize = 200

    // Finder pattern'leri bozan minimal çizgiler
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)'
    ctx.lineWidth = 5
    ctx.lineCap = 'round'

    // Sol üst finder
    ctx.beginPath()
    ctx.moveTo(qrLeft + 5, qrTop + 5)
    ctx.lineTo(qrLeft + 55, qrTop + 55)
    ctx.stroke()

    // Sağ üst finder
    ctx.beginPath()
    ctx.moveTo(qrLeft + qrSize - 5, qrTop + 5)
    ctx.lineTo(qrLeft + qrSize - 55, qrTop + 55)
    ctx.stroke()

    // Sol alt finder
    ctx.beginPath()
    ctx.moveTo(qrLeft + 5, qrTop + qrSize - 5)
    ctx.lineTo(qrLeft + 55, qrTop + qrSize - 55)
    ctx.stroke()

    // Orta watermark yazısı - şeffaf
    ctx.translate(width / 2, qrTop + qrSize / 2)
    ctx.rotate(-Math.PI / 6)
    ctx.font = '600 14px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
    ctx.fillText('QRCodeShine.com', 0, 0)

    ctx.restore()
  }

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

        // Watermark ekle (giriş yapmamışsa)
        addWatermark(ctx, LABEL_WIDTH, LABEL_HEIGHT)

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

  // İndirme kontrolü - Giriş yapmamışsa modal göster
  const handleDownloadClick = (downloadFn: () => void | Promise<void>) => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    downloadFn()
  }

  // PNG olarak indir (Download as PNG) - Watermark'sız
  const downloadPNG = () => {
    if (!dataUrl || !isAuthenticated) return
    setDownloading(true)

    // Temiz indirme için yeni canvas oluştur (watermark'sız)
    generateCleanDownload(1, (cleanDataUrl) => {
      const link = document.createElement('a')
      link.download = `arac-qr-${phone.replace(/\D/g, '').slice(-4)}.png`
      link.href = cleanDataUrl
      link.click()
      setTimeout(() => setDownloading(false), 1000)
    })
  }

  // Temiz indirme için watermark'sız canvas oluştur
  const generateCleanDownload = async (scale: number, callback: (dataUrl: string) => void) => {
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

        // Watermark YOK - temiz indirme
        callback(canvas.toDataURL('image/png'))
      }
      qrImg.src = qrDataUrl
    } catch (err) {
      console.error('Clean download error:', err)
    }
  }

  // Yüksek çözünürlükte indir (Download high resolution) - 3x scale
  const downloadHighRes = () => {
    if (!phone || !isAuthenticated) return
    setDownloading(true)

    generateCleanDownload(3, (cleanDataUrl) => {
      const link = document.createElement('a')
      link.download = `arac-qr-hd-${phone.replace(/\D/g, '').slice(-4)}.png`
      link.href = cleanDataUrl
      link.click()
      setDownloading(false)
    })
  }

  // Kopyala - Sadece giriş yapan kullanıcılar için temiz kopya
  const copyToClipboard = async () => {
    if (!dataUrl) return

    // Giriş yapmamışsa modal göster
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    // Temiz kopya oluştur (watermark'sız)
    generateCleanDownload(1, async (cleanDataUrl) => {
      try {
        const response = await fetch(cleanDataUrl)
        const blob = await response.blob()
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ])
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Kopyalama hatası:', err)
      }
    })
  }

  // Login URL - dile göre
  const loginUrl = locale === 'tr' ? '/giris' : '/auth/login'
  const registerUrl = locale === 'tr' ? '/kayit' : '/auth/register'

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {locale === 'tr' ? 'İndirmek için Giriş Yapın' : 'Login to Download'}
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                {locale === 'tr'
                  ? 'QR kodunu indirmek için ücretsiz hesap oluşturun veya giriş yapın.'
                  : 'Create a free account or login to download your QR code.'}
              </p>

              <div className="space-y-3">
                <Link
                  href={loginUrl}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  <LogIn className="w-5 h-5" />
                  {locale === 'tr' ? 'Giriş Yap' : 'Login'}
                </Link>
                <Link
                  href={registerUrl}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  {locale === 'tr' ? 'Ücretsiz Kayıt Ol' : 'Sign Up Free'}
                </Link>
              </div>

              <button
                onClick={() => setShowLoginModal(false)}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700"
              >
                {locale === 'tr' ? 'Vazgeç' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Önizleme */}
      <div className="bg-gray-100 p-4 rounded-2xl shadow-lg relative">
        <canvas
          ref={canvasRef}
          className="rounded-xl"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        {/* Watermark varsa uyarı badge'i */}
        {phone && !isAuthenticated && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            {locale === 'tr' ? 'Önizleme' : 'Preview'}
          </div>
        )}
      </div>

      {/* İçerik yoksa mesaj */}
      {!phone && (
        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">
            {t('parkingEnterPhone') || 'QR kodu görmek için telefon numarası girin'}
          </p>
        </div>
      )}

      {/* Giriş yapmamış kullanıcı için uyarı */}
      {phone && !isAuthenticated && (
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-xs">
          <Lock className="w-5 h-5 text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-blue-700 font-medium">
            {locale === 'tr'
              ? 'QR kodu indirmek için giriş yapın'
              : 'Login to download QR code'}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {locale === 'tr'
              ? 'Kayıt olmak ücretsiz!'
              : 'Registration is free!'}
          </p>
        </div>
      )}

      {/* İndirme Butonları */}
      {phone && dataUrl && (
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => handleDownloadClick(downloadPNG)}
            disabled={downloading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
              isAuthenticated
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
          >
            {isAuthenticated ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            PNG
          </button>

          <button
            onClick={() => handleDownloadClick(downloadHighRes)}
            disabled={downloading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
              isAuthenticated
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
          >
            {isAuthenticated ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            HD PNG
          </button>

          <button
            onClick={copyToClipboard}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isAuthenticated
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : (isAuthenticated ? <Copy className="w-4 h-4" /> : <Lock className="w-4 h-4" />)}
            {copied ? (t('copied') || 'Kopyalandı') : (t('copy') || 'Kopyala')}
          </button>
        </div>
      )}

      {/* Baskı Bilgisi - Sadece giriş yapmış kullanıcılar için */}
      {phone && isAuthenticated && (
        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200 max-w-xs">
          <p className="text-xs text-gray-600">
            💡 {t('parkingPrintTip') || 'HD PNG baskı için uygundur. Araç camına yapıştırılabilir etiket olarak bastırabilirsiniz.'}
          </p>
        </div>
      )}
    </div>
  )
}

