'use client'

// Sipariş Durumu Değiştirme Komponenti
// (Order Status Change Component)

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, XCircle, Loader2, MoreVertical } from 'lucide-react'

interface OrderStatusButtonProps {
  orderId: string
  currentStatus: string
}

export default function OrderStatusButton({ orderId, currentStatus }: OrderStatusButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error
      
      // Sayfayı yenile (Refresh page)
      window.location.reload()
    } catch (error) {
      console.error('Durum güncelleme hatası:', error)
      alert('Durum güncellenemedi')
    } finally {
      setLoading(false)
      setIsOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="p-2">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Overlay - tıklandığında menüyü kapat */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menü */}
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {currentStatus !== 'completed' && (
              <button
                onClick={() => handleStatusChange('completed')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50"
              >
                <CheckCircle className="w-4 h-4" />
                Tamamlandı Olarak İşaretle
              </button>
            )}
            {currentStatus !== 'cancelled' && (
              <button
                onClick={() => handleStatusChange('cancelled')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4" />
                İptal Et
              </button>
            )}
            {currentStatus !== 'pending' && (
              <button
                onClick={() => handleStatusChange('pending')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50"
              >
                <Loader2 className="w-4 h-4" />
                Beklemede Olarak İşaretle
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

