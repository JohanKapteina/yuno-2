import { CheckCircle2, Play, Volume2, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import type { AudioMatchQuizCard, QuizResult } from '../../types/yuno'
import { SmartVideoPlayer } from '../media/SmartVideoPlayer'

interface Props {
  card: AudioMatchQuizCard
  onComplete: (result: QuizResult) => void
}

export function AudioMatchQuiz({ card, onComplete }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isPlayingTone, setIsPlayingTone] = useState(false)
  const synthRef = useRef<Tone.PolySynth | null>(null)

  useEffect(() => {
    return () => {
      synthRef.current?.dispose()
      synthRef.current = null
    }
  }, [])

  const playToneExample = async () => {
    if (card.audio.mode !== 'tone') return
    await Tone.start()
    if (!synthRef.current) {
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
      }).toDestination()
    }
    setIsPlayingTone(true)
    const now = Tone.now()
    let maxOffset = 0
    for (const n of card.audio.notes) {
      synthRef.current.triggerAttackRelease(n.pitch, n.duration, now + n.timeOffset)
      maxOffset = Math.max(maxOffset, n.timeOffset)
    }
    window.setTimeout(() => setIsPlayingTone(false), (maxOffset + 0.6) * 1000)
  }

  const handleConfirm = () => {
    if (!selectedId || submitted) return
    const correct = selectedId === card.correctOptionId
    setSubmitted(true)
    onComplete({
      correct,
      score: correct ? 1 : 0,
    })
  }

  const isCorrect = submitted && selectedId === card.correctOptionId

  return (
    <div className="space-y-4">
      {card.audio.mode === 'tone' ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-violet-500/25 bg-violet-500/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/25 text-violet-200">
              <Volume2 className={`h-5 w-5 ${isPlayingTone ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{card.audio.label}</p>
              <p className="text-xs text-slate-300">Live-Klangbeispiel via Tone.js</p>
            </div>
          </div>
          <button
            type="button"
            onClick={playToneExample}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-400"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            {isPlayingTone ? 'Spielt ab…' : 'Hörbeispiel abspielen'}
          </button>
        </div>
      ) : (
        <SmartVideoPlayer
          videoId={card.audio.videoId}
          start={card.audio.start}
          end={card.audio.end}
          title={card.audio.title}
          channel="Hörbeispiel"
          segmentLabel="Audio-/Video-Ausschnitt"
        />
      )}

      <div className="grid gap-2.5 sm:grid-cols-2">
        {card.options.map((opt) => {
          const isSelected = selectedId === opt.id
          const isRightOption = submitted && opt.id === card.correctOptionId
          const isWrongChoice = submitted && isSelected && opt.id !== card.correctOptionId
          return (
            <button
              key={opt.id}
              type="button"
              disabled={submitted}
              onClick={() => setSelectedId(opt.id)}
              className={`rounded-xl border p-3.5 text-left transition ${
                isRightOption
                  ? 'border-emerald-500/55 bg-emerald-500/15'
                  : isWrongChoice
                    ? 'border-rose-500/55 bg-rose-500/15'
                    : isSelected
                      ? 'border-indigo-400 bg-indigo-500/15'
                      : 'border-white/10 bg-[#0E1525] hover:border-white/25'
              }`}
            >
              <p className="text-sm font-semibold text-white">{opt.label}</p>
              {opt.description && <p className="mt-0.5 text-xs text-slate-400">{opt.description}</p>}
            </button>
          )
        })}
      </div>

      {!submitted ? (
        <div className="flex justify-end">
          <button
            type="button"
            disabled={!selectedId}
            onClick={handleConfirm}
            className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-40"
          >
            Antwort prüfen
          </button>
        </div>
      ) : (
        <div
          className={`rounded-xl border p-4 text-sm ${
            isCorrect
              ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-100'
              : 'border-rose-500/35 bg-rose-500/10 text-rose-100'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            {isCorrect ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <XCircle className="h-4 w-4 text-rose-400" />
            )}
            <span>{isCorrect ? 'Hervorragendes Gehör!' : 'Nicht ganz — die richtige Zuordnung ist grün markiert.'}</span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{card.explanation}</p>
        </div>
      )}
    </div>
  )
}
