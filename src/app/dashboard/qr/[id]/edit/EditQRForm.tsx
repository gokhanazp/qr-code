'use client'

// QR Kod Düzenleme Formu (QR Code Edit Form)
// Tüm QR tipleri için tam düzenleme desteği
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Save, Loader2, CheckCircle, XCircle } from 'lucide-react'
import QRDownloadWrapper from '../QRDownloadWrapper'

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

export default function EditQRForm({
  qrId, qrName: initialName, qrType, originalUrl: initialUrl,
  rawContent: initialRawContent, settings, isActive: initialIsActive,
}: EditQRFormProps) {
  const router = useRouter()
  const t = useTranslations('dashboard')
  const tGen = useTranslations('generator')

  // Ortak state'ler
  const [name, setName] = useState(initialName)
  const [url, setUrl] = useState(initialUrl)
  const [isActive, setIsActive] = useState(initialIsActive)
  const [foregroundColor, setForegroundColor] = useState(settings.foregroundColor as string || '#000000')
  const [backgroundColor, setBackgroundColor] = useState(settings.backgroundColor as string || '#ffffff')
  const [frameText, setFrameText] = useState(settings.frameText as string || '')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // APP tipi için ek state'ler - rawContent'ten başlangıç değerlerini al
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
    welcomeScreenEnabled: initialRawContent.welcomeScreenEnabled !== 'false',
    welcomeLogo: initialRawContent.welcomeLogo || '',
  })

  // APP verilerini güncelle
  const updateAppData = (key: string, value: string | boolean) => {
    setAppData(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    if (!name.trim()) { setMessage({ type: 'error', text: t('pleaseEnterName') }); return }
    setIsSaving(true); setMessage(null)

    // Güncellenmiş rawContent oluştur
    let updatedRawContent = { ...initialRawContent }
    if (qrType === 'APP') {
      updatedRawContent = { ...appData, welcomeScreenEnabled: String(appData.welcomeScreenEnabled) }
    }

    try {
      const res = await fetch(`/api/qr/${qrId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          content: qrType === 'URL' ? url : initialUrl,
          rawContent: updatedRawContent,
          settings: { ...settings, foregroundColor, backgroundColor, frameText },
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

  const getQRContent = () => qrType === 'URL' ? url : (url || initialUrl)

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
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            App Store URL
          </label>
          <input type="url" value={appData.iosUrl} onChange={(e) => updateAppData('iosUrl', e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="https://apps.apple.com/app/..." />
        </div>
        <div>
          <label className="text-sm text-gray-700 mb-1 block flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/></svg>
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

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {/* QR Kod Adı - Tüm tipler için ortak */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('qrName')}</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* QR Tipine göre form */}
        {qrType === 'APP' ? renderAppForm() : (
          <>
            {qrType === 'URL' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('targetUrl')}</label>
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="https://example.com" />
                <p className="text-xs text-gray-500 mt-1">{t('targetUrlDesc')}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{tGen('foregroundColor')}</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={foregroundColor} onChange={(e) => setForegroundColor(e.target.value)} className="w-10 h-10 rounded-lg border cursor-pointer" />
                  <input type="text" value={foregroundColor} onChange={(e) => setForegroundColor(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{tGen('backgroundColor')}</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-10 h-10 rounded-lg border cursor-pointer" />
                  <input type="text" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{tGen('frameText')}</label>
              <input type="text" value={frameText} onChange={(e) => setFrameText(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500" />
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

      {/* Önizleme Bölümü */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">{t('preview')}</h3>

        {/* APP tipi için özel önizleme */}
        {qrType === 'APP' ? (
          <div className="space-y-4">
            {/* Landing Page Önizleme */}
            <div className="border rounded-xl overflow-hidden" style={{ maxWidth: '200px', margin: '0 auto' }}>
              <div className="h-[320px] flex flex-col" style={{ background: `linear-gradient(to bottom, ${appData.secondaryColor}, ${appData.primaryColor})` }}>
                <div className="p-3 flex flex-col items-center text-center flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: appData.textColor }}>{appData.appName || 'APP NAME'}</p>
                  <p className="text-[8px] mb-2 opacity-70" style={{ color: appData.textColor }}>{appData.developer || 'Developer'}</p>
                  <div className="bg-white/30 rounded-xl p-2 mb-2">
                    {appData.appLogo ? <img src={appData.appLogo} alt="Logo" className="w-12 h-12 object-contain" /> : <span className="text-3xl">📱</span>}
                  </div>
                  <p className="text-[9px] font-bold leading-tight mb-1" style={{ color: appData.textColor }}>{appData.title || 'Download Our App'}</p>
                  <p className="text-[7px] italic mb-2 opacity-60" style={{ color: appData.textColor }}>HEMEN İNDİR!</p>
                  <div className="space-y-1 w-full px-2">
                    {appData.iosUrl && <img src="/img/apple-en.png" alt="App Store" className="w-full h-auto rounded" />}
                    {appData.androidUrl && <img src="/img/google-en.png" alt="Google Play" className="w-full h-auto rounded" />}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">Landing Page Önizleme</p>
          </div>
        ) : (
          <QRDownloadWrapper content={getQRContent()} foregroundColor={foregroundColor} backgroundColor={backgroundColor}
            size={(settings.size as number) || 256} errorCorrection={(settings.errorCorrection as string) || 'M'}
            selectedFrame={(settings.frame as string) || 'none'} frameText={frameText} frameColor={(settings.frameColor as string) || '#000000'}
            logo={(settings.logo as string) || null} logoSize={(settings.logoSize as number) || 20} qrName={name || 'qr-code'}
            isExpired={false} downloadPNGLabel={t('downloadPNG')} downloadSVGLabel={t('downloadSVG')} />
        )}
      </div>
    </div>
  )
}