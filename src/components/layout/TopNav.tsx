import { motion } from 'framer-motion'
import { Compass, Database, Flame, Layers, Sparkles } from 'lucide-react'
import { useYunoStore } from '../../store/useYunoStore'

export type ActiveRoute =
  | { view: 'dashboard' }
  | { view: 'review' }
  | { view: 'lesson'; lessonId: string }

interface TopNavProps {
  route: ActiveRoute
  onNavigate: (next: ActiveRoute) => void
  onOpenBackup: () => void
}

export function TopNav({ route, onNavigate, onOpenBackup }: TopNavProps) {
  const { state, dueCards, triggerStreakPreview } = useYunoStore()

  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Brand */}
        <button
          type="button"
          onClick={() => onNavigate({ view: 'dashboard' })}
          className="group flex items-center gap-2.5 text-left"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1D1D1F] text-white shadow-xs transition group-hover:scale-105">
            <Compass className="h-5 w-5 text-white transition-transform duration-300 group-hover:rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-apple-black text-lg text-[#1D1D1F]">Yuno</span>
              <span className="rounded-full bg-[#F2F2F7] px-2 py-0.5 font-mono text-[10px] font-bold text-[#515154]">
                2.0
              </span>
            </div>
            <p className="hidden text-[11px] font-medium text-[#86868B] sm:block">
              Visueller Wissensatlas
            </p>
          </div>
        </button>

        {/* Segmented Apple Control */}
        <nav className="flex items-center gap-1 rounded-full bg-[#EFEFF4] p-1">
          <button
            type="button"
            onClick={() => onNavigate({ view: 'dashboard' })}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition sm:text-sm ${
              route.view === 'dashboard' || route.view === 'lesson'
                ? 'bg-white text-[#1D1D1F] shadow-xs'
                : 'text-[#6E6E73] hover:text-[#1D1D1F]'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Atlas</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate({ view: 'review' })}
            className={`relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition sm:text-sm ${
              route.view === 'review'
                ? 'bg-white text-[#1D1D1F] shadow-xs'
                : 'text-[#6E6E73] hover:text-[#1D1D1F]'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Wiederholung</span>
            {dueCards.length > 0 && (
              <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF3B30] px-1.5 font-mono text-[11px] font-bold text-white">
                {dueCards.length}
              </span>
            )}
          </button>
        </nav>

        {/* Animated Streak Pill + XP + Backup */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={triggerStreakPreview}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3E6] px-3 py-1.5 text-xs font-extrabold text-[#D95300] transition hover:bg-[#FFE6CC]"
            title="Tägliche Lernserie anzeigen"
          >
            <motion.span
              animate={
                state.streakDays > 0
                  ? { scale: [1, 1.18, 0.96, 1.1, 1], rotate: [-3, 4, -2, 0] }
                  : undefined
              }
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex"
            >
              <Flame className={`h-3.5 w-3.5 ${state.streakDays > 0 ? 'fill-[#FF6B00] text-[#FF6B00]' : 'text-[#FF9500]'}`} />
            </motion.span>
            <span className="tabular-nums">{state.streakDays}d</span>
          </button>

          <div
            className="hidden items-center gap-1.5 rounded-full bg-[#F2F2F7] px-3 py-1.5 text-xs font-bold text-[#1D1D1F] sm:flex"
            title="Gesammelte Erfahrungspunkte"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#0071E3]" />
            <span className="tabular-nums">{state.xp.toLocaleString('de-DE')} XP</span>
          </div>

          <button
            type="button"
            onClick={onOpenBackup}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F2F7] text-[#515154] transition hover:bg-[#E5E5EA] hover:text-[#1D1D1F]"
            title="Backup & Export (JSON)"
            aria-label="Backup & Export öffnen"
          >
            <Database className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
