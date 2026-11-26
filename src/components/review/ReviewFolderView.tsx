import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Layers,
  Play,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { getCategoryById } from '../../config/categories'
import { getQuizCardById } from '../../lessons/registry'
import { formatDueLabel, isCardDue } from '../../lib/sm2'
import type { ReviewQuality } from '../../lib/sm2'
import { useYunoStore } from '../../store/useYunoStore'
import type { QuizResult } from '../../types/yuno'
import { QUIZ_TYPE_LABELS, QuizRenderer } from '../quiz/QuizRenderer'

interface ReviewFolderViewProps {
  onBackToDashboard: () => void
  onOpenLesson: (lessonId: string) => void
}

const LEITNER_BOX_LABELS = [
  'Box 1 · Neu',
  'Box 2 · 1–2 Tage',
  'Box 3 · 4–7 Tage',
  'Box 4 · 2+ Wochen',
  'Box 5 · Langzeit',
]

export function ReviewFolderView({ onBackToDashboard, onOpenLesson }: ReviewFolderViewProps) {
  const { dueCards, allReviewCards, recordReviewAttempt } = useYunoStore()
  const [sessionQueue, setSessionQueue] = useState<string[] | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [lastResult, setLastResult] = useState<QuizResult | null>(null)
  const [reviewedInSession, setReviewedInSession] = useState(0)

  const startSession = (cardIds: string[]) => {
    if (cardIds.length === 0) return
    setSessionQueue(cardIds)
    setCurrentIdx(0)
    setLastResult(null)
    setReviewedInSession(0)
  }

  const activeCardId = sessionQueue ? sessionQueue[currentIdx] : null
  const activeEntry = activeCardId ? getQuizCardById(activeCardId) : undefined

  const handleRate = (quality: ReviewQuality) => {
    if (!activeCardId || !sessionQueue) return
    recordReviewAttempt(activeCardId, quality)
    setReviewedInSession((c) => c + 1)
    setLastResult(null)
    if (currentIdx < sessionQueue.length - 1) {
      setCurrentIdx((i) => i + 1)
    } else {
      setSessionQueue(null)
    }
  }

  if (sessionQueue && activeEntry) {
    const cat = getCategoryById(activeEntry.card.categoryId)
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setSessionQueue(null)}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#1D1D1F] shadow-xs ring-1 ring-black/[0.06] hover:bg-[#F2F2F7]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Sitzung beenden
          </button>
          <span className="font-mono text-xs font-bold text-[#0071E3]">
            Karte {currentIdx + 1} von {sessionQueue.length}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeEntry.card.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="apple-card space-y-6 rounded-[32px] p-6 sm:p-9"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] pb-4">
              <div className="flex items-center gap-2">
                <span
                  style={{ backgroundColor: cat.accentSoft, color: cat.accent }}
                  className="rounded-full px-3 py-0.5 text-xs font-bold"
                >
                  {cat.name}
                </span>
                <span className="text-xs font-semibold text-[#6E6E73]">
                  {activeEntry.lesson.title}
                </span>
              </div>
              <span className="rounded-full bg-[#F2F2F7] px-3 py-0.5 font-mono text-[11px] font-bold text-[#515154]">
                {QUIZ_TYPE_LABELS[activeEntry.card.type]}
              </span>
            </div>

            <h2 className="font-apple-black text-2xl text-[#1D1D1F] sm:text-3xl">
              {activeEntry.card.prompt}
            </h2>

            <QuizRenderer card={activeEntry.card} onComplete={(res) => setLastResult(res)} />

            {lastResult && (
              <div className="space-y-3 border-t border-black/[0.06] pt-5">
                <p className="text-xs font-bold text-[#515154]">
                  Wie sicher saß diese Aufgabe? Dein SM-2-Intervall passt sich automatisch an:
                </p>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {(
                    [
                      { q: 1 as ReviewQuality, label: 'Nochmal', sub: 'Box 1 · Sofort' },
                      { q: 3 as ReviewQuality, label: 'Schwer', sub: 'Kurzes Intervall' },
                      { q: 4 as ReviewQuality, label: 'Gut', sub: 'Standard SM-2' },
                      { q: 5 as ReviewQuality, label: 'Leicht', sub: 'Bonus-Sprung' },
                    ] as const
                  ).map((btn) => {
                    const recommended =
                      (lastResult.correct && btn.q === 4) || (!lastResult.correct && btn.q === 1)
                    return (
                      <button
                        key={btn.q}
                        type="button"
                        onClick={() => handleRate(btn.q)}
                        className={`rounded-2xl border p-3.5 text-left transition hover:scale-[1.01] ${
                          recommended
                            ? 'border-[#0071E3] bg-[#E8F2FC]'
                            : 'border-black/[0.08] bg-[#F5F5F7] hover:bg-[#EFEFF4]'
                        }`}
                      >
                        <span className="block text-sm font-extrabold text-[#1D1D1F]">
                          {btn.label}
                        </span>
                        <span className="block text-[11px] font-medium text-[#6E6E73]">
                          {btn.sub}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBackToDashboard}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#6E6E73] hover:text-[#1D1D1F]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Zurück zum Atlas
          </button>
          <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-[#0071E3] uppercase">
            <Layers className="h-4 w-4" />
            <span>Spaced Repetition · SM-2 &amp; Leitner</span>
          </div>
          <h1 className="font-apple-black mt-1 text-3xl text-[#1D1D1F] sm:text-4xl">
            Dein Wiederholungsordner
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {dueCards.length > 0 && (
            <button
              type="button"
              onClick={() => startSession(dueCards.map((c) => c.cardId))}
              className="inline-flex items-center gap-2 rounded-full bg-[#0071E3] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0077ED]"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{dueCards.length} fällige Karten starten</span>
            </button>
          )}
          {allReviewCards.length > 0 && dueCards.length === 0 && (
            <button
              type="button"
              onClick={() => startSession(allReviewCards.map((c) => c.cardId))}
              className="inline-flex items-center gap-2 rounded-full bg-[#1D1D1F] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0071E3]"
            >
              <Sparkles className="h-4 w-4" />
              <span>Freies Training ({allReviewCards.length} Karten)</span>
            </button>
          )}
        </div>
      </div>

      {reviewedInSession > 0 && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] p-4 text-sm font-medium text-[#14532D]">
          <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />
          <span>
            Starke Sitzung! Du hast <strong>{reviewedInSession}</strong> Karten wiederholt und deine SM-2-Intervalle aktualisiert.
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {LEITNER_BOX_LABELS.map((label, idx) => {
          const boxNum = idx + 1
          const count = allReviewCards.filter((c) => c.box === boxNum).length
          return (
            <div key={label} className="apple-card rounded-2xl p-4">
              <span className="font-apple-black text-3xl text-[#1D1D1F] tabular-nums">{count}</span>
              <p className="mt-1 text-xs font-semibold text-[#6E6E73]">{label}</p>
            </div>
          )
        })}
      </div>

      {allReviewCards.length === 0 ? (
        <div className="apple-card flex flex-col items-center justify-center rounded-3xl p-12 text-center">
          <Layers className="h-10 w-10 text-[#AEAEB2]" />
          <h2 className="font-apple-display mt-4 text-xl text-[#1D1D1F]">
            Dein Ordner ist noch leer
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-[#6E6E73]">
            Schließe zuerst eine Lektion ab. Alle visuellen Prüfungen wandern danach automatisch in deinen Wiederholungsordner.
          </p>
          <button
            type="button"
            onClick={onBackToDashboard}
            className="mt-5 rounded-full bg-[#0071E3] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0077ED]"
          >
            Zu den Lektionen
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-xs font-bold tracking-wide text-[#86868B] uppercase">
            Gespeicherte Karten ({allReviewCards.length})
          </h2>

          <div className="grid gap-3 md:grid-cols-2">
            {allReviewCards.map((cardState) => {
              const entry = getQuizCardById(cardState.cardId)
              if (!entry) return null
              const cat = getCategoryById(cardState.categoryId)
              const due = isCardDue(cardState)

              return (
                <div
                  key={cardState.cardId}
                  className="apple-card flex flex-col justify-between gap-4 rounded-2xl p-5"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          style={{ backgroundColor: cat.accentSoft, color: cat.accent }}
                          className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                        >
                          {cat.name}
                        </span>
                        <span className="rounded-full bg-[#F2F2F7] px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#515154]">
                          {QUIZ_TYPE_LABELS[entry.card.type]}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold ${
                          due
                            ? 'bg-[#FEE2E2] text-[#DC2626]'
                            : 'bg-[#F2F2F7] text-[#6E6E73]'
                        }`}
                      >
                        <CalendarClock className="h-3 w-3" />
                        {formatDueLabel(cardState.dueDate)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-bold text-[#1D1D1F]">{entry.card.prompt}</p>
                    <button
                      type="button"
                      onClick={() => onOpenLesson(entry.lesson.id)}
                      className="mt-1 text-xs font-semibold text-[#0071E3] hover:underline"
                    >
                      Aus: {entry.lesson.title}
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-black/[0.06] pt-3 text-xs text-[#6E6E73]">
                    <span className="font-mono font-semibold">
                      Box {cardState.box}/5 · Ease {cardState.easeFactor.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => startSession([cardState.cardId])}
                      className="font-bold text-[#0071E3] hover:underline"
                    >
                      Einzeln üben →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
