// HTML Viewer Page - QR kod taratıldığında HTML içeriği gösterir
// HTML Viewer Page - Shows HTML content when QR code is scanned

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function HTMLViewerPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // QR kodunu bul (Find QR code)
  const { data: qrCode } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('id', id)
    .single()

  if (!qrCode || qrCode.type !== 'HTML') {
    notFound()
  }

  // Tarama sayısını artır (Increment scan count)
  await supabase
    .from('qr_codes')
    .update({ scan_count: (qrCode.scan_count || 0) + 1 })
    .eq('id', id)

  // HTML içeriğini göster (Display HTML content)
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{qrCode.name || 'HTML QR Code'}</title>
      </head>
      <body>
        <div dangerouslySetInnerHTML={{ __html: qrCode.content }} />
      </body>
    </html>
  )
}

