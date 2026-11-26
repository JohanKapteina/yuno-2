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
      color: submitted
        ? distanceKm !== null && distanceKm <= card.toleranceKm
          ? '#15803D'
          : '#DC2626'
        : '#0071E3',
      active: true,
    })
  }
  if (submitted) {
    markers.push({
      id: 'target-pin',
      label: card.target.label,
      lon: card.target.lon,
      lat: card.target.lat,
      color: '#15803D',
      pulse: true,
      active: true,
    })
  }

  const isHit = distanceKm !== null && distanceKm <= card.toleranceKm

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#515154]">
        <span className="inline-flex items-center gap-1.5 text-[#0071E3]">
          <Crosshair className="h-3.5 w-3.5" />
          Klicke auf die Karte, um deinen Pin zu setzen
        </span>
        <span className="font-mono text-[#6E6E73]">Toleranzradius: ±{card.toleranceKm} km</span>
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
                color: '#15803D',
              }
            : undefined
        }
        connectLine={
          submitted && placedPin
            ? {
                from: placedPin,
                to: [card.target.lon, card.target.lat],
                color: isHit ? '#15803D' : '#D97706',
              }
            : undefined
        }
      />

      {!submitted ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-medium text-[#6E6E73]">
            {placedPin ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#1D1D1F]">
                <MapPin className="h-3.5 w-3.5 text-[#0071E3]" />
                Pin gesetzt ({placedPin[1].toFixed(2)}° N, {placedPin[0].toFixed(2)}° E)
              </span>
            ) : (
              card.hint ?? 'Tipp: Nutze die Küstenlinien als Orientierung.'
            )}
          </div>
          <button
            type="button"
            disabled={!placedPin}
            onClick={handleConfirm}
            className="rounded-full bg-[#0071E3] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#0077ED] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Standort prüfen
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
                ? `Volltreffer! Nur ${distanceKm} km von ${card.target.label} entfernt.`
                : `${distanceKm} km entfernt (Ziel: ${card.target.label}, Toleranz: ${card.toleranceKm} km).`}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-[#3A3A3C]">{card.explanation}</p>
        </div>
      )}
    </div>
  )
}
