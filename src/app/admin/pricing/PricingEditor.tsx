'use client'

// Fiyatlandırma Düzenleme Komponenti
// (Pricing Editor Component)

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Edit, Save, X, Loader2 } from 'lucide-react'

interface PricingPlan {
  id: string
  name: string
  name_tr: string
  price_monthly: number
  price_yearly: number
  max_qr_codes: number
  qr_duration_days: number | null
  max_scans_per_month: number | null
  can_use_logo: boolean
  can_use_frames: boolean
  can_use_analytics: boolean
  can_download_svg: boolean
  can_download_pdf: boolean
  features: string[]
}

interface PricingEditorProps {
  plan: PricingPlan
  currencySymbol: string
}

export default function PricingEditor({ plan, currencySymbol }: PricingEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: plan.name,
    name_tr: plan.name_tr,
    price_monthly: plan.price_monthly,
    price_yearly: plan.price_yearly,
    max_qr_codes: plan.max_qr_codes,
    qr_duration_days: plan.qr_duration_days,
    max_scans_per_month: plan.max_scans_per_month,
    can_use_logo: plan.can_use_logo,
    can_use_frames: plan.can_use_frames,
    can_use_analytics: plan.can_use_analytics,
    can_download_svg: plan.can_download_svg,
    can_download_pdf: plan.can_download_pdf,
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('pricing_plans')
        .update(formData)
        .eq('id', plan.id)

      if (error) throw error

      // plan_limits tablosunu da güncelle (Limitlerin aktif olması için)
      // (Update plan_limits table for enforcement)
      const { error: limitError } = await supabase
        .from('plan_limits')
        .upsert({
          plan: plan.id,
          max_qr_codes: formData.max_qr_codes,
          qr_duration_days: formData.qr_duration_days,
          max_scans_per_month: formData.max_scans_per_month,
          can_use_logo: formData.can_use_logo,
          can_use_frames: formData.can_use_frames,
          can_use_analytics: formData.can_use_analytics
        })

      if (limitError) {
        console.error('Plan limit update error:', limitError)
        // Kritik değilse devam et veya kullanıcıya bildir
      }

      setIsEditing(false)
      // Sayfayı yenile (Refresh page)
      window.location.reload()
    } catch (error) {
      console.error('Güncelleme hatası:', error)
      alert('Güncelleme başarısız oldu')
    } finally {
      setLoading(false)
    }
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
      >
        <Edit className="w-4 h-4" />
        Düzenle
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Modal Başlık (Modal Header) */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{plan.name} Planını Düzenle</h2>
          <button
            onClick={() => setIsEditing(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* İsimler (Names) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İsim (EN)</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İsim (TR)</label>
              <input
                type="text"
                value={formData.name_tr}
                onChange={(e) => setFormData({ ...formData, name_tr: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Fiyatlar (Prices) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aylık Fiyat ({currencySymbol})</label>
              <input
                type="number"
                value={formData.price_monthly}
                onChange={(e) => setFormData({ ...formData, price_monthly: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yıllık Fiyat ({currencySymbol})</label>
              <input
                type="number"
                value={formData.price_yearly}
                onChange={(e) => setFormData({ ...formData, price_yearly: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Limitler (Limits) */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max QR (-1: sınırsız)</label>
              <input
                type="number"
                value={formData.max_qr_codes}
                onChange={(e) => setFormData({ ...formData, max_qr_codes: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">QR Süresi (gün)</label>
              <input
                type="number"
                value={formData.qr_duration_days || ''}
                onChange={(e) => setFormData({ ...formData, qr_duration_days: e.target.value ? Number(e.target.value) : null })}
                placeholder="Sınırsız"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aylık Tarama</label>
              <input
                type="number"
                value={formData.max_scans_per_month || ''}
                onChange={(e) => setFormData({ ...formData, max_scans_per_month: e.target.value ? Number(e.target.value) : null })}
                placeholder="Sınırsız"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Altbilgi (Modal Footer) */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Kaydet
          </button>
        </div>
      </div>
    </div>
  )
}

