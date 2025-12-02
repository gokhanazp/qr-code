'use client'

// Dashboard Analytics Charts - Zaman grafiği, OS, Ülke, Şehir tabloları
// Client component for fetching and displaying analytics data

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface TimeData {
  month: string
  label: string
  total: number
  unique: number
}

interface OSData {
  os: string
  count: number
  percent: string
}

interface CountryData {
  country: string
  count: number
  percent: string
}

interface CityData {
  city: string
  count: number
  percent: string
}

interface AnalyticsData {
  totalScans: number
  uniqueScans: number
  timeData: TimeData[]
  osData: OSData[]
  countryData: CountryData[]
  cityData: CityData[]
}

export default function AnalyticsCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!data || data.totalScans === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">Henüz tarama verisi yok</p>
        <p className="text-sm mt-1">QR kodlarınız tarandıkça veriler burada görünecek</p>
      </div>
    )
  }

  const maxTotal = Math.max(...data.timeData.map(d => d.total), 1)
  const maxOS = Math.max(...data.osData.map(d => d.count), 1)

  return (
    <div className="space-y-6">
      {/* Üst Grid - Zaman + OS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Over Time Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">OVER TIME</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-teal-400"></span>
                Non-Unique
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#2d4a6f]"></span>
                Unique
              </span>
            </div>
          </div>
          
          {/* Bar Chart */}
          <div className="h-48 flex items-end gap-1">
            {data.timeData.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center" style={{ height: '160px' }}>
                  {/* Stacked bars */}
                  <div className="w-full flex-1 flex flex-col justify-end">
                    <div 
                      className="w-full bg-[#2d4a6f] rounded-t"
                      style={{ height: `${(item.unique / maxTotal) * 100}%`, minHeight: item.unique > 0 ? '4px' : '0' }}
                    />
                    <div 
                      className="w-full bg-teal-400"
                      style={{ height: `${((item.total - item.unique) / maxTotal) * 100}%`, minHeight: (item.total - item.unique) > 0 ? '4px' : '0' }}
                    />
                  </div>
                </div>
                <span className="text-[9px] text-gray-500 whitespace-nowrap">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Operating System */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">OPERATING SYSTEM</h3>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase">
                <th className="text-left pb-2">OS</th>
                <th className="text-center pb-2">SCANS</th>
                <th className="text-right pb-2">%</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {data.osData.map((item, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="py-2 text-gray-700">{item.os}</td>
                  <td className="py-2">
                    <div className="flex items-center justify-center">
                      <div className="w-24 h-3 bg-gray-100 rounded overflow-hidden">
                        <div 
                          className="h-full bg-[#ff8c8c] rounded"
                          style={{ width: `${(item.count / maxOS) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-2 text-right text-gray-600 font-medium">{item.percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Alt Grid - Ülkeler + Şehirler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">TOP COUNTRIES</h3>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase">
                <th className="text-left pb-2">#</th>
                <th className="text-left pb-2">COUNTRY</th>
                <th className="text-right pb-2">SCANS</th>
                <th className="text-right pb-2">%</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {data.countryData.map((item, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="py-2.5 text-gray-500 w-8">{i + 1}</td>
                  <td className="py-2.5 text-gray-800 font-medium">{item.country}</td>
                  <td className="py-2.5 text-right text-gray-600">{item.count}</td>
                  <td className="py-2.5 text-right text-[#2d4a6f] font-semibold">{item.percent}%</td>
                </tr>
              ))}
              {data.countryData.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-center text-gray-400">Veri yok</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Top Cities */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">TOP CITIES</h3>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase">
                <th className="text-left pb-2">#</th>
                <th className="text-left pb-2">CITY</th>
                <th className="text-right pb-2">SCANS</th>
                <th className="text-right pb-2">%</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {data.cityData.map((item, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="py-2.5 text-gray-500 w-8">{i + 1}</td>
                  <td className="py-2.5 text-gray-800 font-medium">{item.city}</td>
                  <td className="py-2.5 text-right text-gray-600">{item.count}</td>
                  <td className="py-2.5 text-right text-[#2d4a6f] font-semibold">{item.percent}%</td>
                </tr>
              ))}
              {data.cityData.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-center text-gray-400">Veri yok</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

