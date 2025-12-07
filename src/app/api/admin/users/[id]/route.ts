// Admin User API - Kullanıcı silme işlemleri
// Admin User API - User delete operations

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'

// Admin kontrolü (Admin check)
async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  // admin_users tablosundan kontrol et
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .single()

  return !!adminUser
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

    // Service client ile işlemleri yap (Use service client for operations)
    const serviceClient = createServiceClient()

    // Kullanıcının QR kodlarını sil (Delete user's QR codes)
    await serviceClient
      .from('qr_codes')
      .delete()
      .eq('user_id', id)

    // Kullanıcı profilini sil (Delete user profile)
    const { error: profileError } = await serviceClient
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

    // Auth kullanıcısını sil (Delete auth user)
    const { error: authError } = await serviceClient.auth.admin.deleteUser(id)

    if (authError) {
      console.error('Auth delete error:', authError)
      return NextResponse.json(
        { error: 'Auth hesabı silinemedi' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User delete error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

