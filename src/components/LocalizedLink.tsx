// Yerelleştirilmiş Link bileşeni
// Dile göre doğru URL'i kullanır

'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { getLocalizedPathname } from '@/i18n/navigation'
import { Locale } from '@/i18n/config'
import { ComponentProps } from 'react'

type LocalizedLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string
}

export default function LocalizedLink({ href, children, ...props }: LocalizedLinkProps) {
  const locale = useLocale() as Locale
  
  // Harici linkler için (http:// veya https:// ile başlayan)
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return <Link href={href} {...props}>{children}</Link>
  }
  
  // Hash linkler için (#)
  if (href.startsWith('#')) {
    return <Link href={href} {...props}>{children}</Link>
  }
  
  // Yerelleştirilmiş URL'i al
  const localizedHref = getLocalizedPathname(href, locale)
  
  return <Link href={localizedHref} {...props}>{children}</Link>
}

