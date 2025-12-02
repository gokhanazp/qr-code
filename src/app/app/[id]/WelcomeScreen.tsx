'use client'

// Welcome Screen - Logo büyüme animasyonu ile splash screen
// Sayfa yüklenirken logo büyüyor, sonra fade out ile kaybolup içerik görünüyor

import { useState, useEffect } from 'react'

interface WelcomeScreenProps {
  logo?: string
  primaryColor: string
  secondaryColor: string
}

export default function WelcomeScreen({ logo, primaryColor, secondaryColor }: WelcomeScreenProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    // Logo büyüme animasyonu tamamlandıktan sonra fade out başlat
    const animationTimer = setTimeout(() => {
      setIsAnimating(false)
    }, 1500) // 1.5 saniye logo animasyonu

    // Splash screen'i tamamen kaldır
    const hideTimer = setTimeout(() => {
      setIsVisible(false)
    }, 2000) // 2 saniye toplam süre

    return () => {
      clearTimeout(animationTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ background: `linear-gradient(to bottom, ${secondaryColor}, ${primaryColor})` }}
    >
      {/* Logo Container - Büyüme animasyonu */}
      <div
        className={`transform transition-all duration-1000 ease-out ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
        }`}
        style={{
          animation: isAnimating ? 'logoGrow 1.5s ease-out forwards' : 'none'
        }}
      >
        {/* Logo - saydam arka plan, logoya göre boyut */}
        {logo ? (
          <img
            src={logo}
            alt="App Logo"
            className="max-w-[200px] max-h-[200px] object-contain"
          />
        ) : (
          <span className="text-8xl">📱</span>
        )}
        
        {/* Loading indicator */}
        <div className="mt-6 flex justify-center">
          <div 
            className="w-8 h-1 rounded-full animate-pulse"
            style={{ backgroundColor: secondaryColor }}
          />
        </div>
      </div>

      {/* CSS Keyframes için style tag */}
      <style jsx>{`
        @keyframes logoGrow {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

