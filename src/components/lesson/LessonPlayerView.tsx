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
      {/* Lesson Top Bar */}
      <div className="mb-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#1D1D1F] shadow-xs ring-1 ring-black/[0.06] transition hover:bg-[#EFEFF4]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Zurück zum Atlas
          </button>

          <div className="flex items-center gap-2.5">
            <span
              style={{ backgroundColor: category.accentSoft, color: category.accent }}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
            >
              <CatIcon className="h-3.5 w-3.5" />
              {category.name}
            </span>
            <span className="font-mono text-xs font-semibold text-[#6E6E73]">
              {phase === 'learn'
                ? `Screen ${screenIndex + 1}/${lesson.screens.length}`
                : phase === 'quiz'
                  ? `Prüfung ${quizIndex + 1}/${lesson.quizzes.length}`
                  : 'Abgeschlossen'}
            </span>
          </div>
        </div>

        {/* Clean Apple Progress Bar */}
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
                    ? 'bg-[#0071E3]'
                    : passed
                      ? 'bg-[#0071E3]/45 hover:bg-[#0071E3]/70'
                      : 'bg-[#E5E5EA] hover:bg-[#D1D1D6]'
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
                  active ? 'bg-[#FF6B00]' : done ? 'bg-[#16A34A]' : 'bg-[#E5E5EA]'
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              {currentScreen.badge && (
                <span className="inline-block font-mono text-xs font-bold tracking-wide text-[#0071E3] uppercase">
                  {currentScreen.badge}
                </span>
              )}
              <h1 className="font-apple-black text-3xl leading-[1.08] text-[#1D1D1F] sm:text-4xl">
                {currentScreen.title}
              </h1>
              <p className="max-w-3xl text-sm leading-relaxed font-medium text-[#515154] sm:text-base">
                {currentScreen.subtitle}
              </p>
            </div>

            <CurrentScreenComponent />

            <div className="flex items-center justify-between gap-3 border-t border-black/[0.08] pt-6">
              <button
                type="button"
                disabled={screenIndex === 0}
                onClick={handlePrevLearn}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#1D1D1F] shadow-xs ring-1 ring-black/[0.08] transition hover:bg-[#F2F2F7] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowLeft className="h-4 w-4" />
                Zurück
              </button>

              <span className="hidden font-mono text-xs font-semibold text-[#86868B] sm:inline">
                Schritt {currentStepNumber} von {totalSteps}
              </span>

              <button
                type="button"
                onClick={handleNextLearn}
                className="inline-flex items-center gap-2 rounded-full bg-[#0071E3] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0077ED]"
              >
                <span>
                  {screenIndex === lesson.screens.length - 1
                    ? 'Zu den Prüfungsaufgaben'
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            className="apple-card space-y-6 rounded-[32px] p-6 sm:p-9"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] pb-4">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-[#FF6B00] uppercase">
                <Target className="h-4 w-4" />
                <span>
                  Visuelle Prüfung {quizIndex + 1} von {lesson.quizzes.length}
                </span>
              </div>
              <span className="rounded-full bg-[#F2F2F7] px-3 py-1 font-mono text-[11px] font-bold text-[#515154]">
                {QUIZ_TYPE_LABELS[currentQuiz.type]}
              </span>
            </div>

            <h2 className="font-apple-black text-2xl leading-tight text-[#1D1D1F] sm:text-3xl">
              {currentQuiz.prompt}
            </h2>

            <QuizRenderer
              card={currentQuiz}
              onComplete={(result) => {
                setQuizResults((prev) => ({ ...prev, [currentQuiz.id]: result }))
              }}
            />

            {currentQuizAnswered && (
              <div className="flex justify-end border-t border-black/[0.06] pt-5">
                <button
                  type="button"
                  onClick={handleNextQuiz}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1D1D1F] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0071E3]"
                >
                  <span>
                    {quizIndex === lesson.quizzes.length - 1
                      ? 'Lektion abschließen & sichern'
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
            className="apple-card space-y-6 rounded-[32px] p-7 sm:p-10"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-bold text-[#15803D]">
                  <Award className="h-3.5 w-3.5" />
                  Lektion gemeistert
                </div>
                <h2 className="font-apple-black mt-3 text-3xl text-[#1D1D1F] sm:text-4xl">
                  {lesson.title}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#F5F5F7] px-5 py-3 text-center">
                  <span className="font-apple-black block text-2xl text-[#0071E3] tabular-nums">
                    +{completionInfo?.earnedXp ?? lesson.xpReward} XP
                  </span>
                  <span className="text-[11px] font-bold text-[#86868B]">Verdient</span>
                </div>
                <div className="rounded-2xl bg-[#F5F5F7] px-5 py-3 text-center">
                  <span className="font-apple-black block text-2xl text-[#15803D] tabular-nums">
                    {correctQuizCount}/{lesson.quizzes.length}
                  </span>
                  <span className="text-[11px] font-bold text-[#86868B]">Prüfungen</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-[#E8F2FC] p-4 text-sm text-[#1D1D1F]">
              <Layers className="h-5 w-5 shrink-0 text-[#0071E3]" />
              <p className="text-xs leading-relaxed font-medium sm:text-sm">
                <strong>Wiederholungsordner aktualisiert:</strong> Alle {lesson.quizzes.length} visuellen Aufgaben wurden automatisch in deinen SM-2-Zeitplan aufgenommen.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-[#86868B] uppercase">
                <Sparkles className="h-3.5 w-3.5 text-[#0071E3]" />
                Kern-Erkenntnisse
              </h3>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {lesson.keyTakeaways.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2.5 rounded-2xl bg-[#F5F5F7] p-4 text-xs leading-relaxed font-medium text-[#1D1D1F]"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] pt-5">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="rounded-full bg-[#F2F2F7] px-5 py-2.5 text-sm font-bold text-[#1D1D1F] transition hover:bg-[#E5E5EA]"
              >
                Zurück zum Dashboard
              </button>
              <button
                type="button"
                onClick={onOpenReviewFolder}
                className="inline-flex items-center gap-2 rounded-full bg-[#0071E3] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#0077ED]"
              >
                <Layers className="h-4 w-4" />
                <span>Wiederholungsordner öffnen</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
