// Dashboard Layout
// Supabase Auth ile kullanıcı paneli layout

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

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
    <div className="bg-gray-100 min-h-screen">
      <div className="flex">
        {/* Sidebar - Client Component (çeviri destekli) */}
        <DashboardSidebar />

        {/* Ana içerik - Sidebar genişliği kadar sol margin */}
        <main className="ml-64 flex-1 pt-4 pb-8 px-4">
          {children}
        </main>
      </div>
    </div>
  )
}

