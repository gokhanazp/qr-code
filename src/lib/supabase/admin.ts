// Admin Panel için Supabase Helper Fonksiyonları
// (Supabase Helper Functions for Admin Panel)

import { createClient } from './server'

// Admin kontrolü yap (Check if user is admin)
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false
  
  const { data } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .single()
  
  return !!data
}

// Tüm kullanıcıları getir (Get all users with stats)
export async function getAllUsers() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      qr_codes:qr_codes(count),
      subscription:subscriptions(*)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Tüm QR kodları getir (Get all QR codes)
export async function getAllQRCodes(filters?: {
  expired?: boolean
  userId?: string
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('qr_codes')
    .select(`
      *,
      profile:profiles(id, email, full_name, plan)
    `)
    .order('created_at', { ascending: false })
  
  if (filters?.expired === true) {
    query = query.lt('expires_at', new Date().toISOString())
  } else if (filters?.expired === false) {
    query = query.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
  }
  
  if (filters?.userId) {
    query = query.eq('user_id', filters.userId)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}

// İletişim mesajlarını getir (Get contact messages)
export async function getContactMessages(filters?: {
  unreadOnly?: boolean
  archived?: boolean
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (filters?.unreadOnly) {
    query = query.eq('is_read', false)
  }
  
  if (filters?.archived !== undefined) {
    query = query.eq('is_archived', filters.archived)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}

// Mesajı okundu işaretle (Mark message as read)
export async function markMessageAsRead(messageId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('contact_messages')
    .update({ is_read: true })
    .eq('id', messageId)
  
  if (error) throw error
}

// Siparişleri getir (Get orders)
export async function getOrders(filters?: {
  status?: string
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}

// Fiyatlandırma planlarını getir (Get pricing plans)
export async function getPricingPlans() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('pricing_plans')
    .select('*')
    .order('sort_order', { ascending: true })
  
  if (error) throw error
  return data
}

// Fiyatlandırma planını güncelle (Update pricing plan)
export async function updatePricingPlan(planId: string, updates: {
  name?: string
  name_tr?: string
  price_monthly?: number
  price_yearly?: number
  max_qr_codes?: number
  features?: string[]
}) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('pricing_plans')
    .update(updates)
    .eq('id', planId)
  
  if (error) throw error
}

// Dashboard istatistiklerini getir (Get dashboard stats)
export async function getDashboardStats() {
  const supabase = await createClient()
  
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  // Paralel sorgular
  const [users, qrCodes, expiredQR, unreadMessages, pendingOrders] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('qr_codes').select('id', { count: 'exact' }),
    supabase.from('qr_codes').select('id', { count: 'exact' }).lt('expires_at', now.toISOString()),
    supabase.from('contact_messages').select('id', { count: 'exact' }).eq('is_read', false),
    supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'pending'),
  ])
  
  return {
    totalUsers: users.count || 0,
    totalQRCodes: qrCodes.count || 0,
    expiredQRCodes: expiredQR.count || 0,
    unreadMessages: unreadMessages.count || 0,
    pendingOrders: pendingOrders.count || 0,
  }
}

