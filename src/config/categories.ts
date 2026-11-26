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
 * Dynamic Category Registry — refined Apple system tones (high contrast on light surfaces).
 */
export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'architektur',
    name: 'Architektur',
    shortDescription: 'Bauwerke, Statik, Raumkunst & Epochen',
    accent: '#B45309',
    accentSoft: '#FEF3C7',
    iconName: 'Landmark',
  },
  {
    id: 'politik',
    name: 'Politik',
    shortDescription: 'Machtsysteme, Institutionen & Geopolitik',
    accent: '#C81E1E',
    accentSoft: '#FEE2E2',
    iconName: 'Scale',
  },
  {
    id: 'wirtschaft',
    name: 'Wirtschaft',
    shortDescription: 'Märkte, Geldpolitik, Handel & Zyklen',
    accent: '#047857',
    accentSoft: '#D1FAE5',
    iconName: 'TrendingUp',
  },
  {
    id: 'kunst',
    name: 'Kunst',
    shortDescription: 'Malerei, Komposition, Licht & Stilgeschichte',
    accent: '#BE185D',
    accentSoft: '#FCE7F3',
    iconName: 'Palette',
  },
  {
    id: 'musik',
    name: 'Musik',
    shortDescription: 'Harmonik, Rhythmus, Werke & Klangwelten',
    accent: '#6D28D9',
    accentSoft: '#EDE9FE',
    iconName: 'Music',
  },
  {
    id: 'philosophie',
    name: 'Philosophie',
    shortDescription: 'Ideengeschichte, Ethik & Gedankenexperimente',
    accent: '#4338CA',
    accentSoft: '#E0E7FF',
    iconName: 'Brain',
  },
  {
    id: 'technologie',
    name: 'Technologie',
    shortDescription: 'Maschinen, Systeme, Computing & Signalfluss',
    accent: '#0369A1',
    accentSoft: '#E0F2FE',
    iconName: 'Cpu',
  },
  {
    id: 'natur',
    name: 'Natur',
    shortDescription: 'Ökosysteme, Evolution, Anatomie & Biodiversität',
    accent: '#15803D',
    accentSoft: '#DCFCE7',
    iconName: 'Leaf',
  },
  {
    id: 'mythologie',
    name: 'Mythologie',
    shortDescription: 'Götterwelten, Epen, Symbole & Archetypen',
    accent: '#C2410C',
    accentSoft: '#FFEDD5',
    iconName: 'Flame',
  },
  {
    id: 'wissenschaft',
    name: 'Wissenschaft',
    shortDescription: 'Physik, Chemie, Kosmos & Naturgesetze',
    accent: '#0071E3',
    accentSoft: '#E8F2FC',
    iconName: 'Atom',
  },
  {
    id: 'literatur',
    name: 'Literatur',
    shortDescription: 'Erzählkunst, Figurennetze, Dramaturgie & Stil',
    accent: '#7E22CE',
    accentSoft: '#F3E8FF',
    iconName: 'BookOpen',
  },
  {
    id: 'geografie',
    name: 'Geografie',
    shortDescription: 'Tektonik, Klima, Flüsse, Regionen & Routen',
    accent: '#0F766E',
    accentSoft: '#CCFBF1',
    iconName: 'Compass',
  },
  {
    id: 'geschichte',
    name: 'Geschichte',
    shortDescription: 'Reiche, Wendepunkte, Taktik & Kausalität',
    accent: '#9A3412',
    accentSoft: '#FFEDD5',
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
    accent: '#0071E3',
    accentSoft: '#E8F2FC',
    iconName: 'Sparkles',
  }
}

export function getCategoryIcon(iconName: CategoryDefinition['iconName']): LucideIcon {
  return ICON_MAP[iconName] ?? Sparkles
}
