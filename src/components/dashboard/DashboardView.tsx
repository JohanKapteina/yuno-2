import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookMarked,
  CheckCircle2,
  Clock,
  Layers,
  PlayCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { CATEGORIES, getCategoryById, getCategoryIcon } from '../../config/categories'
import { LESSONS } from '../../lessons/registry'
import { useYunoStore } from '../../store/useYunoStore'
import type { CategoryId } from '../../types/yuno'
import { SmartMediaImage } from '../media/SmartMediaImage'
import { StreakWeekStrip } from '../ui/StreakWeekStrip'

interface DashboardViewProps {
  onOpenLesson: (lessonId: string) => void
  onOpenReview: () => void
}

export function DashboardView({ onOpenLesson, onOpenReview }: DashboardViewProps) {
  const { state, dueCards, allReviewCards } = useYunoStore()
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all')

  const filteredLessons = useMemo(() => {
    if (selectedCategory === 'all') return LESSONS
    return LESSONS.filter((l) => l.categoryId === selectedCategory)
  }, [selectedCategory])

  const completedCount = useMemo(
    () => LESSONS.filter((l) => state.lessonProgress[l.id]?.completed).length,
    [state.lessonProgress],
  )

  const featuredLesson = LESSONS[0]

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-8 sm:px-6 sm:py-12">
      {/* Apple Hero + Streak & Review Folder */}
      <section className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="apple-card flex flex-col justify-between gap-8 rounded-[32px] p-7 sm:p-10"
        >
          <div>
            <span className="inline-block rounded-full bg-[#E8F2FC] px-3 py-1 text-xs font-bold text-[#0071E3]">
              Persönlicher Wissensatlas
            </span>
            <h1 className="font-apple-black mt-4 text-4xl leading-[1.04] text-[#1D1D1F] sm:text-5xl">
              Begreifen statt auswendig lernen.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed font-medium text-[#515154]">
              Deine Lernnotizen als klare interaktive Karten, Diagramme und visuelle Wiederholungsaufgaben.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {featuredLesson && (
              <button
                type="button"
                onClick={() => onOpenLesson(featuredLesson.id)}
                className="inline-flex items-center gap-2 rounded-full bg-[#0071E3] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0077ED]"
              >
                <PlayCircle className="h-4 w-4" />
                <span>
                  {state.lessonProgress[featuredLesson.id]?.completed
                    ? 'Lektion erneut öffnen'
                    : 'Lektion starten'}
                </span>
              </button>
            )}

            <div className="flex items-center gap-5 px-2 text-xs font-semibold text-[#6E6E73]">
              <span>
                <strong className="font-extrabold text-[#1D1D1F] tabular-nums">
                  {completedCount}/{LESSONS.length}
                </strong>{' '}
                abgeschlossen
              </span>
              <span>
                <strong className="font-extrabold text-[#1D1D1F] tabular-nums">
                  {CATEGORIES.length}
                </strong>{' '}
                Fachgebiete
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right Stack: Animated Streak Strip + Review Folder */}
        <div className="flex flex-col gap-4">
          <StreakWeekStrip />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="apple-card flex flex-1 flex-col justify-between rounded-3xl p-5"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-[#86868B] uppercase">
                  <Layers className="h-4 w-4 text-[#0071E3]" />
                  <span>Wiederholungsordner</span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-xs font-bold ${
                    dueCards.length > 0
                      ? 'bg-[#FEE2E2] text-[#DC2626]'
                      : 'bg-[#DCFCE7] text-[#15803D]'
                  }`}
                >
                  {dueCards.length} fällig
                </span>
              </div>

              <h2 className="font-apple-display mt-2.5 text-xl text-[#1D1D1F]">
                {allReviewCards.length === 0
                  ? 'Noch keine Karten gespeichert'
                  : dueCards.length > 0
                    ? `${dueCards.length} ${dueCards.length === 1 ? 'Aufgabe wartet' : 'Aufgaben warten'}`
                    : 'Alles auf dem neuesten Stand'}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#6E6E73]">
                {allReviewCards.length === 0
                  ? 'Nach Abschluss einer Lektion wandern alle visuellen Aufgaben automatisch hier hinein.'
                  : `${allReviewCards.length} Karten aktiv im SM-2-Zeitplan.`}
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenReview}
              className="mt-4 flex w-full items-center justify-between rounded-2xl bg-[#F5F5F7] px-4 py-3 text-sm font-bold text-[#1D1D1F] transition hover:bg-[#EBEBF0]"
            >
              <span>
                {dueCards.length > 0 ? 'Fällige Karten üben' : 'Ordner öffnen'}
              </span>
              <ArrowRight className="h-4 w-4 text-[#0071E3]" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Lessons Shelf */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-wide text-[#0071E3] uppercase">
              Deine Lektionen
            </p>
            <h2 className="font-apple-black mt-0.5 text-3xl text-[#1D1D1F]">
              {selectedCategory === 'all'
                ? 'Alle Lektionen'
                : getCategoryById(selectedCategory).name}
            </h2>
          </div>

          {selectedCategory !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="rounded-full bg-[#E8E8ED] px-4 py-1.5 text-xs font-bold text-[#1D1D1F] transition hover:bg-[#DCDCE2]"
            >
              Alle anzeigen
            </button>
          )}
        </div>

        {filteredLessons.length === 0 ? (
          <div className="apple-card flex flex-col items-center justify-center rounded-3xl p-12 text-center">
            <BookMarked className="h-8 w-8 text-[#86868B]" />
            <h3 className="font-apple-display mt-3 text-lg text-[#1D1D1F]">
              Noch keine Lektion in „{getCategoryById(selectedCategory).name}“
            </h3>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-[#6E6E73]">
              Schick mir einfach deine nächsten OneNote-Notizen zu diesem Themengebiet — sie erscheinen nach der Umsetzung direkt hier.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredLessons.map((lesson) => {
              const cat = getCategoryById(lesson.categoryId)
              const CatIcon = getCategoryIcon(cat.iconName)
              const progress = state.lessonProgress[lesson.id]
              const screenPct = progress?.completed
                ? 100
                : progress
                  ? Math.round(((progress.currentScreenIndex + 1) / lesson.screens.length) * 100)
                  : 0

              return (
                <article
                  key={lesson.id}
                  className="apple-card-hover group flex flex-col overflow-hidden rounded-[28px]"
                >
                  <div className="relative">
                    <SmartMediaImage
                      wikiTitle={lesson.heroMedia.wikiTitle}
                      wikiLang={lesson.heroMedia.wikiLang}
                      src={lesson.heroMedia.src}
                      alt={lesson.heroMedia.alt}
                      credit={lesson.heroMedia.credit}
                      sourceUrl={lesson.heroMedia.sourceUrl}
                      aspectClass="aspect-[16/9]"
                      className="rounded-none border-0 border-b border-black/[0.06] shadow-none"
                    />
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                      <span
                        style={{ backgroundColor: cat.accentSoft, color: cat.accent }}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-xs"
                      >
                        <CatIcon className="h-3.5 w-3.5" />
                        {cat.name}
                      </span>
                      <span className="rounded-full bg-white/90 px-2.5 py-1 font-mono text-[11px] font-bold text-[#1D1D1F] shadow-xs backdrop-blur-md">
                        {lesson.eraOrContext}
                      </span>
                    </div>

                    {progress?.completed && (
                      <span className="absolute top-3.5 right-3.5 inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2.5 py-1 text-xs font-bold text-[#15803D] shadow-xs">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {progress.bestQuizScore ?? 100}%
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <h3 className="font-apple-black text-2xl leading-tight text-[#1D1D1F]">
                        {lesson.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#515154]">
                        {lesson.subtitle}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs font-semibold text-[#86868B]">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          ca. {lesson.estimatedMinutes} Min.
                        </span>
                        <span>·</span>
                        <span>{lesson.screens.length} Screens</span>
                        <span>·</span>
                        <span>{lesson.quizzes.length} Prüfungen</span>
                        <span>·</span>
                        <span className="text-[#0071E3]">+{lesson.xpReward} XP</span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#EFEFF4]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${screenPct}%`, backgroundColor: cat.accent }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenLesson(lesson.id)}
                        className="flex w-full items-center justify-between rounded-2xl bg-[#1D1D1F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0071E3]"
                      >
                        <span>
                          {progress?.completed
                            ? 'Erneut öffnen'
                            : progress
                              ? 'Fortsetzen'
                              : 'Lektion starten'}
                        </span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* 13 Knowledge Categories */}
      <section className="space-y-5">
        <div>
          <p className="text-xs font-bold tracking-wide text-[#86868B] uppercase">
            Kategorien
          </p>
          <h2 className="font-apple-black mt-0.5 text-3xl text-[#1D1D1F]">
            Alle 13 Wissensfelder
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {CATEGORIES.map((cat) => {
            const Icon = getCategoryIcon(cat.iconName)
            const count = LESSONS.filter((l) => l.categoryId === cat.id).length
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory((cur) => (cur === cat.id ? 'all' : cat.id))}
                style={
                  isSelected
                    ? { borderColor: cat.accent, boxShadow: `0 0 0 2px ${cat.accent}33` }
                    : undefined
                }
                className="apple-card-hover flex flex-col justify-between rounded-2xl p-4 text-left"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    style={{ backgroundColor: cat.accentSoft, color: cat.accent }}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-xs font-bold ${
                      count > 0 ? 'bg-[#1D1D1F] text-white' : 'bg-[#F2F2F7] text-[#86868B]'
                    }`}
                  >
                    {count}
                  </span>
                </div>

                <div className="mt-3.5">
                  <h3 className="text-sm font-extrabold tracking-tight text-[#1D1D1F]">
                    {cat.name}
                  </h3>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[#6E6E73]">
                    {cat.shortDescription}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
