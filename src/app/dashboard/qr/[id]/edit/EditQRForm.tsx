'use client'

// QR Kod Düzenleme Formu (QR Code Edit Form)
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

export default function EditQRForm({
  qrId, qrName: initialName, qrType, originalUrl: initialUrl,
  rawContent: initialRawContent, settings, isActive: initialIsActive,
}: EditQRFormProps) {
  const router = useRouter()
  const t = useTranslations('dashboard')
  const tGen = useTranslations('generator')

  const [name, setName] = useState(initialName)
  const [url, setUrl] = useState(initialUrl)
  const [isActive, setIsActive] = useState(initialIsActive)
  const [foregroundColor, setForegroundColor] = useState(settings.foregroundColor as string || '#000000')
  const [backgroundColor, setBackgroundColor] = useState(settings.backgroundColor as string || '#ffffff')
  const [frameText, setFrameText] = useState(settings.frameText as string || '')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSave = async () => {
    if (!name.trim()) { setMessage({ type: 'error', text: t('pleaseEnterName') }); return }
    setIsSaving(true); setMessage(null)
    try {
      const res = await fetch(`/api/qr/${qrId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(), content: url, rawContent: initialRawContent,
          settings: { ...settings, foregroundColor, backgroundColor, frameText }, is_active: isActive,
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

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('qrName')}</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
        </div>
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">{t('preview')}</h3>
        <QRDownloadWrapper content={getQRContent()} foregroundColor={foregroundColor} backgroundColor={backgroundColor}
          size={(settings.size as number) || 256} errorCorrection={(settings.errorCorrection as string) || 'M'}
          selectedFrame={(settings.frame as string) || 'none'} frameText={frameText} frameColor={(settings.frameColor as string) || '#000000'}
          logo={(settings.logo as string) || null} logoSize={(settings.logoSize as number) || 20} qrName={name || 'qr-code'}
          isExpired={false} downloadPNGLabel={t('downloadPNG')} downloadSVGLabel={t('downloadSVG')} />
      </div>
    </div>
  )
}