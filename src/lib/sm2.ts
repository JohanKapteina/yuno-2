import type { CategoryId, ReviewCardState } from '../types/yuno'

/**
 * SM-2 quality rating:
 * 1 = Nochmal (vergessen)
 * 3 = Schwer
 * 4 = Gut
 * 5 = Leicht (perfekt)
 */
export type ReviewQuality = 1 | 3 | 4 | 5

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function createInitialReviewCard(
  cardId: string,
  lessonId: string,
  categoryId: CategoryId,
  initialCorrect: boolean,
): ReviewCardState {
  const now = new Date()
  // If answered correctly during the lesson exam, schedule first review in 1 day (Box 2);
  // if missed, schedule immediately due today (Box 1) so the user can drill it right away.
  const intervalDays = initialCorrect ? 1 : 0
  const dueDate = new Date(now.getTime() + intervalDays * MS_PER_DAY).toISOString()

  return {
    cardId,
    lessonId,
    categoryId,
    box: initialCorrect ? 2 : 1,
    easeFactor: 2.5,
    intervalDays,
    repetitions: initialCorrect ? 1 : 0,
    dueDate,
    lastReviewedAt: now.toISOString(),
    totalReviews: 1,
    correctReviews: initialCorrect ? 1 : 0,
  }
}

/**
 * Pure SM-2 + Leitner-Box update function.
 */
export function calculateNextReview(
  card: ReviewCardState,
  quality: ReviewQuality,
  now = new Date(),
): ReviewCardState {
  let { easeFactor, intervalDays, repetitions, box } = card

  if (quality < 3) {
    repetitions = 0
    intervalDays = 0
    box = 1
  } else {
    if (repetitions === 0) {
      intervalDays = 1
    } else if (repetitions === 1) {
      intervalDays = 4
    } else {
      intervalDays = Math.round(intervalDays * easeFactor)
    }
    repetitions += 1
    box = Math.min(5, box + 1)
  }

  easeFactor = Math.max(
    1.3,
    Number((easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))).toFixed(2)),
  )

  // Bonus interval bump on "Leicht"
  if (quality === 5 && intervalDays >= 1) {
    intervalDays = Math.round(intervalDays * 1.3)
  }

  const dueDate = new Date(now.getTime() + intervalDays * MS_PER_DAY).toISOString()

  return {
    ...card,
    box,
    easeFactor,
    intervalDays,
    repetitions,
    dueDate,
    lastReviewedAt: now.toISOString(),
    totalReviews: card.totalReviews + 1,
    correctReviews: card.correctReviews + (quality >= 3 ? 1 : 0),
  }
}

export function isCardDue(card: ReviewCardState, now = new Date()): boolean {
  return new Date(card.dueDate).getTime() <= now.getTime()
}

export function formatDueLabel(dueDateIso: string, now = new Date()): string {
  const diffMs = new Date(dueDateIso).getTime() - now.getTime()
  if (diffMs <= 0) return 'Jetzt fällig'
  const diffHours = Math.ceil(diffMs / (60 * 60 * 1000))
  if (diffHours < 24) return `In ${diffHours} Std.`
  const diffDays = Math.ceil(diffMs / MS_PER_DAY)
  if (diffDays === 1) return 'Morgen'
  return `In ${diffDays} Tagen`
}
