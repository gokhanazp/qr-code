'use client'

// QR Kod Düzenleme Formu (QR Code Edit Form)
// Tüm QR tipleri için tam düzenleme desteği - Frame, Logo, Renkler dahil
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Save, Loader2, CheckCircle, XCircle, Upload, X } from 'lucide-react'
import QRDownloadWrapper from '../QRDownloadWrapper'
import { FRAME_TEMPLATES } from '@/components/qr/QRFrameSelector'
import { PRESET_LOGOS } from '@/components/qr/QRLogoUploader'

interface EditQRFormProps {
  qrId: string
  qrName: string
  qrType: string
  originalUrl: string
  rawContent: Record<string, string>
  settings: Record<string, unknown>
  isActive: boolean
}

// APP tipi renk preset'leri
const colorPresets = [
  { id: 'green', primary: '#2d8659', secondary: '#a8e6cf', text: '#000000' },
  { id: 'dark', primary: '#1a1a2e', secondary: '#4a4a5a', text: '#ffffff' },
  { id: 'red', primary: '#c0392b', secondary: '#e74c3c', text: '#ffffff' },
  { id: 'blue', primary: '#1e5799', secondary: '#7db9e8', text: '#000000' },
  { id: 'purple', primary: '#6a1b9a', secondary: '#ba68c8', text: '#ffffff' },
  { id: 'orange', primary: '#e65100', secondary: '#ffb74d', text: '#000000' },
]

// Preset renkler (Preset colors)
const presetColors = ['#000000', '#1e40af', '#059669', '#dc2626', '#7c3aed', '#ea580c', '#0891b2', '#be185d']
const bgPresetColors = ['#ffffff', '#f3f4f6', '#fef3c7', '#dbeafe', '#fce7f3', '#d1fae5']

export default function EditQRForm({
  qrId, qrName: initialName, qrType, originalUrl: initialUrl,
  rawContent: initialRawContent, settings, isActive: initialIsActive,
}: EditQRFormProps) {
  const router = useRouter()
  const t = useTranslations('dashboard')
  const tGen = useTranslations('generator')
  const logoInputRef = useRef<HTMLInputElement>(null)

  // QR tipini normalize et (büyük harf duyarlılığını kaldır)
  const normalizedType = qrType.toUpperCase()

  // Ortak state'ler
  const [name, setName] = useState(initialName)
  const [url, setUrl] = useState(initialUrl)
  const [isActive, setIsActive] = useState(initialIsActive)
  const [foregroundColor, setForegroundColor] = useState(settings.foregroundColor as string || '#000000')
  const [backgroundColor, setBackgroundColor] = useState(settings.backgroundColor as string || '#ffffff')
  const [selectedFrame, setSelectedFrame] = useState(settings.frame as string || 'none')
  const [frameText, setFrameText] = useState(settings.frameText as string || '')
  const [frameColor, setFrameColor] = useState(settings.frameColor as string || '#000000')
  const [logo, setLogo] = useState<string | null>(settings.logo as string || null)
  const [logoSize, setLogoSize] = useState(settings.logoSize as number || 20)
  const [size, setSize] = useState(settings.size as number || 256)
  const [errorCorrection, setErrorCorrection] = useState(settings.errorCorrection as string || 'M')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // APP tipi için ek state'ler - rawContent'ten başlangıç değerlerini al
  // welcomeScreenEnabled string olarak geliyor ('true' veya 'false')
  const welcomeEnabled = initialRawContent.welcomeScreenEnabled !== 'false'

  const [appData, setAppData] = useState({
    appName: initialRawContent.appName || '',
    developer: initialRawContent.developer || '',
    appLogo: initialRawContent.appLogo || '',
    title: initialRawContent.title || '',
    description: initialRawContent.description || '',
    website: initialRawContent.website || '',
    iosUrl: initialRawContent.iosUrl || '',
    androidUrl: initialRawContent.androidUrl || '',
    primaryColor: initialRawContent.primaryColor || '#2d8659',
    secondaryColor: initialRawContent.secondaryColor || '#a8e6cf',
    textColor: initialRawContent.textColor || '#000000',
    welcomeScreenEnabled: welcomeEnabled,
    welcomeLogo: initialRawContent.welcomeLogo || '',
  })

  // APP verilerini güncelle
  const updateAppData = (key: string, value: string | boolean) => {
    setAppData(prev => ({ ...prev, [key]: value }))
  }

  // MENU tipi için ek state'ler
  const [menuData, setMenuData] = useState({
    restaurantName: initialRawContent.restaurantName || '',
    description: initialRawContent.description || '',
    website: initialRawContent.website || '',
    primaryColor: initialRawContent.primaryColor || '#ff5722',
    textColor: initialRawContent.textColor || '#000000',
    coverImage: initialRawContent.coverImage || '',
    items: initialRawContent.items || '[]',
  })

  // MENU verilerini güncelle
  const updateMenuData = (key: string, value: string) => {
    setMenuData(prev => ({ ...prev, [key]: value }))
  }

  // VCARD tipi için ek state'ler - VCardForm ile birebir aynı alan adları
  const [vcardData, setVcardData] = useState({
    firstName: initialRawContent.firstName || '',
    lastName: initialRawContent.lastName || '',
    company: initialRawContent.company || '',
    title: initialRawContent.title || '',
    mobile: initialRawContent.mobile || '',
    workPhone: initialRawContent.workPhone || '',
    email: initialRawContent.email || '',
    website: initialRawContent.website || '',
    street: initialRawContent.street || '',
    city: initialRawContent.city || '',
    state: initialRawContent.state || '',
    zip: initialRawContent.zip || '',
    country: initialRawContent.country || '',
    note: initialRawContent.note || '',
    photo: initialRawContent.photo || '',
    primaryColor: initialRawContent.primaryColor || '#527AC9',
    secondaryColor: initialRawContent.secondaryColor || '#7EC09F',
    template: (initialRawContent.template as 'classic' | 'modern' | 'sleek') || 'classic',
  })

  const updateVcardData = (key: string, value: string) => {
    setVcardData(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    if (!name.trim()) { setMessage({ type: 'error', text: t('pleaseEnterName') }); return }
    setIsSaving(true); setMessage(null)

    // Güncellenmiş rawContent oluştur
    let updatedRawContent: Record<string, string> = { ...initialRawContent }
    if (normalizedType === 'APP') {
      updatedRawContent = { ...appData, welcomeScreenEnabled: String(appData.welcomeScreenEnabled) }
    } else if (normalizedType === 'MENU') {
      updatedRawContent = { ...menuData }
    } else if (normalizedType === 'VCARD') {
      updatedRawContent = { ...vcardData }
    }

    // VCARD için orijinal hedef URL'sini güncel verilerle yeniden üret.
    // Böylece /v/[base64] ile açılan eski/önbelleklenmiş paylaşımlar da güncel veriyi gösterir.
    let contentToSave: string = normalizedType === 'URL' ? url : initialUrl
    if (normalizedType === 'VCARD' && typeof window !== 'undefined') {
      try {
        const jsonStr = JSON.stringify(updatedRawContent)
        const base64 = btoa(unescape(encodeURIComponent(jsonStr)))
          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
        contentToSave = `${window.location.origin}/v/${base64}`
      } catch {
        contentToSave = initialUrl
      }
    }

    try {
      const res = await fetch(`/api/qr/${qrId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          content: contentToSave,
          rawContent: updatedRawContent,
          settings: {
            ...settings,
            foregroundColor,
            backgroundColor,
            frame: selectedFrame,
            frameText,
            frameColor,
            logo,
            logoSize,
            size,
            errorCorrection,
          },
          is_active: isActive,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Güncelleme başarısız')
      setMessage({ type: 'success', text: t('qrUpdated') })
      setTimeout(() => { router.push(`/dashboard/qr/${qrId}`); router.refresh() }, 1500)
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Bir hata oluştu' })
    } finally { setIsSaving(false) }
  }

  const getQRContent = () => {
    if (normalizedType === 'URL') return url
    if (normalizedType === 'MENU') {
      // MENU tipi için landing page URL'sini oluştur
      // Format: https://domain.com/menu/[qr-id]
      if (typeof window !== 'undefined') {
        const baseUrl = window.location.origin
        const menuUrl = `${baseUrl}/menu/${qrId}`
        console.log('MENU QR Content:', menuUrl)
        return menuUrl
      }
      // Server-side fallback
      return initialUrl || `/menu/${qrId}`
    }
    return url || initialUrl
  }

  // Debug: MENU tipi için değerleri kontrol et
  if (normalizedType === 'MENU') {
    console.log('MENU Edit Page Debug:', {
      normalizedType,
      qrId,
      initialUrl,
      url,
      generatedContent: getQRContent(),
      menuData
    })
  }

  // APP tipi için düzenleme formu
  const renderAppForm = () => (
    <div className="space-y-6">
      {/* Renk Şeması */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 border-b pb-2">🎨 Renk Şeması</h4>
        <div className="flex gap-2 flex-wrap">
          {colorPresets.map((preset) => (
            <button key={preset.id} type="button"
              onClick={() => { updateAppData('primaryColor', preset.primary); updateAppData('secondaryColor', preset.secondary); updateAppData('textColor', preset.text) }}
              className={`w-12 h-8 rounded-md border-2 transition-all ${appData.primaryColor === preset.primary ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
              style={{ background: `linear-gradient(to bottom, ${preset.secondary}, ${preset.primary})` }} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Primary</label>
            <div className="flex items-center gap-1">
              <input type="color" value={appData.primaryColor} onChange={(e) => updateAppData('primaryColor', e.target.value)} className="w-8 h-8 rounded border cursor-pointer" />
              <input type="text" value={appData.primaryColor} onChange={(e) => updateAppData('primaryColor', e.target.value)} className="flex-1 px-2 py-1 border rounded text-xs font-mono" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Secondary</label>
            <div className="flex items-center gap-1">
              <input type="color" value={appData.secondaryColor} onChange={(e) => updateAppData('secondaryColor', e.target.value)} className="w-8 h-8 rounded border cursor-pointer" />
              <input type="text" value={appData.secondaryColor} onChange={(e) => updateAppData('secondaryColor', e.target.value)} className="flex-1 px-2 py-1 border rounded text-xs font-mono" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Text</label>
            <div className="flex items-center gap-1">
              <input type="color" value={appData.textColor} onChange={(e) => updateAppData('textColor', e.target.value)} className="w-8 h-8 rounded border cursor-pointer" />
              <input type="text" value={appData.textColor} onChange={(e) => updateAppData('textColor', e.target.value)} className="flex-1 px-2 py-1 border rounded text-xs font-mono" />
            </div>
          </div>
        </div>
      </div>

      {/* Uygulama Bilgileri */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 border-b pb-2">📱 Uygulama Bilgileri</h4>
        <div>
          <label className="text-sm text-gray-700 mb-1 block">Uygulama Adı</label>
          <input type="text" value={appData.appName} onChange={(e) => updateAppData('appName', e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="My App" />
        </div>
        <div>
          <label className="text-sm text-gray-700 mb-1 block">Geliştirici / Slogan</label>
          <input type="text" value={appData.developer} onChange={(e) => updateAppData('developer', e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Company Name" />
        </div>
      </div>

      {/* App Logo */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">App Logo (180x180 px)</label>
        <div className="flex items-center gap-4">
          {appData.appLogo ? (
            <div className="relative">
              <img src={appData.appLogo} alt="App Logo" className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200" />
              <button type="button" onClick={() => updateAppData('appLogo', '')} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs">×</button>
            </div>
          ) : (
            <label className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400">
              <span className="text-xl text-gray-400">📷</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) { const reader = new FileReader(); reader.onload = (ev) => updateAppData('appLogo', ev.target?.result as string); reader.readAsDataURL(file) }
              }} />
            </label>
          )}
        </div>
      </div>

      {/* İçerik */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 border-b pb-2">✏️ İçerik</h4>
        <div>
          <label className="text-sm text-gray-700 mb-1 block">Başlık</label>
          <input type="text" value={appData.title} onChange={(e) => updateAppData('title', e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Uygulamamızı hemen indirin!" />
        </div>
        <div>
          <label className="text-sm text-gray-700 mb-1 block">Açıklama</label>
          <textarea value={appData.description} onChange={(e) => updateAppData('description', e.target.value)} className="w-full px-3 py-2 border rounded-lg resize-none" rows={2} maxLength={250} placeholder="Kısa açıklama..." />
          <p className="text-xs text-gray-400 text-right">{appData.description.length}/250</p>
        </div>
        <div>
          <label className="text-sm text-gray-700 mb-1 block">Website</label>
          <input type="url" value={appData.website} onChange={(e) => updateAppData('website', e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="https://example.com" />
        </div>
      </div>

      {/* Store Linkleri */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 border-b pb-2">🔗 Store Linkleri</h4>
        <div>
          <label className="text-sm text-gray-700 mb-1 block flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
            App Store URL
          </label>
          <input type="url" value={appData.iosUrl} onChange={(e) => updateAppData('iosUrl', e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="https://apps.apple.com/app/..." />
        </div>
        <div>
          <label className="text-sm text-gray-700 mb-1 block flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" /></svg>
            Google Play URL
          </label>
          <input type="url" value={appData.androidUrl} onChange={(e) => updateAppData('androidUrl', e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="https://play.google.com/store/apps/..." />
        </div>
      </div>

      {/* Welcome Screen */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 border-b pb-2">📱 Welcome Screen</h4>
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-600">Welcome Screen Göster</label>
          <button type="button" onClick={() => updateAppData('welcomeScreenEnabled', !appData.welcomeScreenEnabled)}
            className={`relative w-10 h-5 rounded-full transition-colors ${appData.welcomeScreenEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${appData.welcomeScreenEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        {appData.welcomeScreenEnabled && (
          <div className="flex items-center gap-3">
            <div className="w-16 h-12 border rounded flex items-center justify-center bg-gray-50">
              {(appData.welcomeLogo || appData.appLogo) ? <img src={appData.welcomeLogo || appData.appLogo} alt="Welcome" className="max-w-[50px] max-h-[40px] object-contain" /> : <span className="text-2xl text-gray-300">📱</span>}
            </div>
            <label className="px-3 py-1.5 bg-cyan-500 text-white rounded cursor-pointer hover:bg-cyan-600 text-sm">
              Değiştir
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) { const reader = new FileReader(); reader.onload = (ev) => updateAppData('welcomeLogo', ev.target?.result as string); reader.readAsDataURL(file) }
              }} />
            </label>
          </div>
        )}
      </div>
    </div>
  )

  // Logo yükleme işlevi
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('Logo 2MB\'dan küçük olmalı'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setLogo(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="grid md:grid-cols-5 gap-4">
      {/* Sol Panel - Form (3/5 genişlik) */}
      <div className="md:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4 max-h-[85vh] overflow-y-auto">
        {/* QR Kod Adı - Tüm tipler için ortak */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('qrName')}</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* QR Tipine göre form */}
        {normalizedType === 'APP' ? renderAppForm() : (
          <>
            {/* URL içeriği */}
            {normalizedType === 'URL' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('targetUrl')}</label>
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="https://example.com" />
                <p className="text-xs text-gray-500 mt-1">{t('targetUrlDesc')}</p>
              </div>
            )}

            {/* MENU içeriği */}
            {normalizedType === 'MENU' && (() => {
              // items JSON string olarak geliyor, parse edelim
              let menuItems: Array<{ url: string; caption: string }> = []
              try {
                if (menuData.items) {
                  menuItems = JSON.parse(menuData.items)
                }
              } catch {
                menuItems = []
              }

              return (
                <div className="space-y-4">
                  {/* Renk Teması */}
                  <div className="p-4 bg-orange-50 rounded-xl space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">🎨 Renk Teması</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Primary Color</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={menuData.primaryColor} onChange={(e) => updateMenuData('primaryColor', e.target.value)} className="w-8 h-8 rounded border cursor-pointer" />
                          <input type="text" value={menuData.primaryColor} onChange={(e) => updateMenuData('primaryColor', e.target.value)} className="flex-1 px-2 py-1.5 border rounded text-xs font-mono" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Text Color</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={menuData.textColor} onChange={(e) => updateMenuData('textColor', e.target.value)} className="w-8 h-8 rounded border cursor-pointer" />
                          <input type="text" value={menuData.textColor} onChange={(e) => updateMenuData('textColor', e.target.value)} className="flex-1 px-2 py-1.5 border rounded text-xs font-mono" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Restoran Bilgileri */}
                  <div className="p-4 bg-orange-50 rounded-xl space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">🍽️ Restoran Bilgileri</h4>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Restoran Adı</label>
                      <input type="text" value={menuData.restaurantName} onChange={(e) => updateMenuData('restaurantName', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Restoran Adı" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Açıklama</label>
                      <textarea value={menuData.description} onChange={(e) => updateMenuData('description', e.target.value)} rows={2}
                        className="w-full px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-orange-500" placeholder="Menü açıklaması..." />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Website</label>
                      <input type="text" value={menuData.website} onChange={(e) => updateMenuData('website', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="https://restoran.com" />
                    </div>
                  </div>

                  {/* Kapak Görseli */}
                  <div className="p-4 bg-orange-50 rounded-xl space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Kapak Görseli / Logo</label>
                    <div className="flex items-center gap-4">
                      {menuData.coverImage ? (
                        <div className="relative">
                          <img src={menuData.coverImage} alt="Cover" className="w-32 h-20 rounded-lg object-cover border border-gray-200" />
                          <button type="button" onClick={() => updateMenuData('coverImage', '')}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">×</button>
                        </div>
                      ) : (
                        <label className="w-32 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-100 transition-colors">
                          <span className="text-2xl text-gray-400">📷</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onload = (ev) => updateMenuData('coverImage', ev.target?.result as string)
                              reader.readAsDataURL(file)
                            }
                          }} />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Menü Görselleri */}
                  <div className="p-4 bg-orange-50 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-700">📑 Menü Sayfaları</label>
                      <span className="text-xs text-gray-500">{menuItems.length} sayfa</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {menuItems.map((item, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={item.url}
                            alt={`Menü ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E✕%3C/text%3E%3C/svg%3E'
                            }}
                          />
                          <button type="button"
                            onClick={() => {
                              const newItems = menuItems.filter((_, i) => i !== index)
                              updateMenuData('items', JSON.stringify(newItems))
                            }}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm">
                            ×
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black/50 text-white px-1.5 py-0.5 rounded text-xs">
                            {index + 1}
                          </div>
                        </div>
                      ))}

                      {/* Yeni Görsel Ekle */}
                      <label className="w-full h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-100 transition-colors">
                        <span className="text-2xl text-gray-400">+</span>
                        <span className="text-xs text-gray-500">Ekle</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                          if (e.target.files) {
                            const files = Array.from(e.target.files)
                            const currentItems = menuItems

                            if (currentItems.length + files.length > 10) {
                              alert('En fazla 10 menü sayfası ekleyebilirsiniz')
                              return
                            }

                            Promise.all(files.map(file => {
                              return new Promise<{ url: string; caption: string }>((resolve) => {
                                const reader = new FileReader()
                                reader.onload = (ev) => {
                                  const img = new Image()
                                  img.onload = () => {
                                    const maxWidth = 1200
                                    let width = img.width
                                    let height = img.height
                                    if (width > maxWidth) {
                                      height = (height * maxWidth) / width
                                      width = maxWidth
                                    }
                                    const canvas = document.createElement('canvas')
                                    canvas.width = width
                                    canvas.height = height
                                    const ctx = canvas.getContext('2d')
                                    if (ctx) {
                                      ctx.drawImage(img, 0, 0, width, height)
                                      const compressedUrl = canvas.toDataURL('image/jpeg', 0.8)
                                      resolve({ url: compressedUrl, caption: '' })
                                    } else {
                                      resolve({ url: ev.target?.result as string, caption: '' })
                                    }
                                  }
                                  img.src = ev.target?.result as string
                                }
                                reader.readAsDataURL(file)
                              })
                            })).then(newPages => {
                              const updatedItems = [...currentItems, ...newPages]
                              updateMenuData('items', JSON.stringify(updatedItems))
                            })
                          }
                        }} />
                      </label>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* WIFI içeriği */}
            {normalizedType === 'WIFI' && (
              <div className="space-y-4 p-4 bg-purple-50 rounded-xl">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">📶 WiFi Bilgileri</h4>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Ağ Adı (SSID)</label>
                  <input type="text" value={initialRawContent.ssid || ''} readOnly
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Şifre</label>
                  <input type="text" value={initialRawContent.password || ''} readOnly
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Güvenlik Tipi</label>
                  <input type="text" value={initialRawContent.encryption || 'WPA'} readOnly
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
                </div>
              </div>
            )}

            {/* VCARD içeriği */}
            {normalizedType === 'VCARD' && (
              <div className="space-y-4 p-4 bg-indigo-50 rounded-xl">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">👤 Kişi Bilgileri</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Ad</label>
                    <input type="text" value={vcardData.firstName} onChange={(e) => updateVcardData('firstName', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Soyad</label>
                    <input type="text" value={vcardData.lastName} onChange={(e) => updateVcardData('lastName', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Şirket</label>
                    <input type="text" value={vcardData.company} onChange={(e) => updateVcardData('company', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Ünvan</label>
                    <input type="text" value={vcardData.title} onChange={(e) => updateVcardData('title', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Cep Telefonu</label>
                    <input type="text" value={vcardData.mobile} onChange={(e) => updateVcardData('mobile', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">İş Telefonu</label>
                    <input type="text" value={vcardData.workPhone} onChange={(e) => updateVcardData('workPhone', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Email</label>
                    <input type="email" value={vcardData.email} onChange={(e) => updateVcardData('email', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Website</label>
                    <input type="text" value={vcardData.website} onChange={(e) => updateVcardData('website', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="https://..." />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Adres</label>
                  <input type="text" value={vcardData.street} onChange={(e) => updateVcardData('street', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Sokak / Cadde" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Şehir</label>
                    <input type="text" value={vcardData.city} onChange={(e) => updateVcardData('city', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">İl / Eyalet</label>
                    <input type="text" value={vcardData.state} onChange={(e) => updateVcardData('state', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Posta Kodu</label>
                    <input type="text" value={vcardData.zip} onChange={(e) => updateVcardData('zip', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Ülke</label>
                    <input type="text" value={vcardData.country} onChange={(e) => updateVcardData('country', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-indigo-100">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Şablon</label>
                    <select value={vcardData.template} onChange={(e) => updateVcardData('template', e.target.value)}
                      className="w-full px-2 py-2 border rounded-lg text-sm">
                      <option value="classic">Classic</option>
                      <option value="modern">Modern</option>
                      <option value="sleek">Sleek</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Birincil Renk</label>
                    <div className="flex items-center gap-1">
                      <input type="color" value={vcardData.primaryColor} onChange={(e) => updateVcardData('primaryColor', e.target.value)} className="w-8 h-8 rounded border cursor-pointer" />
                      <input type="text" value={vcardData.primaryColor} onChange={(e) => updateVcardData('primaryColor', e.target.value)} className="flex-1 px-2 py-1 border rounded text-xs font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">İkincil Renk</label>
                    <div className="flex items-center gap-1">
                      <input type="color" value={vcardData.secondaryColor} onChange={(e) => updateVcardData('secondaryColor', e.target.value)} className="w-8 h-8 rounded border cursor-pointer" />
                      <input type="text" value={vcardData.secondaryColor} onChange={(e) => updateVcardData('secondaryColor', e.target.value)} className="flex-1 px-2 py-1 border rounded text-xs font-mono" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EMAIL içeriği */}
            {normalizedType === 'EMAIL' && (
              <div className="space-y-4 p-4 bg-red-50 rounded-xl">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">📧 Email Bilgileri</h4>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Email Adresi</label>
                  <input type="text" value={initialRawContent.email || ''} readOnly
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Konu</label>
                  <input type="text" value={initialRawContent.subject || ''} readOnly
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Mesaj</label>
                  <textarea value={initialRawContent.body || ''} readOnly rows={2}
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100 resize-none" />
                </div>
              </div>
            )}

            {/* PHONE içeriği */}
            {normalizedType === 'PHONE' && (
              <div className="space-y-4 p-4 bg-green-50 rounded-xl">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">📞 Telefon</h4>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Telefon Numarası</label>
                  <input type="text" value={initialRawContent.phone || ''} readOnly
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
                </div>
              </div>
            )}

            {/* SMS içeriği */}
            {normalizedType === 'SMS' && (
              <div className="space-y-4 p-4 bg-yellow-50 rounded-xl">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">💬 SMS Bilgileri</h4>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Telefon Numarası</label>
                  <input type="text" value={initialRawContent.phone || ''} readOnly
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Mesaj</label>
                  <textarea value={initialRawContent.message || ''} readOnly rows={2}
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100 resize-none" />
                </div>
              </div>
            )}

            {/* WHATSAPP içeriği */}
            {normalizedType === 'WHATSAPP' && (
              <div className="space-y-4 p-4 bg-emerald-50 rounded-xl">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">💬 WhatsApp</h4>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Telefon Numarası</label>
                  <input type="text" value={initialRawContent.phone || ''} readOnly
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Mesaj</label>
                  <textarea value={initialRawContent.message || ''} readOnly rows={2}
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100 resize-none" />
                </div>
              </div>
            )}

            {/* LOCATION içeriği */}
            {normalizedType === 'LOCATION' && (
              <div className="space-y-4 p-4 bg-pink-50 rounded-xl">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">📍 Konum Bilgileri</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Enlem (Latitude)</label>
                    <input type="text" value={initialRawContent.latitude || ''} readOnly
                      className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Boylam (Longitude)</label>
                    <input type="text" value={initialRawContent.longitude || ''} readOnly
                      className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
                  </div>
                </div>
              </div>
            )}

            {/* PARKING içeriği */}
            {normalizedType === 'PARKING' && (
              <div className="space-y-4 p-4 bg-amber-50 rounded-xl">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">🚗 Park QR Bilgileri</h4>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Telefon Numarası</label>
                  <input type="text" value={initialRawContent.phone || ''} readOnly
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
                </div>
              </div>
            )}

            {/* Sosyal Medya tipleri */}
            {['INSTAGRAM', 'FACEBOOK', 'TWITTER', 'LINKEDIN', 'YOUTUBE'].includes(normalizedType) && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-xl">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">🔗 Sosyal Medya</h4>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Kullanıcı Adı / URL</label>
                  <input type="text" value={initialRawContent.username || initialRawContent.url || ''} readOnly
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
                </div>
              </div>
            )}

            {/* TEXT içeriği */}
            {normalizedType === 'TEXT' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">📝 Metin İçeriği</h4>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Metin</label>
                  <textarea value={initialRawContent.text || url || ''} readOnly rows={4}
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100 resize-none" />
                </div>
              </div>
            )}

            {/* 🎨 RENKLER BÖLÜMÜ */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">🎨 {tGen('colors')}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-2">{tGen('foregroundColor')}</label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {presetColors.map(c => (
                      <button key={c} type="button" onClick={() => setForegroundColor(c)}
                        className={`w-6 h-6 rounded border-2 ${foregroundColor === c ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="color" value={foregroundColor} onChange={(e) => setForegroundColor(e.target.value)} className="w-8 h-8 rounded border cursor-pointer" />
                    <input type="text" value={foregroundColor} onChange={(e) => setForegroundColor(e.target.value)} className="flex-1 px-2 py-1.5 border rounded text-xs font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-2">{tGen('backgroundColor')}</label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {bgPresetColors.map(c => (
                      <button key={c} type="button" onClick={() => setBackgroundColor(c)}
                        className={`w-6 h-6 rounded border-2 ${backgroundColor === c ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-8 h-8 rounded border cursor-pointer" />
                    <input type="text" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="flex-1 px-2 py-1.5 border rounded text-xs font-mono" />
                  </div>
                </div>
              </div>
            </div>

            {/* 🖼️ FRAME BÖLÜMÜ */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">🖼️ {tGen('frame')}</h4>
              <div className="grid grid-cols-5 gap-2">
                {FRAME_TEMPLATES.map((frame) => (
                  <button key={frame.id} type="button"
                    onClick={() => { setSelectedFrame(frame.id); if (frame.hasText && !frameText) setFrameText(frame.defaultText) }}
                    className={`p-2 rounded-lg border-2 transition-all hover:scale-105 ${selectedFrame === frame.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 bg-white'}`}>
                    <div className="text-[10px] text-gray-600 text-center">{frame.name}</div>
                  </button>
                ))}
              </div>
              {selectedFrame !== 'none' && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">{tGen('frameText')}</label>
                    <input type="text" value={frameText} onChange={(e) => setFrameText(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="SCAN ME" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Frame Rengi</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={frameColor} onChange={(e) => setFrameColor(e.target.value)} className="w-8 h-8 rounded border cursor-pointer" />
                      <input type="text" value={frameColor} onChange={(e) => setFrameColor(e.target.value)} className="flex-1 px-2 py-1.5 border rounded text-xs font-mono" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 📷 LOGO BÖLÜMÜ */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">📷 {tGen('logo')}</h4>
              {logo ? (
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={logo} alt="Logo" className="w-16 h-16 rounded-lg border object-contain bg-white" />
                    <button type="button" onClick={() => setLogo(null)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">{tGen('logoSize')}</label>
                    <input type="range" min="10" max="35" value={logoSize} onChange={(e) => setLogoSize(Number(e.target.value))} className="w-full" />
                    <div className="flex justify-between text-[10px] text-gray-400"><span>{tGen('small')}</span><span>{logoSize}%</span><span>{tGen('large')}</span></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Hazır Logolar - SVG zaten data:image formatında */}
                  <div className="grid grid-cols-8 gap-1.5">
                    {PRESET_LOGOS.slice(0, 16).map((preset) => (
                      <button key={preset.id} type="button" onClick={() => setLogo(preset.svg)}
                        className="w-8 h-8 rounded border bg-white p-1 hover:border-blue-400 hover:bg-blue-50">
                        <img src={preset.svg} alt={preset.name} className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                  {/* Logo Yükle */}
                  <button type="button" onClick={() => logoInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-400 hover:bg-blue-50/50">
                    <Upload className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                    <p className="text-xs text-gray-600">{tGen('uploadLogo')}</p>
                  </button>
                  <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </div>
              )}
            </div>

            {/* ⚙️ BOYUT & HATA DÜZELTME */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">⚙️ {tGen('advancedOptions')}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{tGen('size')}</label>
                  <input type="range" min="128" max="512" step="32" value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full" />
                  <div className="text-center text-xs text-gray-500">{size}px</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{tGen('errorCorrection')}</label>
                  <select value={errorCorrection} onChange={(e) => setErrorCorrection(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="L">L - Low (7%)</option>
                    <option value="M">M - Medium (15%)</option>
                    <option value="Q">Q - Quartile (25%)</option>
                    <option value="H">H - High (30%)</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Aktif/Pasif Durumu - Tüm tipler için ortak */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div><p className="font-medium text-gray-900">{t('qrStatus')}</p><p className="text-sm text-gray-500">{t('qrStatusDesc')}</p></div>
          <button type="button" onClick={() => setIsActive(!isActive)} className={`relative inline-flex h-6 w-11 items-center rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {message && (
          <div className={`flex items-center gap-2 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}{message.text}
          </div>
        )}
        <button onClick={handleSave} disabled={isSaving} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50">
          {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" />{t('saving')}</> : <><Save className="w-5 h-5" />{t('saveChanges')}</>}
        </button>
      </div>

      {/* Sağ Panel - Önizleme (2/5 genişlik) - Her zaman sağda sabit */}
      <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:sticky md:top-4 h-fit order-first md:order-last">
        <h3 className="font-semibold text-gray-900 mb-4">{t('preview')}</h3>

        {/* APP tipi için özel önizleme */}
        {normalizedType === 'APP' ? (
          <div className="space-y-4">
            {/* Landing Page Önizleme */}
            <div className="border rounded-xl overflow-hidden mx-auto" style={{ maxWidth: '220px' }}>
              <div className="h-[360px] flex flex-col" style={{ background: `linear-gradient(to bottom, ${appData.secondaryColor}, ${appData.primaryColor})` }}>
                <div className="p-3 flex flex-col items-center text-center flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5" style={{ color: appData.textColor }}>{appData.appName || 'APP NAME'}</p>
                  <p className="text-[9px] mb-2 opacity-70" style={{ color: appData.textColor }}>{appData.developer || 'Developer'}</p>
                  <div className="bg-white/30 rounded-xl p-2 mb-2">
                    {appData.appLogo ? <img src={appData.appLogo} alt="Logo" className="w-14 h-14 object-contain" /> : <span className="text-4xl">📱</span>}
                  </div>
                  <p className="text-[10px] font-bold leading-tight mb-1" style={{ color: appData.textColor }}>{appData.title || 'Download Our App'}</p>
                  <p className="text-[8px] italic mb-2 opacity-60" style={{ color: appData.textColor }}>{appData.description || 'HEMEN İNDİR!'}</p>
                  <div className="space-y-1.5 w-full px-2">
                    {appData.iosUrl && <img src="/img/apple-en.png" alt="App Store" className="w-full h-auto rounded" />}
                    {appData.androidUrl && <img src="/img/google-en.png" alt="Google Play" className="w-full h-auto rounded" />}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">Landing Page Önizleme</p>
          </div>
        ) : normalizedType === 'MENU' ? (
          <div className="space-y-4">
            {/* Menu Preview */}
            <div className="border rounded-xl overflow-hidden mx-auto" style={{ maxWidth: '220px' }}>
              <div className="h-[360px] flex flex-col" style={{ background: `linear-gradient(to bottom, ${menuData.primaryColor}, ${menuData.primaryColor}dd)` }}>
                <div className="p-3 flex flex-col items-center text-center flex-1">
                  {menuData.coverImage && (
                    <img src={menuData.coverImage} alt="Cover" className="w-16 h-16 rounded-lg object-cover mb-2" />
                  )}
                  <p className="text-sm font-bold mb-1" style={{ color: menuData.textColor }}>
                    {menuData.restaurantName || 'Restoran Adı'}
                  </p>
                  <p className="text-xs opacity-70 mb-2" style={{ color: menuData.textColor }}>
                    {menuData.description || 'Menü açıklaması'}
                  </p>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-4xl">🍽️</div>
                  </div>
                  {menuData.website && (
                    <p className="text-[8px] opacity-60" style={{ color: menuData.textColor }}>
                      {menuData.website.replace(/^https?:\/\//, '')}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">Menü Landing Page Önizleme</p>

            {/* QR Code Preview */}
            <div className="border-t pt-4">
              <QRDownloadWrapper
                content={getQRContent()}
                foregroundColor={foregroundColor}
                backgroundColor={backgroundColor}
                size={size}
                errorCorrection={errorCorrection}
                selectedFrame={selectedFrame}
                frameText={frameText}
                frameColor={frameColor}
                logo={logo}
                logoSize={logoSize}
                qrName={name || 'qr-code'}
                isExpired={false}
                downloadPNGLabel={t('downloadPNG')}
                downloadSVGLabel={t('downloadSVG')}
              />
            </div>
          </div>
        ) : (
          <QRDownloadWrapper
            content={getQRContent()}
            foregroundColor={foregroundColor}
            backgroundColor={backgroundColor}
            size={size}
            errorCorrection={errorCorrection}
            selectedFrame={selectedFrame}
            frameText={frameText}
            frameColor={frameColor}
            logo={logo}
            logoSize={logoSize}
            qrName={name || 'qr-code'}
            isExpired={false}
            downloadPNGLabel={t('downloadPNG')}
            downloadSVGLabel={t('downloadSVG')}
          />
        )}
      </div>
    </div>
  )
}