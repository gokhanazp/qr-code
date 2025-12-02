// Dashboard Layout
// Supabase Auth ile kullanıcı paneli layout
// Sol menü kaldırıldı - Header kullanıcı menüsüne taşındı

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Supabase client oluştur ve oturum kontrolü
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Ana içerik - Tam genişlik, site ile aynı container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  )
}

