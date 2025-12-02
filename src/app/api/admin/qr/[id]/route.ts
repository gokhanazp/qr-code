// Admin QR Code Management API
// QR kodlarını yönetme endpoint'i (aktif/pasif, süre uzatma)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// QR kod bilgilerini getir (Get QR code info)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !qrCode) {
      return NextResponse.json(
        { error: 'QR kod bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ qrCode })
  } catch (error) {
    console.error('Get QR error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

// QR kod güncelle (Update QR code)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    // Güncellenebilir alanlar (Updatable fields)
    const updates: Record<string, unknown> = {}

    // Aktif/Pasif durumu (Active/Inactive status)
    if (typeof body.is_active === 'boolean') {
      updates.is_active = body.is_active
    }

    // Süre uzatma (Extend duration)
    if (body.extend_days && typeof body.extend_days === 'number') {
      // Mevcut QR'ı al (Get current QR)
      const { data: currentQR } = await supabase
        .from('qr_codes')
        .select('expires_at')
        .eq('id', id)
        .single()

      if (currentQR) {
        // Mevcut son kullanma tarihinden veya şu andan itibaren uzat
        // (Extend from current expiry date or from now)
        const baseDate = currentQR.expires_at
          ? new Date(currentQR.expires_at)
          : new Date()

        // Eğer süre dolmuşsa şu andan itibaren başlat
        // (If expired, start from now)
        const startDate = baseDate < new Date() ? new Date() : baseDate

        const newExpiry = new Date(startDate)
        newExpiry.setDate(newExpiry.getDate() + body.extend_days)
        updates.expires_at = newExpiry.toISOString()
      }
    }

    // Süre kısaltma (Reduce duration)
    if (body.reduce_days && typeof body.reduce_days === 'number' && body.reduce_days > 0) {
      const { data: currentQR } = await supabase
        .from('qr_codes')
        .select('expires_at')
        .eq('id', id)
        .single()

      if (currentQR && currentQR.expires_at) {
        const currentExpiry = new Date(currentQR.expires_at)
        const newExpiry = new Date(currentExpiry)
        newExpiry.setDate(newExpiry.getDate() - body.reduce_days)

        // Geçmişe gitmesin, en erken bugün olsun
        // (Don't go to past, minimum is today)
        const minDate = new Date()
        if (newExpiry < minDate) {
          updates.expires_at = minDate.toISOString()
        } else {
          updates.expires_at = newExpiry.toISOString()
        }
      }
    }

    // Süreyi sınırsız yap (Make unlimited)
    if (body.make_unlimited === true) {
      updates.expires_at = null
    }

    // Belirli bir tarihe ayarla (Set specific date)
    if (body.expires_at) {
      updates.expires_at = body.expires_at
    }

    // Güncelleme yoksa hata dön (Return error if no updates)
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Güncellenecek alan belirtilmedi' },
        { status: 400 }
      )
    }

    // updated_at ekle (Add updated_at)
    updates.updated_at = new Date().toISOString()

    // Güncelle (Update)
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json(
        { error: 'Güncelleme başarısız: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'QR kod güncellendi',
      qrCode
    })
  } catch (error) {
    console.error('Update QR error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

// QR kod sil (Delete QR code)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from('qr_codes')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'Silme başarısız: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'QR kod silindi'
    })
  } catch (error) {
    console.error('Delete QR error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

