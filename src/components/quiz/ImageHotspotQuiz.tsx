import { CheckCircle2, Crosshair, XCircle } from 'lucide-react'
import { useState } from 'react'
import type { ImageHotspotQuizCard, QuizResult } from '../../types/yuno'
import { SmartMediaImage } from '../media/SmartMediaImage'

interface Props {
  card: ImageHotspotQuizCard
  onComplete: (result: QuizResult) => void
}

export function ImageHotspotQuiz({ card, onComplete }: Props) {
  const [clickPos, setClickPos] = useState<{ xPct: number; yPct: number } | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const distancePct = clickPos
    ? Math.hypot(clickPos.xPct - card.target.x, clickPos.yPct - card.target.y)
    : Infinity
  const isHit = distancePct <= card.target.radiusPct

  const handleConfirm = () => {
    if (!clickPos || submitted) return
    setSubmitted(true)
    onComplete({
      correct: isHit,
      score: isHit ? 1 : Math.max(0, 1 - distancePct / 60),
      summary: isHit ? 'Hotspot getroffen' : 'Hotspot verfehlt',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0071E3]">
        <Crosshair className="h-3.5 w-3.5" />
        <span>Klicke direkt auf das gesuchte Merkmal im Bild.</span>
      </div>

      <SmartMediaImage
        wikiTitle={card.image.wikiTitle}
        wikiLang={card.image.wikiLang}
        src={card.image.src}
        alt={card.image.alt}
        credit={card.image.credit}
        sourceUrl={card.image.sourceUrl}
        fit="natural"
        onImageClick={(coords) => {
          if (!submitted) setClickPos(coords)
        }}
        overlay={
          <>
            {clickPos && (
              <div
                style={{ left: `${clickPos.xPct}%`, top: `${clickPos.yPct}%` }}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
              >
                <span
                  className={`block h-6 w-6 rounded-full border-3 border-white shadow-lg ${
                    submitted ? (isHit ? 'bg-[#16A34A]' : 'bg-[#DC2626]') : 'bg-[#0071E3]'
                  }`}
                />
              </div>
            )}
            {submitted && (
              <div
                style={{
                  left: `${card.target.x}%`,
                  top: `${card.target.y}%`,
                  width: `${card.target.radiusPct * 2}%`,
                  height: `${card.target.radiusPct * 2}%`,
                }}
                className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-dashed border-[#16A34A] bg-[#16A34A]/20"
              >
                <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-[#15803D] shadow-sm">
                  {card.target.label}
                </span>
              </div>
            )}
          </>
        }
      />

      {!submitted ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-medium text-[#6E6E73]">
            {clickPos ? 'Markierung platziert — bereit zum Prüfen.' : card.hint ?? 'Klicke auf die passende Stelle.'}
          </span>
          <button
            type="button"
            disabled={!clickPos}
            onClick={handleConfirm}
            className="rounded-full bg-[#0071E3] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#0077ED] disabled:opacity-40"
          >
            Markierung prüfen
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
                ? `Genau richtig! Du hast „${card.target.label}“ erkannt.`
                : `Knapp daneben — der grüne Kreis markiert „${card.target.label}“.`}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-[#3A3A3C]">{card.explanation}</p>
        </div>
      )}
    </div>
  )
}
