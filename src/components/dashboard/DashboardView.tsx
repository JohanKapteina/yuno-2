import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookMarked,
  CheckCircle2,
  Clock,
  Layers,
  PlayCircle,
  Sparkles,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { CATEGORIES, getCategoryById, getCategoryIcon } from '../../config/categories'
import { LESSONS } from '../../lessons/registry'
import { useYunoStore } from '../../store/useYunoStore'
import type { CategoryId } from '../../types/yuno'
import { SmartMediaImage } from '../media/SmartMediaImage'

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

  const boxDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]
    for (const card of allReviewCards) {
      const idx = Math.max(0, Math.min(4, card.box - 1))
      counts[idx] += 1
    }
    return counts
  }, [allReviewCards])

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-10">
      {/* Editorial Hero + Spaced Repetition Folder Spotlight */}
      <section className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="editorial-card relative overflow-hidden rounded-3xl p-6 sm:p-8"
        >
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-12 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Interaktiver Allgemeinbildungs-Atlas</span>
              </div>
              <h1 className="font-editorial mt-4 text-4xl leading-[1.08] font-normal text-white sm:text-5xl">
                Begreifen statt auswendig lernen.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Deine persönlichen OneNote-Notizen verwandelt in lebendige Karten, Taktik-Simulationen, kuratierte Medien und visuelle Spaced-Repetition-Prüfungen.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {LESSONS[0] && (
                <button
                  type="button"
                  onClick={() => onOpenLesson(LESSONS[0].id)}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(99,102,241,0.7)] transition hover:bg-indigo-400"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span>
                    {state.lessonProgress[LESSONS[0].id]?.completed
                      ? 'Demo-Lektion wiederholen'
                      : 'Demo-Lektion starten'}
                  </span>
                </button>
              )}

              <div className="flex items-center gap-4 px-2 text-xs text-slate-400">
                <span>
                  <strong className="font-mono text-white">{completedCount}/{LESSONS.length}</strong> Lektionen
                </span>
                <span>
                  <strong className="font-mono text-white">{CATEGORIES.length}</strong> Fachgebiete
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Spaced Repetition Review Folder Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="editorial-card flex flex-col justify-between rounded-3xl p-6"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-400 uppercase">
                <Layers className="h-4 w-4" />
                <span>Wiederholungsordner</span>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 font-mono text-xs font-bold ${
                  dueCards.length > 0
                    ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                    : 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                }`}
              >
                {dueCards.length} fällig
              </span>
            </div>

            <h2 className="mt-3 text-xl font-semibold text-white">
              {allReviewCards.length === 0
                ? 'Noch keine Karten im Ordner'
                : dueCards.length > 0
                  ? `${dueCards.length} visuelle ${dueCards.length === 1 ? 'Aufgabe wartet' : 'Aufgaben warten'}`
                  : 'Alles aufgeholt — Gedächtnis frisch!'}
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              {allReviewCards.length === 0
                ? 'Schließe deine erste Lektion ab — ihre visuellen Prüfungsaufgaben wandern automatisch in den SM-2-Wiederholungsordner.'
                : 'Dein SM-2 & Leitner-Algorithmus plant Karten exakt dann ein, bevor du sie vergisst.'}
            </p>

            {/* Leitner Box Mini Bars */}
            <div className="mt-5 grid grid-cols-5 gap-1.5">
              {boxDistribution.map((count, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/[0.06] bg-[#0B0F19]/80 p-2 text-center"
                >
                  <span className="block font-mono text-sm font-bold text-white">{count}</span>
                  <span className="block text-[10px] text-slate-500">Box {i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenReview}
            className="mt-5 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:border-amber-400/40 hover:bg-amber-500/10"
          >
            <span>
              {dueCards.length > 0
                ? 'Fällige Karten trainieren'
                : 'Wiederholungsordner öffnen'}
            </span>
            <ArrowRight className="h-4 w-4 text-amber-400" />
          </button>
        </motion.div>
      </section>

      {/* Lessons Shelf */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">
              Kuratierte Lektionen
            </p>
            <h2 className="mt-0.5 text-2xl font-bold tracking-tight text-white">
              {selectedCategory === 'all'
                ? 'Aktive Wissens-Expeditionen'
                : `Kategorie: ${getCategoryById(selectedCategory).name}`}
            </h2>
          </div>

          {selectedCategory !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            >
              Alle Kategorien anzeigen
            </button>
          )}
        </div>

        {filteredLessons.length === 0 ? (
          <div className="editorial-card flex flex-col items-center justify-center rounded-2xl p-10 text-center">
            <BookMarked className="h-8 w-8 text-slate-500" />
            <h3 className="mt-3 text-base font-semibold text-white">
              Noch keine Lektion in „{getCategoryById(selectedCategory).name}“
            </h3>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-400">
              Sobald du OneNote-Notizen zu diesem Themengebiet einspielst, pitchen wir dir zuerst 3 visuelle Konzepte und legen die fertige Lektion automatisch in{' '}
              <code className="font-mono text-indigo-300">/src/lessons/{selectedCategory}/</code> ab.
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
                  className="editorial-card-hover group flex flex-col overflow-hidden rounded-3xl"
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
                      className="rounded-none border-0 border-b border-white/[0.08]"
                      overlay={
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#131B2E] via-transparent to-black/25" />
                      }
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span
                        style={{ backgroundColor: cat.accentSoft, color: cat.accent, borderColor: `${cat.accent}44` }}
                        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-md"
                      >
                        <CatIcon className="h-3.5 w-3.5" />
                        {cat.name}
                      </span>
                      <span className="rounded-full border border-white/15 bg-[#0B0F19]/80 px-2.5 py-1 font-mono text-[11px] text-slate-300 backdrop-blur-md">
                        {lesson.eraOrContext}
                      </span>
                    </div>

                    {progress?.completed && (
                      <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/40 backdrop-blur-md">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {progress.bestQuizScore ?? 100}%
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <h3 className="font-editorial text-2xl leading-snug text-white sm:text-3xl">
                        {lesson.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">{lesson.subtitle}</p>

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-500" />
                          ca. {lesson.estimatedMinutes} Min.
                        </span>
                        <span>·</span>
                        <span>{lesson.screens.length} interaktive Screens</span>
                        <span>·</span>
                        <span>{lesson.quizzes.length} visuelle Quizze</span>
                        <span>·</span>
                        <span className="font-mono text-indigo-300">+{lesson.xpReward} XP</span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${screenPct}%`, backgroundColor: cat.accent }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenLesson(lesson.id)}
                        className="flex w-full items-center justify-between rounded-xl bg-white/[0.07] px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                      >
                        <span>
                          {progress?.completed
                            ? 'Lektion erneut erleben'
                            : progress
                              ? 'Lektion fortsetzen'
                              : 'Interaktive Lektion starten'}
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

      {/* Dynamic 13-Category Knowledge Atlas */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Dynamisches Kategorien-System
            </p>
            <h2 className="mt-0.5 text-2xl font-bold tracking-tight text-white">
              Die 13 Wissensfelder
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Offen erweiterbar in <code className="font-mono text-slate-300">src/config/categories.ts</code>
          </p>
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
                    ? { borderColor: cat.accent, backgroundColor: cat.accentSoft }
                    : undefined
                }
                className="editorial-card-hover flex flex-col justify-between rounded-2xl p-4 text-left"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    style={{ backgroundColor: cat.accentSoft, color: cat.accent }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold ${
                      count > 0 ? 'bg-white/10 text-white' : 'text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-semibold text-white">{cat.name}</h3>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-400">
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
