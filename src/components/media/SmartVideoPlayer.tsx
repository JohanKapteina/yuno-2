import { Clock, ExternalLink, Play, RotateCcw } from 'lucide-react'
import { useState } from 'react'

export interface SmartVideoPlayerProps {
  /** Verified YouTube video ID */
  videoId: string
  /** Exact start timestamp in seconds (mandatory per MEDIA_RULES.md) */
  start: number
  /** Exact end timestamp in seconds (mandatory per MEDIA_RULES.md) */
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
  const embedSrc = `https://www.youtube-nocookie.com/embed/${videoId}?start=${start}&end=${end}&autoplay=1&rel=0&modestbranding=1`
  const directWatchUrl = `https://www.youtube.com/watch?v=${videoId}&t=${start}s`
  const posterUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`

  return (
    <div className={`overflow-hidden rounded-2xl border border-white/10 bg-[#0E1525] ${className}`}>
      <div className="relative aspect-video w-full bg-[#070B13]">
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
              className="h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent" />

            <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full border border-white/15 bg-[#0B0F19]/80 px-3 py-1 text-xs font-medium text-amber-300 backdrop-blur-md">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-mono">
                {formatSeconds(start)} – {formatSeconds(end)}
              </span>
              <span className="text-slate-400">({durationSec}s Clip)</span>
            </div>

            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-indigo-500/90 text-white shadow-[0_0_40px_rgba(99,102,241,0.5)] transition duration-200 group-hover:scale-110 group-hover:bg-indigo-400">
              <Play className="ml-1 h-7 w-7 fill-current" />
            </div>

            <div className="absolute right-4 bottom-4 left-4 z-10">
              <p className="text-xs font-semibold tracking-wider text-indigo-300 uppercase">
                {segmentLabel}
              </p>
              <p className="mt-0.5 line-clamp-1 text-sm font-semibold text-white sm:text-base">
                {title}
              </p>
              <p className="text-xs text-slate-400">{channel} · youtube-nocookie.com</p>
            </div>
          </button>
        ) : (
          <iframe
            key={`${videoId}-${start}-${end}-${reloadNonce}`}
            src={embedSrc}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] bg-[#0D1322] px-4 py-2.5 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
          <span>
            Exakter Ausschnitt: <strong className="font-mono text-slate-200">{formatSeconds(start)}–{formatSeconds(end)}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isPlaying && (
            <button
              type="button"
              onClick={() => setReloadNonce((n) => n + 1)}
              className="inline-flex items-center gap-1 text-slate-300 transition hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clip neu starten</span>
            </button>
          )}
          <a
            href={directWatchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-indigo-400 transition hover:text-indigo-300"
          >
            <span>Auf YouTube öffnen</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
