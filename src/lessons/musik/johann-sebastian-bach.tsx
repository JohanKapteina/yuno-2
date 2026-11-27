import {
  CheckCircle2,
  Compass,
  Film,
  Layers,
  MapPin,
  Music,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Volume2,
  XCircle,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { RealGeoMap } from '../../components/geo/RealGeoMap'
import { SmartMediaImage } from '../../components/media/SmartMediaImage'
import { SmartVideoPlayer } from '../../components/media/SmartVideoPlayer'
import { playMelody, playSinglePitch, stopAllAudio } from '../../lib/audioEngine'
import type { SynthNote } from '../../lib/audioEngine'
import type { LessonDefinition } from '../../types/yuno'

const MEDIA = {
  portrait:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/Johann_Sebastian_Bach.jpg/960px-Johann_Sebastian_Bach.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  eisenach:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/Thuringia_Eisenach_asv2020-07_img14_Bach_Museum.jpg/960px-Thuringia_Eisenach_asv2020-07_img14_Bach_Museum.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  leipzig:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/36/Leipzig_Thomaskirche.jpg/960px-Leipzig_Thomaskirche.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  organ:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/36/Neunkirchen_am_Brand_Kirche_Orgel-20210411-RM-155230.jpg/960px-Neunkirchen_am_Brand_Kirche_Orgel-20210411-RM-155230.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  wtcManuscript:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2b/Bach-wtc1-title-ms.jpg/960px-Bach-wtc1-title-ms.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 1 (Option A): Lebensweg in Deutschland (Eisenach → Leipzig)         */
/* -------------------------------------------------------------------------- */

const LIFE_STATIONS = [
  {
    id: 'eisenach',
    date: '31. März 1685',
    title: 'Geboren in Eisenach',
    detail:
      'Johann Sebastian Bach wird in Eisenach (Thüringen) in eine große Musikerfamilie geboren. Er wächst mitten im musikalischen Barock auf.',
    src: MEDIA.eisenach,
    wikiTitle: 'Bach House (Eisenach)',
    caption: 'Das Bachhaus in seiner Geburtsstadt Eisenach (Thüringen).',
  },
  {
    id: 'barock',
    date: '1685–1750 · Barock',
    title: 'Komponist, Organist & Kirchenmusik',
    detail:
      'Bach ist einer der größten deutschen Komponisten und Organisten des Barocks — berühmt für seine gewaltige Kirchenmusik ebenso wie für Orgel-, Klavier- und Orchesterwerke.',
    src: MEDIA.portrait,
    wikiTitle: 'Johann Sebastian Bach',
    caption: 'Berühmtes Porträt von Elias Gottlob Haußmann (1746).',
  },
  {
    id: 'leipzig',
    date: '28. Juli 1750',
    title: 'Gestorben in Leipzig',
    detail:
      'Die letzten 27 Jahre seines Lebens wirkte Bach als Thomaskantor in Leipzig, wo er am 28. Juli 1750 starb und in der Thomaskirche ruht.',
    src: MEDIA.leipzig,
    wikiTitle: 'St. Thomas Church, Leipzig',
    caption: 'Die Thomaskirche in Leipzig — Bachs langjährige Wirkungsstätte und letzte Ruhestätte.',
  },
]

function Screen1BachGermanyAtlas() {
  const [stationId, setStationId] = useState('eisenach')
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
            {st.date} · {st.title.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <RealGeoMap
          center={[10.8, 51.2]}
          scale={2250}
          markers={[
            {
              id: 'eisenach',
              label: 'Eisenach',
              sublabel: 'Geboren: 31. März 1685',
              lon: 10.3156,
              lat: 50.9803,
              color: '#6D28D9',
              pulse: stationId === 'eisenach',
              active: stationId === 'eisenach',
            },
            {
              id: 'leipzig',
              label: 'Leipzig',
              sublabel: 'Gestorben: 28. Juli 1750',
              lon: 12.3731,
              lat: 51.3397,
              color: '#0071E3',
              pulse: stationId === 'leipzig',
              active: stationId === 'leipzig',
            },
            {
              id: 'berlin',
              label: 'Berlin',
              lon: 13.405,
              lat: 52.52,
              muted: true,
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
              id: 'bach-path',
              points: [
                [10.3156, 50.9803],
                [12.3731, 51.3397],
              ],
              color: '#6D28D9',
              progress: 1,
              dashed: true,
              strokeWidth: 3,
            },
          ]}
          onMarkerClick={(m) => {
            if (m.id === 'eisenach' || m.id === 'leipzig') setStationId(m.id)
          }}
          caption="Echte Deutschland-Karte (zoom- und verschiebbar): Klicke auf Eisenach oder Leipzig."
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
/*  SCREEN 2 (Option A): Was ist ein Organist? & Barockorgel-Anatomie          */
/* -------------------------------------------------------------------------- */

const ORGAN_PARTS = [
  {
    id: 'pfeifen',
    title: 'Pfeifenwerk (bis zu tausende Pfeifen)',
    desc: 'Luft strömt durch verschieden lange Holz- und Metallpfeifen — kleine Pfeifen klingen hoch, riesige Pfeifen lassen den Kirchenboden beben.',
    chord: [
      { pitch: 'D3', durationSec: 0.9, offsetSec: 0 },
      { pitch: 'A3', durationSec: 0.9, offsetSec: 0.04 },
      { pitch: 'D4', durationSec: 0.9, offsetSec: 0.08 },
      { pitch: 'F4', durationSec: 0.9, offsetSec: 0.12 },
    ] as SynthNote[],
  },
  {
    id: 'manuale',
    title: 'Manuale (Tastaturen für beide Hände)',
    desc: 'Mehrere übereinanderliegende Klaviaturen erlauben es dem Organisten, blitzschnell zwischen sanften und mächtigen Klängen zu wechseln.',
    chord: [
      { pitch: 'C4', durationSec: 0.35, offsetSec: 0 },
      { pitch: 'E4', durationSec: 0.35, offsetSec: 0.18 },
      { pitch: 'G4', durationSec: 0.35, offsetSec: 0.36 },
      { pitch: 'C5', durationSec: 0.65, offsetSec: 0.54 },
    ] as SynthNote[],
  },
  {
    id: 'pedale',
    title: 'Pedalwerk (Tastatur für die Füße!)',
    desc: 'Ein Organist spielt nicht nur mit den Händen: Mit beiden Füßen tritt er riesige Holzpedale für die tiefsten Bass-Töne der Kirchenmusik.',
    chord: [
      { pitch: 'D3', durationSec: 0.65, offsetSec: 0 },
      { pitch: 'A2', durationSec: 0.85, offsetSec: 0.45 },
    ] as SynthNote[],
  },
  {
    id: 'register',
    title: 'Registerzüge (Klangfarben-Schalter)',
    desc: 'Wie ein ganzes Orchester in einem Instrument: Register schalten Flöten-, Trompeten- oder Streicher-ähnliche Pfeifenreihen zu.',
    chord: [
      { pitch: 'G3', durationSec: 0.8, offsetSec: 0 },
      { pitch: 'B3', durationSec: 0.8, offsetSec: 0 },
      { pitch: 'D4', durationSec: 0.8, offsetSec: 0 },
      { pitch: 'G4', durationSec: 0.8, offsetSec: 0 },
    ] as SynthNote[],
  },
]

function Screen2OrganistAnatomy() {
  const [partId, setPartId] = useState('pfeifen')

  useEffect(() => {
    return () => stopAllAudio()
  }, [])

  const selectAndHear = (p: (typeof ORGAN_PARTS)[number]) => {
    setPartId(p.id)
    playMelody(p.chord)
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
      <SmartMediaImage
        src={MEDIA.organ}
        wikiTitle="Pipe organ"
        wikiLang="en"
        alt="Historische Kirchenorgel mit Pfeifenwerk"
        caption="Die Königin der Instrumente: Kirchenorgel im Stil des Barocks."
        credit="Wikimedia Commons"
        aspectClass="aspect-[4/3]"
      />

      <div className="apple-card flex flex-col justify-between gap-4 rounded-3xl p-6">
        <div className="space-y-3">
          <div className="rounded-2xl bg-[#EDE9FE] p-4">
            <span className="font-mono text-[11px] font-bold text-[#6D28D9] uppercase">
              Begriff aus deinen Notizen
            </span>
            <p className="font-apple-black mt-1 text-lg text-[#1D1D1F]">
              Ein Organist ist jemand, der Orgel spielt.
            </p>
            <p className="mt-1 text-xs font-medium text-[#515154]">
              Bach war der berühmteste Organist seiner Zeit — und nutzte Hände <em>und</em> Füße gleichzeitig für seine Kirchenmusik.
            </p>
          </div>

          <p className="text-xs font-bold text-[#86868B] uppercase">
            Klicke ein Bauteil an, um seinen Klang zu hören:
          </p>

          <div className="space-y-2">
            {ORGAN_PARTS.map((p) => {
              const active = p.id === partId
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectAndHear(p)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                    active
                      ? 'border-[#6D28D9] bg-[#F5F3FF]'
                      : 'border-black/[0.06] bg-[#F5F5F7] hover:bg-[#EFEFF4]'
                  }`}
                >
                  <div>
                    <p className="text-xs font-extrabold text-[#1D1D1F]">{p.title}</p>
                    {active && (
                      <p className="mt-1 text-xs leading-relaxed font-medium text-[#515154]">
                        {p.desc}
                      </p>
                    )}
                  </div>
                  <Volume2 className={`h-4 w-4 shrink-0 ${active ? 'text-[#6D28D9]' : 'text-[#86868B]'}`} />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 3 (Wildcard C): Spielbare Mini-Barockorgel — Toccata & Präludium    */
/* -------------------------------------------------------------------------- */

const TOCCATA_SEQUENCE = ['A4', 'G4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C#4', 'D4']

const TOCCATA_AUTOPLAY: SynthNote[] = [
  { pitch: 'A4', durationSec: 0.14, offsetSec: 0.0 },
  { pitch: 'G4', durationSec: 0.14, offsetSec: 0.15 },
  { pitch: 'A4', durationSec: 0.65, offsetSec: 0.30 },
  { pitch: 'G4', durationSec: 0.16, offsetSec: 1.08 },
  { pitch: 'F4', durationSec: 0.16, offsetSec: 1.25 },
  { pitch: 'E4', durationSec: 0.16, offsetSec: 1.42 },
  { pitch: 'D4', durationSec: 0.16, offsetSec: 1.59 },
  { pitch: 'C#4', durationSec: 0.32, offsetSec: 1.76 },
  { pitch: 'D4', durationSec: 0.9, offsetSec: 2.12 },
]

const PRELUDE_C_AUTOPLAY: SynthNote[] = [
  { pitch: 'C4', durationSec: 0.24, offsetSec: 0.0 },
  { pitch: 'E4', durationSec: 0.24, offsetSec: 0.22 },
  { pitch: 'G4', durationSec: 0.24, offsetSec: 0.44 },
  { pitch: 'C5', durationSec: 0.24, offsetSec: 0.66 },
  { pitch: 'E5', durationSec: 0.28, offsetSec: 0.88 },
  { pitch: 'G4', durationSec: 0.24, offsetSec: 1.12 },
  { pitch: 'C5', durationSec: 0.24, offsetSec: 1.34 },
  { pitch: 'E5', durationSec: 0.55, offsetSec: 1.56 },
]

const ORGAN_KEYS = [
  { pitch: 'C#4', label: 'Cis', sharp: true },
  { pitch: 'D4', label: 'D', sharp: false },
  { pitch: 'E4', label: 'E', sharp: false },
  { pitch: 'F4', label: 'F', sharp: false },
  { pitch: 'G4', label: 'G', sharp: false },
  { pitch: 'A4', label: 'A', sharp: false },
]

function Screen3PlayableBaroqueOrgan() {
  const [stepIdx, setStepIdx] = useState(0)
  const [completedOnce, setCompletedOnce] = useState(false)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [autoMode, setAutoMode] = useState<'toccata' | 'prelude' | null>(null)
  const [autoNoteIdx, setAutoNoteIdx] = useState<number | null>(null)
  const cancelRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => {
      cancelRef.current?.()
      stopAllAudio()
    }
  }, [])

  const targetPitch = TOCCATA_SEQUENCE[stepIdx]

  const handleKeyPress = (pitch: string) => {
    cancelRef.current?.()
    setAutoMode(null)
    setAutoNoteIdx(null)
    playSinglePitch(pitch, 0.45)
    setActiveKey(pitch)
    window.setTimeout(() => setActiveKey((k) => (k === pitch ? null : k)), 260)

    if (pitch === targetPitch) {
      if (stepIdx === TOCCATA_SEQUENCE.length - 1) {
        setCompletedOnce(true)
        setStepIdx(0)
      } else {
        setStepIdx((s) => s + 1)
      }
    }
  }

  const runAutoplay = (which: 'toccata' | 'prelude') => {
    if (autoMode === which) {
      cancelRef.current?.()
      setAutoMode(null)
      setAutoNoteIdx(null)
      return
    }
    cancelRef.current?.()
    setAutoMode(which)
    const notes = which === 'toccata' ? TOCCATA_AUTOPLAY : PRELUDE_C_AUTOPLAY
    const { cancel } = playMelody(notes, (idx) => {
      setAutoNoteIdx(idx)
      if (idx === null) {
        setAutoMode(null)
        setActiveKey(null)
      } else {
        setActiveKey(notes[idx]?.pitch ?? null)
      }
    })
    cancelRef.current = cancel
  }

  return (
    <div className="apple-card space-y-6 rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#6D28D9] uppercase">
            <Music className="h-4 w-4" />
            Du sitzt an Bachs Orgel · Live Web Audio
          </span>
          <h3 className="font-apple-black mt-1 text-2xl text-[#1D1D1F]">
            Spiele selbst die Toccata in d-Moll!
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => runAutoplay('toccata')}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
              autoMode === 'toccata'
                ? 'bg-[#1D1D1F] text-white'
                : 'bg-[#6D28D9] text-white hover:bg-[#5B21B6]'
            }`}
          >
            {autoMode === 'toccata' ? <Square className="h-3 w-3 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            Toccata anhören
          </button>
          <button
            type="button"
            onClick={() => runAutoplay('prelude')}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
              autoMode === 'prelude'
                ? 'bg-[#1D1D1F] text-white'
                : 'bg-[#0071E3] text-white hover:bg-[#0077ED]'
            }`}
          >
            {autoMode === 'prelude' ? <Square className="h-3 w-3 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            Präludium C-Dur anhören
          </button>
        </div>
      </div>

      {/* Glowing Piano-Roll Sequence */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#6E6E73]">
          <span>
            {autoMode === 'prelude'
              ? 'Präludium in C-Dur (Arpeggio aus „Das wohltemperierte Klavier“)'
              : 'Tippe die lila markierte Taste der Reihe nach an — Ton für Ton:'}
          </span>
          <span className="font-mono text-[#6D28D9]">
            Ton {stepIdx + 1}/{TOCCATA_SEQUENCE.length}
          </span>
        </div>

        <div className="grid grid-cols-9 gap-1.5 rounded-2xl bg-[#F5F5F7] p-3">
          {(autoMode === 'prelude' ? PRELUDE_C_AUTOPLAY.map((n) => n.pitch) : TOCCATA_SEQUENCE).map(
            (pitch, idx) => {
              const isCurrent =
                autoMode !== null ? autoNoteIdx === idx : idx === stepIdx
              const isDone = autoMode === null && idx < stepIdx
              return (
                <div
                  key={`${pitch}-${idx}`}
                  className={`flex flex-col items-center justify-center rounded-xl py-2.5 font-mono text-xs font-extrabold transition ${
                    isCurrent
                      ? 'scale-105 bg-[#6D28D9] text-white shadow-sm'
                      : isDone
                        ? 'bg-[#DCFCE7] text-[#15803D]'
                        : 'bg-white text-[#515154]'
                  }`}
                >
                  <span>{pitch.replace('4', '').replace('5', '')}</span>
                </div>
              )
            },
          )}
        </div>
      </div>

      {/* Clickable Mini-Organ Keyboard */}
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
        {ORGAN_KEYS.map((key) => {
          const isNext = autoMode === null && key.pitch === targetPitch
          const isPressed = activeKey === key.pitch
          return (
            <button
              key={key.pitch}
              type="button"
              onClick={() => handleKeyPress(key.pitch)}
              className={`relative flex h-24 flex-col items-center justify-between rounded-2xl border-2 p-3 transition active:scale-95 ${
                isPressed
                  ? 'border-[#0071E3] bg-[#E8F2FC] text-[#0071E3]'
                  : isNext
                    ? 'border-[#6D28D9] bg-[#F5F3FF] text-[#6D28D9] shadow-[0_8px_20px_-8px_rgba(109,40,217,0.45)]'
                    : key.sharp
                      ? 'border-black/15 bg-[#1D1D1F] text-white hover:bg-[#3A3A3C]'
                      : 'border-black/10 bg-white text-[#1D1D1F] hover:bg-[#F5F5F7]'
              }`}
            >
              <span className="font-mono text-[10px] font-bold opacity-65">{key.pitch}</span>
              <span className="font-apple-black text-xl">{key.label}</span>
              {isNext && (
                <span className="rounded-full bg-[#6D28D9] px-2 py-0.5 text-[9px] font-bold text-white">
                  Tippen!
                </span>
              )}
            </button>
          )
        })}
      </div>

      {completedOnce && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] p-4 text-xs font-bold text-[#14532D]">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
            Stark gespielt! Du hast gerade das berühmteste Orgel-Motiv der Musikgeschichte selbst erzeugt.
          </span>
          <button
            type="button"
            onClick={() => {
              setStepIdx(0)
              setCompletedOnce(false)
            }}
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
/*  SCREEN 4 (Option B): Die Fugen-Maschine (Polyphonie hör- & sichtbar)       */
/* -------------------------------------------------------------------------- */

const FUGUE_VOICES: Array<{
  id: 'soprano' | 'alto' | 'bass'
  name: string
  entryLabel: string
  color: string
  startBeat: number
  notes: SynthNote[]
}> = [
  {
    id: 'soprano',
    name: 'Stimme 1 · Sopran (Thema)',
    entryLabel: 'Startet sofort (Takt 1)',
    color: '#6D28D9',
    startBeat: 0,
    notes: [
      { pitch: 'C5', durationSec: 0.34, offsetSec: 0.0 },
      { pitch: 'D5', durationSec: 0.34, offsetSec: 0.38 },
      { pitch: 'E5', durationSec: 0.34, offsetSec: 0.76 },
      { pitch: 'G5', durationSec: 0.34, offsetSec: 1.14 },
      { pitch: 'F5', durationSec: 0.34, offsetSec: 1.52 },
      { pitch: 'E5', durationSec: 0.34, offsetSec: 1.90 },
      { pitch: 'D5', durationSec: 0.34, offsetSec: 2.28 },
      { pitch: 'C5', durationSec: 0.7, offsetSec: 2.66 },
    ],
  },
  {
    id: 'alto',
    name: 'Stimme 2 · Alt (Antwort zeitversetzt)',
    entryLabel: 'Setzt 2 Schläge später ein',
    color: '#0071E3',
    startBeat: 2,
    notes: [
      { pitch: 'G4', durationSec: 0.34, offsetSec: 0.76 },
      { pitch: 'A4', durationSec: 0.34, offsetSec: 1.14 },
      { pitch: 'B4', durationSec: 0.34, offsetSec: 1.52 },
      { pitch: 'D5', durationSec: 0.34, offsetSec: 1.90 },
      { pitch: 'C5', durationSec: 0.34, offsetSec: 2.28 },
      { pitch: 'B4', durationSec: 0.34, offsetSec: 2.66 },
      { pitch: 'A4', durationSec: 0.34, offsetSec: 3.04 },
      { pitch: 'G4', durationSec: 0.7, offsetSec: 3.42 },
    ],
  },
  {
    id: 'bass',
    name: 'Stimme 3 · Orgel-Bass (Fundament)',
    entryLabel: 'Setzt 4 Schläge später ein',
    color: '#0F766E',
    startBeat: 4,
    notes: [
      { pitch: 'C3', durationSec: 0.34, offsetSec: 1.52 },
      { pitch: 'D3', durationSec: 0.34, offsetSec: 1.90 },
      { pitch: 'E3', durationSec: 0.34, offsetSec: 2.28 },
      { pitch: 'G3', durationSec: 0.34, offsetSec: 2.66 },
      { pitch: 'F3', durationSec: 0.34, offsetSec: 3.04 },
      { pitch: 'E3', durationSec: 0.34, offsetSec: 3.42 },
      { pitch: 'D3', durationSec: 0.34, offsetSec: 3.80 },
      { pitch: 'C3', durationSec: 0.75, offsetSec: 4.18 },
    ],
  },
]

function Screen4FugueMachine() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    soprano: true,
    alto: true,
    bass: true,
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [playheadPct, setPlayheadPct] = useState(0)
  const cancelRef = useRef<(() => void) | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      cancelRef.current?.()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      stopAllAudio()
    }
  }, [])

  const toggleVoice = (id: string) => {
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const playFugue = () => {
    if (isPlaying) {
      cancelRef.current?.()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      setIsPlaying(false)
      setPlayheadPct(0)
      return
    }

    const activeNotes: SynthNote[] = []
    for (const v of FUGUE_VOICES) {
      if (enabled[v.id]) activeNotes.push(...v.notes)
    }
    if (activeNotes.length === 0) return

    setIsPlaying(true)
    const { totalMs, cancel } = playMelody(activeNotes, (idx) => {
      if (idx === null) {
        setIsPlaying(false)
        setPlayheadPct(0)
      }
    })
    cancelRef.current = cancel

    const startTs = performance.now()
    const tick = (now: number) => {
      const pct = Math.min(100, ((now - startTs) / Math.max(1, totalMs)) * 100)
      setPlayheadPct(pct)
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const activeCount = Object.values(enabled).filter(Boolean).length

  return (
    <div className="apple-card space-y-6 rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#0071E3] uppercase">
            <Layers className="h-4 w-4" />
            Die Fugen-Maschine · Polyphonie live begreifen
          </span>
          <h3 className="font-apple-black mt-1 text-2xl text-[#1D1D1F]">
            Warum heißt es „Toccata &amp; Fuge“ / „Präludium &amp; Fuge“?
          </h3>
          <p className="mt-1 text-xs font-medium text-[#515154]">
            In einer <strong>Fuge</strong> jagen sich mehrere Stimmen mit demselben Thema zeitversetzt (wie ein kunstvoller Kanon). Schalte Stimmen an oder aus und höre den Unterschied!
          </p>
        </div>

        <button
          type="button"
          disabled={activeCount === 0}
          onClick={playFugue}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition disabled:opacity-40 ${
            isPlaying ? 'bg-[#1D1D1F]' : 'bg-[#6D28D9] hover:bg-[#5B21B6]'
          }`}
        >
          {isPlaying ? <Square className="h-3.5 w-3.5 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
          <span>{isPlaying ? 'Stopp' : `Fuge abspielen (${activeCount} Stimmen)`}</span>
        </button>
      </div>

      {/* 3-Voice Visual Timeline Mixer */}
      <div className="relative space-y-3 rounded-2xl bg-[#F5F5F7] p-4">
        {isPlaying && (
          <div
            style={{ left: `${playheadPct}%` }}
            className="pointer-events-none absolute top-2 bottom-2 z-10 w-0.5 bg-[#1D1D1F]"
          />
        )}

        {FUGUE_VOICES.map((voice) => {
          const isOn = enabled[voice.id]
          return (
            <div
              key={voice.id}
              className={`rounded-2xl border bg-white p-3.5 transition ${
                isOn ? 'border-black/10 opacity-100' : 'border-black/[0.04] opacity-45'
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold text-[#1D1D1F]">{voice.name}</span>
                  <span className="ml-2 text-[11px] font-medium text-[#86868B]">
                    {voice.entryLabel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleVoice(voice.id)}
                  style={isOn ? { backgroundColor: voice.color } : undefined}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                    isOn ? 'text-white' : 'bg-[#EFEFF4] text-[#6E6E73]'
                  }`}
                >
                  {isOn ? 'Aktiv' : 'Stumm'}
                </button>
              </div>

              {/* Staggered Note Blocks */}
              <div className="grid grid-cols-12 gap-1">
                {Array.from({ length: 12 }).map((_, beat) => {
                  const hasNote = beat >= voice.startBeat && beat < voice.startBeat + 8
                  return (
                    <div
                      key={beat}
                      style={hasNote && isOn ? { backgroundColor: voice.color } : undefined}
                      className={`h-5 rounded-md transition ${
                        hasNote ? (isOn ? 'opacity-90' : 'bg-[#CBD5E1]') : 'bg-[#F2F2F7]'
                      }`}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs font-medium text-[#515154]">
        <strong>Aha-Moment:</strong> Hör dir erst nur <em>Stimme 1</em> an und schalte dann <em>Alt</em> und <em>Orgel-Bass</em> dazu — sofort spürst du Bachs typische barocke Klang-Architektur!
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 5 (Option A + B): Die 4 Meisterwerke im Konzertsaal (YouTube HD)    */
/* -------------------------------------------------------------------------- */

const BACH_WORKS = [
  {
    id: 'toccata',
    title: 'Toccata und Fuge in d-Moll',
    collection: 'BWV 565 · Orgelwerk',
    instrument: 'Kirchenorgel',
    mood: 'Dramatisch & gewaltig',
    desc: 'Das wohl mit Abstand bekannteste Orgelwerk der gesamten Kunstmusik — unverwechselbar ab dem allerersten Motiv.',
    videoId: 'Pi0IuyTS_ic',
    start: 6,
    end: 95,
    channel: 'Netherlands Bach Society',
  },
  {
    id: 'air',
    title: 'Air',
    collection: 'Aus der Orchestersuite Nr. 3 (BWV 1068)',
    instrument: 'Streicher & Cembalo',
    mood: 'Ruhig, zeitlos & schwebend',
    desc: 'Eine der berühmtesten und friedlichsten Melodien der Klassik — getragen von einem gleichmäßig schreitenden Bass.',
    videoId: 'oqU4rF_ysQo',
    start: 375,
    end: 495,
    channel: 'Netherlands Bach Society',
  },
  {
    id: 'praeludium',
    title: 'Präludium und Fuge in C-Dur',
    collection: 'Aus „Das wohltemperierte Klavier“ (BWV 846)',
    instrument: 'Tasteninstrument / Cembalo / Klavier',
    mood: 'Klar, perlend & harmonisch',
    desc: 'Eröffnet Bachs legendäre Sammlung durch alle 24 Tonarten mit sanft zerlegten Akkorden voller Ruhe.',
    videoId: 'IZ2pNhh6D1w',
    start: 5,
    end: 105,
    channel: 'Netherlands Bach Society',
  },
  {
    id: 'brandenburg',
    title: 'Brandenburgisches Konzert',
    collection: 'Nr. 3 in G-Dur (BWV 1048)',
    instrument: 'Barockorchester (Streicher)',
    mood: 'Festlich, energisch & tänzerisch',
    desc: 'Meisterwerk barocker Orchestermusik: Neun Streicher werfen sich das lebendige Thema wie ein musikalisches Gespräch zu.',
    videoId: 'qr0f6t2UbOo',
    start: 10,
    end: 115,
    channel: 'Netherlands Bach Society',
  },
]

function Screen5FourMasterpieces() {
  const [workId, setWorkId] = useState('toccata')
  const work = BACH_WORKS.find((w) => w.id === workId) ?? BACH_WORKS[0]

  return (
    <div className="space-y-4">
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {BACH_WORKS.map((w) => {
          const active = w.id === workId
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => setWorkId(w.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                active
                  ? 'border-[#6D28D9] bg-[#F5F3FF] shadow-xs'
                  : 'border-black/[0.07] bg-white hover:bg-[#F5F5F7]'
              }`}
            >
              <span className="font-mono text-[10px] font-bold text-[#6D28D9] uppercase">
                {w.instrument}
              </span>
              <p className="mt-1 text-sm font-extrabold text-[#1D1D1F]">{w.title}</p>
              <p className="mt-0.5 text-[11px] font-medium text-[#6E6E73]">{w.mood}</p>
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
          title={`${work.title} (${work.collection})`}
          channel={work.channel}
          segmentLabel="Original-Konzertaufnahme"
        />

        <div className="space-y-4">
          <div className="apple-card rounded-3xl p-5">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#6D28D9] uppercase">
              <Film className="h-3.5 w-3.5" />
              {work.collection}
            </span>
            <h3 className="font-apple-black mt-1 text-xl text-[#1D1D1F]">{work.title}</h3>
            <p className="mt-2 text-xs leading-relaxed font-medium text-[#515154]">{work.desc}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#F2F2F7] px-3 py-1 text-[11px] font-bold text-[#1D1D1F]">
                Besetzung: {work.instrument}
              </span>
              <span className="rounded-full bg-[#EDE9FE] px-3 py-1 text-[11px] font-bold text-[#6D28D9]">
                {work.mood}
              </span>
            </div>
          </div>

          <SmartMediaImage
            src={MEDIA.wtcManuscript}
            wikiTitle="The Well-Tempered Clavier"
            wikiLang="en"
            alt="Original-Titelseite von Bachs Das wohltemperierte Klavier (1722)"
            caption="Bachs Original-Handschrift: „Das Wohltemperirte Clavier“ (1722)."
            credit="Wikimedia Commons"
            aspectClass="aspect-[4/3]"
          />
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 6 (Option A + C): Barock-Einordnung & Schneller Werk-Radar          */
/* -------------------------------------------------------------------------- */

const RADAR_QUESTIONS = [
  {
    id: 'r1',
    clue: 'Welches Werk gilt als das wohl bekannteste Orgelwerk der gesamten Kunstmusik?',
    answer: 'Toccata und Fuge in d-Moll',
    options: ['Air', 'Toccata und Fuge in d-Moll', 'Brandenburgisches Konzert'],
  },
  {
    id: 'r2',
    clue: 'Aus welcher berühmten Sammlung stammt „Präludium und Fuge in C-Dur“?',
    answer: 'Das wohltemperierte Klavier',
    options: ['Die vier Jahreszeiten', 'Das wohltemperierte Klavier', 'Die Zauberflöte'],
  },
]

function Screen6BaroqueAndRadar() {
  const [answers, setAnswers] = useState<Record<string, string>>({})

  return (
    <div className="space-y-5">
      {/* Epoch Context Strip */}
      <div className="apple-card space-y-4 rounded-3xl p-6">
        <span className="font-mono text-[11px] font-bold text-[#6D28D9] uppercase">
          Musikgeschichte · Epoche
        </span>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border-2 border-[#6D28D9] bg-[#F5F3FF] p-4">
            <span className="font-mono text-xs font-extrabold text-[#6D28D9]">1600–1750 · BAROCK</span>
            <p className="font-apple-black mt-1 text-lg text-[#1D1D1F]">Johann Sebastian Bach</p>
            <p className="mt-1 text-xs font-medium text-[#515154]">
              1685–1750 · Sein Tod im Jahr 1750 gilt sogar als das offizielle Ende der Barock-Epoche!
            </p>
          </div>
          <div className="rounded-2xl bg-[#F5F5F7] p-4">
            <span className="font-mono text-xs font-bold text-[#86868B]">1750–1820 · KLASSIK</span>
            <p className="font-apple-display mt-1 text-base text-[#515154]">Mozart &amp; Haydn</p>
            <p className="mt-1 text-xs font-medium text-[#86868B]">
              Folgten direkt auf Bachs Barock und studierten seine Fugen bewundernd.
            </p>
          </div>
          <div className="rounded-2xl bg-[#F5F5F7] p-4">
            <span className="font-mono text-xs font-bold text-[#86868B]">AB 1820 · ROMANTIK</span>
            <p className="font-apple-display mt-1 text-base text-[#515154]">Beethoven → Mendelssohn</p>
            <p className="mt-1 text-xs font-medium text-[#86868B]">
              Machten Bachs Werke 100 Jahre später weltweit wieder berühmt.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Warmup Work Radar */}
      <div className="apple-card space-y-4 rounded-3xl p-6">
        <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-[#0071E3] uppercase">
          <Sparkles className="h-4 w-4" />
          <span>Werk-Schnellcheck vor den Prüfungen</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {RADAR_QUESTIONS.map((q) => {
            const picked = answers[q.id]
            const right = picked === q.answer
            return (
              <div key={q.id} className="space-y-3 rounded-2xl bg-[#F5F5F7] p-4">
                <p className="text-sm font-extrabold text-[#1D1D1F]">{q.clue}</p>
                <div className="grid gap-1.5">
                  {q.options.map((opt) => {
                    const isPicked = picked === opt
                    const isRightOpt = Boolean(picked) && opt === q.answer
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={Boolean(picked)}
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                        className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs font-bold transition ${
                          isRightOpt
                            ? 'border-[#86EFAC] bg-[#F0FDF4] text-[#14532D]'
                            : isPicked && !right
                              ? 'border-[#FCA5A5] bg-[#FEF2F2] text-[#7F1D1D]'
                              : 'border-black/[0.08] bg-white text-[#1D1D1F] hover:border-[#6D28D9]'
                        }`}
                      >
                        <span>{opt}</span>
                        {isRightOpt && <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />}
                        {isPicked && !right && <XCircle className="h-4 w-4 text-[#DC2626]" />}
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

const johannSebastianBachLesson: LessonDefinition = {
  id: 'musik-johann-sebastian-bach',
  slug: 'johann-sebastian-bach',
  categoryId: 'musik',
  title: 'Johann Sebastian Bach (1685–1750) — Architekt des Barocks',
  subtitle:
    'Von Eisenach bis Leipzig: Spiele selbst die Toccata in d-Moll auf der Barockorgel, baue eine Fuge im Stimmen-Mixer und höre alle 4 Schlüsselwerke im Original.',
  eraOrContext: '1685–1750 · Barock',
  estimatedMinutes: 8,
  difficulty: 'Einstieg',
  xpReward: 240,
  heroMedia: {
    src: MEDIA.portrait,
    wikiTitle: 'Johann Sebastian Bach',
    wikiLang: 'en',
    alt: 'Porträt von Johann Sebastian Bach (Elias Gottlob Haußmann, 1746)',
    credit: 'Wikimedia Commons',
  },
  keyTakeaways: [
    'Johann Sebastian Bach (1685–1750) war ein deutscher Komponist und Organist (Orgelspieler) des Barocks, berühmt für seine Kirchenmusik.',
    'Er wurde am 31. März 1685 in Eisenach geboren und starb am 28. Juli 1750 in Leipzig.',
    'Die „Toccata und Fuge in d-Moll“ ist das wohl mit Abstand bekannteste Orgelwerk der gesamten Kunstmusik.',
    'Weitere weltberühmte Werke: „Air“, „Präludium und Fuge in C-Dur“ aus „Das wohltemperierte Klavier“ sowie das „Brandenburgische Konzert“.',
  ],
  screens: [
    {
      id: 'bach-deutschland-atlas',
      badge: '01 · Biografie & Atlas',
      title: 'Von Eisenach (1685) nach Leipzig (1750)',
      subtitle:
        'Verorte Geburts- und Sterbeort auf der zoombaren Deutschland-Karte und lerne den berühmtesten Komponisten des Barocks kennen.',
      component: Screen1BachGermanyAtlas,
    },
    {
      id: 'organist-orgel',
      badge: '02 · Organist & Kirchenmusik',
      title: 'Was macht ein Organist an der Barockorgel?',
      subtitle:
        'Klicke durch Pfeifen, Manuale, Pedale und Register und höre, wie ein einziger Musiker ein ganzes Klang-Orchester steuert.',
      component: Screen2OrganistAnatomy,
    },
    {
      id: 'spielbare-orgel',
      badge: '03 · Spielbare Mini-Barockorgel',
      title: 'Spiele selbst die Toccata in d-Moll',
      subtitle:
        'Tippe die leuchtenden Tasten nach oder starte den Auto-Play-Vergleich mit dem Präludium in C-Dur.',
      component: Screen3PlayableBaroqueOrgan,
    },
    {
      id: 'fugen-maschine',
      badge: '04 · Interaktives Klang-Labor',
      title: 'Die Fugen-Maschine: Musik als hörbare Architektur',
      subtitle:
        'Schalte Sopran, Alt und Orgel-Bass einzeln zu und erlebe live, wie sich Stimmen in einer Barock-Fuge verschränken.',
      component: Screen4FugueMachine,
    },
    {
      id: 'vier-meisterwerke',
      badge: '05 · Konzertsaal (Original-Aufnahmen)',
      title: 'Bachs 4 Schlüsselwerke im direkten Hörvergleich',
      subtitle:
        'Toccata und Fuge in d-Moll, Air, Präludium und Fuge in C-Dur und das Brandenburgische Konzert — live von der Netherlands Bach Society.',
      component: Screen5FourMasterpieces,
    },
    {
      id: 'epoche-radar',
      badge: '06 · Epoche & Werk-Radar',
      title: 'Der Höhepunkt des Barocks — und dein Schnellcheck',
      subtitle:
        'Ordne Bach zeitlich vor Mozart und Beethoven ein und mache dich warm für die 4 visuellen Prüfungen.',
      component: Screen6BaroqueAndRadar,
    },
  ],
  quizzes: [
    {
      id: 'bach-quiz-toccata-audio',
      lessonId: 'musik-johann-sebastian-bach',
      categoryId: 'musik',
      type: 'audio-match',
      prompt: 'Höre das berühmte Orgel-Eröffnungsmotiv an — welches Meisterwerk von Bach erklingt hier?',
      explanation:
        'Das unverwechselbare Motiv (A–G–A – G–F–E–D–Cis–D) eröffnet Bachs „Toccata und Fuge in d-Moll“, das wohl bekannteste Orgelwerk der gesamten Kunstmusik.',
      audio: {
        mode: 'tone',
        label: 'Berühmtes Orgel-Motiv von J. S. Bach',
        notes: [
          { pitch: 'A4', duration: '16n', timeOffset: 0.0 },
          { pitch: 'G4', duration: '16n', timeOffset: 0.15 },
          { pitch: 'A4', duration: '2n', timeOffset: 0.30 },
          { pitch: 'G4', duration: '16n', timeOffset: 1.05 },
          { pitch: 'F4', duration: '16n', timeOffset: 1.22 },
          { pitch: 'E4', duration: '16n', timeOffset: 1.39 },
          { pitch: 'D4', duration: '16n', timeOffset: 1.56 },
          { pitch: 'C#4', duration: '4n', timeOffset: 1.73 },
          { pitch: 'D4', duration: '2n', timeOffset: 2.10 },
        ],
      },
      options: [
        { id: 'toccata', label: 'Toccata und Fuge in d-Moll', description: 'Bekanntestes Orgelwerk der Kunstmusik' },
        { id: 'air', label: 'Air', description: 'Ruhiges, schwebendes Streicherwerk' },
        { id: 'praeludium', label: 'Präludium und Fuge in C-Dur', description: 'Aus „Das wohltemperierte Klavier“' },
        { id: 'brandenburg', label: 'Brandenburgisches Konzert', description: 'Festliches Barock-Orchesterwerk' },
      ],
      correctOptionId: 'toccata',
    },
    {
      id: 'bach-quiz-eisenach-map',
      lessonId: 'musik-johann-sebastian-bach',
      categoryId: 'musik',
      type: 'map-pin',
      prompt: 'Wo wurde Johann Sebastian Bach am 31. März 1685 geboren?',
      hint: 'Suche in Thüringen (Mitte Deutschlands), westlich von Leipzig — du kannst bis 8× hineinzoomen!',
      explanation:
        'Johann Sebastian Bach wurde am 31. März 1685 in Eisenach (Thüringen) geboren und starb am 28. Juli 1750 in Leipzig.',
      target: {
        label: 'Eisenach',
        lon: 10.3156,
        lat: 50.9803,
      },
      toleranceKm: 120,
      mapView: {
        center: [10.6, 51.1],
        scale: 2100,
      },
      contextPins: [
        { label: 'Leipzig (Sterbeort)', lon: 12.3731, lat: 51.3397, muted: true },
        { label: 'Berlin', lon: 13.405, lat: 52.52, muted: true },
      ],
    },
    {
      id: 'bach-quiz-works-connect',
      lessonId: 'musik-johann-sebastian-bach',
      categoryId: 'musik',
      type: 'visual-connect',
      prompt: 'Verbinde jedes Bach-Werk (und jeden Begriff) mit seiner genauen Beschreibung.',
      explanation:
        'Toccata in d-Moll = bekanntestes Orgelwerk; Präludium in C-Dur = aus „Das wohltemperierte Klavier“; Air = berühmtes ruhiges Werk; Organist = jemand, der Orgel spielt.',
      leftColumnTitle: 'Werk / Begriff',
      rightColumnTitle: 'Beschreibung',
      pairs: [
        {
          id: 'toccata',
          left: 'Toccata und Fuge in d-Moll',
          right: 'Wohl bekanntestes Orgelwerk der Kunstmusik',
        },
        {
          id: 'wtc',
          left: 'Präludium und Fuge in C-Dur',
          right: 'Stammt aus „Das wohltemperierte Klavier“',
        },
        {
          id: 'air',
          left: 'Air',
          right: 'Berühmtes, ruhiges Werk für Streicher',
        },
        {
          id: 'organist',
          left: 'Organist',
          right: 'Jemand, der Orgel spielt',
        },
      ],
    },
    {
      id: 'bach-quiz-birth-year',
      lessonId: 'musik-johann-sebastian-bach',
      categoryId: 'musik',
      type: 'slider-estimate',
      prompt: 'In welchem Jahr wurde Johann Sebastian Bach in Eisenach geboren?',
      hint: 'Im Hochbarock — er starb 65 Jahre später im Jahr 1750 in Leipzig.',
      explanation:
        'Johann Sebastian Bach wurde am 31. März 1685 in Eisenach geboren und starb am 28. Juli 1750 in Leipzig.',
      min: 1600,
      max: 1780,
      step: 1,
      unit: '',
      targetValue: 1685,
      tolerance: 15,
    },
  ],
}

export default johannSebastianBachLesson
