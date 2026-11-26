import { geoDistance, geoGraticule10, geoMercator, geoPath } from 'd3-geo'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { feature } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import countries50m from 'world-atlas/countries-50m.json'

export interface GeoMarker {
  id: string
  label: string
  sublabel?: string
  lon: number
  lat: number
  color?: string
  pulse?: boolean
  muted?: boolean
  active?: boolean
}

export interface GeoRoute {
  id: string
  points: Array<[number, number]>
  color: string
  progress?: number
  dashed?: boolean
  strokeWidth?: number
}

export interface GeoCircleOverlay {
  lon: number
  lat: number
  radiusKm: number
  color: string
}

export interface RealGeoMapProps {
  center: [number, number]
  scale: number
  markers?: GeoMarker[]
  routes?: GeoRoute[]
  circleOverlay?: GeoCircleOverlay
  connectLine?: { from: [number, number]; to: [number, number]; color?: string }
  interactiveClick?: boolean
  onMapClick?: (lonLat: [number, number]) => void
  onMarkerClick?: (marker: GeoMarker) => void
  allowZoomControls?: boolean
  heightClass?: string
  caption?: string
}

const VIEW_W = 860
const VIEW_H = 500
const EARTH_RADIUS_KM = 6371

const worldTopology = countries50m as unknown as Topology<{ countries: GeometryCollection }>
const countriesGeoJson = feature(worldTopology, worldTopology.objects.countries)
const graticuleGeoJson = geoGraticule10()

export function haversineKm(a: [number, number], b: [number, number]): number {
  return geoDistance(a, b) * EARTH_RADIUS_KM
}

export function RealGeoMap({
  center,
  scale,
  markers = [],
  routes = [],
  circleOverlay,
  connectLine,
  interactiveClick = false,
  onMapClick,
  onMarkerClick,
  allowZoomControls = true,
  heightClass = 'aspect-[16/10]',
  caption,
}: RealGeoMapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [zoomFactor, setZoomFactor] = useState(1)

  const projection = useMemo(
    () =>
      geoMercator()
        .center(center)
        .scale(scale * zoomFactor)
        .translate([VIEW_W / 2, VIEW_H / 2]),
    [center, scale, zoomFactor],
  )

  const pathGenerator = useMemo(() => geoPath().projection(projection), [projection])

  const landPaths = useMemo(() => {
    return countriesGeoJson.features.map((feat, idx) => ({
      id: String(feat.id ?? idx),
      d: pathGenerator(feat) ?? '',
    }))
  }, [pathGenerator])

  const graticulePath = useMemo(() => pathGenerator(graticuleGeoJson) ?? '', [pathGenerator])

  const handleSvgClick = (e: MouseEvent<SVGSVGElement>) => {
    if (!interactiveClick || !onMapClick || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const svgX = ((e.clientX - rect.left) / rect.width) * VIEW_W
    const svgY = ((e.clientY - rect.top) / rect.height) * VIEW_H
    const inverted = projection.invert?.([svgX, svgY])
    if (inverted) {
      onMapClick([inverted[0], inverted[1]])
    }
  }

  const circlePixelRadius = useMemo(() => {
    if (!circleOverlay) return 0
    const p1 = projection([circleOverlay.lon, circleOverlay.lat])
    const degLatDelta = circleOverlay.radiusKm / 111.32
    const p2 = projection([circleOverlay.lon, circleOverlay.lat + degLatDelta])
    if (!p1 || !p2) return 0
    return Math.hypot(p2[0] - p1[0], p2[1] - p1[1])
  }, [circleOverlay, projection])

  return (
    <div className="overflow-hidden rounded-3xl border border-black/[0.08] bg-white shadow-[0_8px_28px_-14px_rgba(0,0,0,0.08)]">
      <div className={`relative w-full ${heightClass}`}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          onClick={handleSvgClick}
          className={`h-full w-full select-none ${interactiveClick ? 'cursor-crosshair' : ''}`}
          role="img"
          aria-label={caption ?? 'Interaktive geografische Karte auf Basis von World-Atlas TopoJSON'}
        >
          <defs>
            <linearGradient id="appleOceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#DCEBFB" />
              <stop offset="100%" stopColor="#CEE3F8" />
            </linearGradient>
          </defs>

          {/* Calm Apple Maps Ocean */}
          <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="url(#appleOceanGrad)" />

          {/* Subtle graticule grid */}
          <path d={graticulePath} fill="none" stroke="rgba(15, 23, 42, 0.06)" strokeWidth={0.75} />

          {/* Real TopoJSON Countries (world-atlas 50m) */}
          <g>
            {landPaths.map((country) => (
              <path
                key={country.id}
                d={country.d}
                fill="#F9FAFB"
                stroke="#C3CEDB"
                strokeWidth={0.85}
                className="transition-colors duration-200 hover:fill-[#F1F5F9]"
              />
            ))}
          </g>

          {/* Tolerance / Focus geographic radius */}
          {circleOverlay && (() => {
            const pt = projection([circleOverlay.lon, circleOverlay.lat])
            if (!pt) return null
            return (
              <circle
                cx={pt[0]}
                cy={pt[1]}
                r={circlePixelRadius}
                fill={`${circleOverlay.color}20`}
                stroke={circleOverlay.color}
                strokeWidth={2}
                strokeDasharray="6 4"
              />
            )
          })()}

          {/* Geodesic routes with animated stroke-dashoffset */}
          {routes.map((route) => {
            const geoLine = {
              type: 'LineString' as const,
              coordinates: route.points,
            }
            const d = pathGenerator(geoLine)
            if (!d) return null
            const progress = Math.max(0, Math.min(1, route.progress ?? 1))
            return (
              <g key={route.id}>
                <path
                  d={d}
                  fill="none"
                  stroke={route.color}
                  strokeOpacity={0.22}
                  strokeWidth={(route.strokeWidth ?? 3) + 1.2}
                  strokeDasharray="4 6"
                  strokeLinecap="round"
                />
                <path
                  d={d}
                  pathLength={100}
                  fill="none"
                  stroke={route.color}
                  strokeWidth={route.strokeWidth ?? 3.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={route.dashed ? '6 5' : '100'}
                  strokeDashoffset={route.dashed ? 0 : 100 - progress * 100}
                  style={{ transition: 'stroke-dashoffset 550ms cubic-bezier(0.22, 1, 0.36, 1)' }}
                />
              </g>
            )
          })}

          {/* Geodesic connection line */}
          {connectLine && (() => {
            const d = pathGenerator({
              type: 'LineString',
              coordinates: [connectLine.from, connectLine.to],
            })
            if (!d) return null
            return (
              <path
                d={d}
                fill="none"
                stroke={connectLine.color ?? '#0071E3'}
                strokeWidth={2.4}
                strokeDasharray="5 4"
              />
            )
          })()}

          {/* Crisp Apple-style Pins & Halo Labels */}
          {markers.map((m) => {
            const pt = projection([m.lon, m.lat])
            if (!pt) return null
            const color = m.color ?? '#0071E3'
            return (
              <g
                key={m.id}
                transform={`translate(${pt[0]}, ${pt[1]})`}
                onClick={(e) => {
                  if (onMarkerClick) {
                    e.stopPropagation()
                    onMarkerClick(m)
                  }
                }}
                className={onMarkerClick ? 'cursor-pointer' : undefined}
              >
                {m.pulse && (
                  <circle r={14} fill={color} opacity={0.24}>
                    <animate attributeName="r" from="6" to="20" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.45" to="0" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  r={m.active ? 7.5 : m.muted ? 4.5 : 6}
                  fill={m.muted ? '#86868B' : color}
                  stroke="#FFFFFF"
                  strokeWidth={2.5}
                />
                <g transform="translate(11, 4)">
                  <text
                    className="fill-[#1D1D1F] text-[11.5px] font-bold"
                    style={{
                      paintOrder: 'stroke',
                      stroke: '#FFFFFF',
                      strokeWidth: 4,
                      strokeLinejoin: 'round',
                      opacity: m.muted ? 0.65 : 1,
                    }}
                  >
                    {m.label}
                  </text>
                  {m.sublabel && (
                    <text
                      y={13}
                      className="fill-[#515154] text-[10px] font-semibold"
                      style={{
                        paintOrder: 'stroke',
                        stroke: '#FFFFFF',
                        strokeWidth: 3.5,
                      }}
                    >
                      {m.sublabel}
                    </text>
                  )}
                </g>
              </g>
            )
          })}
        </svg>

        {/* Frosted Apple Zoom Controls */}
        {allowZoomControls && (
          <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-2xl border border-black/10 bg-white/85 p-1 shadow-sm backdrop-blur-md">
            <button
              type="button"
              onClick={() => setZoomFactor((z) => Math.min(2.6, Number((z * 1.25).toFixed(2))))}
              className="flex h-7 w-7 items-center justify-center rounded-xl text-[#1D1D1F] transition hover:bg-black/5"
              title="Hineinzoomen"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomFactor((z) => Math.max(0.75, Number((z / 1.25).toFixed(2))))}
              className="flex h-7 w-7 items-center justify-center rounded-xl text-[#1D1D1F] transition hover:bg-black/5"
              title="Herauszoomen"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            {zoomFactor !== 1 && (
              <button
                type="button"
                onClick={() => setZoomFactor(1)}
                className="flex h-7 w-7 items-center justify-center rounded-xl text-[#1D1D1F] transition hover:bg-black/5"
                title="Ansicht zurücksetzen"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/80 px-2.5 py-0.5 font-mono text-[10px] font-medium text-[#6E6E73] backdrop-blur-sm">
          Natural Earth 50m · d3-geo
        </div>
      </div>

      {caption && (
        <div className="border-t border-black/[0.06] bg-[#FAFAFC] px-4 py-2.5 text-xs font-medium text-[#515154]">
          {caption}
        </div>
      )}
    </div>
  )
}
