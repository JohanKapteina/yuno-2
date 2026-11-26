import { useState } from 'react'
import { BackupModal } from './components/backup/BackupModal'
import { DashboardView } from './components/dashboard/DashboardView'
import { TopNav } from './components/layout/TopNav'
import type { ActiveRoute } from './components/layout/TopNav'
import { LessonPlayerView } from './components/lesson/LessonPlayerView'
import { ReviewFolderView } from './components/review/ReviewFolderView'
import { getLessonById } from './lessons/registry'
import { YunoStoreProvider } from './store/useYunoStore'

function YunoShell() {
  const [route, setRoute] = useState<ActiveRoute>({ view: 'dashboard' })
  const [backupOpen, setBackupOpen] = useState(false)

  const activeLesson = route.view === 'lesson' ? getLessonById(route.lessonId) : undefined

  return (
    <div className="flex min-h-dvh flex-col bg-[#0B0F19] text-slate-100">
      <TopNav
        route={route}
        onNavigate={setRoute}
        onOpenBackup={() => setBackupOpen(true)}
      />

      <main className="flex-1">
        {route.view === 'dashboard' && (
          <DashboardView
            onOpenLesson={(lessonId) => setRoute({ view: 'lesson', lessonId })}
            onOpenReview={() => setRoute({ view: 'review' })}
          />
        )}

        {route.view === 'review' && (
          <ReviewFolderView
            onBackToDashboard={() => setRoute({ view: 'dashboard' })}
            onOpenLesson={(lessonId) => setRoute({ view: 'lesson', lessonId })}
          />
        )}

        {route.view === 'lesson' && activeLesson && (
          <LessonPlayerView
            key={activeLesson.id}
            lesson={activeLesson}
            onBackToDashboard={() => setRoute({ view: 'dashboard' })}
            onOpenReviewFolder={() => setRoute({ view: 'review' })}
          />
        )}
      </main>

      <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-slate-500">
        Yuno 2.0 · Persönlicher visueller Wissensatlas · Echte Geodaten (Natural Earth / d3-geo) · Verifizierte Medien (Wikimedia & YouTube)
      </footer>

      <BackupModal open={backupOpen} onClose={() => setBackupOpen(false)} />
    </div>
  )
}

export default function App() {
  return (
    <YunoStoreProvider>
      <YunoShell />
    </YunoStoreProvider>
  )
}
