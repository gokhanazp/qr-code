// Account Delete API - Kullanıcının kendi hesabını silmesi
// Account Delete API - User self-delete functionality

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// DELETE - Hesabı sil (Delete account)
export async function DELETE() {
  try {
    const supabase = await createClient()
    
    // Kullanıcı kontrolü (Check user)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      )
    }

    // Kullanıcının QR kodlarını sil (Delete user's QR codes)
    await supabase
      .from('qr_codes')
      .delete()
      .eq('user_id', user.id)

    // Kullanıcı profilini sil (Delete user profile)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile delete error:', profileError)
      return NextResponse.json(
        { error: 'Profil silinemedi' },
        { status: 500 }
      )
    }

    // Oturumu kapat (Sign out)
    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Account delete error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

