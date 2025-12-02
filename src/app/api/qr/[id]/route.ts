// Kullanıcı QR Kod API - Silme işlemi
// User QR Code API - Delete operation

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
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

