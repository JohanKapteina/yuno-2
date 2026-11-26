import type { ComponentType } from 'react'

/**
 * Dynamic category identifier (open string so future categories like
 * Psychologie, Recht, Medizin, Astronomie etc. can be added without breaking types).
 */
export type CategoryId = string

export interface CategoryDefinition {
  id: CategoryId
  name: string
  shortDescription: string
  accent: string
  accentSoft: string
  iconName:
    | 'Landmark'
    | 'Scale'
    | 'TrendingUp'
    | 'Palette'
    | 'Music'
    | 'Brain'
    | 'Cpu'
    | 'Leaf'
    | 'Flame'
    | 'Atom'
    | 'BookOpen'
    | 'Compass'
    | 'ScrollText'
    | 'Sparkles'
}

export interface QuizResult {
  correct: boolean
  /** 0..1 normalized precision score */
  score: number
  /** Short feedback text */
  summary?: string
}

export interface BaseQuizCard {
  id: string
  lessonId: string
  categoryId: CategoryId
  prompt: string
  hint?: string
  explanation: string
}

export interface MapPinQuizCard extends BaseQuizCard {
  type: 'map-pin'
  target: {
    label: string
    lon: number
    lat: number
  }
  toleranceKm: number
  mapView: {
    center: [number, number]
    scale: number
  }
  contextPins?: Array<{
    label: string
    lon: number
    lat: number
    muted?: boolean
  }>
}

export interface TimelineSortQuizCard extends BaseQuizCard {
  type: 'timeline-sort'
  items: Array<{
    id: string
    label: string
    sublabel?: string
    /** Canonical 0-based chronological order */
    order: number
  }>
}

export interface ImageHotspotQuizCard extends BaseQuizCard {
  type: 'image-hotspot'
  image: {
    wikiTitle?: string
    wikiLang?: 'de' | 'en'
    src?: string
    alt: string
    credit: string
    sourceUrl?: string
  }
  /** Target coordinates in percent (0-100) relative to the rendered image */
  target: {
    x: number
    y: number
    radiusPct: number
    label: string
  }
}

export interface AudioMatchQuizCard extends BaseQuizCard {
  type: 'audio-match'
  audio:
    | {
        mode: 'tone'
        label: string
        notes: Array<{ pitch: string; duration: string; timeOffset: number }>
        bpm?: number
      }
    | {
        mode: 'youtube'
        videoId: string
        start: number
        end: number
        title: string
      }
  options: Array<{
    id: string
    label: string
    description?: string
  }>
  correctOptionId: string
}

export interface SliderEstimateQuizCard extends BaseQuizCard {
  type: 'slider-estimate'
  min: number
  max: number
  step: number
  unit: string
  prefix?: string
  suffix?: string
  targetValue: number
  tolerance: number
  /** Optional formatting helper for historical years like "216 v. Chr." */
  formatAsBCE?: boolean
}

export interface VisualConnectQuizCard extends BaseQuizCard {
  type: 'visual-connect'
  leftColumnTitle: string
  rightColumnTitle: string
  pairs: Array<{
    id: string
    left: string
    leftSub?: string
    right: string
    rightSub?: string
  }>
}

export type QuizCard =
  | MapPinQuizCard
  | TimelineSortQuizCard
  | ImageHotspotQuizCard
  | AudioMatchQuizCard
  | SliderEstimateQuizCard
  | VisualConnectQuizCard

export interface LessonScreenMeta {
  id: string
  title: string
  subtitle: string
  badge?: string
  component: ComponentType
}

export interface LessonDefinition {
  id: string
  slug: string
  categoryId: CategoryId
  title: string
  subtitle: string
  eraOrContext: string
  estimatedMinutes: number
  difficulty: 'Einstieg' | 'Vertiefung' | 'Meisterklasse'
  xpReward: number
  heroMedia: {
    wikiTitle?: string
    wikiLang?: 'de' | 'en'
    src?: string
    alt: string
    credit: string
    sourceUrl?: string
  }
  keyTakeaways: string[]
  screens: LessonScreenMeta[]
  quizzes: QuizCard[]
}

/** Spaced Repetition (SM-2 + Leitner Box) card state */
export interface ReviewCardState {
  cardId: string
  lessonId: string
  categoryId: CategoryId
  /** Leitner box 1..5 */
  box: number
  /** SM-2 ease factor (starts at 2.5, min 1.3) */
  easeFactor: number
  /** Interval in days */
  intervalDays: number
  /** Consecutive correct reviews */
  repetitions: number
  /** ISO date string when next review is due */
  dueDate: string
  lastReviewedAt?: string
  totalReviews: number
  correctReviews: number
}

export interface LessonProgress {
  lessonId: string
  currentScreenIndex: number
  completed: boolean
  completedAt?: string
  bestQuizScore?: number
}

export interface YunoPersistedState {
  version: number
  xp: number
  streakDays: number
  lastActivityDate: string | null
  activeDates?: string[]
  lessonProgress: Record<string, LessonProgress>
  reviewCards: Record<string, ReviewCardState>
}
