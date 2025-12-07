// Hesap Silme Butonu - Client Component
// Delete Account Button - Self-delete functionality

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle, X } from 'lucide-react'

export default function DeleteAccountButton() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [confirmText, setConfirmText] = useState('')

  const handleDelete = async () => {
    if (confirmText !== 'SİL') {
      setError('Lütfen "SİL" yazarak onaylayın')
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Bir hata oluştu')
        return
      }

      // Başarılı - ana sayfaya yönlendir
      router.push('/')
      router.refresh()
    } catch {
      setError('Bir hata oluştu')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      {/* Hesap Silme Butonu */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Hesabımı Sil
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Hesabı Sil</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h4 className="text-center text-lg font-semibold text-gray-900 mb-2">
                Hesabınızı silmek istediğinize emin misiniz?
              </h4>
              <p className="text-center text-sm text-gray-500 mb-6">
                Bu işlem geri alınamaz. Tüm QR kodlarınız, verileriniz ve hesap bilgileriniz kalıcı olarak silinecektir.
              </p>

              {/* Onay Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Onaylamak için <span className="font-bold text-red-600">SİL</span> yazın:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="SİL"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-4 bg-gray-50">
              <button
                onClick={() => {
                  setShowModal(false)
                  setConfirmText('')
                  setError('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={isDeleting}
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting || confirmText !== 'SİL'}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Siliniyor...' : 'Hesabımı Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

