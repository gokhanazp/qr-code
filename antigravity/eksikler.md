# Projedeki Eksikler

Projeyi incelediğimde tespit ettiğim fonksiyonel ve yapısal eksikler şunlardır:

## 1. Çeviri Eksikleri (i18n)
- **en.json Eksikleri**: `tr.json` dosyasında bulunan "menu", "menuDesc", "parking", "parkingDesc" gibi bazı anahtar kelimeler `en.json` dosyasında bulunmuyor. Bu durum İngilizce modda boş veya hatalı metin gösterimine sebep olur.
- **Eksik Diller**: Şu an sadece TR ve EN desteği var. Küresel bir platform için Almanca, Fransızca, İspanyolca gibi diller eklenebilir.

## 2. Fonksiyonel Eksikler
- **Ödeme Entegrasyonu**: Projede Stripe bağımlılığı bulunmasına rağmen, fiyatlandırma sayfasında "Şu anda online ödeme sistemimiz bulunmamaktadır, WhatsApp'tan ulaşın" ibaresi yer alıyor. Otomatik abonelik ve ödeme akışı henüz tam devreye alınmamış.
- **Toplu QR Oluşturma (Bulk Create)**: Fiyatlandırma planlarında Kurumsal paket için vaat ediliyor ancak kod tabanında bu işlemin arayüzü ve backend mantığı tam olarak görülmüyor.
- **API Erişimi**: Kurumsal paket için API desteği belirtilmiş ama dış kullanıma açık bir API dokümantasyonu veya endpoint yapısı tam gelişmemiş.

## 3. SEO ve İçerik
- **Blog İçerikleri**: Blog için altyapı var (`src/app/blog`) ancak içeriklerin çoğu placeholder veya sınırlı sayıda.
- **Görsel Optimizasyonu**: Kullanıcıların yüklediği logolar için sunucu tarafında bir optimizasyon (boyutlandırma, sıkıştırma) yapısı geliştirilebilir.

## 4. Kullanıcı Deneyimi (UX)
- **QR Kod Önizleme**: Tasarım kısmında yapılan değişikliklerin vCard gibi bazı kompleks formlarda anlık olarak yansıması daha akıcı hale getirilebilir.
- **Karanlık Mod (Dark Mode)**: Modern bir web uygulaması olarak karanlık mod desteği eksik.
