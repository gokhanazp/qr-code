// QR Kod İçerik Formu bileşeni
// Her QR tipi için özel form alanları

'use client'

import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui'
import { QRType } from './QRTypeSelector'
import VCardPhotoUpload from './VCardPhotoUpload'

interface QRContentFormProps {
  type: QRType
  content: string
  data: Record<string, string>
  onChange: (content: string, data?: Record<string, string>) => void
}

export default function QRContentForm({ type, content, data, onChange }: QRContentFormProps) {
  const t = useTranslations('generator')

  // Basit içerik güncellemesi
  const handleContentChange = (value: string) => {
    onChange(value, data)
  }

  // Ek veri güncellemesi
  const handleDataChange = (key: string, value: string) => {
    const newData = { ...data, [key]: value }
    // İçeriği de güncelle (formatlı)
    const formattedContent = formatContent(type, newData)
    onChange(formattedContent, newData)
  }

  // İçeriği formatla (QR tipine göre)
  const formatContent = (qrType: QRType, formData: Record<string, string>): string => {
    switch (qrType) {
      case 'WIFI':
        return `WIFI:T:${formData.security || 'WPA'};S:${formData.ssid || ''};P:${formData.password || ''};;`
      case 'EMAIL':
        return `mailto:${formData.email || ''}?subject=${encodeURIComponent(formData.subject || '')}&body=${encodeURIComponent(formData.body || '')}`
      case 'PHONE':
        return `tel:${formData.phone || ''}`
      case 'SMS':
        return `sms:${formData.phone || ''}?body=${encodeURIComponent(formData.message || '')}`
      case 'WHATSAPP':
        return `https://wa.me/${formData.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(formData.message || '')}`
      case 'VCARD':
        // vCard 3.0 formatı (PHOTO alanı ile)
        // PHOTO alanı opsiyonel - varsa eklenir (PHOTO field is optional - added if exists)
        const photoLine = formData.photo ? `PHOTO;VALUE=URI:${formData.photo}\n` : ''
        return `BEGIN:VCARD
VERSION:3.0
N:${formData.lastName || ''};${formData.firstName || ''};;;
FN:${formData.firstName || ''} ${formData.lastName || ''}
ORG:${formData.company || ''}
TITLE:${formData.title || ''}
${photoLine}TEL;TYPE=WORK,VOICE:${formData.workPhone || ''}
TEL;TYPE=CELL,VOICE:${formData.mobile || ''}
EMAIL:${formData.email || ''}
URL:${formData.website || ''}
ADR;TYPE=WORK:;;${formData.street || ''};${formData.city || ''};${formData.state || ''};${formData.zip || ''};${formData.country || ''}
NOTE:${formData.note || ''}
END:VCARD`
      case 'LOCATION':
        return `geo:${formData.latitude || '0'},${formData.longitude || '0'}?q=${formData.latitude || '0'},${formData.longitude || '0'}(${encodeURIComponent(formData.name || 'Location')})`
      case 'EVENT':
        // iCalendar formatı
        const startDate = formData.startDate?.replace(/-/g, '').replace(/:/g, '').replace(' ', 'T') || ''
        const endDate = formData.endDate?.replace(/-/g, '').replace(/:/g, '').replace(' ', 'T') || ''
        return `BEGIN:VEVENT
SUMMARY:${formData.eventName || ''}
LOCATION:${formData.location || ''}
DTSTART:${startDate}
DTEND:${endDate}
DESCRIPTION:${formData.description || ''}
END:VEVENT`
      case 'INSTAGRAM':
        return `https://instagram.com/${formData.username || ''}`
      case 'FACEBOOK':
        return formData.pageUrl || `https://facebook.com/${formData.username || ''}`
      case 'TWITTER':
        return `https://twitter.com/${formData.username || ''}`
      case 'LINKEDIN':
        return formData.profileUrl || `https://linkedin.com/in/${formData.username || ''}`
      case 'YOUTUBE':
        return formData.channelUrl || `https://youtube.com/@${formData.username || ''}`
      case 'BITCOIN':
        return `bitcoin:${formData.address || ''}?amount=${formData.amount || ''}&message=${encodeURIComponent(formData.message || '')}`
      case 'APP':
        // APP QR kodu landing page'e yönlendirecek - içerik JSON formatında saklanacak
        // Renk ve diğer tüm veriler dahil edildi
        return JSON.stringify({
          type: 'app',
          appName: formData.appName || '',
          developer: formData.developer || '',
          appLogo: formData.appLogo || '',
          title: formData.title || '',
          description: formData.description || '',
          website: formData.website || '',
          iosUrl: formData.iosUrl || '',
          androidUrl: formData.androidUrl || '',
          primaryColor: formData.primaryColor || '#2d8659',
          secondaryColor: formData.secondaryColor || '#a8e6cf',
          textColor: formData.textColor || '#000000',
          welcomeScreenEnabled: formData.welcomeScreenEnabled !== 'false',
          welcomeLogo: formData.welcomeLogo || '',
          gradient: formData.gradient || 'green' // Varsayılan yeşil gradient
        })
      default:
        return formData.url || formData.text || ''
    }
  }

  // QR tipine göre form render
  const renderForm = () => {
    switch (type) {
      case 'URL':
        return (
          <Input
            label="URL"
            placeholder={t('urlPlaceholder')}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
          />
        )

      case 'TEXT':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('enterContent')}
            </label>
            <textarea
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
              placeholder={t('textPlaceholder')}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
            />
          </div>
        )

      case 'EMAIL':
        return (
          <div className="space-y-4">
            <Input
              label={t('email')}
              type="email"
              placeholder={t('emailPlaceholder')}
              value={data.email || ''}
              onChange={(e) => handleDataChange('email', e.target.value)}
            />
            <Input
              label={t('subject')}
              placeholder={t('emailSubjectPlaceholder')}
              value={data.subject || ''}
              onChange={(e) => handleDataChange('subject', e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('body')}</label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                placeholder={t('emailBodyPlaceholder')}
                value={data.body || ''}
                onChange={(e) => handleDataChange('body', e.target.value)}
              />
            </div>
          </div>
        )

      case 'PHONE':
        return (
          <Input
            label={t('phoneNumber')}
            type="tel"
            placeholder={t('phonePlaceholder')}
            value={data.phone || ''}
            onChange={(e) => handleDataChange('phone', e.target.value)}
          />
        )

      case 'SMS':
      case 'WHATSAPP':
        return (
          <div className="space-y-4">
            <Input
              label={t('phoneNumber')}
              type="tel"
              placeholder={t('phonePlaceholder')}
              value={data.phone || ''}
              onChange={(e) => handleDataChange('phone', e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('message')}</label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                placeholder={t('yourMessagePlaceholder')}
                value={data.message || ''}
                onChange={(e) => handleDataChange('message', e.target.value)}
              />
            </div>
          </div>
        )

      case 'WIFI':
        return (
          <div className="space-y-4">
            <Input
              label={t('networkName')}
              placeholder="MyWiFiNetwork"
              value={data.ssid || ''}
              onChange={(e) => handleDataChange('ssid', e.target.value)}
            />
            <Input
              label={t('password')}
              type="password"
              placeholder={t('wifiPasswordPlaceholder')}
              value={data.password || ''}
              onChange={(e) => handleDataChange('password', e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('security')}</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={data.security || 'WPA'}
                onChange={(e) => handleDataChange('security', e.target.value)}
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">{t('noPassword')}</option>
              </select>
            </div>
          </div>
        )

      // vCard - Kartvizit QR kodu
      case 'VCARD':
        return (
          <div className="space-y-4">
            {/* Fotoğraf Yükleme (Photo Upload) */}
            <VCardPhotoUpload
              value={data.photo || ''}
              onChange={(url) => handleDataChange('photo', url)}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('firstName')}
                placeholder="John"
                value={data.firstName || ''}
                onChange={(e) => handleDataChange('firstName', e.target.value)}
              />
              <Input
                label={t('lastName')}
                placeholder="Doe"
                value={data.lastName || ''}
                onChange={(e) => handleDataChange('lastName', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('company')}
                placeholder="Acme Inc."
                value={data.company || ''}
                onChange={(e) => handleDataChange('company', e.target.value)}
              />
              <Input
                label={t('jobTitle')}
                placeholder="Software Engineer"
                value={data.title || ''}
                onChange={(e) => handleDataChange('title', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('mobilePhone')}
                type="tel"
                placeholder="+90 555 123 4567"
                value={data.mobile || ''}
                onChange={(e) => handleDataChange('mobile', e.target.value)}
              />
              <Input
                label={t('workPhone')}
                type="tel"
                placeholder="+90 555 987 6543"
                value={data.workPhone || ''}
                onChange={(e) => handleDataChange('workPhone', e.target.value)}
              />
            </div>
            <Input
              label={t('email')}
              type="email"
              placeholder="john@example.com"
              value={data.email || ''}
              onChange={(e) => handleDataChange('email', e.target.value)}
            />
            <Input
              label={t('website')}
              placeholder="https://example.com"
              value={data.website || ''}
              onChange={(e) => handleDataChange('website', e.target.value)}
            />
            <Input
              label={t('streetAddress')}
              placeholder="123 Main St"
              value={data.street || ''}
              onChange={(e) => handleDataChange('street', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('city')}
                placeholder="İstanbul"
                value={data.city || ''}
                onChange={(e) => handleDataChange('city', e.target.value)}
              />
              <Input
                label={t('stateProvince')}
                placeholder="Marmara"
                value={data.state || ''}
                onChange={(e) => handleDataChange('state', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('zipPostalCode')}
                placeholder="34000"
                value={data.zip || ''}
                onChange={(e) => handleDataChange('zip', e.target.value)}
              />
              <Input
                label={t('country')}
                placeholder="Türkiye"
                value={data.country || ''}
                onChange={(e) => handleDataChange('country', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('note')}</label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={2}
                placeholder={t('additionalNotesPlaceholder')}
                value={data.note || ''}
                onChange={(e) => handleDataChange('note', e.target.value)}
              />
            </div>
          </div>
        )

      // Konum QR kodu
      case 'LOCATION':
        return (
          <div className="space-y-4">
            <Input
              label={t('locationName')}
              placeholder="Ofisim"
              value={data.name || ''}
              onChange={(e) => handleDataChange('name', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('latitude')}
                type="number"
                step="any"
                placeholder="41.0082"
                value={data.latitude || ''}
                onChange={(e) => handleDataChange('latitude', e.target.value)}
              />
              <Input
                label={t('longitude')}
                type="number"
                step="any"
                placeholder="28.9784"
                value={data.longitude || ''}
                onChange={(e) => handleDataChange('longitude', e.target.value)}
              />
            </div>
            <p className="text-xs text-gray-500">
              {t('coordinatesTip')}
            </p>
          </div>
        )

      // Etkinlik/Takvim QR kodu
      case 'EVENT':
        return (
          <div className="space-y-4">
            <Input
              label={t('eventName')}
              placeholder="Takım Toplantısı"
              value={data.eventName || ''}
              onChange={(e) => handleDataChange('eventName', e.target.value)}
            />
            <Input
              label={t('location')}
              placeholder="Toplantı Odası A"
              value={data.location || ''}
              onChange={(e) => handleDataChange('location', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('startDateTime')}
                type="datetime-local"
                value={data.startDate || ''}
                onChange={(e) => handleDataChange('startDate', e.target.value)}
              />
              <Input
                label={t('endDateTime')}
                type="datetime-local"
                value={data.endDate || ''}
                onChange={(e) => handleDataChange('endDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('description')}</label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                placeholder={t('eventDescriptionPlaceholder')}
                value={data.description || ''}
                onChange={(e) => handleDataChange('description', e.target.value)}
              />
            </div>
          </div>
        )

      // Sosyal Medya QR kodları
      case 'INSTAGRAM':
      case 'TWITTER':
      case 'LINKEDIN':
      case 'YOUTUBE':
        return (
          <div className="space-y-4">
            <Input
              label={`${type.charAt(0) + type.slice(1).toLowerCase()} ${t('username')}`}
              placeholder={type === 'YOUTUBE' ? '@kanaladi' : '@kullaniciadi'}
              value={data.username || ''}
              onChange={(e) => handleDataChange('username', e.target.value)}
            />
            {(type === 'LINKEDIN' || type === 'YOUTUBE') && (
              <Input
                label={t('orPasteFullUrl')}
                placeholder={type === 'LINKEDIN' ? 'https://linkedin.com/in/username' : 'https://youtube.com/@channel'}
                value={type === 'LINKEDIN' ? data.profileUrl || '' : data.channelUrl || ''}
                onChange={(e) => handleDataChange(type === 'LINKEDIN' ? 'profileUrl' : 'channelUrl', e.target.value)}
              />
            )}
          </div>
        )

      case 'FACEBOOK':
        return (
          <div className="space-y-4">
            <Input
              label={t('facebookUsername')}
              placeholder="kullaniciadi"
              value={data.username || ''}
              onChange={(e) => handleDataChange('username', e.target.value)}
            />
            <Input
              label={t('orPastePageUrl')}
              placeholder="https://facebook.com/sayfaniz"
              value={data.pageUrl || ''}
              onChange={(e) => handleDataChange('pageUrl', e.target.value)}
            />
          </div>
        )

      // Bitcoin QR kodu
      case 'BITCOIN':
        return (
          <div className="space-y-4">
            <Input
              label={t('bitcoinAddress')}
              placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
              value={data.address || ''}
              onChange={(e) => handleDataChange('address', e.target.value)}
            />
            <Input
              label={`${t('amount')} (BTC)`}
              type="number"
              step="any"
              placeholder="0.001"
              value={data.amount || ''}
              onChange={(e) => handleDataChange('amount', e.target.value)}
            />
            <Input
              label={t('messageOptional')}
              placeholder={t('paymentForPlaceholder')}
              value={data.message || ''}
              onChange={(e) => handleDataChange('message', e.target.value)}
            />
          </div>
        )

      // App Download QR kodu (Uygulama İndirme Sayfası)
      case 'APP':
        // Renk preset'leri (Color presets) - görseldeki gibi gradient
        // Primary = Gradient alt (koyu), Secondary = Gradient üst (açık), Text = Yazı rengi
        const colorPresets = [
          { id: 'green', primary: '#2d8659', secondary: '#a8e6cf', text: '#000000' },
          { id: 'dark', primary: '#1a1a2e', secondary: '#4a4a5a', text: '#ffffff' },
          { id: 'red', primary: '#c0392b', secondary: '#e74c3c', text: '#ffffff' },
          { id: 'blue', primary: '#1e5799', secondary: '#7db9e8', text: '#000000' },
          { id: 'purple', primary: '#6a1b9a', secondary: '#ba68c8', text: '#ffffff' },
          { id: 'orange', primary: '#e65100', secondary: '#ffb74d', text: '#000000' },
        ]
        // Varsayılan renkler (Default colors)
        const primaryColor = data.primaryColor || '#2d8659'
        const secondaryColor = data.secondaryColor || '#a8e6cf'
        const textColor = data.textColor || '#000000'

        return (
          <div className="space-y-6">
            {/* Renk Seçimi (Color Selection) */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2">
                🎨 {t('colorScheme') || 'Choose a color scheme for your page.'}
              </h4>

              {/* Preset Renkler (Preset Colors) */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600 flex items-center gap-1">
                  Colors: <span className="text-gray-400 text-xs">ⓘ</span>
                </label>
                <div className="flex gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        handleDataChange('primaryColor', preset.primary)
                        handleDataChange('secondaryColor', preset.secondary)
                        handleDataChange('textColor', preset.text)
                      }}
                      className={`w-14 h-10 rounded-md border-2 transition-all overflow-hidden ${
                        primaryColor === preset.primary ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ background: `linear-gradient(to bottom, ${preset.secondary}, ${preset.primary})` }}
                    />
                  ))}
                </div>
              </div>

              {/* Primary ve Secondary Renk Seçici (Primary and Secondary Color Picker) */}
              <div className="flex items-center gap-4">
                {/* Primary Color */}
                <div className="flex-1">
                  <label className="text-sm text-gray-600 mb-1 block">Primary</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => handleDataChange('primaryColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                      placeholder="#f0f5f7"
                    />
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => handleDataChange('primaryColor', e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Swap Button */}
                <button
                  type="button"
                  onClick={() => {
                    const temp = primaryColor
                    handleDataChange('primaryColor', secondaryColor)
                    handleDataChange('secondaryColor', temp)
                  }}
                  className="mt-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Swap colors"
                >
                  ⇄
                </button>

                {/* Secondary Color */}
                <div className="flex-1">
                  <label className="text-sm text-gray-600 mb-1 block">Secondary</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => handleDataChange('secondaryColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                      placeholder="#a8e6cf"
                    />
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => handleDataChange('secondaryColor', e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Yazı Rengi (Text Color) */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm text-gray-600 mb-1 block">Text Color (Yazı Rengi)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => handleDataChange('textColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                      placeholder="#000000"
                    />
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => handleDataChange('textColor', e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Uygulama Bilgileri (App Information) */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2">
                📱 {t('appInfo') || 'App Information'}
              </h4>
              <Input
                label={t('appName') || 'App Name'}
                placeholder="My App"
                value={data.appName || ''}
                onChange={(e) => handleDataChange('appName', e.target.value)}
              />
              <Input
                label={t('developer') || 'Developer'}
                placeholder="Company Name"
                value={data.developer || ''}
                onChange={(e) => handleDataChange('developer', e.target.value)}
              />
            </div>

            {/* App Logo Yükleme (App Logo Upload) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('appLogo') || 'App Logo'} (180x180 px)
              </label>
              <div className="flex items-center gap-4">
                {data.appLogo ? (
                  <div className="relative">
                    <img
                      src={data.appLogo}
                      alt="App Logo"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleDataChange('appLogo', '')}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <span className="text-2xl text-gray-400">📷</span>
                    <span className="text-xs text-gray-500">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (ev) => {
                            handleDataChange('appLogo', ev.target?.result as string)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Welcome Screen Bölümü */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                📱 Welcome Screen
                <span className="text-xs text-gray-400 font-normal">
                  Display your logo while your page is loading
                </span>
              </h4>

              {/* Welcome Screen Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600">Enable Welcome Screen</label>
                <button
                  type="button"
                  onClick={() => handleDataChange('welcomeScreenEnabled', data.welcomeScreenEnabled === 'true' ? 'false' : 'true')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    data.welcomeScreenEnabled !== 'false' ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    data.welcomeScreenEnabled !== 'false' ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Welcome Logo - sadece açıksa göster */}
              {data.welcomeScreenEnabled !== 'false' && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-600 flex items-center gap-1">
                    Image: <span className="text-gray-400 text-xs">ⓘ</span>
                  </label>
                  <div className="flex items-center gap-4">
                    {/* Logo Preview */}
                    <div className="relative w-32 h-24 border-2 border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
                      {(data.welcomeLogo || data.appLogo) ? (
                        <>
                          <img
                            src={data.welcomeLogo || data.appLogo}
                            alt="Welcome Logo"
                            className="max-w-[100px] max-h-[80px] object-contain"
                          />
                          {data.welcomeLogo && (
                            <button
                              type="button"
                              onClick={() => handleDataChange('welcomeLogo', '')}
                              className="absolute top-1 right-1 w-5 h-5 bg-gray-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-gray-600"
                            >
                              ✎
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-3xl text-gray-300">📱</span>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-2">
                      <label className="px-4 py-2 bg-cyan-500 text-white rounded-lg cursor-pointer hover:bg-cyan-600 transition-colors flex items-center gap-2 text-sm">
                        🔄 Change
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onload = (ev) => {
                                handleDataChange('welcomeLogo', ev.target?.result as string)
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          // Preview modal açılabilir
                          alert('Welcome screen preview: Logo will zoom in for 2 seconds when page loads')
                        }}
                        className="text-cyan-500 hover:text-cyan-600 text-sm"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    Uses App Logo by default. Upload a different image for welcome screen if needed.
                  </p>
                </div>
              )}
            </div>

            {/* Başlık ve Açıklama (Title and Description) */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2">
                ✏️ {t('content') || 'Content'}
              </h4>
              <Input
                label={t('title') || 'Title'}
                placeholder={t('appTitlePlaceholder') || 'Download our amazing app!'}
                value={data.title || ''}
                onChange={(e) => handleDataChange('title', e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('description') || 'Description'}
                </label>
                <textarea
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                  maxLength={250}
                  placeholder={t('appDescPlaceholder') || 'Short description about your app...'}
                  value={data.description || ''}
                  onChange={(e) => handleDataChange('description', e.target.value)}
                />
                <p className="text-xs text-gray-500 text-right mt-1">
                  {(data.description || '').length} / 250
                </p>
              </div>
              <Input
                label={t('website') || 'Website'}
                placeholder="https://www.example.com"
                value={data.website || ''}
                onChange={(e) => handleDataChange('website', e.target.value)}
              />
            </div>

            {/* Store Linkleri (Store Links) */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2">
                🔗 {t('storeLinks') || 'Store Links'}
              </h4>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="text-gray-700">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </div>
                <Input
                  label="App Store URL"
                  placeholder="https://apps.apple.com/app/..."
                  value={data.iosUrl || ''}
                  onChange={(e) => handleDataChange('iosUrl', e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="text-gray-700">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                </div>
                <Input
                  label="Google Play URL"
                  placeholder="https://play.google.com/store/apps/..."
                  value={data.androidUrl || ''}
                  onChange={(e) => handleDataChange('androidUrl', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Canlı Önizleme - Telefon Mockup (Live Preview - Phone Mockup) */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 border-b pb-2">
                📱 {t('appPreview') || 'App Preview'}
              </h4>
              <div className="flex justify-center">
                <div className="relative w-[200px]">
                  {/* Telefon çerçevesi (Phone frame) */}
                  <div className="relative bg-black rounded-[2rem] p-2 shadow-2xl">
                    {/* Ekran (Screen) - Gradient arka plan (açık üst → koyu alt) */}
                    <div
                      className="relative rounded-[1.5rem] overflow-hidden"
                      style={{
                        background: `linear-gradient(to bottom, ${secondaryColor}, ${primaryColor})`,
                        aspectRatio: '9/16'
                      }}
                    >
                      {/* Paylaş ikonu (Share icon) */}
                      <div className="absolute top-3 right-3 z-10">
                        <svg className="w-4 h-4 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </div>

                      <div className="px-3 py-4 flex flex-col items-center text-center h-full">
                        {/* App Name & Developer - ÜSTTE */}
                        <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5" style={{ color: textColor }}>
                          {data.appName || 'APP NAME'}
                        </p>
                        <p className="text-[8px] mb-3 opacity-70" style={{ color: textColor }}>
                          {data.developer || 'Developer Slogan'}
                        </p>

                        {/* Logo - ORTADA, saydam beyaz arka plan kutu */}
                        <div className="bg-white/30 rounded-2xl p-3 mb-3">
                          {data.appLogo ? (
                            <img src={data.appLogo} alt="Logo" className="max-w-[70px] max-h-[70px] object-contain" />
                          ) : (
                            <span className="text-4xl">📱</span>
                          )}
                        </div>

                        {/* Title - seçilen yazı rengi */}
                        <p className="text-[10px] font-bold leading-tight mb-1 px-1" style={{ color: textColor }}>
                          {data.title || 'Download Our Amazing App Today!'}
                        </p>

                        {/* HEMEN İNDİR */}
                        <p className="text-[8px] italic mb-2 opacity-60" style={{ color: textColor }}>HEMEN İNDİR!</p>

                        {/* Store Buttons */}
                        <div className="space-y-1 w-full px-2">
                          {(data.iosUrl || !data.androidUrl) && (
                            <img src="/img/apple-en.png" alt="App Store" className="w-full h-auto rounded" />
                          )}
                          {(data.androidUrl || !data.iosUrl) && (
                            <img src="/img/google-en.png" alt="Google Play" className="w-full h-auto rounded" />
                          )}
                        </div>

                        {/* Website */}
                        {data.website && (
                          <p className="text-[7px] mt-auto pt-1 opacity-60" style={{ color: textColor }}>
                            {data.website.replace(/^https?:\/\//, '')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
              💡 {t('appQrTip') || 'QR kod taratıldığında kullanıcılar güzel bir landing page görecek ve uygulamanızı indirebilecek.'}
            </p>
          </div>
        )

      // PDF ve Image QR kodları
      case 'PDF':
      case 'IMAGE':
        return (
          <div className="space-y-4">
            <Input
              label={type === 'PDF' ? t('pdfUrl') : t('imageUrl')}
              placeholder={`https://example.com/file.${type === 'PDF' ? 'pdf' : 'jpg'}`}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              {t('enterDirectUrl')}
            </p>
          </div>
        )

      default:
        return (
          <Input
            label={t('enterContent')}
            placeholder={t('urlPlaceholder')}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
          />
        )
    }
  }

  return <div className="space-y-4">{renderForm()}</div>
}

