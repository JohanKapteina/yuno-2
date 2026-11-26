import { AnimatePresence, motion } from 'framer-motion'
import { Check, Flame, Sparkles, X } from 'lucide-react'
import { getLocalDateKey, useYunoStore } from '../../store/useYunoStore'

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function getCurrentWeekDates(): Array<{ label: string; key: string; isToday: boolean }> {
  const now = new Date()
  const jsDay = now.getDay() // 0=Sun..6=Sat
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay
  const todayKey = getLocalDateKey(now)
  return WEEKDAYS.map((label, idx) => {
    const d = new Date(now)
    d.setDate(now.getDate() + mondayOffset + idx)
    const key = getLocalDateKey(d)
    return { label, key, isToday: key === todayKey }
  })
}

const SPARKS = [
  { x: -78, y: -58, delay: 0.08, color: '#FF6B00' },
  { x: 82, y: -52, delay: 0.14, color: '#FF9500' },
  { x: -94, y: 12, delay: 0.2, color: '#0071E3' },
  { x: 96, y: 18, delay: 0.12, color: '#FF3B30' },
  { x: -56, y: -92, delay: 0.18, color: '#FFCC00' },
  { x: 60, y: -88, delay: 0.1, color: '#34C759' },
]

export function StreakCelebration() {
  const { celebration, dismissCelebration, state } = useYunoStore()
  const activeDates = state.activeDates ?? []
  const week = getCurrentWeekDates()

  return (
    <AnimatePresence>
      {celebration && (
        <motion.div
          key={celebration.nonce}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismissCelebration}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="apple-card relative w-full max-w-md overflow-hidden rounded-[32px] p-8 text-center"
          >
            <button
              type="button"
              onClick={dismissCelebration}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F2F7] text-[#6E6E73] transition hover:bg-[#E5E5EA] hover:text-[#1D1D1F]"
              aria-label="Schließen"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Animated Flame Hero */}
            <div className="relative mx-auto mt-2 flex h-32 w-32 items-center justify-center">
              {/* Breathing rings */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: [0.92, 1.24, 0.92], opacity: [0.32, 0.08, 0.32] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF6B00]/30 to-[#FFCC00]/30"
              />
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-b from-[#FF9500] to-[#FF5E00] shadow-[0_16px_36px_-8px_rgba(255,107,0,0.55)]"
              >
                <motion.div
                  animate={{ scale: [1, 1.12, 0.98, 1.08, 1], rotate: [-2, 3, -2, 2, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Flame className="h-12 w-12 fill-white text-white" />
                </motion.div>
              </motion.div>

              {/* Radial celebratory particles */}
              {SPARKS.map((sp, i) => (
                <motion.span
                  key={i}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                  animate={{ x: sp.x, y: sp.y, scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.1, delay: sp.delay, ease: 'easeOut' }}
                  style={{ backgroundColor: sp.color }}
                  className="pointer-events-none absolute h-2.5 w-2.5 rounded-full"
                />
              ))}
            </div>

            {/* Ultra-bold Day Count */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.12 }}
              className="mt-4"
            >
              <span className="font-apple-black block text-6xl text-[#1D1D1F] tabular-nums">
                {celebration.streakDays} {celebration.streakDays === 1 ? 'Tag' : 'Tage'}
              </span>
              <p className="mt-1 text-base font-extrabold tracking-tight text-[#FF6B00]">
                Lernserie aktiv!
              </p>
              <p className="mt-1 text-sm text-[#6E6E73]">{celebration.reason}</p>
            </motion.div>

            {/* 7-day animated strip */}
            <div className="mt-6 grid grid-cols-7 gap-2 rounded-2xl bg-[#F5F5F7] p-3">
              {week.map((day, i) => {
                const done = activeDates.includes(day.key) || (day.isToday && state.streakDays > 0)
                return (
                  <div key={day.key} className="flex flex-col items-center gap-1.5">
                    <motion.div
                      initial={{ scale: 0.7 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.15 + i * 0.04, type: 'spring', stiffness: 340 }}
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        done
                          ? 'bg-[#FF6B00] text-white shadow-sm'
                          : day.isToday
                            ? 'border-2 border-dashed border-[#FF6B00] bg-white text-[#FF6B00]'
                            : 'bg-white text-[#AEAEB2]'
                      }`}
                    >
                      {done ? <Check className="h-4 w-4 stroke-[3]" /> : day.label[0]}
                    </motion.div>
                    <span
                      className={`text-[10px] font-bold ${
                        day.isToday ? 'text-[#1D1D1F]' : 'text-[#86868B]'
                      }`}
                    >
                      {day.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {celebration.earnedXp > 0 && (
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#E8F2FC] px-3.5 py-1 text-xs font-bold text-[#0071E3]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{celebration.earnedXp.toLocaleString('de-DE')} XP gesammelt</span>
              </div>
            )}

            <button
              type="button"
              onClick={dismissCelebration}
              className="mt-6 w-full rounded-full bg-[#1D1D1F] py-3 text-sm font-bold text-white transition hover:bg-[#3A3A3C]"
            >
              Weiterlernen
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
