// QR Code Save API - Supabase entegrasyonu
// QR kod kaydetme ve listeleme endpoint'i

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// QR kod kaydetme isteği tipi
interface SaveQRRequest {
  name: string
  type: string
  content: string
  rawContent?: Record<string, string>
  settings: {
    foregroundColor: string
    backgroundColor: string
    size: number
    errorCorrection: string
    frame?: string
    frameText?: string
    frameColor?: string
    logo?: string
    logoSize?: number
  }
}

export async function POST(request: NextRequest) {
  try {
    // Supabase client oluştur
    const supabase = await createClient()

    // Kullanıcı kontrolü
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Lütfen giriş yapın' },
        { status: 401 }
      )
    }

    // İstek gövdesini al
    const body: SaveQRRequest = await request.json()
    const { name, type, content, rawContent, settings } = body

    // Validasyon
    if (!name || !type || !content) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'İsim, tip ve içerik zorunludur' },
        { status: 400 }
      )
    }

    // Limit kontrolü - Supabase RPC ile
    const { data: limitCheck, error: limitError } = await supabase
      .rpc('can_create_qr', { p_user_id: user.id })

    if (limitError) {
      console.error('Limit check error:', limitError)
      // Limit kontrolü başarısız olursa devam et (fonksiyon henüz oluşturulmamış olabilir)
    } else if (limitCheck && !limitCheck.can_create) {
      return NextResponse.json(
        {
          error: 'Limit Reached',
          message: `QR kod limitinize ulaştınız (${limitCheck.current}/${limitCheck.limit}). Planınızı yükseltin.`,
          current: limitCheck.current,
          limit: limitCheck.limit,
          plan: limitCheck.plan
        },
        { status: 403 }
      )
    }

    // Tarama takibi gereken tüm tipler için is_dynamic = true
    // URL tipi de dahil - böylece tarama sayısı takip edilebilir
    // Dynamic types that need tracking - includes URL for scan tracking
    const dynamicTypes = ['app', 'vcard', 'url', 'wifi', 'email', 'sms', 'phone', 'location']
    const isDynamic = dynamicTypes.includes(type.toLowerCase())

    // QR kodunu kaydet
    const { data: qrCode, error: insertError } = await supabase
      .from('qr_codes')
      .insert({
        user_id: user.id,
        name: name,
        type: type.toLowerCase(),
        content: {
          encoded: content,
          raw: rawContent || {}
        },
        settings: settings,
        is_dynamic: isDynamic,
        is_active: true
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Database Error', message: 'QR kod kaydedilemedi: ' + insertError.message },
        { status: 500 }
      )
    }

    // Dinamik QR kodlar için redirect URL oluştur (Create redirect URL for dynamic QR codes)
    // APP tipi için /app/[id], diğerleri için /r/[id] kullan
    let qrUrl = content
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://qr-code-gamma-neon.vercel.app'

    if (isDynamic && qrCode) {
      if (type.toLowerCase() === 'app') {
        qrUrl = `${baseUrl}/app/${qrCode.id}`
      } else if (type.toLowerCase() === 'vcard') {
        // vCard için mevcut /v/[encoded] yapısını koru veya /r/[id] kullan
        qrUrl = `${baseUrl}/r/${qrCode.id}`
      } else {
        qrUrl = `${baseUrl}/r/${qrCode.id}`
      }

      // Content.encoded alanını redirect URL ile güncelle
      // Update content.encoded with redirect URL so QR code points to tracking page
      await supabase
        .from('qr_codes')
        .update({
          content: {
            encoded: qrUrl, // QR kod bu URL'yi gösterecek
            raw: rawContent || {},
            originalUrl: content // Orijinal hedef URL'yi sakla
          }
        })
        .eq('id', qrCode.id)
    }

    return NextResponse.json({
      success: true,
      message: 'QR kod başarıyla kaydedildi',
      qrCode: { ...qrCode, content: { encoded: qrUrl, raw: rawContent || {}, originalUrl: content } },
      qrUrl: qrUrl // Frontend'de QR kodu bu URL ile oluşturacak
    }, { status: 201 })

  } catch (error) {
    console.error('Save QR error:', error)
    return NextResponse.json(
      { error: 'Server Error', message: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Kullanıcının QR kodlarını listele
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Kullanıcının QR kodlarını getir
    const { data: qrCodes, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message },
        { status: 500 }
      )
    }

    // Limit bilgisini de getir
    const { data: limitCheck } = await supabase
      .rpc('can_create_qr', { p_user_id: user.id })

    return NextResponse.json({
      qrCodes,
      limits: limitCheck || { current: qrCodes?.length || 0, limit: 2, plan: 'free', can_create: true }
    })

  } catch (error) {
    console.error('Get QR error:', error)
    return NextResponse.json(
      { error: 'Server Error' },
      { status: 500 }
    )
  }
}

