// Browser (client) tarafında kullanılacak Supabase client
// This client is used in client components (use client)
import { createBrowserClient } from '@supabase/ssr'

// Browser client - client component'larda kullanılır
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

