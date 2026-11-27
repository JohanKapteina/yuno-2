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
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
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
  const [isPlaying, setIsPlaying] = useState(false)
  const [reloadNonce, setReloadNonce] = useState(0)

  const durationSec = Math.max(1, end - start)
  const originParam =
    typeof window !== 'undefined' && window.location.origin.startsWith('http')
      ? `&origin=${encodeURIComponent(window.location.origin)}`
      : ''
  const embedSrc = `https://www.youtube-nocookie.com/embed/${videoId}?start=${start}&end=${end}&autoplay=1&rel=0&modestbranding=1&playsinline=1${originParam}`
  const directWatchUrl = `https://www.youtube.com/watch?v=${videoId}&t=${start}s`
  const posterUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`

  return (
    <div
      className={`overflow-hidden rounded-3xl border border-black/[0.08] bg-white shadow-[0_8px_28px_-14px_rgba(0,0,0,0.08)] ${className}`}
    >
      <div className="relative aspect-video w-full bg-[#1D1D1F]">
        {!isPlaying ? (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="group relative flex h-full w-full items-center justify-center overflow-hidden text-left"
          >
            <img
              src={posterUrl}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />

            <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#1D1D1F] shadow-sm backdrop-blur-md">
              <Clock className="h-3.5 w-3.5 text-[#0071E3]" />
              <span className="font-mono">
                {formatSeconds(start)} – {formatSeconds(end)}
              </span>
              <span className="font-normal text-[#6E6E73]">({durationSec}s)</span>
            </div>

            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#1D1D1F] shadow-[0_12px_32px_rgba(0,0,0,0.35)] transition duration-200 group-hover:scale-110">
              <Play className="ml-1 h-7 w-7 fill-current" />
            </div>

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
            key={`${videoId}-${start}-${end}-${reloadNonce}`}
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
            Ausschnitt:{' '}
            <strong className="font-mono text-[#1D1D1F]">
              {formatSeconds(start)}–{formatSeconds(end)}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isPlaying && (
            <button
              type="button"
              onClick={() => setReloadNonce((n) => n + 1)}
              className="inline-flex items-center gap-1 font-semibold text-[#1D1D1F] transition hover:text-[#0071E3]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Neu starten</span>
            </button>
          )}
          <a
            href={directWatchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[#0071E3] transition hover:underline"
          >
            <span>Auf YouTube öffnen</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
