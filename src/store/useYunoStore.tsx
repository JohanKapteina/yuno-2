import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { getQuizCardById } from '../lessons/registry'
import { calculateNextReview, createInitialReviewCard, isCardDue } from '../lib/sm2'
import type { ReviewQuality } from '../lib/sm2'
import type { LessonDefinition, ReviewCardState, YunoPersistedState } from '../types/yuno'

const STORAGE_KEY = 'yuno2_state_v1'

const DEFAULT_STATE: YunoPersistedState = {
  version: 1,
  xp: 0,
  streakDays: 0,
  lastActivityDate: null,
  activeDates: [],
  lessonProgress: {},
  reviewCards: {},
}

export function getLocalDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function computeNextStreak(
  prevDate: string | null,
  prevStreak: number,
  prevActiveDates: string[] = [],
): { streakDays: number; lastActivityDate: string; activeDates: string[]; increased: boolean } {
  const today = getLocalDateKey()
  const nextDates = prevActiveDates.includes(today)
    ? prevActiveDates
    : [...prevActiveDates.slice(-29), today]

  if (prevDate === today) {
    return {
      streakDays: Math.max(1, prevStreak),
      lastActivityDate: today,
      activeDates: nextDates,
      increased: false,
    }
  }
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (prevDate === getLocalDateKey(yesterday)) {
    return {
      streakDays: prevStreak + 1,
      lastActivityDate: today,
      activeDates: nextDates,
      increased: true,
    }
  }
  return {
    streakDays: 1,
    lastActivityDate: today,
    activeDates: nextDates,
    increased: true,
  }
}

function loadState(): YunoPersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw) as Partial<YunoPersistedState>
    const rawCards =
      parsed.reviewCards && typeof parsed.reviewCards === 'object' ? parsed.reviewCards : {}
    // Automatically prune orphaned cards from removed lessons
    const validCards: Record<string, ReviewCardState> = {}
    for (const [id, card] of Object.entries(rawCards)) {
      if (getQuizCardById(id)) {
        validCards[id] = card
      }
    }
    const activeDates = Array.isArray(parsed.activeDates)
      ? parsed.activeDates.filter((d): d is string => typeof d === 'string')
      : parsed.lastActivityDate
        ? [parsed.lastActivityDate]
        : []

    return {
      version: 1,
      xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
      streakDays: typeof parsed.streakDays === 'number' ? parsed.streakDays : 0,
      lastActivityDate: typeof parsed.lastActivityDate === 'string' ? parsed.lastActivityDate : null,
      activeDates,
      lessonProgress:
        parsed.lessonProgress && typeof parsed.lessonProgress === 'object' ? parsed.lessonProgress : {},
      reviewCards: validCards,
    }
  } catch {
    return DEFAULT_STATE
  }
}

export interface StreakCelebrationEvent {
  nonce: number
  streakDays: number
  earnedXp: number
  reason: string
}

interface YunoStoreContextValue {
  state: YunoPersistedState
  dueCards: ReviewCardState[]
  allReviewCards: ReviewCardState[]
  celebration: StreakCelebrationEvent | null
  dismissCelebration: () => void
  triggerStreakPreview: () => void
  updateScreenProgress: (lessonId: string, screenIndex: number) => void
  completeLessonWithQuizzes: (
    lesson: LessonDefinition,
    results: Record<string, boolean>,
  ) => { earnedXp: number; newlyAddedCards: number }
  recordReviewAttempt: (cardId: string, quality: ReviewQuality) => void
  exportBackupJson: () => string
  importBackupJson: (jsonText: string) => { ok: boolean; error?: string }
  resetAllProgress: () => void
}

const YunoStoreContext = createContext<YunoStoreContextValue | null>(null)

export function YunoStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<YunoPersistedState>(loadState)
  const [celebration, setCelebration] = useState<StreakCelebrationEvent | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Ignore quota errors
    }
  }, [state])

  const dismissCelebration = useCallback(() => setCelebration(null), [])

  const triggerStreakPreview = useCallback(() => {
    setCelebration({
      nonce: Date.now(),
      streakDays: Math.max(1, state.streakDays),
      earnedXp: state.xp,
      reason:
        state.streakDays > 0
          ? 'Deine aktuelle Lernserie — bleib dran!'
          : 'Starte deine erste Lektion für deinen ersten Streak-Tag!',
    })
  }, [state.streakDays, state.xp])

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
      let celebratedStreak = 1

      setState((prev) => {
        const alreadyCompleted = Boolean(prev.lessonProgress[lesson.id]?.completed)
        if (alreadyCompleted) {
          earnedXp = Math.round(earnedXp * 0.35)
        }
        const streakUpdate = computeNextStreak(
          prev.lastActivityDate,
          prev.streakDays,
          prev.activeDates ?? [],
        )
        celebratedStreak = streakUpdate.streakDays
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
          activeDates: streakUpdate.activeDates,
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

      setCelebration({
        nonce: Date.now(),
        streakDays: celebratedStreak,
        earnedXp,
        reason: `Lektion „${lesson.title}“ abgeschlossen`,
      })

      return { earnedXp, newlyAddedCards }
    },
    [],
  )

  const recordReviewAttempt = useCallback((cardId: string, quality: ReviewQuality) => {
    setState((prev) => {
      const existing = prev.reviewCards[cardId]
      if (!existing) return prev
      const streakUpdate = computeNextStreak(
        prev.lastActivityDate,
        prev.streakDays,
        prev.activeDates ?? [],
      )
      const xpBonus = quality >= 4 ? 20 : quality === 3 ? 12 : 5
      return {
        ...prev,
        xp: prev.xp + xpBonus,
        streakDays: streakUpdate.streakDays,
        lastActivityDate: streakUpdate.lastActivityDate,
        activeDates: streakUpdate.activeDates,
        reviewCards: {
          ...prev.reviewCards,
          [cardId]: calculateNextReview(existing, quality),
        },
      }
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
        activeDates: Array.isArray(parsed.activeDates) ? parsed.activeDates : [],
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
      Object.values(state.reviewCards)
        .filter((c) => Boolean(getQuizCardById(c.cardId)))
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    [state.reviewCards],
  )

  const dueCards = useMemo(() => allReviewCards.filter((card) => isCardDue(card)), [allReviewCards])

  const value = useMemo<YunoStoreContextValue>(
    () => ({
      state,
      dueCards,
      allReviewCards,
      celebration,
      dismissCelebration,
      triggerStreakPreview,
      updateScreenProgress,
      completeLessonWithQuizzes,
      recordReviewAttempt,
      exportBackupJson,
      importBackupJson,
      resetAllProgress,
    }),
    [
      state,
      dueCards,
      allReviewCards,
      celebration,
      dismissCelebration,
      triggerStreakPreview,
      updateScreenProgress,
      completeLessonWithQuizzes,
      recordReviewAttempt,
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
