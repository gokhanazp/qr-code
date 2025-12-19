// QR Kod Önizleme bileşeni (QR Code Preview Component)
// Modern tasarımlı QR kodu gösterme ve indirme (Frame ve Logo destekli)
// İndirme için üyelik gerekli (Authentication required for download)
// Watermark koruması: Giriş yapmayan kullanıcılar için

'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import { Download, Copy, Check, Image, FileType, Share2, Smartphone, LogIn, Lock } from 'lucide-react'
import clsx from 'clsx'
import { FRAME_TEMPLATES } from './QRFrameSelector'

interface QRPreviewProps {
  content: string
  foregroundColor: string
  backgroundColor: string
  size: number
  errorCorrection: 'L' | 'M' | 'Q' | 'H'
  selectedFrame?: string
  frameText?: string
  frameColor?: string
  logo?: string | null
  logoSize?: number
  isAuthenticated?: boolean
}

// SVG Cache to prevent duplicate fetches (Performance Booster)
const svgCache: Record<string, string> = {}

// Dış çerçeve koordinat ayarları (Hassas Illustrator değerleri)
const EXTERNAL_FRAME_CONFIGS: Record<string, { x: number, y: number, size: number, textY: number, textZone: 'top' | 'bottom', textColor?: string }> = {
  '1': { x: 38.4, y: 22.8, size: 243.3, textY: 378, textZone: 'bottom', textColor: '#FFFFFF' },
  '2': { x: 38.1, y: 22.9, size: 243.3, textY: 366, textZone: 'bottom', textColor: '#FFFFFF' },
  '3': { x: 38.0, y: 22.8, size: 243.3, textY: 378, textZone: 'bottom', textColor: '#000000' },
  '4': { x: 37.3, y: 22.1, size: 243.3, textY: 378, textZone: 'bottom', textColor: '#000000' },
  '5': { x: 37.3, y: 26.1, size: 243.3, textY: 373, textZone: 'bottom', textColor: '#FFFFFF' },
  '6': { x: 38.4, y: 25.8, size: 243.3, textY: 387, textZone: 'bottom', textColor: '#FFFFFF' },
  '7': { x: 38.4, y: 22.8, size: 243.3, textY: 368, textZone: 'bottom', textColor: '#FFFFFF' },
  '8': { x: 38.2, y: 21.8, size: 243.3, textY: 362, textZone: 'bottom', textColor: '#000000' },
  '9': { x: 37.6, y: 27.5, size: 243.3, textY: 362, textZone: 'bottom', textColor: '#000000' },
  '10': { x: 37.6, y: 20.5, size: 243.3, textY: 387, textZone: 'bottom', textColor: '#FFFFFF' },
  '11': { x: 37.8, y: 122.9, size: 243.3, textY: 42, textZone: 'top', textColor: '#FFFFFF' },
  '12': { x: 38.0, y: 35.0, size: 243.3, textY: 350, textZone: 'bottom', textColor: '#FFFFFF' },
  '13': { x: 38.0, y: 23.0, size: 243.3, textY: 378, textZone: 'bottom', textColor: '#000000' },
  '14': { x: 38.4, y: 23.3, size: 243.3, textY: 378, textZone: 'bottom', textColor: '#FFFFFF' },
  '15': { x: 38.0, y: 23.0, size: 243.3, textY: 387, textZone: 'bottom', textColor: '#FFFFFF' },
  '16': { x: 54.6, y: 17.6, size: 209.3, textY: 350, textZone: 'bottom', textColor: '#000000' },
  '17': { x: 81.8, y: 123.2, size: 155.0, textY: 365, textZone: 'bottom', textColor: '#000000' },
  '18': { x: 58.4, y: 93.9, size: 201.7, textY: 390, textZone: 'bottom', textColor: '#FFFFFF' },
  '19': { x: 60.2, y: 119.0, size: 198.1, textY: 400, textZone: 'bottom', textColor: '#FFFFFF' },
  '20': { x: 81.0, y: 94.5, size: 157.0, textY: 320, textZone: 'bottom', textColor: '#FFFFFF' },
  '21': { x: 75.8, y: 37.5, size: 166.9, textY: 349, textZone: 'bottom', textColor: '#000000' },
  '22': { x: 25.5, y: 74.6, size: 114.6, textY: 225, textZone: 'bottom', textColor: '#FFFFFF' },
  '23': { x: 83.9, y: 75.2, size: 156.7, textY: 30, textZone: 'top', textColor: '#000000' },
  '24': { x: 122.2, y: 124.8, size: 154.7, textY: 345, textZone: 'bottom', textColor: '#FFFFFF' },
  '25': { x: 49.2, y: 81.5, size: 220.2, textY: 382, textZone: 'bottom', textColor: '#FFFFFF' },
  '26': { x: 73.0, y: 80.6, size: 201.0, textY: 375, textZone: 'bottom', textColor: '#FFFFFF' },
  '27': { x: 67.8, y: 143.2, size: 182.9, textY: 382, textZone: 'bottom', textColor: '#FFFFFF' },
  '28': { x: 80.7, y: 106.0, size: 157.1, textY: 355, textZone: 'bottom', textColor: '#FFFFFF' },
  '29': { x: 82.5, y: 171.4, size: 153.5, textY: 373, textZone: 'bottom', textColor: '#FFFFFF' },
  '30': { x: 68.5, y: 114.8, size: 157.5, textY: 387, textZone: 'bottom', textColor: '#000000' },
}

export default function QRPreview({
  content,
  foregroundColor,
  backgroundColor,
  size,
  errorCorrection,
  selectedFrame = 'none',
  frameText = '',
  frameColor = '#000000',
  logo = null,
  logoSize = 20,
  isAuthenticated = false,
}: QRPreviewProps) {
  const t = useTranslations('generator')
  const locale = useLocale()
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [activeDownload, setActiveDownload] = useState<string | null>(null)

  const frameTemplate = FRAME_TEMPLATES.find(f => f.id === selectedFrame) || FRAME_TEMPLATES[0]

  const addWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (isAuthenticated) return
    ctx.save()
    const lineWidth = Math.max(4, width / 50)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)'
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(width * 0.05, width * 0.05); ctx.lineTo(width * 0.32, width * 0.32); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(width * 0.95, width * 0.05); ctx.lineTo(width * 0.68, width * 0.32); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(width * 0.05, height * 0.95); ctx.lineTo(width * 0.32, height * 0.68); ctx.stroke()
    ctx.translate(width / 2, height / 2)
    ctx.rotate(-Math.PI / 6)
    const fontSize = Math.max(11, Math.min(16, width / 16))
    ctx.font = `600 ${fontSize}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
    ctx.fillText('QRCodeShine.com', 0, 0)
    ctx.restore()
  }

  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, h + y - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  const drawFrameText = (ctx: CanvasRenderingContext2D, totalWidth: number, totalHeight: number, qrX: number, qrY: number, qrSize: number, template: any, text: string, fColor: string, isPreview: boolean = true) => {
    if (!template.hasText || !text) return
    const frameStyle = template.frameStyle
    if (frameStyle === 'bubble-top' || frameStyle === 'bubble') return

    const s = isPreview ? 1 : qrSize / 200

    if (frameStyle === 'external') {
      const id = String(template.externalId)
      const config = EXTERNAL_FRAME_CONFIGS[id] || { x: 38.4, y: 22.8, size: 243.3, textY: 387, textZone: 'bottom', textColor: '#FFFFFF' }
      const extS = isPreview ? (totalWidth / 320) : (qrSize / config.size)

      ctx.fillStyle = config.textColor || '#FFFFFF'
      ctx.font = `bold ${Math.round((isPreview ? 36 : 54) * extS)}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const txPos = totalHeight * (config.textY / 418)
      const txX = frameTemplate.externalId === '24'
        ? totalWidth / 2
        : totalWidth * ((config.x + config.size / 2) / 320)
      ctx.fillText(text, txX, txPos)
    } else if (frameStyle !== 'none') {
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${isPreview ? 14 : Math.round(20 * s)}px Arial`
      ctx.textAlign = 'center'
      const textY = qrY + qrSize + (isPreview ? 24 : 36 * s)
      ctx.fillText(text, totalWidth / 2, textY)
    }
  }

  const [debouncedContent, setDebouncedContent] = useState(content)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedContent(content), 300)
    return () => clearTimeout(timer)
  }, [content])

  useEffect(() => {
    if (!debouncedContent || !canvasRef.current) return

    const generateQR = async () => {
      try {
        const basePreviewSize = 200
        const frameStyle = frameTemplate.frameStyle || 'none'
        const hasFrame = selectedFrame !== 'none'
        const isExternal = frameStyle === 'external'
        const framePadding = hasFrame ? 16 : 0
        const id = String(frameTemplate.externalId)
        const frame_config = EXTERNAL_FRAME_CONFIGS[id] || { x: 38.4, y: 22.8, size: 243.3, textY: 387, textZone: 'bottom', textColor: '#FFFFFF' }

        const textHeight = hasFrame && frameTemplate.hasText && frameText && !isExternal ? 32 : 0
        const topTextHeight = (frameStyle === 'bubble-top' || frameStyle === 'bubble') && frameText && !isExternal ? 24 : 0

        const extScale = isExternal ? basePreviewSize / 320 : 1
        const totalWidth = isExternal ? 320 * extScale : basePreviewSize + framePadding * 2
        const totalHeight = isExternal ? 418 * extScale : basePreviewSize + framePadding * 2 + textHeight + topTextHeight

        const canvas = canvasRef.current!
        const dpr = window.devicePixelRatio || 1
        canvas.width = totalWidth * dpr
        canvas.height = totalHeight * dpr
        canvas.style.width = `${totalWidth}px`
        canvas.style.height = `${totalHeight}px`
        const ctx = canvas.getContext('2d')!
        ctx.scale(dpr, dpr)
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, totalWidth, totalHeight)

        const qrX = isExternal ? frame_config.x * extScale : framePadding
        const qrY = isExternal ? frame_config.y * extScale : framePadding + topTextHeight
        const qrSize = isExternal ? frame_config.size * extScale : basePreviewSize
        const frameBgColor = frameTemplate.backgroundColor || foregroundColor

        if (hasFrame && !isExternal) {
          ctx.fillStyle = frameBgColor
          if (frameStyle === 'chat') {
            roundRect(ctx, 0, 0, totalWidth, totalHeight - 12, 12); ctx.fill()
            ctx.beginPath(); ctx.moveTo(totalWidth / 2 - 15, totalHeight - 12); ctx.lineTo(totalWidth / 2, totalHeight); ctx.lineTo(totalWidth / 2 + 15, totalHeight - 12); ctx.fill()
          } else if (frameStyle === 'bubble-top' || frameStyle === 'bubble') {
            roundRect(ctx, 0, topTextHeight, totalWidth, totalHeight - topTextHeight, 10); ctx.fill()
            ctx.beginPath(); ctx.arc(totalWidth / 2, topTextHeight, 20, Math.PI, 0); ctx.fill()
          } else {
            roundRect(ctx, 0, 0, totalWidth, totalHeight, 10); ctx.fill()
          }
          ctx.fillStyle = backgroundColor
          roundRect(ctx, 8, 8 + topTextHeight, totalWidth - 16, basePreviewSize + (framePadding - 8) * 2, 6); ctx.fill()
        }

        const qrDataUrlTemp = await QRCode.toDataURL(debouncedContent, {
          width: qrSize * 2, margin: 2, color: { dark: foregroundColor, light: backgroundColor }, errorCorrectionLevel: errorCorrection,
        })

        const qrImg = new window.Image()
        qrImg.onload = async () => {
          if (isExternal) {
            const frameImg = new window.Image()
            const framePath = `/img/frame/${frameTemplate.externalId}.svg`;

            let svgText = svgCache[framePath];
            if (!svgText) {
              const resp = await fetch(framePath);
              svgText = await resp.text();
              svgCache[framePath] = svgText;
            }

            const parser = new DOMParser()
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')

            // UNIFIED SURGICAL CLEANING (Targets placeholders, protects 12, 20, 22)
            svgDoc.querySelectorAll('g').forEach(g => {
              const shapes = Array.from(g.children).filter(c => ['path', 'rect', 'polygon', 'circle', 'ellipse'].includes(c.tagName.toLowerCase()));

              if (shapes.length > 5) {
                const classes = shapes.map(s => s.getAttribute('class'));
                const uniqueClasses = Array.from(new Set(classes));

                // Rule 1: Uniform Class Cluster (SCAN ME letters)
                // In Frame 5, 12, 20, 22, the "SCAN ME" letters all share ONE class specifically.
                if (uniqueClasses.length === 1) {
                  g.setAttribute('display', 'none');
                }
                // Rule 2: High Density Cluster (Dummy QR code dots)
                else if (shapes.length > 30) {
                  g.setAttribute('display', 'none');
                }
                // DESIGN PROTECTION: If classes are MIXED (st0, st1), it's a design part (Ribbon, Motorcycle, Header)
                // and we keep it. This fixes the "broken design" issue for 12, 20, 22.
              }
            });

            // Explicitly hide any <text> tags
            svgDoc.querySelectorAll('text').forEach(t => t.setAttribute('display', 'none'))

            const cleanedSvg = new XMLSerializer().serializeToString(svgDoc)
            const cleanedUrl = URL.createObjectURL(new Blob([cleanedSvg], { type: 'image/svg+xml' }))
            const cleanedImg = new window.Image()

            cleanedImg.onload = () => {
              ctx.drawImage(cleanedImg, 0, 0, totalWidth, totalHeight)
              ctx.fillStyle = '#FFFFFF'
              ctx.fillRect(qrX, qrY, qrSize, qrSize)
              ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)
              completeRender(qrX, qrY, qrSize)
              URL.revokeObjectURL(cleanedUrl)
            }
            cleanedImg.src = cleanedUrl
          } else {
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)
            completeRender(qrX, qrY, qrSize)
          }

          async function completeRender(qx: number, qy: number, qSize: number) {
            if (logo) {
              const prevLogoW = qSize * (logoSize / 100)
              ctx.save()
              ctx.fillStyle = backgroundColor; ctx.beginPath()
              ctx.arc(qx + qSize / 2, qy + qSize / 2, prevLogoW / 2 + 3, 0, Math.PI * 2); ctx.fill()
              const logoImg = new window.Image()
              await new Promise((resolve) => {
                logoImg.onload = () => { ctx.drawImage(logoImg, qx + qSize / 2 - prevLogoW / 2, qy + qSize / 2 - prevLogoW / 2, prevLogoW, prevLogoW); resolve(null) }
                logoImg.onerror = () => resolve(null)
                logoImg.src = logo
              })
              ctx.restore()
            }
            if (hasFrame) drawFrameText(ctx, totalWidth, totalHeight, qx, qy, qSize, frameTemplate, frameText, foregroundColor)
            addWatermark(ctx, totalWidth, totalHeight)
          }
        }
        qrImg.src = qrDataUrlTemp

        // PNG Export Preparation
        const generatePNGDownload = async () => {
          const dlCanvas = document.createElement('canvas')
          const dlCtx = dlCanvas.getContext('2d')!
          const dlScale = isExternal ? size / 320 : size / 200
          const dlTotalWidth = isExternal ? 320 * dlScale : size + 48 * dlScale
          const dlTotalHeight = isExternal ? 418 * dlScale : size + 48 * dlScale + (frameText ? 64 * dlScale : 0)

          dlCanvas.width = dlTotalWidth
          dlCanvas.height = dlTotalHeight
          dlCtx.fillStyle = backgroundColor
          dlCtx.fillRect(0, 0, dlTotalWidth, dlTotalHeight)

          if (isExternal) {
            const framePath = `/img/frame/${frameTemplate.externalId}.svg`;
            let svgText = svgCache[framePath];
            if (!svgText) {
              const resp = await fetch(framePath);
              svgText = await resp.text();
              svgCache[framePath] = svgText;
            }

            const parser = new DOMParser()
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')

            // Sync cleaning logic across formats
            svgDoc.querySelectorAll('g').forEach(g => {
              const shapes = Array.from(g.children).filter(c => ['path', 'rect', 'polygon', 'circle', 'ellipse'].includes(c.tagName.toLowerCase()));
              if (shapes.length > 5) {
                const classes = shapes.map(s => s.getAttribute('class'));
                const uniqueClasses = Array.from(new Set(classes));
                if (uniqueClasses.length === 1) g.setAttribute('display', 'none');
                else if (shapes.length > 30) g.setAttribute('display', 'none');
              }
            });
            svgDoc.querySelectorAll('text').forEach(t => t.setAttribute('display', 'none'))

            const cleanedUrl = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svgDoc)], { type: 'image/svg+xml' }))
            const fImg = new window.Image()
            await new Promise((resolve) => {
              fImg.onload = () => { dlCtx.drawImage(fImg, 0, 0, dlTotalWidth, dlTotalHeight); resolve(null) }
              fImg.src = cleanedUrl
            })
            URL.revokeObjectURL(cleanedUrl)

            const dqx = frame_config.x * dlScale
            const dqy = frame_config.y * dlScale
            const dqs = frame_config.size * dlScale
            dlCtx.fillStyle = '#FFFFFF'; dlCtx.fillRect(dqx, dqy, dqs, dqs)
            const qUrl = await QRCode.toDataURL(debouncedContent, { width: dqs * 2, margin: 2, color: { dark: foregroundColor, light: backgroundColor }, errorCorrectionLevel: errorCorrection })
            const qImg = new window.Image()
            await new Promise((resolve) => {
              qImg.onload = async () => {
                dlCtx.drawImage(qImg, dqx, dqy, dqs, dqs)
                if (hasFrame) {
                  drawFrameText(dlCtx, dlTotalWidth, dlTotalHeight, dqx, dqy, dqs, frameTemplate, frameText, foregroundColor, false)
                }
                setQrDataUrl(dlCanvas.toDataURL('image/png'))
                resolve(null)
              }
              qImg.src = qUrl
            })
          } else {
            setQrDataUrl(canvas.toDataURL('image/png'))
          }
        }
        generatePNGDownload()
      } catch (err) { console.error(err) }
    }
    generateQR()
  }, [debouncedContent, foregroundColor, backgroundColor, size, errorCorrection, logo, logoSize, selectedFrame, frameText, frameTemplate, isAuthenticated])

  const downloadPNG = () => { if (qrDataUrl) { const a = document.createElement('a'); a.download = `qrcode-${Date.now()}.png`; a.href = qrDataUrl; a.click() } }

  const downloadSVG = async () => {
    if (!debouncedContent) return
    setActiveDownload('svg')
    try {
      const qrSvgString = await QRCode.toString(debouncedContent, { type: 'svg', width: size, margin: 2, color: { dark: foregroundColor, light: backgroundColor }, errorCorrectionLevel: errorCorrection })
      const hasFrame = selectedFrame !== 'none'
      const isExternal = frameTemplate.frameStyle === 'external'
      if (!hasFrame) {
        const url = URL.createObjectURL(new Blob([qrSvgString], { type: 'image/svg+xml' }))
        const a = document.createElement('a'); a.download = 'qrcode.svg'; a.href = url; a.click(); URL.revokeObjectURL(url)
        setActiveDownload(null); return
      }

      const idStr = String(frameTemplate.externalId)
      const config = isExternal ? (EXTERNAL_FRAME_CONFIGS[idStr] || EXTERNAL_FRAME_CONFIGS['1']) : { x: 0, y: 0, size: size, textY: 0, textColor: '#FFFFFF', textBgColor: 'transparent' }
      const s = isExternal ? size / 320 : size / 200
      const totalW = isExternal ? 320 * s : size + 48 * s
      const totalH = isExternal ? 418 * s : size + 64 * s + (frameText ? 48 * s : 0)

      let svg = `<svg width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">`
      svg += `<rect width="100%" height="100%" fill="${backgroundColor}" />`

      if (isExternal) {
        const framePath = `/img/frame/${frameTemplate.externalId}.svg`;
        let content = svgCache[framePath];
        if (!content) {
          const resp = await fetch(framePath);
          content = await resp.text();
          svgCache[framePath] = content;
        }

        // Final Surgical Cleaning logic in SVG export
        const clean = content.replace(/<g[^>]*>([\s\S]*?)<\/g>/g, (m, inner) => {
          const shapes = inner.match(/<(path|rect|polygon|circle|ellipse)[^>]*>/g) || []
          if (shapes.length > 5) {
            const classes = inner.match(/class="([^"]+)"/g)
            const uniqueClasses = Array.from(new Set(classes ? classes.map((c: string) => c.split('"')[1]) : [null]))
            if (uniqueClasses.length === 1) return '' // Uniform class = SCAN ME
            if (shapes.length > 30) return '' // High density = Dummy QR
          }
          return m
        }).replace(/<text[^>]*>[\s\S]*?<\/text>/g, '')
          .replace(/<svg[^>]*>/, '').replace('</svg>', '').replace(/<\?xml[^>]*\?>/, '')

        svg += `<g transform="scale(${s})">${clean}</g>`
        const qx = config.x * s, qy = config.y * s, qs = config.size * s

        svg += `<rect x="${qx}" y="${qy}" width="${qs}" height="${qs}" fill="#FFFFFF" />`
        const innerQr = qrSvgString.replace(/<svg[^>]*>/, '').replace('</svg>', '')
        svg += `<g transform="translate(${qx}, ${qy}) scale(${qs / size})">${innerQr}</g>`
        if (logo) {
          const lW = qs * (logoSize / 100)
          svg += `<circle cx="${qx + qs / 2}" cy="${qy + qs / 2}" r="${lW / 2 + 5 * s}" fill="${backgroundColor}" />`
          svg += `<image x="${qx + qs / 2 - lW / 2}" y="${qy + qs / 2 - lW / 2}" width="${lW}" height="${lW}" xlink:href="${logo}" />`
        }
        if (frameText) {
          const txPos = totalH * (config.textY / 418)
          const txX = frameTemplate.externalId === '24'
            ? totalW / 2
            : totalW * ((config.x + config.size / 2) / 320)
          svg += `<text x="${txX}" y="${txPos}" font-family="Arial" font-weight="bold" font-size="${54 * s}" text-anchor="middle" dominant-baseline="middle" fill="${config.textColor || '#FFFFFF'}">${frameText}</text>`
        }
      } else {
        svg += `<rect width="${totalW}" height="${totalH}" fill="${frameColor}" rx="20" />`
        svg += `<rect x="${12 * s}" y="${12 * s}" width="${totalW - 24 * s}" height="${size + 24 * s}" fill="${backgroundColor}" rx="12" />`
        svg += qrSvgString.replace(/<svg[^>]*>/, '').replace('</svg>', '').replace(/transform="[^"]*"/, `transform="translate(${(totalW - size) / 2}, ${24 * s})"`)
        if (frameText) svg += `<text x="${totalW / 2}" y="${totalH - 20 * s}" font-family="Arial" font-weight="bold" font-size="${24 * s}" text-anchor="middle" fill="#FFFFFF">${frameText}</text>`
      }
      svg += `</svg>`
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
      const a = document.createElement('a'); a.download = `qrcode-${Date.now()}.svg`; a.href = url; a.click(); URL.revokeObjectURL(url)
    } catch (e) { console.error(e) }
    setActiveDownload(null)
  }

  const copyToClipboard = async () => {
    if (!canvasRef.current) return
    canvasRef.current.toBlob(blob => {
      if (blob) navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
    })
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <div className="relative p-4 bg-white rounded-3xl shadow-2xl border border-gray-100 group transition-all hover:shadow-blue-100/50">
        <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-3xl opacity-10 blur group-hover:opacity-20 transition-opacity" />
        <canvas ref={canvasRef} className="relative z-10 max-w-full h-auto rounded-xl" />
        {!isAuthenticated && debouncedContent && (
          <div className="absolute top-6 right-6 z-20 bg-yellow-400 text-yellow-900 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" /> {locale === 'tr' ? 'ÖNİZLEME' : 'PREVIEW'}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={isAuthenticated ? downloadPNG : () => router.push('/auth/login')}
          className={clsx(
            "w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all",
            isAuthenticated ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200" : "bg-gray-900 text-white hover:bg-black"
          )}
        >
          {isAuthenticated ? (activeDownload === 'png' ? <Check className="w-5 h-5" /> : <Download className="w-5 h-5" />) : <LogIn className="w-5 h-5" />}
          {isAuthenticated ? t('downloadPng') : t('loginToDownload')}
        </button>

        <div className="flex gap-2 w-full">
          <button
            onClick={isAuthenticated ? downloadSVG : () => { }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            <FileType className="w-4 h-4" /> SVG
          </button>
          <button
            onClick={copyToClipboard}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? t('copied') : t('copy')}
          </button>
        </div>

        {!isAuthenticated && (
          <div className="mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-center">
            <p className="text-xs text-blue-800 font-medium leading-relaxed">
              {t('downloadRequiresLoginDesc') || 'Tüm formatlarda indirmek ve çerçeveleri kullanmak için ücretsiz hesap oluşturun.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
