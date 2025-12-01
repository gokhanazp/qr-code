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

      // App Store QR kodu
      case 'APP_STORE':
        return (
          <div className="space-y-4">
            <Input
              label={t('appStoreUrl')}
              placeholder="https://apps.apple.com/app/..."
              value={data.iosUrl || ''}
              onChange={(e) => handleDataChange('iosUrl', e.target.value)}
            />
            <Input
              label={t('playStoreUrl')}
              placeholder="https://play.google.com/store/apps/..."
              value={data.androidUrl || ''}
              onChange={(e) => handleDataChange('androidUrl', e.target.value)}
            />
            <p className="text-xs text-gray-500">
              {t('deviceRedirectNote')}
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

