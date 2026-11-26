import { CheckCircle2, Play, Volume2, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { playMelody, stopAllAudio, toneDurationToSeconds } from '../../lib/audioEngine'
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
  const cancelRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => {
      cancelRef.current?.()
      stopAllAudio()
    }
  }, [])

  const playToneExample = () => {
    if (card.audio.mode !== 'tone') return
    cancelRef.current?.()
    setIsPlayingTone(true)
    const { cancel } = playMelody(
      card.audio.notes.map((n) => ({
        pitch: n.pitch,
        durationSec: toneDurationToSeconds(n.duration),
        offsetSec: n.timeOffset,
      })),
      (idx) => {
        if (idx === null) setIsPlayingTone(false)
      },
    )
    cancelRef.current = cancel
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
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/[0.08] bg-[#F5F5F7] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0071E3] text-white">
              <Volume2 className={`h-5 w-5 ${isPlayingTone ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1D1D1F]">{card.audio.label}</p>
              <p className="text-xs text-[#6E6E73]">Live-Klangbeispiel</p>
            </div>
          </div>
          <button
            type="button"
            onClick={playToneExample}
            className="inline-flex items-center gap-2 rounded-full bg-[#1D1D1F] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#3A3A3C]"
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
              className={`rounded-2xl border p-4 text-left transition ${
                isRightOption
                  ? 'border-[#86EFAC] bg-[#F0FDF4]'
                  : isWrongChoice
                    ? 'border-[#FCA5A5] bg-[#FEF2F2]'
                    : isSelected
                      ? 'border-[#0071E3] bg-[#E8F2FC]'
                      : 'border-black/[0.08] bg-[#F5F5F7] hover:border-black/20'
              }`}
            >
              <p className="text-sm font-bold text-[#1D1D1F]">{opt.label}</p>
              {opt.description && <p className="mt-0.5 text-xs text-[#6E6E73]">{opt.description}</p>}
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
            className="rounded-full bg-[#0071E3] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#0077ED] disabled:opacity-40"
          >
            Antwort prüfen
          </button>
        </div>
      ) : (
        <div
          className={`rounded-2xl border p-4 text-sm ${
            isCorrect
              ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#14532D]'
              : 'border-[#FECACA] bg-[#FEF2F2] text-[#7F1D1D]'
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            {isCorrect ? (
              <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
            ) : (
              <XCircle className="h-4 w-4 text-[#DC2626]" />
            )}
            <span>
              {isCorrect ? 'Hervorragendes Gehör!' : 'Nicht ganz — die richtige Antwort ist grün markiert.'}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-[#3A3A3C]">{card.explanation}</p>
        </div>
      )}
    </div>
  )
}
