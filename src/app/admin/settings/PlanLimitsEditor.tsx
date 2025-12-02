'use client'

// Plan Limitleri Editörü
// Admin panelden plan limitlerini düzenleme

import { useState, useEffect } from 'react'
import { Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'

interface PlanLimit {
  plan: string
  max_qr_codes: number
  qr_duration_days: number | null
  can_use_logo: boolean
  can_use_frames: boolean
  can_use_analytics: boolean
  max_scans_per_month: number | null
}

const planNames: Record<string, { name: string, color: string }> = {
  free: { name: 'Ücretsiz', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  pro: { name: 'Pro', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  enterprise: { name: 'Kurumsal', color: 'bg-purple-100 text-purple-700 border-purple-300' }
}

export default function PlanLimitsEditor() {
  const [limits, setLimits] = useState<PlanLimit[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Plan limitlerini yükle
  const fetchLimits = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings/plan-limits')
      const data = await res.json()
      if (data.planLimits) {
        setLimits(data.planLimits)
      }
    } catch (error) {
      console.error('Error fetching limits:', error)
      setMessage({ type: 'error', text: 'Plan limitleri yüklenemedi' })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLimits()
  }, [])

  // Değişiklikleri kaydet
  const handleSave = async (plan: string) => {
    const limit = limits.find(l => l.plan === plan)
    if (!limit) return

    setSaving(plan)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/settings/plan-limits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(limit)
      })

      if (res.ok) {
        setMessage({ type: 'success', text: `${planNames[plan]?.name || plan} planı güncellendi!` })
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'Güncelleme başarısız' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bağlantı hatası' })
    }

    setSaving(null)
    setTimeout(() => setMessage(null), 3000)
  }

  // Input değişikliği
  const handleChange = (plan: string, field: keyof PlanLimit, value: number | boolean | null) => {
    setLimits(prev => prev.map(l => 
      l.plan === plan ? { ...l, [field]: value } : l
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mesaj Gösterimi */}
      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Plan Kartları - 3 sütun yan yana */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {limits.map(limit => (
          <div key={limit.plan} className={`p-4 rounded-xl border-2 ${planNames[limit.plan]?.color || 'bg-gray-50 border-gray-200'}`}>
            {/* Başlık */}
            <div className="text-center mb-4 pb-3 border-b border-current/20">
              <h4 className="font-bold text-lg">{planNames[limit.plan]?.name || limit.plan}</h4>
            </div>

            {/* Alanlar */}
            <div className="space-y-3">
              {/* Max QR Codes */}
              <div>
                <label className="block text-xs font-medium mb-1">Maks. QR Kod</label>
                <input
                  type="number"
                  value={limit.max_qr_codes}
                  onChange={(e) => handleChange(limit.plan, 'max_qr_codes', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  min="-1"
                />
                <p className="text-[10px] text-gray-500 mt-0.5">-1 = Sınırsız</p>
              </div>

              {/* QR Duration Days */}
              <div>
                <label className="block text-xs font-medium mb-1">Geçerlilik Süresi (gün)</label>
                <input
                  type="number"
                  value={limit.qr_duration_days ?? ''}
                  onChange={(e) => handleChange(limit.plan, 'qr_duration_days', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Sınırsız"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  min="1"
                />
                <p className="text-[10px] text-gray-500 mt-0.5">Boş = Sınırsız</p>
              </div>

              {/* Max Scans */}
              <div>
                <label className="block text-xs font-medium mb-1">Aylık Tarama Limiti</label>
                <input
                  type="number"
                  value={limit.max_scans_per_month ?? ''}
                  onChange={(e) => handleChange(limit.plan, 'max_scans_per_month', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Sınırsız"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  min="1"
                />
                <p className="text-[10px] text-gray-500 mt-0.5">Boş = Sınırsız</p>
              </div>
            </div>

            {/* Kaydet Butonu */}
            <button
              onClick={() => handleSave(limit.plan)}
              disabled={saving === limit.plan}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {saving === limit.plan ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Kaydet
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

