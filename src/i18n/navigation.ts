// Yerelleştirilmiş navigation helper'ları
// Dile göre doğru URL'i döndürür

import { locales, defaultLocale, pathnames, Locale } from './config'

// Verilen pathname için yerelleştirilmiş URL'i döndür
export function getLocalizedPathname(pathname: string, locale: Locale): string {
  // Önce pathname'in tanımlı olup olmadığını kontrol et
  const pathnameConfig = pathnames[pathname as keyof typeof pathnames]
  
  if (!pathnameConfig) {
    // Dinamik route kontrolü (örn: /qr-generator/url)
    // [type] veya [id] gibi dinamik segmentleri kontrol et
    for (const [key, value] of Object.entries(pathnames)) {
      if (key.includes('[')) {
        // Dinamik route pattern'i oluştur
        const pattern = key.replace(/\[.*?\]/g, '([^/]+)')
        const regex = new RegExp(`^${pattern}$`)
        const match = pathname.match(regex)
        
        if (match) {
          // Eşleşme bulundu, dinamik değerleri al
          const dynamicValues = match.slice(1)
          const localizedPattern = typeof value === 'string' ? value : value[locale]

          // Dinamik değerleri yerelleştirilmiş pattern'e yerleştir
          let result: string = localizedPattern
          dynamicValues.forEach((val) => {
            result = result.replace(/\[.*?\]/, val)
          })
          return result as string
        }
      }
    }
    
    // Tanımlı değilse orijinal pathname'i döndür
    return pathname
  }
  
  // String ise direkt döndür, object ise locale'e göre döndür
  if (typeof pathnameConfig === 'string') {
    return pathnameConfig
  }
  
  return pathnameConfig[locale] || pathnameConfig[defaultLocale] || pathname
}

// Yerelleştirilmiş URL'den orijinal pathname'i bul
export function getOriginalPathname(localizedPath: string, locale: Locale): string {
  // Tüm pathname'leri kontrol et
  for (const [originalPath, config] of Object.entries(pathnames)) {
    if (typeof config === 'string') {
      if (config === localizedPath) return originalPath
    } else {
      if (config[locale] === localizedPath) return originalPath
      
      // Dinamik route kontrolü
      if (originalPath.includes('[')) {
        const localizedPattern = config[locale]
        const pattern = localizedPattern.replace(/\[.*?\]/g, '([^/]+)')
        const regex = new RegExp(`^${pattern}$`)
        const match = localizedPath.match(regex)
        
        if (match) {
          return originalPath
        }
      }
    }
  }
  
  return localizedPath
}

// Tüm desteklenen dilleri dışa aktar
export { locales, defaultLocale }

