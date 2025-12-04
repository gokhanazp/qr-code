// Para Birimi Seçici (Currency Selector)
// Admin panelinde para birimi ayarı için client component

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DollarSign, Check, Loader2 } from 'lucide-react'

// Para birimi tipleri (Currency types)
const currencies = [
  { code: 'TRY', symbol: '₺', name: 'Türk Lirası' },
  { code: 'USD', symbol: '$', name: 'ABD Doları' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
]

interface CurrencySelectorProps {
  currentCurrency: string
}

export default function CurrencySelector({ currentCurrency }: CurrencySelectorProps) {
  const [selected, setSelected] = useState(currentCurrency)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Para birimini kaydet (Save currency)
  const handleSave = async () => {
    setLoading(true)
    setSaved(false)

    try {
      const supabase = createClient()

      // site_settings tablosuna kaydet veya güncelle
      const { error: settingsError } = await supabase
        .from('site_settings')
        .upsert({ 
          key: 'currency', 
          value: selected 
        }, { onConflict: 'key' })

      if (settingsError) {
        console.error('Settings error:', settingsError)
      }

      // pricing_plans tablosundaki tüm planların currency'sini güncelle
      const { error: plansError } = await supabase
        .from('pricing_plans')
        .update({ currency: selected })
        .neq('id', '')  // Tüm kayıtları güncelle

      if (plansError) {
        console.error('Plans error:', plansError)
        throw plansError
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Currency update error:', error)
      alert('Para birimi güncellenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Para Birimi</h2>
          <p className="text-sm text-gray-500">Fiyatlandırma sayfasında gösterilecek para birimi</p>
        </div>
      </div>

      {/* Para birimi seçenekleri (Currency options) */}
      <div className="space-y-2 mb-4">
        {currencies.map((currency) => (
          <label
            key={currency.code}
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
              selected === currency.code
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="currency"
                value={currency.code}
                checked={selected === currency.code}
                onChange={(e) => setSelected(e.target.value)}
                className="sr-only"
              />
              <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-lg font-bold text-gray-700">
                {currency.symbol}
              </span>
              <div>
                <p className="font-medium text-gray-900">{currency.name}</p>
                <p className="text-xs text-gray-500">{currency.code}</p>
              </div>
            </div>
            {selected === currency.code && (
              <Check className="w-5 h-5 text-emerald-600" />
            )}
          </label>
        ))}
      </div>

      {/* Kaydet butonu (Save button) */}
      <button
        onClick={handleSave}
        disabled={loading || selected === currentCurrency}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
          saved
            ? 'bg-green-500 text-white'
            : selected === currentCurrency
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-emerald-600 text-white hover:bg-emerald-700'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Kaydediliyor...
          </>
        ) : saved ? (
          <>
            <Check className="w-4 h-4" />
            Kaydedildi!
          </>
        ) : (
          'Kaydet'
        )}
      </button>
    </div>
  )
}

