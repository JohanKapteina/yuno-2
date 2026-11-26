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
  const { state, dueCards } = useYunoStore()

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0B0F19]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Brand */}
        <button
          type="button"
          onClick={() => onNavigate({ view: 'dashboard' })}
          className="group flex items-center gap-2.5 text-left"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-gradient-to-br from-indigo-500/25 via-[#131B2E] to-amber-500/20 shadow-inner transition group-hover:border-indigo-400/50">
            <Compass className="h-5 w-5 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-white">Yuno</span>
              <span className="rounded-md border border-indigo-400/30 bg-indigo-500/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-indigo-300">
                2.0
              </span>
            </div>
            <p className="hidden text-[11px] text-slate-400 sm:block">Visueller Wissensatlas</p>
          </div>
        </button>

        {/* Primary Nav */}
        <nav className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-[#131B2E]/90 p-1">
          <button
            type="button"
            onClick={() => onNavigate({ view: 'dashboard' })}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              route.view === 'dashboard' || route.view === 'lesson'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Atlas</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate({ view: 'review' })}
            className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              route.view === 'review'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Wiederholung</span>
            {dueCards.length > 0 && (
              <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 font-mono text-[11px] font-bold text-[#0B0F19]">
                {dueCards.length}
              </span>
            )}
          </button>
        </nav>

        {/* Stats + Backup */}
        <div className="flex items-center gap-2">
          <div
            className="hidden items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#131B2E] px-2.5 py-1.5 text-xs font-medium text-slate-200 md:flex"
            title="Tägliche Lernserie"
          >
            <Flame className={`h-3.5 w-3.5 ${state.streakDays > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
            <span className="font-mono">{state.streakDays}d</span>
          </div>

          <div
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#131B2E] px-2.5 py-1.5 text-xs font-medium text-slate-200"
            title="Gesammelte Erfahrungspunkte"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span className="font-mono">{state.xp.toLocaleString('de-DE')} XP</span>
          </div>

          <button
            type="button"
            onClick={onOpenBackup}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-[#131B2E] text-slate-400 transition hover:border-white/20 hover:text-white"
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
