// Service Role Client - Admin işlemleri için
// Service Role Client - For admin operations (user deletion etc.)
// Bu client sadece server-side'da kullanılmalı!

import { createClient } from '@supabase/supabase-js'

// Service role client - tam yetki (full access)
// Dikkat: Bu client RLS'i bypass eder!
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase URL veya Service Role Key eksik')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

