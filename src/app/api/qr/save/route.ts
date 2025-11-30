// QR Code Save API
// QR kod kaydetme endpoint'i

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Oturum kontrolü
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, type, content, data, imageUrl, isDynamic = false } = body

    // Gerekli alan kontrolü
    if (!name || !type || !content) {
      return NextResponse.json(
        { error: 'Name, type, and content are required' },
        { status: 400 }
      )
    }

    // Kullanıcının QR kod limitini kontrol et
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      include: { plan: true },
    })

    const qrCodeCount = await prisma.qRCode.count({
      where: { userId: session.user.id },
    })

    // Limit kontrolü (Free plan için 5 QR kod)
    const limit = subscription?.plan?.qrCodeLimit ?? 5
    if (limit !== -1 && qrCodeCount >= limit) {
      return NextResponse.json(
        { error: 'QR code limit reached. Please upgrade your plan.' },
        { status: 403 }
      )
    }

    // QR kodu kaydet
    const qrCode = await prisma.qRCode.create({
      data: {
        name,
        type,
        content,
        data: data ? JSON.stringify(data) : null,
        imageUrl,
        isDynamic,
        userId: session.user.id,
      },
    })

    return NextResponse.json(
      { message: 'QR code saved successfully', qrCode },
      { status: 201 }
    )
  } catch (error) {
    console.error('QR save error:', error)
    return NextResponse.json(
      { error: 'Failed to save QR code' },
      { status: 500 }
    )
  }
}

// Kullanıcının QR kodlarını listele
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const qrCodes = await prisma.qRCode.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ qrCodes })
  } catch (error) {
    console.error('QR list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch QR codes' },
      { status: 500 }
    )
  }
}

