import { CheckCircle2, SlidersHorizontal, XCircle } from 'lucide-react'
import { useState } from 'react'
import type { QuizResult, SliderEstimateQuizCard } from '../../types/yuno'

interface Props {
  card: SliderEstimateQuizCard
  onComplete: (result: QuizResult) => void
}

function formatEstimateValue(val: number, card: SliderEstimateQuizCard): string {
  if (card.formatAsBCE) {
    if (val < 0) return `${Math.abs(val)} v. Chr.`
    if (val > 0) return `${val} n. Chr.`
    return '0'
  }
  const formatted = val.toLocaleString('de-DE')
  return `${card.prefix ?? ''}${formatted}${card.suffix ? ` ${card.suffix}` : ''}${card.unit ? ` ${card.unit}` : ''}`.trim()
}

export function SliderEstimateQuiz({ card, onComplete }: Props) {
  const initialMid = Math.round((card.min + card.max) / 2 / card.step) * card.step
  const [value, setValue] = useState<number>(initialMid)
  const [submitted, setSubmitted] = useState(false)

  const diff = Math.abs(value - card.targetValue)
  const isHit = diff <= card.tolerance

  const range = Math.max(1, card.max - card.min)
  const targetPct = ((card.targetValue - card.min) / range) * 100
  const bandLeftPct = Math.max(0, ((card.targetValue - card.tolerance - card.min) / range) * 100)
  const bandWidthPct = Math.min(100 - bandLeftPct, ((card.tolerance * 2) / range) * 100)
  const userPct = ((value - card.min) / range) * 100

  const handleConfirm = () => {
    if (submitted) return
    setSubmitted(true)
    onComplete({
      correct: isHit,
      score: isHit ? 1 : Math.max(0, 1 - diff / range),
      summary: `Schätzung: ${formatEstimateValue(value, card)} (Ziel: ${formatEstimateValue(card.targetValue, card)})`,
    })
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-black/[0.08] bg-[#F5F5F7] p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6E6E73]">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#0071E3]" />
            Deine Schätzung
          </span>
          <span className="font-apple-black text-3xl text-[#1D1D1F] tabular-nums sm:text-4xl">
            {formatEstimateValue(value, card)}
          </span>
        </div>

        <div className="relative mt-6 mb-3">
          {submitted && (
            <div className="pointer-events-none absolute -top-3.5 right-0 left-0 h-3">
              <div
                style={{ left: `${bandLeftPct}%`, width: `${bandWidthPct}%` }}
                className="absolute top-0 h-full rounded-full bg-[#16A34A]/25 ring-1 ring-[#16A34A]"
              />
              <div
                style={{ left: `${targetPct}%` }}
                className="absolute -top-1 h-5 w-0.5 -translate-x-1/2 bg-[#16A34A]"
              />
              <div
                style={{ left: `${userPct}%` }}
                className={`absolute -top-1 h-5 w-0.5 -translate-x-1/2 ${isHit ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`}
              />
            </div>
          )}

          <input
            type="range"
            min={card.min}
            max={card.max}
            step={card.step}
            value={value}
            disabled={submitted}
            onChange={(e) => setValue(Number(e.target.value))}
            className="yuno-slider w-full"
            style={{ ['--slider-accent' as string]: '#0071E3' }}
          />

          <div className="mt-2 flex justify-between font-mono text-[11px] font-medium text-[#6E6E73]">
            <span>{formatEstimateValue(card.min, card)}</span>
            <span>
              Toleranz: ±{card.tolerance.toLocaleString('de-DE')} {card.unit}
            </span>
            <span>{formatEstimateValue(card.max, card)}</span>
          </div>
        </div>
      </div>

      {!submitted ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-medium text-[#6E6E73]">
            {card.hint ?? 'Ziehe den Regler an die passende Position.'}
          </span>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-full bg-[#0071E3] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#0077ED]"
          >
            Schätzung prüfen
          </button>
        </div>
      ) : (
        <div
          className={`rounded-2xl border p-4 text-sm ${
            isHit
              ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#14532D]'
              : 'border-[#FECACA] bg-[#FEF2F2] text-[#7F1D1D]'
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            {isHit ? (
              <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
            ) : (
              <XCircle className="h-4 w-4 text-[#DC2626]" />
            )}
            <span>
              {isHit
                ? `Stark geschätzt! Exakter Wert: ${formatEstimateValue(card.targetValue, card)}.`
                : `Abweichung: ${diff.toLocaleString('de-DE')} ${card.unit}. Zielwert: ${formatEstimateValue(card.targetValue, card)}.`}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-[#3A3A3C]">{card.explanation}</p>
        </div>
      )}
    </div>
  )
}
