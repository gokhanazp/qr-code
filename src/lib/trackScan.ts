// QR Kod Tarama Takibi - Analitik için tarama kayıtları
// Tracks QR code scans with device/location info for analytics

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

// User-Agent'tan OS ve browser bilgisi çıkar
function parseUserAgent(ua: string): { os: string; browser: string; deviceType: string } {
  let os = 'Unknown'
  let browser = 'Unknown'
  let deviceType = 'desktop'

  // OS detection
  if (/Windows/i.test(ua)) os = 'Windows'
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'OS X'
  else if (/iPhone|iPad|iPod/i.test(ua)) { os = 'iOS'; deviceType = 'mobile' }
  else if (/Android/i.test(ua)) { os = 'AndroidOS'; deviceType = 'mobile' }
  else if (/Linux/i.test(ua)) os = 'Linux'
  else if (/CrOS/i.test(ua)) os = 'Chrome OS'

  // Tablet detection
  if (/iPad|Android(?!.*Mobile)/i.test(ua)) deviceType = 'tablet'

  // Browser detection
  if (/Edg/i.test(ua)) browser = 'Edge'
  else if (/Chrome/i.test(ua)) browser = 'Chrome'
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari'
  else if (/Firefox/i.test(ua)) browser = 'Firefox'
  else if (/Opera|OPR/i.test(ua)) browser = 'Opera'
  else if (/MSIE|Trident/i.test(ua)) browser = 'IE'

  return { os, browser, deviceType }
}

// IP'den lokasyon bilgisi al (free API)
async function getLocationFromIP(ip: string): Promise<{ country: string; city: string }> {
  try {
    // ip-api.com free tier (45 req/min)
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`, {
      next: { revalidate: 3600 } // 1 saat cache
    })
    
    if (!res.ok) return { country: 'Unknown', city: 'Unknown' }
    
    const data = await res.json()
    if (data.status === 'success') {
      return {
        country: data.country || 'Unknown',
        city: data.city || 'Unknown'
      }
    }
  } catch {
    // API hatası - sessizce devam et
  }
  
  return { country: 'Unknown', city: 'Unknown' }
}

// QR tarama kaydı oluştur
export async function trackQRScan(qrCodeId: string): Promise<void> {
  try {
    const headersList = await headers()
    const supabase = await createClient()

    // Header'lardan bilgileri al
    const userAgent = headersList.get('user-agent') || ''
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    
    // IP adresini belirle
    let ipAddress = 'Unknown'
    if (forwardedFor) {
      ipAddress = forwardedFor.split(',')[0].trim()
    } else if (realIp) {
      ipAddress = realIp
    }

    // User-Agent parse et
    const { os, browser, deviceType } = parseUserAgent(userAgent)

    // IP'den lokasyon al (localhost değilse)
    let country = 'Unknown'
    let city = 'Unknown'
    
    if (ipAddress !== 'Unknown' && !ipAddress.startsWith('127.') && !ipAddress.startsWith('192.168.') && ipAddress !== '::1') {
      const location = await getLocationFromIP(ipAddress)
      country = location.country
      city = location.city
    }

    // Tarama kaydını veritabanına ekle
    await supabase.from('qr_scans').insert({
      qr_code_id: qrCodeId,
      ip_address: ipAddress,
      user_agent: userAgent.substring(0, 500), // Max 500 karakter
      country,
      city,
      device_type: deviceType,
      browser,
      os
    })

  } catch (error) {
    // Tarama kaydı başarısız olsa da QR işlemi devam etmeli
    console.error('Track scan error:', error)
  }
}

