// Featured QR Codes API
// Ana sayfada gösterilecek öne çıkan QR kodları
// (Featured QR codes to display on homepage)

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Featured QR kodları getir (public endpoint)
export async function GET() {
  try {
    const supabase = await createClient()

    // Featured ve aktif QR kodları çek
    // (Fetch featured and active QR codes)
    const { data: qrCodes, error } = await supabase
      .from('qr_codes')
      .select(`
        id,
        name,
        type,
        content,
        settings,
        short_code,
        scan_count,
        created_at,
        profile:profiles(full_name, plan)
      `)
      .eq('is_featured', true)
      .eq('is_active', true)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .order('scan_count', { ascending: false })
      .limit(12)

    if (error) {
      console.error('Featured QR fetch error:', error)
      return NextResponse.json({ qrCodes: [] })
    }

    return NextResponse.json({ qrCodes: qrCodes || [] })
  } catch (error) {
    console.error('Featured QR API error:', error)
    return NextResponse.json({ qrCodes: [] })
  }
}

