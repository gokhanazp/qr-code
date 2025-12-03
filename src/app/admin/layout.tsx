// Admin Layout
// Admin paneli için özel layout (Supabase Auth ile)
// Mobilde hamburger menü, masaüstünde sabit sidebar

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Login sayfası için layout bypass (Login page bypass)
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  // Login sayfasıysa sadece children'ı render et (sidebar olmadan)
  if (pathname.includes('/admin/login')) {
    return <>{children}</>
  }

  // Supabase ile admin kontrolü (Admin check with Supabase)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Giriş yapmamışsa admin login'e yönlendir
  if (!user) {
    redirect('/admin/login')
  }

  // Admin tablosunu kontrol et (Check admin_users table)
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .single()

  // Admin değilse erişim reddi
  if (!adminUser) {
    redirect('/admin/login?error=unauthorized')
  }

  const userRole = adminUser.role
  const userEmail = user.email || ''

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Client Sidebar - Mobil responsive */}
      <AdminSidebar userEmail={userEmail} userRole={userRole} />

      {/* Ana içerik - Mobilde tam genişlik, masaüstünde sidebar offset */}
      <main className="lg:ml-64 min-h-screen p-4 lg:p-8 pt-20 lg:pt-8">
        {children}
      </main>
    </div>
  )
}

