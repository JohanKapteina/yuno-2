import { ExternalLink, ImageOff, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'

export interface SmartMediaImageProps {
  /** Wikipedia article title for live Wikimedia REST API loading */
  wikiTitle?: string
  /** Wikipedia language edition (defaults to 'de') */
  wikiLang?: 'de' | 'en'
  /** Optional verified direct upload.wikimedia.org URL */
  src?: string
  alt: string
  caption?: string
  credit: string
  sourceUrl?: string
  aspectClass?: string
  objectPosition?: string
  className?: string
  /** Optional interactive overlay rendered inside the image container (e.g. hotspots) */
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

  return (
    <figure className={`overflow-hidden rounded-2xl border border-white/10 bg-[#0E1525] ${className}`}>
      <div
        onClick={handleContainerClick}
        className={`relative w-full overflow-hidden bg-[#0A101D] ${aspectClass} ${onImageClick ? 'cursor-crosshair select-none' : ''}`}
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0E1525] text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            <span className="text-xs tracking-wide uppercase">Lade Wikimedia-Archivbild…</span>
          </div>
        )}

        {!loading && errored && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#11192D] to-[#0B0F19] p-6 text-center">
            <ImageOff className="h-7 w-7 text-slate-500" />
            <p className="text-sm font-medium text-slate-300">{alt}</p>
            <p className="text-xs text-slate-500">
              Medienquelle derzeit offline oder blockiert ({credit})
            </p>
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
              // Automatic fallback: if direct src failed and wikiTitle exists, retry via REST API
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
            className={`h-full w-full object-cover transition-opacity duration-500 ${objectPosition} ${loading ? 'opacity-0' : 'opacity-100'}`}
          />
        )}

        {overlay}
      </div>

      {(caption || credit) && (
        <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] bg-[#0D1322] px-4 py-2.5 text-xs text-slate-400">
          <span className="leading-relaxed text-slate-300">{caption ?? alt}</span>
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
            <span>Quelle: {credit}</span>
            {resolvedSourceUrl && (
              <a
                href={resolvedSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-indigo-400 transition hover:text-indigo-300"
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
