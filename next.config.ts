import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// next-intl plugin'i yapılandır
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Görsel optimizasyonu
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Deneysel özellikler
  experimental: {
    // Sunucu eylemleri için
  },
};

export default withNextIntl(nextConfig);
