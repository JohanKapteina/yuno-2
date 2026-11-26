import type { CategoryId, LessonDefinition, QuizCard } from '../types/yuno'

interface LessonModule {
  default?: LessonDefinition
  lesson?: LessonDefinition
}

/**
 * Automatic lesson discovery: every file under /src/lessons/<kategorie>/<slug>.tsx
 * exporting a LessonDefinition as default (or named `lesson`) is automatically registered.
 */
const discoveredModules = import.meta.glob<LessonModule>('./*/*.tsx', { eager: true })

export const LESSONS: LessonDefinition[] = Object.values(discoveredModules)
  .map((mod) => mod.default ?? mod.lesson)
  .filter((item): item is LessonDefinition => Boolean(item && item.id))
  .sort((a, b) => a.title.localeCompare(b.title, 'de'))

export function getLessonById(id: string): LessonDefinition | undefined {
  return LESSONS.find((l) => l.id === id)
}

export function getLessonsByCategory(categoryId: CategoryId): LessonDefinition[] {
  return LESSONS.filter((l) => l.categoryId === categoryId)
}

export function getQuizCardById(cardId: string): { card: QuizCard; lesson: LessonDefinition } | undefined {
  for (const lesson of LESSONS) {
    const card = lesson.quizzes.find((q) => q.id === cardId)
    if (card) return { card, lesson }
  }
  return undefined
}
