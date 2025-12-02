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

// QR tipi SEO bilgileri - Türkçe ve İngilizce
const qrTypeSEO: Record<string, { title: string; description: string; keywords: string[] }> = {
  url: {
    title: 'URL QR Kod Oluşturucu - Ücretsiz Web Sitesi QR Kodu',
    description: 'Ücretsiz URL QR kodu oluşturun! Web sitesi, blog, e-ticaret için anında QR kod. Free URL QR code generator with custom colors.',
    keywords: ['url qr kod', 'web sitesi qr kod', 'link qr kod', 'url qr code', 'website qr code']
  },
  wifi: {
    title: 'WiFi QR Kod Oluşturucu - Kablosuz Ağ Paylaşımı',
    description: 'WiFi QR kodu ile şifre paylaşın! Misafirler QR kodu okutarak WiFi\'a bağlanır. Create WiFi QR codes for easy network sharing.',
    keywords: ['wifi qr kod', 'kablosuz ağ qr', 'wifi şifre qr', 'wifi qr code', 'wifi password qr']
  },
  vcard: {
    title: 'vCard QR Kod - Dijital Kartvizit Oluşturucu',
    description: 'Profesyonel dijital kartvizit QR kodu oluşturun. İletişim bilgilerinizi anında paylaşın. Digital business card QR code creator.',
    keywords: ['vcard qr kod', 'dijital kartvizit', 'kartvizit qr', 'vcard qr code', 'digital business card']
  },
  email: {
    title: 'E-posta QR Kod Oluşturucu - Mail QR Kodu',
    description: 'E-posta QR kodu ile hızlı iletişim. Alıcı, konu ve mesaj hazır açılır. Email QR code generator.',
    keywords: ['email qr kod', 'e-posta qr', 'mail qr kod', 'email qr code', 'mailto qr']
  },
  phone: {
    title: 'Telefon QR Kod Oluşturucu - Arama QR Kodu',
    description: 'Telefon numarası QR kodu oluşturun. Taratıldığında doğrudan arama başlar. Phone call QR code generator.',
    keywords: ['telefon qr kod', 'arama qr', 'tel qr kod', 'phone qr code', 'call qr code']
  },
  sms: {
    title: 'SMS QR Kod Oluşturucu - Mesaj QR Kodu',
    description: 'SMS QR kodu ile hazır mesaj gönderin. Pazarlama kampanyaları için ideal. SMS text message QR code.',
    keywords: ['sms qr kod', 'mesaj qr', 'kısa mesaj qr', 'sms qr code', 'text qr code']
  },
  whatsapp: {
    title: 'WhatsApp QR Kod Oluşturucu - WA QR Kodu',
    description: 'WhatsApp QR kodu ile müşterilerinize ulaşın. Hazır mesajla sohbet başlatın. WhatsApp chat QR code generator.',
    keywords: ['whatsapp qr kod', 'wa qr kod', 'whatsapp link qr', 'whatsapp qr code', 'wa.me qr']
  },
  text: {
    title: 'Metin QR Kod Oluşturucu - Düz Yazı QR Kodu',
    description: 'Herhangi bir metni QR koda dönüştürün. Basit ve çok yönlü kullanım. Plain text QR code generator.',
    keywords: ['metin qr kod', 'yazı qr', 'text qr kod', 'text qr code', 'plain text qr']
  },
  instagram: {
    title: 'Instagram QR Kod Oluşturucu - IG Profil QR Kodu',
    description: 'Instagram profil QR kodu ile takipçi kazanın. Profilinizi kolayca paylaşın. Instagram profile QR code.',
    keywords: ['instagram qr kod', 'ig qr kod', 'instagram profil qr', 'instagram qr code', 'ig qr']
  },
  twitter: {
    title: 'Twitter/X QR Kod Oluşturucu - Tweet QR Kodu',
    description: 'Twitter/X profil QR kodu oluşturun. Sosyal medya varlığınızı anında paylaşın. Twitter X QR code.',
    keywords: ['twitter qr kod', 'x qr kod', 'tweet qr', 'twitter qr code', 'x profile qr']
  },
  linkedin: {
    title: 'LinkedIn QR Kod Oluşturucu - Profesyonel Ağ QR Kodu',
    description: 'LinkedIn profil QR kodu ile profesyonel ağınızı genişletin. İş bağlantıları için ideal. LinkedIn profile QR code.',
    keywords: ['linkedin qr kod', 'profesyonel qr', 'iş qr kod', 'linkedin qr code', 'professional qr']
  },
  youtube: {
    title: 'YouTube QR Kod Oluşturucu - Video Kanal QR Kodu',
    description: 'YouTube kanal ve video QR kodu oluşturun. Abone sayınızı artırın. YouTube channel QR code.',
    keywords: ['youtube qr kod', 'video qr', 'kanal qr kod', 'youtube qr code', 'video channel qr']
  },
  facebook: {
    title: 'Facebook QR Kod Oluşturucu - FB Sayfa QR Kodu',
    description: 'Facebook profil ve sayfa QR kodu oluşturun. Sosyal medya erişiminizi artırın. Facebook page QR code.',
    keywords: ['facebook qr kod', 'fb qr kod', 'facebook sayfa qr', 'facebook qr code', 'fb page qr']
  },
  event: {
    title: 'Etkinlik QR Kod Oluşturucu - Takvim QR Kodu',
    description: 'Etkinlik ve toplantı QR kodu oluşturun. Takvime otomatik eklensin. Calendar event QR code.',
    keywords: ['etkinlik qr kod', 'takvim qr', 'toplantı qr', 'event qr code', 'calendar qr']
  },
  location: {
    title: 'Konum QR Kod Oluşturucu - Harita GPS QR Kodu',
    description: 'Konum ve adres QR kodu oluşturun. Haritalar uygulamasında açılır. Location map GPS QR code.',
    keywords: ['konum qr kod', 'harita qr', 'adres qr kod', 'location qr code', 'gps qr', 'map qr']
  },
  bitcoin: {
    title: 'Bitcoin QR Kod Oluşturucu - Kripto Ödeme QR Kodu',
    description: 'Bitcoin ve kripto para QR kodu oluşturun. Kolay ödeme alın. Bitcoin crypto payment QR code.',
    keywords: ['bitcoin qr kod', 'kripto qr', 'btc qr kod', 'bitcoin qr code', 'crypto qr']
  },
  app: {
    title: 'Uygulama QR Kod Oluşturucu - App Store Play Store QR',
    description: 'Mobil uygulama indirme QR kodu oluşturun. App Store ve Play Store linkli. App download QR code.',
    keywords: ['uygulama qr kod', 'app store qr', 'play store qr', 'app qr code', 'app download qr']
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

