// Server tarafında kullanılacak Supabase client
// This client is used in server components, route handlers, and server actions
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Server client - server component'larda ve route handler'larda kullanılır
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll methodu Server Component'tan çağrıldığında
            // hata verebilir. Middleware veya Server Action'da
            // session'ı yenilemek için kullanılır.
          }
        },
      },
    }
  )
}

