// Account Delete API - Kullanıcının kendi hesabını silmesi
// Account Delete API - User self-delete functionality

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
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

    const userId = user.id

    // Service client ile işlemleri yap (Use service client for operations)
    const serviceClient = createServiceClient()

    // Kullanıcının QR kodlarını sil (Delete user's QR codes)
    await serviceClient
      .from('qr_codes')
      .delete()
      .eq('user_id', userId)

    // Kullanıcı profilini sil (Delete user profile)
    const { error: profileError } = await serviceClient
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Profile delete error:', profileError)
      return NextResponse.json(
        { error: 'Profil silinemedi' },
        { status: 500 }
      )
    }

    // Auth kullanıcısını sil (Delete auth user)
    const { error: authError } = await serviceClient.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Auth delete error:', authError)
      return NextResponse.json(
        { error: 'Hesap silinemedi' },
        { status: 500 }
      )
    }

    // Oturumu kapat (Sign out - cookie temizleme için)
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

