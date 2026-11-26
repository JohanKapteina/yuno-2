import type { QuizCard, QuizResult } from '../../types/yuno'
import { AudioMatchQuiz } from './AudioMatchQuiz'
import { ImageHotspotQuiz } from './ImageHotspotQuiz'
import { MapPinQuiz } from './MapPinQuiz'
import { SliderEstimateQuiz } from './SliderEstimateQuiz'
import { TimelineSortQuiz } from './TimelineSortQuiz'
import { VisualConnectQuiz } from './VisualConnectQuiz'

export const QUIZ_TYPE_LABELS: Record<QuizCard['type'], string> = {
  'map-pin': 'Karten-Pin',
  'timeline-sort': 'Chronologie-Sortierung',
  'image-hotspot': 'Bild-Hotspot',
  'audio-match': 'Audio-Zuordnung',
  'slider-estimate': 'Schätz-Regler',
  'visual-connect': 'Visuelle Verknüpfung',
}

interface QuizRendererProps {
  card: QuizCard
  onComplete: (result: QuizResult) => void
}

export function QuizRenderer({ card, onComplete }: QuizRendererProps) {
  switch (card.type) {
    case 'map-pin':
      return <MapPinQuiz key={card.id} card={card} onComplete={onComplete} />
    case 'timeline-sort':
      return <TimelineSortQuiz key={card.id} card={card} onComplete={onComplete} />
    case 'image-hotspot':
      return <ImageHotspotQuiz key={card.id} card={card} onComplete={onComplete} />
    case 'audio-match':
      return <AudioMatchQuiz key={card.id} card={card} onComplete={onComplete} />
    case 'slider-estimate':
      return <SliderEstimateQuiz key={card.id} card={card} onComplete={onComplete} />
    case 'visual-connect':
      return <VisualConnectQuiz key={card.id} card={card} onComplete={onComplete} />
  }
}
