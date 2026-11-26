import { Reorder } from 'framer-motion'
import { ArrowDown, ArrowUp, CheckCircle2, GripVertical, XCircle } from 'lucide-react'
import { useState } from 'react'
import type { QuizResult, TimelineSortQuizCard } from '../../types/yuno'

interface Props {
  card: TimelineSortQuizCard
  onComplete: (result: QuizResult) => void
}

function deterministicShuffle<T>(items: T[]): T[] {
  if (items.length <= 1) return items
  // Deterministic non-sorted starting arrangement so items always require sorting
  const copy = [...items]
  const rotated = [...copy.slice(1), copy[0]]
  if (rotated.length >= 4) {
    const tmp = rotated[0]
    rotated[0] = rotated[2]
    rotated[2] = tmp
  }
  return rotated
}

export function TimelineSortQuiz({ card, onComplete }: Props) {
  const [ordered, setOrdered] = useState(() => deterministicShuffle(card.items))
  const [submitted, setSubmitted] = useState(false)

  const moveItem = (index: number, delta: -1 | 1) => {
    if (submitted) return
    const nextIdx = index + delta
    if (nextIdx < 0 || nextIdx >= ordered.length) return
    const next = [...ordered]
    const [removed] = next.splice(index, 1)
    next.splice(nextIdx, 0, removed)
    setOrdered(next)
  }

  const handleConfirm = () => {
    if (submitted) return
    const correctPositions = ordered.filter((item, idx) => item.order === idx).length
    const allCorrect = correctPositions === ordered.length
    setSubmitted(true)
    onComplete({
      correct: allCorrect,
      score: correctPositions / ordered.length,
      summary: `${correctPositions} von ${ordered.length} an der exakten Position`,
    })
  }

  const allCorrect = submitted && ordered.every((item, idx) => item.order === idx)

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">
        Ziehe die Karten per Drag-and-Drop (oder über die Pfeile) in die richtige zeitliche Reihenfolge — von <strong className="text-slate-200">1 (zuerst)</strong> bis <strong className="text-slate-200">{ordered.length} (zuletzt)</strong>.
      </p>

      <Reorder.Group
        axis="y"
        values={ordered}
        onReorder={(vals) => {
          if (!submitted) setOrdered(vals)
        }}
        className="space-y-2.5"
      >
        {ordered.map((item, idx) => {
          const isExact = submitted && item.order === idx
          const isWrong = submitted && item.order !== idx
          return (
            <Reorder.Item
              key={item.id}
              value={item}
              dragListener={!submitted}
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 transition ${
                isExact
                  ? 'border-emerald-500/45 bg-emerald-500/10'
                  : isWrong
                    ? 'border-rose-500/45 bg-rose-500/10'
                    : 'cursor-grab border-white/10 bg-[#0E1525] hover:border-white/20 active:cursor-grabbing'
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/8 font-mono text-xs font-semibold text-slate-200">
                {idx + 1}
              </span>
              {!submitted && <GripVertical className="h-4 w-4 shrink-0 text-slate-500" />}

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{item.label}</p>
                {item.sublabel && <p className="text-xs text-slate-400">{item.sublabel}</p>}
              </div>

              {submitted ? (
                <span
                  className={`shrink-0 rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold ${
                    isExact ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {isExact ? 'Korrekt' : `Soll: #${item.order + 1}`}
                </span>
              ) : (
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, -1)}
                    className="rounded-lg border border-white/10 p-1 text-slate-300 transition hover:bg-white/10 disabled:opacity-25"
                    aria-label="Nach oben"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === ordered.length - 1}
                    onClick={() => moveItem(idx, 1)}
                    className="rounded-lg border border-white/10 p-1 text-slate-300 transition hover:bg-white/10 disabled:opacity-25"
                    aria-label="Nach unten"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </Reorder.Item>
          )
        })}
      </Reorder.Group>

      {!submitted ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            Reihenfolge prüfen
          </button>
        </div>
      ) : (
        <div
          className={`rounded-xl border p-4 text-sm ${
            allCorrect
              ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-100'
              : 'border-rose-500/35 bg-rose-500/10 text-rose-100'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            {allCorrect ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <XCircle className="h-4 w-4 text-rose-400" />
            )}
            <span>
              {allCorrect
                ? 'Perfekte Chronologie! Alle Phasen sitzen exakt.'
                : 'Nicht ganz — schau dir die Soll-Positionen rechts an.'}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{card.explanation}</p>
        </div>
      )}
    </div>
  )
}
