'use client'

// Featured Toggle Component
// QR kodları ana sayfada gösterme/gizleme toggle butonu
// (Toggle button to show/hide QR codes on homepage)

import { useState } from 'react'
import { Star } from 'lucide-react'

interface FeaturedToggleProps {
  qrId: string
  initialFeatured: boolean
}

export default function FeaturedToggle({ qrId, initialFeatured }: FeaturedToggleProps) {
  const [isFeatured, setIsFeatured] = useState(initialFeatured)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/qr/${qrId}/featured`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !isFeatured })
      })

      if (response.ok) {
        setIsFeatured(!isFeatured)
      }
    } catch (error) {
      console.error('Featured toggle error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`p-2 rounded-lg transition-all ${
        isFeatured
          ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isFeatured ? 'Ana sayfadan kaldır' : 'Ana sayfaya ekle'}
    >
      <Star className={`w-4 h-4 ${isFeatured ? 'fill-amber-500' : ''}`} />
    </button>
  )
}

