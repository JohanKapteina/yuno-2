import { motion } from 'framer-motion'
import { Check, Flame } from 'lucide-react'
import { getLocalDateKey, useYunoStore } from '../../store/useYunoStore'

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

export function StreakWeekStrip() {
  const { state, triggerStreakPreview } = useYunoStore()
  const activeDates = state.activeDates ?? []
  const now = new Date()
  const jsDay = now.getDay()
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay
  const todayKey = getLocalDateKey(now)

  const days = WEEKDAYS.map((label, idx) => {
    const d = new Date(now)
    d.setDate(now.getDate() + mondayOffset + idx)
    const key = getLocalDateKey(d)
    return { label, key, isToday: key === todayKey, active: activeDates.includes(key) }
  })

  return (
    <button
      type="button"
      onClick={triggerStreakPreview}
      className="apple-card-hover group flex w-full flex-col justify-between rounded-3xl p-5 text-left"
      title="Streak-Animation ansehen"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF3E6]">
            <motion.div
              animate={
                state.streakDays > 0
                  ? { scale: [1, 1.14, 0.98, 1.08, 1], rotate: [-2, 3, -2, 0] }
                  : { scale: [1, 1.05, 1] }
              }
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Flame
                className={`h-6 w-6 ${
                  state.streakDays > 0
                    ? 'fill-[#FF6B00] text-[#FF6B00]'
                    : 'text-[#FF9500]'
                }`}
              />
            </motion.div>
          </div>
          <div>
            <p className="text-xs font-bold tracking-wide text-[#86868B] uppercase">Lernserie</p>
            <p className="font-apple-black text-2xl text-[#1D1D1F] tabular-nums">
              {state.streakDays} {state.streakDays === 1 ? 'Tag' : 'Tage'}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-[#F2F2F7] px-3 py-1 text-[11px] font-bold text-[#515154] transition group-hover:bg-[#FF6B00] group-hover:text-white">
          Animation
        </span>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {days.map((day) => (
          <div key={day.key} className="flex flex-col items-center gap-1">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition ${
                day.active
                  ? 'bg-[#FF6B00] text-white'
                  : day.isToday
                    ? 'border-2 border-[#FF6B00]/60 bg-[#FFF3E6] text-[#FF6B00]'
                    : 'bg-[#F2F2F7] text-[#AEAEB2]'
              }`}
            >
              {day.active ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : day.label[0]}
            </motion.div>
            <span className={`text-[10px] font-semibold ${day.isToday ? 'text-[#1D1D1F]' : 'text-[#86868B]'}`}>
              {day.label}
            </span>
          </div>
        ))}
      </div>
    </button>
  )
}
