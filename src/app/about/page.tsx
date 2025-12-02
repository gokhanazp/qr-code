// About sayfası - Şirket hakkında bilgi
// About page - Company information

import { Metadata } from 'next'
import { Building2, Users, Target, Award, Globe, Zap } from 'lucide-react';
import { getTranslations, getLocale } from 'next-intl/server'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://qr-code-gamma-neon.vercel.app'

// Dinamik SEO Metadata - Dil bazlı
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seo')
  const locale = await getLocale()

  return {
    title: t('about.title'),
    description: t('about.description'),
    keywords: locale === 'tr'
      ? ['qr kod hakkında', 'karekod şirketi', 'qr kod oluşturucu ekibi']
      : ['about qr code generator', 'qr code company', 'qr code team'],
    openGraph: {
      title: t('about.title'),
      description: t('about.description'),
      url: `${siteUrl}/about`,
    },
    alternates: {
      canonical: `${siteUrl}/about`,
      languages: {
        'tr': '/hakkimizda',
        'en': '/about',
      },
    },
  }
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About QRCodeGen</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            We&apos;re on a mission to make QR code generation simple, fast, and accessible for everyone.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Founded in 2024, QRCodeGen started with a simple idea: make QR code creation effortless for businesses and individuals alike.
              </p>
              <p className="text-gray-600 mb-4">
                Today, we serve millions of users worldwide, helping them connect their physical and digital worlds through the power of QR codes.
              </p>
              <p className="text-gray-600">
                Our platform supports 19+ QR code types, from simple URLs to complex vCards, WiFi credentials, and more.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">10M+</div>
                  <div className="text-gray-500">QR Codes Created</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">150+</div>
                  <div className="text-gray-500">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">99.9%</div>
                  <div className="text-gray-500">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">24/7</div>
                  <div className="text-gray-500">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'Speed', desc: 'Lightning-fast QR code generation in milliseconds.' },
              { icon: Target, title: 'Simplicity', desc: 'Intuitive interface that anyone can use.' },
              { icon: Award, title: 'Quality', desc: 'High-resolution QR codes that scan perfectly.' },
              { icon: Globe, title: 'Accessibility', desc: 'Available worldwide, in multiple languages.' },
              { icon: Users, title: 'Community', desc: 'Built with feedback from millions of users.' },
              { icon: Building2, title: 'Trust', desc: 'Enterprise-grade security and reliability.' },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Join Our Team</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            We&apos;re always looking for talented individuals to join our growing team. Check out our open positions.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}

