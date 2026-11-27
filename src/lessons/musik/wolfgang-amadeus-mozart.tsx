import {
  CheckCircle2,
  Compass,
  Film,
  Layers,
  MapPin,
  Mic2,
  Music,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Volume2,
  XCircle,
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
import { playMelody, playSinglePitch, stopAllAudio } from '../../lib/audioEngine'
import type { SynthNote } from '../../lib/audioEngine'
import type { LessonDefinition } from '../../types/yuno'

const MEDIA = {
  portrait:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/The_Mozart_Family_-_Wolfgang_Amadeus_Mozart_headshot.jpg/960px-The_Mozart_Family_-_Wolfgang_Amadeus_Mozart_headshot.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  salzburg:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/Salzburg%2C_Getreidegasse_9%2C_Mozarts_Geburtshaus.jpg/960px-Salzburg%2C_Getreidegasse_9%2C_Mozarts_Geburtshaus.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  vienna:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Wien_-_Stephansdom_%281%29.JPG/960px-Wien_-_Stephansdom_%281%29.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  magicFlute:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/Mozart_magic_flute.jpg/960px-Mozart_magic_flute.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  donGiovanni:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/58/Max_Slevogt_-_Der_S%C3%A4nger_Francisco_d%27Andrade_als_Don_Giovanni_in_Mozarts_Oper_-_Google_Art_Project.jpg/960px-Max_Slevogt_-_Der_S%C3%A4nger_Francisco_d%27Andrade_als_Don_Giovanni_in_Mozarts_Oper_-_Google_Art_Project.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 1 (Option A): Salzburg → Wien (1756–1791) auf echter Karte          */
/* -------------------------------------------------------------------------- */

const LIFE_STATIONS = [
  {
    id: 'salzburg',
    date: '27. Januar 1756',
    title: 'Geboren in Salzburg (Österreich)',
    detail:
      'Wolfgang Amadeus Mozart wird in der Salzburger Getreidegasse geboren. Schon als Wunderkind begeistert er ganz Europa am Klavier und komponiert erste Werke.',
    src: MEDIA.salzburg,
    wikiTitle: "Mozart's birthplace",
    caption: 'Mozarts Geburtshaus in der Getreidegasse 9 in Salzburg.',
  },
  {
    id: 'klassik',
    date: '1756–1791 · Wiener Klassik',
    title: 'Genie aller Genres (inkl. 21 Opern)',
    detail:
      'In nur 35 Lebensjahren schuf Mozart Werke in nahezu jedem Genre seiner Zeit: Kirchenmusik, Sinfonien, Konzerte und ganze 21 Opern.',
    src: MEDIA.portrait,
    wikiTitle: 'Wolfgang Amadeus Mozart',
    caption: 'Wolfgang Amadeus Mozart — einer der Hauptmeister der Wiener Klassik.',
  },
  {
    id: 'wien',
    date: '5. Dezember 1791',
    title: 'Gestorben in Wien',
    detail:
      'In der Musikmetropole Wien feierte Mozart seine größten Triumphe (u. a. „Die Zauberflöte“). Dort starb er am 5. Dezember 1791 im Alter von nur 35 Jahren.',
    src: MEDIA.vienna,
    wikiTitle: "St. Stephen's Cathedral, Vienna",
    caption: 'Der Stephansdom in Wien — Zentrum der Wiener Klassik.',
  },
]

function Screen1AustriaAtlas() {
  const [stationId, setStationId] = useState('salzburg')
  const active = LIFE_STATIONS.find((s) => s.id === stationId) ?? LIFE_STATIONS[0]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {LIFE_STATIONS.map((st) => (
          <button
            key={st.id}
            type="button"
            onClick={() => setStationId(st.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
              stationId === st.id
                ? 'bg-[#1D1D1F] text-white shadow-xs'
                : 'bg-white text-[#515154] ring-1 ring-black/[0.08] hover:bg-[#EFEFF4]'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            {st.date}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <RealGeoMap
          center={[13.9, 47.7]}
          scale={2850}
          markers={[
            {
              id: 'salzburg',
              label: 'Salzburg',
              sublabel: 'Geboren: 27. Jan. 1756',
              lon: 13.055,
              lat: 47.8095,
              color: '#6D28D9',
              pulse: stationId === 'salzburg',
              active: stationId === 'salzburg',
            },
            {
              id: 'wien',
              label: 'Wien',
              sublabel: 'Gestorben: 5. Dez. 1791',
              lon: 16.3738,
              lat: 48.2082,
              color: '#0071E3',
              pulse: stationId === 'wien',
              active: stationId === 'wien',
            },
            {
              id: 'muenchen',
              label: 'München',
              lon: 11.582,
              lat: 48.1351,
              muted: true,
            },
          ]}
          routes={[
            {
              id: 'mozart-route',
              points: [
                [13.055, 47.8095],
                [16.3738, 48.2082],
              ],
              color: '#6D28D9',
              progress: 1,
              dashed: true,
              strokeWidth: 3,
            },
          ]}
          onMarkerClick={(m) => {
            if (m.id === 'salzburg' || m.id === 'wien') setStationId(m.id)
          }}
          caption="Echte Österreich-Karte (zoom- und verschiebbar bis 8×): Klicke auf Salzburg oder Wien."
        />

        <div className="flex flex-col justify-between gap-4">
          <SmartMediaImage
            src={active.src}
            wikiTitle={active.wikiTitle}
            wikiLang="en"
            alt={active.caption}
            caption={active.caption}
            credit="Wikimedia Commons"
            aspectClass="aspect-[4/3]"
          />

          <div className="apple-card rounded-3xl p-5">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#6D28D9] uppercase">
              <Compass className="h-3.5 w-3.5" />
              {active.date}
            </span>
            <h3 className="font-apple-display mt-1 text-lg text-[#1D1D1F]">{active.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed font-medium text-[#515154]">
              {active.detail}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 2 (Option A + C): Was ist eine Arie? & Königin-der-Nacht-Radar      */
/* -------------------------------------------------------------------------- */

const VOCAL_RANGES = [
  {
    id: 'bass',
    label: 'Bass (tiefste Männerstimme)',
    peakLabel: 'E4',
    pitch: 'E3',
    pct: 32,
    color: '#64748B',
    note: 'Tiefes, warmes Fundament in Opern (z. B. Sarastro in der Zauberflöte).',
  },
  {
    id: 'tenor',
    label: 'Tenor (hohe Männerstimme)',
    peakLabel: 'C5',
    pitch: 'G4',
    pct: 52,
    color: '#0071E3',
    note: 'Typische Heldenstimme (z. B. Prinz Tamino in der Zauberflöte).',
  },
  {
    id: 'sopran',
    label: 'Sopran (hohe Frauenstimme)',
    peakLabel: 'C6',
    pitch: 'C5',
    pct: 76,
    color: '#7C3AED',
    note: 'Strahlende Hauptstimme vieler Mozart-Opern.',
  },
  {
    id: 'koenigin',
    label: 'Königin der Nacht (Koloratur-Sopran!)',
    peakLabel: 'Hohes F6!',
    pitch: 'F6',
    pct: 100,
    color: '#DC2626',
    note: 'Extrem seltene Spitzenhöhe in „Der Hölle Rache kocht in meinem Herzen“ — weltberühmte Staccato-Kaskaden!',
  },
]

const QUEEN_STACCATO_MOTIF: SynthNote[] = [
  { pitch: 'A5', durationSec: 0.14, offsetSec: 0.0 },
  { pitch: 'C6', durationSec: 0.14, offsetSec: 0.16 },
  { pitch: 'F6', durationSec: 0.16, offsetSec: 0.32 },
  { pitch: 'C6', durationSec: 0.14, offsetSec: 0.50 },
  { pitch: 'A5', durationSec: 0.14, offsetSec: 0.66 },
  { pitch: 'C6', durationSec: 0.14, offsetSec: 0.82 },
  { pitch: 'F6', durationSec: 0.35, offsetSec: 0.98 },
]

function Screen2AriaAndQueenRadar() {
  const [rangeId, setRangeId] = useState('koenigin')
  const activeRange = VOCAL_RANGES.find((r) => r.id === rangeId) ?? VOCAL_RANGES[3]

  useEffect(() => {
    return () => stopAllAudio()
  }, [])

  const selectRange = (r: (typeof VOCAL_RANGES)[number]) => {
    setRangeId(r.id)
    if (r.id === 'koenigin') {
      playMelody(QUEEN_STACCATO_MOTIF)
    } else {
      playSinglePitch(r.pitch, 0.55)
    }
  }

  return (
    <div className="space-y-5">
      {/* Crisp Definition Card of "Arie" */}
      <div className="apple-card grid gap-4 rounded-3xl p-6 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#6D28D9] uppercase">
            <Mic2 className="h-3.5 w-3.5" />
            Schlüsselbegriff · Oper
          </span>
          <h3 className="font-apple-black mt-1 text-2xl text-[#1D1D1F]">Was ist eine Arie?</h3>
          <p className="mt-2 text-sm leading-relaxed font-medium text-[#1D1D1F]">
            Eine <strong>Arie</strong> ist ein kunstvolles <strong>Sologesangsstück mit Orchesterbegleitung</strong>, in dem eine Opernfigur ihre tiefsten <strong>Gefühle oder Gedanken</strong> ausdrückt.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-[#F5F3FF] p-3">
            <span className="font-apple-black block text-lg text-[#6D28D9]">Solo</span>
            <span className="text-[11px] font-bold text-[#515154]">Eine Stimme</span>
          </div>
          <div className="rounded-2xl bg-[#E8F2FC] p-3">
            <span className="font-apple-black block text-lg text-[#0071E3]">Orchester</span>
            <span className="text-[11px] font-bold text-[#515154]">Begleitung</span>
          </div>
          <div className="rounded-2xl bg-[#FEF2F2] p-3">
            <span className="font-apple-black block text-lg text-[#DC2626]">Gefühl</span>
            <span className="text-[11px] font-bold text-[#515154]">Ausdruck</span>
          </div>
        </div>
      </div>

      {/* Vocal Pitch Radar + Original Queen of the Night Concert Recording */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1.25fr]">
        <div className="apple-card flex flex-col justify-between space-y-4 rounded-3xl p-6">
          <div>
            <span className="font-mono text-[11px] font-bold text-[#DC2626] uppercase">
              Stimmhöhen-Radar · Klicke zum Anhören
            </span>
            <h4 className="font-apple-display mt-1 text-lg text-[#1D1D1F]">
              Wie extrem hoch ist „Der Hölle Rache“?
            </h4>
          </div>

          <div className="space-y-2.5">
            {VOCAL_RANGES.map((r) => {
              const active = r.id === rangeId
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => selectRange(r)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${
                    active
                      ? 'border-[#1D1D1F] bg-[#F5F5F7]'
                      : 'border-black/[0.06] bg-white hover:bg-[#FAFAFC]'
                  }`}
                >
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-[#1D1D1F]">{r.label}</span>
                    <span className="inline-flex items-center gap-1 font-mono font-bold" style={{ color: r.color }}>
                      <Volume2 className="h-3 w-3" />
                      {r.peakLabel}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#EFEFF4]">
                    <div
                      style={{ width: `${r.pct}%`, backgroundColor: r.color }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </button>
              )
            })}
          </div>

          <p className="rounded-2xl bg-[#FEF2F2] p-3.5 text-xs leading-relaxed font-medium text-[#7F1D1D]">
            <strong>{activeRange.label}:</strong> {activeRange.note}
          </p>
        </div>

        <SmartVideoPlayer
          videoId="YuBeBjqKSGQ"
          start={15}
          end={115}
          title="Die Zauberflöte — Arie der Königin der Nacht („Der Hölle Rache kocht in meinem Herzen“)"
          channel="Diana Damrau · Royal Ballet and Opera"
          segmentLabel="Weltberühmte Opern-Arie"
        />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 3 (Wildcard C): Spielbares Mozart-Klavier (3 berühmte Motive!)      */
/* -------------------------------------------------------------------------- */

const NACHTMUSIK_NOTES: SynthNote[] = [
  { pitch: 'G4', durationSec: 0.28, offsetSec: 0.0 },
  { pitch: 'D4', durationSec: 0.14, offsetSec: 0.34 },
  { pitch: 'G4', durationSec: 0.28, offsetSec: 0.50 },
  { pitch: 'D4', durationSec: 0.14, offsetSec: 0.84 },
  { pitch: 'G4', durationSec: 0.16, offsetSec: 1.0 },
  { pitch: 'D4', durationSec: 0.14, offsetSec: 1.18 },
  { pitch: 'G4', durationSec: 0.14, offsetSec: 1.34 },
  { pitch: 'B4', durationSec: 0.14, offsetSec: 1.50 },
  { pitch: 'D5', durationSec: 0.55, offsetSec: 1.66 },
]

const TURKISH_MARCH_NOTES: SynthNote[] = [
  { pitch: 'B4', durationSec: 0.13, offsetSec: 0.0 },
  { pitch: 'A4', durationSec: 0.13, offsetSec: 0.15 },
  { pitch: 'G#4', durationSec: 0.13, offsetSec: 0.30 },
  { pitch: 'A4', durationSec: 0.13, offsetSec: 0.45 },
  { pitch: 'C5', durationSec: 0.34, offsetSec: 0.60 },
  { pitch: 'D5', durationSec: 0.13, offsetSec: 1.0 },
  { pitch: 'C5', durationSec: 0.13, offsetSec: 1.15 },
  { pitch: 'B4', durationSec: 0.13, offsetSec: 1.30 },
  { pitch: 'C5', durationSec: 0.13, offsetSec: 1.45 },
  { pitch: 'E5', durationSec: 0.42, offsetSec: 1.60 },
]

const SYMPHONY40_NOTES: SynthNote[] = [
  { pitch: 'Eb5', durationSec: 0.14, offsetSec: 0.0 },
  { pitch: 'D5', durationSec: 0.14, offsetSec: 0.16 },
  { pitch: 'D5', durationSec: 0.28, offsetSec: 0.32 },
  { pitch: 'Eb5', durationSec: 0.14, offsetSec: 0.66 },
  { pitch: 'D5', durationSec: 0.14, offsetSec: 0.82 },
  { pitch: 'D5', durationSec: 0.28, offsetSec: 0.98 },
  { pitch: 'Eb5', durationSec: 0.14, offsetSec: 1.32 },
  { pitch: 'D5', durationSec: 0.14, offsetSec: 1.48 },
  { pitch: 'D5', durationSec: 0.24, offsetSec: 1.64 },
  { pitch: 'Bb5', durationSec: 0.52, offsetSec: 1.92 },
]

type MozartPieceId = 'nachtmusik' | 'turkish' | 'sym40'

const MOZART_PLAYABLE_PIECES: Record<
  MozartPieceId,
  {
    title: string
    badge: string
    accent: string
    sequence: string[]
    autoplayNotes: SynthNote[]
    keys: Array<{ pitch: string; label: string; sharp: boolean }>
    congrats: string
  }
> = {
  nachtmusik: {
    title: 'Eine kleine Nachtmusik',
    badge: 'KV 525 · G-Dur',
    accent: '#0071E3',
    sequence: ['G4', 'D4', 'G4', 'D4', 'G4', 'B4', 'D5'],
    autoplayNotes: NACHTMUSIK_NOTES,
    keys: [
      { pitch: 'D4', label: 'D', sharp: false },
      { pitch: 'G4', label: 'G', sharp: false },
      { pitch: 'A4', label: 'A', sharp: false },
      { pitch: 'B4', label: 'H', sharp: false },
      { pitch: 'C5', label: 'C5', sharp: false },
      { pitch: 'D5', label: 'D5', sharp: false },
    ],
    congrats: 'Perfekt! Genau dieser fröhliche Dreiklang-Sprung macht „Eine kleine Nachtmusik“ unverwechselbar.',
  },
  turkish: {
    title: 'Türkischer Marsch',
    badge: 'Rondo Alla Turca · KV 331',
    accent: '#6D28D9',
    sequence: ['B4', 'A4', 'G#4', 'A4', 'C5', 'D5', 'C5', 'B4', 'C5', 'E5'],
    autoplayNotes: TURKISH_MARCH_NOTES,
    keys: [
      { pitch: 'G#4', label: 'Gis', sharp: true },
      { pitch: 'A4', label: 'A', sharp: false },
      { pitch: 'B4', label: 'H', sharp: false },
      { pitch: 'C5', label: 'C5', sharp: false },
      { pitch: 'D5', label: 'D5', sharp: false },
      { pitch: 'E5', label: 'E5', sharp: false },
    ],
    congrats: 'Bravo! Du hast das berühmte Hauptmotiv des „Türkischen Marschs“ selbst gespielt!',
  },
  sym40: {
    title: '40. Sinfonie (g-Moll)',
    badge: 'KV 550 · Dramatisches Seufzer-Motiv',
    accent: '#C81E1E',
    sequence: ['Eb5', 'D5', 'D5', 'Eb5', 'D5', 'D5', 'Eb5', 'D5', 'D5', 'Bb5'],
    autoplayNotes: SYMPHONY40_NOTES,
    keys: [
      { pitch: 'D5', label: 'D5', sharp: false },
      { pitch: 'Eb5', label: 'Es5', sharp: true },
      { pitch: 'F5', label: 'F5', sharp: false },
      { pitch: 'G5', label: 'G5', sharp: false },
      { pitch: 'A5', label: 'A5', sharp: false },
      { pitch: 'Bb5', label: 'B5', sharp: true },
    ],
    congrats: 'Genial! Genau dieses drängende Halbton-Motiv eröffnet Mozarts berühmte 40. Sinfonie!',
  },
}

function Screen3PlayableMozartPiano() {
  const [pieceId, setPieceId] = useState<MozartPieceId>('nachtmusik')
  const [stepIdx, setStepIdx] = useState(0)
  const [completedPieces, setCompletedPieces] = useState<Record<string, boolean>>({})
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [isAutoplaying, setIsAutoplaying] = useState(false)
  const [autoNoteIdx, setAutoNoteIdx] = useState<number | null>(null)
  const cancelRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => {
      cancelRef.current?.()
      stopAllAudio()
    }
  }, [])

  const piece = MOZART_PLAYABLE_PIECES[pieceId]
  const targetPitch = piece.sequence[stepIdx]

  const selectPiece = (nextId: MozartPieceId) => {
    cancelRef.current?.()
    setIsAutoplaying(false)
    setAutoNoteIdx(null)
    setActiveKey(null)
    setPieceId(nextId)
    setStepIdx(0)
  }

  const pressKey = (pitch: string) => {
    cancelRef.current?.()
    setIsAutoplaying(false)
    setAutoNoteIdx(null)
    playSinglePitch(pitch, 0.42)
    setActiveKey(pitch)
    window.setTimeout(() => setActiveKey((k) => (k === pitch ? null : k)), 240)

    if (pitch === targetPitch) {
      if (stepIdx === piece.sequence.length - 1) {
        setCompletedPieces((prev) => ({ ...prev, [pieceId]: true }))
        setStepIdx(0)
      } else {
        setStepIdx((s) => s + 1)
      }
    }
  }

  const toggleAutoplay = () => {
    if (isAutoplaying) {
      cancelRef.current?.()
      setIsAutoplaying(false)
      setAutoNoteIdx(null)
      setActiveKey(null)
      return
    }
    cancelRef.current?.()
    setIsAutoplaying(true)
    const notes = piece.autoplayNotes
    const { cancel } = playMelody(notes, (idx) => {
      setAutoNoteIdx(idx)
      if (idx === null) {
        setIsAutoplaying(false)
        setActiveKey(null)
      } else {
        setActiveKey(notes[idx]?.pitch ?? null)
      }
    })
    cancelRef.current = cancel
  }

  const stripNotes = isAutoplaying ? piece.autoplayNotes.map((n) => n.pitch) : piece.sequence

  return (
    <div className="apple-card space-y-6 rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] pb-4">
        <div>
          <span
            className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase"
            style={{ color: piece.accent }}
          >
            <Music className="h-4 w-4" />
            Mozart-Klavier · Alle 3 Stücke selbst nachspielen
          </span>
          <h3 className="font-apple-black mt-1 text-2xl text-[#1D1D1F]">
            Spiele selbst: „{piece.title}“
          </h3>
        </div>

        <button
          type="button"
          onClick={toggleAutoplay}
          style={!isAutoplaying ? { backgroundColor: piece.accent } : undefined}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white transition ${
            isAutoplaying ? 'bg-[#1D1D1F]' : 'hover:opacity-90'
          }`}
        >
          {isAutoplaying ? (
            <Square className="h-3 w-3 fill-current" />
          ) : (
            <Play className="h-3.5 w-3.5 fill-current" />
          )}
          <span>{isAutoplaying ? 'Stopp' : 'Motiv vorspielen'}</span>
        </button>
      </div>

      {/* Piece Switcher Tabs (Play ALL 3 pieces yourself!) */}
      <div className="grid gap-2 sm:grid-cols-3">
        {(Object.keys(MOZART_PLAYABLE_PIECES) as MozartPieceId[]).map((id) => {
          const item = MOZART_PLAYABLE_PIECES[id]
          const active = id === pieceId
          const done = Boolean(completedPieces[id])
          return (
            <button
              key={id}
              type="button"
              onClick={() => selectPiece(id)}
              style={active ? { borderColor: item.accent, backgroundColor: `${item.accent}12` } : undefined}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                active
                  ? 'shadow-xs'
                  : 'border-black/[0.08] bg-[#F5F5F7] hover:bg-[#EFEFF4]'
              }`}
            >
              <div>
                <p className="text-xs font-extrabold text-[#1D1D1F]">{item.title}</p>
                <p className="text-[10px] font-semibold text-[#6E6E73]">{item.badge}</p>
              </div>
              {done && <CheckCircle2 className="h-4 w-4 shrink-0 text-[#16A34A]" />}
            </button>
          )
        })}
      </div>

      {/* Piano-Roll Sequence */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#6E6E73]">
          <span>
            {isAutoplaying
              ? `Vorspiel läuft: ${piece.title}`
              : 'Tippe die markierte Taste der Reihe nach an — Ton für Ton:'}
          </span>
          {!isAutoplaying && (
            <span className="font-mono" style={{ color: piece.accent }}>
              Ton {stepIdx + 1}/{piece.sequence.length}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 rounded-2xl bg-[#F5F5F7] p-3">
          {stripNotes.map((pitch, idx) => {
            const isCurrent = isAutoplaying ? autoNoteIdx === idx : idx === stepIdx
            const isDone = !isAutoplaying && idx < stepIdx
            return (
              <div
                key={`${pieceId}-${pitch}-${idx}`}
                style={isCurrent ? { backgroundColor: piece.accent } : undefined}
                className={`flex min-w-[44px] flex-1 items-center justify-center rounded-xl py-2.5 font-mono text-xs font-extrabold transition ${
                  isCurrent
                    ? 'scale-105 text-white shadow-sm'
                    : isDone
                      ? 'bg-[#DCFCE7] text-[#15803D]'
                      : 'bg-white text-[#515154]'
                }`}
              >
                {pitch}
              </div>
            )
          })}
        </div>
      </div>

      {/* Interactive Keyboard (automatically adapted to the active piece!) */}
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
        {piece.keys.map((key) => {
          const isNext = !isAutoplaying && key.pitch === targetPitch
          const isPressed = activeKey === key.pitch
          return (
            <button
              key={`${pieceId}-${key.pitch}`}
              type="button"
              onClick={() => pressKey(key.pitch)}
              style={
                isNext
                  ? { borderColor: piece.accent, backgroundColor: `${piece.accent}14`, color: piece.accent }
                  : undefined
              }
              className={`flex h-24 flex-col items-center justify-between rounded-2xl border-2 p-3 transition active:scale-95 ${
                isPressed
                  ? 'border-[#1D1D1F] bg-[#E8F2FC] text-[#0071E3]'
                  : isNext
                    ? 'shadow-sm'
                    : key.sharp
                      ? 'border-black/15 bg-[#1D1D1F] text-white hover:bg-[#3A3A3C]'
                      : 'border-black/10 bg-white text-[#1D1D1F] hover:bg-[#F5F5F7]'
              }`}
            >
              <span className="font-mono text-[10px] font-bold opacity-65">{key.pitch}</span>
              <span className="font-apple-black text-xl">{key.label}</span>
              {isNext && (
                <span
                  style={{ backgroundColor: piece.accent }}
                  className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
                >
                  Tippen!
                </span>
              )}
            </button>
          )
        })}
      </div>

      {completedPieces[pieceId] && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] p-4 text-xs font-bold text-[#14532D]">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
            {piece.congrats}
          </span>
          <button
            type="button"
            onClick={() => setStepIdx(0)}
            className="inline-flex items-center gap-1 text-[#15803D] hover:underline"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Nochmal
          </button>
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 4 (Option A + B): Alle 5 Mozart-Meisterwerke im Konzertsaal         */
/* -------------------------------------------------------------------------- */

const MOZART_WORKS = [
  {
    id: 'zauberfloete',
    title: 'Die Zauberflöte',
    genre: 'Oper · Arie der Königin der Nacht',
    mood: 'Dramatisch & virtuos',
    desc: 'Eine der meistgespielten Opern der Welt — weltberühmt für die Arie „Der Hölle Rache kocht in meinem Herzen“.',
    videoId: 'YuBeBjqKSGQ',
    start: 15,
    end: 115,
    channel: 'Diana Damrau · Royal Ballet and Opera',
    artSrc: MEDIA.magicFlute,
    artCaption: 'Historische Bühnenillustration zu „Die Zauberflöte“.',
  },
  {
    id: 'dongiovanni',
    title: 'Don Giovanni',
    genre: 'Oper (eine von 21 Mozart-Opern)',
    mood: 'Düster, leidenschaftlich & mitreißend',
    desc: 'Dramatische Oper zwischen Komödie und Tragödie — beginnt mit einer gewaltigen, spannungsgeladenen Ouvertüre.',
    videoId: '20tnjOkmEmk',
    start: 10,
    end: 105,
    channel: 'Royal Ballet and Opera',
    artSrc: MEDIA.donGiovanni,
    artCaption: 'Max Slevogt: Szene aus Mozarts Oper „Don Giovanni“.',
  },
  {
    id: 'nachtmusik',
    title: 'Eine kleine Nachtmusik',
    genre: 'Serenade für Streicher (KV 525)',
    mood: 'Leicht, festlich & elegant',
    desc: 'Einer der bekanntesten Ohrwürmer der gesamten Musikgeschichte — pure Lebensfreude der Wiener Klassik.',
    videoId: 'h7itE1XdCw8',
    start: 6,
    end: 95,
    channel: 'Swiss Orchestra',
    artSrc: MEDIA.vienna,
    artCaption: 'Entstanden 1787 in Wien.',
  },
  {
    id: 'tuerkisch',
    title: 'Türkischer Marsch',
    genre: 'Klavierstück (Rondo Alla Turca)',
    mood: 'Rhythmisch, verspielt & feurig',
    desc: 'Der mitreißende Schlusssatz aus Mozarts Klaviersonate Nr. 11 — imitiert den Schwung türkischer Janitscharenmusik.',
    videoId: '0HhBr0t4VJ0',
    start: 5,
    end: 105,
    channel: 'Lang Lang · medici.tv',
    artSrc: MEDIA.salzburg,
    artCaption: 'Ein Paradebeispiel für Mozarts Brillanz am Klavier.',
  },
  {
    id: 'sinfonie40',
    title: '40. Sinfonie (g-Moll)',
    genre: 'Sinfonie für Orchester (KV 550)',
    mood: 'Treibend, unruhig & ergreifend',
    desc: 'Eine von Mozarts dramatischsten Sinfonien — ihr drängendes Seufzer-Motiv erkennt man sofort im ersten Takt.',
    videoId: 'rcI9z0z9Ae4',
    start: 12,
    end: 115,
    channel: 'WDR Sinfonieorchester · ARD Klassik',
    artSrc: MEDIA.portrait,
    artCaption: 'Komponiert 1788 in nur wenigen Wochen in Wien.',
  },
]

function Screen4FiveMasterpieces() {
  const [workId, setWorkId] = useState('nachtmusik')
  const work = MOZART_WORKS.find((w) => w.id === workId) ?? MOZART_WORKS[0]

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {MOZART_WORKS.map((w) => {
          const active = w.id === workId
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => setWorkId(w.id)}
              className={`rounded-2xl border p-3.5 text-left transition ${
                active
                  ? 'border-[#6D28D9] bg-[#F5F3FF] shadow-xs'
                  : 'border-black/[0.07] bg-white hover:bg-[#F5F5F7]'
              }`}
            >
              <span className="font-mono text-[10px] font-bold text-[#6D28D9] uppercase">
                {w.genre.split('·')[0].split('(')[0]}
              </span>
              <p className="mt-1 text-xs font-extrabold text-[#1D1D1F]">{w.title}</p>
            </button>
          )
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <SmartVideoPlayer
          key={work.id}
          videoId={work.videoId}
          start={work.start}
          end={work.end}
          title={`${work.title} (${work.genre})`}
          channel={work.channel}
          segmentLabel="Konzert- & Opernausschnitt"
        />

        <div className="space-y-4">
          <div className="apple-card rounded-3xl p-5">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#6D28D9] uppercase">
              <Film className="h-3.5 w-3.5" />
              {work.genre}
            </span>
            <h3 className="font-apple-black mt-1 text-xl text-[#1D1D1F]">{work.title}</h3>
            <p className="mt-2 text-xs leading-relaxed font-medium text-[#515154]">{work.desc}</p>
            <span className="mt-3 inline-block rounded-full bg-[#EDE9FE] px-3 py-1 text-[11px] font-bold text-[#6D28D9]">
              Stimmung: {work.mood}
            </span>
          </div>

          <SmartMediaImage
            src={work.artSrc}
            alt={work.artCaption}
            caption={work.artCaption}
            credit="Wikimedia Commons"
            aspectClass="aspect-[4/3]"
          />
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 5 (Option B): Bach (Barock) vs. Mozart (Wiener Klassik) Duell       */
/* -------------------------------------------------------------------------- */

const LIFESPAN_DATA = [
  { name: 'J. S. Bach (Barock)', Jahre: 65, highlight: false },
  { name: 'W. A. Mozart (Klassik)', Jahre: 35, highlight: true },
]

function Screen5BachVsMozart() {
  const [playingSide, setPlayingSide] = useState<'bach' | 'mozart' | null>(null)

  useEffect(() => {
    return () => stopAllAudio()
  }, [])

  const playComparison = (side: 'bach' | 'mozart') => {
    setPlayingSide(side)
    const notes: SynthNote[] =
      side === 'bach'
        ? [
            { pitch: 'A4', durationSec: 0.14, offsetSec: 0 },
            { pitch: 'G4', durationSec: 0.14, offsetSec: 0.15 },
            { pitch: 'A4', durationSec: 0.55, offsetSec: 0.30 },
            { pitch: 'G4', durationSec: 0.14, offsetSec: 0.95 },
            { pitch: 'F4', durationSec: 0.14, offsetSec: 1.1 },
            { pitch: 'E4', durationSec: 0.14, offsetSec: 1.25 },
            { pitch: 'D4', durationSec: 0.45, offsetSec: 1.4 },
          ]
        : NACHTMUSIK_NOTES

    playMelody(notes, (idx) => {
      if (idx === null) setPlayingSide(null)
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="apple-card flex flex-col justify-between gap-4 rounded-3xl p-6">
          <div>
            <span className="rounded-full bg-[#F2F2F7] px-3 py-1 font-mono text-[11px] font-bold text-[#515154] uppercase">
              Barock · 1685–1750
            </span>
            <h3 className="font-apple-black mt-2 text-2xl text-[#1D1D1F]">Johann Sebastian Bach</h3>
            <ul className="mt-3 space-y-1.5 text-xs font-medium text-[#515154]">
              <li>• <strong>Herkunft:</strong> Deutschland (Eisenach → Leipzig)</li>
              <li>• <strong>Fokus:</strong> Orgel, Kirchenmusik, kunstvolle Fugen (Polyphonie)</li>
              <li>• <strong>Werke:</strong> Toccata in d-Moll, Air, Wohltemperiertes Klavier</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => playComparison('bach')}
            className={`inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold transition ${
              playingSide === 'bach'
                ? 'bg-[#1D1D1F] text-white'
                : 'bg-[#F2F2F7] text-[#1D1D1F] hover:bg-[#E5E5EA]'
            }`}
          >
            <Volume2 className="h-4 w-4" />
            Barock-Klang anhören (Toccata)
          </button>
        </div>

        <div className="apple-card flex flex-col justify-between gap-4 rounded-3xl border-[#6D28D9]/30 p-6 ring-1 ring-[#6D28D9]/15">
          <div>
            <span className="rounded-full bg-[#EDE9FE] px-3 py-1 font-mono text-[11px] font-bold text-[#6D28D9] uppercase">
              Wiener Klassik · 1756–1791
            </span>
            <h3 className="font-apple-black mt-2 text-2xl text-[#1D1D1F]">Wolfgang Amadeus Mozart</h3>
            <ul className="mt-3 space-y-1.5 text-xs font-medium text-[#515154]">
              <li>• <strong>Herkunft:</strong> Österreich (Salzburg → Wien)</li>
              <li>• <strong>Fokus:</strong> Klare Melodien, <strong>21 Opern</strong>, Sinfonien &amp; Konzerte</li>
              <li>• <strong>Werke:</strong> Zauberflöte, Don Giovanni, Nachtmusik, 40. Sinfonie</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => playComparison('mozart')}
            className={`inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold text-white transition ${
              playingSide === 'mozart' ? 'bg-[#1D1D1F]' : 'bg-[#6D28D9] hover:bg-[#5B21B6]'
            }`}
          >
            <Volume2 className="h-4 w-4" />
            Wiener Klassik anhören (Nachtmusik)
          </button>
        </div>
      </div>

      {/* Lifespan Scale Chart */}
      <div className="apple-card grid gap-5 rounded-3xl p-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#0071E3] uppercase">
            <Layers className="h-3.5 w-3.5" />
            Lebenszeit-Vergleich
          </span>
          <h4 className="font-apple-display mt-1 text-lg text-[#1D1D1F]">
            Nur 35 Jahre alt — und über 600 Meisterwerke!
          </h4>
          <p className="mt-1 text-xs leading-relaxed font-medium text-[#515154]">
            Mozart wurde nur fast halb so alt wie Bach, hinterließ aber eine unglaubliche Vielfalt in jedem Genre — darunter <strong>21 Opern</strong>, über 40 Sinfonien, Konzerte und Kirchenmusik.
          </p>
        </div>

        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={LIFESPAN_DATA} layout="vertical" margin={{ top: 4, right: 20, left: 10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
              <XAxis type="number" unit=" J." domain={[0, 75]} tick={{ fill: '#86868B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fill: '#1D1D1F', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => [`${v} Jahre`, 'Lebensalter']}
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', borderColor: 'rgba(0,0,0,0.08)', fontSize: '12px' }}
              />
              <Bar dataKey="Jahre" radius={[0, 8, 8, 0]}>
                {LIFESPAN_DATA.map((d) => (
                  <Cell key={d.name} fill={d.highlight ? '#6D28D9' : '#CBD5E1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 6: Genre-Kompass & Schneller Mozart-Radar                           */
/* -------------------------------------------------------------------------- */

const GENRE_CARDS = [
  { label: '21 Opern', examples: 'Die Zauberflöte · Don Giovanni' },
  { label: 'Sinfonien', examples: '40. Sinfonie in g-Moll' },
  { label: 'Konzerte & Klavier', examples: 'Türkischer Marsch · Eine kleine Nachtmusik' },
  { label: 'Kirchenmusik', examples: 'Messen & geistliche Werke' },
]

const QUICK_CHECKS = [
  {
    id: 'm1',
    q: 'Aus welcher Oper stammt die Arie der Königin der Nacht („Der Hölle Rache“)?',
    ans: 'Die Zauberflöte',
    opts: ['Don Giovanni', 'Die Zauberflöte', '40. Sinfonie'],
  },
  {
    id: 'm2',
    q: 'Zu welcher Epoche gehört Wolfgang Amadeus Mozart?',
    ans: 'Wiener Klassik',
    opts: ['Barock', 'Wiener Klassik', 'Romantik'],
  },
]

function Screen6GenreCompassAndRadar() {
  const [picked, setPicked] = useState<Record<string, string>>({})

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {GENRE_CARDS.map((g) => (
          <div key={g.label} className="apple-card rounded-2xl p-4">
            <span className="font-apple-black text-lg text-[#6D28D9]">{g.label}</span>
            <p className="mt-1 text-xs font-medium text-[#515154]">{g.examples}</p>
          </div>
        ))}
      </div>

      <div className="apple-card space-y-4 rounded-3xl p-6">
        <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-[#0071E3] uppercase">
          <Sparkles className="h-4 w-4" />
          <span>Mozart-Schnellcheck vor den Prüfungen</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {QUICK_CHECKS.map((item) => {
            const choice = picked[item.id]
            const ok = choice === item.ans
            return (
              <div key={item.id} className="space-y-2.5 rounded-2xl bg-[#F5F5F7] p-4">
                <p className="text-sm font-extrabold text-[#1D1D1F]">{item.q}</p>
                <div className="grid gap-1.5">
                  {item.opts.map((opt) => {
                    const isPicked = choice === opt
                    const isRight = Boolean(choice) && opt === item.ans
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={Boolean(choice)}
                        onClick={() => setPicked((p) => ({ ...p, [item.id]: opt }))}
                        className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs font-bold transition ${
                          isRight
                            ? 'border-[#86EFAC] bg-[#F0FDF4] text-[#14532D]'
                            : isPicked && !ok
                              ? 'border-[#FCA5A5] bg-[#FEF2F2] text-[#7F1D1D]'
                              : 'border-black/[0.08] bg-white text-[#1D1D1F] hover:border-[#6D28D9]'
                        }`}
                      >
                        <span>{opt}</span>
                        {isRight && <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />}
                        {isPicked && !ok && <XCircle className="h-4 w-4 text-[#DC2626]" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  LESSON DEFINITION                                                          */
/* -------------------------------------------------------------------------- */

const mozartLesson: LessonDefinition = {
  id: 'musik-wolfgang-amadeus-mozart',
  slug: 'wolfgang-amadeus-mozart',
  categoryId: 'musik',
  title: 'Wolfgang Amadeus Mozart (1756–1791) — Wiener Klassik',
  subtitle:
    'Von Salzburg nach Wien: Entdecke Mozarts 21 Opern, die Arie der Königin der Nacht im Stimmhöhen-Radar, spiele die „Kleine Nachtmusik“ selbst am Klavier und vergleiche ihn direkt mit Bach.',
  eraOrContext: '1756–1791 · Wiener Klassik',
  estimatedMinutes: 8,
  difficulty: 'Einstieg',
  xpReward: 240,
  heroMedia: {
    src: MEDIA.portrait,
    wikiTitle: 'Wolfgang Amadeus Mozart',
    wikiLang: 'en',
    alt: 'Porträt von Wolfgang Amadeus Mozart',
    credit: 'Wikimedia Commons',
  },
  keyTakeaways: [
    'Wolfgang Amadeus Mozart (1756–1791) war ein österreichischer Komponist der Wiener Klassik (geboren am 27. Januar 1756 in Salzburg, gestorben am 5. Dezember 1791 in Wien).',
    'Er komponierte in nahezu jedem Genre seiner Zeit: Kirchenmusik, Sinfonien, Konzerte und 21 Opern.',
    'Eine Arie ist ein kunstvolles Sologesangsstück mit Orchesterbegleitung, in dem eine Opernfigur Gefühle oder Gedanken ausdrückt — weltberühmt ist die Arie der Königin der Nacht („Der Hölle Rache“) aus „Die Zauberflöte“.',
    'Weitere Schlüsselwerke: die Oper „Don Giovanni“, „Eine kleine Nachtmusik“, der „Türkische Marsch“ und seine 40. Sinfonie.',
  ],
  screens: [
    {
      id: 'salzburg-wien-atlas',
      badge: '01 · Biografie & Atlas',
      title: 'Von Salzburg (1756) nach Wien (1791)',
      subtitle:
        'Verorte Geburts- und Sterbeort auf der zoombaren Österreich-Karte und entdecke das Zentrum der Wiener Klassik.',
      component: Screen1AustriaAtlas,
    },
    {
      id: 'arie-koenigin-der-nacht',
      badge: '02 · Arie & Stimmhöhen-Radar',
      title: 'Was ist eine Arie? & „Der Hölle Rache“',
      subtitle:
        'Erfahre, was eine Opernarie ausmacht, teste die extreme Höhe der Königin der Nacht (F6!) und erlebe die berühmte Szene aus „Die Zauberflöte“.',
      component: Screen2AriaAndQueenRadar,
    },
    {
      id: 'mozart-klavier',
      badge: '03 · Spielbares Mozart-Klavier',
      title: 'Nachtmusik, Türkischer Marsch & 40. Sinfonie',
      subtitle:
        'Spiele selbst das Eröffnungsmotiv von „Eine kleine Nachtmusik“ nach oder höre alle 3 Ohrwürmer live auf der Piano-Roll.',
      component: Screen3PlayableMozartPiano,
    },
    {
      id: 'fuenf-meisterwerke',
      badge: '04 · Konzertsaal (Alle 5 Werke)',
      title: 'Mozarts 5 Schlüsselwerke im Original hören',
      subtitle:
        'Die Zauberflöte, Don Giovanni, Eine kleine Nachtmusik, Türkischer Marsch und die 40. Sinfonie — direkt als kuratierte Ausschnitte.',
      component: Screen4FiveMasterpieces,
    },
    {
      id: 'bach-vs-mozart',
      badge: '05 · Epochen-Duell',
      title: 'Bach (Barock) vs. Mozart (Wiener Klassik)',
      subtitle:
        'Höre und vergleiche direkt, wie sich Mozarts Wiener Klassik von Bachs Barock unterscheidet — und was er in nur 35 Jahren schuf.',
      component: Screen5BachVsMozart,
    },
    {
      id: 'genre-kompass',
      badge: '06 · Genre-Kompass & Radar',
      title: '21 Opern, Sinfonien, Konzerte & Kirchenmusik',
      subtitle:
        'Alle Genres auf einen Blick plus ein schneller Warm-up-Check vor deinen 4 visuellen Prüfungen.',
      component: Screen6GenreCompassAndRadar,
    },
  ],
  quizzes: [
    {
      id: 'mozart-quiz-nachtmusik-audio',
      lessonId: 'musik-wolfgang-amadeus-mozart',
      categoryId: 'musik',
      type: 'audio-match',
      prompt: 'Höre das berühmte Mozart-Eröffnungsmotiv an — welches Werk erklingt hier?',
      explanation:
        'Der strahlende Dreiklang-Sprung (G–D–G–D–G–H–D) eröffnet Mozarts berühmte Serenade „Eine kleine Nachtmusik“.',
      audio: {
        mode: 'tone',
        label: 'Berühmtes Mozart-Motiv (Wiener Klassik)',
        notes: [
          { pitch: 'G4', duration: '4n', timeOffset: 0.0 },
          { pitch: 'D4', duration: '8n', timeOffset: 0.34 },
          { pitch: 'G4', duration: '4n', timeOffset: 0.50 },
          { pitch: 'D4', duration: '8n', timeOffset: 0.84 },
          { pitch: 'G4', duration: '8n', timeOffset: 1.0 },
          { pitch: 'D4', duration: '8n', timeOffset: 1.18 },
          { pitch: 'G4', duration: '8n', timeOffset: 1.34 },
          { pitch: 'B4', duration: '8n', timeOffset: 1.50 },
          { pitch: 'D5', duration: '2n', timeOffset: 1.66 },
        ],
      },
      options: [
        { id: 'nachtmusik', label: 'Eine kleine Nachtmusik', description: 'Leichte, festliche Streicher-Serenade' },
        { id: 'koenigin', label: 'Arie der Königin der Nacht', description: 'Koloratur-Arie aus „Die Zauberflöte“' },
        { id: 'toccata', label: 'Toccata und Fuge in d-Moll', description: 'Orgelwerk von J. S. Bach (Barock)' },
        { id: 'sinfonie40', label: '40. Sinfonie in g-Moll', description: 'Dramatisches Orchesterwerk' },
      ],
      correctOptionId: 'nachtmusik',
    },
    {
      id: 'mozart-quiz-salzburg-map',
      lessonId: 'musik-wolfgang-amadeus-mozart',
      categoryId: 'musik',
      type: 'map-pin',
      prompt: 'Wo wurde Wolfgang Amadeus Mozart am 27. Januar 1756 geboren?',
      hint: 'Suche im Westen Österreichs nahe der deutschen Grenze (westlich von Wien, südöstlich von München).',
      explanation:
        'Wolfgang Amadeus Mozart wurde am 27. Januar 1756 in Salzburg geboren und starb am 5. Dezember 1791 in Wien.',
      target: {
        label: 'Salzburg',
        lon: 13.055,
        lat: 47.8095,
      },
      toleranceKm: 100,
      mapView: {
        center: [13.8, 47.7],
        scale: 2400,
      },
      contextPins: [
        { label: 'Wien (Sterbeort)', lon: 16.3738, lat: 48.2082, muted: true },
        { label: 'München', lon: 11.582, lat: 48.1351, muted: true },
      ],
    },
    {
      id: 'mozart-quiz-connect',
      lessonId: 'musik-wolfgang-amadeus-mozart',
      categoryId: 'musik',
      type: 'visual-connect',
      prompt: 'Verbinde jeden Schlüsselbegriff rund um Mozart mit seiner genauen Bedeutung.',
      explanation:
        'Arie = kunstvolles Sologesangsstück mit Orchesterbegleitung; Die Zauberflöte = Oper mit „Der Hölle Rache“; 21 Opern = Mozarts Bühnenwerk; Wiener Klassik = Mozarts Epoche.',
      leftColumnTitle: 'Begriff / Werk',
      rightColumnTitle: 'Bedeutung / Zuordnung',
      pairs: [
        {
          id: 'arie',
          left: 'Arie',
          right: 'Kunstvolles Sologesangsstück mit Orchesterbegleitung für Gefühle einer Opernfigur',
        },
        {
          id: 'zauberfloete',
          left: 'Die Zauberflöte',
          right: 'Oper mit der Arie der Königin der Nacht („Der Hölle Rache“)',
        },
        {
          id: 'opern',
          left: '21 Opern',
          right: 'Mozarts gewaltige Anzahl an Bühnenwerken (inkl. Don Giovanni)',
        },
        {
          id: 'klassik',
          left: 'Wiener Klassik',
          right: 'Musikepoche des österreichischen Komponisten Mozart',
        },
      ],
    },
    {
      id: 'mozart-quiz-birth-year',
      lessonId: 'musik-wolfgang-amadeus-mozart',
      categoryId: 'musik',
      type: 'slider-estimate',
      prompt: 'In welchem Jahr wurde Wolfgang Amadeus Mozart in Salzburg geboren?',
      hint: 'Sechs Jahre nach dem Tod von Johann Sebastian Bach (1750).',
      explanation:
        'Wolfgang Amadeus Mozart wurde am 27. Januar 1756 in Salzburg geboren und starb am 5. Dezember 1791 in Wien.',
      min: 1680,
      max: 1830,
      step: 1,
      unit: '',
      targetValue: 1756,
      tolerance: 12,
    },
  ],
}

export default mozartLesson
