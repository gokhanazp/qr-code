// Admin Plan Limits API
// Plan limitlerini getir ve güncelle

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Admin kontrolü
async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', userId)
    .single()
  return !!data
}

// Plan limitlerini getir
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // plan_limits tablosundan verileri al
    const { data: planLimits, error } = await supabase
      .from('plan_limits')
      .select('*')
      .order('plan')

    if (error) {
      // plan_limits yoksa pricing_plans'dan al
      const { data: pricingPlans, error: pricingError } = await supabase
        .from('pricing_plans')
        .select('id, max_qr_codes, qr_duration_days, can_use_logo, can_use_frames, can_use_analytics, max_scans_per_month')
        .order('sort_order')

      if (pricingError) {
        return NextResponse.json({ error: pricingError.message }, { status: 500 })
      }

      // pricing_plans formatını plan_limits formatına dönüştür
      const formattedLimits = pricingPlans?.map(p => ({
        plan: p.id,
        max_qr_codes: p.max_qr_codes,
        qr_duration_days: p.qr_duration_days,
        can_use_logo: p.can_use_logo,
        can_use_frames: p.can_use_frames,
        can_use_analytics: p.can_use_analytics,
        max_scans_per_month: p.max_scans_per_month
      }))

      return NextResponse.json({ planLimits: formattedLimits, source: 'pricing_plans' })
    }

    return NextResponse.json({ planLimits, source: 'plan_limits' })
  } catch (error) {
    console.error('Get plan limits error:', error)
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}

// Plan limitlerini güncelle
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan, max_qr_codes, qr_duration_days, can_use_logo, can_use_frames, can_use_analytics, max_scans_per_month } = body

    if (!plan) {
      return NextResponse.json({ error: 'Plan is required' }, { status: 400 })
    }

    // plan_limits tablosunu güncelle
    const { error: limitError } = await supabase
      .from('plan_limits')
      .upsert({
        plan,
        max_qr_codes: max_qr_codes ?? 2,
        qr_duration_days: qr_duration_days ?? null,
        can_use_logo: can_use_logo ?? false,
        can_use_frames: can_use_frames ?? false,
        can_use_analytics: can_use_analytics ?? false,
        max_scans_per_month: max_scans_per_month ?? null
      }, { onConflict: 'plan' })

    if (limitError) {
      console.error('Plan limits update error:', limitError)
    }

    // pricing_plans tablosunu da güncelle (varsa)
    const { error: pricingError } = await supabase
      .from('pricing_plans')
      .update({
        max_qr_codes: max_qr_codes ?? 2,
        qr_duration_days: qr_duration_days ?? null,
        can_use_logo: can_use_logo ?? false,
        can_use_frames: can_use_frames ?? false,
        can_use_analytics: can_use_analytics ?? false,
        max_scans_per_month: max_scans_per_month ?? null
      })
      .eq('id', plan)

    if (pricingError) {
      console.error('Pricing plans update error:', pricingError)
    }

    return NextResponse.json({ success: true, message: 'Plan limits updated' })
  } catch (error) {
    console.error('Update plan limits error:', error)
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}

