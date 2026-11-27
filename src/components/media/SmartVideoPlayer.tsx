import {
  Clock,
  ExternalLink,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

export interface SmartVideoPlayerProps {
  videoId: string
  start: number
  end: number
  title: string
  channel: string
  segmentLabel: string
  className?: string
}

/* Minimal typings for the official YouTube IFrame Player API */
interface YTPlayer {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void
  mute: () => void
  unMute: () => void
  isMuted: () => boolean
  getCurrentTime: () => number
  getPlayerState: () => number
  destroy: () => void
}

interface YTNamespace {
  Player: new (
    elementId: string,
    options: {
      videoId: string
      host?: string
      width?: string | number
      height?: string | number
      playerVars?: Record<string, string | number>
      events?: {
        onReady?: (ev: { target: YTPlayer }) => void
        onStateChange?: (ev: { data: number; target: YTPlayer }) => void
      }
    },
  ) => YTPlayer
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let ytApiPromise: Promise<YTNamespace> | null = null

function loadYouTubeIframeAPI(): Promise<YTNamespace> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('SSR'))
  }
  if (window.YT && window.YT.Player) {
    return Promise.resolve(window.YT)
  }
  if (ytApiPromise) return ytApiPromise

  ytApiPromise = new Promise<YTNamespace>((resolve) => {
    const prevCallback = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prevCallback?.()
      if (window.YT) resolve(window.YT)
    }
    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
    if (!existing) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      tag.async = true
      document.head.appendChild(tag)
    }
  })
  return ytApiPromise
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
  const reactId = useId().replace(/:/g, '')
  const mountId = `yt-player-${videoId}-${reactId}`
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YTPlayer | null>(null)

  const [started, setStarted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentSec, setCurrentSec] = useState(start)
  const [hudVisible, setHudVisible] = useState(false)
  const [posterSrc, setPosterSrc] = useState(`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`)
  const [useFallbackCrop, setUseFallbackCrop] = useState(false)

  const durationSec = Math.max(1, end - start)
  const directWatchUrl = `https://www.youtube.com/watch?v=${videoId}&t=${start}s`

  // Immediately hide HUD when clicking anywhere outside the video player
  useEffect(() => {
    if (!started) return
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setHudVisible(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [started])

  // Initialize official YouTube IFrame Player with standard youtube.com host (keeps YouTube Premium ad-free!)
  // and controls=0 (eliminates YouTube's sluggish 5-second progress bar & thick borders!)
  useEffect(() => {
    if (!started) return
    let cancelled = false

    loadYouTubeIframeAPI()
      .then((YT) => {
        if (cancelled) return
        const origin =
          window.location.origin.startsWith('http') ? window.location.origin : undefined

        const player = new YT.Player(mountId, {
          videoId,
          host: 'https://www.youtube.com',
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 0,
            fs: 1,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            start,
            end,
            ...(origin ? { origin } : {}),
          },
          events: {
            onReady: (ev) => {
              if (cancelled) return
              playerRef.current = ev.target
              ev.target.playVideo()
            },
            onStateChange: (ev) => {
              if (cancelled) return
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
              if (ev.data === 1) {
                setIsPlaying(true)
              } else if (ev.data === 2) {
                setIsPlaying(false)
              } else if (ev.data === 0) {
                setIsPlaying(false)
                setCurrentSec(end)
                setHudVisible(true)
              }
            },
          },
        })
        playerRef.current = player
      })
      .catch(() => {
        // Fallback handled via direct YouTube link
      })

    return () => {
      cancelled = true
      try {
        playerRef.current?.destroy()
      } catch {
        // ignore
      }
      playerRef.current = null
    }
  }, [started, videoId, start, end, mountId])

  // Track playback position smoothly for our instant-hide Apple HUD scrubber
  useEffect(() => {
    if (!started || !isPlaying) return
    const timer = window.setInterval(() => {
      const t = playerRef.current?.getCurrentTime?.()
      if (typeof t === 'number' && Number.isFinite(t)) {
        setCurrentSec(Math.min(end, Math.max(start, t)))
        if (t >= end) {
          playerRef.current?.pauseVideo()
          setIsPlaying(false)
          setHudVisible(true)
        }
      }
    }, 250)
    return () => window.clearInterval(timer)
  }, [started, isPlaying, start, end])

  const togglePlay = () => {
    const p = playerRef.current
    if (!p) return
    if (isPlaying) {
      p.pauseVideo()
      setIsPlaying(false)
    } else {
      if (currentSec >= end - 0.5) {
        p.seekTo(start, true)
        setCurrentSec(start)
      }
      p.playVideo()
      setIsPlaying(true)
      setHudVisible(false)
    }
  }

  const toggleMute = () => {
    const p = playerRef.current
    if (!p) return
    if (isMuted) {
      p.unMute()
      setIsMuted(false)
    } else {
      p.mute()
      setIsMuted(true)
    }
  }

  const handleReplay = () => {
    const p = playerRef.current
    if (!p) return
    p.seekTo(start, true)
    setCurrentSec(start)
    p.playVideo()
    setIsPlaying(true)
    setHudVisible(false)
  }

  const handleSeek = (newSec: number) => {
    const clamped = Math.max(start, Math.min(end, newSec))
    setCurrentSec(clamped)
    playerRef.current?.seekTo(clamped, true)
  }

  const handleFullscreen = () => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void el.requestFullscreen?.()
    }
  }

  const relativeElapsed = Math.max(0, Math.min(durationSec, currentSec - start))

  return (
    <div
      className={`overflow-hidden rounded-3xl border border-black/[0.08] bg-white shadow-[0_8px_28px_-14px_rgba(0,0,0,0.08)] ${className}`}
    >
      <div
        ref={containerRef}
        onMouseEnter={() => {
          if (started) setHudVisible(true)
        }}
        onMouseLeave={() => {
          if (started) setHudVisible(false)
        }}
        className="relative aspect-video w-full overflow-hidden bg-black"
      >
        {!started ? (
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="group relative block h-full w-full overflow-hidden text-left"
          >
            {/* Full-bleed 16:9 edge-to-edge poster (zero YouTube black bars!) */}
            <img
              src={posterSrc}
              alt={title}
              loading="lazy"
              onLoad={(e) => {
                // YouTube returns a 120x90 placeholder if maxresdefault doesn't exist
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

            {/* Top-left clean time badge */}
            <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 rounded-full bg-white/92 px-3 py-1 text-xs font-bold text-[#1D1D1F] shadow-sm backdrop-blur-md">
              <Clock className="h-3.5 w-3.5 text-[#0071E3]" />
              <span className="font-mono">
                {formatSeconds(start)} – {formatSeconds(end)}
              </span>
              <span className="font-normal text-[#6E6E73]">({durationSec}s)</span>
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
          <div className="relative h-full w-full overflow-hidden bg-black">
            {/* Slightly oversized 16:9 wrapper hides YouTube's subtle edge chrome */}
            <div className="absolute -inset-[2px]">
              <div id={mountId} className="h-full w-full" />
            </div>

            {/* Transparent click layer: click to toggle Play/Pause, zero 5s YouTube overlay */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pausieren' : 'Abspielen'}
              className="absolute inset-0 z-10 flex items-center justify-center bg-transparent focus:outline-none"
            >
              {!isPlaying && (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-[#1D1D1F] shadow-[0_12px_36px_rgba(0,0,0,0.45)] transition hover:scale-105">
                  <Play className="ml-1 h-7 w-7 fill-current" />
                </div>
              )}
            </button>

            {/* Sleek Instant-Hide Apple Control HUD (fades out in 150ms on mouse leave or outside click!) */}
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute right-3 bottom-3 left-3 z-20 flex items-center gap-2.5 rounded-2xl bg-[#1D1D1F]/82 px-3.5 py-2 text-white shadow-lg backdrop-blur-xl transition-opacity duration-150 ${
                hudVisible || !isPlaying ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              <button
                type="button"
                onClick={togglePlay}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
                title={isPlaying ? 'Pause' : 'Abspielen'}
              >
                {isPlaying ? (
                  <Pause className="h-3.5 w-3.5 fill-current" />
                ) : (
                  <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
                )}
              </button>

              <span className="shrink-0 font-mono text-[11px] font-semibold tabular-nums text-white/85">
                {formatSeconds(relativeElapsed)}
              </span>

              <input
                type="range"
                min={start}
                max={end}
                step={0.5}
                value={currentSec}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="h-1.5 flex-1 cursor-pointer accent-white"
                aria-label="Videoposition"
              />

              <span className="shrink-0 font-mono text-[11px] font-semibold tabular-nums text-white/65">
                {formatSeconds(durationSec)}
              </span>

              <button
                type="button"
                onClick={toggleMute}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-white/15"
                title={isMuted ? 'Ton an' : 'Stumm'}
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleReplay}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-white/15"
                title="Ausschnitt neu starten"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={handleFullscreen}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-white/15"
                title="Vollbild"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
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
          {started && (
            <button
              type="button"
              onClick={handleReplay}
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
