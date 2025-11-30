// Her QR tipi için ayrı sayfa (Individual page for each QR type)
// SEO optimizasyonu için dynamic route

import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import QRTypePage from '@/components/qr/QRTypePage'

// Geçerli QR tipleri - URL slug'ları
const validTypes = [
  'url', 'wifi', 'vcard', 'email', 'phone', 'sms', 'whatsapp',
  'text', 'instagram', 'twitter', 'linkedin', 'youtube', 'facebook',
  'event', 'location', 'bitcoin', 'app', 'pdf', 'image'
]

// QR tipi SEO bilgileri
const qrTypeSEO: Record<string, { title: string; description: string; keywords: string[] }> = {
  url: {
    title: 'Free URL QR Code Generator | Create Website Link QR Codes',
    description: 'Generate QR codes for any website URL instantly. Free online URL QR code maker with custom colors and high resolution downloads.',
    keywords: ['url qr code', 'website qr code', 'link qr code generator', 'free qr code maker']
  },
  wifi: {
    title: 'WiFi QR Code Generator | Create WiFi Network QR Codes',
    description: 'Create WiFi QR codes for easy network sharing. Guests can join your WiFi by scanning - no password typing needed.',
    keywords: ['wifi qr code', 'wifi network qr', 'wifi password qr code', 'wifi qr generator']
  },
  vcard: {
    title: 'vCard QR Code Generator | Digital Business Card Creator',
    description: 'Create professional digital business cards with QR codes. Share your contact info instantly with a beautiful landing page.',
    keywords: ['vcard qr code', 'digital business card', 'contact qr code', 'business card qr']
  },
  email: {
    title: 'Email QR Code Generator | Create Email Link QR Codes',
    description: 'Generate QR codes that open email composer with pre-filled recipient, subject and message. Perfect for marketing.',
    keywords: ['email qr code', 'mailto qr code', 'email link qr generator']
  },
  phone: {
    title: 'Phone Call QR Code Generator | Create Tel Link QR Codes',
    description: 'Create QR codes that initiate phone calls when scanned. Perfect for customer service and contact information.',
    keywords: ['phone qr code', 'tel qr code', 'call qr code generator']
  },
  sms: {
    title: 'SMS QR Code Generator | Create Text Message QR Codes',
    description: 'Generate QR codes that open SMS app with pre-filled number and message. Great for marketing campaigns.',
    keywords: ['sms qr code', 'text message qr', 'sms qr generator']
  },
  whatsapp: {
    title: 'WhatsApp QR Code Generator | Create WhatsApp Link QR Codes',
    description: 'Create QR codes that open WhatsApp chat. Perfect for customer support and business communication.',
    keywords: ['whatsapp qr code', 'whatsapp link qr', 'wa.me qr code']
  },
  text: {
    title: 'Text QR Code Generator | Create Plain Text QR Codes',
    description: 'Generate QR codes containing any text message. Simple and versatile QR code creation.',
    keywords: ['text qr code', 'plain text qr', 'message qr code generator']
  },
  instagram: {
    title: 'Instagram QR Code Generator | Create Instagram Profile QR Codes',
    description: 'Create QR codes that link to your Instagram profile. Grow your followers with easy profile sharing.',
    keywords: ['instagram qr code', 'instagram profile qr', 'ig qr code generator']
  },
  twitter: {
    title: 'Twitter/X QR Code Generator | Create Twitter Profile QR Codes',
    description: 'Generate QR codes for your Twitter/X profile. Share your social media presence instantly.',
    keywords: ['twitter qr code', 'x qr code', 'twitter profile qr generator']
  },
  linkedin: {
    title: 'LinkedIn QR Code Generator | Create LinkedIn Profile QR Codes',
    description: 'Create QR codes for your LinkedIn profile. Perfect for networking and professional connections.',
    keywords: ['linkedin qr code', 'linkedin profile qr', 'professional qr code']
  },
  youtube: {
    title: 'YouTube QR Code Generator | Create YouTube Channel QR Codes',
    description: 'Generate QR codes for YouTube channels and videos. Grow your audience with easy sharing.',
    keywords: ['youtube qr code', 'youtube channel qr', 'video qr code generator']
  },
  facebook: {
    title: 'Facebook QR Code Generator | Create Facebook Page QR Codes',
    description: 'Create QR codes for Facebook profiles and pages. Increase your social media reach.',
    keywords: ['facebook qr code', 'facebook page qr', 'fb qr code generator']
  },
  event: {
    title: 'Event QR Code Generator | Create Calendar Event QR Codes',
    description: 'Generate QR codes that add events to calendars. Perfect for invitations and appointments.',
    keywords: ['event qr code', 'calendar qr code', 'icalendar qr generator']
  },
  location: {
    title: 'Location QR Code Generator | Create Map & GPS QR Codes',
    description: 'Create QR codes for locations and addresses. Open maps app directly when scanned.',
    keywords: ['location qr code', 'gps qr code', 'map qr code generator', 'geo qr code']
  },
  bitcoin: {
    title: 'Bitcoin QR Code Generator | Create Crypto Payment QR Codes',
    description: 'Generate QR codes for Bitcoin payments. Easy cryptocurrency transactions with scannable codes.',
    keywords: ['bitcoin qr code', 'crypto qr code', 'btc qr code generator']
  },
  app: {
    title: 'App Store QR Code Generator | Create App Download QR Codes',
    description: 'Create QR codes that link to App Store and Play Store. Promote your mobile applications.',
    keywords: ['app qr code', 'app store qr', 'play store qr code', 'app download qr']
  },
  pdf: {
    title: 'PDF QR Code Generator | Create Document QR Codes',
    description: 'Generate QR codes that link to PDF documents. Share files easily with scannable codes.',
    keywords: ['pdf qr code', 'document qr code', 'file qr code generator']
  },
  image: {
    title: 'Image QR Code Generator | Create Image Link QR Codes',
    description: 'Create QR codes that link to images. Share photos and graphics with scannable codes.',
    keywords: ['image qr code', 'photo qr code', 'picture qr code generator']
  }
}

// Metadata generation - SEO için
export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params
  const seo = qrTypeSEO[type]
  
  if (!seo) {
    return {
      title: 'QR Code Generator',
      description: 'Generate QR codes for free'
    }
  }
  
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: 'website',
    }
  }
}

// Static params generation - build time'da tüm sayfaları oluştur
export function generateStaticParams() {
  return validTypes.map((type) => ({ type }))
}

// Sayfa bileşeni (Page component)
export default async function QRTypePageRoute({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  
  // Geçersiz tip kontrolü
  if (!validTypes.includes(type)) {
    notFound()
  }
  
  return <QRTypePage type={type} />
}

