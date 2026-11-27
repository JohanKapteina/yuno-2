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
    shortDescription: 'Bauwerke, Baustile, Statik & berühmte Gebäude',
    accent: '#B45309',
    accentSoft: '#FEF3C7',
    iconName: 'Landmark',
  },
  {
    id: 'geografie',
    name: 'Geografie',
    shortDescription: 'Länder, Hauptstädte, Flüsse, Gebirge & Flaggen',
    accent: '#0F766E',
    accentSoft: '#CCFBF1',
    iconName: 'Compass',
  },
  {
    id: 'geschichte',
    name: 'Geschichte',
    shortDescription: 'Epochen, Reiche, Wendepunkte & historische Ereignisse',
    accent: '#9A3412',
    accentSoft: '#FFEDD5',
    iconName: 'ScrollText',
  },
  {
    id: 'kunst',
    name: 'Kunst',
    shortDescription: 'Malerei, Bildhauerei, Künstler & Stilrichtungen',
    accent: '#BE185D',
    accentSoft: '#FCE7F3',
    iconName: 'Palette',
  },
  {
    id: 'literatur',
    name: 'Literatur',
    shortDescription: 'Autoren, Weltliteratur, Gattungen & Epochen',
    accent: '#7E22CE',
    accentSoft: '#F3E8FF',
    iconName: 'BookOpen',
  },
  {
    id: 'musik',
    name: 'Musik',
    shortDescription: 'Komponisten, Werke, Instrumente & Musiktheorie',
    accent: '#6D28D9',
    accentSoft: '#EDE9FE',
    iconName: 'Music',
  },
  {
    id: 'mythologie',
    name: 'Mythologie',
    shortDescription: 'Götterwelten, Sagen, Helden & antike Mythen',
    accent: '#C2410C',
    accentSoft: '#FFEDD5',
    iconName: 'Flame',
  },
  {
    id: 'natur',
    name: 'Natur',
    shortDescription: 'Tiere, Pflanzen, Lebensräume & Ökosysteme',
    accent: '#15803D',
    accentSoft: '#DCFCE7',
    iconName: 'Leaf',
  },
  {
    id: 'philosophie',
    name: 'Philosophie',
    shortDescription: 'Denker, Ethik, Erkenntnistheorie & Weltbilder',
    accent: '#4338CA',
    accentSoft: '#E0E7FF',
    iconName: 'Brain',
  },
  {
    id: 'politik',
    name: 'Politik',
    shortDescription: 'Staatsformen, Demokratie, Institutionen & Recht',
    accent: '#C81E1E',
    accentSoft: '#FEE2E2',
    iconName: 'Scale',
  },
  {
    id: 'technologie',
    name: 'Technik',
    shortDescription: 'Erfindungen, Maschinen, Ingenieurskunst & Digitales',
    accent: '#0369A1',
    accentSoft: '#E0F2FE',
    iconName: 'Cpu',
  },
  {
    id: 'wirtschaft',
    name: 'Wirtschaft',
    shortDescription: 'Märkte, Geld, Handel, Unternehmen & Konjunktur',
    accent: '#047857',
    accentSoft: '#D1FAE5',
    iconName: 'TrendingUp',
  },
  {
    id: 'wissenschaft',
    name: 'Wissenschaft',
    shortDescription: 'Physik, Chemie, Biologie, Kosmos & Naturgesetze',
    accent: '#0071E3',
    accentSoft: '#E8F2FC',
    iconName: 'Atom',
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
