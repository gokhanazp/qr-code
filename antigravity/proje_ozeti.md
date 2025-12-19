# Proje Özeti: QR Code Generator (QR Code Shine)

Bu proje, modern ve profesyonel bir QR kod oluşturma platformudur. Kullanıcılara farklı türlerde QR kodlar oluşturma, bu kodları özelleştirme ve dinamik QR kodlar aracılığıyla tarama istatistiklerini takip etme imkanı sunar.

## Teknoloji Yığını (Tech Stack)

- **Framework**: Next.js (App Router) - En güncel sürüm (v15/16-alpha).
- **Veritabanı**: Supabase (PostgreSQL) ve Prisma ORM.
- **Kimlik Doğrulama**: NextAuth.js (v5 Beta).
- **Stil yönetimi**: Tailwind CSS v4.
- **Uluslararasılaştırma (i18n)**: `next-intl` (Türkçe ve İngilizce destekli).
- **UI Bileşenleri**: Lucide React (ikonlar), Headless UI.
- **Analitik**: Google Analytics entegrasyonu hazır.

## Önemli Modüller ve Yapı

1. **Ana Sayfa (Landing Page)**:
   - Modern, animasyonlu ve SEO uyumlu bir tasarım.
   - Popüler QR tiplerine hızlı erişim.
   - Özellikler, müşteri vitrini ve SSS bölümleri.

2. **QR Oluşturucu (QR Generator)**:
   - `src/app/qr-generator/[type]/page.tsx` altında dinamik route yapısı.
   - vCard, WiFi, URL, WhatsApp, Menü, Araç Park gibi 19+ farklı QR tipi.
   - QR kod özelleştirme: Renkler, çerçeveler (frame), logo yükleme.

3. **Kullanıcı Paneli (Dashboard)**:
   - Oluşturulan QR kodların listelenmesi ve yönetimi.
   - Dinamik QR kodların içeriğini güncelleme yeteneği.
   - Tarama istatistikleri (Analitik).

4. **Yönetici Paneli (Admin Panel)**:
   - Fiyatlandırma planlarının yönetimi (`PricingEditor.tsx`).
   - Kullanıcı ve QR kod yönetimi detayları.

5. **i18n Yapısı**:
   - `src/i18n/messages` altında JSON tabanlı çeviri dosyaları.
   - Middleware üzerinden otomatik dil algılama ve URL yerelleştirme.

## Veri Modeli

- `User`: Üyelik ve rol yönetimi.
- `QRCode`: QR kod bilgileri, içerik, kısa URL ve tür.
- `QRScan`: Her bir taramanın IP, cihaz, ülke gibi detaylı verisi.
- `Plan` & `Subscription`: Ücretli paket yönetimi ve limitler.
