import { Clock, ExternalLink, Play, RotateCcw } from 'lucide-react'
import { useState } from 'react'

export interface SmartVideoPlayerProps {
  videoId: string
  start: number
  end: number
  title: string
  channel: string
  segmentLabel: string
  className?: string
}

function formatSeconds(sec: number): string {
  const clamped = Math.max(0, Math.floor(sec))
  const m = Math.floor(clamped / 60)
  const s = clamped % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function SmartVideoPlayer({
  videoId,
  start,
  end,
  title,
  channel,
  segmentLabel,
  className = '',
}: SmartVideoPlayerProps) {
  const [started, setStarted] = useState(false)
  const [reloadNonce, setReloadNonce] = useState(0)
  const [posterSrc, setPosterSrc] = useState(`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`)
  const [useFallbackCrop, setUseFallbackCrop] = useState(false)

  const durationSec = Math.max(1, end - start)
  const originParam =
    typeof window !== 'undefined' && window.location.origin.startsWith('http')
      ? `&origin=${encodeURIComponent(window.location.origin)}`
      : ''

  // Start directly at the key moment without hard-cutting at `end`,
  // and keep native YouTube controls unobstructed so "Werbung überspringen",
  // full-video scrubbing, subtitles, and fullscreen all work cleanly.
  const embedSrc = `https://www.youtube.com/embed/${videoId}?start=${start}&autoplay=1&rel=0&playsinline=1&iv_load_policy=3${originParam}`
  const directWatchUrl = `https://www.youtube.com/watch?v=${videoId}&t=${start}s`

  return (
    <div
      className={`overflow-hidden rounded-3xl border border-black/[0.08] bg-white shadow-[0_8px_28px_-14px_rgba(0,0,0,0.08)] ${className}`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {!started ? (
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="group relative block h-full w-full overflow-hidden text-left"
          >
            {/* Full-bleed 16:9 poster */}
            <img
              src={posterSrc}
              alt={title}
              loading="lazy"
              onLoad={(e) => {
                if (e.currentTarget.naturalWidth <= 120 && posterSrc.includes('maxresdefault')) {
                  setPosterSrc(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`)
                  setUseFallbackCrop(true)
                }
              }}
              onError={() => {
                if (posterSrc.includes('maxresdefault')) {
                  setPosterSrc(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`)
                  setUseFallbackCrop(true)
                }
              }}
              className={`absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
                useFallbackCrop ? 'scale-[1.34]' : ''
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/15" />

            {/* Top-left recommended key segment badge */}
            <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 rounded-full bg-white/92 px-3 py-1 text-xs font-bold text-[#1D1D1F] shadow-sm backdrop-blur-md">
              <Clock className="h-3.5 w-3.5 text-[#0071E3]" />
              <span className="font-mono">
                Start {formatSeconds(start)}
              </span>
              <span className="font-normal text-[#6E6E73]">
                (Tipp: bis {formatSeconds(end)} · {durationSec}s)
              </span>
            </div>

            {/* Dead-center Apple Play Button */}
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-[#1D1D1F] shadow-[0_12px_36px_rgba(0,0,0,0.4)] transition duration-200 group-hover:scale-110 group-hover:bg-white">
                <Play className="ml-1 h-7 w-7 fill-current" />
              </div>
            </div>

            {/* Bottom Title Overlay */}
            <div className="absolute right-4 bottom-4 left-4 z-10">
              <p className="text-[11px] font-bold tracking-wider text-white/80 uppercase">
                {segmentLabel}
              </p>
              <p className="mt-0.5 line-clamp-1 text-sm font-bold text-white sm:text-base">
                {title}
              </p>
              <p className="text-xs text-white/75">{channel}</p>
            </div>
          </button>
        ) : (
          <iframe
            key={`${videoId}-${start}-${reloadNonce}`}
            src={embedSrc}
            title={title}
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full border-0"
          />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/[0.06] bg-[#FAFAFC] px-4 py-2.5 text-xs text-[#6E6E73]">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-[#28CD41]" />
          <span>
            Schlüsselstelle:{' '}
            <strong className="font-mono text-[#1D1D1F]">
              {formatSeconds(start)}–{formatSeconds(end)}
            </strong>{' '}
            <span className="text-[#86868B]">(ganzes Video abspielbar)</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {started && (
            <button
              type="button"
              onClick={() => setReloadNonce((n) => n + 1)}
              className="inline-flex items-center gap-1 rounded-full bg-[#EFEFF4] px-3 py-1 font-bold text-[#1D1D1F] transition hover:bg-[#E5E5EA]"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Ab {formatSeconds(start)}</span>
            </button>
          )}
          <a
            href={directWatchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#1D1D1F] px-3.5 py-1 font-bold text-white transition hover:bg-[#0071E3]"
            title="Öffnet direkt in deinem YouTube-Premium-Browser ab der exakten Stelle — garantiert werbefrei"
          >
            <span>Werbefrei in YouTube (Premium)</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
