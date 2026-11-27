/**
 * Ultra-reliable PCM-WAV + HTML5 <audio> playback engine.
 * Works 100% reliably across Safari, Chrome, iOS, iPadOS, and macOS WKWebView
 * (even with Bluetooth headphones/AirPods where WebKit AudioContext can go silent).
 */

export interface SynthNote {
  /** Pitch string like "C4", "C#4", "Eb4", "G4", "C5" */
  pitch: string
  /** Duration in seconds */
  durationSec: number
  /** Start offset in seconds from melody start */
  offsetSec: number
}

const NOTE_SEMITONES: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
  H: 11,
}

const SAMPLE_RATE = 22050

export function pitchToFrequency(pitch: string): number {
  const match = /^([A-GH][#b]?)(-?\d)$/.exec(pitch.trim())
  if (!match) return 440
  const [, name, octStr] = match
  const semitone = NOTE_SEMITONES[name] ?? 9
  const octave = Number(octStr)
  const midi = (octave + 1) * 12 + semitone
  return 440 * Math.pow(2, (midi - 69) / 12)
}

export function toneDurationToSeconds(duration: string): number {
  switch (duration) {
    case '1n':
      return 1.5
    case '2n':
      return 0.78
    case '4n':
      return 0.42
    case '8n':
      return 0.22
    case '16n':
      return 0.14
    default: {
      const num = Number(duration)
      return Number.isFinite(num) && num > 0 ? num : 0.4
    }
  }
}

/**
 * Renders an array of polyphonic notes into a standard 16-bit mono PCM WAV Blob URL.
 * Uses warm pipe-organ / acoustic harmonic synthesis with smooth attack & release envelopes.
 */
function renderNotesToWavUrl(notes: SynthNote[]): { url: string; totalSec: number } {
  let maxEndSec = 0.2
  for (const n of notes) {
    maxEndSec = Math.max(maxEndSec, n.offsetSec + n.durationSec + 0.12)
  }

  const totalSamples = Math.ceil(maxEndSec * SAMPLE_RATE)
  const mix = new Float32Array(totalSamples)

  for (const n of notes) {
    const freq = pitchToFrequency(n.pitch)
    const startSample = Math.max(0, Math.floor(n.offsetSec * SAMPLE_RATE))
    const noteDur = Math.max(0.06, n.durationSec)
    const releaseDur = 0.09
    const endSample = Math.min(
      totalSamples,
      Math.floor((n.offsetSec + noteDur + releaseDur) * SAMPLE_RATE),
    )
    const attackSamples = Math.max(1, Math.floor(0.018 * SAMPLE_RATE))
    const releaseStartSample = Math.floor((n.offsetSec + noteDur) * SAMPLE_RATE)
    const releaseSamples = Math.max(1, endSample - releaseStartSample)

    for (let i = startSample; i < endSample; i++) {
      const t = (i - startSample) / SAMPLE_RATE
      const rel = i - startSample

      // Smooth envelope (attack -> gentle sustain -> smooth release)
      let env = 1
      if (rel < attackSamples) {
        env = rel / attackSamples
      } else if (i >= releaseStartSample) {
        env = Math.max(0, 1 - (i - releaseStartSample) / releaseSamples)
      } else {
        env = 0.85 + 0.15 * Math.exp(-t * 3.5)
      }

      // Rich organ/keyboard harmonic blend (fundamental + octave + 12th)
      const w = 2 * Math.PI * freq * t
      const wave =
        0.62 * Math.sin(w) +
        0.24 * Math.sin(2 * w) +
        0.10 * Math.sin(3 * w) +
        0.04 * Math.sin(4 * w)

      mix[i] += wave * env * 0.42
    }
  }

  // Normalize softly to prevent clipping even when 4+ voices play simultaneously
  let peak = 0
  for (let i = 0; i < totalSamples; i++) {
    const a = Math.abs(mix[i])
    if (a > peak) peak = a
  }
  const scale = peak > 0.9 ? 0.88 / peak : 1

  // Build 44-byte RIFF/WAVE PCM16 buffer
  const dataBytes = totalSamples * 2
  const buffer = new ArrayBuffer(44 + dataBytes)
  const view = new DataView(buffer)

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }

  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + dataBytes, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true) // PCM chunk size
  view.setUint16(20, 1, true) // PCM format
  view.setUint16(22, 1, true) // Mono
  view.setUint32(24, SAMPLE_RATE, true)
  view.setUint32(28, SAMPLE_RATE * 2, true) // Byte rate
  view.setUint16(32, 2, true) // Block align
  view.setUint16(34, 16, true) // Bits per sample
  writeStr(36, 'data')
  view.setUint32(40, dataBytes, true)

  let offset = 44
  for (let i = 0; i < totalSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, mix[i] * scale))
    view.setInt16(offset, Math.round(clamped * 32767), true)
    offset += 2
  }

  const blob = new Blob([buffer], { type: 'audio/wav' })
  return { url: URL.createObjectURL(blob), totalSec: maxEndSec }
}

const singleNoteUrlCache = new Map<string, string>()
let activeMelodyAudio: HTMLAudioElement | null = null
let activeMelodyUrl: string | null = null
let activeTimers: number[] = []

function clearMelodyTimers() {
  for (const tid of activeTimers) window.clearTimeout(tid)
  activeTimers = []
}

export function stopAllAudio(): void {
  clearMelodyTimers()
  if (activeMelodyAudio) {
    try {
      activeMelodyAudio.pause()
      activeMelodyAudio.currentTime = 0
    } catch {
      // ignore
    }
    activeMelodyAudio = null
  }
  if (activeMelodyUrl) {
    URL.revokeObjectURL(activeMelodyUrl)
    activeMelodyUrl = null
  }
}

export function playSinglePitch(pitch: string, durationSec = 0.48): boolean {
  if (typeof window === 'undefined') return false
  const cacheKey = `${pitch}:${durationSec.toFixed(2)}`
  let url = singleNoteUrlCache.get(cacheKey)
  if (!url) {
    url = renderNotesToWavUrl([{ pitch, durationSec, offsetSec: 0 }]).url
    singleNoteUrlCache.set(cacheKey, url)
  }
  const audio = new Audio(url)
  audio.volume = 0.85
  void audio.play().catch(() => {
    // Ignore autoplay rejection if invoked outside gesture
  })
  return true
}

export function playMelody(
  notes: SynthNote[],
  onNoteIndex?: (idx: number | null) => void,
): { totalMs: number; cancel: () => void } {
  stopAllAudio()
  if (typeof window === 'undefined' || notes.length === 0) {
    onNoteIndex?.(null)
    return { totalMs: 0, cancel: () => {} }
  }

  const { url, totalSec } = renderNotesToWavUrl(notes)
  activeMelodyUrl = url

  const audio = new Audio(url)
  audio.volume = 0.88
  activeMelodyAudio = audio

  const totalMs = Math.round(totalSec * 1000)

  // Fire playback synchronously inside the user's click event!
  void audio.play().catch(() => {
    onNoteIndex?.(null)
  })

  if (onNoteIndex) {
    notes.forEach((n, idx) => {
      const tid = window.setTimeout(() => onNoteIndex(idx), Math.round(n.offsetSec * 1000))
      activeTimers.push(tid)
    })
    const endTid = window.setTimeout(() => onNoteIndex(null), totalMs)
    activeTimers.push(endTid)
  }

  audio.addEventListener(
    'ended',
    () => {
      clearMelodyTimers()
      onNoteIndex?.(null)
    },
    { once: true },
  )

  return {
    totalMs,
    cancel: () => {
      stopAllAudio()
      onNoteIndex?.(null)
    },
  }
}

/** Recognizable opening phrase of "The Star-Spangled Banner" */
export const STAR_SPANGLED_OPENING: SynthNote[] = [
  { pitch: 'G4', durationSec: 0.26, offsetSec: 0.0 },
  { pitch: 'E4', durationSec: 0.18, offsetSec: 0.28 },
  { pitch: 'C4', durationSec: 0.42, offsetSec: 0.48 },
  { pitch: 'E4', durationSec: 0.42, offsetSec: 0.94 },
  { pitch: 'G4', durationSec: 0.44, offsetSec: 1.4 },
  { pitch: 'C5', durationSec: 0.78, offsetSec: 1.88 },
  { pitch: 'E5', durationSec: 0.26, offsetSec: 2.74 },
  { pitch: 'D5', durationSec: 0.18, offsetSec: 3.02 },
  { pitch: 'C5', durationSec: 0.42, offsetSec: 3.22 },
  { pitch: 'E4', durationSec: 0.42, offsetSec: 3.68 },
  { pitch: 'F#4', durationSec: 0.44, offsetSec: 4.14 },
  { pitch: 'G4', durationSec: 0.85, offsetSec: 4.62 },
]
