import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Layers,
  Sparkles,
  Target,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { getCategoryById, getCategoryIcon } from '../../config/categories'
import { useYunoStore } from '../../store/useYunoStore'
import type { LessonDefinition, QuizResult } from '../../types/yuno'
import { QUIZ_TYPE_LABELS, QuizRenderer } from '../quiz/QuizRenderer'

interface LessonPlayerViewProps {
  lesson: LessonDefinition
  onBackToDashboard: () => void
  onOpenReviewFolder: () => void
}

type PlayerPhase = 'learn' | 'quiz' | 'summary'

export function LessonPlayerView({
  lesson,
  onBackToDashboard,
  onOpenReviewFolder,
}: LessonPlayerViewProps) {
  const { updateScreenProgress, completeLessonWithQuizzes } = useYunoStore()
  const [phase, setPhase] = useState<PlayerPhase>('learn')
  const [screenIndex, setScreenIndex] = useState(0)
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizResults, setQuizResults] = useState<Record<string, QuizResult>>({})
  const [completionInfo, setCompletionInfo] = useState<{ earnedXp: number; newlyAddedCards: number } | null>(
    null,
  )

  const category = getCategoryById(lesson.categoryId)
  const CatIcon = getCategoryIcon(category.iconName)

  useEffect(() => {
    if (phase === 'learn') {
      updateScreenProgress(lesson.id, screenIndex)
    }
  }, [lesson.id, phase, screenIndex, updateScreenProgress])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [phase, screenIndex, quizIndex])

  const totalSteps = lesson.screens.length + lesson.quizzes.length
  const currentStepNumber =
    phase === 'learn'
      ? screenIndex + 1
      : phase === 'quiz'
        ? lesson.screens.length + quizIndex + 1
        : totalSteps

  const currentScreen = lesson.screens[screenIndex]
  const CurrentScreenComponent = currentScreen?.component
  const currentQuiz = lesson.quizzes[quizIndex]
  const currentQuizAnswered = currentQuiz ? Boolean(quizResults[currentQuiz.id]) : false

  const handleNextLearn = () => {
    if (screenIndex < lesson.screens.length - 1) {
      setScreenIndex((i) => i + 1)
    } else if (lesson.quizzes.length > 0) {
      setPhase('quiz')
      setQuizIndex(0)
    } else {
      const info = completeLessonWithQuizzes(lesson, {})
      setCompletionInfo(info)
      setPhase('summary')
    }
  }

  const handlePrevLearn = () => {
    if (screenIndex > 0) setScreenIndex((i) => i - 1)
  }

  const handleNextQuiz = () => {
    if (quizIndex < lesson.quizzes.length - 1) {
      setQuizIndex((i) => i + 1)
    } else {
      const boolMap: Record<string, boolean> = {}
      for (const q of lesson.quizzes) {
        boolMap[q.id] = Boolean(quizResults[q.id]?.correct)
      }
      const info = completeLessonWithQuizzes(lesson, boolMap)
      setCompletionInfo(info)
      setPhase('summary')
    }
  }

  const correctQuizCount = lesson.quizzes.filter((q) => quizResults[q.id]?.correct).length

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Lesson Top Strip */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#131B2E] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Zurück zum Atlas
          </button>

          <div className="flex items-center gap-2">
            <span
              style={{ backgroundColor: category.accentSoft, color: category.accent }}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
            >
              <CatIcon className="h-3.5 w-3.5" />
              {category.name}
            </span>
            <span className="font-mono text-xs text-slate-400">
              {phase === 'learn'
                ? `Screen ${screenIndex + 1}/${lesson.screens.length}`
                : phase === 'quiz'
                  ? `Prüfung ${quizIndex + 1}/${lesson.quizzes.length}`
                  : 'Abgeschlossen'}
            </span>
          </div>
        </div>

        {/* Segmented Progress Bar */}
        <div className="flex items-center gap-1.5">
          {lesson.screens.map((s, idx) => {
            const active = phase === 'learn' && idx === screenIndex
            const passed = phase !== 'learn' || idx < screenIndex
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setPhase('learn')
                  setScreenIndex(idx)
                }}
                title={s.title}
                className={`h-2 flex-1 rounded-full transition-all ${
                  active
                    ? 'bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.65)]'
                    : passed
                      ? 'bg-indigo-500/60 hover:bg-indigo-400/80'
                      : 'bg-white/10 hover:bg-white/20'
                }`}
              />
            )
          })}
          {lesson.quizzes.map((q, idx) => {
            const active = phase === 'quiz' && idx === quizIndex
            const done = phase === 'summary' || Boolean(quizResults[q.id])
            return (
              <div
                key={q.id}
                className={`h-2 flex-1 rounded-full transition-all ${
                  active
                    ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.65)]'
                    : done
                      ? 'bg-emerald-400/75'
                      : 'bg-white/10'
                }`}
              />
            )
          })}
        </div>
      </div>

      {/* Main Stage */}
      <AnimatePresence mode="wait">
        {phase === 'learn' && CurrentScreenComponent && (
          <motion.div
            key={`screen-${currentScreen.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.24 }}
            className="space-y-6"
          >
            <div className="space-y-1.5">
              {currentScreen.badge && (
                <span className="inline-block font-mono text-xs font-semibold tracking-wider text-amber-400 uppercase">
                  {currentScreen.badge}
                </span>
              )}
              <h1 className="font-editorial text-3xl leading-tight text-white sm:text-4xl">
                {currentScreen.title}
              </h1>
              <p className="max-w-3xl text-sm leading-relaxed text-slate-300">
                {currentScreen.subtitle}
              </p>
            </div>

            <CurrentScreenComponent />

            {/* Bottom Stepper Navigation */}
            <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] pt-5">
              <button
                type="button"
                disabled={screenIndex === 0}
                onClick={handlePrevLearn}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#131B2E] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowLeft className="h-4 w-4" />
                Zurück
              </button>

              <span className="hidden font-mono text-xs text-slate-500 sm:inline">
                Schritt {currentStepNumber} von {totalSteps}
              </span>

              <button
                type="button"
                onClick={handleNextLearn}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(99,102,241,0.75)] transition hover:bg-indigo-400"
              >
                <span>
                  {screenIndex === lesson.screens.length - 1
                    ? 'Zu den visuellen Prüfungen'
                    : 'Weiter'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'quiz' && currentQuiz && (
          <motion.div
            key={`quiz-${currentQuiz.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.24 }}
            className="editorial-card space-y-6 rounded-3xl p-5 sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-400 uppercase">
                <Target className="h-4 w-4" />
                <span>
                  Visuelle Prüfung {quizIndex + 1} von {lesson.quizzes.length}
                </span>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 font-mono text-[11px] text-slate-300">
                {QUIZ_TYPE_LABELS[currentQuiz.type]}
              </span>
            </div>

            <h2 className="font-editorial text-2xl leading-snug text-white sm:text-3xl">
              {currentQuiz.prompt}
            </h2>

            <QuizRenderer
              card={currentQuiz}
              onComplete={(result) => {
                setQuizResults((prev) => ({ ...prev, [currentQuiz.id]: result }))
              }}
            />

            {currentQuizAnswered && (
              <div className="flex justify-end border-t border-white/[0.08] pt-4">
                <button
                  type="button"
                  onClick={handleNextQuiz}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-[#0B0F19] transition hover:bg-amber-400"
                >
                  <span>
                    {quizIndex === lesson.quizzes.length - 1
                      ? 'Lektion abschließen & in Wiederholungsordner sichern'
                      : 'Nächste Aufgabe'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {phase === 'summary' && (
          <motion.div
            key="lesson-summary"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="editorial-card space-y-6 rounded-3xl p-6 sm:p-9"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/35">
                  <Award className="h-3.5 w-3.5" />
                  Lektion gemeistert
                </div>
                <h2 className="font-editorial mt-3 text-3xl text-white sm:text-4xl">
                  {lesson.title}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-[#0B0F19] px-4 py-3 text-center">
                  <span className="block font-mono text-xl font-bold text-indigo-300">
                    +{completionInfo?.earnedXp ?? lesson.xpReward} XP
                  </span>
                  <span className="text-[11px] text-slate-400">Verdient</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#0B0F19] px-4 py-3 text-center">
                  <span className="block font-mono text-xl font-bold text-emerald-300">
                    {correctQuizCount}/{lesson.quizzes.length}
                  </span>
                  <span className="text-[11px] text-slate-400">Prüfungen</span>
                </div>
              </div>
            </div>

            {/* Spaced repetition confirmation */}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-100">
              <Layers className="h-5 w-5 shrink-0 text-amber-400" />
              <p className="text-xs leading-relaxed sm:text-sm">
                <strong>Spaced Repetition aktiviert:</strong> Alle {lesson.quizzes.length} visuellen Aufgaben wurden automatisch in deinen{' '}
                <strong>Wiederholungsordner</strong> (SM-2 / Leitner-System) übernommen.
              </p>
            </div>

            {/* Key Takeaways */}
            <div className="space-y-2.5">
              <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                Kern-Erkenntnisse im Gedächtnisanker
              </h3>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {lesson.keyTakeaways.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-[#0D1322] p-3.5 text-xs leading-relaxed text-slate-200"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-5">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="rounded-xl border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Zurück zum Dashboard
              </button>
              <button
                type="button"
                onClick={onOpenReviewFolder}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-[#0B0F19] transition hover:bg-amber-400"
              >
                <Layers className="h-4 w-4" />
                <span>Wiederholungsordner ansehen</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
