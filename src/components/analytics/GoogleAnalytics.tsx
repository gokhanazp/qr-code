// Google Analytics Component
// GA4 entegrasyonu ve event tracking
// Measurement ID: G-3J4M3NXV30
// NOT: /admin sayfalarında çalışmaz

'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

// GA Measurement ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-3J4M3NXV30'

// Google Analytics Script Component
// Admin panelinde (/admin/*) çalışmaz
export function GoogleAnalytics() {
  const pathname = usePathname()

  // Admin sayfalarında GA'yı yükleme
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <>
      {/* Google Analytics Script - async yükleme */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      {/* gtag konfigürasyonu */}
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  )
}

// === EVENT TRACKING FUNCTIONS ===

// gtag type tanımı (gtag type definition)
declare global {
  interface Window {
    gtag: (
      command: 'event' | 'config' | 'js',
      targetId: string,
      config?: Record<string, unknown>
    ) => void
  }
}

// WhatsApp buton tıklama takibi (WhatsApp button click tracking)
export function trackWhatsAppClick(location: string = 'unknown') {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'whatsapp_click', {
      event_category: 'engagement',
      event_label: location,
      value: 1,
    })
  }
}

// Telefon tıklama takibi (Phone click tracking)
export function trackPhoneClick(location: string = 'unknown') {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'phone_click', {
      event_category: 'engagement',
      event_label: location,
      value: 1,
    })
  }
}

// Email tıklama takibi (Email click tracking)
export function trackEmailClick(location: string = 'unknown') {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'email_click', {
      event_category: 'engagement',
      event_label: location,
      value: 1,
    })
  }
}

// QR kod oluşturma takibi (QR code generation tracking)
export function trackQRGeneration(qrType: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'qr_generation', {
      event_category: 'qr_code',
      event_label: qrType,
      value: 1,
    })
  }
}

// QR kod indirme takibi (QR code download tracking)
export function trackQRDownload(qrType: string, format: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'qr_download', {
      event_category: 'qr_code',
      event_label: `${qrType}_${format}`,
      value: 1,
    })
  }
}

// Form gönderimi takibi (Form submission tracking)
export function trackFormSubmit(formName: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'form_submit', {
      event_category: 'engagement',
      event_label: formName,
      value: 1,
    })
  }
}

// Kayıt takibi (Registration tracking)
export function trackSignUp(method: string = 'email') {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sign_up', {
      event_category: 'user',
      method: method,
    })
  }
}

// Giriş takibi (Login tracking)
export function trackLogin(method: string = 'email') {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'login', {
      event_category: 'user',
      method: method,
    })
  }
}

