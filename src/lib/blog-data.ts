// Blog yazıları veritabanı
// Blog posts database - SEO optimized content for QR code types

export interface BlogPost {
  slug: string
  title: {
    tr: string
    en: string
  }
  excerpt: {
    tr: string
    en: string
  }
  content: {
    tr: string
    en: string
  }
  category: string
  date: string
  readTime: string
  image: string
  qrType?: string // İlişkili QR tipi
  keywords: {
    tr: string[]
    en: string[]
  }
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'url-qr-kod-nasil-olusturulur',
    title: {
      tr: 'URL QR Kod Nasıl Oluşturulur? Adım Adım Rehber',
      en: 'How to Create URL QR Code? Step by Step Guide'
    },
    excerpt: {
      tr: 'Web sitenizi QR koda dönüştürün. Müşterileriniz tek bir tarama ile sitenize ulaşsın. Ücretsiz URL QR kod oluşturma rehberi.',
      en: 'Convert your website to QR code. Let your customers reach your site with a single scan. Free URL QR code creation guide.'
    },
    content: {
      tr: `# URL QR Kod Nedir?

URL QR kodu, bir web sitesi adresini içeren ve taratıldığında kullanıcıyı doğrudan o sayfaya yönlendiren bir QR kod türüdür. Günümüzde en yaygın kullanılan QR kod türlerinden biridir.

## URL QR Kod Kullanım Alanları

- **E-ticaret siteleri**: Ürün sayfalarına hızlı erişim
- **Restoranlar**: Online menü ve sipariş sayfaları
- **Emlak**: Mülk detay sayfaları
- **Etkinlikler**: Bilet satış ve kayıt sayfaları
- **Kartvizitler**: Kişisel web sitesi veya portföy

## URL QR Kod Nasıl Oluşturulur?

1. **QR Code Shine**'a gidin
2. **URL** QR tipini seçin
3. Web sitenizin adresini girin (https:// ile)
4. Renk ve tasarımı özelleştirin
5. QR kodunuzu indirin

## SEO ve QR Kod İlişkisi

QR kodlar dolaylı olarak SEO'nuza katkıda bulunur:
- Mobil trafiği artırır
- Kullanıcı deneyimini iyileştirir
- Marka bilinirliğini güçlendirir

## En İyi Uygulamalar

✅ Kısa ve anlaşılır URL'ler kullanın
✅ HTTPS protokolünü tercih edin
✅ Mobil uyumlu sayfalar oluşturun
✅ QR kodun yanına açıklama ekleyin
✅ Test edin, sonra yayınlayın`,
      en: `# What is URL QR Code?

A URL QR code is a type of QR code that contains a website address and redirects users directly to that page when scanned. It is one of the most commonly used QR code types today.

## URL QR Code Use Cases

- **E-commerce sites**: Quick access to product pages
- **Restaurants**: Online menu and order pages
- **Real estate**: Property detail pages
- **Events**: Ticket sales and registration pages
- **Business cards**: Personal website or portfolio

## How to Create URL QR Code?

1. Go to **QR Code Shine**
2. Select **URL** QR type
3. Enter your website address (with https://)
4. Customize colors and design
5. Download your QR code

## SEO and QR Code Relationship

QR codes indirectly contribute to your SEO:
- Increases mobile traffic
- Improves user experience
- Strengthens brand awareness

## Best Practices

✅ Use short and clear URLs
✅ Prefer HTTPS protocol
✅ Create mobile-friendly pages
✅ Add description next to QR code
✅ Test before publishing`
    },
    category: 'Rehber',
    date: '2024-12-01',
    readTime: '5 dk',
    image: '/blog/url-qr-code.jpg',
    qrType: 'url',
    keywords: {
      tr: ['url qr kod', 'web sitesi qr kod', 'link qr kod', 'qr kod oluşturma'],
      en: ['url qr code', 'website qr code', 'link qr code', 'qr code generator']
    }
  },
  {
    slug: 'wifi-qr-kod-olusturma',
    title: {
      tr: 'WiFi QR Kod Oluşturma - Misafirleriniz Anında Bağlansın',
      en: 'WiFi QR Code Generator - Let Your Guests Connect Instantly'
    },
    excerpt: {
      tr: 'WiFi şifrenizi paylaşmanın en kolay yolu! QR kod ile misafirleriniz tek tarama ile WiFi\'a bağlansın.',
      en: 'The easiest way to share your WiFi password! Let your guests connect to WiFi with a single scan.'
    },
    content: {
      tr: `# WiFi QR Kod Nedir?

WiFi QR kodu, kablosuz ağ bilgilerinizi (SSID, şifre, şifreleme türü) içeren özel bir QR kod türüdür. Taratıldığında kullanıcının cihazı otomatik olarak WiFi ağına bağlanır.

## WiFi QR Kod Avantajları

- **Şifre paylaşımı kolaylaşır**: Uzun ve karmaşık şifreleri söylemeye gerek kalmaz
- **Güvenlik artar**: Şifre görünür olmaz
- **Profesyonel görünüm**: Otel, kafe ve ofisler için ideal
- **Misafir memnuniyeti**: Hızlı ve sorunsuz bağlantı

## Hangi İşletmeler Kullanmalı?

- ☕ Kafeler ve restoranlar
- 🏨 Oteller ve pansiyonlar
- 🏢 Ofisler ve toplantı odaları
- 🏥 Hastane ve klinikler
- 🏠 Airbnb ev sahipleri

## WiFi QR Kod Oluşturma Adımları

1. QR Code Shine'da **WiFi** tipini seçin
2. Ağ adını (SSID) girin
3. WiFi şifresini girin
4. Şifreleme türünü seçin (WPA/WPA2 önerilir)
5. QR kodunuzu oluşturun ve indirin

## Güvenlik İpuçları

⚠️ Misafir ağı oluşturun, ana ağınızı paylaşmayın
⚠️ Şifrenizi düzenli olarak değiştirin
⚠️ QR kodu görünür ama korunaklı bir yere yerleştirin`,
      en: `# What is WiFi QR Code?

A WiFi QR code is a special QR code type that contains your wireless network information (SSID, password, encryption type). When scanned, the user's device automatically connects to the WiFi network.

## WiFi QR Code Advantages

- **Password sharing becomes easy**: No need to spell out long and complex passwords
- **Security increases**: Password is not visible
- **Professional appearance**: Ideal for hotels, cafes, and offices
- **Guest satisfaction**: Fast and seamless connection

## Which Businesses Should Use It?

- ☕ Cafes and restaurants
- 🏨 Hotels and guesthouses
- 🏢 Offices and meeting rooms
- 🏥 Hospitals and clinics
- 🏠 Airbnb hosts

## WiFi QR Code Creation Steps

1. Select **WiFi** type on QR Code Shine
2. Enter network name (SSID)
3. Enter WiFi password
4. Select encryption type (WPA/WPA2 recommended)
5. Generate and download your QR code

## Security Tips

⚠️ Create a guest network, don't share your main network
⚠️ Change your password regularly
⚠️ Place QR code in a visible but protected location`
    },
    category: 'Rehber',
    date: '2024-12-02',
    readTime: '4 dk',
    image: '/blog/wifi-qr-code.jpg',
    qrType: 'wifi',
    keywords: {
      tr: ['wifi qr kod', 'kablosuz ağ qr', 'wifi şifre paylaşma', 'misafir wifi'],
      en: ['wifi qr code', 'wireless network qr', 'wifi password sharing', 'guest wifi']
    }
  },
  {
    slug: 'vcard-qr-kod-dijital-kartvizit',
    title: {
      tr: 'vCard QR Kod ile Dijital Kartvizit Oluşturma',
      en: 'Create Digital Business Card with vCard QR Code'
    },
    excerpt: {
      tr: 'Kağıt kartvizitlere elveda! vCard QR kod ile iletişim bilgilerinizi anında paylaşın.',
      en: 'Say goodbye to paper business cards! Share your contact info instantly with vCard QR code.'
    },
    content: {
      tr: `# vCard QR Kod Nedir?

vCard QR kodu, kişisel veya profesyonel iletişim bilgilerinizi dijital formatta saklayan bir QR kod türüdür. Taratıldığında tüm bilgileriniz otomatik olarak kişinin rehberine kaydedilir.

## vCard'da Neler Bulunur?

- 👤 Ad ve Soyad
- 📞 Telefon numaraları
- 📧 E-posta adresleri
- 🏢 Şirket ve unvan
- 🌐 Web sitesi
- 📍 Adres bilgileri
- 📱 Sosyal medya linkleri

## Neden Dijital Kartvizit?

| Kağıt Kartvizit | Dijital Kartvizit |
|-----------------|-------------------|
| Kaybolabilir | Her zaman erişilebilir |
| Güncelleme zor | Anında güncellenebilir |
| Çevreye zararlı | Çevre dostu |
| Sınırlı bilgi | Sınırsız içerik |

## vCard QR Kod Nasıl Oluşturulur?

1. **QR Code Shine**'da vCard tipini seçin
2. İletişim bilgilerinizi doldurun
3. Fotoğraf ekleyin (opsiyonel)
4. QR kodunuzu özelleştirin
5. İndirin ve kullanmaya başlayın

## Kullanım Alanları

- 🎪 Fuarlar ve networking etkinlikleri
- 📋 Özgeçmiş başvuruları
- 🏷️ İsimlik ve yaka kartları
- 📧 E-posta imzaları
- 💼 LinkedIn profil paylaşımı`,
      en: `# What is vCard QR Code?

A vCard QR code is a QR code type that stores your personal or professional contact information in digital format. When scanned, all your information is automatically saved to the person's contacts.

## What's Included in vCard?

- 👤 First and Last Name
- 📞 Phone numbers
- 📧 Email addresses
- 🏢 Company and title
- 🌐 Website
- 📍 Address information
- 📱 Social media links

## Why Digital Business Card?

| Paper Business Card | Digital Business Card |
|--------------------|-----------------------|
| Can be lost | Always accessible |
| Hard to update | Instantly updateable |
| Harmful to environment | Eco-friendly |
| Limited info | Unlimited content |

## How to Create vCard QR Code?

1. Select vCard type on **QR Code Shine**
2. Fill in your contact information
3. Add photo (optional)
4. Customize your QR code
5. Download and start using

## Use Cases

- 🎪 Trade shows and networking events
- 📋 Resume applications
- 🏷️ Name badges and ID cards
- 📧 Email signatures
- 💼 LinkedIn profile sharing`
    },
    category: 'Rehber',
    date: '2024-12-03',
    readTime: '5 dk',
    image: '/blog/vcard-qr-code.jpg',
    qrType: 'vcard',
    keywords: {
      tr: ['vcard qr kod', 'dijital kartvizit', 'elektronik kartvizit', 'qr kartvizit'],
      en: ['vcard qr code', 'digital business card', 'electronic business card', 'qr business card']
    }
  },
  {
    slug: 'whatsapp-qr-kod-isletmeler-icin',
    title: {
      tr: 'WhatsApp QR Kod - İşletmeler İçin İletişim Çözümü',
      en: 'WhatsApp QR Code - Communication Solution for Businesses'
    },
    excerpt: {
      tr: 'Müşterileriniz tek tarama ile WhatsApp\'tan size ulaşsın. Hazır mesaj şablonları ile iletişimi kolaylaştırın.',
      en: 'Let customers reach you on WhatsApp with a single scan. Simplify communication with ready message templates.'
    },
    content: {
      tr: `# WhatsApp QR Kod Nedir?

WhatsApp QR kodu, telefon numaranızı ve opsiyonel bir hazır mesajı içeren QR kod türüdür. Müşterileriniz QR kodu taratarak doğrudan WhatsApp sohbeti başlatabilir.

## WhatsApp QR Kod Avantajları

- ✅ Numara kaydetme gereksiz
- ✅ Hazır mesaj şablonu
- ✅ Anında iletişim
- ✅ %98 mesaj açılma oranı
- ✅ Müşteri memnuniyeti artışı

## Hangi İşletmeler Kullanmalı?

- 🛒 **E-ticaret**: Sipariş ve destek
- 🍕 **Restoranlar**: Rezervasyon ve sipariş
- 🏥 **Klinikler**: Randevu alma
- 🏠 **Emlak**: Mülk sorguları
- 🎓 **Eğitim**: Kayıt ve bilgi

## Hazır Mesaj Örnekleri

\`\`\`
Merhaba! Web sitenizden geliyorum. Ürünler hakkında bilgi almak istiyorum.
\`\`\`

\`\`\`
Merhaba, rezervasyon yapmak istiyorum. Müsait tarihler hakkında bilgi alabilir miyim?
\`\`\`

## WhatsApp QR Kod Oluşturma

1. QR Code Shine'da **WhatsApp** tipini seçin
2. WhatsApp numaranızı girin (+90 ile başlayan)
3. Hazır mesaj yazın (opsiyonel)
4. QR kodunuzu oluşturun
5. Materyallerinize ekleyin

## İpuçları

💡 WhatsApp Business kullanın
💡 Çalışma saatlerinizi belirtin
💡 Otomatik yanıt ayarlayın`,
      en: `# What is WhatsApp QR Code?

WhatsApp QR code is a QR code type that contains your phone number and an optional pre-filled message. Your customers can start a WhatsApp chat by scanning the QR code.

## WhatsApp QR Code Advantages

- ✅ No need to save number
- ✅ Pre-filled message template
- ✅ Instant communication
- ✅ 98% message open rate
- ✅ Increased customer satisfaction

## Which Businesses Should Use It?

- 🛒 **E-commerce**: Orders and support
- 🍕 **Restaurants**: Reservations and orders
- 🏥 **Clinics**: Appointment booking
- 🏠 **Real Estate**: Property inquiries
- 🎓 **Education**: Registration and info

## Pre-filled Message Examples

\`\`\`
Hello! I'm coming from your website. I'd like information about products.
\`\`\`

\`\`\`
Hello, I'd like to make a reservation. Can I get information about available dates?
\`\`\`

## WhatsApp QR Code Creation

1. Select **WhatsApp** type on QR Code Shine
2. Enter your WhatsApp number (with country code)
3. Write pre-filled message (optional)
4. Generate your QR code
5. Add to your materials

## Tips

💡 Use WhatsApp Business
💡 Specify your working hours
💡 Set up automatic replies`
    },
    category: 'İşletme',
    date: '2024-12-04',
    readTime: '4 dk',
    image: '/blog/whatsapp-qr-code.jpg',
    qrType: 'whatsapp',
    keywords: {
      tr: ['whatsapp qr kod', 'whatsapp iletişim', 'işletme whatsapp', 'müşteri iletişimi'],
      en: ['whatsapp qr code', 'whatsapp contact', 'business whatsapp', 'customer communication']
    }
  },
  {
    slug: 'instagram-qr-kod-takipci-kazanma',
    title: {
      tr: 'Instagram QR Kod ile Takipçi Kazanma Stratejileri',
      en: 'Instagram QR Code Strategies to Gain Followers'
    },
    excerpt: {
      tr: 'Instagram profilinizi QR kod ile paylaşın. Fiziksel dünyadan dijital takipçi kazanın.',
      en: 'Share your Instagram profile with QR code. Gain digital followers from the physical world.'
    },
    content: {
      tr: `# Instagram QR Kod Nedir?

Instagram QR kodu, Instagram profilinize doğrudan link veren bir QR kod türüdür. Taratıldığında kullanıcılar profilinizi görebilir ve hemen takip edebilir.

## Neden Instagram QR Kod Kullanmalısınız?

- 📈 Organik takipçi artışı
- 🎯 Hedef kitleye ulaşım
- 💼 Profesyonel görünüm
- 📊 Offline-online entegrasyon
- 🚀 Marka bilinirliği

## Kullanım Yerleri

| Lokasyon | Uygulama |
|----------|----------|
| Mağaza | Ürün etiketleri |
| Restoran | Menü ve masa kartları |
| Etkinlik | Poster ve broşürler |
| Ürün | Ambalaj üzeri |
| Araç | Araba cam stickeri |

## Instagram QR Kod Oluşturma

1. **QR Code Shine**'da Instagram tipini seçin
2. Instagram kullanıcı adınızı girin (@olmadan)
3. Marka renklerinizle özelleştirin
4. Instagram logosunu ekleyin (opsiyonel)
5. İndirin ve kullanın

## Takipçi Artırma İpuçları

✨ QR kodun yanına CTA ekleyin: "Takip Et & %10 İndirim Kazan"
✨ Story'lerde paylaşın
✨ Influencer işbirliklerinde kullanın
✨ Yarışmalarla birleştirin`,
      en: `# What is Instagram QR Code?

Instagram QR code is a QR code type that links directly to your Instagram profile. When scanned, users can see your profile and follow you immediately.

## Why Should You Use Instagram QR Code?

- 📈 Organic follower growth
- 🎯 Reach target audience
- 💼 Professional appearance
- 📊 Offline-online integration
- 🚀 Brand awareness

## Where to Use

| Location | Application |
|----------|-------------|
| Store | Product tags |
| Restaurant | Menu and table cards |
| Event | Posters and brochures |
| Product | On packaging |
| Vehicle | Car window sticker |

## Instagram QR Code Creation

1. Select Instagram type on **QR Code Shine**
2. Enter your Instagram username (without @)
3. Customize with your brand colors
4. Add Instagram logo (optional)
5. Download and use

## Follower Growth Tips

✨ Add CTA next to QR code: "Follow & Get 10% Off"
✨ Share in Stories
✨ Use in influencer collaborations
✨ Combine with contests`
    },
    category: 'Sosyal Medya',
    date: '2024-12-05',
    readTime: '4 dk',
    image: '/blog/instagram-qr-code.jpg',
    qrType: 'instagram',
    keywords: {
      tr: ['instagram qr kod', 'instagram takipçi', 'sosyal medya qr', 'instagram profil qr'],
      en: ['instagram qr code', 'instagram followers', 'social media qr', 'instagram profile qr']
    }
  },
  {
    slug: 'etkinlik-qr-kod-event-yonetimi',
    title: {
      tr: 'Etkinlik QR Kod - Event Yönetimi ve Takvim Entegrasyonu',
      en: 'Event QR Code - Event Management and Calendar Integration'
    },
    excerpt: {
      tr: 'Etkinliklerinizi QR kod ile paylaşın. Katılımcılar tek tarama ile takvimlerine eklesin.',
      en: 'Share your events with QR code. Attendees can add to their calendars with a single scan.'
    },
    content: {
      tr: `# Etkinlik QR Kod Nedir?

Etkinlik QR kodu, bir etkinliğin tüm detaylarını (tarih, saat, konum, açıklama) içeren ve taratıldığında kullanıcının takvimine otomatik eklenebilen bir QR kod türüdür.

## Etkinlik QR Kod İçeriği

- 📅 Başlangıç ve bitiş tarihi/saati
- 📍 Etkinlik konumu
- 📝 Etkinlik açıklaması
- 🔗 İlgili web sitesi
- ⏰ Hatırlatıcı ayarları

## Kullanım Alanları

- 🎭 Konserler ve festivaller
- 💼 Konferanslar ve seminerler
- 💒 Düğünler ve özel etkinlikler
- 🏃 Spor etkinlikleri
- 🎓 Eğitim ve workshoplar

## Etkinlik QR Kod Avantajları

| Özellik | Fayda |
|---------|-------|
| Otomatik takvim ekleme | Unutma riski azalır |
| Konum harita linki | Navigasyon kolaylığı |
| Detaylı bilgi | Sorulara gerek kalmaz |
| Paylaşılabilirlik | Viral yayılım |

## Nasıl Oluşturulur?

1. **QR Code Shine**'da Event tipini seçin
2. Etkinlik adını girin
3. Tarih ve saat bilgilerini ekleyin
4. Konum ve açıklama yazın
5. QR kodunuzu oluşturun

## İpuçları

📌 Davetiye ve posterlere ekleyin
📌 Sosyal medyada paylaşın
📌 E-posta kampanyalarında kullanın`,
      en: `# What is Event QR Code?

Event QR code is a QR code type that contains all event details (date, time, location, description) and can be automatically added to the user's calendar when scanned.

## Event QR Code Content

- 📅 Start and end date/time
- 📍 Event location
- 📝 Event description
- 🔗 Related website
- ⏰ Reminder settings

## Use Cases

- 🎭 Concerts and festivals
- 💼 Conferences and seminars
- 💒 Weddings and special events
- 🏃 Sports events
- 🎓 Training and workshops

## Event QR Code Advantages

| Feature | Benefit |
|---------|---------|
| Auto calendar add | Reduces forgetting risk |
| Location map link | Navigation ease |
| Detailed info | No questions needed |
| Shareability | Viral spread |

## How to Create?

1. Select Event type on **QR Code Shine**
2. Enter event name
3. Add date and time information
4. Write location and description
5. Generate your QR code

## Tips

📌 Add to invitations and posters
📌 Share on social media
📌 Use in email campaigns`
    },
    category: 'Etkinlik',
    date: '2024-12-06',
    readTime: '5 dk',
    image: '/blog/event-qr-code.jpg',
    qrType: 'event',
    keywords: {
      tr: ['etkinlik qr kod', 'event qr', 'takvim qr kod', 'davetiye qr'],
      en: ['event qr code', 'calendar qr code', 'invitation qr', 'meeting qr']
    }
  },
  {
    slug: 'konum-qr-kod-google-maps',
    title: {
      tr: 'Konum QR Kod - Google Maps ile Navigasyon',
      en: 'Location QR Code - Navigation with Google Maps'
    },
    excerpt: {
      tr: 'İşletmenizin konumunu QR kod ile paylaşın. Müşteriler tek tarama ile yol tarifi alsın.',
      en: 'Share your business location with QR code. Let customers get directions with a single scan.'
    },
    content: {
      tr: `# Konum QR Kod Nedir?

Konum QR kodu, GPS koordinatlarını veya bir adres bilgisini içeren ve taratıldığında harita uygulamasını açan bir QR kod türüdür.

## Konum QR Kod Kullanım Alanları

- 🏪 Mağaza ve işyeri konumları
- 🏥 Hastane ve klinikler
- 🎪 Festival ve etkinlik alanları
- 🏨 Otel ve konaklama
- 🍽️ Restoran ve kafeler

## Avantajları

✅ Adres yazmaya gerek yok
✅ Harita uygulaması otomatik açılır
✅ Yol tarifi tek tıkla
✅ Offline konumlarda bile çalışır
✅ Koordinat hassasiyeti

## Konum QR Kod Oluşturma

1. **QR Code Shine**'da Location tipini seçin
2. Koordinatları girin (Google Maps'ten alabilirsiniz)
3. veya adresi yazın
4. QR kodunuzu özelleştirin
5. İndirin ve kullanın

## Google Maps Koordinat Bulma

1. Google Maps'i açın
2. Konumunuza sağ tıklayın
3. İlk satırdaki koordinatları kopyalayın
4. Örnek: 41.0082, 28.9784

## Kullanım Önerileri

📍 Kartvizitlere ekleyin
📍 Araç ve tabelalara yerleştirin
📍 Etkinlik davetiyelerinde kullanın
📍 Broşür ve kataloglara ekleyin`,
      en: `# What is Location QR Code?

Location QR code is a QR code type that contains GPS coordinates or address information and opens the map application when scanned.

## Location QR Code Use Cases

- 🏪 Store and business locations
- 🏥 Hospitals and clinics
- 🎪 Festival and event venues
- 🏨 Hotels and accommodation
- 🍽️ Restaurants and cafes

## Advantages

✅ No need to type address
✅ Map app opens automatically
✅ Directions with one click
✅ Works even in offline locations
✅ Coordinate precision

## Location QR Code Creation

1. Select Location type on **QR Code Shine**
2. Enter coordinates (you can get from Google Maps)
3. or write the address
4. Customize your QR code
5. Download and use

## Finding Google Maps Coordinates

1. Open Google Maps
2. Right-click on your location
3. Copy coordinates from first line
4. Example: 41.0082, 28.9784

## Usage Recommendations

📍 Add to business cards
📍 Place on vehicles and signs
📍 Use in event invitations
📍 Add to brochures and catalogs`
    },
    category: 'Rehber',
    date: '2024-12-07',
    readTime: '4 dk',
    image: '/blog/location-qr-code.jpg',
    qrType: 'location',
    keywords: {
      tr: ['konum qr kod', 'google maps qr', 'navigasyon qr', 'adres qr kod'],
      en: ['location qr code', 'google maps qr', 'navigation qr', 'address qr code']
    }
  }
]

