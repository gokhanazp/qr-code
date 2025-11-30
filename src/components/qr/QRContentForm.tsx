// QR Kod İçerik Formu bileşeni
// Her QR tipi için özel form alanları

'use client'

import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui'
import { QRType } from './QRTypeSelector'

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
        // vCard 3.0 formatı
        return `BEGIN:VCARD
VERSION:3.0
N:${formData.lastName || ''};${formData.firstName || ''};;;
FN:${formData.firstName || ''} ${formData.lastName || ''}
ORG:${formData.company || ''}
TITLE:${formData.title || ''}
TEL;TYPE=WORK,VOICE:${formData.workPhone || ''}
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
              label="Email"
              type="email"
              placeholder={t('emailPlaceholder')}
              value={data.email || ''}
              onChange={(e) => handleDataChange('email', e.target.value)}
            />
            <Input
              label="Subject"
              placeholder="Email subject..."
              value={data.subject || ''}
              onChange={(e) => handleDataChange('subject', e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                placeholder="Email body..."
                value={data.body || ''}
                onChange={(e) => handleDataChange('body', e.target.value)}
              />
            </div>
          </div>
        )

      case 'PHONE':
        return (
          <Input
            label="Phone Number"
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
              label="Phone Number"
              type="tel"
              placeholder={t('phonePlaceholder')}
              value={data.phone || ''}
              onChange={(e) => handleDataChange('phone', e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                placeholder="Your message..."
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
              label="Network Name (SSID)"
              placeholder="MyWiFiNetwork"
              value={data.ssid || ''}
              onChange={(e) => handleDataChange('ssid', e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="WiFi password"
              value={data.password || ''}
              onChange={(e) => handleDataChange('password', e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Security</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={data.security || 'WPA'}
                onChange={(e) => handleDataChange('security', e.target.value)}
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
              </select>
            </div>
          </div>
        )

      // vCard - Kartvizit QR kodu
      case 'VCARD':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                value={data.firstName || ''}
                onChange={(e) => handleDataChange('firstName', e.target.value)}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                value={data.lastName || ''}
                onChange={(e) => handleDataChange('lastName', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Company"
                placeholder="Acme Inc."
                value={data.company || ''}
                onChange={(e) => handleDataChange('company', e.target.value)}
              />
              <Input
                label="Job Title"
                placeholder="Software Engineer"
                value={data.title || ''}
                onChange={(e) => handleDataChange('title', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Mobile Phone"
                type="tel"
                placeholder="+1 555 123 4567"
                value={data.mobile || ''}
                onChange={(e) => handleDataChange('mobile', e.target.value)}
              />
              <Input
                label="Work Phone"
                type="tel"
                placeholder="+1 555 987 6543"
                value={data.workPhone || ''}
                onChange={(e) => handleDataChange('workPhone', e.target.value)}
              />
            </div>
            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              value={data.email || ''}
              onChange={(e) => handleDataChange('email', e.target.value)}
            />
            <Input
              label="Website"
              placeholder="https://example.com"
              value={data.website || ''}
              onChange={(e) => handleDataChange('website', e.target.value)}
            />
            <Input
              label="Street Address"
              placeholder="123 Main St"
              value={data.street || ''}
              onChange={(e) => handleDataChange('street', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                placeholder="New York"
                value={data.city || ''}
                onChange={(e) => handleDataChange('city', e.target.value)}
              />
              <Input
                label="State/Province"
                placeholder="NY"
                value={data.state || ''}
                onChange={(e) => handleDataChange('state', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="ZIP/Postal Code"
                placeholder="10001"
                value={data.zip || ''}
                onChange={(e) => handleDataChange('zip', e.target.value)}
              />
              <Input
                label="Country"
                placeholder="USA"
                value={data.country || ''}
                onChange={(e) => handleDataChange('country', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={2}
                placeholder="Additional notes..."
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
              label="Location Name"
              placeholder="My Office"
              value={data.name || ''}
              onChange={(e) => handleDataChange('name', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Latitude"
                type="number"
                step="any"
                placeholder="40.7128"
                value={data.latitude || ''}
                onChange={(e) => handleDataChange('latitude', e.target.value)}
              />
              <Input
                label="Longitude"
                type="number"
                step="any"
                placeholder="-74.0060"
                value={data.longitude || ''}
                onChange={(e) => handleDataChange('longitude', e.target.value)}
              />
            </div>
            <p className="text-xs text-gray-500">
              Tip: You can find coordinates from Google Maps by right-clicking on a location.
            </p>
          </div>
        )

      // Etkinlik/Takvim QR kodu
      case 'EVENT':
        return (
          <div className="space-y-4">
            <Input
              label="Event Name"
              placeholder="Team Meeting"
              value={data.eventName || ''}
              onChange={(e) => handleDataChange('eventName', e.target.value)}
            />
            <Input
              label="Location"
              placeholder="Conference Room A"
              value={data.location || ''}
              onChange={(e) => handleDataChange('location', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date & Time"
                type="datetime-local"
                value={data.startDate || ''}
                onChange={(e) => handleDataChange('startDate', e.target.value)}
              />
              <Input
                label="End Date & Time"
                type="datetime-local"
                value={data.endDate || ''}
                onChange={(e) => handleDataChange('endDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                placeholder="Event description..."
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
              label={`${type.charAt(0) + type.slice(1).toLowerCase()} Username`}
              placeholder={type === 'YOUTUBE' ? '@channelname' : '@username'}
              value={data.username || ''}
              onChange={(e) => handleDataChange('username', e.target.value)}
            />
            {(type === 'LINKEDIN' || type === 'YOUTUBE') && (
              <Input
                label="Or paste full profile/channel URL"
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
              label="Facebook Username or Page Name"
              placeholder="username"
              value={data.username || ''}
              onChange={(e) => handleDataChange('username', e.target.value)}
            />
            <Input
              label="Or paste full page URL"
              placeholder="https://facebook.com/yourpage"
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
              label="Bitcoin Address"
              placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
              value={data.address || ''}
              onChange={(e) => handleDataChange('address', e.target.value)}
            />
            <Input
              label="Amount (BTC)"
              type="number"
              step="any"
              placeholder="0.001"
              value={data.amount || ''}
              onChange={(e) => handleDataChange('amount', e.target.value)}
            />
            <Input
              label="Message (optional)"
              placeholder="Payment for..."
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
              label="App Store URL (iOS)"
              placeholder="https://apps.apple.com/app/..."
              value={data.iosUrl || ''}
              onChange={(e) => handleDataChange('iosUrl', e.target.value)}
            />
            <Input
              label="Play Store URL (Android)"
              placeholder="https://play.google.com/store/apps/..."
              value={data.androidUrl || ''}
              onChange={(e) => handleDataChange('androidUrl', e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Note: Users will be redirected based on their device.
            </p>
          </div>
        )

      // PDF ve Image QR kodları
      case 'PDF':
      case 'IMAGE':
        return (
          <div className="space-y-4">
            <Input
              label={`${type === 'PDF' ? 'PDF' : 'Image'} URL`}
              placeholder={`https://example.com/file.${type === 'PDF' ? 'pdf' : 'jpg'}`}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Enter the direct URL to your {type === 'PDF' ? 'PDF document' : 'image'}.
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

