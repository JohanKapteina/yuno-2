import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  Compass,
  Eye,
  Film,
  GitBranch,
  Shield,
  Sliders,
  Swords,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { RealGeoMap } from '../../components/geo/RealGeoMap'
import type { GeoMarker } from '../../components/geo/RealGeoMap'
import { SmartMediaImage } from '../../components/media/SmartMediaImage'
import { SmartVideoPlayer } from '../../components/media/SmartVideoPlayer'
import type { LessonDefinition } from '../../types/yuno'

/* -------------------------------------------------------------------------- */
/*  SCREEN 1: Der unmögliche Alpenmarsch (Real Geo Map + Attrition Curve)      */
/* -------------------------------------------------------------------------- */

interface MarchWaypoint {
  id: string
  label: string
  date: string
  lon: number
  lat: number
  infantry: number
  cavalry: number
  elephants: number
  note: string
}

const MARCH_WAYPOINTS: MarchWaypoint[] = [
  {
    id: 'carthago-nova',
    label: 'Carthago Nova',
    date: 'Frühjahr 218 v. Chr.',
    lon: -0.986,
    lat: 37.605,
    infantry: 50000,
    cavalry: 9000,
    elephants: 37,
    note: 'Aufbruch mit einem gewaltigen Vielvölkerheer und 37 Kriegselefanten — Rom erwartet den Angriff zur See.',
  },
  {
    id: 'ebro',
    label: 'Ebro-Übergang',
    date: 'Mai 218 v. Chr.',
    lon: 0.52,
    lat: 40.81,
    infantry: 46000,
    cavalry: 8500,
    elephants: 37,
    note: 'Hannibal überschreitet die vertragliche Grenze. Der Zweite Punische Krieg eskaliert endgültig.',
  },
  {
    id: 'pyrenees',
    label: 'Pyrenäen',
    date: 'Sommer 218 v. Chr.',
    lon: 2.86,
    lat: 42.46,
    infantry: 40000,
    cavalry: 8000,
    elephants: 37,
    note: 'Erste Kämpfe und Desertionen; Hannibal lässt Besatzungstruppen zur Sicherung Spaniens zurück.',
  },
  {
    id: 'rhone',
    label: 'Rhône-Querung',
    date: 'September 218 v. Chr.',
    lon: 4.805,
    lat: 43.95,
    infantry: 38000,
    cavalry: 8000,
    elephants: 37,
    note: 'Auf mit Erde getarnten Flößen setzen selbst die 37 Elefanten über den reißenden Strom — vorbei an den Römern.',
  },
  {
    id: 'alps',
    label: 'Alpenpass (ca. 2.500 m)',
    date: 'Oktober 218 v. Chr.',
    lon: 6.88,
    lat: 45.68,
    infantry: 20000,
    cavalry: 6000,
    elephants: 20,
    note: 'Schneestürme, Felsstürze und Bergstämme halbieren das Heer in 15 Tagen — doch der strategische Schock gelingt.',
  },
  {
    id: 'cannae',
    label: 'Cannae (Apulien)',
    date: '2. August 216 v. Chr.',
    lon: 16.1325,
    lat: 41.3064,
    infantry: 40000,
    cavalry: 10000,
    elephants: 0,
    note: 'Durch keltische Verbündete aus Oberitalien verstärkt, stellt Hannibal die größte römische Armee der Geschichte.',
  },
]

function Screen1AlpsMarch() {
  const [stepIdx, setStepIdx] = useState(4)
  const current = MARCH_WAYPOINTS[stepIdx]
  const progress = stepIdx / (MARCH_WAYPOINTS.length - 1)

  const markers: GeoMarker[] = MARCH_WAYPOINTS.map((wp, idx) => ({
    id: wp.id,
    label: wp.label,
    sublabel: idx === stepIdx ? wp.date : undefined,
    lon: wp.lon,
    lat: wp.lat,
    color: idx === stepIdx ? '#F59E0B' : idx < stepIdx ? '#38BDF8' : '#64748B',
    pulse: idx === stepIdx,
    active: idx === stepIdx,
    muted: idx > stepIdx,
  }))

  const chartData = MARCH_WAYPOINTS.map((wp, idx) => ({
    name: wp.label.split(' ')[0],
    Infanterie: wp.infantry,
    Kavallerie: wp.cavalry,
    active: idx <= stepIdx,
  }))

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <RealGeoMap
          center={[7.4, 42.1]}
          scale={1420}
          markers={markers}
          routes={[
            {
              id: 'hannibal-route',
              points: MARCH_WAYPOINTS.map((w) => [w.lon, w.lat]),
              color: '#F59E0B',
              progress: Math.max(0.04, progress),
              strokeWidth: 3.4,
            },
          ]}
          onMarkerClick={(m) => {
            const idx = MARCH_WAYPOINTS.findIndex((w) => w.id === m.id)
            if (idx >= 0) setStepIdx(idx)
          }}
          caption="Ziehe den Marsch-Regler oder klicke direkt auf die Wegpunkte der realen Mittelmeerkarte."
        />

        <div className="flex flex-col justify-between gap-4">
          <SmartMediaImage
            wikiTitle="Hannibal's_crossing_of_the_Alps"
            wikiLang="en"
            alt="Henri Motte (1878): Hannibal überquert mit Elefanten die Rhône"
            caption="Henri Motte (1878): Überquerung der Rhône mit Kriegselefanten."
            credit="Wikimedia Commons"
            aspectClass="aspect-[16/10]"
          />

          <div className="editorial-card rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-amber-400">{current.date}</span>
              <span className="text-slate-400">
                Etappe {stepIdx + 1}/{MARCH_WAYPOINTS.length}
              </span>
            </div>
            <h3 className="mt-1 text-base font-semibold text-white">{current.label}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">{current.note}</p>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-[#0B0F19] p-2.5 text-center">
                <span className="block font-mono text-sm font-bold text-sky-300">
                  {current.infantry.toLocaleString('de-DE')}
                </span>
                <span className="text-[10px] text-slate-400">Infanterie</span>
              </div>
              <div className="rounded-xl bg-[#0B0F19] p-2.5 text-center">
                <span className="block font-mono text-sm font-bold text-amber-300">
                  {current.cavalry.toLocaleString('de-DE')}
                </span>
                <span className="text-[10px] text-slate-400">Kavallerie</span>
              </div>
              <div className="rounded-xl bg-[#0B0F19] p-2.5 text-center">
                <span className="block font-mono text-sm font-bold text-emerald-300">
                  {current.elephants}
                </span>
                <span className="text-[10px] text-slate-400">Elefanten</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Slider + Recharts Attrition Curve */}
      <div className="editorial-card grid gap-5 rounded-2xl p-5 lg:grid-cols-[1fr_1.35fr] lg:items-center">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-amber-300">
              <Compass className="h-3.5 w-3.5" />
              Marsch-Phasen-Slider
            </span>
            <span className="font-mono text-slate-400">{current.label}</span>
          </div>
          <input
            type="range"
            min={0}
            max={MARCH_WAYPOINTS.length - 1}
            step={1}
            value={stepIdx}
            onChange={(e) => setStepIdx(Number(e.target.value))}
            className="yuno-slider w-full"
            style={{ ['--slider-accent' as string]: '#F59E0B' }}
          />
          <div className="flex justify-between font-mono text-[10px] text-slate-500">
            <span>218 v. Chr. · Spanien</span>
            <span>Alpen</span>
            <span>216 v. Chr. · Cannae</span>
          </div>
        </div>

        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="infantryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B0F19',
                  borderColor: 'rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="Infanterie"
                stroke="#38BDF8"
                strokeWidth={2}
                fill="url(#infantryGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 2: Asymmetrie der Kräfte (Truppen-Explorer + Büste mit Hotspots)    */
/* -------------------------------------------------------------------------- */

interface ForceUnit {
  id: string
  side: 'rom' | 'karthago'
  name: string
  count: string
  role: string
  insight: string
}

const FORCE_UNITS: ForceUnit[] = [
  {
    id: 'rom-inf',
    side: 'rom',
    name: 'Römische Legionen & Bundesgenossen',
    count: '80.000 Mann',
    role: 'Extrem tief gestaffelter Rammbock',
    insight:
      'Konsul Varro verengt die Front und verdoppelt die Tiefe: 80.000 Mann sollen das karthagische Zentrum schlicht zerquetschen — verlieren dabei aber jede Manövrierfähigkeit.',
  },
  {
    id: 'rom-cav',
    side: 'rom',
    name: 'Römische & Italische Kavallerie',
    count: '6.400 Reiter',
    role: 'Flankenschutz am Fluss & auf der Ebene',
    insight:
      'Zahlenmäßig und taktisch klar unterlegen. Sobald sie vom Feld gefegt sind, ist die gesamte römische Infanterie im Rücken schutzlos.',
  },
  {
    id: 'carth-center',
    side: 'karthago',
    name: 'Kelten & Iberer (Zentrum)',
    count: '28.000 Mann',
    role: 'Der elastische Köder',
    insight:
      'Hannibal reitet persönlich im Zentrum mit, damit die Linie kontrolliert zurückweicht, ohne in Panik zu zerbrechen.',
  },
  {
    id: 'carth-libyan',
    side: 'karthago',
    name: 'Libysche Veteranen (Flanken)',
    count: '12.000 Mann',
    role: 'Die stählerne Zange',
    insight:
      'Ausgerüstet mit erbeuteten römischen Rüstungen von Trasimeno! Sie bleiben zunächst still stehen — und schwenken erst im letzten Moment nach innen ein.',
  },
  {
    id: 'carth-cav',
    side: 'karthago',
    name: 'Schwere Iberer- & Numidische Kavallerie',
    count: '10.000 Reiter',
    role: 'Der Schlüssel zum Kessel',
    insight:
      'Überlegen an Zahl, Tempo und Disziplin. Sie zerschlagen beide römischen Reiterflügel und schließen den Ring im Rücken der Legionen.',
  },
]

function Screen2ForceBalance() {
  const [selectedUnitId, setSelectedUnitId] = useState<string>('carth-libyan')
  const [activeBustHotspot, setActiveBustHotspot] = useState<number>(0)

  const selectedUnit = FORCE_UNITS.find((u) => u.id === selectedUnitId) ?? FORCE_UNITS[0]

  const bustHotspots = [
    {
      x: 50,
      y: 34,
      title: 'Der Stratege der Psychologie',
      text: 'Hannibal studierte nicht nur Gelände, sondern seine Gegner: Er wusste, dass Konsul Varro ungeduldig auf eine Entscheidungsschlacht drängte.',
    },
    {
      x: 52,
      y: 66,
      title: 'Marmorbüste aus Capua',
      text: 'Traditionell als Hannibal Barkas identifiziert (Archäologisches Nationalmuseum Neapel). Capua lief nach Cannae zu Karthago über.',
    },
  ]

  return (
    <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
      <div className="editorial-card space-y-5 rounded-2xl p-5">
        {/* Visual Ratio Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-rose-400">Rom: 86.400 Mann (63%)</span>
            <span className="text-amber-400">Karthago: 50.000 Mann (37%)</span>
          </div>
          <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-white/5">
            <div className="h-full bg-gradient-to-r from-rose-600 to-rose-400" style={{ width: '63.3%' }} />
            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300" style={{ width: '36.7%' }} />
          </div>
          <p className="text-xs text-slate-400">
            Klicke auf einen Truppenteil, um seine exakte taktische Rolle bei Cannae zu untersuchen:
          </p>
        </div>

        {/* Interactive Unit Grid */}
        <div className="grid gap-2.5 sm:grid-cols-2">
          {FORCE_UNITS.map((unit) => {
            const active = unit.id === selectedUnitId
            const isRome = unit.side === 'rom'
            return (
              <button
                key={unit.id}
                type="button"
                onClick={() => setSelectedUnitId(unit.id)}
                className={`rounded-xl border p-3.5 text-left transition ${
                  active
                    ? isRome
                      ? 'border-rose-400 bg-rose-500/15'
                      : 'border-amber-400 bg-amber-500/15'
                    : 'border-white/8 bg-[#0D1322] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                      isRome ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {isRome ? 'Rom' : 'Karthago'}
                  </span>
                  <span className="font-mono text-xs font-semibold text-white">{unit.count}</span>
                </div>
                <p className="mt-2 text-xs font-semibold text-white">{unit.name}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{unit.role}</p>
              </button>
            )
          })}
        </div>

        {/* Selected Detail Spotlight */}
        <div className="rounded-2xl border border-white/10 bg-[#0B0F19] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <Users className="h-4 w-4" />
            <span>Taktische Analyse: {selectedUnit.name}</span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-200">{selectedUnit.insight}</p>
        </div>
      </div>

      {/* Verified Wikimedia Bust with Interactive Hotspots */}
      <div className="space-y-3">
        <SmartMediaImage
          wikiTitle="Hannibal"
          wikiLang="en"
          alt="Marmorbüste aus Capua, traditionell als Hannibal Barkas identifiziert"
          caption="Marmorbüste aus Capua (Museo Archeologico Nazionale di Napoli). Klicke auf die pulsierenden Punkte."
          credit="Wikimedia Commons"
          aspectClass="aspect-[4/4]"
          objectPosition="object-top"
          overlay={
            <>
              {bustHotspots.map((hs, idx) => (
                <button
                  key={hs.title}
                  type="button"
                  onClick={() => setActiveBustHotspot(idx)}
                  style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                  className={`absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-mono text-xs font-bold transition ${
                    activeBustHotspot === idx
                      ? 'scale-110 border-white bg-amber-500 text-[#0B0F19] shadow-[0_0_24px_rgba(245,158,11,0.85)]'
                      : 'border-amber-300/70 bg-[#0B0F19]/80 text-amber-300 hover:scale-105'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </>
          }
        />

        <div className="editorial-card rounded-2xl p-4">
          <p className="font-mono text-[11px] font-semibold text-amber-400 uppercase">
            Hotspot #{activeBustHotspot + 1} · {bustHotspots[activeBustHotspot].title}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">
            {bustHotspots[activeBustHotspot].text}
          </p>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 3: Die doppelte Umfassung (5-Phasen Animierter Taktik-Stepper)     */
/* -------------------------------------------------------------------------- */

interface TacticalPhase {
  step: number
  title: string
  tag: string
  description: string
  encirclementPct: number
  centerPath: string
  romePath: string
  leftLibyan: { x: number; y: number; rotate: number }
  rightLibyan: { x: number; y: number; rotate: number }
  cavArrows: string[]
}

const TACTICAL_PHASES: TacticalPhase[] = [
  {
    step: 1,
    title: 'Phase 1: Der konvexe Halbmond',
    tag: 'Aufstellung',
    description:
      'Hannibal wölbt sein schwächeres Zentrum aus Kelten und Iberern nach vorn Richtung Rom. Die schweren libyschen Veteranen stehen zurückgesetzt an beiden Flanken.',
    encirclementPct: 10,
    centerPath: 'M 210 190 Q 330 142 450 190',
    romePath: 'M 205 110 L 455 110 L 455 152 L 205 152 Z',
    leftLibyan: { x: 145, y: 192, rotate: 0 },
    rightLibyan: { x: 465, y: 192, rotate: 0 },
    cavArrows: ['M 105 188 L 105 135', 'M 555 188 L 555 135'],
  },
  {
    step: 2,
    title: 'Phase 2: Der Sog ins Zentrum',
    tag: 'Kontrollierter Rückzug',
    description:
      'Die 80.000 Römer drücken das vorgewölbte Zentrum zurück. Hannibal lässt seine Mitte langsam von konvex zu einer geraden Linie nachgeben — die Römer drängen siegesgewiss nach.',
    encirclementPct: 32,
    centerPath: 'M 215 205 Q 330 205 445 205',
    romePath: 'M 220 135 L 440 135 L 440 185 L 220 185 Z',
    leftLibyan: { x: 150, y: 185, rotate: 8 },
    rightLibyan: { x: 460, y: 185, rotate: -8 },
    cavArrows: ['M 105 180 L 100 95', 'M 555 180 L 560 95'],
  },
  {
    step: 3,
    title: 'Phase 3: Die konkave Falle',
    tag: 'Kipppunkt',
    description:
      'Hannibals Zentrum biegt sich nun tief nach innen (konkav). Die römischen Soldaten pressen sich im Vorwärtsdrang immer dichter zusammen, während die Libyer plötzlich neben ihnen stehen.',
    encirclementPct: 58,
    centerPath: 'M 215 200 Q 330 278 445 200',
    romePath: 'M 235 162 L 425 162 L 415 230 L 245 230 Z',
    leftLibyan: { x: 162, y: 182, rotate: 42 },
    rightLibyan: { x: 448, y: 182, rotate: -42 },
    cavArrows: ['M 100 95 Q 330 42 545 92'],
  },
  {
    step: 4,
    title: 'Phase 4: Die stählerne Zange',
    tag: 'Flankenschwenk',
    description:
      'Die ausgeruhten libyschen Veteranen schwenken um 90 Grad nach innen in die ungeschützten römischen Flanken. Zugleich kehrt Hasdrubals siegreiche Kavallerie im Rücken der Römer zurück.',
    encirclementPct: 84,
    centerPath: 'M 218 205 Q 330 286 442 205',
    romePath: 'M 252 168 L 408 168 L 402 238 L 258 238 Z',
    leftLibyan: { x: 188, y: 196, rotate: 82 },
    rightLibyan: { x: 422, y: 196, rotate: -82 },
    cavArrows: ['M 545 95 Q 450 115 360 132', 'M 118 98 Q 210 115 300 132'],
  },
  {
    step: 5,
    title: 'Phase 5: Vollständige Einkesselung',
    tag: 'Der Kessel schließt sich',
    description:
      'Alle vier Seiten sind dicht. Die römische Übermacht kehrt sich ins Gegenteil: Zehntausende Legionäre stehen so eng gepresst, dass sie ihre Schwerter kaum noch heben können.',
    encirclementPct: 100,
    centerPath: 'M 225 215 Q 330 284 435 215',
    romePath: 'M 268 176 L 392 176 L 388 236 L 272 236 Z',
    leftLibyan: { x: 205, y: 198, rotate: 88 },
    rightLibyan: { x: 405, y: 198, rotate: -88 },
    cavArrows: ['M 245 140 L 415 140'],
  },
]

function Screen3DoubleEnvelopment() {
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [showTerrain, setShowTerrain] = useState(true)
  const phase = TACTICAL_PHASES[phaseIdx]

  return (
    <div className="space-y-5">
      {/* Phase Selector Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {TACTICAL_PHASES.map((p, i) => (
            <button
              key={p.step}
              type="button"
              onClick={() => setPhaseIdx(i)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                phaseIdx === i
                  ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                  : 'border-white/10 bg-[#131B2E] text-slate-400 hover:border-white/25 hover:text-white'
              }`}
            >
              {p.step}. {p.tag}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowTerrain((s) => !s)}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
            showTerrain
              ? 'border-sky-400/40 bg-sky-500/15 text-sky-200'
              : 'border-white/10 bg-[#131B2E] text-slate-400'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          Fluss Aufidus {showTerrain ? 'sichtbar' : 'ausgeblendet'}
        </button>
      </div>

      {/* Tactical SVG Battlefield Schematic (explicitly permitted for tactical troop overlays) */}
      <div className="editorial-card overflow-hidden rounded-3xl p-4 sm:p-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080D17]">
          <svg viewBox="0 0 660 330" className="h-auto w-full select-none" role="img" aria-label={phase.title}>
            <defs>
              <marker id="arrowAmber" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#F59E0B" />
              </marker>
              <pattern id="tacticGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
              </pattern>
            </defs>

            <rect width="660" height="330" fill="url(#tacticGrid)" />

            {/* River Aufidus Overlay */}
            {showTerrain && (
              <g opacity={0.85}>
                <path
                  d="M 48 0 C 66 95, 36 215, 62 330"
                  fill="none"
                  stroke="#0EA5E9"
                  strokeOpacity={0.28}
                  strokeWidth={26}
                />
                <path
                  d="M 48 0 C 66 95, 36 215, 62 330"
                  fill="none"
                  stroke="#38BDF8"
                  strokeOpacity={0.65}
                  strokeWidth={2}
                  strokeDasharray="6 4"
                />
                <text
                  x={16}
                  y={165}
                  transform="rotate(-90 16 165)"
                  className="fill-sky-400 font-mono text-[10px] tracking-widest uppercase"
                >
                  Fluss Aufidus (Ofanto)
                </text>
              </g>
            )}

            {/* Encirclement ring pulse in final phase */}
            {phaseIdx === 4 && (
              <ellipse
                cx={330}
                cy={206}
                rx={106}
                ry={68}
                fill="rgba(244, 63, 94, 0.12)"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="6 4"
              />
            )}

            {/* Roman Infantry Mass */}
            <motion.path
              animate={{ d: phase.romePath }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              fill="rgba(225, 29, 72, 0.38)"
              stroke="#FB7185"
              strokeWidth={2.5}
            />
            <text x={330} y={phaseIdx >= 3 ? 208 : 138} textAnchor="middle" className="fill-rose-100 text-[11px] font-bold tracking-wide">
              RÖMISCHE LEGIONEN (80.000)
            </text>

            {/* Carthaginian Elastic Center (Kelten & Iberer) */}
            <motion.path
              animate={{ d: phase.centerPath }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              fill="none"
              stroke="#F59E0B"
              strokeWidth={14}
              strokeLinecap="round"
            />
            <text x={330} y={306} textAnchor="middle" className="fill-amber-300 text-[10.5px] font-semibold tracking-wider uppercase">
              Elastisches Zentrum (Kelten &amp; Iberer)
            </text>

            {/* Left & Right Libyan Heavy Veterans */}
            <motion.g
              animate={{
                x: phase.leftLibyan.x,
                y: phase.leftLibyan.y,
                rotate: phase.leftLibyan.rotate,
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <rect x={-26} y={-9} width={52} height={18} rx={4} fill="#10B981" stroke="#A7F3D0" strokeWidth={1.5} />
              <text y={3} textAnchor="middle" className="fill-[#06221A] text-[8.5px] font-bold">
                LIBYER
              </text>
            </motion.g>

            <motion.g
              animate={{
                x: phase.rightLibyan.x,
                y: phase.rightLibyan.y,
                rotate: phase.rightLibyan.rotate,
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <rect x={-26} y={-9} width={52} height={18} rx={4} fill="#10B981" stroke="#A7F3D0" strokeWidth={1.5} />
              <text y={3} textAnchor="middle" className="fill-[#06221A] text-[8.5px] font-bold">
                LIBYER
              </text>
            </motion.g>

            {/* Animated Cavalry Maneuver Arrows (stroke-dashoffset) */}
            {phase.cavArrows.map((arrowPath, idx) => (
              <motion.path
                key={`${phaseIdx}-${idx}`}
                d={arrowPath}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={3.2}
                strokeLinecap="round"
                markerEnd="url(#arrowAmber)"
                initial={{ pathLength: 0, opacity: 0.4 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
              />
            ))}

            {/* Legend */}
            <g transform="translate(472, 18)">
              <rect width="170" height="58" rx="10" fill="rgba(11,15,25,0.85)" stroke="rgba(255,255,255,0.1)" />
              <circle cx="14" cy="17" r="4" fill="#FB7185" />
              <text x="24" y="20" className="fill-slate-300 text-[9.5px]">Römische Infanterie</text>
              <circle cx="14" cy="33" r="4" fill="#F59E0B" />
              <text x="24" y="36" className="fill-slate-300 text-[9.5px]">Zentrum &amp; Kavallerie</text>
              <circle cx="14" cy="49" r="4" fill="#10B981" />
              <text x="24" y="52" className="fill-slate-300 text-[9.5px]">Libysche Elite-Flanken</text>
            </g>
          </svg>
        </div>

        {/* Telemetry & Description */}
        <div className="mt-4 grid gap-4 md:grid-cols-[1.6fr_1fr] md:items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">{phase.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">{phase.description}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0B0F19] p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Grad der Einkesselung</span>
              <span className="font-mono font-bold text-amber-300">{phase.encirclementPct}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500"
                style={{ width: `${phase.encirclementPct}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between gap-2">
              <button
                type="button"
                disabled={phaseIdx === 0}
                onClick={() => setPhaseIdx((i) => Math.max(0, i - 1))}
                className="flex-1 rounded-lg border border-white/10 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 disabled:opacity-30"
              >
                ← Vorherige
              </button>
              <button
                type="button"
                disabled={phaseIdx === TACTICAL_PHASES.length - 1}
                onClick={() => setPhaseIdx((i) => Math.min(TACTICAL_PHASES.length - 1, i + 1))}
                className="flex-1 rounded-lg bg-amber-500 py-1.5 text-xs font-semibold text-[#0B0F19] hover:bg-amber-400 disabled:opacity-30"
              >
                Nächste →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 4: Historisches Gemälde + Verifiziertes YouTube-Erklärvideo         */
/* -------------------------------------------------------------------------- */

function Screen4MediaContext() {
  const [videoChoice, setVideoChoice] = useState<'de' | 'en'>('de')
  const [hotspotIdx, setHotspotIdx] = useState(0)

  const paintingHotspots = [
    {
      x: 48,
      y: 55,
      label: 'Konsul Lucius Aemilius Paullus',
      text: 'Der vorsichtige Co-Konsul hatte vor der offenen Ebene gewarnt — und fiel im Kessel, statt zu fliehen. Varro entkam nach Venusia.',
    },
    {
      x: 24,
      y: 42,
      label: 'Chaos im Kessel',
      text: 'Antike Quellen berichten von über 50.000 gefallenen Römern an einem einzigen Tag — darunter rund 80 römische Senatoren.',
    },
  ]

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Verified Painting with Hotspots */}
      <div className="space-y-3">
        <SmartMediaImage
          wikiTitle="Battle_of_Cannae"
          wikiLang="en"
          alt="John Trumbull (1773): The Death of Paulus Aemilius at the Battle of Cannae"
          caption="John Trumbull (1773): Der Tod des Konsuls Aemilius Paullus bei Cannae (Yale University Art Gallery)."
          credit="Wikimedia Commons"
          aspectClass="aspect-[16/11]"
          overlay={
            <>
              {paintingHotspots.map((hs, idx) => (
                <button
                  key={hs.label}
                  type="button"
                  onClick={() => setHotspotIdx(idx)}
                  style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                  className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-mono text-xs font-bold transition ${
                    hotspotIdx === idx
                      ? 'scale-110 border-white bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.9)]'
                      : 'border-white/70 bg-[#0B0F19]/80 text-white'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </>
          }
        />

        <div className="editorial-card rounded-2xl p-4">
          <p className="font-mono text-[11px] font-semibold text-indigo-300 uppercase">
            Gemälde-Detail #{hotspotIdx + 1} · {paintingHotspots[hotspotIdx].label}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">
            {paintingHotspots[hotspotIdx].text}
          </p>
        </div>
      </div>

      {/* Verified YouTube Player with Exact Start/End Timestamps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Film className="h-4 w-4 text-amber-400" />
            Verifizierte Video-Analyse
          </span>
          <div className="flex gap-1 rounded-xl border border-white/10 bg-[#131B2E] p-1 text-xs">
            <button
              type="button"
              onClick={() => setVideoChoice('de')}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                videoChoice === 'de' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Deutsch (Doku)
            </button>
            <button
              type="button"
              onClick={() => setVideoChoice('en')}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                videoChoice === 'en' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Historia Civilis (EN)
            </button>
          </div>
        </div>

        {videoChoice === 'de' ? (
          <SmartVideoPlayer
            key="de-cannae"
            videoId="iWrgh0J0q_U"
            start={180}
            end={330}
            title="Die Schlacht von Cannae - Wie kam es zur katastrophalen römischen Niederlage?"
            channel="Geschichte erzählt"
            segmentLabel="Taktik-Fokus: Der Kessel entsteht"
          />
        ) : (
          <SmartVideoPlayer
            key="en-cannae"
            videoId="MroGPObEZzk"
            start={345}
            end={495}
            title="The Battle of Cannae (216 B.C.E.)"
            channel="Historia Civilis"
            segmentLabel="Animierte Schlachtfeld-Mechanik"
          />
        )}

        <p className="text-xs leading-relaxed text-slate-400">
          Beide Videos sind über <code className="font-mono text-slate-300">youtube-nocookie.com</code> mit exakten Sprungmarken eingebunden, sodass du sofort die entscheidende Schlachtphase siehst.
        </p>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 5: Taktik-Labor („Du bist Hannibal“ — Live-Parameter-Simulator)     */
/* -------------------------------------------------------------------------- */

function Screen5TacticLab() {
  const [elasticity, setElasticity] = useState(55) // Sweet spot: 45-70
  const [cavalryTiming, setCavalryTiming] = useState(60) // Sweet spot: 50-75

  const centerTooRigid = elasticity < 40
  const centerCollapsed = elasticity > 75
  const cavalryOptimal = cavalryTiming >= 45 && cavalryTiming <= 78
  const isCannaeMasterpiece = !centerTooRigid && !centerCollapsed && cavalryOptimal

  let verdictTitle = 'Doppelte Umfassung gelungen! (Cannae-Effekt)'
  let verdictBody =
    'Dein Zentrum biegt sich exakt tief genug, ohne zu reißen. Die römischen Legionen saugen sich in die Mitte, und deine Kavallerie schließt den Kessel im exakten Moment.'
  let verdictTone: 'emerald' | 'amber' | 'rose' = 'emerald'

  if (centerTooRigid) {
    verdictTitle = 'Frontale Überwältigung — Zentrum zerdrückt'
    verdictBody =
      'Du hältst die Linie zu starr. Gegen 80.000 tief gestaffelte Römer bricht ein starres Zentrum in Minuten — die Libyer an den Flanken kommen gar nicht erst zum Schwenken.'
    verdictTone = 'rose'
  } else if (centerCollapsed) {
    verdictTitle = 'Kontrollverlust — Panische Flucht im Zentrum'
    verdictBody =
      'Dein Zentrum weicht zu schnell zurück. Der geordnete Rückzug kippt in Panik, die Legionen brechen durch die Mitte und zerschneiden dein Heer in zwei Hälften.'
    verdictTone = 'rose'
  } else if (!cavalryOptimal) {
    verdictTitle = cavalryTiming < 45 ? 'Kavallerie greift zu früh an' : 'Kavallerie kehrt zu spät zurück'
    verdictBody =
      cavalryTiming < 45
        ? 'Deine Reiter greifen die Infanterie an, bevor die gegnerische Kavallerie besiegt ist — sie werden selbst flankiert.'
        : 'Deine Reiter verfolgen flüchtende Gegner zu weit vom Schlachtfeld weg. Die Römer können sich nach hinten aus dem Halbkessel retten.'
    verdictTone = 'amber'
  }

  // Dynamic curve control point based on elasticity slider
  const curveDepth = 130 + elasticity * 1.45

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
      {/* Live Simulation Viewport */}
      <div className="editorial-card flex flex-col justify-between rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-indigo-300 uppercase">
            <Sliders className="h-4 w-4" />
            Live-Taktik-Simulation
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold ${
              verdictTone === 'emerald'
                ? 'bg-emerald-500/20 text-emerald-300'
                : verdictTone === 'amber'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-rose-500/20 text-rose-300'
            }`}
          >
            {isCannaeMasterpiece ? 'HISTORISCHES OPTIMUM' : 'INSTABIL'}
          </span>
        </div>

        <svg viewBox="0 0 500 280" className="my-3 h-auto w-full rounded-2xl border border-white/[0.06] bg-[#080D17]">
          {/* Roman Push Block */}
          <rect
            x={160}
            y={centerCollapsed ? 128 : 96}
            width={180}
            height={centerTooRigid ? 58 : 74}
            rx={8}
            fill="rgba(225, 29, 72, 0.35)"
            stroke="#FB7185"
            strokeWidth={2}
          />
          <text x={250} y={136} textAnchor="middle" className="fill-rose-100 text-[11px] font-bold">
            RÖMISCHER KEIL
          </text>

          {/* Elastic Carthaginian Center */}
          <path
            d={`M 125 182 Q 250 ${curveDepth} 375 182`}
            fill="none"
            stroke={centerCollapsed ? '#F43F5E' : '#F59E0B'}
            strokeWidth={11}
            strokeLinecap="round"
            strokeDasharray={centerCollapsed ? '10 12' : 'none'}
          />

          {/* Flanking Libyans */}
          <rect
            x={102}
            y={140}
            width={16}
            height={46}
            rx={4}
            fill="#10B981"
            opacity={centerTooRigid ? 0.35 : 0.95}
          />
          <rect
            x={382}
            y={140}
            width={16}
            height={46}
            rx={4}
            fill="#10B981"
            opacity={centerTooRigid ? 0.35 : 0.95}
          />

          {/* Cavalry Rear Arc based on timing */}
          <path
            d={
              cavalryTiming < 45
                ? 'M 70 185 Q 95 140 135 130'
                : cavalryTiming > 78
                  ? 'M 70 185 Q 150 22 435 28'
                  : 'M 75 185 Q 250 38 425 185'
            }
            fill="none"
            stroke={cavalryOptimal ? '#38BDF8' : '#94A3B8'}
            strokeWidth={3}
            strokeDasharray="6 5"
          />
          <text x={250} y={260} textAnchor="middle" className="fill-slate-400 font-mono text-[10px]">
            Durchbiegung: {elasticity}% · Kavallerie-Rückkehr: {cavalryTiming}%
          </text>
        </svg>

        <div
          className={`rounded-2xl border p-4 text-sm ${
            verdictTone === 'emerald'
              ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-100'
              : verdictTone === 'amber'
                ? 'border-amber-500/35 bg-amber-500/10 text-amber-100'
                : 'border-rose-500/35 bg-rose-500/10 text-rose-100'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            {verdictTone === 'emerald' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            )}
            <span>{verdictTitle}</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-200">{verdictBody}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="editorial-card flex flex-col justify-between gap-5 rounded-3xl p-5">
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold text-white">Kalibriere Hannibals Falle</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Cannae war ein Hochseilakt. Teste mit beiden Reglern, wie schmal das Fenster zwischen genialer Umfassung und totaler Niederlage war.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-300">1. Elastizität des Zentrums</span>
              <span className="font-mono text-white">{elasticity}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={95}
              value={elasticity}
              onChange={(e) => setElasticity(Number(e.target.value))}
              className="yuno-slider w-full"
              style={{ ['--slider-accent' as string]: '#F59E0B' }}
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Starr halten</span>
              <span>Kontrolliert biegen</span>
              <span>Schneller Rückzug</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-sky-300">2. Timing der Kavallerie-Rückkehr</span>
              <span className="font-mono text-white">{cavalryTiming}%</span>
            </div>
            <input
              type="range"
              min={15}
              max={95}
              value={cavalryTiming}
              onChange={(e) => setCavalryTiming(Number(e.target.value))}
              className="yuno-slider w-full"
              style={{ ['--slider-accent' as string]: '#38BDF8' }}
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Zu früh</span>
              <span>Im Rücken schließen</span>
              <span>Zu weit verfolgt</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-[#0B0F19] p-3.5 text-xs text-slate-400">
          <strong className="text-slate-200">Aha-Effekt:</strong> Nicht rohe Stärke, sondern das kontrollierte <em>Nachgeben</em> an der richtigen Stelle verwandelt die Übermacht des Gegners in dessen Gefängnis.
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 6: Kausal-Zeitstrahl (Ursache-Wirkung von Cannae bis Zama)          */
/* -------------------------------------------------------------------------- */

interface CausalNode {
  id: string
  year: string
  title: string
  summary: string
  causes: string[]
  effects: string[]
}

const CAUSAL_NODES: CausalNode[] = [
  {
    id: 'alps',
    year: '218 v. Chr.',
    title: 'Alpenüberquerung',
    summary: 'Hannibal trägt den Krieg unerwartet ins römische Kernland und gewinnt keltische Verbündete.',
    causes: [],
    effects: ['cannae'],
  },
  {
    id: 'cannae',
    year: '216 v. Chr.',
    title: 'Schlacht von Cannae',
    summary: 'Schwerste Niederlage der römischen Geschichte — ~50.000–70.000 Gefallene an einem Tag.',
    causes: ['alps'],
    effects: ['fabius', 'doctrine'],
  },
  {
    id: 'fabius',
    year: '216–209 v. Chr.',
    title: 'Fabius’ Ermattungsstrategie',
    summary: 'Rom verweigert offene Feldschlachten, schneidet Hannibals Nachschub ab und nutzt seine gewaltigen Bevölkerungsreserven.',
    causes: ['cannae'],
    effects: ['zama'],
  },
  {
    id: 'zama',
    year: '202 v. Chr.',
    title: 'Schlacht von Zama',
    summary: 'Scipio Africanus greift Nordafrika direkt an, zwingt Hannibal zur Rückkehr — und schlägt ihn mit seiner eigenen Kavallerie-Taktik.',
    causes: ['fabius'],
    effects: ['doctrine'],
  },
  {
    id: 'doctrine',
    year: 'Antike → Heute',
    title: 'Militärdoktrin „Cannae“',
    summary: 'Die doppelte Umfassung gilt seit über 2.200 Jahren als Lehrstück strategischer Asymmetrie — doch Cannae beweist auch: Taktik allein gewinnt ohne Nachschub keinen Krieg.',
    causes: ['cannae', 'zama'],
    effects: [],
  },
]

function Screen6CausalLegacy() {
  const [activeId, setActiveId] = useState<string>('cannae')
  const activeNode = CAUSAL_NODES.find((n) => n.id === activeId) ?? CAUSAL_NODES[1]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5 text-slate-200">
          <GitBranch className="h-3.5 w-3.5 text-indigo-400" />
          Klicke einen Meilenstein an, um Ursachen (blau) und Folgen (grün) aufleuchten zu lassen:
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {CAUSAL_NODES.map((node) => {
          const isSelected = node.id === activeId
          const isCause = activeNode.causes.includes(node.id)
          const isEffect = activeNode.effects.includes(node.id)
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => setActiveId(node.id)}
              className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition ${
                isSelected
                  ? 'border-amber-400 bg-amber-500/15 shadow-[0_0_24px_rgba(245,158,11,0.2)]'
                  : isCause
                    ? 'border-sky-400/60 bg-sky-500/12'
                    : isEffect
                      ? 'border-emerald-400/60 bg-emerald-500/12'
                      : 'border-white/8 bg-[#131B2E] hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[11px] font-semibold text-amber-300">
                    {node.year}
                  </span>
                  {isCause && (
                    <span className="rounded bg-sky-500/25 px-1.5 py-0.5 text-[10px] font-semibold text-sky-200">
                      Ursache
                    </span>
                  )}
                  {isEffect && (
                    <span className="rounded bg-emerald-500/25 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-200">
                      Folge
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-sm font-semibold text-white">{node.title}</h3>
              </div>
              <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-slate-400">
                {node.summary}
              </p>
            </button>
          )
        })}
      </div>

      <div className="editorial-card flex flex-wrap items-start justify-between gap-4 rounded-2xl p-5">
        <div className="max-w-2xl space-y-1.5">
          <div className="flex items-center gap-2 font-mono text-xs text-amber-400">
            <Swords className="h-4 w-4" />
            <span>{activeNode.year}</span>
          </div>
          <h3 className="text-lg font-semibold text-white">{activeNode.title}</h3>
          <p className="text-sm leading-relaxed text-slate-200">{activeNode.summary}</p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B0F19] px-4 py-3 text-xs text-slate-300">
          <Shield className="h-4 w-4 text-indigo-400" />
          <span>Bereit für die 4 visuellen Prüfungsaufgaben!</span>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  LESSON DEFINITION (auto-discovered by /src/lessons/registry.ts)           */
/* -------------------------------------------------------------------------- */

const schlachtVonCannaeLesson: LessonDefinition = {
  id: 'geschichte-schlacht-von-cannae',
  slug: 'schlacht-von-cannae',
  categoryId: 'geschichte',
  title: 'Die Schlacht von Cannae & Hannibals Alpenzug',
  subtitle:
    'Wie ein zahlenmäßig unterlegenes Heer 216 v. Chr. die größte römische Armee der Geschichte in einer perfekten doppelten Umfassung einkesselte.',
  eraOrContext: '218–216 v. Chr.',
  estimatedMinutes: 8,
  difficulty: 'Vertiefung',
  xpReward: 250,
  heroMedia: {
    wikiTitle: "Hannibal's_crossing_of_the_Alps",
    wikiLang: 'en',
    alt: 'Henri Motte (1878): Hannibal überquert die Rhône',
    credit: 'Wikimedia Commons',
  },
  keyTakeaways: [
    'Hannibals Alpenüberquerung (218 v. Chr.) kostete fast die Hälfte seines Heeres, brachte aber den strategischen Schock nach Italien.',
    'Bei Cannae (216 v. Chr.) besiegten ~50.000 Karthager ~86.400 Römer durch ein elastisches, kontrolliert zurückweichendes Zentrum.',
    'Libysche Veteranen an den Flanken und die überlegene Kavallerie im Rücken machten Roms eigene Masse zu dessen Gefängnis.',
    'Trotz genialer Taktik verlor Karthago den Krieg: Roms Ausdauer (Fabius-Strategie) und Scipios Gegenangriff bei Zama (202 v. Chr.) entschieden den Konflikt.',
  ],
  screens: [
    {
      id: 'alpenmarsch',
      badge: '01 · Geografie & Logistik',
      title: 'Der unmögliche Marsch über die Alpen',
      subtitle:
        'Statt über das von Rom beherrschte Mittelmeer anzugreifen, führt Hannibal 218 v. Chr. ein ganzes Heer samt Kriegselefanten über Pyrenäen, Rhône und Alpen.',
      component: Screen1AlpsMarch,
    },
    {
      id: 'kraefteverhaeltnis',
      badge: '02 · Asymmetrie der Kräfte',
      title: '86.400 Römer gegen 50.000 Karthager',
      subtitle:
        'Rom setzt auf schiere Masse in extrem tiefer Staffelung. Hannibal erkennt genau darin die Schwachstelle — und ordnet jede Truppe wie ein Uhrwerk an.',
      component: Screen2ForceBalance,
    },
    {
      id: 'doppelte-umfassung',
      badge: '03 · Taktische Mechanik',
      title: 'Die doppelte Umfassung Schritt für Schritt',
      subtitle:
        'Schalte die 5 Schlachtphasen durch und beobachte, wie sich Hannibals konvexes Zentrum in einen tödlichen Kessel verwandelt.',
      component: Screen3DoubleEnvelopment,
    },
    {
      id: 'medien-kontext',
      badge: '04 · Kunst & Dokumentation',
      title: 'Historisches Zeugnis & Video-Analyse',
      subtitle:
        'Untersuche John Trumbulls Gemälde per Hotspot-Scanner und sieh dir den entscheidenden Schlachtmoment im verifizierten Video-Ausschnitt an.',
      component: Screen4MediaContext,
    },
    {
      id: 'taktik-labor',
      badge: '05 · Interaktives Labor',
      title: 'Du bist Hannibal: Kalibriere die Falle',
      subtitle:
        'Ein Millimeter zu starr oder zu weich — und der Plan scheitert. Finde mit beiden Reglern das historische Optimum.',
      component: Screen5TacticLab,
    },
    {
      id: 'kausalitaet',
      badge: '06 · Langfristige Folgen',
      title: 'Taktischer Triumph, strategisches Dilemma',
      subtitle:
        'Warum Cannae Rom nicht vernichtete — und wie die Schlacht die Militärgeschichte für über zwei Jahrtausende prägte.',
      component: Screen6CausalLegacy,
    },
  ],
  quizzes: [
    {
      id: 'cannae-quiz-map',
      lessonId: 'geschichte-schlacht-von-cannae',
      categoryId: 'geschichte',
      type: 'map-pin',
      prompt: 'Wo genau lag das Schlachtfeld von Cannae?',
      hint: 'Suche im Südosten Italiens (Apulien), nahe der Adriaküste am Fluss Aufidus.',
      explanation:
        'Cannae lag in Apulien im Südosten Italiens (heute Canne della Battaglia nahe Barletta am Fluss Ofanto/Aufidus).',
      target: {
        label: 'Cannae (Apulien)',
        lon: 16.1325,
        lat: 41.3064,
      },
      toleranceKm: 135,
      mapView: {
        center: [12.5, 42.2],
        scale: 2100,
      },
      contextPins: [
        { label: 'Rom', lon: 12.4964, lat: 41.9028, muted: true },
        { label: 'Karthago', lon: 10.323, lat: 36.853, muted: true },
      ],
    },
    {
      id: 'cannae-quiz-timeline',
      lessonId: 'geschichte-schlacht-von-cannae',
      categoryId: 'geschichte',
      type: 'timeline-sort',
      prompt: 'Bringe die 4 Phasen von Hannibals doppelter Umfassung in die exakte Reihenfolge.',
      explanation:
        'Zuerst lockt der konvexe Halbmond die Römer an, weicht dann konkav zurück, worauf die Libyer die Flanken und die Kavallerie den Rücken schließen.',
      items: [
        {
          id: 'p1',
          label: 'Konvexe Aufstellung als Köder',
          sublabel: 'Kelten & Iberer wölben sich den Römern entgegen',
          order: 0,
        },
        {
          id: 'p2',
          label: 'Elastisches Zurückweichen des Zentrums',
          sublabel: 'Die Linie biegt sich unter römischem Druck konkav nach innen',
          order: 1,
        },
        {
          id: 'p3',
          label: 'Schwenk der libyschen Elite-Flanken',
          sublabel: 'Ausgeruhte Veteranen drehen um 90° in die römischen Seiten ein',
          order: 2,
        },
        {
          id: 'p4',
          label: 'Rückstoß der siegreichen Kavallerie',
          sublabel: 'Der Kessel schließt sich vollständig im Rücken der Legionen',
          order: 3,
        },
      ],
    },
    {
      id: 'cannae-quiz-year',
      lessonId: 'geschichte-schlacht-von-cannae',
      categoryId: 'geschichte',
      type: 'slider-estimate',
      prompt: 'In welchem Jahr fand die Schlacht von Cannae statt?',
      hint: 'Zwei Jahre nach Hannibals Alpenüberquerung (218 v. Chr.).',
      explanation:
        'Die Schlacht von Cannae fand am 2. August 216 v. Chr. statt — im dritten Jahr des Zweiten Punischen Krieges.',
      min: -260,
      max: -170,
      step: 1,
      unit: 'Jahre',
      targetValue: -216,
      tolerance: 8,
      formatAsBCE: true,
    },
    {
      id: 'cannae-quiz-connect',
      lessonId: 'geschichte-schlacht-von-cannae',
      categoryId: 'geschichte',
      type: 'visual-connect',
      prompt: 'Verbinde jeden Baustein von Hannibals Schlachtplan mit seiner genauen Funktion.',
      explanation:
        'Jedes Element hatte eine unverzichtbare Aufgabe: Zentrum als Sog, Libyer als Zange, Kavallerie als Riegel und der Fluss als natürliche Barriere.',
      leftColumnTitle: 'Element bei Cannae',
      rightColumnTitle: 'Taktische Funktion',
      pairs: [
        {
          id: 'center',
          left: 'Kelten & Iberer',
          leftSub: 'Mitte der Linie',
          right: 'Elastischer Köder, der kontrolliert nachgibt',
        },
        {
          id: 'libyans',
          left: 'Libysche Veteranen',
          leftSub: 'Schwere Infanterie',
          right: 'Schwenken als Zange in die römischen Flanken',
        },
        {
          id: 'cavalry',
          left: 'Numidische & Iberische Reiter',
          leftSub: '10.000 Kavalleristen',
          right: 'Schließen den Kessel im Rücken der Legionen',
        },
        {
          id: 'river',
          left: 'Fluss Aufidus',
          leftSub: 'Gelände-Faktor',
          right: 'Natürliche Begrenzung der römischen Flanke',
        },
      ],
    },
  ],
}

export default schlachtVonCannaeLesson
