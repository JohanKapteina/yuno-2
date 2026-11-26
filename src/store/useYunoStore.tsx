import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { calculateNextReview, createInitialReviewCard, isCardDue } from '../lib/sm2'
import type { ReviewQuality } from '../lib/sm2'
import type { LessonDefinition, ReviewCardState, YunoPersistedState } from '../types/yuno'

const STORAGE_KEY = 'yuno2_state_v1'

const DEFAULT_STATE: YunoPersistedState = {
  version: 1,
  xp: 0,
  streakDays: 0,
  lastActivityDate: null,
  lessonProgress: {},
  reviewCards: {},
}

function getLocalDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function computeNextStreak(prevDate: string | null, prevStreak: number): { streakDays: number; lastActivityDate: string } {
  const today = getLocalDateKey()
  if (prevDate === today) {
    return { streakDays: Math.max(1, prevStreak), lastActivityDate: today }
  }
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (prevDate === getLocalDateKey(yesterday)) {
    return { streakDays: prevStreak + 1, lastActivityDate: today }
  }
  return { streakDays: 1, lastActivityDate: today }
}

function loadState(): YunoPersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw) as Partial<YunoPersistedState>
    return {
      version: 1,
      xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
      streakDays: typeof parsed.streakDays === 'number' ? parsed.streakDays : 0,
      lastActivityDate: typeof parsed.lastActivityDate === 'string' ? parsed.lastActivityDate : null,
      lessonProgress: parsed.lessonProgress && typeof parsed.lessonProgress === 'object' ? parsed.lessonProgress : {},
      reviewCards: parsed.reviewCards && typeof parsed.reviewCards === 'object' ? parsed.reviewCards : {},
    }
  } catch {
    return DEFAULT_STATE
  }
}

interface YunoStoreContextValue {
  state: YunoPersistedState
  dueCards: ReviewCardState[]
  allReviewCards: ReviewCardState[]
  updateScreenProgress: (lessonId: string, screenIndex: number) => void
  completeLessonWithQuizzes: (
    lesson: LessonDefinition,
    results: Record<string, boolean>,
  ) => { earnedXp: number; newlyAddedCards: number }
  recordReviewAttempt: (cardId: string, quality: ReviewQuality) => void
  makeAllCardsDueNow: () => void
  exportBackupJson: () => string
  importBackupJson: (jsonText: string) => { ok: boolean; error?: string }
  resetAllProgress: () => void
}

const YunoStoreContext = createContext<YunoStoreContextValue | null>(null)

export function YunoStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<YunoPersistedState>(loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Ignore quota errors in private browsing
    }
  }, [state])

  const updateScreenProgress = useCallback((lessonId: string, screenIndex: number) => {
    setState((prev) => {
      const existing = prev.lessonProgress[lessonId]
      const nextScreen = Math.max(existing?.currentScreenIndex ?? 0, screenIndex)
      if (existing && existing.currentScreenIndex === nextScreen) return prev
      return {
        ...prev,
        lessonProgress: {
          ...prev.lessonProgress,
          [lessonId]: {
            lessonId,
            currentScreenIndex: nextScreen,
            completed: existing?.completed ?? false,
            completedAt: existing?.completedAt,
            bestQuizScore: existing?.bestQuizScore,
          },
        },
      }
    })
  }, [])

  const completeLessonWithQuizzes = useCallback(
    (lesson: LessonDefinition, results: Record<string, boolean>) => {
      const total = lesson.quizzes.length
      const correctCount = lesson.quizzes.filter((q) => results[q.id]).length
      const ratio = total > 0 ? correctCount / total : 1
      let earnedXp = Math.round(lesson.xpReward * (0.5 + 0.5 * ratio))
      let newlyAddedCards = 0

      setState((prev) => {
        const alreadyCompleted = Boolean(prev.lessonProgress[lesson.id]?.completed)
        if (alreadyCompleted) {
          earnedXp = Math.round(earnedXp * 0.35)
        }
        const streakUpdate = computeNextStreak(prev.lastActivityDate, prev.streakDays)
        const updatedReviewCards = { ...prev.reviewCards }

        for (const quiz of lesson.quizzes) {
          const wasCorrect = Boolean(results[quiz.id])
          const existingCard = updatedReviewCards[quiz.id]
          if (!existingCard) {
            newlyAddedCards += 1
            updatedReviewCards[quiz.id] = createInitialReviewCard(
              quiz.id,
              lesson.id,
              lesson.categoryId,
              wasCorrect,
            )
          } else {
            updatedReviewCards[quiz.id] = calculateNextReview(existingCard, wasCorrect ? 4 : 1)
          }
        }

        const prevBest = prev.lessonProgress[lesson.id]?.bestQuizScore ?? 0

        return {
          ...prev,
          xp: prev.xp + earnedXp,
          streakDays: streakUpdate.streakDays,
          lastActivityDate: streakUpdate.lastActivityDate,
          lessonProgress: {
            ...prev.lessonProgress,
            [lesson.id]: {
              lessonId: lesson.id,
              currentScreenIndex: lesson.screens.length - 1,
              completed: true,
              completedAt: new Date().toISOString(),
              bestQuizScore: Math.max(prevBest, Math.round(ratio * 100)),
            },
          },
          reviewCards: updatedReviewCards,
        }
      })

      return { earnedXp, newlyAddedCards }
    },
    [],
  )

  const recordReviewAttempt = useCallback((cardId: string, quality: ReviewQuality) => {
    setState((prev) => {
      const existing = prev.reviewCards[cardId]
      if (!existing) return prev
      const streakUpdate = computeNextStreak(prev.lastActivityDate, prev.streakDays)
      const xpBonus = quality >= 4 ? 20 : quality === 3 ? 12 : 5
      return {
        ...prev,
        xp: prev.xp + xpBonus,
        streakDays: streakUpdate.streakDays,
        lastActivityDate: streakUpdate.lastActivityDate,
        reviewCards: {
          ...prev.reviewCards,
          [cardId]: calculateNextReview(existing, quality),
        },
      }
    })
  }, [])

  const makeAllCardsDueNow = useCallback(() => {
    const pastIso = new Date(Date.now() - 60_000).toISOString()
    setState((prev) => {
      const nextCards: Record<string, ReviewCardState> = {}
      for (const [id, card] of Object.entries(prev.reviewCards)) {
        nextCards[id] = { ...card, dueDate: pastIso }
      }
      return { ...prev, reviewCards: nextCards }
    })
  }, [])

  const exportBackupJson = useCallback(() => {
    return JSON.stringify(state, null, 2)
  }, [state])

  const importBackupJson = useCallback((jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText) as Partial<YunoPersistedState>
      if (typeof parsed !== 'object' || parsed === null) {
        return { ok: false, error: 'Ungültiges JSON-Format.' }
      }
      if (typeof parsed.xp !== 'number' || typeof parsed.reviewCards !== 'object') {
        return { ok: false, error: 'Backup-Datei enthält keine gültigen Yuno-Daten.' }
      }
      setState({
        version: 1,
        xp: parsed.xp,
        streakDays: typeof parsed.streakDays === 'number' ? parsed.streakDays : 0,
        lastActivityDate: typeof parsed.lastActivityDate === 'string' ? parsed.lastActivityDate : null,
        lessonProgress: parsed.lessonProgress ?? {},
        reviewCards: parsed.reviewCards ?? {},
      })
      return { ok: true }
    } catch {
      return { ok: false, error: 'JSON konnte nicht gelesen werden.' }
    }
  }, [])

  const resetAllProgress = useCallback(() => {
    setState(DEFAULT_STATE)
  }, [])

  const allReviewCards = useMemo(
    () =>
      Object.values(state.reviewCards).sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      ),
    [state.reviewCards],
  )

  const dueCards = useMemo(() => allReviewCards.filter((card) => isCardDue(card)), [allReviewCards])

  const value = useMemo<YunoStoreContextValue>(
    () => ({
      state,
      dueCards,
      allReviewCards,
      updateScreenProgress,
      completeLessonWithQuizzes,
      recordReviewAttempt,
      makeAllCardsDueNow,
      exportBackupJson,
      importBackupJson,
      resetAllProgress,
    }),
    [
      state,
      dueCards,
      allReviewCards,
      updateScreenProgress,
      completeLessonWithQuizzes,
      recordReviewAttempt,
      makeAllCardsDueNow,
      exportBackupJson,
      importBackupJson,
      resetAllProgress,
    ],
  )

  return <YunoStoreContext.Provider value={value}>{children}</YunoStoreContext.Provider>
}

export function useYunoStore(): YunoStoreContextValue {
  const ctx = useContext(YunoStoreContext)
  if (!ctx) throw new Error('useYunoStore must be used inside YunoStoreProvider')
  return ctx
}
