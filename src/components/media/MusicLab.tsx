import { Play, Square, Volume2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { playMelody, playSinglePitch, stopAllAudio, toneDurationToSeconds } from '../../lib/audioEngine'

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
    description: 'Große Terz (4 Halbtöne) — klar & stabil',
    notes: [
      { pitch: 'C4', duration: '4n', timeOffset: 0 },
      { pitch: 'E4', duration: '4n', timeOffset: 0.28 },
      { pitch: 'G4', duration: '2n', timeOffset: 0.56 },
    ],
  },
  {
    id: 'minor',
    label: 'C-Moll Dreiklang',
    description: 'Kleine Terz (3 Halbtöne) — ernst & tief',
    notes: [
      { pitch: 'C4', duration: '4n', timeOffset: 0 },
      { pitch: 'Eb4', duration: '4n', timeOffset: 0.28 },
      { pitch: 'G4', duration: '2n', timeOffset: 0.56 },
    ],
  },
  {
    id: 'fanfare',
    label: 'Quinten-Motiv',
    description: 'Reine Quinte (C → G → C5)',
    notes: [
      { pitch: 'C4', duration: '8n', timeOffset: 0 },
      { pitch: 'G4', duration: '4n', timeOffset: 0.24 },
      { pitch: 'C5', duration: '2n', timeOffset: 0.56 },
    ],
  },
]

export function MusicLab({
  title = 'Interaktives Sound-Lab',
  subtitle = 'Klicke Tasten oder Motive an, um Klänge direkt über Web Audio zu hören.',
  presets = DEFAULT_PRESETS,
  accent = '#0071E3',
}: MusicLabProps) {
  const [activeNote, setActiveNote] = useState<string | null>(null)
  const [activePresetId, setActivePresetId] = useState<string | null>(null)
  const cancelRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => {
      cancelRef.current?.()
      stopAllAudio()
    }
  }, [])

  const handlePlayNote = (pitch: string) => {
    cancelRef.current?.()
    setActivePresetId(null)
    playSinglePitch(pitch, 0.45)
    setActiveNote(pitch)
    window.setTimeout(() => setActiveNote((cur) => (cur === pitch ? null : cur)), 320)
  }

  const handlePlayPreset = (preset: MusicPreset) => {
    cancelRef.current?.()
    setActivePresetId(preset.id)
    const { cancel } = playMelody(
      preset.notes.map((n) => ({
        pitch: n.pitch,
        durationSec: toneDurationToSeconds(n.duration),
        offsetSec: n.timeOffset,
      })),
      (idx) => {
        if (idx === null) {
          setActiveNote(null)
          setActivePresetId(null)
        } else {
          setActiveNote(preset.notes[idx]?.pitch ?? null)
        }
      },
    )
    cancelRef.current = cancel
  }

  const handleStop = () => {
    cancelRef.current?.()
    setActiveNote(null)
    setActivePresetId(null)
  }

  return (
    <div className="apple-card rounded-3xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div
            className="flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase"
            style={{ color: accent }}
          >
            <Volume2 className="h-4 w-4" />
            <span>Audio-Studio</span>
          </div>
          <h4 className="mt-1 text-lg font-extrabold tracking-tight text-[#1D1D1F]">{title}</h4>
          <p className="text-xs text-[#6E6E73]">{subtitle}</p>
        </div>
        {activePresetId && (
          <button
            type="button"
            onClick={handleStop}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#F2F2F7] px-3.5 py-1.5 text-xs font-bold text-[#1D1D1F] hover:bg-[#E5E5EA]"
          >
            <Square className="h-3 w-3 fill-current" />
            Stopp
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-9">
        {DEFAULT_KEYS.map((key) => {
          const isActive = activeNote === key.pitch
          return (
            <button
              key={key.id}
              type="button"
              onClick={() => handlePlayNote(key.pitch)}
              style={isActive ? { borderColor: accent, backgroundColor: `${accent}18` } : undefined}
              className={`flex h-16 flex-col items-center justify-between rounded-2xl border p-2.5 text-xs font-bold transition active:scale-95 ${
                key.isSharp
                  ? 'border-black/10 bg-[#1D1D1F] text-white hover:bg-[#2C2C2E]'
                  : 'border-black/10 bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#EBEBF0]'
              }`}
            >
              <span className={`font-mono text-[10px] ${key.isSharp ? 'text-white/60' : 'text-[#86868B]'}`}>
                {key.pitch}
              </span>
              <span className="text-sm font-extrabold">{key.label}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {presets.map((preset) => {
          const playing = activePresetId === preset.id
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePlayPreset(preset)}
              className={`flex items-start gap-2.5 rounded-2xl border p-3.5 text-left transition ${
                playing
                  ? 'border-[#0071E3] bg-[#E8F2FC]'
                  : 'border-black/[0.08] bg-[#F5F5F7] hover:bg-[#EFEFF4]'
              }`}
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0071E3] text-white">
                <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-bold text-[#1D1D1F]">{preset.label}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-[#6E6E73]">
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
