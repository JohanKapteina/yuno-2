/**
 * Bulletproof native Web Audio API playback engine.
 * Unlocks AudioContext synchronously inside user-gesture click handlers so
 * audio plays reliably across Safari, Chrome, iOS/iPadOS, and macOS WKWebView.
 */

export interface SynthNote {
  /** Pitch string like "C4", "Eb4", "G4", "C5" */
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
      return 1.6
    case '2n':
      return 0.8
    case '4n':
      return 0.42
    case '8n':
      return 0.22
    case '16n':
      return 0.12
    default: {
      const num = Number(duration)
      return Number.isFinite(num) && num > 0 ? num : 0.4
    }
  }
}

let sharedCtx: AudioContext | null = null
let activeNodes: Array<{ stop: () => void }> = []

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = new Ctor()
  }
  if (sharedCtx.state === 'suspended') {
    void sharedCtx.resume()
  }
  return sharedCtx
}

export function stopAllAudio(): void {
  for (const node of activeNodes) {
    try {
      node.stop()
    } catch {
      // Ignore already-stopped nodes
    }
  }
  activeNodes = []
}

function scheduleWarmTone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  durationSec: number,
  volume = 0.22,
) {
  // Fundamental + soft warm second harmonic (sounds like a mellow brass / Rhodes horn)
  const osc1 = ctx.createOscillator()
  const osc2 = ctx.createOscillator()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()

  osc1.type = 'triangle'
  osc1.frequency.setValueAtTime(freq, startTime)

  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(freq * 2, startTime)

  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(Math.min(2800, freq * 5), startTime)

  const osc2Gain = ctx.createGain()
  osc2Gain.gain.setValueAtTime(0.25, startTime)

  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.025)
  gain.gain.exponentialRampToValueAtTime(volume * 0.65, startTime + Math.max(0.06, durationSec * 0.65))
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec + 0.08)

  osc1.connect(filter)
  osc2.connect(osc2Gain)
  osc2Gain.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  osc1.start(startTime)
  osc2.start(startTime)
  osc1.stop(startTime + durationSec + 0.1)
  osc2.stop(startTime + durationSec + 0.1)

  activeNodes.push({
    stop: () => {
      osc1.stop()
      osc2.stop()
    },
  })
}

export function playSinglePitch(pitch: string, durationSec = 0.45): boolean {
  const ctx = getAudioContext()
  if (!ctx) return false
  const start = ctx.currentTime + 0.01
  scheduleWarmTone(ctx, pitchToFrequency(pitch), start, durationSec, 0.24)
  return true
}

export function playMelody(
  notes: SynthNote[],
  onNoteIndex?: (idx: number | null) => void,
): { totalMs: number; cancel: () => void } {
  stopAllAudio()
  const ctx = getAudioContext()
  const timers: number[] = []

  if (!ctx) {
    onNoteIndex?.(null)
    return { totalMs: 0, cancel: () => {} }
  }

  const baseTime = ctx.currentTime + 0.03
  let maxEndSec = 0

  notes.forEach((n, idx) => {
    const start = baseTime + n.offsetSec
    scheduleWarmTone(ctx, pitchToFrequency(n.pitch), start, n.durationSec, 0.24)
    maxEndSec = Math.max(maxEndSec, n.offsetSec + n.durationSec)

    if (onNoteIndex) {
      const tid = window.setTimeout(() => onNoteIndex(idx), Math.round(n.offsetSec * 1000))
      timers.push(tid)
    }
  })

  const totalMs = Math.round((maxEndSec + 0.18) * 1000)
  if (onNoteIndex) {
    const endTid = window.setTimeout(() => onNoteIndex(null), totalMs)
    timers.push(endTid)
  }

  return {
    totalMs,
    cancel: () => {
      for (const tid of timers) window.clearTimeout(tid)
      stopAllAudio()
      onNoteIndex?.(null)
    },
  }
}

/** Recognizable opening phrase of "The Star-Spangled Banner" in Bb/C major */
export const STAR_SPANGLED_OPENING: SynthNote[] = [
  { pitch: 'G4', durationSec: 0.26, offsetSec: 0.0 },
  { pitch: 'E4', durationSec: 0.18, offsetSec: 0.28 },
  { pitch: 'C4', durationSec: 0.42, offsetSec: 0.48 },
  { pitch: 'E4', durationSec: 0.42, offsetSec: 0.94 },
  { pitch: 'G4', durationSec: 0.44, offsetSec: 1.40 },
  { pitch: 'C5', durationSec: 0.78, offsetSec: 1.88 },
  { pitch: 'E5', durationSec: 0.26, offsetSec: 2.74 },
  { pitch: 'D5', durationSec: 0.18, offsetSec: 3.02 },
  { pitch: 'C5', durationSec: 0.42, offsetSec: 3.22 },
  { pitch: 'E4', durationSec: 0.42, offsetSec: 3.68 },
  { pitch: 'F#4', durationSec: 0.44, offsetSec: 4.14 },
  { pitch: 'G4', durationSec: 0.85, offsetSec: 4.62 },
]
