import {
  Atom,
  BookOpen,
  Brain,
  Compass,
  Cpu,
  Flame,
  Landmark,
  Leaf,
  Music,
  Palette,
  Scale,
  ScrollText,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { CategoryDefinition, CategoryId } from '../types/yuno'

/**
 * Dynamic Category Registry (see CREATIVE_DIRECTOR_PROTOCOL.md).
 * Adding a new category (e.g., Psychologie, Recht, Medizin, Astronomie)
 * only requires appending an entry here — zero rigid hardcoded switches needed.
 */
export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'architektur',
    name: 'Architektur',
    shortDescription: 'Bauwerke, Statik, Raumkunst & Epochen',
    accent: '#D97706',
    accentSoft: 'rgba(217, 119, 6, 0.14)',
    iconName: 'Landmark',
  },
  {
    id: 'politik',
    name: 'Politik',
    shortDescription: 'Machtsysteme, Institutionen & Geopolitik',
    accent: '#E11D48',
    accentSoft: 'rgba(225, 29, 72, 0.14)',
    iconName: 'Scale',
  },
  {
    id: 'wirtschaft',
    name: 'Wirtschaft',
    shortDescription: 'Märkte, Geldpolitik, Handel & Zyklen',
    accent: '#10B981',
    accentSoft: 'rgba(16, 185, 129, 0.14)',
    iconName: 'TrendingUp',
  },
  {
    id: 'kunst',
    name: 'Kunst',
    shortDescription: 'Malerei, Komposition, Licht & Stilgeschichte',
    accent: '#EC4899',
    accentSoft: 'rgba(236, 72, 153, 0.14)',
    iconName: 'Palette',
  },
  {
    id: 'musik',
    name: 'Musik',
    shortDescription: 'Harmonik, Rhythmus, Werke & Klangwelten',
    accent: '#8B5CF6',
    accentSoft: 'rgba(139, 92, 246, 0.14)',
    iconName: 'Music',
  },
  {
    id: 'philosophie',
    name: 'Philosophie',
    shortDescription: 'Ideengeschichte, Ethik & Gedankenexperimente',
    accent: '#6366F1',
    accentSoft: 'rgba(99, 102, 241, 0.14)',
    iconName: 'Brain',
  },
  {
    id: 'technologie',
    name: 'Technologie',
    shortDescription: 'Maschinen, Systeme, Computing & Signalfluss',
    accent: '#06B6D4',
    accentSoft: 'rgba(6, 182, 212, 0.14)',
    iconName: 'Cpu',
  },
  {
    id: 'natur',
    name: 'Natur',
    shortDescription: 'Ökosysteme, Evolution, Anatomie & Biodiversität',
    accent: '#22C55E',
    accentSoft: 'rgba(34, 197, 94, 0.14)',
    iconName: 'Leaf',
  },
  {
    id: 'mythologie',
    name: 'Mythologie',
    shortDescription: 'Götterwelten, Epen, Symbole & Archetypen',
    accent: '#F97316',
    accentSoft: 'rgba(249, 115, 22, 0.14)',
    iconName: 'Flame',
  },
  {
    id: 'wissenschaft',
    name: 'Wissenschaft',
    shortDescription: 'Physik, Chemie, Kosmos & Naturgesetze',
    accent: '#38BDF8',
    accentSoft: 'rgba(56, 189, 248, 0.14)',
    iconName: 'Atom',
  },
  {
    id: 'literatur',
    name: 'Literatur',
    shortDescription: 'Erzählkunst, Figurennetze, Dramaturgie & Stil',
    accent: '#A855F7',
    accentSoft: 'rgba(168, 85, 247, 0.14)',
    iconName: 'BookOpen',
  },
  {
    id: 'geografie',
    name: 'Geografie',
    shortDescription: 'Tektonik, Klima, Flüsse, Regionen & Routen',
    accent: '#14B8A6',
    accentSoft: 'rgba(20, 184, 166, 0.14)',
    iconName: 'Compass',
  },
  {
    id: 'geschichte',
    name: 'Geschichte',
    shortDescription: 'Reiche, Wendepunkte, Taktik & Kausalität',
    accent: '#F59E0B',
    accentSoft: 'rgba(245, 158, 11, 0.14)',
    iconName: 'ScrollText',
  },
]

const ICON_MAP: Record<CategoryDefinition['iconName'], LucideIcon> = {
  Landmark,
  Scale,
  TrendingUp,
  Palette,
  Music,
  Brain,
  Cpu,
  Leaf,
  Flame,
  Atom,
  BookOpen,
  Compass,
  ScrollText,
  Sparkles,
}

export function getCategoryById(id: CategoryId): CategoryDefinition {
  const found = CATEGORIES.find((c) => c.id === id)
  if (found) return found
  return {
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    shortDescription: 'Erweiterte Wissenskategorie',
    accent: '#6366F1',
    accentSoft: 'rgba(99, 102, 241, 0.14)',
    iconName: 'Sparkles',
  }
}

export function getCategoryIcon(iconName: CategoryDefinition['iconName']): LucideIcon {
  return ICON_MAP[iconName] ?? Sparkles
}
