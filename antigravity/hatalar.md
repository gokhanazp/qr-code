# Projedeki Hatalar ve Teknik Sorunlar

Yapılan inceleme ve browser testleri sonucunda tespit edilen hatalar:

## 1. i18n ve Hydration Hataları
- [x] **Eksik Keyler**: Pricing sayfasında `{days}` parametresi için `daysValidity` key'i eklendi ve `PricingClient` içerisinde safety check'ler uygulandı.
- [x] **Menu QR Hatası**: `en.json` içerisinde `qrTypes.menu` ve `menuDesc` eksikleri tamamlandı.
- [x] **JSON Yapısı**: `en.json` ve `tr.json` içerisindeki duplicate key'ler temizlendi, hydration hataları giderildi.

## 2. Middleware Uyarıları
- **Deprecated Convention**: `The "middleware" file convention is deprecated...` uyarısı incelenmeli.

## 3. Database & Supabase Senkronizasyonu
- **Prisma SQLite vs Supabase**: Yerelde Prisma `sqlite` kullanırken üretimde (Supabase) `postgresql` kullanılıyor.
- [x] **Featured View Security**: `featured_qr_codes` view'ı `security_invoker = true` ile güncellendi (Migration 006).

## 4. UI/UX Küçük Hataları
- [x] **Z-Index Sorunları**: `Header.tsx` içerisindeki Mega Menu ve User Dropdown'a `z-50` ve modern animasyonlar eklendi.
- **Form Doğrulama**: vCard formunda boş alan kontrolleri geliştirilebilir.

## 5. Next.js Sürüm Uyumsuzluğu
- `package.json` dosyasındaki `next: ^16.0.7` sürümü stabilite açısından takip edilmeli.
