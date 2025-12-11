'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, MapPin, Utensils } from 'lucide-react'
import Image from 'next/image'

interface MenuData {
    restaurantName: string
    description: string
    primaryColor: string
    textColor: string
    coverImage: string
    items: Array<{ url: string; caption: string }>
    website?: string
}

export default function MenuPage({ params }: { params: { id: string } }) {
    const [data, setData] = useState<MenuData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const supabase = createClient()
                // QR kod verisini çek
                const { data: qrData, error: qrError } = await supabase
                    .from('qr_codes')
                    .select('content')
                    .eq('id', params.id)
                    .single()

                if (qrError || !qrData) {
                    throw new Error('Menu not found')
                }

                // content_json içindeki veriyi parse et
                // API artık content'i { encoded: 'url', raw: { ...data } } şeklinde kaydediyor
                // content içindeki veriyi parse et
                const qrContent = qrData.content
                const menuData = qrContent.raw || qrContent // Geriye dönük uyumluluk için

                // Veri doğrulama
                // Not: type 'menu' olmayabilir çünkü raw datada type alanı zorunlu değil, formdan geliyorsa vardır
                console.log('Fetched QR Data:', qrData)
                console.log('Parsed Menu Data:', menuData)

                if (menuData) {
                    // Items bazen string olarak geliyor (formdan), parse etmemiz lazım
                    if (typeof menuData.items === 'string') {
                        try {
                            menuData.items = JSON.parse(menuData.items)
                        } catch (e) {
                            console.error('Error parsing items:', e)
                            menuData.items = []
                        }
                    }
                    setData(menuData as MenuData)
                } else {
                    throw new Error('Invalid menu data')
                }
            } catch (e) {
                console.error('Error fetching menu:', e)
                setError(true)
            } finally {
                setLoading(false)
            }
        }

        fetchMenu()
    }, [params.id])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Utensils className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Menü Bulunamadı</h1>
                <p className="text-gray-500 text-center">Aradığınız menüye ulaşılamıyor veya silinmiş olabilir.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50" style={{ backgroundColor: `${data.primaryColor}10` }}>
            {/* Header / Cover */}
            <div className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden shadow-lg">
                {data.coverImage ? (
                    <img
                        src={data.coverImage}
                        alt={data.restaurantName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: `linear-gradient(to bottom right, ${data.primaryColor}, ${data.primaryColor}dd)` }}
                    >
                        <Utensils className="w-16 h-16 text-white opacity-50" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20">
                    <h1 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-md">{data.restaurantName}</h1>
                    {data.description && (
                        <p className="text-white/90 text-sm md:text-base max-w-2xl drop-shadow-sm mb-4">{data.description}</p>
                    )}

                    {/* Web Sitesi Butonu */}
                    {data.website && (
                        <a
                            href={data.website.startsWith('http') ? data.website : `https://${data.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white font-medium text-sm transition-colors border border-white/30"
                        >
                            <Utensils className="w-4 h-4" />
                            Website
                        </a>
                    )}
                </div>
            </div>

            {/* Menu Content */}
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                {data.items && data.items.length > 0 ? (
                    data.items.map((item, index) => (
                        <div key={index} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                            <img
                                src={item.url}
                                alt={item.caption || `Menu Page ${index + 1}`}
                                className="w-full h-auto"
                                loading="lazy"
                            />
                            {item.caption && (
                                <div className="p-4 border-t border-gray-50">
                                    <p className="text-gray-600 font-medium">{item.caption}</p>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500">Menü görseli bulunamadı.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="text-center py-8 text-gray-400 text-xs">
                <p>Digitally served by QRCodeShine</p>
            </div>
        </div>
    )
}
