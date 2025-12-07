// Admin User API - Kullanıcı silme işlemleri
// Admin User API - User delete operations

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Admin kontrolü (Admin check)
async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  return profile?.role === 'admin'
}

// DELETE - Kullanıcı sil (Delete user)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Admin kontrolü (Check if admin)
    if (!await isAdmin(supabase)) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      )
    }

    // Kullanıcının QR kodlarını sil (Delete user's QR codes)
    await supabase
      .from('qr_codes')
      .delete()
      .eq('user_id', id)

    // Kullanıcı profilini sil (Delete user profile)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (profileError) {
      console.error('Profile delete error:', profileError)
      return NextResponse.json(
        { error: 'Profil silinemedi' },
        { status: 500 }
      )
    }

    // Auth kullanıcısını sil (Supabase Admin API gerekir)
    // Not: Bu işlem için service_role key gerekli
    // Şimdilik sadece profile siliyoruz

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User delete error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

