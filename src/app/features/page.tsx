// Features sayfası - Özellikler listesi (çoklu dil destekli)
// Features page - Features list (with i18n support)
'use client';

import { useTranslations } from 'next-intl';
import {
  Zap, Shield, Smartphone, Palette, BarChart3, Download,
  QrCode, Globe, Clock, Layers, Lock, Sparkles, LucideIcon
} from 'lucide-react';
import Link from 'next/link';

// Özellik yapısı (Feature structure)
interface Feature {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  color: string;
}

// Özellik listesi - çeviri anahtarları ile (Feature list - with translation keys)
const featureItems: Feature[] = [
  { icon: Zap, titleKey: 'lightningFast', descKey: 'lightningFastDesc', color: 'bg-yellow-100 text-yellow-600' },
  { icon: Shield, titleKey: 'securePrivate', descKey: 'securePrivateDesc', color: 'bg-green-100 text-green-600' },
  { icon: Smartphone, titleKey: 'mobileFriendly', descKey: 'mobileFriendlyDesc', color: 'bg-blue-100 text-blue-600' },
  { icon: Palette, titleKey: 'fullyCustomizable', descKey: 'fullyCustomizableDesc', color: 'bg-purple-100 text-purple-600' },
  { icon: BarChart3, titleKey: 'analyticsTracking', descKey: 'analyticsTrackingDesc', color: 'bg-indigo-100 text-indigo-600' },
  { icon: Download, titleKey: 'multipleFormats', descKey: 'multipleFormatsDesc', color: 'bg-pink-100 text-pink-600' },
  { icon: QrCode, titleKey: 'qrTypes', descKey: 'qrTypesDesc', color: 'bg-cyan-100 text-cyan-600' },
  { icon: Globe, titleKey: 'worksEverywhere', descKey: 'worksEverywhereDesc', color: 'bg-teal-100 text-teal-600' },
  { icon: Clock, titleKey: 'dynamicQR', descKey: 'dynamicQRDesc', color: 'bg-orange-100 text-orange-600' },
  { icon: Layers, titleKey: 'bulkGeneration', descKey: 'bulkGenerationDesc', color: 'bg-red-100 text-red-600' },
  { icon: Lock, titleKey: 'passwordProtection', descKey: 'passwordProtectionDesc', color: 'bg-gray-100 text-gray-600' },
  { icon: Sparkles, titleKey: 'aiDesign', descKey: 'aiDesignDesc', color: 'bg-violet-100 text-violet-600' },
];

export default function FeaturesPage() {
  const t = useTranslations('features');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Bölümü (Hero Section) */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('pageTitle')}</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            {t('pageSubtitle')}
          </p>
        </div>
      </section>

      {/* Özellikler Grid (Features Grid) */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureItems.map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t(feature.titleKey)}</h3>
                <p className="text-gray-600">{t(feature.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bölümü (Call to Action Section) */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('readyToStart')}</h2>
          <p className="text-xl text-gray-600 mb-8">
            {t('createFirstQR')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/qr-generator/url"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('createQRFree')}
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              {t('viewPricing')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

