// Ana Layout - Root Layout
// Tüm sayfalar için ortak yapı

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Header, Footer } from '@/components/layout';
import { MainJsonLd } from '@/components/seo/JsonLd';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { Analytics } from '@vercel/analytics/next';
import { headers } from 'next/headers';
import "./globals.css";

// Inter fontu
const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

// Site URL'si
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://qr-code-gamma-neon.vercel.app'

// Dinamik SEO Metadata - Dil bazlı title ve description
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations('seo')

  // Dile göre locale formatı
  const ogLocale = locale === 'tr' ? 'tr_TR' : 'en_US'
  const alternateLocale = locale === 'tr' ? ['en_US', 'en_GB'] : ['tr_TR']

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t('home.title'),
      template: locale === 'tr' ? '%s | QR Code Shine' : '%s | QR Code Shine',
    },
    description: t('home.description'),
    keywords: t('keywords'),
    authors: [{ name: "QR Code Shine" }],
    creator: "QR Code Shine",
    publisher: "QR Code Shine",
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
      locale: ogLocale,
      alternateLocale: alternateLocale,
      url: siteUrl,
      siteName: 'QR Code Shine',
      title: t('home.ogTitle'),
      description: t('home.ogDescription'),
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'QR Code Shine',
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('home.ogTitle'),
      description: t('home.ogDescription'),
      images: ['/og-image.png'],
      creator: '@qrcodeshine',
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
    classification: 'QR Code Shine',
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
      title: 'QR Code Shine',
    },
    other: {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'application-name': 'QR Code Shine',
      'apple-mobile-web-app-title': 'QR Code Shine',
      'msapplication-TileColor': '#3b82f6',
      'theme-color': '#3b82f6',
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // URL yolunu kontrol et
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || headersList.get('x-url') || '';

  // Header/Footer gizlenecek sayfalar:
  // - /admin/* : Admin sayfaları
  // - /app/* : App landing page (QR tarama)
  // - /r/* : QR redirect sayfası (tarama)
  // - /v/* : vCard görüntüleme (tarama)
  const isAdminPage = pathname.startsWith('/admin');
  const isQRLandingPage = pathname.startsWith('/app/') || pathname.startsWith('/r/') || pathname.startsWith('/v/') || pathname.startsWith('/menu/');
  const hideHeaderFooter = isAdminPage || isQRLandingPage;

  // Supabase client oluştur ve kullanıcı bilgisini al
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Dil bilgisi al (URL veya cookie'den - request.ts'te belirleniyor)
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
        {/* Google Analytics */}
        <GoogleAnalytics />
      </head>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <NextIntlClientProvider messages={messages}>
          {/* QR landing ve Admin sayfalarında Header gösterme */}
          {!hideHeaderFooter && <Header user={headerUser} />}

          {/* Ana içerik */}
          <main className="flex-1">
            {children}
          </main>

          {/* QR landing ve Admin sayfalarında Footer gösterme */}
          {!hideHeaderFooter && <Footer />}
        </NextIntlClientProvider>

        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
