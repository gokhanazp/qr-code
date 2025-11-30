// QR Code Generate API
// QR kod oluşturma endpoint'i

import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

// QR kod oluşturma seçenekleri tipi
interface QROptions {
  content: string
  type: string
  foreground?: string
  background?: string
  size?: number
  errorCorrection?: 'L' | 'M' | 'Q' | 'H'
  format?: 'png' | 'svg'
}

export async function POST(request: NextRequest) {
  try {
    const body: QROptions = await request.json()
    const {
      content,
      type,
      foreground = '#000000',
      background = '#ffffff',
      size = 256,
      errorCorrection = 'M',
      format = 'png',
    } = body

    // İçerik kontrolü
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // QR kod seçenekleri
    const qrOptions = {
      errorCorrectionLevel: errorCorrection,
      type: format === 'svg' ? 'svg' as const : 'image/png' as const,
      width: size,
      margin: 2,
      color: {
        dark: foreground,
        light: background,
      },
    }

    // QR kodu oluştur
    if (format === 'svg') {
      const svg = await QRCode.toString(content, {
        ...qrOptions,
        type: 'svg',
      })
      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
        },
      })
    } else {
      const dataUrl = await QRCode.toDataURL(content, qrOptions)
      return NextResponse.json({ 
        dataUrl,
        type,
        content,
      })
    }
  } catch (error) {
    console.error('QR generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}

