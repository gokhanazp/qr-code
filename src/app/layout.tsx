// Ana Layout - Root Layout
// Tüm sayfalar için ortak yapı

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Header, Footer } from '@/components/layout';
import { MainJsonLd } from '@/components/seo/JsonLd';
import { headers } from 'next/headers';
import "./globals.css";

// Inter fontu
const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

// Site URL'si
const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://qrcodegenerator.com'

// SEO Meta verileri - Türkiye ve Dünya için optimize edilmiş
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "QR Kod Oluşturucu - Ücretsiz QR Code Generator | QR Kod Yapma",
    template: "%s | QR Kod Oluşturucu",
  },
  description: "Ücretsiz QR kod oluşturun! URL, WiFi, vCard, WhatsApp, Instagram için profesyonel QR kodlar. Kolay kullanım, özelleştirilebilir tasarım, anında indirme. Create free QR codes online.",
  keywords: [
    // Türkçe anahtar kelimeler
    "qr kod", "qr kod oluşturucu", "ücretsiz qr kod", "qr kod yapma", "qr kod oluştur",
    "qr kod generator", "karekod", "karekod oluşturucu", "qr kod okuyucu",
    "wifi qr kod", "whatsapp qr kod", "instagram qr kod", "vcard qr kod",
    // İngilizce anahtar kelimeler
    "qr code", "qr code generator", "free qr code", "qr code maker", "create qr code",
    "qr code online", "qr code creator", "dynamic qr code", "qr code scanner",
    "wifi qr code", "vcard qr code", "url qr code", "menu qr code"
  ],
  authors: [{ name: "QR Code Generator" }],
  creator: "QR Code Generator",
  publisher: "QR Code Generator",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    alternateLocale: ['en_US', 'en_GB'],
    url: siteUrl,
    siteName: 'QR Kod Oluşturucu - QR Code Generator',
    title: 'QR Kod Oluşturucu - Ücretsiz QR Code Generator',
    description: 'Ücretsiz QR kod oluşturun! URL, WiFi, vCard, WhatsApp için profesyonel QR kodlar. Create free QR codes online.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'QR Kod Oluşturucu - Free QR Code Generator',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR Kod Oluşturucu - Ücretsiz QR Code Generator',
    description: 'Ücretsiz QR kod oluşturun! URL, WiFi, vCard, WhatsApp için profesyonel QR kodlar.',
    images: ['/og-image.png'],
    creator: '@qrcodegenerator',
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'tr-TR': siteUrl,
      'en-US': `${siteUrl}/en`,
      'x-default': siteUrl,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || '',
    yandex: process.env.YANDEX_VERIFICATION || '',
    other: {
      'msvalidate.01': process.env.BING_SITE_VERIFICATION || '',
    },
  },
  category: 'technology',
  classification: 'QR Code Generator Tool',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'QR Kod Oluşturucu',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'application-name': 'QR Kod Oluşturucu',
    'apple-mobile-web-app-title': 'QR Kod',
    'msapplication-TileColor': '#3b82f6',
    'theme-color': '#3b82f6',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // URL yolunu kontrol et (admin sayfaları için header/footer gizle)
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || '';
  const isAdminPage = pathname.startsWith('/admin');

  // Supabase client oluştur ve kullanıcı bilgisini al
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Dil bilgisi al
  const locale = await getLocale();
  const messages = await getMessages();

  // Header için kullanıcı bilgisi hazırla
  const headerUser = user ? {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
    image: user.user_metadata?.avatar_url || null,
  } : null;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data */}
        <MainJsonLd />
      </head>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <NextIntlClientProvider messages={messages}>
          {/* Admin sayfalarında Header gösterme */}
          {!isAdminPage && <Header user={headerUser} />}

          {/* Ana içerik */}
          <main className="flex-1">
            {children}
          </main>

          {/* Admin sayfalarında Footer gösterme */}
          {!isAdminPage && <Footer />}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
