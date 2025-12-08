// Header (Navbar) bileşeni - Kurumsal ve Modern Tasarım
// Üst bar (iletişim + sosyal medya) + Ana header

'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import {
  Menu, X, QrCode, ChevronDown, User, LogOut, Settings, LayoutDashboard,
  Link as LinkIcon, Wifi, Mail, Phone, CreditCard, FileText, Calendar,
  MapPin, MessageCircle, Instagram, Twitter, Linkedin, Youtube, Facebook,
  Bitcoin, AppWindow, Sparkles, ArrowRight, Zap, Globe, Clock,
  Send, ExternalLink, Star, Shield, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui'
import LanguageSwitcher from './LanguageSwitcher'
import { Locale, pathnames } from '@/i18n/config'
import { getLocalizedPathname, getOriginalPathname } from '@/i18n/navigation'
import { trackWhatsAppClick, trackPhoneClick, trackEmailClick } from '@/components/analytics/GoogleAnalytics'

// Şirket iletişim bilgileri (Company contact information)
const contactInfo = {
  email: 'info@qrcodeshine.com',
  phone: '0537 510 2084',
  phoneRaw: '905375102084', // WhatsApp ve tel: için formatlanmış numara
  whatsapp: '905375102084'
}

// Sosyal medya linkleri
const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com', color: 'hover:text-sky-400' },
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com', color: 'hover:text-blue-500' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com', color: 'hover:text-pink-500' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com', color: 'hover:text-blue-400' },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com', color: 'hover:text-red-500' },
]

// QR tipleri kategorileri config - text çeviriden gelecek
const qrCategoriesConfig = [
  {
    key: 'popular',
    items: [
      { type: 'url', labelKey: 'url', icon: LinkIcon, color: 'bg-blue-500', descKey: 'linkToWebsite' },
      { type: 'vcard', labelKey: 'vcard', icon: CreditCard, color: 'bg-purple-500', descKey: 'digitalBusinessCard' },
      { type: 'wifi', labelKey: 'wifi', icon: Wifi, color: 'bg-green-500', descKey: 'shareWifi' },
      { type: 'text', labelKey: 'text', icon: FileText, color: 'bg-gray-500', descKey: 'anyTextContent' },
    ]
  },
  {
    key: 'communication',
    items: [
      { type: 'email', labelKey: 'email', icon: Mail, color: 'bg-red-500', descKey: 'preFilledEmail' },
      { type: 'phone', labelKey: 'phone', icon: Phone, color: 'bg-emerald-500', descKey: 'quickDial' },
      { type: 'sms', labelKey: 'sms', icon: MessageCircle, color: 'bg-blue-400', descKey: 'sendTextMessage' },
      { type: 'whatsapp', labelKey: 'whatsapp', icon: MessageCircle, color: 'bg-green-500', descKey: 'openWhatsApp' },
    ]
  },
  {
    key: 'socialMedia',
    items: [
      { type: 'instagram', labelKey: 'instagram', icon: Instagram, color: 'bg-gradient-to-br from-purple-500 to-pink-500', descKey: 'instagramProfile' },
      { type: 'twitter', labelKey: 'twitter', icon: Twitter, color: 'bg-sky-500', descKey: 'twitterProfile' },
      { type: 'linkedin', labelKey: 'linkedin', icon: Linkedin, color: 'bg-blue-600', descKey: 'professionalNetwork' },
      { type: 'youtube', labelKey: 'youtube', icon: Youtube, color: 'bg-red-600', descKey: 'youtubeChannel' },
      { type: 'facebook', labelKey: 'facebook', icon: Facebook, color: 'bg-blue-500', descKey: 'facebookPage' },
    ]
  },
  {
    key: 'other',
    items: [
      { type: 'event', labelKey: 'event', icon: Calendar, color: 'bg-orange-500', descKey: 'addToCalendar' },
      { type: 'location', labelKey: 'location', icon: MapPin, color: 'bg-red-500', descKey: 'gpsCoordinates' },
      { type: 'bitcoin', labelKey: 'bitcoin', icon: Bitcoin, color: 'bg-amber-500', descKey: 'cryptoPayment' },
      { type: 'app', labelKey: 'appStore', icon: AppWindow, color: 'bg-indigo-500', descKey: 'appDownload' },
    ]
  }
]

interface HeaderProps {
  user?: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  } | null
}

export default function Header({ user }: HeaderProps) {
  const t = useTranslations('common')
  const tHeader = useTranslations('header')
  const tQr = useTranslations('qrTypes')
  const pathname = usePathname()
  const currentLocale = useLocale() as Locale
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [qrMenuOpen, setQrMenuOpen] = useState(false)
  const [mobileQrMenuOpen, setMobileQrMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const qrMenuRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Dil değiştirme fonksiyonu (Language change handler)
  const handleLanguageChange = (newLocale: Locale) => {
    // Cookie'ye kaydet (1 yıl geçerli)
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`

    // Mevcut URL'i önce orijinal (İngilizce) pathname'e çevir
    // Örn: /ozellikler -> /features, /fiyatlandirma -> /pricing
    const currentPath = pathname || '/'
    const originalPath = getOriginalPathname(currentPath, currentLocale)

    // Sonra hedef dile çevir
    // Örn: TR seçildi -> /features -> /ozellikler
    // Örn: EN seçildi -> /features -> /features
    const newPath = getLocalizedPathname(originalPath, newLocale)

    window.location.href = newPath
  }

  // Yerelleştirilmiş link yardımcı fonksiyonu (Localized link helper)
  const localizedHref = (path: string) => getLocalizedPathname(path, currentLocale)

  // QR kategorilerini çevirilerle birleştir
  const qrCategories = qrCategoriesConfig.map(cat => ({
    name: tHeader(cat.key),
    items: cat.items.map(item => ({
      ...item,
      label: tQr(item.labelKey),
      desc: tHeader(item.descKey)
    }))
  }))

  // Aktif sayfa kontrolü - hem İngilizce hem Türkçe URL'leri kontrol et
  // (Active page check - check both English and Turkish URLs)
  const isActive = (path: string) => {
    const localizedPath = getLocalizedPathname(path, currentLocale)
    return pathname === path || pathname === localizedPath
  }
  const isQrPage = pathname?.startsWith('/qr-generator')

  // Scroll durumuna göre header stilini değiştir
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Menü dışına tıklandığında kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (qrMenuRef.current && !qrMenuRef.current.contains(event.target as Node)) {
        setQrMenuOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sayfa değiştiğinde tüm menüleri kapat (Close all menus on page change)
  useEffect(() => {
    setMobileMenuOpen(false)
    setMobileQrMenuOpen(false)
    setQrMenuOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  return (
    <>
      {/* === ÜST BAR - İletişim ve Sosyal Medya === */}
      <div className={`hidden lg:block bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white transition-all duration-300 ${
        scrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-10'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full text-xs">
            {/* Sol - İletişim Bilgileri - GA Event Tracking */}
            <div className="flex items-center gap-6">
              <a href={`mailto:${contactInfo.email}`} onClick={() => trackEmailClick('header_topbar')} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group">
                <Mail className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span>{contactInfo.email}</span>
              </a>
              <a href={`tel:+${contactInfo.phoneRaw}`} onClick={() => trackPhoneClick('header_topbar')} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group">
                <Phone className="w-3.5 h-3.5 text-green-400 group-hover:scale-110 transition-transform" />
                <span>{contactInfo.phone}</span>
              </a>
              <a href={`https://wa.me/${contactInfo.whatsapp}`} onClick={() => trackWhatsAppClick('header_topbar')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group">
                <svg className="w-3.5 h-3.5 text-green-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Sağ - Sosyal Medya + Dil */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 pr-4 border-r border-gray-700">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-1.5 text-gray-400 ${social.color} transition-all hover:scale-110`}
                    aria-label={social.name}
                  >
                    <social.icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Globe className="w-3.5 h-3.5" />
                <select
                  value={currentLocale}
                  onChange={(e) => handleLanguageChange(e.target.value as Locale)}
                  className="bg-transparent text-xs text-gray-300 border-none outline-none cursor-pointer"
                >
                  <option value="en" className="bg-gray-900">English</option>
                  <option value="tr" className="bg-gray-900">Türkçe</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === ANA HEADER === */}
      <header className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-gray-900/5 border-b border-gray-100'
          : 'bg-white border-b border-gray-100'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 lg:h-[70px]">
            {/* Logo ve marka - Kurumsal */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-3 group">
                {/* Logo Icon */}
                <div className="relative">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 group-hover:scale-105 transition-all duration-300">
                    <QrCode className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  {/* Status indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </div>
                {/* Brand Text */}
                <div className="flex flex-col">
                  <span className="text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    QRCode<span className="text-blue-600 group-hover:text-gray-900 transition-colors">Shine</span>
                  </span>
                  <span className="text-[9px] lg:text-[10px] text-gray-400 font-medium tracking-[0.15em] uppercase -mt-1">
                    {tHeader('professionalQR')}
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              <Link
                href="/"
                className={`relative px-4 py-2.5 rounded-lg transition-all font-medium text-sm ${
                  isActive('/')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {t('home')}
            </Link>

            {/* QR Types Mega Menu */}
            <div className="relative" ref={qrMenuRef}>
              <button
                onClick={() => setQrMenuOpen(!qrMenuOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium text-sm ${
                  qrMenuOpen || isQrPage
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <QrCode className="w-4 h-4" />
                QR Types
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${qrMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega Menu Dropdown */}
              {qrMenuOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-[720px] bg-white rounded-2xl shadow-2xl shadow-gray-200/60 border border-gray-100 overflow-hidden z-50">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Choose Your QR Code Type
                    </h3>
                    <p className="text-blue-100 text-sm mt-1">19+ professional QR code solutions for every need</p>
                  </div>

                  {/* Content */}
                  <div className="p-6 grid grid-cols-2 gap-6">
                    {qrCategories.map((category) => (
                      <div key={category.name}>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full" />
                          {category.name}
                        </h4>
                        <div className="space-y-1">
                          {category.items.map((item) => (
                            <Link
                              key={item.type}
                              href={`/qr-generator/${item.type}`}
                              onClick={() => setQrMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all group"
                            >
                              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all`}>
                                <item.icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">{item.label}</span>
                                <span className="text-xs text-gray-400 block">{item.desc}</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-all" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                      <span className="text-sm text-gray-600">Trusted by 10M+ users</span>
                    </div>
                    <Link
                      href="/qr-generator"
                      onClick={() => setQrMenuOpen(false)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all"
                    >
                      {tHeader('viewAllTypes')}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href={localizedHref('/features')}
              className={`px-4 py-2.5 rounded-lg transition-all font-medium text-sm ${
                isActive('/features')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {t('features')}
            </Link>
            <Link
              href={localizedHref('/pricing')}
              className={`px-4 py-2.5 rounded-lg transition-all font-medium text-sm ${
                isActive('/pricing')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {t('pricing')}
            </Link>
            <Link
              href={localizedHref('/contact')}
              className={`px-4 py-2.5 rounded-lg transition-all font-medium text-sm ${
                isActive('/contact')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {t('contact')}
            </Link>
          </div>

          {/* Sağ taraf - Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              // Giriş yapmış kullanıcı menüsü - Modern
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-50 transition-all group"
                >
                  {user.image ? (
                    <img src={user.image} alt="" className="w-9 h-9 rounded-xl object-cover ring-2 ring-gray-100 group-hover:ring-blue-100 transition-all" />
                  ) : (
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all">
                      <span className="text-white text-sm font-bold">
                        {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-700">{user.name?.split(' ')[0] || 'User'}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{tHeader('account')}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menü - Dashboard linkleri ile genişletilmiş */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    {/* Üst gradyan */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                      <p className="font-semibold text-gray-900">{user.name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    {/* Dashboard Menü Öğeleri */}
                    <div className="py-2 border-b border-gray-100">
                      <p className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('dashboard')}</p>
                      <Link
                        href={localizedHref('/dashboard')}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all group"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium">{t('dashboard')}</span>
                      </Link>
                      <Link
                        href={localizedHref('/dashboard/qr')}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all group"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                          <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium">{tHeader('myQRCodes') || 'QR Kodlarım'}</span>
                      </Link>
                      <Link
                        href={localizedHref('/dashboard/analytics')}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all group"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                          <Zap className="w-3.5 h-3.5 text-green-600" />
                        </div>
                        <span className="text-sm font-medium">{tHeader('analytics') || 'Analizler'}</span>
                      </Link>
                      <Link
                        href={localizedHref('/dashboard/subscription')}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all group"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium">{tHeader('subscription') || 'Abonelik'}</span>
                      </Link>
                    </div>

                    {/* Ayarlar */}
                    <div className="py-2">
                      <Link
                        href={localizedHref('/settings')}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-all group"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                          <Settings className="w-3.5 h-3.5 text-gray-600" />
                        </div>
                        <span className="text-sm font-medium">{t('settings')}</span>
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all group"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                            <User className="w-3.5 h-3.5 text-purple-600" />
                          </div>
                          <span className="text-sm font-medium">{t('admin')}</span>
                        </Link>
                      )}
                    </div>

                    {/* Çıkış */}
                    <div className="border-t border-gray-100 pt-2 px-2">
                      <form action="/auth/signout" method="POST">
                        <button
                          type="submit"
                          className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 w-full rounded-lg transition-all group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                            <LogOut className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm font-medium">{t('logout')}</span>
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Giriş yapmamış kullanıcı
              <div className="flex items-center gap-2">
                <Link href={localizedHref('/auth/login')}>
                  <button className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm rounded-lg hover:bg-gray-100 transition-all">
                    {t('login')}
                  </button>
                </Link>
                <Link href={localizedHref('/auth/register')}>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg hover:opacity-90 transition-all">
                    {t('getStarted')}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menü butonu */}
          <div className="lg:hidden flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2.5 rounded-lg border transition-all ${
                mobileMenuOpen
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menü */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Üst gradyan line */}
          <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />

          <div className="px-4 py-4 space-y-1">
            <Link
              href="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive('/')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isActive('/') ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <QrCode className="w-4 h-4" />
              </div>
              {t('home')}
            </Link>

            {/* Mobile QR Types Accordion - Enhanced */}
            <div className="rounded-xl overflow-hidden">
              <button
                onClick={() => setMobileQrMenuOpen(!mobileQrMenuOpen)}
                className={`flex items-center justify-between w-full px-4 py-3 font-medium transition-all rounded-xl ${
                  mobileQrMenuOpen || isQrPage
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    mobileQrMenuOpen || isQrPage ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  QR Types
                </span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${mobileQrMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {mobileQrMenuOpen && (
                <div className="mt-2 space-y-4 px-3 py-4 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-100">
                  {qrCategories.map((category) => (
                    <div key={category.name}>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
                        <div className="w-1 h-4 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />
                        {category.name}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {category.items.map((item) => (
                          <Link
                            key={item.type}
                            href={`/qr-generator/${item.type}`}
                            onClick={() => { setMobileMenuOpen(false); setMobileQrMenuOpen(false); }}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white hover:shadow-md text-gray-700 transition-all border border-transparent hover:border-gray-100"
                          >
                            <div className={`w-7 h-7 rounded-lg ${item.color} flex items-center justify-center shadow-sm`}>
                              <item.icon className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="truncate text-xs font-semibold">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              href={localizedHref('/features')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive('/features')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isActive('/features') ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Zap className="w-4 h-4" />
              </div>
              {t('features')}
            </Link>
            <Link
              href={localizedHref('/pricing')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive('/pricing')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isActive('/pricing') ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <CreditCard className="w-4 h-4" />
              </div>
              {t('pricing')}
            </Link>
            <Link
              href={localizedHref('/contact')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive('/contact')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isActive('/contact') ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Mail className="w-4 h-4" />
              </div>
              {t('contact')}
            </Link>

            {user ? (
              <div className="pt-4 mt-4 border-t border-gray-100">
                {/* Kullanıcı bilgisi */}
                <div className="px-4 py-3 bg-gray-50 rounded-xl mb-3">
                  <p className="font-semibold text-gray-900">{user.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                {/* Dashboard linki */}
                <Link
                  href={localizedHref('/dashboard')}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <LayoutDashboard className="w-4 h-4 text-blue-600" />
                  </div>
                  {t('dashboard')}
                </Link>
                {/* Çıkış butonu */}
                <form action="/auth/signout" method="POST" className="mt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-red-600 hover:bg-red-50 w-full"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <LogOut className="w-4 h-4" />
                    </div>
                    {t('logout')}
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex gap-3 pt-4 mt-4 border-t border-gray-100">
                <Link href={localizedHref('/auth/login')} className="flex-1">
                  <button className="w-full py-3 text-gray-700 font-semibold text-sm rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">
                    {t('login')}
                  </button>
                </Link>
                <Link href={localizedHref('/auth/register')} className="flex-1">
                  <button className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    {t('register')}
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
    </>
  )
}

