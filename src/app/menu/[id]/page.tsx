// Menü sayfası - Server Component olarak çalışır
// QR kod taratıldığında menü içeriğini görüntüler
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Utensils } from 'lucide-react'

// Menü verisi tipi (Menu data type)
interface MenuData {
    restaurantName: string
    description: string
    primaryColor: string
    textColor: string
    coverImage: string
    items: Array<{ url: string; caption: string }>
    website?: string
}

// Sayfa props tipi (Page props type)
interface PageProps {
    params: Promise<{ id: string }>
}

export default async function MenuPage({ params }: PageProps) {
    const { id } = await params

    // Server-side Supabase client kullan (Use server-side Supabase client)
    const supabase = await createClient()

    // QR kod verisini çek (Fetch QR code data)
    const { data: qrData, error: qrError } = await supabase
        .from('qr_codes')
        .select('content, type, is_active')
        .eq('id', id)
        .single()

    // Hata veya veri yoksa (If error or no data)
    if (qrError || !qrData) {
        console.error('Menu fetch error:', qrError?.message || 'No data found')
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Utensils className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Menü Bulunamadı</h1>
                <p className="text-gray-500 text-center mb-4">Aradığınız menüye ulaşılamıyor veya silinmiş olabilir.</p>
                <div className="bg-red-50 p-3 rounded text-xs text-red-600 font-mono max-w-md break-all">
                    ID: {id}<br />
                    Error: {qrError?.message || 'QR code not found'}
                </div>
            </div>
        )
    }

    // QR kod pasif mi kontrol et (Check if QR code is inactive)
    if (qrData.is_active === false) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                    <Utensils className="w-8 h-8 text-yellow-500" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Menü Pasif</h1>
                <p className="text-gray-500 text-center">Bu menü şu anda aktif değil.</p>
            </div>
        )
    }

    // Content'i parse et (Parse content)
    // API content'i { encoded: 'url', raw: { ...data } } şeklinde kaydediyor
    const qrContent = qrData.content
    let menuData: MenuData | null = null

    // raw varsa onu kullan, yoksa doğrudan content'i kullan (geriye dönük uyumluluk)
    const rawData = qrContent?.raw || qrContent

    if (rawData) {
        // Items bazen string olarak geliyor, parse et
        let items = rawData.items
        if (typeof items === 'string') {
            try {
                items = JSON.parse(items)
            } catch {
                items = []
            }
        }

        menuData = {
            restaurantName: rawData.restaurantName || rawData.name || 'Menü',
            description: rawData.description || '',
            primaryColor: rawData.primaryColor || '#ff5722',
            textColor: rawData.textColor || '#000000',
            coverImage: rawData.coverImage || '',
            items: Array.isArray(items) ? items : [],
            website: rawData.website
        }
    }

    // Menü verisi yoksa (If no menu data)
    if (!menuData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Utensils className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Menü Verisi Hatalı</h1>
                <p className="text-gray-500 text-center">Menü verisi okunamadı.</p>
            </div>
        )
    }

    // Menüyü render et (Render menu)
    return (
        <div className="min-h-screen bg-gray-50" style={{ backgroundColor: `${menuData.primaryColor}10` }}>
            {/* Header / Cover */}
            <div className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden shadow-lg">
                {menuData.coverImage ? (
                    <img
                        src={menuData.coverImage}
                        alt={menuData.restaurantName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: `linear-gradient(to bottom right, ${menuData.primaryColor}, ${menuData.primaryColor}dd)` }}
                    >
                        <Utensils className="w-16 h-16 text-white opacity-50" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20">
                    <h1 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-md">{menuData.restaurantName}</h1>
                    {menuData.description && (
                        <p className="text-white/90 text-sm md:text-base max-w-2xl drop-shadow-sm mb-4">{menuData.description}</p>
                    )}

                    {/* Web Sitesi Butonu */}
                    {menuData.website && (
                        <a
                            href={menuData.website.startsWith('http') ? menuData.website : `https://${menuData.website}`}
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
                {menuData.items && menuData.items.length > 0 ? (
                    menuData.items.map((item, index) => (
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
