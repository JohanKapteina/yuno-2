import { CheckCircle2, Crosshair, MapPin, XCircle } from 'lucide-react'
import { useState } from 'react'
import type { MapPinQuizCard, QuizResult } from '../../types/yuno'
import { RealGeoMap, haversineKm } from '../geo/RealGeoMap'
import type { GeoMarker } from '../geo/RealGeoMap'

interface Props {
  card: MapPinQuizCard
  onComplete: (result: QuizResult) => void
}

export function MapPinQuiz({ card, onComplete }: Props) {
  const [placedPin, setPlacedPin] = useState<[number, number] | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [distanceKm, setDistanceKm] = useState<number | null>(null)

  const handleConfirm = () => {
    if (!placedPin || submitted) return
    const dist = Math.round(haversineKm(placedPin, [card.target.lon, card.target.lat]))
    const correct = dist <= card.toleranceKm
    const score = correct ? 1 : Math.max(0, 1 - dist / (card.toleranceKm * 4))
    setDistanceKm(dist)
    setSubmitted(true)
    onComplete({
      correct,
      score,
      summary: `${dist} km Abweichung (Toleranz: ${card.toleranceKm} km)`,
    })
  }

  const markers: GeoMarker[] = []
  if (card.contextPins) {
    for (const cp of card.contextPins) {
      markers.push({
        id: `ctx-${cp.label}`,
        label: cp.label,
        lon: cp.lon,
        lat: cp.lat,
        muted: cp.muted ?? true,
      })
    }
  }
  if (placedPin) {
    markers.push({
      id: 'user-pin',
      label: 'Dein Tipp',
      lon: placedPin[0],
      lat: placedPin[1],
      color: submitted ? (distanceKm !== null && distanceKm <= card.toleranceKm ? '#10B981' : '#F43F5E') : '#38BDF8',
      active: true,
    })
  }
  if (submitted) {
    markers.push({
      id: 'target-pin',
      label: card.target.label,
      lon: card.target.lon,
      lat: card.target.lat,
      color: '#10B981',
      pulse: true,
      active: true,
    })
  }

  const isHit = distanceKm !== null && distanceKm <= card.toleranceKm

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5 text-sky-300">
          <Crosshair className="h-3.5 w-3.5" />
          Klicke auf die echte Karte, um deinen Pin zu setzen
        </span>
        <span className="font-mono text-slate-400">Toleranzradius: ±{card.toleranceKm} km</span>
      </div>

      <RealGeoMap
        center={card.mapView.center}
        scale={card.mapView.scale}
        markers={markers}
        interactiveClick={!submitted}
        onMapClick={(coords) => {
          if (!submitted) setPlacedPin(coords)
        }}
        circleOverlay={
          submitted
            ? {
                lon: card.target.lon,
                lat: card.target.lat,
                radiusKm: card.toleranceKm,
                color: '#10B981',
              }
            : undefined
        }
        connectLine={
          submitted && placedPin
            ? {
                from: placedPin,
                to: [card.target.lon, card.target.lat],
                color: isHit ? '#10B981' : '#F59E0B',
              }
            : undefined
        }
      />

      {!submitted ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {placedPin ? (
              <span className="inline-flex items-center gap-1.5 text-slate-200">
                <MapPin className="h-3.5 w-3.5 text-sky-400" />
                Pin gesetzt ({placedPin[1].toFixed(2)}° N, {placedPin[0].toFixed(2)}° E)
              </span>
            ) : (
              card.hint ?? 'Tipp: Nutze die bekannten Küstenlinien als Orientierung.'
            )}
          </div>
          <button
            type="button"
            disabled={!placedPin}
            onClick={handleConfirm}
            className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Standort prüfen
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
                ? `Volltreffer! Nur ${distanceKm} km von ${card.target.label} entfernt.`
                : `${distanceKm} km entfernt (Ziel: ${card.target.label}, Toleranz: ${card.toleranceKm} km).`}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{card.explanation}</p>
        </div>
      )}
    </div>
  )
}
