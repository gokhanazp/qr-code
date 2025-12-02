// Kullanıcı QR Kod API - Güncelleme ve Silme işlemleri
// User QR Code API - Update and Delete operations

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// QR kod güncelleme isteği tipi (Update request type)
interface UpdateQRRequest {
  name?: string
  content?: string
  rawContent?: Record<string, string>
  settings?: {
    foregroundColor?: string
    backgroundColor?: string
    size?: number
    errorCorrection?: string
    frame?: string
    frameText?: string
    frameColor?: string
    logo?: string | null
    logoSize?: number
  }
  is_active?: boolean
}

// QR kod güncelle (Update QR code) - Sadece sahibi güncelleyebilir
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Kullanıcı kontrolü (User authentication check)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim', message: 'Lütfen giriş yapın' },
        { status: 401 }
      )
    }

    // QR kodun sahibi mi kontrol et (Check if user owns the QR code)
    const { data: existingQR, error: fetchError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingQR) {
      return NextResponse.json(
        { error: 'QR kod bulunamadı' },
        { status: 404 }
      )
    }

    // Sahiplik kontrolü (Ownership check)
    if (existingQR.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Bu QR kodu düzenleme yetkiniz yok' },
        { status: 403 }
      )
    }

    // İstek gövdesini al (Get request body)
    const body: UpdateQRRequest = await request.json()
    const { name, content, rawContent, settings, is_active } = body

    // Güncellenecek alanları hazırla (Prepare fields to update)
    const updateData: Record<string, unknown> = {}

    if (name !== undefined) updateData.name = name
    if (is_active !== undefined) updateData.is_active = is_active
    if (settings !== undefined) updateData.settings = settings

    // Content güncelleme - QR tipine göre doğru veri yapısı kullan
    // Content update - Use correct data structure based on QR type
    if (content !== undefined || rawContent !== undefined) {
      const existingContent = existingQR.content as Record<string, unknown> || {}
      const qrType = existingQR.type

      // APP tipi için rawContent'i raw alanına kaydet
      if (qrType === 'APP' && rawContent) {
        updateData.content = {
          encoded: existingContent.encoded, // QR kod URL'si değişmez
          raw: rawContent, // Tüm APP verileri (logo, renkler, store URL'leri vb.)
          originalUrl: existingContent.originalUrl
        }
      } else {
        // Diğer tipler için standart güncelleme
        updateData.content = {
          encoded: existingContent.encoded, // QR kod URL'si değişmez (redirect URL stays same)
          raw: rawContent || existingContent.raw || {},
          originalUrl: content || existingContent.originalUrl // Yeni hedef URL (New target URL)
        }
      }
    }

    // Güncelleme yap (Perform update)
    const { data: updatedQR, error: updateError } = await supabase
      .from('qr_codes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Güncelleme başarısız: ' + updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'QR kod başarıyla güncellendi',
      qrCode: updatedQR
    })
  } catch (error) {
    console.error('Update QR error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

// QR kod sil (Delete QR code) - Sadece sahibi silebilir
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Kullanıcı kontrolü (User authentication check)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim', message: 'Lütfen giriş yapın' },
        { status: 401 }
      )
    }

    // QR kodun sahibi mi kontrol et (Check if user owns the QR code)
    const { data: qrCode, error: fetchError } = await supabase
      .from('qr_codes')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (fetchError || !qrCode) {
      return NextResponse.json(
        { error: 'QR kod bulunamadı' },
        { status: 404 }
      )
    }

    // Sahiplik kontrolü (Ownership check)
    if (qrCode.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Bu QR kodu silme yetkiniz yok' },
        { status: 403 }
      )
    }

    // QR kodu sil (Delete QR code)
    const { error: deleteError } = await supabase
      .from('qr_codes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Extra güvenlik - sadece sahibinin silmesini garanti et

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Silme başarısız: ' + deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'QR kod başarıyla silindi'
    })
  } catch (error) {
    console.error('Delete QR error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

