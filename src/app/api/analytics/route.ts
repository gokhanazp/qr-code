// Analytics API - Kullanıcının QR kodları için analitik verileri
// Returns scan data grouped by time, OS, country, city

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Kullanıcı kontrolü
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Kullanıcının QR kodlarının ID'lerini al
    const { data: qrCodes } = await supabase
      .from('qr_codes')
      .select('id')
      .eq('user_id', user.id)

    if (!qrCodes || qrCodes.length === 0) {
      return NextResponse.json({
        totalScans: 0,
        uniqueScans: 0,
        timeData: [],
        osData: [],
        countryData: [],
        cityData: []
      })
    }

    const qrCodeIds = qrCodes.map(qr => qr.id)

    // Tüm tarama kayıtlarını al (son 12 ay)
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const { data: scans } = await supabase
      .from('qr_scans')
      .select('*')
      .in('qr_code_id', qrCodeIds)
      .gte('scanned_at', twelveMonthsAgo.toISOString())
      .order('scanned_at', { ascending: true })

    if (!scans || scans.length === 0) {
      return NextResponse.json({
        totalScans: 0,
        uniqueScans: 0,
        timeData: [],
        osData: [],
        countryData: [],
        cityData: []
      })
    }

    // Toplam ve unique tarama sayısı (IP bazlı)
    const totalScans = scans.length
    const uniqueIPs = new Set(scans.map(s => s.ip_address).filter(ip => ip && ip !== 'Unknown'))
    const uniqueScans = uniqueIPs.size

    // Zaman bazlı veri (aylık)
    const timeMap = new Map<string, { total: number; unique: Set<string> }>()
    scans.forEach(scan => {
      const date = new Date(scan.scanned_at)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!timeMap.has(key)) {
        timeMap.set(key, { total: 0, unique: new Set() })
      }
      const entry = timeMap.get(key)!
      entry.total++
      if (scan.ip_address && scan.ip_address !== 'Unknown') {
        entry.unique.add(scan.ip_address)
      }
    })

    const timeData = Array.from(timeMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        month,
        label: formatMonth(month),
        total: data.total,
        unique: data.unique.size
      }))

    // OS bazlı veri
    const osMap = new Map<string, number>()
    scans.forEach(scan => {
      const os = scan.os || 'Unknown'
      osMap.set(os, (osMap.get(os) || 0) + 1)
    })
    const osData = Array.from(osMap.entries())
      .map(([os, count]) => ({ os, count, percent: ((count / totalScans) * 100).toFixed(2) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Ülke bazlı veri
    const countryMap = new Map<string, number>()
    scans.forEach(scan => {
      const country = scan.country || 'Unknown'
      if (country !== 'Unknown') {
        countryMap.set(country, (countryMap.get(country) || 0) + 1)
      }
    })
    const countryData = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count, percent: ((count / totalScans) * 100).toFixed(2) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    // Şehir bazlı veri
    const cityMap = new Map<string, number>()
    scans.forEach(scan => {
      const city = scan.city || 'Unknown'
      if (city !== 'Unknown') {
        cityMap.set(city, (cityMap.get(city) || 0) + 1)
      }
    })
    const cityData = Array.from(cityMap.entries())
      .map(([city, count]) => ({ city, count, percent: ((count / totalScans) * 100).toFixed(2) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    return NextResponse.json({
      totalScans,
      uniqueScans,
      timeData,
      osData,
      countryData,
      cityData
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}

// Ay formatı: "2024-01" -> "Jan '24"
function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(month) - 1]} '${year.slice(2)}`
}

