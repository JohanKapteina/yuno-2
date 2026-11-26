import { Play, Square, Volume2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'

export interface MusicNoteSpec {
  id: string
  label: string
  pitch: string
  isSharp?: boolean
}

export interface MusicPreset {
  id: string
  label: string
  description: string
  notes: Array<{ pitch: string; duration: string; timeOffset: number }>
}

export interface MusicLabProps {
  title?: string
  subtitle?: string
  presets?: MusicPreset[]
  accent?: string
}

const DEFAULT_KEYS: MusicNoteSpec[] = [
  { id: 'C4', label: 'C', pitch: 'C4' },
  { id: 'D4', label: 'D', pitch: 'D4' },
  { id: 'Eb4', label: 'Eb', pitch: 'Eb4', isSharp: true },
  { id: 'E4', label: 'E', pitch: 'E4' },
  { id: 'F4', label: 'F', pitch: 'F4' },
  { id: 'G4', label: 'G', pitch: 'G4' },
  { id: 'A4', label: 'A', pitch: 'A4' },
  { id: 'B4', label: 'H', pitch: 'B4' },
  { id: 'C5', label: 'C5', pitch: 'C5' },
]

const DEFAULT_PRESETS: MusicPreset[] = [
  {
    id: 'major',
    label: 'C-Dur Dreiklang',
    description: 'Große Terz (4 Halbtöne) — strahlend & stabil',
    notes: [
      { pitch: 'C4', duration: '4n', timeOffset: 0 },
      { pitch: 'E4', duration: '4n', timeOffset: 0.25 },
      { pitch: 'G4', duration: '2n', timeOffset: 0.5 },
    ],
  },
  {
    id: 'minor',
    label: 'C-Moll Dreiklang',
    description: 'Kleine Terz (3 Halbtöne) — dramatisch & ernst',
    notes: [
      { pitch: 'C4', duration: '4n', timeOffset: 0 },
      { pitch: 'Eb4', duration: '4n', timeOffset: 0.25 },
      { pitch: 'G4', duration: '2n', timeOffset: 0.5 },
    ],
  },
  {
    id: 'fanfare',
    label: 'Quinten-Motiv',
    description: 'Reine Quinte (C → G) — antikes Signal-Intervall',
    notes: [
      { pitch: 'C4', duration: '8n', timeOffset: 0 },
      { pitch: 'G4', duration: '4n', timeOffset: 0.2 },
      { pitch: 'C5', duration: '2n', timeOffset: 0.5 },
    ],
  },
]

export function MusicLab({
  title = 'Interaktives Sound-Lab',
  subtitle = 'Klicke Tasten oder Motive an, um Klangstrukturen live mit Tone.js zu hören.',
  presets = DEFAULT_PRESETS,
  accent = '#8B5CF6',
}: MusicLabProps) {
  const synthRef = useRef<Tone.PolySynth | null>(null)
  const [activeNote, setActiveNote] = useState<string | null>(null)
  const [activePresetId, setActivePresetId] = useState<string | null>(null)
  const timersRef = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id)
    timersRef.current = []
  }, [])

  useEffect(() => {
    return () => {
      clearTimers()
      synthRef.current?.dispose()
      synthRef.current = null
    }
  }, [clearTimers])

  const ensureSynth = useCallback(async () => {
    await Tone.start()
    if (!synthRef.current) {
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.15, sustain: 0.35, release: 0.8 },
      }).toDestination()
    }
    return synthRef.current
  }, [])

  const playNote = async (pitch: string) => {
    const synth = await ensureSynth()
    synth.triggerAttackRelease(pitch, '4n')
    setActiveNote(pitch)
    const tid = window.setTimeout(() => setActiveNote((cur) => (cur === pitch ? null : cur)), 280)
    timersRef.current.push(tid)
  }

  const playPreset = async (preset: MusicPreset) => {
    clearTimers()
    const synth = await ensureSynth()
    setActivePresetId(preset.id)
    const now = Tone.now()

    let maxOffset = 0
    for (const n of preset.notes) {
      synth.triggerAttackRelease(n.pitch, n.duration, now + n.timeOffset)
      maxOffset = Math.max(maxOffset, n.timeOffset)
      const onId = window.setTimeout(() => setActiveNote(n.pitch), n.timeOffset * 1000)
      timersRef.current.push(onId)
    }

    const doneId = window.setTimeout(() => {
      setActiveNote(null)
      setActivePresetId(null)
    }, (maxOffset + 0.65) * 1000)
    timersRef.current.push(doneId)
  }

  const stopAll = () => {
    clearTimers()
    synthRef.current?.releaseAll()
    setActiveNote(null)
    setActivePresetId(null)
  }

  return (
    <div className="editorial-card rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase" style={{ color: accent }}>
            <Volume2 className="h-4 w-4" />
            <span>Tone.js Audio-Engine</span>
          </div>
          <h4 className="mt-1 text-base font-semibold text-white">{title}</h4>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
        {activePresetId && (
          <button
            type="button"
            onClick={stopAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10"
          >
            <Square className="h-3 w-3 fill-current" />
            Stopp
          </button>
        )}
      </div>

      {/* Interactive Piano/Tone Pads */}
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-9">
        {DEFAULT_KEYS.map((key) => {
          const isActive = activeNote === key.pitch
          return (
            <button
              key={key.id}
              type="button"
              onClick={() => playNote(key.pitch)}
              style={
                isActive
                  ? {
                      borderColor: accent,
                      backgroundColor: `${accent}33`,
                      boxShadow: `0 0 24px ${accent}44`,
                    }
                  : undefined
              }
              className={`flex h-16 flex-col items-center justify-between rounded-xl border p-2.5 text-xs font-semibold transition active:scale-95 ${
                key.isSharp
                  ? 'border-white/15 bg-[#0B0F19] text-slate-300 hover:border-white/30'
                  : 'border-white/10 bg-[#18223A] text-white hover:border-white/25'
              }`}
            >
              <span className="font-mono text-[10px] text-slate-400">{key.pitch}</span>
              <span className="text-sm">{key.label}</span>
            </button>
          )
        })}
      </div>

      {/* Preset Motives */}
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {presets.map((preset) => {
          const playing = activePresetId === preset.id
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => playPreset(preset)}
              className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition ${
                playing
                  ? 'border-violet-400/60 bg-violet-500/15'
                  : 'border-white/8 bg-[#0E1525] hover:border-white/20'
              }`}
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-violet-300">
                <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-white">{preset.label}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-slate-400">
                  {preset.description}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
