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
      <p className="text-xs font-medium text-[#6E6E73]">
        Ziehe die Karten per Drag-and-Drop (oder mit den Pfeilen) in die richtige Reihenfolge — von{' '}
        <strong className="text-[#1D1D1F]">1 (zuerst)</strong> bis{' '}
        <strong className="text-[#1D1D1F]">{ordered.length} (zuletzt)</strong>.
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
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition ${
                isExact
                  ? 'border-[#86EFAC] bg-[#F0FDF4]'
                  : isWrong
                    ? 'border-[#FCA5A5] bg-[#FEF2F2]'
                    : 'cursor-grab border-black/[0.08] bg-[#F5F5F7] hover:border-black/20 active:cursor-grabbing'
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white font-mono text-xs font-bold text-[#1D1D1F] shadow-xs">
                {idx + 1}
              </span>
              {!submitted && <GripVertical className="h-4 w-4 shrink-0 text-[#86868B]" />}

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#1D1D1F]">{item.label}</p>
                {item.sublabel && <p className="text-xs text-[#6E6E73]">{item.sublabel}</p>}
              </div>

              {submitted ? (
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold ${
                    isExact ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEE2E2] text-[#DC2626]'
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
                    className="rounded-xl border border-black/10 bg-white p-1.5 text-[#1D1D1F] transition hover:bg-[#EFEFF4] disabled:opacity-30"
                    aria-label="Nach oben"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === ordered.length - 1}
                    onClick={() => moveItem(idx, 1)}
                    className="rounded-xl border border-black/10 bg-white p-1.5 text-[#1D1D1F] transition hover:bg-[#EFEFF4] disabled:opacity-30"
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
            className="rounded-full bg-[#0071E3] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#0077ED]"
          >
            Reihenfolge prüfen
          </button>
        </div>
      ) : (
        <div
          className={`rounded-2xl border p-4 text-sm ${
            allCorrect
              ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#14532D]'
              : 'border-[#FECACA] bg-[#FEF2F2] text-[#7F1D1D]'
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            {allCorrect ? (
              <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
            ) : (
              <XCircle className="h-4 w-4 text-[#DC2626]" />
            )}
            <span>
              {allCorrect
                ? 'Perfekte Reihenfolge!'
                : 'Nicht ganz — schau dir die Soll-Positionen rechts an.'}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-[#3A3A3C]">{card.explanation}</p>
        </div>
      )}
    </div>
  )
}
