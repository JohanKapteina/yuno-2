import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Layers,
  Play,
  RefreshCw,
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
  'Box 1 · Neu / Sofort',
  'Box 2 · 1–2 Tage',
  'Box 3 · 4–7 Tage',
  'Box 4 · 2+ Wochen',
  'Box 5 · Langzeit',
]

export function ReviewFolderView({ onBackToDashboard, onOpenLesson }: ReviewFolderViewProps) {
  const { dueCards, allReviewCards, recordReviewAttempt, makeAllCardsDueNow } = useYunoStore()
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

  // Active Interactive Review Session
  if (sessionQueue && activeEntry) {
    const cat = getCategoryById(activeEntry.card.categoryId)
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setSessionQueue(null)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#131B2E] px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Sitzung beenden
          </button>
          <span className="font-mono text-xs text-amber-300">
            Karte {currentIdx + 1} von {sessionQueue.length}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeEntry.card.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="editorial-card space-y-6 rounded-3xl p-5 sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2">
                <span
                  style={{ backgroundColor: cat.accentSoft, color: cat.accent }}
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                >
                  {cat.name}
                </span>
                <span className="text-xs text-slate-400">{activeEntry.lesson.title}</span>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 font-mono text-[11px] text-slate-300">
                {QUIZ_TYPE_LABELS[activeEntry.card.type]}
              </span>
            </div>

            <h2 className="font-editorial text-2xl text-white sm:text-3xl">
              {activeEntry.card.prompt}
            </h2>

            <QuizRenderer
              card={activeEntry.card}
              onComplete={(res) => setLastResult(res)}
            />

            {lastResult && (
              <div className="space-y-3 border-t border-white/[0.08] pt-5">
                <p className="text-xs font-medium text-slate-300">
                  Wie sicher saß diese Aufgabe? Dein SM-2-Intervall passt sich automatisch an:
                </p>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {(
                    [
                      { q: 1 as ReviewQuality, label: 'Nochmal', sub: 'Box 1 · Sofort', tone: 'rose' },
                      { q: 3 as ReviewQuality, label: 'Schwer', sub: 'Kurzes Intervall', tone: 'amber' },
                      { q: 4 as ReviewQuality, label: 'Gut', sub: 'Standard SM-2', tone: 'indigo' },
                      { q: 5 as ReviewQuality, label: 'Leicht', sub: 'Bonus-Sprung', tone: 'emerald' },
                    ] as const
                  ).map((btn) => {
                    const recommended =
                      (lastResult.correct && btn.q === 4) || (!lastResult.correct && btn.q === 1)
                    return (
                      <button
                        key={btn.q}
                        type="button"
                        onClick={() => handleRate(btn.q)}
                        className={`rounded-xl border p-3 text-left transition hover:scale-[1.01] ${
                          recommended
                            ? 'border-amber-400/70 bg-amber-500/15 ring-1 ring-amber-400/35'
                            : 'border-white/10 bg-[#0D1322] hover:border-white/25'
                        }`}
                      >
                        <span className="block text-sm font-semibold text-white">{btn.label}</span>
                        <span className="block text-[11px] text-slate-400">{btn.sub}</span>
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
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBackToDashboard}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Zurück zum Atlas
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-400 uppercase">
            <Layers className="h-4 w-4" />
            <span>Spaced Repetition · SM-2 & Leitner</span>
          </div>
          <h1 className="font-editorial mt-1 text-3xl text-white sm:text-4xl">
            Dein visueller Wiederholungsordner
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {dueCards.length > 0 && (
            <button
              type="button"
              onClick={() => startSession(dueCards.map((c) => c.cardId))}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-[#0B0F19] shadow-[0_10px_28px_-10px_rgba(245,158,11,0.7)] transition hover:bg-amber-400"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{dueCards.length} fällige Karten jetzt starten</span>
            </button>
          )}
          {allReviewCards.length > 0 && dueCards.length === 0 && (
            <button
              type="button"
              onClick={() => startSession(allReviewCards.map((c) => c.cardId))}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/40 bg-indigo-500/15 px-4 py-2.5 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/25"
            >
              <Sparkles className="h-4 w-4" />
              <span>Freies Training ({allReviewCards.length} Karten)</span>
            </button>
          )}
        </div>
      </div>

      {reviewedInSession > 0 && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>
            Starke Sitzung! Du hast gerade <strong>{reviewedInSession}</strong> visuelle Karten wiederholt und deine SM-2-Intervalle aktualisiert.
          </span>
        </div>
      )}

      {/* Leitner Boxes Overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {LEITNER_BOX_LABELS.map((label, idx) => {
          const boxNum = idx + 1
          const count = allReviewCards.filter((c) => c.box === boxNum).length
          return (
            <div key={label} className="editorial-card rounded-2xl p-4">
              <span className="font-mono text-2xl font-bold text-white">{count}</span>
              <p className="mt-1 text-xs text-slate-400">{label}</p>
            </div>
          )
        })}
      </div>

      {/* Card List or Empty State */}
      {allReviewCards.length === 0 ? (
        <div className="editorial-card flex flex-col items-center justify-center rounded-3xl p-12 text-center">
          <Layers className="h-10 w-10 text-slate-500" />
          <h2 className="mt-4 text-lg font-semibold text-white">Dein Ordner ist noch leer</h2>
          <p className="mt-1.5 max-w-md text-sm text-slate-400">
            Schließe zuerst eine interaktive Lektion ab. Alle visuellen Prüfungen (Karten-Pins, Zeitstrahlen, Regler, Verknüpfungen) landen danach automatisch hier.
          </p>
          <button
            type="button"
            onClick={onBackToDashboard}
            className="mt-5 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
          >
            Zur Demo-Lektion
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
              Alle gespeicherten Karten ({allReviewCards.length})
            </h2>
            {dueCards.length === 0 && (
              <button
                type="button"
                onClick={makeAllCardsDueNow}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Alle für Demo jetzt fällig setzen
              </button>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {allReviewCards.map((cardState) => {
              const entry = getQuizCardById(cardState.cardId)
              if (!entry) return null
              const cat = getCategoryById(cardState.categoryId)
              const due = isCardDue(cardState)

              return (
                <div
                  key={cardState.cardId}
                  className="editorial-card flex flex-col justify-between gap-4 rounded-2xl p-5"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          style={{ backgroundColor: cat.accentSoft, color: cat.accent }}
                          className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                        >
                          {cat.name}
                        </span>
                        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-[11px] text-slate-300">
                          {QUIZ_TYPE_LABELS[entry.card.type]}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold ${
                          due
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-white/[0.05] text-slate-400'
                        }`}
                      >
                        <CalendarClock className="h-3 w-3" />
                        {formatDueLabel(cardState.dueDate)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-medium text-white">{entry.card.prompt}</p>
                    <button
                      type="button"
                      onClick={() => onOpenLesson(entry.lesson.id)}
                      className="mt-1 text-xs text-indigo-400 hover:underline"
                    >
                      Aus: {entry.lesson.title}
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs text-slate-400">
                    <span className="font-mono">
                      Box {cardState.box}/5 · Ease {cardState.easeFactor.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => startSession([cardState.cardId])}
                      className="font-semibold text-amber-300 hover:text-amber-200"
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
