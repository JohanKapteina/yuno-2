import { CheckCircle2, Link2, RotateCcw, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { QuizResult, VisualConnectQuizCard } from '../../types/yuno'

interface Props {
  card: VisualConnectQuizCard
  onComplete: (result: QuizResult) => void
}

const PAIR_COLORS = ['#F59E0B', '#38BDF8', '#A855F7', '#10B981', '#EC4899']

export function VisualConnectQuiz({ card, onComplete }: Props) {
  // Deterministic non-trivial shuffle for the right column
  const rightItems = useMemo(() => {
    const arr = [...card.pairs]
    if (arr.length >= 2) {
      const shifted = [...arr.slice(1), arr[0]]
      if (shifted.length >= 4) {
        const tmp = shifted[1]
        shifted[1] = shifted[3]
        shifted[3] = tmp
      }
      return shifted
    }
    return arr
  }, [card.pairs])

  const [activeLeftId, setActiveLeftId] = useState<string | null>(null)
  /** Map: leftPairId -> rightPairId */
  const [connections, setConnections] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const handleLeftClick = (leftId: string) => {
    if (submitted) return
    setActiveLeftId((cur) => (cur === leftId ? null : leftId))
  }

  const handleRightClick = (rightId: string) => {
    if (submitted || !activeLeftId) return
    setConnections((prev) => {
      const next = { ...prev }
      // Remove any existing link pointing to the same right item
      for (const [k, v] of Object.entries(next)) {
        if (v === rightId) delete next[k]
      }
      next[activeLeftId] = rightId
      return next
    })
    setActiveLeftId(null)
  }

  const allLinked = Object.keys(connections).length === card.pairs.length

  const handleConfirm = () => {
    if (!allLinked || submitted) return
    const correctCount = card.pairs.filter((p) => connections[p.id] === p.id).length
    const allCorrect = correctCount === card.pairs.length
    setSubmitted(true)
    onComplete({
      correct: allCorrect,
      score: correctCount / card.pairs.length,
      summary: `${correctCount} von ${card.pairs.length} Paaren korrekt verbunden`,
    })
  }

  const allCorrect = submitted && card.pairs.every((p) => connections[p.id] === p.id)

  const getColorForLeft = (leftId: string) => {
    const idx = card.pairs.findIndex((p) => p.id === leftId)
    return PAIR_COLORS[idx % PAIR_COLORS.length]
  }

  const getLinkedLeftForRight = (rightId: string): string | undefined => {
    return Object.entries(connections).find(([, r]) => r === rightId)?.[0]
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5 text-sky-300">
          <Link2 className="h-3.5 w-3.5" />
          Klicke erst links ein Element an, dann das passende Gegenstück rechts.
        </span>
        {!submitted && Object.keys(connections).length > 0 && (
          <button
            type="button"
            onClick={() => {
              setConnections({})
              setActiveLeftId(null)
            }}
            className="inline-flex items-center gap-1 text-slate-400 hover:text-white"
          >
            <RotateCcw className="h-3 w-3" />
            Zurücksetzen
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_72px_1fr] md:items-center">
        {/* Left Column */}
        <div className="space-y-2.5">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            {card.leftColumnTitle}
          </p>
          {card.pairs.map((pair, idx) => {
            const isSelected = activeLeftId === pair.id
            const linkedRight = connections[pair.id]
            const color = getColorForLeft(pair.id)
            const isPairCorrect = submitted && linkedRight === pair.id
            const isPairWrong = submitted && linkedRight !== pair.id
            return (
              <button
                key={pair.id}
                type="button"
                disabled={submitted}
                onClick={() => handleLeftClick(pair.id)}
                style={
                  !submitted && (isSelected || linkedRight)
                    ? { borderColor: color, backgroundColor: `${color}18` }
                    : undefined
                }
                className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-3 text-left transition ${
                  isPairCorrect
                    ? 'border-emerald-500/55 bg-emerald-500/12'
                    : isPairWrong
                      ? 'border-rose-500/55 bg-rose-500/12'
                      : 'border-white/10 bg-[#0E1525] hover:border-white/25'
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{pair.left}</p>
                  {pair.leftSub && <p className="text-xs text-slate-400">{pair.leftSub}</p>}
                </div>
                <span
                  style={{ backgroundColor: linkedRight || isSelected ? color : 'rgba(255,255,255,0.12)' }}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold text-[#0B0F19]"
                >
                  {idx + 1}
                </span>
              </button>
            )
          })}
        </div>

        {/* Center SVG Connection Bridge (Desktop) */}
        <div className="hidden h-full md:block">
          <svg
            viewBox={`0 0 72 ${card.pairs.length * 76}`}
            className="h-full w-full overflow-visible"
            aria-hidden="true"
          >
            {card.pairs.map((leftPair, leftIdx) => {
              const targetRightId = connections[leftPair.id]
              if (!targetRightId) return null
              const rightIdx = rightItems.findIndex((r) => r.id === targetRightId)
              if (rightIdx === -1) return null
              const y1 = 44 + leftIdx * 72
              const y2 = 44 + rightIdx * 72
              const strokeColor = submitted
                ? targetRightId === leftPair.id
                  ? '#10B981'
                  : '#F43F5E'
                : getColorForLeft(leftPair.id)
              return (
                <path
                  key={leftPair.id}
                  d={`M 0 ${y1} C 36 ${y1}, 36 ${y2}, 72 ${y2}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={2.6}
                  strokeLinecap="round"
                />
              )
            })}
          </svg>
        </div>

        {/* Right Column */}
        <div className="space-y-2.5">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            {card.rightColumnTitle}
          </p>
          {rightItems.map((pair) => {
            const linkedLeftId = getLinkedLeftForRight(pair.id)
            const linkedIdx = linkedLeftId ? card.pairs.findIndex((p) => p.id === linkedLeftId) : -1
            const color = linkedLeftId ? getColorForLeft(linkedLeftId) : undefined
            const isPairCorrect = submitted && linkedLeftId === pair.id
            const isPairWrong = submitted && linkedLeftId !== pair.id
            return (
              <button
                key={pair.id}
                type="button"
                disabled={submitted || !activeLeftId}
                onClick={() => handleRightClick(pair.id)}
                style={
                  !submitted && color
                    ? { borderColor: color, backgroundColor: `${color}18` }
                    : undefined
                }
                className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition ${
                  isPairCorrect
                    ? 'border-emerald-500/55 bg-emerald-500/12'
                    : isPairWrong
                      ? 'border-rose-500/55 bg-rose-500/12'
                      : activeLeftId
                        ? 'cursor-pointer border-indigo-400/40 bg-[#121B30] hover:border-indigo-300'
                        : 'border-white/10 bg-[#0E1525]'
                }`}
              >
                <span
                  style={{ backgroundColor: color ?? 'rgba(255,255,255,0.1)' }}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold ${
                    color ? 'text-[#0B0F19]' : 'text-slate-400'
                  }`}
                >
                  {linkedIdx >= 0 ? linkedIdx + 1 : '·'}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{pair.right}</p>
                  {pair.rightSub && <p className="text-xs text-slate-400">{pair.rightSub}</p>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {!submitted ? (
        <div className="flex justify-end">
          <button
            type="button"
            disabled={!allLinked}
            onClick={handleConfirm}
            className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-40"
          >
            Verbindungen prüfen ({Object.keys(connections).length}/{card.pairs.length})
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
                ? 'Alle Zusammenhänge brillant verknüpft!'
                : 'Einige Verknüpfungen waren vertauscht — prüfe die markierten Paare.'}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{card.explanation}</p>
        </div>
      )}
    </div>
  )
}
