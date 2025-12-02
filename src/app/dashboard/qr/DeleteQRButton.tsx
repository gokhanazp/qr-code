'use client'

// QR Kod Silme Butonu - Client Component
// Onay modalı ile güvenli silme işlemi

import { useState } from 'react'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DeleteQRButtonProps {
  qrId: string
  qrName?: string
  variant?: 'icon' | 'full' // icon: sadece ikon, full: ikon + yazı
  onDeleted?: () => void
}

export default function DeleteQRButton({ 
  qrId, 
  qrName, 
  variant = 'icon',
  onDeleted 
}: DeleteQRButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch(`/api/qr/${qrId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Silme işlemi başarısız')
      }

      setIsOpen(false)

      // Callback varsa çağır, yoksa QR listesine yönlendir
      if (onDeleted) {
        onDeleted()
      } else {
        // Detay sayfasındaysak listeye yönlendir, değilse sayfayı yenile
        router.push('/dashboard/qr')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      {/* Silme Butonu */}
      {variant === 'icon' ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Sil"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Sil
        </button>
      )}

      {/* Onay Modalı */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => !isDeleting && setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">QR Kodu Sil</h3>
                <p className="text-sm text-gray-500">Bu işlem geri alınamaz</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              <strong>&quot;{qrName || 'Bu QR kod'}&quot;</strong> kalıcı olarak silinecek. 
              Bu QR kodu taratan kullanıcılar artık içeriğe erişemeyecek.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Siliniyor...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Evet, Sil
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

