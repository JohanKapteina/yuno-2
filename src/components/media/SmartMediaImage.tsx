import { ExternalLink, ImageOff, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'

export interface SmartMediaImageProps {
  wikiTitle?: string
  wikiLang?: 'de' | 'en'
  src?: string
  alt: string
  caption?: string
  credit: string
  sourceUrl?: string
  aspectClass?: string
  objectPosition?: string
  /**
   * 'contain' (default): shows 100% of the photo centered inside a clean light frame — never crops faces or birds.
   * 'natural': renders at the photo's exact natural aspect ratio (ideal for hotspot scanners & quizzes!).
   * 'cover': edge-to-edge fill (only for wide landscape banners).
   */
  fit?: 'contain' | 'cover' | 'natural'
  className?: string
  overlay?: ReactNode
  onImageClick?: (coords: { xPct: number; yPct: number }) => void
}

interface WikiSummaryResponse {
  thumbnail?: { source: string }
  originalimage?: { source: string }
  content_urls?: { desktop?: { page?: string } }
}

const wikiCache = new Map<string, { url: string; pageUrl?: string }>()

export function SmartMediaImage({
  wikiTitle,
  wikiLang = 'de',
  src,
  alt,
  caption,
  credit,
  sourceUrl,
  aspectClass = 'aspect-[16/10]',
  objectPosition = 'object-center',
  fit = 'contain',
  className = '',
  overlay,
  onImageClick,
}: SmartMediaImageProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(src ?? null)
  const [resolvedSourceUrl, setResolvedSourceUrl] = useState<string | undefined>(sourceUrl)
  const [loading, setLoading] = useState<boolean>(!src && Boolean(wikiTitle))
  const [errored, setErrored] = useState<boolean>(false)

  useEffect(() => {
    let cancelled = false
    setErrored(false)

    if (src) {
      setResolvedUrl(src)
      setLoading(false)
      return
    }

    if (!wikiTitle) {
      setLoading(false)
      setErrored(true)
      return
    }

    const cacheKey = `${wikiLang}:${wikiTitle}`
    const cached = wikiCache.get(cacheKey)
    if (cached) {
      setResolvedUrl(cached.url)
      if (!sourceUrl && cached.pageUrl) setResolvedSourceUrl(cached.pageUrl)
      setLoading(false)
      return
    }

    setLoading(true)
    const endpoint = `https://${wikiLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`

    fetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error('Wikimedia REST fetch failed')
        return res.json() as Promise<WikiSummaryResponse>
      })
      .then((data) => {
        if (cancelled) return
        const imgUrl = data.originalimage?.source ?? data.thumbnail?.source
        const pageUrl = data.content_urls?.desktop?.page
        if (imgUrl) {
          wikiCache.set(cacheKey, { url: imgUrl, pageUrl })
          setResolvedUrl(imgUrl)
          if (!sourceUrl && pageUrl) setResolvedSourceUrl(pageUrl)
        } else {
          setErrored(true)
        }
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setErrored(true)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [src, wikiTitle, wikiLang, sourceUrl])

  const handleContainerClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!onImageClick) return
    const rect = e.currentTarget.getBoundingClientRect()
    const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
    onImageClick({ xPct, yPct })
  }

  const isNatural = fit === 'natural'

  return (
    <figure
      className={`overflow-hidden rounded-3xl border border-black/[0.08] bg-white shadow-[0_8px_28px_-14px_rgba(0,0,0,0.08)] ${className}`}
    >
      <div
        onClick={handleContainerClick}
        className={`relative w-full overflow-hidden bg-[#F2F2F7] ${
          isNatural ? 'min-h-[220px]' : aspectClass
        } ${onImageClick ? 'cursor-crosshair select-none' : ''}`}
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#F2F2F7] text-[#6E6E73]">
            <Loader2 className="h-6 w-6 animate-spin text-[#0071E3]" />
            <span className="text-xs font-semibold">Lade Archivbild…</span>
          </div>
        )}

        {!loading && errored && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#F2F2F7] p-6 text-center">
            <ImageOff className="h-7 w-7 text-[#86868B]" />
            <p className="text-sm font-semibold text-[#1D1D1F]">{alt}</p>
            <p className="text-xs text-[#6E6E73]">Bildquelle derzeit offline ({credit})</p>
          </div>
        )}

        {!errored && resolvedUrl && (
          <img
            src={resolvedUrl}
            alt={alt}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setLoading(false)}
            onError={() => {
              if (src && wikiTitle && resolvedUrl === src) {
                const endpoint = `https://${wikiLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`
                fetch(endpoint)
                  .then((r) => r.json() as Promise<WikiSummaryResponse>)
                  .then((d) => {
                    const fallback = d.thumbnail?.source ?? d.originalimage?.source
                    if (fallback && fallback !== src) {
                      setResolvedUrl(fallback)
                    } else {
                      setErrored(true)
                    }
                  })
                  .catch(() => setErrored(true))
              } else {
                setErrored(true)
              }
            }}
            className={
              isNatural
                ? `block h-auto max-h-[520px] w-full object-contain transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`
                : fit === 'cover'
                  ? `h-full w-full object-cover transition-opacity duration-500 ${objectPosition} ${loading ? 'opacity-0' : 'opacity-100'}`
                  : `h-full w-full object-contain object-center transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`
            }
          />
        )}

        {overlay}
      </div>

      {(caption || credit) && (
        <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-black/[0.06] bg-[#FAFAFC] px-4 py-2.5 text-xs text-[#6E6E73]">
          <span className="font-medium leading-relaxed text-[#3A3A3C]">{caption ?? alt}</span>
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#86868B]">
            <span>{credit}</span>
            {resolvedSourceUrl && (
              <a
                href={resolvedSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[#0071E3] transition hover:underline"
                title="Originalquelle öffnen"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </span>
        </figcaption>
      )}
    </figure>
  )
}
