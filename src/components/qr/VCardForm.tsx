// vCard Özel Tasarım Formu (vCard Custom Design Form)
// Renk paleti, bölümler ve telefon önizlemesi ile özel vCard oluşturma

'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Palette,
  User,
  Briefcase,
  Phone,
  Mail,
  Globe,
  MapPin,
  ImagePlus,
  ArrowLeftRight,
  Download,
  QrCode,
  ImageIcon,
} from 'lucide-react'
import clsx from 'clsx'
import { useTranslations } from 'next-intl'
import VCardPhonePreview from './VCardPhonePreview'
import QRPreview from './QRPreview'
import VCardPhotoUpload from './VCardPhotoUpload'
import QRLogoUploader from './QRLogoUploader'
import { createClient } from '@/lib/supabase/client'

// Renk paletleri (Color palettes)
const colorPalettes = [
  { id: 1, primary: '#527AC9', secondary: '#7EC09F', name: 'Ocean' },
  { id: 2, primary: '#374151', secondary: '#6B7280', name: 'Gray' },
  { id: 3, primary: '#3B82F6', secondary: '#93C5FD', name: 'Blue' },
  { id: 4, primary: '#8B5CF6', secondary: '#C4B5FD', name: 'Purple' },
  { id: 5, primary: '#10B981', secondary: '#6EE7B7', name: 'Green' },
  { id: 6, primary: '#F59E0B', secondary: '#FCD34D', name: 'Yellow' },
  { id: 7, primary: '#EF4444', secondary: '#FCA5A5', name: 'Red' },
  { id: 8, primary: '#EC4899', secondary: '#F9A8D4', name: 'Pink' },
]

interface VCardFormProps {
  data: Record<string, string>
  onChange: (data: Record<string, string>) => void
}

export default function VCardForm({ data, onChange }: VCardFormProps) {
  // Çeviri hook'u (Translation hook)
  const t = useTranslations('generator')

  // Açık/kapalı bölümler (Collapsible sections)
  const [openSections, setOpenSections] = useState({
    design: true,
    personal: true,
    work: false,
    contact: false,
    address: false,
    logo: false,
  })

  // Seçili palet (Selected palette)
  const [selectedPalette, setSelectedPalette] = useState(colorPalettes[0])

  // Base URL için state (client-side only)
  const [baseUrl, setBaseUrl] = useState('')

  // Authentication durumu (Authentication state)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Logo durumu (Logo state)
  const [logo, setLogo] = useState<string | null>(null)
  const [logoSize, setLogoSize] = useState(20)

  // Client tarafında base URL'yi ayarla
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin)
    }
  }, [])

  // Kullanıcı giriş durumunu kontrol et (Check user authentication)
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()
  }, [])

  // Bölüm aç/kapat (Toggle section)
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Veri güncelle (Update data)
  const updateField = (key: string, value: string) => {
    onChange({ ...data, [key]: value })
  }

  // Palet seç (Select palette)
  const selectPalette = (palette: typeof colorPalettes[0]) => {
    setSelectedPalette(palette)
    onChange({
      ...data,
      primaryColor: palette.primary,
      secondaryColor: palette.secondary
    })
  }

  // Renkleri değiştir (Swap colors)
  const swapColors = () => {
    const newPrimary = selectedPalette.secondary
    const newSecondary = selectedPalette.primary
    setSelectedPalette({ ...selectedPalette, primary: newPrimary, secondary: newSecondary })
    onChange({ ...data, primaryColor: newPrimary, secondaryColor: newSecondary })
  }

  // Debounced veri (Debounced data) - Performans için (For performance)
  const [debouncedData, setDebouncedData] = useState(data)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedData(data)
    }, 400) // 400ms gecikme (delay)

    return () => clearTimeout(handler)
  }, [data])

  // Landing page URL'si - memoized (Generate landing page URL - memoized)
  const qrContent = useMemo(() => {
    if (!baseUrl) return ''

    const vCardData = {
      ...debouncedData,
      primaryColor: selectedPalette.primary,
      secondaryColor: selectedPalette.secondary,
    }

    try {
      // JSON'u URL-safe base64'e encode et (Encode JSON to URL-safe base64)
      const jsonStr = JSON.stringify(vCardData)
      // Önce UTF-8 encode, sonra base64
      const base64 = btoa(unescape(encodeURIComponent(jsonStr)))
      // URL-safe karakterlere çevir: + -> -, / -> _, = -> kaldır
      const urlSafe = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      return `${baseUrl}/v/${urlSafe}`
    } catch {
      return ''
    }
  }, [debouncedData, selectedPalette, baseUrl])

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Sol Panel - Form Alanları (Left Panel - Form Fields) */}
      <div className="space-y-4">
        {/* Tasarım Bölümü (Design Section) */}
        <CollapsibleSection
          icon={<Palette className="w-5 h-5" />}
          title={t('design')}
          subtitle={t('designSubtitle')}
          isOpen={openSections.design}
          onToggle={() => toggleSection('design')}
        >
          {/* Renk Paleti (Color Palette) */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">{t('colorPalette')}</label>
            <div className="flex flex-wrap gap-3">
              {colorPalettes.map((palette) => (
                <button
                  key={palette.id}
                  onClick={() => selectPalette(palette)}
                  className={clsx(
                    'w-16 h-10 rounded-lg overflow-hidden border-2 transition-all',
                    selectedPalette.id === palette.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="h-full flex">
                    <div className="w-1/2 h-full" style={{ backgroundColor: palette.primary }} />
                    <div className="w-1/2 h-full" style={{ backgroundColor: palette.secondary }} />
                  </div>
                </button>
              ))}
            </div>

            {/* Primary & Secondary Color Pickers */}
            <div className="flex items-center gap-4 mt-4">
              <ColorPicker
                label={t('primaryColor')}
                color={selectedPalette.primary}
                onChange={(color) => {
                  setSelectedPalette({ ...selectedPalette, primary: color })
                  updateField('primaryColor', color)
                }}
              />

              <button
                onClick={swapColors}
                className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors mt-6"
              >
                <ArrowLeftRight className="w-5 h-5" />
              </button>

              <ColorPicker
                label={t('secondaryColor')}
                color={selectedPalette.secondary}
                onChange={(color) => {
                  setSelectedPalette({ ...selectedPalette, secondary: color })
                  updateField('secondaryColor', color)
                }}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Kişisel Bilgiler (Personal Information) */}
        <CollapsibleSection
          icon={<User className="w-5 h-5" />}
          title={t('personalInfo')}
          subtitle={t('personalInfoSubtitle')}
          isOpen={openSections.personal}
          onToggle={() => toggleSection('personal')}
        >
          <PersonalInfoFields data={data} onChange={updateField} t={t} />
        </CollapsibleSection>

        {/* İş Bilgileri (Work Information) */}
        <CollapsibleSection
          icon={<Briefcase className="w-5 h-5" />}
          title={t('workInfo')}
          subtitle={t('workInfoSubtitle')}
          isOpen={openSections.work}
          onToggle={() => toggleSection('work')}
        >
          <WorkInfoFields data={data} onChange={updateField} t={t} />
        </CollapsibleSection>

        {/* İletişim Bilgileri (Contact Information) */}
        <CollapsibleSection
          icon={<Phone className="w-5 h-5" />}
          title={t('contactInfo')}
          subtitle={t('contactInfoSubtitle')}
          isOpen={openSections.contact}
          onToggle={() => toggleSection('contact')}
        >
          <ContactInfoFields data={data} onChange={updateField} t={t} />
        </CollapsibleSection>

        {/* Adres Bilgileri (Address Information) */}
        <CollapsibleSection
          icon={<MapPin className="w-5 h-5" />}
          title={t('address')}
          subtitle={t('addressSubtitle')}
          isOpen={openSections.address}
          onToggle={() => toggleSection('address')}
        >
          <AddressFields data={data} onChange={updateField} t={t} />
        </CollapsibleSection>

        {/* Logo Bölümü (Logo Section) */}
        <CollapsibleSection
          icon={<ImageIcon className="w-5 h-5" />}
          title={t('logo')}
          subtitle={t('logoSubtitle')}
          isOpen={openSections.logo}
          onToggle={() => toggleSection('logo')}
        >
          <QRLogoUploader
            logo={logo}
            logoSize={logoSize}
            onLogoChange={setLogo}
            onLogoSizeChange={setLogoSize}
          />
        </CollapsibleSection>
      </div>

      {/* Sağ Panel - Önizlemeler (Right Panel - Previews) */}
      <div className="space-y-6">
        {/* Telefon Önizleme (Phone Preview) */}
        <div className="flex justify-center">
          <VCardPhonePreview
            data={data}
            primaryColor={selectedPalette.primary}
            secondaryColor={selectedPalette.secondary}
          />
        </div>

        {/* QR Kod Önizleme Kartı (QR Code Preview Card) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          {/* Header */}
          <div
            className="px-6 py-4"
            style={{
              background: `linear-gradient(135deg, ${selectedPalette.primary} 0%, ${selectedPalette.secondary} 100%)`
            }}
          >
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              {t('yourQRCode')}
            </h3>
          </div>

          {/* QR Kod (QR Code) */}
          <div className="p-6">
            {qrContent ? (
              <QRPreview
                content={qrContent}
                foregroundColor="#000000"
                backgroundColor="#ffffff"
                size={200}
                errorCorrection="H"
                logo={logo}
                logoSize={logoSize}
                isAuthenticated={isAuthenticated}
              />
            ) : (
              <div className="flex items-center justify-center h-48 bg-gray-50 rounded-xl">
                <p className="text-gray-400">{t('loadingQRCode')}</p>
              </div>
            )}

            {/* Bilgi metni (Info text) */}
            <p className="text-sm text-gray-500 text-center mt-4">
              {t('scanToView')}
            </p>

            {/* Landing page URL (önizleme için) - Preview URL */}
            {qrContent && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1 font-medium">{t('previewUrl')}</p>
                <div className="flex items-center gap-2">
                  <a
                    href={qrContent}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-xs text-blue-600 hover:underline break-all line-clamp-2"
                  >
                    {qrContent}
                  </a>
                  <button
                    onClick={() => window.open(qrContent, '_blank')}
                    className="flex-shrink-0 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('open')}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                  {t('clickToPreview')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Katlanabilir Bölüm Bileşeni (Collapsible Section Component)
interface CollapsibleSectionProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

function CollapsibleSection({ icon, title, subtitle, isOpen, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
            {icon}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isOpen && <div className="px-5 pb-5 pt-2">{children}</div>}
    </div>
  )
}

// Renk Seçici Bileşeni (Color Picker Component)
interface ColorPickerProps {
  label: string
  color: string
  onChange: (color: string) => void
}

function ColorPicker({ label, color, onChange }: ColorPickerProps) {
  return (
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0"
        />
        <input
          type="text"
          value={color.toUpperCase()}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-sm font-mono text-gray-700 bg-transparent border-0 focus:ring-0 uppercase"
        />
      </div>
    </div>
  )
}

// Form Input Bileşeni (Form Input Component)
interface FormInputProps {
  icon?: React.ReactNode
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
}

function FormInput({ icon, label, placeholder, value, onChange, type = 'text', required }: FormInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={clsx(
            'w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all',
            icon && 'pl-11'
          )}
        />
      </div>
    </div>
  )
}

// Kişisel Bilgi Alanları (Personal Information Fields)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PersonalInfoFields({ data, onChange, t }: { data: Record<string, string>; onChange: (key: string, value: string) => void; t: any }) {
  return (
    <div className="space-y-4">
      {/* Profil Resmi - Supabase Storage Entegrasyonlu (Profile Image - Supabase Storage Integration) */}
      <VCardPhotoUpload
        value={data.photo || ''}
        onChange={(url) => onChange('photo', url)}
      />

      {/* Ad Soyad (Name & Surname) */}
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          icon={<User className="w-4 h-4" />}
          label={t('name')}
          placeholder="John"
          value={data.firstName || ''}
          onChange={(v) => onChange('firstName', v)}
          required
        />
        <FormInput
          label={t('surname')}
          placeholder="Doe"
          value={data.lastName || ''}
          onChange={(v) => onChange('lastName', v)}
        />
      </div>
    </div>
  )
}

// İş Bilgi Alanları (Work Information Fields)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function WorkInfoFields({ data, onChange, t }: { data: Record<string, string>; onChange: (key: string, value: string) => void; t: any }) {
  return (
    <div className="space-y-4">
      <FormInput
        icon={<Briefcase className="w-4 h-4" />}
        label={t('company')}
        placeholder="Acme Inc."
        value={data.company || ''}
        onChange={(v) => onChange('company', v)}
      />
      <FormInput
        label={t('jobTitle')}
        placeholder="Software Engineer"
        value={data.title || ''}
        onChange={(v) => onChange('title', v)}
      />
    </div>
  )
}

// İletişim Bilgi Alanları (Contact Information Fields)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ContactInfoFields({ data, onChange, t }: { data: Record<string, string>; onChange: (key: string, value: string) => void; t: any }) {
  return (
    <div className="space-y-4">
      <FormInput
        icon={<Phone className="w-4 h-4" />}
        label={t('mobilePhone')}
        placeholder="+90 555 123 4567"
        value={data.mobile || ''}
        onChange={(v) => onChange('mobile', v)}
        type="tel"
      />
      <FormInput
        icon={<Phone className="w-4 h-4" />}
        label={t('workPhone')}
        placeholder="+90 555 987 6543"
        value={data.workPhone || ''}
        onChange={(v) => onChange('workPhone', v)}
        type="tel"
      />
      <FormInput
        icon={<Mail className="w-4 h-4" />}
        label={t('email')}
        placeholder="ahmet@ornek.com"
        value={data.email || ''}
        onChange={(v) => onChange('email', v)}
        type="email"
      />
      <FormInput
        icon={<Globe className="w-4 h-4" />}
        label={t('website')}
        placeholder="https://ornek.com"
        value={data.website || ''}
        onChange={(v) => onChange('website', v)}
        type="url"
      />
    </div>
  )
}

// Adres Alanları (Address Fields)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AddressFields({ data, onChange, t }: { data: Record<string, string>; onChange: (key: string, value: string) => void; t: any }) {
  return (
    <div className="space-y-4">
      <FormInput
        icon={<MapPin className="w-4 h-4" />}
        label={t('streetAddress')}
        placeholder="Atatürk Cad. No: 123"
        value={data.street || ''}
        onChange={(v) => onChange('street', v)}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label={t('city')}
          placeholder="İstanbul"
          value={data.city || ''}
          onChange={(v) => onChange('city', v)}
        />
        <FormInput
          label={t('stateProvince')}
          placeholder="Kadıköy"
          value={data.state || ''}
          onChange={(v) => onChange('state', v)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label={t('zipPostalCode')}
          placeholder="34710"
          value={data.zip || ''}
          onChange={(v) => onChange('zip', v)}
        />
        <FormInput
          label={t('country')}
          placeholder="Türkiye"
          value={data.country || ''}
          onChange={(v) => onChange('country', v)}
        />
      </div>
    </div>
  )
}

