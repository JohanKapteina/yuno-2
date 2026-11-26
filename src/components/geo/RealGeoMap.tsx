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
  /** 0..1 fraction of route drawn via stroke-dashoffset */
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
  /** Initial [lon, lat] center */
  center: [number, number]
  /** Mercator projection scale (e.g. 1200 for Western Med, 1900 for Italy) */
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

  // Approximate pixel radius on Mercator projection at the target latitude
  const circlePixelRadius = useMemo(() => {
    if (!circleOverlay) return 0
    const p1 = projection([circleOverlay.lon, circleOverlay.lat])
    const degLatDelta = circleOverlay.radiusKm / 111.32
    const p2 = projection([circleOverlay.lon, circleOverlay.lat + degLatDelta])
    if (!p1 || !p2) return 0
    return Math.hypot(p2[0] - p1[0], p2[1] - p1[1])
  }, [circleOverlay, projection])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#070B14]">
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
            <radialGradient id="yunoOceanGrad" cx="50%" cy="45%" r="70%">
              <stop offset="0%" stopColor="#0E182B" />
              <stop offset="100%" stopColor="#060A13" />
            </radialGradient>
            <filter id="yunoGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Ocean backdrop */}
          <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="url(#yunoOceanGrad)" />

          {/* Graticule grid */}
          <path d={graticulePath} fill="none" stroke="rgba(148, 163, 184, 0.08)" strokeWidth={0.8} />

          {/* Real TopoJSON Countries (world-atlas 50m) */}
          <g>
            {landPaths.map((country) => (
              <path
                key={country.id}
                d={country.d}
                fill="#172238"
                stroke="rgba(255, 255, 255, 0.14)"
                strokeWidth={0.75}
                className="transition-colors duration-200 hover:fill-[#1D2B47]"
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
                fill={`${circleOverlay.color}22`}
                stroke={circleOverlay.color}
                strokeWidth={1.6}
                strokeDasharray="5 4"
              />
            )
          })()}

          {/* Geodesic routes with animated stroke-dashoffset support */}
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
                {/* Subtle full preview track */}
                <path
                  d={d}
                  fill="none"
                  stroke={route.color}
                  strokeOpacity={0.22}
                  strokeWidth={(route.strokeWidth ?? 3) + 1}
                  strokeDasharray="4 6"
                  strokeLinecap="round"
                />
                {/* Active animated path using normalized pathLength=100 */}
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
                  filter="url(#yunoGlow)"
                  style={{ transition: 'stroke-dashoffset 550ms cubic-bezier(0.22, 1, 0.36, 1)' }}
                />
              </g>
            )
          })}

          {/* Optional geodesic connection line (e.g., user pin -> target pin) */}
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
                stroke={connectLine.color ?? '#F59E0B'}
                strokeWidth={2.2}
                strokeDasharray="5 4"
              />
            )
          })()}

          {/* Markers */}
          {markers.map((m) => {
            const pt = projection([m.lon, m.lat])
            if (!pt) return null
            const color = m.color ?? '#F59E0B'
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
                  <circle r={14} fill={color} opacity={0.22}>
                    <animate attributeName="r" from="6" to="20" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.55" to="0" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  r={m.active ? 7 : m.muted ? 4 : 5.5}
                  fill={m.muted ? '#64748B' : color}
                  stroke="#0B0F19"
                  strokeWidth={2}
                />
                <g transform="translate(10, 4)">
                  <text
                    className="fill-slate-100 text-[11px] font-semibold"
                    style={{
                      paintOrder: 'stroke',
                      stroke: '#070B14',
                      strokeWidth: 3.5,
                      strokeLinejoin: 'round',
                      opacity: m.muted ? 0.65 : 1,
                    }}
                  >
                    {m.label}
                  </text>
                  {m.sublabel && (
                    <text
                      y={12}
                      className="fill-slate-400 text-[9.5px]"
                      style={{
                        paintOrder: 'stroke',
                        stroke: '#070B14',
                        strokeWidth: 3,
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

        {/* Zoom controls */}
        {allowZoomControls && (
          <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-xl border border-white/10 bg-[#0B0F19]/85 p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setZoomFactor((z) => Math.min(2.6, Number((z * 1.25).toFixed(2))))}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
              title="Hineinzoomen"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomFactor((z) => Math.max(0.75, Number((z / 1.25).toFixed(2))))}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
              title="Herauszoomen"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            {zoomFactor !== 1 && (
              <button
                type="button"
                onClick={() => setZoomFactor(1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
                title="Ansicht zurücksetzen"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Geodata Attribution */}
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-[#0B0F19]/75 px-2 py-0.5 font-mono text-[10px] text-slate-500 backdrop-blur-sm">
          d3-geo · Natural Earth 50m TopoJSON
        </div>
      </div>

      {caption && (
        <div className="border-t border-white/[0.06] bg-[#0D1322] px-4 py-2 text-xs text-slate-400">
          {caption}
        </div>
      )}
    </div>
  )
}
