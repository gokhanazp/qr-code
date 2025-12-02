'use client'

// Admin QR Code Management Actions
// Aktif/Pasif toggle ve süre uzatma kontrolü

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Power,
  Clock,
  Plus,
  Minus,
  Infinity,
  Calendar,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface QRManageActionsProps {
  qrId: string
  isActive: boolean
  expiresAt: string | null
}

export default function QRManageActions({ qrId, isActive, expiresAt }: QRManageActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeState, setActiveState] = useState(isActive)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [extendDays, setExtendDays] = useState(7)
  const [reduceDays, setReduceDays] = useState(7)
  const [showReduceModal, setShowReduceModal] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Aktif/Pasif değiştir (Toggle active/inactive)
  const toggleActive = async () => {
    setLoading(true)
    setMessage(null)
    
    try {
      const res = await fetch(`/api/admin/qr/${qrId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !activeState })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setActiveState(!activeState)
        setMessage({ type: 'success', text: `QR kod ${!activeState ? 'aktif' : 'pasif'} yapıldı` })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: data.error || 'Bir hata oluştu' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Bağlantı hatası' })
    } finally {
      setLoading(false)
    }
  }

  // Süre uzat (Extend duration)
  const extendDuration = async (days: number) => {
    setLoading(true)
    setMessage(null)
    
    try {
      const res = await fetch(`/api/admin/qr/${qrId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extend_days: days })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setMessage({ type: 'success', text: `Süre ${days} gün uzatıldı` })
        setShowExtendModal(false)
        router.refresh()
      } else {
        setMessage({ type: 'error', text: data.error || 'Bir hata oluştu' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Bağlantı hatası' })
    } finally {
      setLoading(false)
    }
  }

  // Süre kısalt (Reduce duration)
  const reduceDuration = async (days: number) => {
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/admin/qr/${qrId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reduce_days: days })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: `Süre ${days} gün kısaltıldı` })
        setShowReduceModal(false)
        router.refresh()
      } else {
        setMessage({ type: 'error', text: data.error || 'Bir hata oluştu' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Bağlantı hatası' })
    } finally {
      setLoading(false)
    }
  }

  // Sınırsız yap (Make unlimited)
  const makeUnlimited = async () => {
    setLoading(true)
    setMessage(null)
    
    try {
      const res = await fetch(`/api/admin/qr/${qrId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ make_unlimited: true })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'QR kod sınırsız yapıldı' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: data.error || 'Bir hata oluştu' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Bağlantı hatası' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Power className="w-5 h-5" />
        QR Kod Yönetimi
      </h2>

      {/* Mesaj gösterimi (Message display) */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {/* Aktif/Pasif Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Durum</p>
            <p className="text-sm text-gray-500">
              QR kodu {activeState ? 'aktif' : 'pasif'} durumda
            </p>
          </div>
          <button
            onClick={toggleActive}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              activeState ? 'bg-green-500' : 'bg-gray-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                activeState ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Süre Yönetimi (Duration Management) */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-medium text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Süre Yönetimi
              </p>
              <p className="text-sm text-gray-500">
                {expiresAt
                  ? `Son kullanma: ${new Date(expiresAt).toLocaleDateString('tr-TR')}`
                  : 'Sınırsız'
                }
              </p>
            </div>
          </div>

          {/* Süre Uzatma (Extend Duration) */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2 font-medium">Süre Uzat</p>
            <div className="flex flex-wrap gap-2">
              {[7, 14, 30, 90].map((days) => (
                <button
                  key={`extend-${days}`}
                  onClick={() => extendDuration(days)}
                  disabled={loading}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-50 text-green-600
                           hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Plus className="w-3 h-3" />
                  {days} gün
                </button>
              ))}
            </div>
          </div>

          {/* Süre Kısaltma (Reduce Duration) */}
          {expiresAt && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2 font-medium">Süre Kısalt</p>
              <div className="flex flex-wrap gap-2">
                {[7, 14, 30, 90].map((days) => (
                  <button
                    key={`reduce-${days}`}
                    onClick={() => reduceDuration(days)}
                    disabled={loading}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-600
                             hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Minus className="w-3 h-3" />
                    {days} gün
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Özel Süre ve Sınırsız (Custom Duration & Unlimited) */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => { setShowExtendModal(!showExtendModal); setShowReduceModal(false); }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700
                       hover:bg-green-200 rounded-lg transition-colors"
            >
              <Plus className="w-3 h-3" />
              Özel Uzat
            </button>
            {expiresAt && (
              <button
                onClick={() => { setShowReduceModal(!showReduceModal); setShowExtendModal(false); }}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700
                         hover:bg-red-200 rounded-lg transition-colors"
              >
                <Minus className="w-3 h-3" />
                Özel Kısalt
              </button>
            )}
            <button
              onClick={makeUnlimited}
              disabled={loading || !expiresAt}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-50 text-purple-600
                       hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <Infinity className="w-3 h-3" />
              Sınırsız Yap
            </button>
          </div>

          {/* Özel Süre Uzatma Modal (Custom Extend Modal) */}
          {showExtendModal && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-700 mb-2">Özel süre uzatma</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={extendDays}
                  onChange={(e) => setExtendDays(Number(e.target.value))}
                  min={1}
                  max={365}
                  className="w-20 px-3 py-1.5 text-sm border border-green-300 rounded-lg focus:ring-2
                           focus:ring-green-500 focus:border-green-500"
                />
                <span className="text-sm text-gray-600">gün</span>
                <button
                  onClick={() => extendDuration(extendDays)}
                  disabled={loading || extendDays < 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white
                           hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                  Uzat
                </button>
              </div>
            </div>
          )}

          {/* Özel Süre Kısaltma Modal (Custom Reduce Modal) */}
          {showReduceModal && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs text-red-700 mb-2">Özel süre kısaltma</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={reduceDays}
                  onChange={(e) => setReduceDays(Number(e.target.value))}
                  min={1}
                  max={365}
                  className="w-20 px-3 py-1.5 text-sm border border-red-300 rounded-lg focus:ring-2
                           focus:ring-red-500 focus:border-red-500"
                />
                <span className="text-sm text-gray-600">gün</span>
                <button
                  onClick={() => reduceDuration(reduceDays)}
                  disabled={loading || reduceDays < 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600 text-white
                           hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Minus className="w-3 h-3" />}
                  Kısalt
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

