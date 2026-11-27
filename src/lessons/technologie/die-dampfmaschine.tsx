import { motion } from 'framer-motion'
import {
  Building2,
  CheckCircle2,
  Cog,
  Factory,
  Film,
  Flame,
  GitBranch,
  MapPin,
  RefreshCw,
  Ship,
  TrainFront,
  Wind,
  XCircle,
  Zap,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { RealGeoMap } from '../../components/geo/RealGeoMap'
import { SmartMediaImage } from '../../components/media/SmartMediaImage'
import { SmartVideoPlayer } from '../../components/media/SmartVideoPlayer'
import type { LessonDefinition } from '../../types/yuno'

const MEDIA = {
  aeolipile:
    'https://upload.wikimedia.org/wikipedia/commons/b/b1/Aeolipile_illustration_alternate_scan.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled',
  newcomen:
    'https://upload.wikimedia.org/wikipedia/commons/1/16/Newcomen_atmospheric_engine_animation.gif?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled',
  wattPortrait:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/15/Watt_James_von_Breda.jpg/960px-Watt_James_von_Breda.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  wattEngine:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Maquina_vapor_Watt_ETSIIM.jpg/960px-Maquina_vapor_Watt_ETSIIM.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  locomotive:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Number_4468_Mallard_in_York.jpg/960px-Number_4468_Mallard_in_York.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  turbine:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Dampfturbine_Laeufer01.jpg/960px-Dampfturbine_Laeufer01.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 1: Vor dem Dampf & Ursprung in England (Echte zoombare Karte)       */
/* -------------------------------------------------------------------------- */

const PRE_STEAM_DRIVES = [
  {
    id: 'wasser',
    title: 'Wasserkraft',
    limit: 'Nur direkt an fließenden Flüssen möglich — bei Dürre oder Frost steht alles still.',
  },
  {
    id: 'wind',
    title: 'Windkraft',
    limit: 'Unberechenbar: Bei Windstille dreht sich kein einziges Mühlrad.',
  },
  {
    id: 'tiere',
    title: 'Tiere & Muskelkraft',
    limit: 'Begrenzte Stärke, brauchen Pausen, Futter und können keine großen Fabriken antreiben.',
  },
  {
    id: 'antike',
    title: 'Altes Griechenland (Antike)',
    limit: 'Erste einfache Versuche mit heißem Dampf (Heronsball) — aber noch ohne praktische Nutzung.',
  },
]

function Screen1OriginsAtlas() {
  const [driveId, setDriveId] = useState('antike')
  const activeDrive = PRE_STEAM_DRIVES.find((d) => d.id === driveId) ?? PRE_STEAM_DRIVES[0]

  return (
    <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
      <RealGeoMap
        center={[10, 47.5]}
        scale={780}
        markers={[
          {
            id: 'england',
            label: 'England (1712 · 1769 · 1814)',
            sublabel: 'Newcomen, Watt & 1. Dampflok',
            lon: -1.8,
            lat: 52.8,
            color: '#0071E3',
            pulse: true,
            active: true,
          },
          {
            id: 'greece',
            label: 'Altes Griechenland',
            sublabel: 'Erste Dampfversuche (Antike)',
            lon: 23.7,
            lat: 38.0,
            color: '#D97706',
          },
        ]}
        routes={[
          {
            id: 'idea-arc',
            points: [
              [23.7, 38.0],
              [12.0, 46.5],
              [-1.8, 52.8],
            ],
            color: '#0071E3',
            dashed: true,
            strokeWidth: 2.6,
          },
        ]}
        caption="Von ersten Dampfversuchen im Alten Griechenland zum Durchbruch in England (zoom- und verschiebbar)."
      />

      <div className="flex flex-col justify-between gap-4">
        <SmartMediaImage
          src={driveId === 'antike' ? MEDIA.aeolipile : MEDIA.wattPortrait}
          wikiTitle={driveId === 'antike' ? 'Aeolipile' : 'James Watt'}
          wikiLang="en"
          alt={driveId === 'antike' ? 'Antike Dampfkugel (Heronsball)' : 'Porträt von James Watt'}
          caption={
            driveId === 'antike'
              ? 'Antiker Vorläufer im Alten Griechenland: erste einfache Versuche mit heißem Dampf.'
              : 'James Watt verbesserte ab 1769 die Dampfmaschine entscheidend.'
          }
          credit="Wikimedia Commons"
          aspectClass="aspect-[4/3]"
        />

        <div className="apple-card space-y-3 rounded-3xl p-5">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#0369A1] uppercase">
            <Wind className="h-3.5 w-3.5" />
            Antriebe vor der Dampfmaschine
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRE_STEAM_DRIVES.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDriveId(d.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  driveId === d.id
                    ? 'bg-[#1D1D1F] text-white'
                    : 'bg-[#F2F2F7] text-[#515154] hover:bg-[#E5E5EA]'
                }`}
              >
                {d.title}
              </button>
            ))}
          </div>
          <p className="rounded-2xl bg-[#F5F5F7] p-3.5 text-xs leading-relaxed font-medium text-[#1D1D1F]">
            <strong>{activeDrive.title}:</strong> {activeDrive.limit}
          </p>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 2 (Wildcard C): Live-Schnittmodell & Explosionszeichnung            */
/* -------------------------------------------------------------------------- */

type EnginePartId = 'kessel' | 'dampf' | 'kolben' | 'kondensator' | 'schwungrad'

const ENGINE_PARTS: Record<EnginePartId, { title: string; role: string }> = {
  kessel: {
    title: '1. Kessel & Kohlefeuer',
    role: 'Kohle erhitzt Wasser im geschlossenen Kessel, bis es kräftig siedet und unter Druck verdampft.',
  },
  dampf: {
    title: '2. Heißer Dampf',
    role: 'Heißer Dampf dehnt sich gewaltig aus und transportiert die Wärmeenergie direkt in den Zylinder.',
  },
  kolben: {
    title: '3. Zylinder & Kolben',
    role: 'Der Dampfdruck schiebt den Kolben kraftvoll hin und her — hier wird Wärmeenergie zu Bewegung!',
  },
  kondensator: {
    title: '4. Separater Kondensator (James Watt, 1769)',
    role: 'Watts Geniestreich: Dampf kühlt außerhalb des Zylinders ab. Der Zylinder bleibt heiß — die Maschine wird viel sparsamer und stärker.',
  },
  schwungrad: {
    title: '5. Schwungrad & Drehbewegung',
    role: 'Wandelt das Auf-und-Ab in gleichmäßige Rotation um — perfekt für Spinnmaschinen, Webstühle, Schiffe und Eisenbahnen.',
  },
}

function Screen2LiveSteamSimulator() {
  const [heat, setHeat] = useState(65) // 0..100%
  const [mode, setMode] = useState<'newcomen' | 'watt'>('watt')
  const [selectedPart, setSelectedPart] = useState<EnginePartId>('kondensator')
  const [angle, setAngle] = useState(0)
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)

  // Live animation loop proportional to heat & engine efficiency
  useEffect(() => {
    const speedMultiplier = mode === 'watt' ? 1.55 : 0.72
    const step = (ts: number) => {
      if (lastTimeRef.current !== null && heat > 5) {
        const dt = Math.min(0.05, (ts - lastTimeRef.current) / 1000)
        const radPerSec = (heat / 100) * 4.4 * speedMultiplier
        setAngle((a) => (a + radPerSec * dt) % (Math.PI * 2))
      }
      lastTimeRef.current = ts
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      lastTimeRef.current = null
    }
  }, [heat, mode])

  const pistonOffset = Math.sin(angle) * 26 // -26..+26 px
  const wheelDeg = (angle * 180) / Math.PI
  const powerKw = Math.round(heat * (mode === 'watt' ? 1.8 : 0.55))
  const coalPerHour = Math.round(heat * (mode === 'watt' ? 0.45 : 1.35))

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        {/* Interactive Live Animated Steam Engine Cross-Section */}
        <div className="apple-card space-y-4 rounded-3xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex rounded-full bg-[#EFEFF4] p-1 text-xs">
              <button
                type="button"
                onClick={() => setMode('newcomen')}
                className={`rounded-full px-3.5 py-1.5 font-bold transition ${
                  mode === 'newcomen' ? 'bg-white text-[#1D1D1F] shadow-xs' : 'text-[#6E6E73]'
                }`}
              >
                Newcomen (1712)
              </button>
              <button
                type="button"
                onClick={() => setMode('watt')}
                className={`rounded-full px-3.5 py-1.5 font-bold transition ${
                  mode === 'watt' ? 'bg-[#0071E3] text-white shadow-xs' : 'text-[#6E6E73]'
                }`}
              >
                James Watt (1769)
              </button>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs font-bold">
              <span className="text-[#0071E3]">{powerKw} PS-Index</span>
              <span className="text-[#6E6E73]">·</span>
              <span className={mode === 'watt' ? 'text-[#15803D]' : 'text-[#DC2626]'}>
                Kohle: {coalPerHour} kg/h
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-[#F5F5F7]">
            <svg viewBox="0 0 640 310" className="h-auto w-full select-none" role="img" aria-label="Animiertes Schnittmodell einer Dampfmaschine">
              {/* Boiler */}
              <g
                onClick={() => setSelectedPart('kessel')}
                className="cursor-pointer"
              >
                <rect
                  x={42}
                  y={115}
                  width={136}
                  height={120}
                  rx={20}
                  fill="#FFFFFF"
                  stroke={selectedPart === 'kessel' ? '#0071E3' : '#CBD5E1'}
                  strokeWidth={selectedPart === 'kessel' ? 3.5 : 2}
                />
                {/* Water inside boiler */}
                <rect x={48} y={175} width={124} height={54} rx={12} fill="#BAE6FD" />
                {/* Steam cloud inside top of boiler */}
                <ellipse
                  cx={110}
                  cy={148}
                  rx={44}
                  ry={18}
                  fill="#E2E8F0"
                  opacity={Math.max(0.2, heat / 100)}
                />
                {/* Coal fire below boiler */}
                <rect x={54} y={244} width={112} height={24} rx={10} fill="#1D1D1F" />
                <ellipse
                  cx={110}
                  cy={246}
                  rx={38 * Math.max(0.25, heat / 100)}
                  ry={14 * Math.max(0.25, heat / 100)}
                  fill="#FF6B00"
                  opacity={Math.max(0.18, heat / 100)}
                />
                <text x={110} y={288} textAnchor="middle" className="fill-[#1D1D1F] text-[11px] font-bold">
                  1. Kessel &amp; Kohle
                </text>
              </g>

              {/* Steam Pipe */}
              <g onClick={() => setSelectedPart('dampf')} className="cursor-pointer">
                <path
                  d="M 178 145 L 258 145"
                  stroke={selectedPart === 'dampf' ? '#0071E3' : '#94A3B8'}
                  strokeWidth={14}
                  strokeLinecap="round"
                />
                <path
                  d="M 178 145 L 258 145"
                  stroke="#FFFFFF"
                  strokeWidth={6}
                  strokeDasharray="10 10"
                  strokeDashoffset={-angle * 18}
                />
                <text x={218} y={126} textAnchor="middle" className="fill-[#0369A1] text-[10px] font-bold">
                  2. Dampf
                </text>
              </g>

              {/* Cylinder & Moving Piston */}
              <g onClick={() => setSelectedPart('kolben')} className="cursor-pointer">
                <rect
                  x={258}
                  y={90}
                  width={92}
                  height={145}
                  rx={14}
                  fill="#FFFFFF"
                  stroke={selectedPart === 'kolben' ? '#0071E3' : '#CBD5E1'}
                  strokeWidth={selectedPart === 'kolben' ? 3.5 : 2}
                />
                {/* Steam pressure fill under/above piston */}
                <rect
                  x={264}
                  y={160 + pistonOffset}
                  width={80}
                  height={Math.max(8, 69 - pistonOffset)}
                  rx={6}
                  fill={mode === 'watt' ? '#E0F2FE' : '#FEE2E2'}
                />
                {/* Piston Head */}
                <rect
                  x={265}
                  y={146 + pistonOffset}
                  width={78}
                  height={18}
                  rx={5}
                  fill="#1D1D1F"
                />
                {/* Piston Rod */}
                <line
                  x1={304}
                  y1={146 + pistonOffset}
                  x2={304}
                  y2={56 + pistonOffset * 0.6}
                  stroke="#515154"
                  strokeWidth={6}
                  strokeLinecap="round"
                />
                <text x={304} y={256} textAnchor="middle" className="fill-[#1D1D1F] text-[11px] font-bold">
                  3. Kolben
                </text>
              </g>

              {/* Separate Condenser (Highlighted in Watt Mode!) */}
              <g
                onClick={() => setSelectedPart('kondensator')}
                className="cursor-pointer"
                opacity={mode === 'watt' ? 1 : 0.25}
              >
                <path d="M 350 205 L 405 205" stroke="#0071E3" strokeWidth={6} />
                <rect
                  x={405}
                  y={175}
                  width={68}
                  height={62}
                  rx={12}
                  fill="#E8F2FC"
                  stroke={selectedPart === 'kondensator' ? '#0071E3' : '#93C5FD'}
                  strokeWidth={selectedPart === 'kondensator' ? 3 : 2}
                />
                <text x={439} y={204} textAnchor="middle" className="fill-[#0071E3] text-[9.5px] font-bold">
                  Kondensator
                </text>
                <text x={439} y={219} textAnchor="middle" className="fill-[#0369A1] text-[8.5px] font-semibold">
                  {mode === 'watt' ? 'Aktiv (1769)' : 'Fehlt (1712)'}
                </text>
              </g>

              {/* Rocker Beam */}
              <line
                x1={304}
                y1={56 + pistonOffset * 0.6}
                x2={515}
                y2={56 - pistonOffset * 0.6}
                stroke="#1D1D1F"
                strokeWidth={9}
                strokeLinecap="round"
              />
              <circle cx={410} cy={56} r={8} fill="#0071E3" />
              <line x1={410} y1={56} x2={410} y2={135} stroke="#CBD5E1" strokeWidth={8} strokeLinecap="round" />

              {/* Connecting Rod to Flywheel */}
              <line
                x1={515}
                y1={56 - pistonOffset * 0.6}
                x2={530 + Math.cos(angle) * 32}
                y2={185 + Math.sin(angle) * 32}
                stroke="#515154"
                strokeWidth={5}
                strokeLinecap="round"
              />

              {/* Spinning Flywheel */}
              <g
                onClick={() => setSelectedPart('schwungrad')}
                className="cursor-pointer"
                transform={`translate(530, 185)`}
              >
                <g transform={`rotate(${wheelDeg})`}>
                  <circle
                    r={52}
                    fill="none"
                    stroke={selectedPart === 'schwungrad' ? '#0071E3' : '#1D1D1F'}
                    strokeWidth={10}
                  />
                  <line x1={-48} y1={0} x2={48} y2={0} stroke="#6E6E73" strokeWidth={5} />
                  <line x1={0} y1={-48} x2={0} y2={48} stroke="#6E6E73" strokeWidth={5} />
                  <circle cx={32} cy={0} r={6} fill="#FF6B00" />
                </g>
                <circle r={9} fill="#1D1D1F" />
              </g>
              <text x={530} y={260} textAnchor="middle" className="fill-[#1D1D1F] text-[11px] font-bold">
                5. Schwungrad
              </text>
            </svg>
          </div>

          {/* Coal Heat Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 font-bold text-[#1D1D1F]">
                <Flame className="h-4 w-4 text-[#FF6B00]" />
                Kohle-Feuer &amp; Dampfdruck
              </span>
              <span className="font-mono font-bold text-[#FF6B00]">{heat}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={heat}
              onChange={(e) => setHeat(Number(e.target.value))}
              className="yuno-slider w-full"
              style={{ ['--slider-accent' as string]: '#FF6B00' }}
            />
          </div>
        </div>

        {/* Interactive Exploded-Parts Inspector */}
        <div className="apple-card flex flex-col justify-between gap-4 rounded-3xl p-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#0071E3] uppercase">
              <Cog className="h-3.5 w-3.5" />
              Bauteil-Scanner (Klicke ein Teil an)
            </span>

            <div className="space-y-2">
              {(Object.keys(ENGINE_PARTS) as EnginePartId[]).map((partId) => {
                const active = selectedPart === partId
                return (
                  <button
                    key={partId}
                    type="button"
                    onClick={() => setSelectedPart(partId)}
                    className={`w-full rounded-2xl border p-3.5 text-left transition ${
                      active
                        ? 'border-[#0071E3] bg-[#E8F2FC]'
                        : 'border-black/[0.06] bg-[#F5F5F7] hover:bg-[#EFEFF4]'
                    }`}
                  >
                    <p className="text-xs font-extrabold text-[#1D1D1F]">
                      {ENGINE_PARTS[partId].title}
                    </p>
                    {active && (
                      <p className="mt-1 text-xs leading-relaxed font-medium text-[#3A3A3C]">
                        {ENGINE_PARTS[partId].role}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-[#F0FDF4] p-3.5 text-xs leading-relaxed font-medium text-[#14532D]">
            <strong>Kernprinzip:</strong> Die Dampfmaschine wandelt die <strong>Energie von heißem Dampf in Bewegung</strong> um.
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 3 (Option B): Effizienz-Labor & Bergwerk-Rückkopplungsschleife      */
/* -------------------------------------------------------------------------- */

const EFFICIENCY_DATA = [
  { name: 'Newcomen (1712)', Leistung: 25, Effizienz: 20 },
  { name: 'James Watt (1769)', Leistung: 85, Effizienz: 78 },
]

const MINE_LOOP_STEPS = [
  '1. Tiefes Kohlebergwerk in England läuft voll Grundwasser.',
  '2. Thomas Newcomens Dampfmaschine (1712) pumpt das Wasser ab.',
  '3. Arbeiter können viel tiefer und einfacher Kohle abbauen.',
  '4. Mehr Kohle ermöglicht noch mehr Dampfmaschinen — der Motor der Industriellen Revolution!',
]

function Screen3EfficiencyAndMineLoop() {
  const [loopStep, setLoopStep] = useState(0)

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="apple-card flex flex-col justify-between space-y-5 rounded-3xl p-6">
        <div>
          <span className="font-mono text-[11px] font-bold text-[#0071E3] uppercase">
            1712 vs. 1769 · Effizienz-Sprung
          </span>
          <h3 className="font-apple-display mt-1 text-lg text-[#1D1D1F]">
            Warum James Watt den Durchbruch brachte
          </h3>
          <p className="mt-1 text-xs font-medium text-[#515154]">
            Mit derselben Menge Kohle lieferte Watts Maschine ab 1769 ein Vielfaches an Kraft — und wurde deutlich sparsamer.
          </p>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={EFFICIENCY_DATA} margin={{ top: 8, right: 16, left: -12, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#1D1D1F', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#86868B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: 'rgba(0,0,0,0.08)',
                  borderRadius: '14px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="Leistung" name="Leistungs-Index" radius={[8, 8, 0, 0]}>
                {EFFICIENCY_DATA.map((d, i) => (
                  <Cell key={d.name} fill={i === 1 ? '#0071E3' : '#94A3B8'} />
                ))}
              </Bar>
              <Bar dataKey="Effizienz" name="Kohle-Sparsamkeit" radius={[8, 8, 0, 0]}>
                {EFFICIENCY_DATA.map((d, i) => (
                  <Cell key={d.name} fill={i === 1 ? '#16A34A' : '#CBD5E1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Interactive Coal Mine Feedback Loop */}
        <div className="space-y-3 rounded-2xl bg-[#F5F5F7] p-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D1D1F]">
              <RefreshCw className="h-3.5 w-3.5 text-[#0071E3]" />
              Bergwerk-Kreislauf (1712)
            </span>
            <button
              type="button"
              onClick={() => setLoopStep((s) => (s + 1) % MINE_LOOP_STEPS.length)}
              className="rounded-full bg-[#1D1D1F] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#0071E3]"
            >
              Nächster Schritt →
            </button>
          </div>
          <div className="grid gap-1.5">
            {MINE_LOOP_STEPS.map((txt, idx) => (
              <button
                key={txt}
                type="button"
                onClick={() => setLoopStep(idx)}
                className={`rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${
                  loopStep === idx
                    ? 'bg-white text-[#0071E3] shadow-xs ring-1 ring-[#0071E3]/30'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                {txt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Authentic Newcomen Animation + Watt Engine */}
      <div className="flex flex-col justify-between gap-4">
        <SmartMediaImage
          src={MEDIA.newcomen}
          wikiTitle="Newcomen atmospheric engine"
          wikiLang="en"
          alt="Animation der Newcomen-Dampfmaschine von 1712"
          caption="Funktionsprinzip von Thomas Newcomens Bergwerkspumpe (1712) — links pumpt das Gestänge Wasser aus dem Schacht."
          credit="Wikimedia Commons"
          aspectClass="aspect-[4/3]"
        />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 4 (Wildcard C): „Wo darf deine Fabrik stehen?“ (1700 vs. 1769+)     */
/* -------------------------------------------------------------------------- */

interface SiteOption {
  id: string
  name: string
  sub: string
  worksBefore1769: boolean
  reasonBefore: string
  reasonAfter: string
}

const FACTORY_SITES: SiteOption[] = [
  {
    id: 'fluss',
    name: 'Am reißenden Fluss',
    sub: 'Abgelegene Talschlucht',
    worksBefore1769: true,
    reasonBefore: 'Funktioniert! Das Wasserrad treibt Webstühle an — aber weit weg von Kunden und Straßen.',
    reasonAfter: 'Funktioniert weiterhin, doch du bist nicht mehr an abgelegene Flusstäler gefesselt.',
  },
  {
    id: 'huegel',
    name: 'Auf dem Windhügel',
    sub: 'Wetterabhängig',
    worksBefore1769: true,
    reasonBefore: 'Funktioniert nur bei Wind — bei Flaute stehen alle Maschinen still.',
    reasonAfter: 'Unnötig geworden: Dampf liefert rund um die Uhr gleichmäßige Kraft.',
  },
  {
    id: 'stadt',
    name: 'Mitten in der Stadt',
    sub: 'Viele Arbeitskräfte & Kunden',
    worksBefore1769: false,
    reasonBefore: 'Geht vor 1769 nicht! Ohne Fluss oder Windrad gibt es hier keinen starken Antrieb für Fabriken.',
    reasonAfter: 'Volltreffer! Dank James Watts Dampfmaschine laufen Spinnmaschinen & Webstühle mitten in der Stadt — Menschen ziehen in die Städte!',
  },
  {
    id: 'bahnhof',
    name: 'Am Eisenbahn-Knoten (ab 1814)',
    sub: 'Schneller Güter- & Personentransport',
    worksBefore1769: false,
    reasonBefore: 'Vor 1769 unmöglich: Weder Fabrikmotoren noch Dampflokomotiven existieren.',
    reasonAfter: 'Perfekt! Fabriken produzieren viel mehr Waren, und Dampflokomotiven (ab 1814) & Dampfschiffe verteilen sie blitzschnell.',
  },
]

function Screen4FactoryLocationGame() {
  const [era, setEra] = useState<'before' | 'after'>('before')
  const [selectedSiteId, setSelectedSiteId] = useState<string>('stadt')

  const site = FACTORY_SITES.find((s) => s.id === selectedSiteId) ?? FACTORY_SITES[2]
  const worksNow = era === 'after' ? true : site.worksBefore1769

  return (
    <div className="apple-card space-y-6 rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#0071E3] uppercase">
            <Factory className="h-3.5 w-3.5" />
            Standort-Simulator · Gesellschaftlicher Umbruch
          </span>
          <h3 className="font-apple-black mt-1 text-2xl text-[#1D1D1F]">
            Wo kannst du deine Textilfabrik bauen?
          </h3>
        </div>

        <div className="flex rounded-full bg-[#EFEFF4] p-1 text-xs">
          <button
            type="button"
            onClick={() => setEra('before')}
            className={`rounded-full px-4 py-1.5 font-bold transition ${
              era === 'before' ? 'bg-white text-[#1D1D1F] shadow-xs' : 'text-[#6E6E73]'
            }`}
          >
            Vor 1769 (Wasser &amp; Wind)
          </button>
          <button
            type="button"
            onClick={() => setEra('after')}
            className={`rounded-full px-4 py-1.5 font-bold transition ${
              era === 'after' ? 'bg-[#0071E3] text-white shadow-xs' : 'text-[#6E6E73]'
            }`}
          >
            Ab 1769 (James Watt)
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FACTORY_SITES.map((opt) => {
          const ok = era === 'after' ? true : opt.worksBefore1769
          const active = opt.id === selectedSiteId
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedSiteId(opt.id)}
              className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition ${
                active
                  ? ok
                    ? 'border-[#16A34A] bg-[#F0FDF4]'
                    : 'border-[#DC2626] bg-[#FEF2F2]'
                  : 'border-black/[0.08] bg-[#F5F5F7] hover:bg-[#EFEFF4]'
              }`}
            >
              <div className="flex items-center justify-between">
                <MapPin className={`h-4 w-4 ${ok ? 'text-[#16A34A]' : 'text-[#DC2626]'}`} />
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    ok ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEE2E2] text-[#DC2626]'
                  }`}
                >
                  {ok ? 'Möglich' : 'Blockiert'}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-sm font-extrabold text-[#1D1D1F]">{opt.name}</p>
                <p className="mt-0.5 text-[11px] font-medium text-[#6E6E73]">{opt.sub}</p>
              </div>
            </button>
          )
        })}
      </div>

      <motion.div
        key={`${era}-${site.id}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-start gap-3 rounded-2xl border p-4 text-sm font-medium ${
          worksNow
            ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#14532D]'
            : 'border-[#FECACA] bg-[#FEF2F2] text-[#7F1D1D]'
        }`}
      >
        {worksNow ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#16A34A]" />
        ) : (
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#DC2626]" />
        )}
        <div>
          <p className="font-extrabold">
            {site.name} ({era === 'before' ? 'Vor 1769' : 'Mit James Watts Dampfmaschine'}):
          </p>
          <p className="mt-0.5 text-xs leading-relaxed">
            {era === 'before' ? site.reasonBefore : site.reasonAfter}
          </p>
        </div>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-[#F5F5F7] p-4">
          <Factory className="h-4 w-4 text-[#0071E3]" />
          <p className="mt-2 text-xs font-extrabold text-[#1D1D1F]">Spinnmaschinen &amp; Webstühle</p>
          <p className="mt-0.5 text-[11px] text-[#6E6E73]">
            Fabriken produzieren viel mehr Waren als zuvor — unabhängig von Flüssen.
          </p>
        </div>
        <div className="rounded-2xl bg-[#F5F5F7] p-4">
          <Building2 className="h-4 w-4 text-[#FF6B00]" />
          <p className="mt-2 text-xs font-extrabold text-[#1D1D1F]">Zuzug in die Städte</p>
          <p className="mt-0.5 text-[11px] text-[#6E6E73]">
            Die Arbeit verändert sich grundlegend: Menschen ziehen vom Land in die neuen Industriestädte.
          </p>
        </div>
        <div className="rounded-2xl bg-[#F5F5F7] p-4">
          <TrainFront className="h-4 w-4 text-[#15803D]" />
          <p className="mt-2 text-xs font-extrabold text-[#1D1D1F]">Schiffe &amp; Eisenbahn (1814)</p>
          <p className="mt-0.5 text-[11px] text-[#6E6E73]">
            Güter und Menschen reisen dank Dampfschiffen und der ersten Dampflok (1814) viel schneller.
          </p>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 5: Kausal-Zeitstrahl & Energie-Wandler bis heute                    */
/* -------------------------------------------------------------------------- */

const TIMELINE_NODES = [
  {
    id: 'antike',
    year: 'Antike',
    title: 'Altes Griechenland',
    text: 'Erste einfache Versuche zeigen, dass heißer Dampf Bewegung erzeugen kann — noch ohne industriellen Einsatz.',
  },
  {
    id: '1712',
    year: '1712',
    title: 'Thomas Newcomen (England)',
    text: 'Erste brauchbare Dampfmaschine: pumpt Wasser aus Bergwerken und erleichtert den Kohleabbau.',
  },
  {
    id: '1769',
    year: 'ab 1769',
    title: 'James Watt (Durchbruch)',
    text: 'Sparsamer und stärker: macht Fabriken unabhängig von Flüssen und Wind, treibt Spinnmaschinen und Webstühle an.',
  },
  {
    id: '1814',
    year: '1814',
    title: 'Erste Dampflokomotive',
    text: 'Fährt erstmals in England — Güter und Menschen werden revolutionär schneller transportiert.',
  },
  {
    id: 'heute',
    year: 'Heute',
    title: 'Strom aus Kraftwerken',
    text: 'Das Prinzip lebt weiter: Moderne Kraftwerke nutzen heißen Dampf (Dampfturbinen) zur Stromerzeugung!',
  },
]

const APPLICATIONS = [
  { id: 'fabrik', icon: Factory, label: 'Fabriken', desc: 'Trieb Spinnmaschinen, Webstühle und Werkzeugmaschinen direkt vor Ort an.' },
  { id: 'schiff', icon: Ship, label: 'Dampfschiffe', desc: 'Machte die Schifffahrt auf Flüssen und Meeren unabhängig vom Wind.' },
  { id: 'lok', icon: TrainFront, label: 'Eisenbahn (1814)', desc: 'Verband Städte und Fabriken für schnellen Güter- und Personentransport.' },
  { id: 'strom', icon: Zap, label: 'Kraftwerke heute', desc: 'Erzeugen bis heute mit heißem Dampf über Turbinen einen Großteil unseres Stroms.' },
]

function Screen5TimelineAndToday() {
  const [activeId, setActiveId] = useState('1769')
  const [appId, setAppId] = useState('strom')

  const activeNode = TIMELINE_NODES.find((n) => n.id === activeId) ?? TIMELINE_NODES[2]
  const activeApp = APPLICATIONS.find((a) => a.id === appId) ?? APPLICATIONS[3]

  return (
    <div className="space-y-5">
      <div className="apple-card space-y-4 rounded-3xl p-6">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#0071E3] uppercase">
          <GitBranch className="h-3.5 w-3.5" />
          Zeitstrahl des Dampfes (Anklickbar)
        </span>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {TIMELINE_NODES.map((node) => {
            const active = node.id === activeId
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setActiveId(node.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? 'border-[#0071E3] bg-[#E8F2FC]'
                    : 'border-black/[0.06] bg-[#F5F5F7] hover:bg-[#EFEFF4]'
                }`}
              >
                <span className="font-mono text-xs font-extrabold text-[#0071E3]">{node.year}</span>
                <p className="mt-1 text-sm font-extrabold text-[#1D1D1F]">{node.title}</p>
              </button>
            )
          })}
        </div>

        <div className="rounded-2xl bg-[#F5F5F7] p-4">
          <p className="font-mono text-xs font-bold text-[#0071E3]">{activeNode.year} · {activeNode.title}</p>
          <p className="mt-1 text-sm leading-relaxed font-medium text-[#1D1D1F]">{activeNode.text}</p>
        </div>
      </div>

      {/* 4 Applications of Steam */}
      <div className="apple-card space-y-4 rounded-3xl p-6">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#15803D] uppercase">
          <Zap className="h-3.5 w-3.5" />
          Ein Prinzip — vier Revolutionen (Heißer Dampf → Bewegung / Strom)
        </span>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {APPLICATIONS.map((app) => {
            const Icon = app.icon
            const active = app.id === appId
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => setAppId(app.id)}
                className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition ${
                  active
                    ? 'border-[#1D1D1F] bg-[#1D1D1F] text-white'
                    : 'border-black/[0.06] bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#EFEFF4]'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-extrabold">{app.label}</span>
              </button>
            )
          })}
        </div>
        <p className="text-sm font-medium text-[#515154]">
          <strong className="text-[#1D1D1F]">{activeApp.label}:</strong> {activeApp.desc}
        </p>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 6: Historische Originale & Verifizierte Erklärvideos                */
/* -------------------------------------------------------------------------- */

const GALLERY = [
  {
    id: 'watt',
    label: 'Watt-Dampfmaschine',
    src: MEDIA.wattEngine,
    wikiTitle: 'Watt steam engine',
    caption: 'Original-Bauart einer James-Watt-Dampfmaschine mit großem Schwungrad.',
  },
  {
    id: 'lok',
    label: 'Dampflokomotive',
    src: MEDIA.locomotive,
    wikiTitle: 'Steam locomotive',
    caption: 'Britische Dampflokomotive — ausgehend von der ersten Dampflok 1814 in England.',
  },
  {
    id: 'turbine',
    label: 'Kraftwerk heute',
    src: MEDIA.turbine,
    wikiTitle: 'Steam turbine',
    caption: 'Moderne Dampfturbine: Auch heute erzeugt heißer Dampf Strom in Kraftwerken.',
  },
]

function Screen6GalleryAndVideo() {
  const [itemIdx, setItemIdx] = useState(0)
  const [videoTab, setVideoTab] = useState<'watt' | 'bahn'>('watt')
  const item = GALLERY[itemIdx]

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {GALLERY.map((g, idx) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setItemIdx(idx)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                itemIdx === idx
                  ? 'bg-[#1D1D1F] text-white'
                  : 'bg-white text-[#515154] ring-1 ring-black/[0.08] hover:text-[#1D1D1F]'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        <SmartMediaImage
          src={item.src}
          wikiTitle={item.wikiTitle}
          wikiLang="en"
          alt={item.caption}
          caption={item.caption}
          credit="Wikimedia Commons"
          aspectClass="aspect-[4/3]"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D1D1F]">
            <Film className="h-4 w-4 text-[#0071E3]" />
            Erklärvideos (Deutsch)
          </span>
          <div className="flex rounded-full bg-[#EFEFF4] p-1 text-xs">
            <button
              type="button"
              onClick={() => setVideoTab('watt')}
              className={`rounded-full px-3 py-1 font-bold transition ${
                videoTab === 'watt' ? 'bg-white text-[#1D1D1F] shadow-xs' : 'text-[#6E6E73]'
              }`}
            >
              James Watt
            </button>
            <button
              type="button"
              onClick={() => setVideoTab('bahn')}
              className={`rounded-full px-3 py-1 font-bold transition ${
                videoTab === 'bahn' ? 'bg-white text-[#1D1D1F] shadow-xs' : 'text-[#6E6E73]'
              }`}
            >
              Zur Eisenbahn
            </button>
          </div>
        </div>

        {videoTab === 'watt' ? (
          <SmartVideoPlayer
            key="dampf-watt"
            videoId="7qB0hkzRopM"
            start={20}
            end={165}
            title="Industrielle Revolution: Die Dampfmaschine des James Watt"
            channel="Brainstone"
            segmentLabel="Von Newcomen zu James Watts Durchbruch"
          />
        ) : (
          <SmartVideoPlayer
            key="dampf-bahn"
            videoId="y76kBUzSV4M"
            start={30}
            end={175}
            title="Von der Dampfmaschine zur Eisenbahn | DIE INDUSTRIELLE REVOLUTION"
            channel="EINFACH GESCHICHTE"
            segmentLabel="Fabriken, Dampflokomotive & gesellschaftlicher Wandel"
          />
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  LESSON DEFINITION                                                          */
/* -------------------------------------------------------------------------- */

const dieDampfmaschineLesson: LessonDefinition = {
  id: 'technologie-die-dampfmaschine',
  slug: 'die-dampfmaschine',
  categoryId: 'technologie',
  title: 'Die Dampfmaschine — Motor der Industriellen Revolution',
  subtitle:
    'Von Thomas Newcomens Bergwerkspumpe (1712) über James Watts Durchbruch (1769) und die erste Dampflokomotive (1814) bis zu modernen Kraftwerken heute.',
  eraOrContext: '1712 · 1769 · 1814',
  estimatedMinutes: 7,
  difficulty: 'Einstieg',
  xpReward: 230,
  heroMedia: {
    src: MEDIA.wattEngine,
    wikiTitle: 'Watt steam engine',
    wikiLang: 'en',
    alt: 'Historische James-Watt-Dampfmaschine',
    credit: 'Wikimedia Commons',
  },
  keyTakeaways: [
    'Die Dampfmaschine wandelt die Energie von heißem Dampf in Bewegung um und löste Wasser, Wind und Tiere als Hauptantrieb ab.',
    'Erste einfache Dampfversuche gab es im Alten Griechenland; die erste brauchbare Maschine baute Thomas Newcomen 1712 in England zum Wasserpumpen aus Bergwerken.',
    'James Watt verbesserte sie ab 1769 entscheidend (sparsamer & stärker): Fabriken wurden unabhängig von Flüssen/Wind (Spinnmaschinen, Webstühle), Menschen zogen in die Städte.',
    '1814 fuhr in England die erste Dampflokomotive; auch heute wird Dampf in Kraftwerken zur Stromerzeugung genutzt.',
  ],
  screens: [
    {
      id: 'ursprung-england',
      badge: '01 · Vor dem Dampf & Ursprung',
      title: 'Von Wasser, Wind & Antike zum Durchbruch in England',
      subtitle:
        'Entdecke auf der zoombaren Karte, warum die Dampfmaschine alle bisherigen Antriebe ablöste.',
      component: Screen1OriginsAtlas,
    },
    {
      id: 'live-schnittmodell',
      badge: '02 · Live-Dampfmaschinen-Cockpit',
      title: 'Wie heißer Dampf zu Bewegung wird',
      subtitle:
        'Steuere die Kohle-Hitze per Slider, schalte live zwischen Newcomen (1712) und James Watt (1769) um und untersuche jedes Bauteil.',
      component: Screen2LiveSteamSimulator,
    },
    {
      id: 'effizienz-bergwerk',
      badge: '03 · Effizienz-Labor & Bergwerk',
      title: '1712 vs. 1769: Bergwerkspumpe & Kohle-Kreislauf',
      subtitle:
        'Vergleiche Newcomen und James Watt im Diagramm und sieh, wie das Wasserpumpen im Bergwerk die Revolution auslöste.',
      component: Screen3EfficiencyAndMineLoop,
    },
    {
      id: 'fabrik-standort',
      badge: '04 · Standort-Simulator',
      title: 'Wo darf deine Fabrik stehen? (Vor vs. nach 1769)',
      subtitle:
        'Teste selbst, wie James Watt Fabriken von Flüssen und Wind befreite — und warum Menschen in die Städte zogen.',
      component: Screen4FactoryLocationGame,
    },
    {
      id: 'zeitstrahl-heute',
      badge: '05 · Zeitstrahl bis heute',
      title: 'Von der Dampflokomotive (1814) ins Kraftwerk heute',
      subtitle:
        'Verfolge alle Meilensteine vom Alten Griechenland bis zur modernen Stromerzeugung mit Dampf.',
      component: Screen5TimelineAndToday,
    },
    {
      id: 'originale-video',
      badge: '06 · Originale & Video',
      title: 'Dampfmaschine, Lokomotive & Kraftwerk im Bild',
      subtitle:
        'Klicke dich durch echte Museums- & Kraftwerksbilder und sieh zwei kompakte deutsche Erklärclips.',
      component: Screen6GalleryAndVideo,
    },
  ],
  quizzes: [
    {
      id: 'dampf-quiz-timeline',
      lessonId: 'technologie-die-dampfmaschine',
      categoryId: 'technologie',
      type: 'timeline-sort',
      prompt: 'Bringe die 4 Meilensteine der Dampfmaschine in die richtige zeitliche Reihenfolge!',
      explanation:
        'Zuerst gab es einfache Versuche im Alten Griechenland, dann baute Newcomen 1712 die erste brauchbare Maschine, James Watt verbesserte sie ab 1769, und 1814 fuhr die erste Dampflokomotive.',
      items: [
        { id: 'd1', label: 'Erste einfache Dampfversuche', sublabel: 'Antike · Altes Griechenland', order: 0 },
        { id: 'd2', label: 'Thomas Newcomens Bergwerkspumpe', sublabel: '1712 in England', order: 1 },
        { id: 'd3', label: 'James Watts entscheidende Verbesserung', sublabel: 'ab 1769 · sparsamer & stärker', order: 2 },
        { id: 'd4', label: 'Fahrt der ersten Dampflokomotive', sublabel: '1814 in England', order: 3 },
      ],
    },
    {
      id: 'dampf-quiz-connect',
      lessonId: 'technologie-die-dampfmaschine',
      categoryId: 'technologie',
      type: 'visual-connect',
      prompt: 'Verbinde jeden Baustein aus der Geschichte der Dampfmaschine mit seiner genauen Bedeutung.',
      explanation:
        'Newcomen (1712) pumpte Wasser aus Bergwerken, James Watt (1769) machte sie sparsamer & stärker für Fabriken, 1814 fuhr die 1. Lokomotive, und heute erzeugt Dampf Strom in Kraftwerken.',
      leftColumnTitle: 'Person / Meilenstein',
      rightColumnTitle: 'Bedeutung / Wirkung',
      pairs: [
        {
          id: 'newcomen',
          left: 'Thomas Newcomen (1712)',
          leftSub: 'Erste brauchbare Maschine',
          right: 'Pumpte Wasser aus Bergwerken für den Kohleabbau',
        },
        {
          id: 'watt',
          left: 'James Watt (ab 1769)',
          leftSub: 'Sparsamer & stärker',
          right: 'Machte Fabriken unabhängig von Flüssen & Wind',
        },
        {
          id: 'lok1814',
          left: 'Erste Dampflokomotive (1814)',
          leftSub: 'England',
          right: 'Transportierte Güter und Menschen viel schneller',
        },
        {
          id: 'kraftwerk',
          left: 'Kraftwerke heute',
          leftSub: 'Bis in die Gegenwart',
          right: 'Nutzen weiterhin Dampf zur Stromerzeugung',
        },
      ],
    },
    {
      id: 'dampf-quiz-watt-year',
      lessonId: 'technologie-die-dampfmaschine',
      categoryId: 'technologie',
      type: 'slider-estimate',
      prompt: 'Ab welchem Jahr verbesserte James Watt die Dampfmaschine entscheidend?',
      hint: 'Zwischen Thomas Newcomen (1712) und der ersten Dampflokomotive (1814).',
      explanation:
        'James Watt verbesserte die Dampfmaschine ab 1769 entscheidend — dadurch wurde sie sparsamer, stärker und fit für den Einsatz direkt in Fabriken.',
      min: 1680,
      max: 1850,
      step: 1,
      unit: '',
      targetValue: 1769,
      tolerance: 12,
    },
    {
      id: 'dampf-quiz-england-map',
      lessonId: 'technologie-die-dampfmaschine',
      categoryId: 'technologie',
      type: 'map-pin',
      prompt: 'In welchem Land wurden Newcomens Dampfmaschine (1712) und die erste Dampflokomotive (1814) gebaut?',
      hint: 'Setze deinen Pin auf Großbritannien / England (du kannst hineinzoomen!).',
      explanation:
        'England war die Wiege der Dampfmaschine: Hier baute Thomas Newcomen 1712 die erste brauchbare Maschine, und 1814 fuhr hier die erste Dampflokomotive.',
      target: {
        label: 'England',
        lon: -1.8,
        lat: 52.8,
      },
      toleranceKm: 320,
      mapView: {
        center: [6, 50],
        scale: 820,
      },
      contextPins: [
        { label: 'Athen', lon: 23.7275, lat: 37.9838, muted: true },
        { label: 'Berlin', lon: 13.405, lat: 52.52, muted: true },
      ],
    },
  ],
}

export default dieDampfmaschineLesson
