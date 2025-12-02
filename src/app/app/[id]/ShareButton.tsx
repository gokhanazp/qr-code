'use client'

// ShareButton - Sosyal medya paylaşım butonu bileşeni
// Facebook, Twitter, WhatsApp, LinkedIn ve link kopyalama

import { Share2, X, Facebook, Twitter, Linkedin, Link2, Check } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface ShareButtonProps {
  appName: string
  title: string
  secondaryColor?: string
}

export default function ShareButton({ appName, title, secondaryColor = '#128f5c' }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Dışarı tıklandığında menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // URL'yi panoya kopyala
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setIsOpen(false)
      }, 1500)
    } catch {
      alert(`Link: ${window.location.href}`)
    }
  }

  // Paylaşım URL'leri
  const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''
  const shareTitle = encodeURIComponent(appName || 'App Download')
  const shareText = encodeURIComponent(title || 'Download our amazing app!')

  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-[#1877F2] hover:bg-[#166FE5]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-[#1DA1F2] hover:bg-[#1A94DA]',
      url: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`
    },
    {
      name: 'WhatsApp',
      icon: () => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      color: 'bg-[#25D366] hover:bg-[#20BD5A]',
      url: `https://wa.me/?text=${shareText}%20${shareUrl}`
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-[#0A66C2] hover:bg-[#095196]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`
    }
  ]

  return (
    <div className="absolute top-4 right-4" ref={menuRef}>
      {/* Ana Paylaş Butonu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-11 h-11 rounded-full flex items-center justify-center text-white hover:opacity-90 transition-all active:scale-95 shadow-lg"
        style={{ backgroundColor: secondaryColor }}
        aria-label="Paylaş"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
      </button>

      {/* Sosyal Medya Menüsü */}
      {isOpen && (
        <div className="absolute top-14 right-0 bg-white rounded-2xl shadow-2xl p-3 min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-xs font-semibold text-gray-500 mb-2 px-2">Paylaş</p>

          {/* Sosyal Medya Butonları */}
          <div className="space-y-1.5">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-white text-sm font-medium transition-all ${social.color}`}
                onClick={() => setIsOpen(false)}
              >
                <social.icon className="w-5 h-5" />
                {social.name}
              </a>
            ))}
          </div>

          {/* Ayırıcı Çizgi */}
          <div className="border-t border-gray-200 my-2" />

          {/* Link Kopyala */}
          <button
            onClick={copyLink}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-gray-700 text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-green-600">Kopyalandı!</span>
              </>
            ) : (
              <>
                <Link2 className="w-5 h-5" />
                Linki Kopyala
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

