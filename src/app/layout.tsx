// Ana Layout - Root Layout
// Tüm sayfalar için ortak yapı

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Header, Footer } from '@/components/layout';
import { headers } from 'next/headers';
import "./globals.css";

// Inter fontu
const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

// SEO Meta verileri
export const metadata: Metadata = {
  title: {
    default: "QR Code Generator - Create Free QR Codes Online",
    template: "%s | QR Code Generator",
  },
  description: "Create professional QR codes for free. Generate QR codes for URLs, WiFi, vCards, and more. Easy to use, customizable designs, instant download.",
  keywords: ["qr code", "qr code generator", "free qr code", "qr code maker", "create qr code", "qr code online"],
  authors: [{ name: "QR Code Generator" }],
  creator: "QR Code Generator",
  publisher: "QR Code Generator",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://qrcodegenerator.com',
    siteName: 'QR Code Generator',
    title: 'QR Code Generator - Create Free QR Codes Online',
    description: 'Create professional QR codes for free. Generate QR codes for URLs, WiFi, vCards, and more.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'QR Code Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR Code Generator - Create Free QR Codes Online',
    description: 'Create professional QR codes for free.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://qrcodegenerator.com',
    languages: {
      'en': 'https://qrcodegenerator.com',
      'tr': 'https://qrcodegenerator.com/tr',
    },
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
