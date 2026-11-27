import { geoDistance, geoGraticule10, geoMercator, geoPath } from 'd3-geo'
import { Minus, Move, Plus, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
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
const MIN_ZOOM = 0.75
const MAX_ZOOM = 8

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
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  // Reset view automatically when a lesson switches map focus (e.g. changing layer)
  const centerLon = center[0]
  const centerLat = center[1]
  useEffect(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [centerLon, centerLat, scale])

  const dragRef = useRef<{
    active: boolean
    pointerId: number
    startClientX: number
    startClientY: number
    startPanX: number
    startPanY: number
    movedPx: number
  } | null>(null)

  const clampZoom = (z: number) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Number(z.toFixed(3))))

  // Zoom keeping a specific SVG point anchored under the cursor
  const zoomAtSvgPoint = useCallback((factor: number, svgX = VIEW_W / 2, svgY = VIEW_H / 2) => {
    setZoom((prevZoom) => {
      const nextZoom = clampZoom(prevZoom * factor)
      const ratio = nextZoom / prevZoom
      if (ratio === 1) return prevZoom
      setPan((prevPan) => ({
        x: svgX - (svgX - prevPan.x) * ratio,
        y: svgY - (svgY - prevPan.y) * ratio,
      }))
      return nextZoom
    })
  }, [])

  // Native non-passive wheel listener so trackpad pinch & mouse wheel zoom smoothly without scrolling page
  useEffect(() => {
    const el = containerRef.current
    if (!el || !allowZoomControls) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (!svgRef.current) return
      const rect = svgRef.current.getBoundingClientRect()
      const svgX = ((e.clientX - rect.left) / rect.width) * VIEW_W
      const svgY = ((e.clientY - rect.top) / rect.height) * VIEW_H
      // Trackpad pinch sets ctrlKey=true with smaller deltaY
      const intensity = e.ctrlKey ? 0.015 : 0.0025
      const factor = Math.exp(-e.deltaY * intensity)
      zoomAtSvgPoint(factor, svgX, svgY)
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [allowZoomControls, zoomAtSvgPoint])

  // Base Mercator projection (pan & zoom are applied as crisp vector transform around it)
  const baseProjection = useMemo(
    () =>
      geoMercator()
        .center([centerLon, centerLat])
        .scale(scale)
        .translate([VIEW_W / 2, VIEW_H / 2]),
    [centerLon, centerLat, scale],
  )

  const pathGenerator = useMemo(() => geoPath().projection(baseProjection), [baseProjection])

  const landPaths = useMemo(() => {
    return countriesGeoJson.features.map((feat, idx) => ({
      id: String(feat.id ?? idx),
      d: pathGenerator(feat) ?? '',
    }))
  }, [pathGenerator])

  const graticulePath = useMemo(() => pathGenerator(graticuleGeoJson) ?? '', [pathGenerator])

  const clientToBaseSvg = (clientX: number, clientY: number): [number, number] | null => {
    if (!svgRef.current) return null
    const rect = svgRef.current.getBoundingClientRect()
    const svgX = ((clientX - rect.left) / rect.width) * VIEW_W
    const svgY = ((clientY - rect.top) / rect.height) * VIEW_H
    // Invert current zoom/pan transform: screenX = baseX * zoom + pan.x
    const baseX = (svgX - pan.x) / zoom
    const baseY = (svgY - pan.y) / zoom
    return [baseX, baseY]
  }

  const handlePointerDown = (e: PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
      movedPx: 0,
    }
    setIsDragging(false)
  }

  const handlePointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current
    if (!drag || !drag.active || !svgRef.current) return
    const dxClient = e.clientX - drag.startClientX
    const dyClient = e.clientY - drag.startClientY
    drag.movedPx = Math.hypot(dxClient, dyClient)

    if (drag.movedPx > 4) {
      setIsDragging(true)
      const rect = svgRef.current.getBoundingClientRect()
      const dxSvg = (dxClient / rect.width) * VIEW_W
      const dySvg = (dyClient / rect.height) * VIEW_H
      setPan({
        x: drag.startPanX + dxSvg,
        y: drag.startPanY + dySvg,
      })
    }
  }

  const handlePointerUp = (e: PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current
    dragRef.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }

    const wasClick = !drag || drag.movedPx <= 5
    setIsDragging(false)

    if (wasClick && interactiveClick && onMapClick) {
      const basePt = clientToBaseSvg(e.clientX, e.clientY)
      if (!basePt) return
      const inverted = baseProjection.invert?.(basePt)
      if (inverted) {
        onMapClick([inverted[0], inverted[1]])
      }
    }
  }

  const handleDoubleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!allowZoomControls || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const svgX = ((e.clientX - rect.left) / rect.width) * VIEW_W
    const svgY = ((e.clientY - rect.top) / rect.height) * VIEW_H
    zoomAtSvgPoint(1.65, svgX, svgY)
  }

  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const circlePixelRadius = useMemo(() => {
    if (!circleOverlay) return 0
    const p1 = baseProjection([circleOverlay.lon, circleOverlay.lat])
    const degLatDelta = circleOverlay.radiusKm / 111.32
    const p2 = baseProjection([circleOverlay.lon, circleOverlay.lat + degLatDelta])
    if (!p1 || !p2) return 0
    return Math.hypot(p2[0] - p1[0], p2[1] - p1[1])
  }, [circleOverlay, baseProjection])

  // Keep pins, text, and strokes crisp and effortlessly legible at any zoom level (1x .. 8x)
  const invScale = 1 / Math.pow(zoom, 0.85)

  return (
    <div className="overflow-hidden rounded-3xl border border-black/[0.08] bg-white shadow-[0_8px_28px_-14px_rgba(0,0,0,0.08)]">
      <div ref={containerRef} className={`relative w-full touch-none ${heightClass}`}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleDoubleClick}
          className={`h-full w-full select-none ${
            isDragging
              ? 'cursor-grabbing'
              : interactiveClick
                ? 'cursor-crosshair'
                : 'cursor-grab'
          }`}
          role="img"
          aria-label={caption ?? 'Interaktive geografische Karte auf Basis von World-Atlas TopoJSON'}
        >
          <defs>
            <linearGradient id="appleOceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#DCEBFB" />
              <stop offset="100%" stopColor="#CEE3F8" />
            </linearGradient>
          </defs>

          <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="url(#appleOceanGrad)" />

          {/* Transformed Map Layer */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            <path
              d={graticulePath}
              fill="none"
              stroke="rgba(15, 23, 42, 0.06)"
              strokeWidth={0.75 * invScale}
            />

            <g>
              {landPaths.map((country) => (
                <path
                  key={country.id}
                  d={country.d}
                  fill="#F9FAFB"
                  stroke="#C3CEDB"
                  strokeWidth={0.85 * invScale}
                  className="transition-colors duration-200 hover:fill-[#F1F5F9]"
                />
              ))}
            </g>

            {circleOverlay && (() => {
              const pt = baseProjection([circleOverlay.lon, circleOverlay.lat])
              if (!pt) return null
              return (
                <circle
                  cx={pt[0]}
                  cy={pt[1]}
                  r={circlePixelRadius}
                  fill={`${circleOverlay.color}20`}
                  stroke={circleOverlay.color}
                  strokeWidth={2 * invScale}
                  strokeDasharray={`${6 * invScale} ${4 * invScale}`}
                />
              )
            })()}

            {routes.map((route) => {
              const d = pathGenerator({
                type: 'LineString' as const,
                coordinates: route.points,
              })
              if (!d) return null
              const progress = Math.max(0, Math.min(1, route.progress ?? 1))
              return (
                <g key={route.id}>
                  <path
                    d={d}
                    fill="none"
                    stroke={route.color}
                    strokeOpacity={0.22}
                    strokeWidth={((route.strokeWidth ?? 3) + 1.2) * invScale}
                    strokeDasharray={`${4 * invScale} ${6 * invScale}`}
                    strokeLinecap="round"
                  />
                  <path
                    d={d}
                    pathLength={100}
                    fill="none"
                    stroke={route.color}
                    strokeWidth={(route.strokeWidth ?? 3.2) * invScale}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={route.dashed ? '6 5' : '100'}
                    strokeDashoffset={route.dashed ? 0 : 100 - progress * 100}
                    style={{ transition: 'stroke-dashoffset 550ms cubic-bezier(0.22, 1, 0.36, 1)' }}
                  />
                </g>
              )
            })}

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
                  strokeWidth={2.4 * invScale}
                  strokeDasharray={`${5 * invScale} ${4 * invScale}`}
                />
              )
            })()}

            {markers.map((m) => {
              const pt = baseProjection([m.lon, m.lat])
              if (!pt) return null
              const color = m.color ?? '#0071E3'
              return (
                <g
                  key={m.id}
                  transform={`translate(${pt[0]}, ${pt[1]}) scale(${invScale})`}
                  onClick={(e) => {
                    if (onMarkerClick) {
                      e.stopPropagation()
                      onMarkerClick(m)
                    }
                  }}
                  className={onMarkerClick ? 'cursor-pointer' : undefined}
                >
                  {m.pulse && (
                    <circle r={16} fill={color} opacity={0.24}>
                      <animate attributeName="r" from="8" to="24" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.45" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    r={m.active ? 9 : m.muted ? 5.5 : 7.5}
                    fill={m.muted ? '#86868B' : color}
                    stroke="#FFFFFF"
                    strokeWidth={3}
                  />
                  <g transform="translate(14, 6)">
                    <text
                      className="fill-[#1D1D1F] font-extrabold"
                      fontSize={m.muted ? 14.5 : 18}
                      style={{
                        paintOrder: 'stroke',
                        stroke: '#FFFFFF',
                        strokeWidth: 6,
                        strokeLinejoin: 'round',
                        opacity: m.muted ? 0.78 : 1,
                      }}
                    >
                      {m.label}
                    </text>
                    {m.sublabel && (
                      <text
                        y={18}
                        className="fill-[#3A3A3C] font-bold"
                        fontSize={13.5}
                        style={{
                          paintOrder: 'stroke',
                          stroke: '#FFFFFF',
                          strokeWidth: 5,
                          strokeLinejoin: 'round',
                        }}
                      >
                        {m.sublabel}
                      </text>
                    )}
                  </g>
                </g>
              )
            })}
          </g>
        </svg>

        {/* Upgraded Apple-style Zoom & Pan Controls */}
        {allowZoomControls && (
          <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-2xl border border-black/10 bg-white/90 p-1 shadow-sm backdrop-blur-md">
            <span className="px-2 font-mono text-[11px] font-bold text-[#515154] tabular-nums">
              {zoom.toFixed(1)}×
            </span>
            <button
              type="button"
              onClick={() => zoomAtSvgPoint(1.5)}
              disabled={zoom >= MAX_ZOOM}
              className="flex h-7 w-7 items-center justify-center rounded-xl text-[#1D1D1F] transition hover:bg-black/5 disabled:opacity-30"
              title="Hineinzoomen"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => zoomAtSvgPoint(1 / 1.5)}
              disabled={zoom <= MIN_ZOOM}
              className="flex h-7 w-7 items-center justify-center rounded-xl text-[#1D1D1F] transition hover:bg-black/5 disabled:opacity-30"
              title="Herauszoomen"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            {(zoom !== 1 || pan.x !== 0 || pan.y !== 0) && (
              <button
                type="button"
                onClick={resetView}
                className="flex h-7 w-7 items-center justify-center rounded-xl text-[#0071E3] transition hover:bg-[#E8F2FC]"
                title="Ansicht zurücksetzen"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-white/85 px-2.5 py-1 text-[10px] font-semibold text-[#515154] backdrop-blur-sm">
          <Move className="h-3 w-3 text-[#0071E3]" />
          <span>Ziehen · Scrollen/Pinch zum Zoomen</span>
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
