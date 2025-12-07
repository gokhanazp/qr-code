// Cloudflare Turnstile CAPTCHA Bileşeni
// Spam ve bot koruması için CAPTCHA widget'ı
// Cloudflare Turnstile CAPTCHA Component - For spam and bot protection

'use client'

import { Turnstile as TurnstileWidget } from '@marsidev/react-turnstile'

interface TurnstileProps {
  onSuccess: (token: string) => void
  onError?: () => void
  onExpire?: () => void
}

// Cloudflare Turnstile Site Key - .env dosyasından alınır
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

export default function Turnstile({ onSuccess, onError, onExpire }: TurnstileProps) {
  return (
    <div className="flex justify-center my-4">
      <TurnstileWidget
        siteKey={TURNSTILE_SITE_KEY}
        onSuccess={onSuccess}
        onError={onError}
        onExpire={onExpire}
        options={{
          theme: 'light',
          size: 'normal',
        }}
      />
    </div>
  )
}

