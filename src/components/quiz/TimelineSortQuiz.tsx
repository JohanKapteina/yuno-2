import { motion } from 'framer-motion'
import { ArrowDown, ArrowUp, CheckCircle2, GripVertical, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { DragEvent } from 'react'
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
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const correctSequence = useMemo(
    () => [...card.items].sort((a, b) => a.order - b.order),
    [card.items],
  )

  const reorder = (fromIdx: number, toIdx: number) => {
    if (submitted || fromIdx === toIdx) return
    if (fromIdx < 0 || toIdx < 0 || fromIdx >= ordered.length || toIdx >= ordered.length) return
    setOrdered((prev) => {
      const next = [...prev]
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      return next
    })
  }

  const handleDragStart = (e: DragEvent<HTMLDivElement>, idx: number) => {
    if (submitted) return
    setDraggedIdx(idx)
    setSelectedIdx(null)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(idx))
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>, idx: number) => {
    if (submitted) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (overIdx !== idx) setOverIdx(idx)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetIdx: number) => {
    e.preventDefault()
    if (submitted) return
    const fromIdx = draggedIdx ?? Number(e.dataTransfer.getData('text/plain'))
    if (Number.isInteger(fromIdx) && fromIdx !== targetIdx) {
      reorder(fromIdx, targetIdx)
    }
    setDraggedIdx(null)
    setOverIdx(null)
  }

  const handleDragEnd = () => {
    setDraggedIdx(null)
    setOverIdx(null)
  }

  // Effortless click-to-move fallback for trackpad/touch users
  const handleCardClick = (idx: number) => {
    if (submitted) return
    if (selectedIdx === null) {
      setSelectedIdx(idx)
    } else if (selectedIdx === idx) {
      setSelectedIdx(null)
    } else {
      reorder(selectedIdx, idx)
      setSelectedIdx(null)
    }
  }

  const handleConfirm = () => {
    if (submitted) return
    setSelectedIdx(null)
    setDraggedIdx(null)
    setOverIdx(null)
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
        Ziehe die Kacheln in die richtige Reihenfolge, klicke zwei Kacheln zum Tauschen an oder nutze die Pfeile — von{' '}
        <strong className="text-[#1D1D1F]">1 (zuerst)</strong> bis{' '}
        <strong className="text-[#1D1D1F]">{ordered.length} (zuletzt)</strong>.
      </p>

      {/* Interactive User Ordering List */}
      <div className="space-y-2.5">
        {ordered.map((item, idx) => {
          const isExact = submitted && item.order === idx
          const isWrong = submitted && item.order !== idx
          const isBeingDragged = draggedIdx === idx
          const isDropTarget = overIdx === idx && draggedIdx !== null && draggedIdx !== idx
          const isSelected = selectedIdx === idx

          return (
            <motion.div
              key={item.id}
              layout
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              draggable={!submitted}
              onDragStart={(e) => handleDragStart(e as unknown as DragEvent<HTMLDivElement>, idx)}
              onDragOver={(e) => handleDragOver(e as unknown as DragEvent<HTMLDivElement>, idx)}
              onDrop={(e) => handleDrop(e as unknown as DragEvent<HTMLDivElement>, idx)}
              onDragEnd={handleDragEnd}
              onClick={() => handleCardClick(idx)}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 select-none transition ${
                isExact
                  ? 'border-[#86EFAC] bg-[#F0FDF4]'
                  : isWrong
                    ? 'border-[#FCA5A5] bg-[#FEF2F2]'
                    : isDropTarget
                      ? 'border-[#0071E3] bg-[#E8F2FC] ring-2 ring-[#0071E3]/25'
                      : isSelected
                        ? 'border-[#0071E3] bg-[#F0F7FF] shadow-sm ring-2 ring-[#0071E3]/20'
                        : isBeingDragged
                          ? 'opacity-45 border-dashed border-[#0071E3] bg-[#F5F5F7]'
                          : 'cursor-grab border-black/[0.08] bg-[#F5F5F7] hover:border-black/20 hover:bg-[#EFEFF4] active:cursor-grabbing'
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-extrabold shadow-xs ${
                  isSelected
                    ? 'bg-[#0071E3] text-white'
                    : 'bg-white text-[#1D1D1F]'
                }`}
              >
                {idx + 1}
              </span>

              {!submitted && <GripVertical className="h-4 w-4 shrink-0 text-[#86868B]" />}

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#1D1D1F]">{item.label}</p>
                {item.sublabel && <p className="text-xs text-[#6E6E73]">{item.sublabel}</p>}
              </div>

              {submitted ? (
                <div className="flex shrink-0 items-center gap-2">
                  {item.revealLabel && (
                    <span className="rounded-full bg-white px-2.5 py-0.5 font-mono text-xs font-extrabold text-[#0071E3] shadow-xs">
                      {item.revealLabel}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold ${
                      isExact ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEE2E2] text-[#DC2626]'
                    }`}
                  >
                    {isExact ? 'Korrekt' : `Platz #${item.order + 1}`}
                  </span>
                </div>
              ) : (
                <div
                  className="flex shrink-0 items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => reorder(idx, idx - 1)}
                    className="rounded-xl border border-black/10 bg-white p-2 text-[#1D1D1F] transition hover:bg-[#1D1D1F] hover:text-white disabled:opacity-25"
                    aria-label="Nach oben verschieben"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === ordered.length - 1}
                    onClick={() => reorder(idx, idx + 1)}
                    className="rounded-xl border border-black/10 bg-white p-2 text-[#1D1D1F] transition hover:bg-[#1D1D1F] hover:text-white disabled:opacity-25"
                    aria-label="Nach unten verschieben"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {!submitted ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-medium text-[#86868B]">
            {selectedIdx !== null
              ? `Kachel #${selectedIdx + 1} ausgewählt — klicke jetzt auf die Zielposition.`
              : 'Jahreszahlen & Werte werden erst nach dem Prüfen aufgedeckt.'}
          </span>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-full bg-[#0071E3] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#0077ED]"
          >
            Reihenfolge prüfen
          </button>
        </div>
      ) : (
        <div className="space-y-4">
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
                  ? 'Perfekte Reihenfolge! Alle Stationen sitzen exakt.'
                  : 'Nicht ganz — hier siehst du die richtige Reihenfolge inklusive Jahreszahlen:'}
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-[#3A3A3C]">{card.explanation}</p>
          </div>

          {/* Always reveal the canonical correct sequence WITH years/values after submitting */}
          <div className="rounded-2xl border border-black/[0.08] bg-[#FAFAFC] p-4">
            <p className="mb-3 font-mono text-[11px] font-bold tracking-wide text-[#0071E3] uppercase">
              Richtige Reihenfolge (aufgedeckt)
            </p>
            <ol className="space-y-2">
              {correctSequence.map((item, idx) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-3.5 py-2.5 shadow-xs ring-1 ring-black/[0.05]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1D1D1F] font-mono text-[11px] font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-extrabold text-[#1D1D1F] sm:text-sm">
                      {item.label}
                    </span>
                  </div>
                  {item.revealLabel && (
                    <span className="rounded-full bg-[#E8F2FC] px-3 py-0.5 font-mono text-xs font-extrabold text-[#0071E3]">
                      {item.revealLabel}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
