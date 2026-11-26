import { motion } from 'framer-motion'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Compass,
  Film,
  Flag,
  Globe2,
  Layers,
  Mountain,
  Plane,
  Ruler,
  Sparkles,
  Volume2,
  Waves,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import * as Tone from 'tone'
import { RealGeoMap } from '../../components/geo/RealGeoMap'
import type { GeoMarker, GeoRoute } from '../../components/geo/RealGeoMap'
import { SmartMediaImage } from '../../components/media/SmartMediaImage'
import { SmartVideoPlayer } from '../../components/media/SmartVideoPlayer'
import type { LessonDefinition } from '../../types/yuno'

/* -------------------------------------------------------------------------- */
/*  SCREEN 1 (Option A): Echter Nordamerika-Atlas mit Layer-Scanner            */
/* -------------------------------------------------------------------------- */

type AtlasLayer = 'nachbarn' | 'ozeane' | 'sonderstaaten'

const LAYER_CONFIG: Record<
  AtlasLayer,
  {
    title: string
    summary: string
    center: [number, number]
    scale: number
    markers: GeoMarker[]
    wikiTitle: string
    wikiCaption: string
  }
> = {
  nachbarn: {
    title: 'Grenzen & Kernland',
    summary:
      'Die USA liegen mitten in Nordamerika: Im Norden grenzen sie an Kanada, im Süden an Mexiko und den Golf von Mexiko. Hauptstadt ist Washington, D.C. an der Ostküste.',
    center: [-98, 40],
    scale: 560,
    markers: [
      { id: 'canada', label: 'Kanada (Norden)', lon: -102, lat: 55, color: '#38BDF8' },
      { id: 'mexico', label: 'Mexiko (Süden)', lon: -102, lat: 23.5, color: '#F97316' },
      { id: 'gulf', label: 'Golf von Mexiko', lon: -90, lat: 25.5, color: '#0EA5E9', muted: false },
      { id: 'dc', label: 'Washington, D.C.', sublabel: 'Hauptstadt', lon: -77.0369, lat: 38.9072, color: '#F59E0B', pulse: true, active: true },
      { id: 'nyc', label: 'New York City', sublabel: '~8,4 Mio. Einw.', lon: -74.006, lat: 40.7128, color: '#EC4899' },
    ],
    wikiTitle: 'United_States_Capitol',
    wikiCaption: 'Das US-Kapitol in Washington, D.C. — dem politischen Zentrum und der Hauptstadt der USA.',
  },
  ozeane: {
    title: 'Brücke zwischen zwei Ozeanen',
    summary:
      'Zwischen Atlantik im Osten und Pazifik im Westen erstrecken sich die USA über einen ganzen Kontinent. Zwei gewaltige Gebirgszüge rahmen das Landesinnere ein.',
    center: [-96, 39],
    scale: 610,
    markers: [
      { id: 'pacific', label: 'Pazifischer Ozean', sublabel: 'Westküste', lon: -129, lat: 37, color: '#38BDF8', pulse: true },
      { id: 'atlantic', label: 'Atlantischer Ozean', sublabel: 'Ostküste', lon: -66, lat: 37, color: '#38BDF8', pulse: true },
      { id: 'rockies', label: 'Rocky Mountains', sublabel: 'Westen', lon: -109, lat: 42.5, color: '#F59E0B', active: true },
      { id: 'appalachians', label: 'Appalachen', sublabel: 'Osten', lon: -81.5, lat: 37.5, color: '#10B981', active: true },
    ],
    wikiTitle: 'Rocky_Mountains',
    wikiCaption: 'Die Rocky Mountains (hier Maroon Bells, Colorado) bilden das gewaltige Hochgebirge im Westen.',
  },
  sonderstaaten: {
    title: '50 Bundesstaaten — inkl. Alaska & Hawaii',
    summary:
      'Zwei der 50 Bundesstaaten liegen weit abseits des Kernlands: Alaska im hohen Nordwesten ist der flächenmäßig größte Bundesstaat, Hawaii bildet als Pazifik-Inselgruppe den südwestlichsten.',
    center: [-126, 44],
    scale: 390,
    markers: [
      { id: 'alaska', label: 'Alaska', sublabel: 'Größter Bundesstaat · Denali 6.190 m', lon: -151.0, lat: 63.07, color: '#14B8A6', pulse: true, active: true },
      { id: 'hawaii', label: 'Hawaii', sublabel: 'Pazifik-Inselgruppe (Südwesten)', lon: -155.5, lat: 19.9, color: '#F59E0B', pulse: true, active: true },
      { id: 'dc-ref', label: 'Washington, D.C.', lon: -77.04, lat: 38.9, color: '#64748B', muted: true },
    ],
    wikiTitle: 'Nā_Pali_Coast_State_Park',
    wikiCaption: 'Hawaii (hier die Nā-Pali-Küste auf Kauaʻi) liegt als vulkanische Inselgruppe mitten im Pazifik.',
  },
}

function Screen1NorthAmericaAtlas() {
  const [layer, setLayer] = useState<AtlasLayer>('nachbarn')
  const cfg = LAYER_CONFIG[layer]

  const routes: GeoRoute[] =
    layer === 'ozeane'
      ? [
          {
            id: 'coast-to-coast',
            points: [
              [-122.4, 37.77],
              [-109, 41.5],
              [-90.2, 38.6],
              [-81.5, 37.8],
              [-74.0, 40.7],
            ],
            color: '#14B8A6',
            progress: 1,
            strokeWidth: 2.8,
            dashed: true,
          },
        ]
      : layer === 'sonderstaaten'
        ? [
            {
              id: 'alaska-link',
              points: [
                [-122.3, 47.6],
                [-151.0, 63.07],
              ],
              color: '#14B8A6',
              dashed: true,
              strokeWidth: 2.2,
            },
            {
              id: 'hawaii-link',
              points: [
                [-118.2, 34.0],
                [-155.5, 19.9],
              ],
              color: '#F59E0B',
              dashed: true,
              strokeWidth: 2.2,
            },
          ]
        : []

  return (
    <div className="space-y-4">
      {/* Layer Switcher */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { id: 'nachbarn', label: '1. Nachbarn & Hauptstadt', icon: Globe2 },
            { id: 'ozeane', label: '2. Ozeane & Gebirge', icon: Waves },
            { id: 'sonderstaaten', label: '3. Alaska & Hawaii (50 Staaten)', icon: Compass },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon
          const active = layer === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setLayer(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                active
                  ? 'border-teal-400 bg-teal-500/15 text-teal-200'
                  : 'border-white/10 bg-[#131B2E] text-slate-400 hover:border-white/25 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <RealGeoMap
          center={cfg.center}
          scale={cfg.scale}
          markers={cfg.markers}
          routes={routes}
          caption="Schalte oben zwischen den 3 Karten-Layern um und zoome frei hinein."
        />

        <div className="flex flex-col justify-between gap-4">
          <SmartMediaImage
            wikiTitle={cfg.wikiTitle}
            wikiLang="en"
            alt={cfg.wikiCaption}
            caption={cfg.wikiCaption}
            credit="Wikimedia Commons"
            aspectClass="aspect-[16/10]"
          />

          <div className="editorial-card rounded-2xl p-4">
            <div className="flex items-center gap-2 font-mono text-[11px] font-semibold text-teal-400 uppercase">
              <Layers className="h-3.5 w-3.5" />
              <span>Aktiver Atlas-Layer</span>
            </div>
            <h3 className="mt-1 text-base font-semibold text-white">{cfg.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">{cfg.summary}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 2 (Option A + B): Globale Superlative (Rang 3 & 3) + Größen-Labor   */
/* -------------------------------------------------------------------------- */

const AREA_RANKING = [
  { name: 'Russland', value: 17.1, highlight: false },
  { name: 'Kanada', value: 9.98, highlight: false },
  { name: 'USA (#3)', value: 9.83, highlight: true },
  { name: 'China', value: 9.6, highlight: false },
  { name: 'Brasilien', value: 8.52, highlight: false },
]

const POP_RANKING = [
  { name: 'Indien', value: 1440, highlight: false },
  { name: 'China', value: 1410, highlight: false },
  { name: 'USA (#3)', value: 340, highlight: true },
  { name: 'Indonesien', value: 280, highlight: false },
  { name: 'Deutschland', value: 84, highlight: false },
]

const ALASKA_COMPARISONS = [
  { id: 'de', label: 'Deutschland', km2: 357588, factor: '4,8× größer' },
  { id: 'fr', label: 'Frankreich (Festland)', km2: 551695, factor: '3,1× größer' },
  { id: 'tx', label: 'Texas (#2 der USA)', km2: 695662, factor: '2,5× größer' },
]

function Screen2SuperlativesLab() {
  const [metric, setMetric] = useState<'population' | 'area'>('population')
  const [compareIdx, setCompareIdx] = useState(0)

  const chartData = metric === 'population' ? POP_RANKING : AREA_RANKING
  const compareTarget = ALASKA_COMPARISONS[compareIdx]
  const alaskaKm2 = 1723337
  const compareWidthPct = Math.round((compareTarget.km2 / alaskaKm2) * 100)

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        {/* Global Rank 3 & 3 Interactive Chart */}
        <div className="editorial-card space-y-4 rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[11px] font-semibold text-teal-400 uppercase">
                Weltrangliste · Doppel-Bronze
              </span>
              <h3 className="text-base font-semibold text-white">
                {metric === 'population'
                  ? 'Drittgrößtes Land nach Einwohnern (~340 Mio.)'
                  : 'Drittgrößtes Land der Erde nach Fläche (~9,8 Mio. km²)'}
              </h3>
            </div>

            <div className="flex rounded-xl border border-white/10 bg-[#0B0F19] p-1 text-xs">
              <button
                type="button"
                onClick={() => setMetric('population')}
                className={`rounded-lg px-3 py-1 font-semibold transition ${
                  metric === 'population' ? 'bg-teal-500 text-[#0B0F19]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Einwohner
              </button>
              <button
                type="button"
                onClick={() => setMetric('area')}
                className={`rounded-lg px-3 py-1 font-semibold transition ${
                  metric === 'area' ? 'bg-teal-500 text-[#0B0F19]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Fläche
              </button>
            </div>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 18, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={92}
                  tick={{ fill: '#E2E8F0', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  formatter={(v) => [
                    metric === 'population' ? `${v} Mio. Menschen` : `${v} Mio. km²`,
                    metric === 'population' ? 'Bevölkerung' : 'Fläche',
                  ]}
                  contentStyle={{
                    backgroundColor: '#0B0F19',
                    borderColor: 'rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.highlight ? '#14B8A6' : '#334155'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Alaska Size Overlay Labor (Option B) */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0B0F19] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                <Ruler className="h-3.5 w-3.5" />
                Alaska-Größenlabor (Größter US-Bundesstaat)
              </span>
              <span className="font-mono text-xs font-bold text-teal-300">
                Alaska ist {compareTarget.factor}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Alaska (1,72 Mio. km²)</span>
                <span className="font-mono text-teal-300">100%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-teal-500/80" />

              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>{compareTarget.label} ({(compareTarget.km2 / 1000).toFixed(0)} Tsd. km²)</span>
                <span className="font-mono text-amber-300">{compareWidthPct}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/8">
                <motion.div
                  animate={{ width: `${compareWidthPct}%` }}
                  transition={{ duration: 0.45 }}
                  className="h-full rounded-full bg-amber-400"
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {ALASKA_COMPARISONS.map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCompareIdx(idx)}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                    compareIdx === idx
                      ? 'border-amber-400 bg-amber-500/15 text-amber-200'
                      : 'border-white/10 bg-[#131B2E] text-slate-400 hover:text-white'
                  }`}
                >
                  vs. {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* NYC vs Washington D.C. */}
        <div className="flex flex-col justify-between gap-4">
          <SmartMediaImage
            wikiTitle="New_York_City"
            wikiLang="en"
            alt="Skyline von New York City mit dem Empire State Building"
            caption="New York City: Mit ca. 8,4 Mio. Einwohnern die größte Stadt der USA — aber NICHT die Hauptstadt."
            credit="Wikimedia Commons"
            aspectClass="aspect-[16/10]"
          />

          <div className="editorial-card grid grid-cols-2 gap-3 rounded-2xl p-4">
            <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3">
              <span className="font-mono text-[10px] font-semibold text-amber-300 uppercase">
                Hauptstadt
              </span>
              <p className="mt-1 text-sm font-bold text-white">Washington, D.C.</p>
              <p className="mt-0.5 text-[11px] text-slate-300">
                Regierungssitz (Weißes Haus &amp; Kapitol)
              </p>
            </div>
            <div className="rounded-xl border border-pink-400/30 bg-pink-500/10 p-3">
              <span className="font-mono text-[10px] font-semibold text-pink-300 uppercase">
                Größte Stadt
              </span>
              <p className="mt-1 text-sm font-bold text-white">New York City</p>
              <p className="mt-0.5 text-[11px] text-slate-300">
                ~8,4 Mio. Einwohner an der Ostküste
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 3 (Option C Wildcard): Coast-to-Coast Flug-Radar + Höhenprofil      */
/* -------------------------------------------------------------------------- */

interface FlightStop {
  id: string
  label: string
  region: string
  lon: number
  lat: number
  elevationM: number
  note: string
}

const FLIGHT_STOPS: FlightStop[] = [
  {
    id: 'hawaii',
    label: 'Hawaii',
    region: 'Pazifik · Südwesten',
    lon: -155.5,
    lat: 19.9,
    elevationM: 120,
    note: 'Start mitten im Pazifik: Die vulkanische Inselgruppe bildet den südwestlichsten Bundesstaat der USA.',
  },
  {
    id: 'denali',
    label: 'Denali (Alaska)',
    region: 'Nordwesten · 6.190 m',
    lon: -151.0074,
    lat: 63.0695,
    elevationM: 6190,
    note: 'Gipfelpunkt des Fluges! Der Denali (Mount McKinley) in Alaska ist mit 6.190 Metern der höchste Berg der USA.',
  },
  {
    id: 'rockies',
    label: 'Rocky Mountains',
    region: 'Gebirge im Westen',
    lon: -106.5,
    lat: 40.3,
    elevationM: 4350,
    note: 'Zurück über dem Festland ragen die gewaltigen Rocky Mountains im Westen auf — Wasserscheide Nordamerikas.',
  },
  {
    id: 'missouri',
    label: 'Missouri & Mississippi',
    region: 'Flussbecken der Mitte',
    lon: -90.19,
    lat: 38.82,
    elevationM: 160,
    note: 'Hier mündet der Missouri (längster Fluss der USA) in den Mississippi — das riesige Stromsystem im Herzen des Landes.',
  },
  {
    id: 'appalachians',
    label: 'Appalachen',
    region: 'Gebirge im Osten',
    lon: -82.26,
    lat: 35.76,
    elevationM: 2037,
    note: 'Im Osten überfliegen wir die geologisch uralten, sanfteren Appalachen — deutlich niedriger als die Rockies.',
  },
  {
    id: 'eastcoast',
    label: 'Washington D.C. & NYC',
    region: 'Atlantikküste',
    lon: -75.5,
    lat: 39.8,
    elevationM: 30,
    note: 'Landung am Atlantik: Zwischen Hauptstadt Washington, D.C. und der 8,4-Millionen-Metropole New York City.',
  },
]

function Screen3CoastToCoastRadar() {
  const [stopIdx, setStopIdx] = useState(1)
  const stop = FLIGHT_STOPS[stopIdx]
  const progress = stopIdx / (FLIGHT_STOPS.length - 1)

  const markers: GeoMarker[] = FLIGHT_STOPS.map((s, idx) => ({
    id: s.id,
    label: s.label,
    sublabel: idx === stopIdx ? `${s.elevationM.toLocaleString('de-DE')} m` : undefined,
    lon: s.lon,
    lat: s.lat,
    color: idx === stopIdx ? '#F59E0B' : idx < stopIdx ? '#14B8A6' : '#64748B',
    pulse: idx === stopIdx,
    active: idx === stopIdx,
    muted: idx > stopIdx,
  }))

  const profileData = FLIGHT_STOPS.map((s, idx) => ({
    name: s.label.split(' ')[0],
    Höhe: s.elevationM,
    reached: idx <= stopIdx,
  }))

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <RealGeoMap
          center={[-116, 44]}
          scale={395}
          markers={markers}
          routes={[
            {
              id: 'flight-path',
              points: FLIGHT_STOPS.map((s) => [s.lon, s.lat]),
              color: '#F59E0B',
              progress: Math.max(0.03, progress),
              strokeWidth: 3.2,
            },
          ]}
          onMarkerClick={(m) => {
            const idx = FLIGHT_STOPS.findIndex((s) => s.id === m.id)
            if (idx >= 0) setStopIdx(idx)
          }}
          caption="Fliege mit dem Radar-Slider von West nach Ost oder klicke direkt auf die Wegpunkte."
        />

        <div className="flex flex-col justify-between gap-4">
          <SmartMediaImage
            wikiTitle="Denali"
            wikiLang="en"
            alt="Der Denali (Mount McKinley) in Alaska — 6.190 Meter hoch"
            caption="Der Denali (Mount McKinley) in Alaska: Mit 6.190 m der höchste Berg der USA."
            credit="Wikimedia Commons"
            aspectClass="aspect-[16/10]"
          />

          <div className="editorial-card rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-amber-400">
                <Plane className="h-3.5 w-3.5" />
                {stop.region}
              </span>
              <span className="font-mono text-slate-400">
                Stopp {stopIdx + 1}/{FLIGHT_STOPS.length}
              </span>
            </div>
            <h3 className="mt-1 text-base font-semibold text-white">{stop.label}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">{stop.note}</p>
          </div>
        </div>
      </div>

      {/* Synchronized Flight Slider + Elevation Cross-Section */}
      <div className="editorial-card grid gap-5 rounded-2xl p-5 lg:grid-cols-[1fr_1.45fr] lg:items-center">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-amber-300">
              <Plane className="h-3.5 w-3.5" />
              Transkontinental-Flugregler
            </span>
            <span className="font-mono text-white">
              Höhe: {stop.elevationM.toLocaleString('de-DE')} m
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={FLIGHT_STOPS.length - 1}
            step={1}
            value={stopIdx}
            onChange={(e) => setStopIdx(Number(e.target.value))}
            className="yuno-slider w-full"
            style={{ ['--slider-accent' as string]: '#F59E0B' }}
          />
          <div className="flex justify-between font-mono text-[10px] text-slate-500">
            <span>Pazifik (Hawaii)</span>
            <span>Denali · Rockies</span>
            <span>Atlantik (NYC)</span>
          </div>
        </div>

        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={profileData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => [`${Number(v).toLocaleString('de-DE')} m`, 'Höhenprofil']}
                contentStyle={{
                  backgroundColor: '#0B0F19',
                  borderColor: 'rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="Höhe" stroke="#F59E0B" strokeWidth={2.2} fill="url(#elevGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 4 (Option B + C): Fluss-/Höhen-Messlabor + Denkfehler-Radar         */
/* -------------------------------------------------------------------------- */

interface MythCard {
  id: string
  statement: string
  isTrue: boolean
  correction: string
}

const MYTH_CHECKS: MythCard[] = [
  {
    id: 'myth-capital',
    statement: '„New York City ist die Hauptstadt der USA.“',
    isTrue: false,
    correction:
      'Falsch! New York City ist mit ~8,4 Mio. Einwohnern die größte Stadt — Hauptstadt ist Washington, D.C.',
  },
  {
    id: 'myth-river',
    statement: '„Der Missouri ist länger als der Mississippi.“',
    isTrue: true,
    correction:
      'Richtig! Viele tippen auf den Mississippi, doch der Missouri ist der längste Fluss der USA — dicht gefolgt vom Mississippi.',
  },
  {
    id: 'myth-peak',
    statement: '„Der höchste Berg der USA liegt in den Rocky Mountains.“',
    isTrue: false,
    correction:
      'Falsch! Der höchste Berg ist der Denali (Mount McKinley) mit 6.190 m — und der steht weit im Norden in Alaska.',
  },
]

function Screen4MeasureAndMythLab() {
  const [raceStarted, setRaceStarted] = useState(true)
  const [answers, setAnswers] = useState<Record<string, boolean>>({})

  const handleMythTap = (myth: MythCard, userSaysTrue: boolean) => {
    setAnswers((prev) => ({ ...prev, [myth.id]: userSaysTrue === myth.isTrue }))
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Left: River Race & Mountain Altitude Gauge (Option B) */}
      <div className="editorial-card space-y-6 rounded-2xl p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-300">
              <Waves className="h-4 w-4" />
              Flusslängen-Rennen
            </span>
            <button
              type="button"
              onClick={() => {
                setRaceStarted(false)
                window.setTimeout(() => setRaceStarted(true), 60)
              }}
              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            >
              Rennen neu starten
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-semibold text-white">1. Missouri (Längster Fluss)</span>
                <span className="font-mono text-sky-300">~3.767 km</span>
              </div>
              <div className="h-3.5 w-full overflow-hidden rounded-full bg-white/8">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: raceStarted ? '100%' : '0%' }}
                  transition={{ duration: 1.1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-400"
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-semibold text-slate-200">2. Mississippi (Dicht dahinter)</span>
                <span className="font-mono text-indigo-300">~3.730 km</span>
              </div>
              <div className="h-3.5 w-full overflow-hidden rounded-full bg-white/8">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: raceStarted ? '97%' : '0%' }}
                  transition={{ duration: 1.1, ease: 'easeOut', delay: 0.08 }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Altitude comparison */}
        <div className="space-y-3 border-t border-white/[0.08] pt-5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
            <Mountain className="h-4 w-4" />
            Höhenmesser: Denali vs. Gebirge
          </div>

          <div className="grid grid-cols-4 items-end gap-2.5 pt-2">
            {[
              { label: 'Denali', sub: 'Alaska', m: 6190, pct: 100, color: 'bg-amber-400' },
              { label: 'Rockies', sub: 'Westen', m: 4401, pct: 71, color: 'bg-teal-400' },
              { label: 'Zugspitze', sub: 'Vergleich', m: 2962, pct: 48, color: 'bg-slate-500' },
              { label: 'Appalachen', sub: 'Osten', m: 2037, pct: 33, color: 'bg-indigo-400' },
            ].map((peak) => (
              <div key={peak.label} className="flex flex-col items-center text-center">
                <span className="mb-1 font-mono text-[10px] font-semibold text-slate-300">
                  {peak.m.toLocaleString('de-DE')} m
                </span>
                <div className="flex h-32 w-full items-end justify-center rounded-xl bg-[#0B0F19] p-1.5">
                  <div
                    style={{ height: `${peak.pct}%` }}
                    className={`w-full rounded-lg ${peak.color} transition-all duration-500`}
                  />
                </div>
                <span className="mt-1.5 text-xs font-semibold text-white">{peak.label}</span>
                <span className="text-[10px] text-slate-400">{peak.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: "Finde den Denkfehler"-Radar (Option C) */}
      <div className="editorial-card space-y-4 rounded-2xl p-5">
        <div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-amber-400 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            Finde den Denkfehler · Schnell-Check
          </span>
          <h3 className="mt-1 text-base font-semibold text-white">
            Die 3 klassischen USA-Irrtümer entlarven
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Tippe bei jeder Aussage auf „Stimmt“ oder „Irrtum“:
          </p>
        </div>

        <div className="space-y-3">
          {MYTH_CHECKS.map((myth) => {
            const answered = myth.id in answers
            const wasRight = answers[myth.id]
            return (
              <div
                key={myth.id}
                className={`rounded-2xl border p-4 transition ${
                  answered
                    ? wasRight
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-amber-500/40 bg-amber-500/10'
                    : 'border-white/10 bg-[#0D1322]'
                }`}
              >
                <p className="text-sm font-semibold text-white">{myth.statement}</p>

                {!answered ? (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleMythTap(myth, true)}
                      className="flex-1 rounded-xl border border-white/12 bg-white/[0.04] py-2 text-xs font-semibold text-slate-200 transition hover:border-emerald-400/50 hover:bg-emerald-500/15"
                    >
                      Stimmt
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMythTap(myth, false)}
                      className="flex-1 rounded-xl border border-white/12 bg-white/[0.04] py-2 text-xs font-semibold text-slate-200 transition hover:border-rose-400/50 hover:bg-rose-500/15"
                    >
                      Irrtum!
                    </button>
                  </div>
                ) : (
                  <div className="mt-2.5 flex items-start gap-2 text-xs leading-relaxed text-slate-200">
                    {wasRight ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    )}
                    <span>{myth.correction}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 5 (Option A + B + C): „Stars and Stripes“ Zeitreise & Farb-Decoder  */
/* -------------------------------------------------------------------------- */

interface FlagEra {
  year: number
  stars: number
  label: string
  note: string
}

const FLAG_ERAS: FlagEra[] = [
  {
    year: 1777,
    stars: 13,
    label: '1777 · Geburtsstunde',
    note: 'Am 14. Juni 1777 offiziell eingeführt: 13 Streifen & 13 Sterne für die 13 Gründerstaaten.',
  },
  {
    year: 1818,
    stars: 20,
    label: '1818 · Streifen-Gesetz',
    note: 'Der Kongress legt fest: Es bleiben für immer 13 Streifen — nur neue Sterne kommen hinzu.',
  },
  {
    year: 1912,
    stars: 48,
    label: '1912 · Festland komplett',
    note: '48 zusammenhängende Bundesstaaten auf dem nordamerikanischen Festland.',
  },
  {
    year: 1959,
    stars: 49,
    label: '1959 · Stern #49: Alaska',
    note: 'Alaska tritt als 49. — und flächenmäßig größter — Bundesstaat bei.',
  },
  {
    year: 1960,
    stars: 50,
    label: '1960–Heute · Stern #50: Hawaii',
    note: 'Hawaii wird 50. Bundesstaat: 50 Sterne auf Blau, 13 Streifen in Rot und Weiß.',
  },
]

type FlagColorFocus = 'all' | 'red' | 'white' | 'blue'

const COLOR_INFO: Record<FlagColorFocus, { title: string; meaning: string; badge: string }> = {
  all: {
    title: 'Stars and Stripes (Sterne & Streifen)',
    meaning: 'Klicke eine Farbe an, um sie auf der Flagge isoliert hervorzuheben und ihre Symbolik zu entschlüsseln.',
    badge: 'Alle Ebenen',
  },
  red: {
    title: 'Rot — Tapferkeit (Valor & Hardiness)',
    meaning: 'Die 7 roten Streifen stehen symbolisch für Mut, Tapferkeit und Standhaftigkeit.',
    badge: 'Rot aktiv',
  },
  white: {
    title: 'Weiß — Reinheit (Purity & Innocence)',
    meaning: 'Die 6 weißen Streifen sowie die 50 Sterne symbolisieren Reinheit und Unschuld.',
    badge: 'Weiß aktiv',
  },
  blue: {
    title: 'Blau — Gerechtigkeit (Justice & Vigilance)',
    meaning: 'Das blaue Sternenfeld (Canton) steht für Gerechtigkeit, Ausdauer und Wachsamkeit.',
    badge: 'Blau aktiv',
  },
}

function generateStarPositions(count: number): Array<{ cx: number; cy: number }> {
  const pts: Array<{ cx: number; cy: number }> = []
  if (count === 13) {
    // Iconic Betsy Ross 13-star circle
    for (let i = 0; i < 13; i++) {
      const angle = (i / 13) * Math.PI * 2 - Math.PI / 2
      pts.push({ cx: 114 + Math.cos(angle) * 52, cy: 81 + Math.sin(angle) * 52 })
    }
    return pts
  }
  // Clean staggered grid for 20 / 48 / 49 / 50 stars inside canton (x: 16..212, y: 14..148)
  const rows = count === 20 ? 4 : count === 48 ? 6 : count === 49 ? 7 : 9
  const colsEven = count === 20 ? 5 : count === 48 ? 8 : count === 49 ? 7 : 6
  const colsOdd = count === 50 ? 5 : colsEven
  const yStep = 132 / (rows + 1)

  for (let r = 0; r < rows; r++) {
    const cols = r % 2 === 0 ? colsEven : colsOdd
    const xPad = r % 2 === 0 ? 18 : 34
    const usableW = 228 - xPad * 2
    const xStep = cols > 1 ? usableW / (cols - 1) : 0
    for (let c = 0; c < cols; c++) {
      if (pts.length < count) {
        pts.push({
          cx: xPad + c * xStep,
          cy: 14 + (r + 1) * yStep,
        })
      }
    }
  }
  return pts
}

function Screen5FlagTimeMachine() {
  const [eraIdx, setEraIdx] = useState(4)
  const [colorFocus, setColorFocus] = useState<FlagColorFocus>('all')
  const [playingFanfare, setPlayingFanfare] = useState(false)
  const synthRef = useRef<Tone.PolySynth | null>(null)

  useEffect(() => {
    return () => {
      synthRef.current?.dispose()
      synthRef.current = null
    }
  }, [])

  const era = FLAG_ERAS[eraIdx]
  const stars = generateStarPositions(era.stars)

  const playFlagDayFanfare = async () => {
    await Tone.start()
    if (!synthRef.current) {
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
      }).toDestination()
    }
    setPlayingFanfare(true)
    const now = Tone.now()
    // Classic bright triad fanfare motif (G4 -> E4 -> C4 -> E4 -> G4 -> C5)
    const notes = [
      { p: 'G4', d: '8n', t: 0 },
      { p: 'E4', d: '8n', t: 0.18 },
      { p: 'C4', d: '4n', t: 0.36 },
      { p: 'E4', d: '4n', t: 0.68 },
      { p: 'G4', d: '4n', t: 1.0 },
      { p: 'C5', d: '2n', t: 1.32 },
    ]
    for (const n of notes) {
      synthRef.current.triggerAttackRelease(n.p, n.d, now + n.t)
    }
    window.setTimeout(() => setPlayingFanfare(false), 1900)
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        {/* Interactive Geometric Live Flag Canvas */}
        <div className="editorial-card space-y-4 rounded-3xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-amber-300">
              <Flag className="h-4 w-4" />
              {era.label}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-xs text-white">
              13 Streifen · {era.stars} Sterne
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#070B14] shadow-2xl">
            <svg viewBox="0 0 570 300" className="h-auto w-full select-none" role="img" aria-label={`US-Flagge ${era.year} mit ${era.stars} Sternen`}>
              {/* 13 Stripes */}
              {Array.from({ length: 13 }).map((_, idx) => {
                const isRed = idx % 2 === 0
                const dimmed =
                  (colorFocus === 'red' && !isRed) ||
                  (colorFocus === 'white' && isRed) ||
                  colorFocus === 'blue'
                return (
                  <rect
                    key={idx}
                    x={0}
                    y={(idx * 300) / 13}
                    width={570}
                    height={300 / 13 + 0.4}
                    fill={isRed ? '#B22234' : '#F8FAFC'}
                    opacity={dimmed ? 0.16 : 1}
                    style={{ transition: 'opacity 280ms ease' }}
                  />
                )
              })}

              {/* Blue Canton */}
              <rect
                x={0}
                y={0}
                width={228}
                height={(7 * 300) / 13}
                fill="#1E3A8A"
                opacity={colorFocus === 'red' || colorFocus === 'white' ? 0.2 : 1}
                style={{ transition: 'opacity 280ms ease' }}
              />

              {/* Stars */}
              {stars.map((s, idx) => (
                <circle
                  key={`${era.year}-${idx}`}
                  cx={s.cx}
                  cy={s.cy}
                  r={era.stars === 13 ? 5.2 : era.stars <= 20 ? 4.8 : 3.9}
                  fill="#FFFFFF"
                  opacity={colorFocus === 'red' || colorFocus === 'blue' ? 0.25 : 1}
                  style={{ transition: 'opacity 280ms ease' }}
                />
              ))}
            </svg>
          </div>

          {/* Time-Travel Slider (1777 -> 1960) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-indigo-300">Zeitreise-Slider (1777 → Heute)</span>
              <span className="font-mono text-slate-300">{era.year}</span>
            </div>
            <input
              type="range"
              min={0}
              max={FLAG_ERAS.length - 1}
              step={1}
              value={eraIdx}
              onChange={(e) => setEraIdx(Number(e.target.value))}
              className="yuno-slider w-full"
              style={{ ['--slider-accent' as string]: '#6366F1' }}
            />
            <div className="flex justify-between font-mono text-[10px] text-slate-500">
              <span>1777 (13★)</span>
              <span>1912 (48★)</span>
              <span>1959 Alaska (49★)</span>
              <span>1960 Hawaii (50★)</span>
            </div>
            <p className="pt-1 text-xs leading-relaxed text-slate-300">{era.note}</p>
          </div>
        </div>

        {/* Color Decoder + Flag Day (14. Juni) + Tone.js */}
        <div className="flex flex-col justify-between gap-4">
          <div className="editorial-card space-y-4 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold text-slate-400 uppercase">
                Farb- &amp; Symbol-Decoder
              </span>
              <span className="rounded-full bg-white/8 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                {COLOR_INFO[colorFocus].badge}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { id: 'all', label: 'Alle', swatch: 'bg-gradient-to-r from-red-600 via-white to-blue-800' },
                  { id: 'red', label: 'Rot', swatch: 'bg-[#B22234]' },
                  { id: 'white', label: 'Weiß', swatch: 'bg-slate-100' },
                  { id: 'blue', label: 'Blau', swatch: 'bg-[#1E3A8A]' },
                ] as const
              ).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColorFocus(c.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition ${
                    colorFocus === c.id
                      ? 'border-white bg-white/12 text-white'
                      : 'border-white/10 bg-[#0D1322] text-slate-400 hover:border-white/25'
                  }`}
                >
                  <span className={`h-4 w-8 rounded-full border border-white/20 ${c.swatch}`} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0B0F19] p-4">
              <h4 className="text-sm font-semibold text-white">{COLOR_INFO[colorFocus].title}</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                {COLOR_INFO[colorFocus].meaning}
              </p>
            </div>
          </div>

          {/* Flag Day Card + Tone.js Sound */}
          <div className="editorial-card flex flex-col justify-between gap-4 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-amber-400 uppercase">
                  <Calendar className="h-3.5 w-3.5" />
                  Eigener Feiertag · 14. Juni
                </div>
                <h4 className="mt-1 text-lg font-bold text-white">„Flag Day“</h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  Jedes Jahr am <strong>14. Juni</strong> feiern die USA die Einführung der „Stars and Stripes“ im Jahr <strong>1777</strong>.
                </p>
              </div>
              <div className="shrink-0 rounded-2xl border border-amber-400/35 bg-amber-500/15 px-3.5 py-2 text-center">
                <span className="block font-mono text-xl font-bold text-amber-300">14</span>
                <span className="font-mono text-[10px] font-semibold text-amber-200 uppercase">Juni</span>
              </div>
            </div>

            <button
              type="button"
              onClick={playFlagDayFanfare}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-400/40 bg-indigo-500/15 px-4 py-2.5 text-xs font-semibold text-indigo-200 transition hover:bg-indigo-500/25"
            >
              <Volume2 className={`h-4 w-4 ${playingFanfare ? 'animate-pulse text-amber-300' : ''}`} />
              <span>{playingFanfare ? 'Fanfare erklingt…' : 'Flag-Day-Fanfare abspielen (Tone.js)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 6 (Medien-Galerie): Verifizierte Naturfotos & YouTube-Überblick     */
/* -------------------------------------------------------------------------- */

const MEDIA_SPOTS = [
  {
    id: 'denali',
    label: 'Denali (Alaska)',
    wikiTitle: 'Denali',
    caption: '6.190 m — der höchste Berg der USA im größten Bundesstaat Alaska.',
  },
  {
    id: 'rockies',
    label: 'Rocky Mountains',
    wikiTitle: 'Rocky_Mountains',
    caption: 'Das mächtige Gebirge im Westen der Vereinigten Staaten.',
  },
  {
    id: 'nyc',
    label: 'New York City',
    wikiTitle: 'New_York_City',
    caption: 'Rund 8,4 Mio. Einwohner — die bevölkerungsreichste Stadt der USA.',
  },
  {
    id: 'hawaii',
    label: 'Hawaii',
    wikiTitle: 'Nā_Pali_Coast_State_Park',
    caption: 'Inselgruppe im Pazifik und südwestlichster Bundesstaat.',
  },
]

function Screen6MediaGallery() {
  const [spotIdx, setSpotIdx] = useState(0)
  const [videoTab, setVideoTab] = useState<'karten' | 'terrax'>('karten')
  const spot = MEDIA_SPOTS[spotIdx]

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Interactive Wikimedia Photo Explorer */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {MEDIA_SPOTS.map((m, idx) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSpotIdx(idx)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                spotIdx === idx
                  ? 'border-teal-400 bg-teal-500/15 text-teal-200'
                  : 'border-white/10 bg-[#131B2E] text-slate-400 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <SmartMediaImage
          wikiTitle={spot.wikiTitle}
          wikiLang="en"
          alt={spot.caption}
          caption={spot.caption}
          credit="Wikimedia Commons"
          aspectClass="aspect-[16/10]"
        />
      </div>

      {/* Verified YouTube Video Player with Exact Timestamps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Film className="h-4 w-4 text-teal-400" />
            Verifizierte Video-Clips
          </span>
          <div className="flex rounded-xl border border-white/10 bg-[#131B2E] p-1 text-xs">
            <button
              type="button"
              onClick={() => setVideoTab('karten')}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                videoTab === 'karten' ? 'bg-teal-500 text-[#0B0F19]' : 'text-slate-400 hover:text-white'
              }`}
            >
              USA in Karten
            </button>
            <button
              type="button"
              onClick={() => setVideoTab('terrax')}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                videoTab === 'terrax' ? 'bg-teal-500 text-[#0B0F19]' : 'text-slate-400 hover:text-white'
              }`}
            >
              Terra X Nordamerika
            </button>
          </div>
        </div>

        {videoTab === 'karten' ? (
          <SmartVideoPlayer
            key="usa-karten"
            videoId="BFkvGfedshA"
            start={15}
            end={150}
            title="USA - Überblick in Karten"
            channel="Die Welt in Karten"
            segmentLabel="Geografie, Lage & Naturräume im Überblick"
          />
        ) : (
          <SmartVideoPlayer
            key="usa-terrax"
            videoId="c3MpY34czkg"
            start={60}
            end={210}
            title="Terra X: Unsere Kontinente – Nordamerika"
            channel="Terra X Nature"
            segmentLabel="Kontinentale Landschaften & Relief"
          />
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  LESSON DEFINITION (auto-registered in /src/lessons/registry.ts)           */
/* -------------------------------------------------------------------------- */

const usaAtlasUndFlaggeLesson: LessonDefinition = {
  id: 'geografie-usa-atlas-und-flagge',
  slug: 'usa-atlas-und-flagge',
  categoryId: 'geografie',
  title: 'USA — Kontinent-Atlas, Superlative & „Stars and Stripes“',
  subtitle:
    'Von Hawaii über den Denali bis New York City: Erkunde die Geografie der Vereinigten Staaten per Transkontinental-Flug, Größenlabor und lebendiger Flaggen-Zeitreise.',
  eraOrContext: '50 Staaten · 1777–Heute',
  estimatedMinutes: 7,
  difficulty: 'Einstieg',
  xpReward: 220,
  heroMedia: {
    wikiTitle: 'Denali',
    wikiLang: 'en',
    alt: 'Der Denali (6.190 m) in Alaska über dem Wonder Lake',
    credit: 'Wikimedia Commons',
  },
  keyTakeaways: [
    'Die USA liegen zwischen Atlantik und Pazifik (Nachbarn: Kanada im Norden, Mexiko & Golf von Mexiko im Süden) und sind bei Fläche UND Einwohnerzahl (~340 Mio.) weltweit Platz 3.',
    'Hauptstadt ist Washington, D.C., die größte Stadt ist New York City (~8,4 Mio. Einwohner); Alaska ist der flächenmäßig größte, Hawaii der südwestlichste Bundesstaat.',
    'Längster Fluss ist der Missouri (knapp vor dem Mississippi); im Westen liegen die Rocky Mountains, im Osten die Appalachen, und in Alaska ragt der Denali (6.190 m) auf.',
    '„Stars and Stripes“ (1777): 13 Streifen (Gründerstaaten), 50 Sterne (Bundesstaaten), Rot = Tapferkeit, Weiß = Reinheit, Blau = Gerechtigkeit — gefeiert am 14. Juni („Flag Day“).',
  ],
  screens: [
    {
      id: 'nordamerika-atlas',
      badge: '01 · Visueller Atlas',
      title: 'Ein Kontinent zwischen Atlantik und Pazifik',
      subtitle:
        'Entdecke Nachbarn, Ozeane, Hauptstadt und die beiden Sonderstaaten Alaska und Hawaii direkt auf der echten Nordamerika-Karte.',
      component: Screen1NorthAmericaAtlas,
    },
    {
      id: 'superlative-labor',
      badge: '02 · Zahlen & Größenlabor',
      title: 'Platz 3 der Welt — und wie riesig ist Alaska?',
      subtitle:
        'Vergleiche Fläche und ~340 Millionen Einwohner im Weltranking, trenne Hauptstadt von Metropole und miss Alaska gegen Deutschland.',
      component: Screen2SuperlativesLab,
    },
    {
      id: 'coast-to-coast-radar',
      badge: '03 · Coast-to-Coast Flug-Radar',
      title: 'Transkontinental-Flug von Hawaii bis New York',
      subtitle:
        'Steuere dein Höhen-Radar von West nach Ost über Denali (6.190 m), Rocky Mountains, Missouri/Mississippi und die Appalachen.',
      component: Screen3CoastToCoastRadar,
    },
    {
      id: 'messlabor-denkfehler',
      badge: '04 · Labor & Denkfehler-Radar',
      title: 'Missouri vs. Mississippi & die 3 klassischen Irrtümer',
      subtitle:
        'Starte das Flusslängen-Rennen, prüfe das Höhenprofil und entlarve die häufigsten USA-Verwechslungen.',
      component: Screen4MeasureAndMythLab,
    },
    {
      id: 'stars-and-stripes',
      badge: '05 · Lebendige Flagge (1777–Heute)',
      title: 'Die „Stars and Stripes“ Zeitreise & Farb-Decoder',
      subtitle:
        'Sieh live, wie die Sterne von 13 auf 50 wachsen, isoliere Rot, Weiß und Blau — und hör die Fanfare zum Flag Day am 14. Juni.',
      component: Screen5FlagTimeMachine,
    },
    {
      id: 'medien-galerie',
      badge: '06 · Foto & Video',
      title: 'Amerikas Naturräume & Metropolen in Bild & Film',
      subtitle:
        'Klicke dich durch verifizierte Wikimedia-Aufnahmen und verankere das Wissen mit zwei kompakten Video-Ausschnitten.',
      component: Screen6MediaGallery,
    },
  ],
  quizzes: [
    {
      id: 'usa-quiz-dc-map',
      lessonId: 'geografie-usa-atlas-und-flagge',
      categoryId: 'geografie',
      type: 'map-pin',
      prompt: 'Setze deinen Pin auf Washington, D.C. — die Hauptstadt der USA!',
      hint: 'Suche an der US-Ostküste (Atlantikseite), etwas südwestlich von New York City.',
      explanation:
        'Washington, D.C. liegt an der Ostküste zwischen Maryland und Virginia — südwestlich der Metropole New York City.',
      target: {
        label: 'Washington, D.C.',
        lon: -77.0369,
        lat: 38.9072,
      },
      toleranceKm: 260,
      mapView: {
        center: [-95, 39],
        scale: 660,
      },
      contextPins: [
        { label: 'Los Angeles', lon: -118.2437, lat: 34.0522, muted: true },
        { label: 'Chicago', lon: -87.6298, lat: 41.8781, muted: true },
      ],
    },
    {
      id: 'usa-quiz-denali-height',
      lessonId: 'geografie-usa-atlas-und-flagge',
      categoryId: 'geografie',
      type: 'slider-estimate',
      prompt: 'Wie hoch ist der Denali (Mount McKinley) in Alaska — der höchste Berg der USA?',
      hint: 'Er ist mehr als doppelt so hoch wie die Zugspitze (2.962 m).',
      explanation:
        'Der Denali (Mount McKinley) in Alaska ist 6.190 Meter hoch und damit der höchste Berg der USA und ganz Nordamerikas.',
      min: 2500,
      max: 8000,
      step: 10,
      unit: 'm',
      targetValue: 6190,
      tolerance: 450,
    },
    {
      id: 'usa-quiz-connect',
      lessonId: 'geografie-usa-atlas-und-flagge',
      categoryId: 'geografie',
      type: 'visual-connect',
      prompt: 'Verbinde jeden Baustein aus Geografie & Flagge mit seiner richtigen Bedeutung.',
      explanation:
        '13 Streifen = Gründerstaaten, Rot = Tapferkeit, Missouri = längster Fluss (vor dem Mississippi), Hawaii = südwestlichster Bundesstaat im Pazifik.',
      leftColumnTitle: 'Begriff / Symbol',
      rightColumnTitle: 'Bedeutung / Fakt',
      pairs: [
        {
          id: 'stripes',
          left: '13 Streifen (Stars & Stripes)',
          leftSub: 'Eingeführt 1777',
          right: 'Die 13 Gründerstaaten der USA',
        },
        {
          id: 'red',
          left: 'Farbe Rot in der Flagge',
          leftSub: 'Neben Weiß & Blau',
          right: 'Steht symbolisch für Tapferkeit',
        },
        {
          id: 'missouri',
          left: 'Missouri',
          leftSub: 'Dicht vor dem Mississippi',
          right: 'Längster Fluss der USA',
        },
        {
          id: 'hawaii',
          left: 'Hawaii',
          leftSub: 'Inselgruppe im Pazifik',
          right: 'Südwestlichster der 50 Bundesstaaten',
        },
      ],
    },
    {
      id: 'usa-quiz-flag-hotspot',
      lessonId: 'geografie-usa-atlas-und-flagge',
      categoryId: 'geografie',
      type: 'image-hotspot',
      prompt: 'Klicke direkt auf den Bereich der US-Flagge, der für die 50 Bundesstaaten und Gerechtigkeit steht!',
      hint: 'Suche das blaue Feld mit den 50 Sternen.',
      explanation:
        'Das blaue Feld links oben (Canton) trägt die 50 Sterne für die 50 Bundesstaaten; die Farbe Blau steht für Gerechtigkeit. Die 13 Streifen stehen für die 13 Gründerstaaten.',
      image: {
        wikiTitle: 'Flag_of_the_United_States',
        wikiLang: 'en',
        alt: 'Offizielle Flagge der Vereinigten Staaten von Amerika (Stars and Stripes)',
        credit: 'Wikimedia Commons',
      },
      target: {
        x: 18,
        y: 27,
        radiusPct: 21,
        label: '50 Sterne auf Blau (Gerechtigkeit)',
      },
    },
  ],
}

export default usaAtlasUndFlaggeLesson
