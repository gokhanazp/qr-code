// Admin Featured QR Toggle API
// QR kodları öne çıkan olarak işaretleme/kaldırma
// (Toggle QR code featured status)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Featured durumunu toggle et
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    // Mevcut QR kodunu kontrol et
    const { data: existingQR, error: fetchError } = await supabase
      .from('qr_codes')
      .select('id, is_featured')
      .eq('id', id)
      .single()

    if (fetchError || !existingQR) {
      return NextResponse.json(
        { error: 'QR kod bulunamadı' },
        { status: 404 }
      )
    }

    // Featured durumunu güncelle
    const newFeaturedStatus = body.is_featured ?? !existingQR.is_featured

    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .update({ 
        is_featured: newFeaturedStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Featured toggle error:', error)
      return NextResponse.json(
        { error: 'Güncelleme başarısız: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      qrCode,
      message: newFeaturedStatus 
        ? 'QR kod ana sayfaya eklendi' 
        : 'QR kod ana sayfadan kaldırıldı'
    })
  } catch (error) {
    console.error('Featured toggle API error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

