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
      <div className="flex items-center gap-2 text-xs text-sky-300">
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
                  className={`block h-5 w-5 rounded-full border-2 border-white shadow-lg ${
                    submitted ? (isHit ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-sky-400'
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
                className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-dashed border-emerald-400 bg-emerald-400/20"
              >
                <span className="rounded-md bg-[#0B0F19]/90 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                  {card.target.label}
                </span>
              </div>
            )}
          </>
        }
      />

      {!submitted ? (
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            {clickPos ? 'Markierung platziert — bereit zum Prüfen.' : card.hint ?? 'Klicke auf die passende Stelle.'}
          </span>
          <button
            type="button"
            disabled={!clickPos}
            onClick={handleConfirm}
            className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-40"
          >
            Markierung prüfen
          </button>
        </div>
      ) : (
        <div
          className={`rounded-xl border p-4 text-sm ${
            isHit
              ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-100'
              : 'border-rose-500/35 bg-rose-500/10 text-rose-100'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            {isHit ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <XCircle className="h-4 w-4 text-rose-400" />
            )}
            <span>
              {isHit
                ? `Genau richtig! Du hast „${card.target.label}“ erkannt.`
                : `Knapp daneben — der grüne Kreis markiert „${card.target.label}“.`}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{card.explanation}</p>
        </div>
      )}
    </div>
  )
}
