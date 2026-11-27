import { motion } from 'framer-motion'
import {
  AlertTriangle,
  BookOpen,
  Brain,
  CheckCircle2,
  Compass,
  Film,
  HelpCircle,
  MessageCircle,
  RotateCcw,
  Scale,
  Sparkles,
  UserCheck,
} from 'lucide-react'
import { useState } from 'react'
import { RealGeoMap } from '../../components/geo/RealGeoMap'
import { SmartMediaImage } from '../../components/media/SmartMediaImage'
import { SmartVideoPlayer } from '../../components/media/SmartVideoPlayer'
import type { LessonDefinition } from '../../types/yuno'

/* -------------------------------------------------------------------------- */
/*  SCREEN 1: Athen vor 2.500 Jahren (Echte Karte + Biografie-Karten)          */
/* -------------------------------------------------------------------------- */

interface BioCard {
  id: string
  tag: string
  title: string
  detail: string
  wikiTitle: string
  wikiCaption: string
}

const BIO_CARDS: BioCard[] = [
  {
    id: 'athen',
    tag: '469–399 v. Chr.',
    title: 'Stadtstaat Athen (vor ca. 2.500 Jahren)',
    detail:
      'Sokrates verbrachte fast sein gesamtes Leben in Athen und gilt bis heute als einer der Begründer der westlichen Philosophie.',
    wikiTitle: 'Ancient_Agora_of_Athens',
    wikiCaption: 'Die antike Agora von Athen — genau hier schlenderte Sokrates über die Marktplätze.',
  },
  {
    id: 'beruf',
    tag: 'Herkunft',
    title: 'Steinmetz & Sohn einer Hebamme',
    detail:
      'Von Beruf war er Steinmetz, doch seine Leidenschaft war das Gespräch auf den Marktplätzen. Nach dem Beruf seiner Mutter nannte er seine Fragetechnik „Hebammenkunst“.',
    wikiTitle: 'Socrates',
    wikiCaption: 'Marmorbüste des Sokrates im Louvre (römische Kopie nach griechischem Original).',
  },
  {
    id: 'platon',
    tag: 'Überlieferung',
    title: 'Kein einziges eigenes Buch',
    detail:
      'Sokrates hat selbst nichts aufgeschrieben — er vertraute dem lebendigen Gespräch. Wir kennen seine Gedanken vor allem durch seinen berühmtesten Schüler Platon.',
    wikiTitle: 'Plato',
    wikiCaption: 'Büste von Platon (Kapitolinische Museen) — er hielt Sokrates’ Dialoge für die Nachwelt fest.',
  },
]

function Screen1AthensAtlas() {
  const [selectedId, setSelectedId] = useState<string>('athen')
  const active = BIO_CARDS.find((c) => c.id === selectedId) ?? BIO_CARDS[0]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {BIO_CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => setSelectedId(card.id)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              selectedId === card.id
                ? 'bg-[#1D1D1F] text-white shadow-xs'
                : 'bg-white text-[#515154] ring-1 ring-black/[0.08] hover:bg-[#EFEFF4] hover:text-[#1D1D1F]'
            }`}
          >
            {card.tag} · {card.title.split(' (')[0]}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <RealGeoMap
          center={[23.2, 38.4]}
          scale={2100}
          markers={[
            {
              id: 'athens',
              label: 'Athen (Agora)',
              sublabel: '469–399 v. Chr.',
              lon: 23.7275,
              lat: 37.9838,
              color: '#4338CA',
              pulse: true,
              active: true,
            },
            {
              id: 'sparta',
              label: 'Sparta',
              lon: 22.4297,
              lat: 37.0745,
              muted: true,
            },
            {
              id: 'delphi',
              label: 'Delphi',
              lon: 22.501,
              lat: 38.4824,
              muted: true,
            },
          ]}
          caption="Echte Griechenland-Karte (Natural Earth 50m): Im Stadtstaat Athen diskutierte Sokrates öffentlich auf der Agora."
        />

        <div className="flex flex-col justify-between gap-4">
          <SmartMediaImage
            wikiTitle={active.wikiTitle}
            wikiLang="en"
            alt={active.wikiCaption}
            caption={active.wikiCaption}
            credit="Wikimedia Commons"
            aspectClass="aspect-[4/3]"
            fit="contain"
          />

          <div className="apple-card rounded-3xl p-5">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#4338CA] uppercase">
              <Compass className="h-3.5 w-3.5" />
              {active.tag}
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
/*  SCREEN 2: Die Mäeutik & Das Scheinwissen-Labor                             */
/* -------------------------------------------------------------------------- */

function Screen2MaieutikLab() {
  const [certainty, setCertainty] = useState(85) // 100 = Scheinwissen, 0 = "Ich weiß, dass ich nichts weiß"
  const [activeStep, setActiveStep] = useState(0)

  const openness = 100 - certainty
  const isSocraticMindset = certainty <= 25

  const steps = [
    {
      num: '01',
      title: 'Scheinwissen entlarven',
      desc: 'Jemand glaubt ungeprüft, die Antwort längst zu kennen — genau das blockiert echtes Nachdenken.',
    },
    {
      num: '02',
      title: 'Gezielte Rückfragen (Mäeutik)',
      desc: 'Wie eine Hebamme hilft Sokrates durch kluge Fragen dabei, Widersprüche selbst zu entdecken — ohne Vortrag.',
    },
    {
      num: '03',
      title: 'Geburt eigener Erkenntnis',
      desc: 'Erst wer annimmt, nichts zu wissen, prüft selbst und gelangt zu einer echten, eigenen Einsicht.',
    },
  ]

  return (
    <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
      {/* Interactive Certainty vs Knowledge Slider */}
      <div className="apple-card flex flex-col justify-between space-y-5 rounded-3xl p-6">
        <div>
          <span className="font-mono text-[11px] font-bold text-[#4338CA] uppercase">
            Erkenntnis-Labor · Kernbotschaft
          </span>
          <h3 className="font-apple-black mt-1 text-2xl text-[#1D1D1F]">
            „Ich weiß, dass ich nichts weiß.“
          </h3>
          <p className="mt-1 text-xs leading-relaxed font-medium text-[#515154]">
            Ziehe den Regler von „Ich weiß schon alles“ nach links und beobachte, ab wann echte Erkenntnis entsteht.
          </p>
        </div>

        {/* Visual Dual Gauge */}
        <div className="space-y-4 rounded-2xl bg-[#F5F5F7] p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-4 shadow-xs">
              <span className="text-[11px] font-bold text-[#86868B] uppercase">Scheinwissen</span>
              <p className="font-apple-black mt-1 text-3xl text-[#1D1D1F] tabular-nums">
                {certainty}%
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-xs">
              <span className="text-[11px] font-bold text-[#4338CA] uppercase">Raum für Wahrheit</span>
              <p className="font-apple-black mt-1 text-3xl text-[#4338CA] tabular-nums">
                {openness}%
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min={0}
              max={100}
              value={certainty}
              onChange={(e) => setCertainty(Number(e.target.value))}
              className="yuno-slider w-full"
              style={{ ['--slider-accent' as string]: '#4338CA' }}
            />
            <div className="flex justify-between text-[11px] font-bold text-[#6E6E73]">
              <span>„Ich weiß, dass ich nichts weiß“</span>
              <span>„Ich glaube alles ungeprüft“</span>
            </div>
          </div>
        </div>

        <div
          className={`rounded-2xl border p-4 text-xs leading-relaxed font-medium transition ${
            isSocraticMindset
              ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#14532D]'
              : 'border-black/[0.08] bg-[#FAFAFC] text-[#515154]'
          }`}
        >
          {isSocraticMindset ? (
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
              <span>
                <strong>Sokratischer Durchbruch!</strong> Weil du zugibst, die Antwort noch nicht sicher zu kennen, bist du offen für echtes Prüfen und eigenes Denken.
              </span>
            </div>
          ) : (
            <span>
              <strong>Tipp:</strong> Solange der Regler rechts steht, hörst du nicht mehr richtig zu — ziehe das Scheinwissen unter 25 %, um die sokratische Haltung zu erleben.
            </span>
          )}
        </div>
      </div>

      {/* 3-Step Maieutik Stepper */}
      <div className="apple-card flex flex-col justify-between gap-4 rounded-3xl p-6">
        <div>
          <span className="font-mono text-[11px] font-bold text-[#0071E3] uppercase">
            Hebammenkunst · Fachbegriff: Mäeutik
          </span>
          <h3 className="font-apple-display mt-1 text-lg text-[#1D1D1F]">
            So wird ein Gedanke geboren
          </h3>
        </div>

        <div className="space-y-2.5">
          {steps.map((st, idx) => {
            const active = activeStep === idx
            return (
              <button
                key={st.num}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  active
                    ? 'border-[#4338CA] bg-[#EEF2FF]'
                    : 'border-black/[0.06] bg-[#F5F5F7] hover:bg-[#EFEFF4]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${
                      active ? 'bg-[#4338CA] text-white' : 'bg-white text-[#515154]'
                    }`}
                  >
                    {st.num}
                  </span>
                  <span className="text-sm font-extrabold text-[#1D1D1F]">{st.title}</span>
                </div>
                <p className="mt-2 pl-9 text-xs leading-relaxed font-medium text-[#515154]">
                  {st.desc}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 3 (Wildcard C): Spielbarer Sokrates-Dialog auf der Agora            */
/* -------------------------------------------------------------------------- */

interface DialogueStage {
  socratesSays: string
  scheinwissenPct: number
  choices?: Array<{ label: string; reply: string; nextStage: number }>
  ahaConclusion?: string
}

const DIALOGUE_STAGES: DialogueStage[] = [
  {
    socratesSays:
      '„Guten Morgen auf der Agora! Sag mir eins: Was macht für dich ein gerechtes Leben aus?“',
    scheinwissenPct: 100,
    choices: [
      {
        label: '„Immer genau das tun, was die Gesetze sagen.“',
        reply: 'Du antwortest selbstbewusst: Gesetze reichen aus.',
        nextStage: 1,
      },
      {
        label: '„Einfach immer die Wahrheit sagen und niemandem schaden.“',
        reply: 'Du gibst eine klassische Alltagsregel als Antwort.',
        nextStage: 1,
      },
    ],
  },
  {
    socratesSays:
      '„Interessant! Aber stell dir vor, ein wütender Freund will seine geliehene Waffe zurück, um jemanden zu verletzen. Wäre es da wirklich gerecht, blind einer starren Regel zu folgen?“',
    scheinwissenPct: 55,
    choices: [
      {
        label: '„Nein… da müsste man selbst abwägen, was wirklich gut ist.“',
        reply: 'Deine erste Gewissheit gerät ins Wanken.',
        nextStage: 2,
      },
      {
        label: '„Hm, meine einfache Definition hat tatsächlich eine Lücke.“',
        reply: 'Du merkst: Auswendig gelernte Regeln reichen nicht.',
        nextStage: 2,
      },
    ],
  },
  {
    socratesSays:
      '„Siehst du! Ich habe dir keinen Vortrag gehalten — und trotzdem merkst du selbst, dass die erste Antwort nicht genügt. Was brauchst du also als Erstes, um der Wahrheit näherzukommen?“',
    scheinwissenPct: 20,
    choices: [
      {
        label: '„Die Ehrlichkeit zuzugeben, dass ich es noch nicht wirklich weiß — und weiterzufragen!“',
        reply: 'Der sokratische Funke springt über.',
        nextStage: 3,
      },
    ],
  },
  {
    socratesSays:
      '„Genau das ist meine Hebammenkunst (Mäeutik)! Der Gedanke war schon in dir — meine Fragen haben dir nur geholfen, ihn selbst zur Welt zu bringen.“',
    scheinwissenPct: 0,
    ahaConclusion:
      'Du hast die sokratische Methode gerade selbst erlebt: Nicht ein Vortrag, sondern gezieltes Zweifeln und Nachfragen hat dein eigenes Denken geweckt.',
  },
]

function Screen3AgoraDialogue() {
  const [stageIdx, setStageIdx] = useState(0)
  const [history, setHistory] = useState<Array<{ speaker: 'Sokrates' | 'Du'; text: string }>>([
    { speaker: 'Sokrates', text: DIALOGUE_STAGES[0].socratesSays },
  ])

  const stage = DIALOGUE_STAGES[stageIdx]

  const pickChoice = (choice: { label: string; nextStage: number }) => {
    const nextStageObj = DIALOGUE_STAGES[choice.nextStage]
    setHistory((prev) => [
      ...prev,
      { speaker: 'Du', text: choice.label },
      { speaker: 'Sokrates', text: nextStageObj.socratesSays },
    ])
    setStageIdx(choice.nextStage)
  }

  const resetDialogue = () => {
    setStageIdx(0)
    setHistory([{ speaker: 'Sokrates', text: DIALOGUE_STAGES[0].socratesSays }])
  }

  return (
    <div className="apple-card space-y-5 rounded-3xl p-6">
      {/* Header + Scheinwissen Meter */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/[0.06] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#4338CA]">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="font-mono text-[11px] font-bold text-[#4338CA] uppercase">
              Interaktiver Dialog · Marktplatz Athen
            </p>
            <h3 className="font-apple-display text-base text-[#1D1D1F]">
              Gespräch mit Sokrates
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-40">
            <div className="mb-1 flex justify-between text-[11px] font-bold">
              <span className="text-[#6E6E73]">Scheinwissen</span>
              <span className="font-mono text-[#1D1D1F]">{stage.scheinwissenPct}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#EFEFF4]">
              <motion.div
                animate={{ width: `${stage.scheinwissenPct}%` }}
                transition={{ duration: 0.45 }}
                className="h-full rounded-full bg-[#4338CA]"
              />
            </div>
          </div>

          {stageIdx > 0 && (
            <button
              type="button"
              onClick={resetDialogue}
              className="inline-flex items-center gap-1 rounded-full bg-[#F2F2F7] px-3 py-1.5 text-xs font-bold text-[#515154] hover:bg-[#E5E5EA] hover:text-[#1D1D1F]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Neu
            </button>
          )}
        </div>
      </div>

      {/* Chat Transcript */}
      <div className="space-y-3">
        {history.map((msg, i) => {
          const isSocrates = msg.speaker === 'Sokrates'
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isSocrates ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isSocrates
                    ? 'bg-[#F5F5F7] font-medium text-[#1D1D1F]'
                    : 'bg-[#0071E3] font-semibold text-white'
                }`}
              >
                <span
                  className={`mb-1 block text-[10px] font-bold uppercase ${
                    isSocrates ? 'text-[#4338CA]' : 'text-white/75'
                  }`}
                >
                  {msg.speaker}
                </span>
                {msg.text}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* User Choices or Aha Conclusion */}
      {stage.choices ? (
        <div className="space-y-2 border-t border-black/[0.06] pt-4">
          <p className="text-xs font-bold text-[#86868B] uppercase">Deine Antwort wählen:</p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {stage.choices.map((ch) => (
              <button
                key={ch.label}
                type="button"
                onClick={() => pickChoice(ch)}
                className="rounded-2xl border border-black/[0.08] bg-white p-4 text-left text-sm font-bold text-[#1D1D1F] shadow-xs transition hover:border-[#0071E3] hover:bg-[#F0F7FF]"
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] p-4 text-sm font-medium text-[#14532D]">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#16A34A]" />
          <div>
            <p className="font-extrabold">Aha!-Moment geboren (Mäeutik)</p>
            <p className="mt-0.5 text-xs leading-relaxed text-[#166534]">{stage.ahaConclusion}</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 4 (Option B): Mäeutik-Baukasten & Gefahren-Barometer in Athen       */
/* -------------------------------------------------------------------------- */

const REACTION_MODES = [
  {
    id: 'vortrag',
    label: 'Langen Vortrag halten',
    verdict: 'Wenig Wirkung',
    good: false,
    feedback:
      'Dein Gegenüber nickt vielleicht höflich, glaubt aber einfach weiter — genau das lehnte Sokrates ab.',
  },
  {
    id: 'widerspruch',
    label: 'Direkt widersprechen',
    verdict: 'Blockade',
    good: false,
    feedback:
      'Wer frontal belehrt wird, verteidigt seine alte Meinung erst recht statt selbst nachzudenken.',
  },
  {
    id: 'frage',
    label: 'Gezielte Rückfrage stellen',
    verdict: 'Sokratische Methode!',
    good: true,
    feedback:
      'Volltreffer! Durch eine kluge Rückfrage prüft dein Gesprächspartner seine eigene Aussage und kommt selbst zur Erkenntnis.',
  },
]

const DANGER_STEPS = [
  {
    level: 25,
    title: '1. Neugier auf der Agora',
    text: 'Junge Athener lieben Sokrates’ scharfe Fragen auf dem Marktplatz und diskutieren begeistert mit ihm.',
  },
  {
    level: 60,
    title: '2. Bloßgestellte Autoritäten',
    text: 'Politiker und selbsternannte Experten merken im Gespräch, dass sie ihre großen Worte gar nicht begründen können.',
  },
  {
    level: 100,
    title: '3. „Gefährlicher Zweifler“ (399 v. Chr.)',
    text: 'Weil Sokrates offen das Zweifeln lehrt, halten ihn einflussreiche Politiker Athens für gefährlich — und erheben Anklage.',
  },
]

function Screen4ToolkitAndDanger() {
  const [reactionId, setReactionId] = useState<string | null>(null)
  const [dangerIdx, setDangerIdx] = useState(0)

  const chosenReaction = REACTION_MODES.find((r) => r.id === reactionId)
  const danger = DANGER_STEPS[dangerIdx]

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Left: Maieutik Toolkit */}
      <div className="apple-card flex flex-col justify-between space-y-4 rounded-3xl p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#0071E3] uppercase">
            <HelpCircle className="h-3.5 w-3.5" />
            Mäeutik-Baukasten
          </span>
          <h3 className="font-apple-display mt-1 text-lg text-[#1D1D1F]">
            Du bist Sokrates — wie reagierst du?
          </h3>
          <p className="mt-2 rounded-2xl bg-[#F5F5F7] p-3.5 text-xs font-semibold text-[#1D1D1F]">
            Ein Bürger behauptet: „Man sollte immer einfach alles glauben, was mächtige Redner sagen.“
          </p>
        </div>

        <div className="space-y-2">
          {REACTION_MODES.map((mode) => {
            const active = reactionId === mode.id
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setReactionId(mode.id)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${
                  active
                    ? mode.good
                      ? 'border-[#86EFAC] bg-[#F0FDF4] text-[#14532D]'
                      : 'border-[#FDE68A] bg-[#FFFBEB] text-[#78350F]'
                    : 'border-black/[0.08] bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#EFEFF4]'
                }`}
              >
                <span>{mode.label}</span>
                {active && (
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold">
                    {mode.verdict}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="rounded-2xl bg-[#F5F5F7] p-4 text-xs leading-relaxed font-medium text-[#515154]">
          {chosenReaction
            ? chosenReaction.feedback
            : 'Wähle eine der drei Reaktionen aus, um ihre Wirkung zu testen.'}
        </div>
      </div>

      {/* Right: Political Tension Barometer */}
      <div className="apple-card flex flex-col justify-between space-y-5 rounded-3xl p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#DC2626] uppercase">
            <AlertTriangle className="h-3.5 w-3.5" />
            Politisches Spannungs-Barometer
          </span>
          <h3 className="font-apple-display mt-1 text-lg text-[#1D1D1F]">
            Warum galt Sokrates als gefährlich?
          </h3>
          <p className="mt-1 text-xs font-medium text-[#515154]">
            Schalte die 3 Eskalationsstufen durch, um den Weg bis zur Anklage zu verstehen:
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-[#6E6E73]">Misstrauen der Politiker in Athen</span>
            <span className="font-mono text-[#DC2626]">{danger.level}%</span>
          </div>
          <div className="h-3.5 w-full overflow-hidden rounded-full bg-[#EFEFF4]">
            <motion.div
              animate={{ width: `${danger.level}%` }}
              transition={{ duration: 0.45 }}
              className={`h-full rounded-full ${
                danger.level >= 90 ? 'bg-[#DC2626]' : danger.level >= 50 ? 'bg-[#F59E0B]' : 'bg-[#0071E3]'
              }`}
            />
          </div>

          <div className="flex gap-1.5 pt-1">
            {DANGER_STEPS.map((st, idx) => (
              <button
                key={st.title}
                type="button"
                onClick={() => setDangerIdx(idx)}
                className={`flex-1 rounded-full py-2 text-xs font-bold transition ${
                  dangerIdx === idx
                    ? 'bg-[#1D1D1F] text-white'
                    : 'bg-[#F2F2F7] text-[#515154] hover:bg-[#E5E5EA]'
                }`}
              >
                Stufe {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-[#F5F5F7] p-4">
          <h4 className="text-sm font-extrabold text-[#1D1D1F]">{danger.title}</h4>
          <p className="mt-1 text-xs leading-relaxed font-medium text-[#515154]">{danger.text}</p>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 5: Prozess & Tod (399 v. Chr.) + Gemälde-Scanner (David, 1787)      */
/* -------------------------------------------------------------------------- */

const PAINTING_HOTSPOTS = [
  {
    x: 52,
    y: 42,
    title: 'Sokrates (70 Jahre alt)',
    text: 'Nach seiner Verurteilung 399 v. Chr. nimmt er das Todesurteil völlig ruhig an und spricht bis zuletzt mit seinen Schülern über die Wahrheit.',
  },
  {
    x: 41,
    y: 48,
    title: 'Der Schierlingsbecher',
    text: 'Sokrates musste im Alter von 70 Jahren einen Giftbecher aus Geflecktem Schierling trinken — die Hinrichtungsart Athens.',
  },
  {
    x: 15,
    y: 63,
    title: 'Platon am Fußende',
    text: 'Jacques-Louis David zeigt Sokrates’ berühmtesten Schüler Platon tief bewegt links am Bett — er rettete Sokrates’ Philosophie für die Nachwelt.',
  },
]

function Screen5TrialAndDeath() {
  const [hotspotIdx, setHotspotIdx] = useState(1)
  const [defenseChoice, setDefenseChoice] = useState<'prinzip' | 'anpassung'>('prinzip')

  return (
    <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
      {/* Painting Hotspot Scanner */}
      <div className="space-y-3">
        <SmartMediaImage
          wikiTitle="The_Death_of_Socrates"
          wikiLang="en"
          alt="Jacques-Louis David (1787): Der Tod des Sokrates"
          caption="Jacques-Louis David (1787): Der Tod des Sokrates (Metropolitan Museum of Art). Klicke die Punkte 1–3 an."
          credit="Wikimedia Commons"
          fit="natural"
          overlay={
            <>
              {PAINTING_HOTSPOTS.map((hs, idx) => (
                <button
                  key={hs.title}
                  type="button"
                  onClick={() => setHotspotIdx(idx)}
                  style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                  className={`absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-mono text-xs font-extrabold shadow-md transition ${
                    hotspotIdx === idx
                      ? 'scale-110 border-white bg-[#0071E3] text-white'
                      : 'border-white bg-[#1D1D1F]/80 text-white hover:scale-105'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </>
          }
        />

        <div className="apple-card rounded-3xl p-4">
          <p className="font-mono text-[11px] font-bold text-[#0071E3] uppercase">
            Gemälde-Detail #{hotspotIdx + 1} · {PAINTING_HOTSPOTS[hotspotIdx].title}
          </p>
          <p className="mt-1 text-xs leading-relaxed font-medium text-[#515154]">
            {PAINTING_HOTSPOTS[hotspotIdx].text}
          </p>
        </div>
      </div>

      {/* Trial Charges + Defense Simulator */}
      <div className="apple-card flex flex-col justify-between gap-4 rounded-3xl p-6">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#DC2626] uppercase">
            <Scale className="h-3.5 w-3.5" />
            Gericht von Athen · 399 v. Chr.
          </span>
          <h3 className="font-apple-display text-lg text-[#1D1D1F]">
            Die beiden Anklagepunkte
          </h3>

          <div className="grid gap-2">
            <div className="rounded-2xl bg-[#FEF2F2] p-3.5 text-xs font-bold text-[#991B1B]">
              1. „Die Jugend Athens zu verderben“
            </div>
            <div className="rounded-2xl bg-[#FEF2F2] p-3.5 text-xs font-bold text-[#991B1B]">
              2. „Die Götter der Stadt nicht zu ehren“
            </div>
          </div>
        </div>

        <div className="space-y-2.5 border-t border-black/[0.06] pt-4">
          <p className="text-xs font-bold text-[#86868B] uppercase">Verteidigungs-Perspektive</p>
          <div className="flex rounded-full bg-[#EFEFF4] p-1 text-xs">
            <button
              type="button"
              onClick={() => setDefenseChoice('prinzip')}
              className={`flex-1 rounded-full py-1.5 font-bold transition ${
                defenseChoice === 'prinzip'
                  ? 'bg-white text-[#1D1D1F] shadow-xs'
                  : 'text-[#6E6E73]'
              }`}
            >
              Sokrates’ Weg
            </button>
            <button
              type="button"
              onClick={() => setDefenseChoice('anpassung')}
              className={`flex-1 rounded-full py-1.5 font-bold transition ${
                defenseChoice === 'anpassung'
                  ? 'bg-white text-[#1D1D1F] shadow-xs'
                  : 'text-[#6E6E73]'
              }`}
            >
              Wenn er nachgegeben hätte
            </button>
          </div>

          <p className="rounded-2xl bg-[#F5F5F7] p-3.5 text-xs leading-relaxed font-medium text-[#515154]">
            {defenseChoice === 'prinzip'
              ? 'Sokrates verteidigte sich selbst, blieb seinen Prinzipien treu, nahm die Todesstrafe ruhig an und trank mit 70 Jahren den Schierlingsbecher.'
              : 'Hätte er aufgehört zu fragen und sich den Richtern unterworfen, wäre er vielleicht frei geblieben — doch seine gesamte Botschaft vom selbstständigen Denken wäre zerbrochen.'}
          </p>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 6: Was bleibt? Ideen-Netzwerk & Verifizierte Videos                 */
/* -------------------------------------------------------------------------- */

const LEGACY_NODES = [
  {
    id: 'sokrates',
    name: 'Sokrates',
    role: '469–399 v. Chr.',
    text: 'Schrieb selbst nichts auf — stellte Fragen nach dem gerechten Leben und lehrte das kritische Nachdenken.',
  },
  {
    id: 'platon',
    name: 'Platon',
    role: 'Berühmtester Schüler',
    text: 'Schrieb Sokrates’ Gespräche in berühmten Dialogen auf und gründete die Akademie in Athen.',
  },
  {
    id: 'heute',
    name: 'Westliche Philosophie',
    role: 'Bis heute Vorbild',
    text: 'Seine Methode prägt Wissenschaft, Ethik und Bildung bis heute: Entscheidend ist nicht, was man denkt, sondern wie man denkt.',
  },
]

function Screen6LegacyAndVideo() {
  const [activeNodeId, setActiveNodeId] = useState<string>('sokrates')
  const [videoTab, setVideoTab] = useState<'ethik' | 'akropolis'>('ethik')
  const activeNode = LEGACY_NODES.find((n) => n.id === activeNodeId) ?? LEGACY_NODES[0]

  return (
    <div className="space-y-5">
      {/* Interactive Influence Chain */}
      <div className="apple-card space-y-4 rounded-3xl p-6">
        <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-[#4338CA] uppercase">
          <Brain className="h-4 w-4" />
          <span>Ideen- &amp; Einfluss-Kette (Klickbar)</span>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {LEGACY_NODES.map((node, idx) => {
            const active = node.id === activeNodeId
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setActiveNodeId(node.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? 'border-[#4338CA] bg-[#EEF2FF]'
                    : 'border-black/[0.06] bg-[#F5F5F7] hover:bg-[#EFEFF4]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-[#4338CA]">
                    0{idx + 1} · {node.role}
                  </span>
                  {active && <UserCheck className="h-4 w-4 text-[#4338CA]" />}
                </div>
                <p className="font-apple-black mt-1 text-lg text-[#1D1D1F]">{node.name}</p>
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#F5F5F7] p-4">
          <p className="max-w-2xl text-sm leading-relaxed font-medium text-[#1D1D1F]">
            {activeNode.text}
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-extrabold text-[#4338CA] shadow-xs">
            <BookOpen className="h-3.5 w-3.5" />
            „Nicht was, sondern wie man denkt.“
          </span>
        </div>
      </div>

      {/* Verified Video + Raphael School of Athens */}
      <div className="grid gap-5 lg:grid-cols-2">
        <SmartMediaImage
          wikiTitle="The_School_of_Athens"
          wikiLang="en"
          alt="Raffael: Die Schule von Athen"
          caption="Raffael (1509–1511): Die Schule von Athen — Symbol für das Weiterleben der griechischen Philosophie."
          credit="Wikimedia Commons"
          aspectClass="aspect-video"
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D1D1F]">
              <Film className="h-4 w-4 text-[#4338CA]" />
              Erklärvideo zur Mäeutik
            </span>
            <div className="flex rounded-full bg-[#EFEFF4] p-1 text-xs">
              <button
                type="button"
                onClick={() => setVideoTab('ethik')}
                className={`rounded-full px-3 py-1 font-bold transition ${
                  videoTab === 'ethik' ? 'bg-white text-[#1D1D1F] shadow-xs' : 'text-[#6E6E73]'
                }`}
              >
                Kompakt
              </button>
              <button
                type="button"
                onClick={() => setVideoTab('akropolis')}
                className={`rounded-full px-3 py-1 font-bold transition ${
                  videoTab === 'akropolis' ? 'bg-white text-[#1D1D1F] shadow-xs' : 'text-[#6E6E73]'
                }`}
              >
                Vertiefung
              </button>
            </div>
          </div>

          {videoTab === 'ethik' ? (
            <SmartVideoPlayer
              key="sokrates-ethik"
              videoId="N6qynjBwS6k"
              start={15}
              end={145}
              title="Sokrates und die Mäeutik — Ethik einfach erklärt"
              channel="istrav09"
              segmentLabel="Mäeutik & Sokratische Methode kompakt"
            />
          ) : (
            <SmartVideoPlayer
              key="sokrates-akropolis"
              videoId="x4AZHijHId8"
              start={30}
              end={180}
              title="Sokrates und die Kunst, die richtigen Fragen zu stellen (Maieutik)"
              channel="Neue Akropolis — Schule der Philosophie"
              segmentLabel="Die Kunst des gezielten Nachfragens"
            />
          )}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  LESSON DEFINITION                                                          */
/* -------------------------------------------------------------------------- */

const sokratesLesson: LessonDefinition = {
  id: 'philosophie-sokrates-kunst-des-fragens',
  slug: 'sokrates-kunst-des-fragens',
  categoryId: 'philosophie',
  title: 'Sokrates (469–399 v. Chr.) — Die Kunst des Fragens',
  subtitle:
    'Erlebe die Hebammenkunst (Mäeutik) im spielbaren Dialog auf der Agora, prüfe die Anklage von 399 v. Chr. und entdecke, warum richtiges Fragen wichtiger ist als fertige Antworten.',
  eraOrContext: '469–399 v. Chr.',
  estimatedMinutes: 7,
  difficulty: 'Einstieg',
  xpReward: 220,
  heroMedia: {
    wikiTitle: 'The_Death_of_Socrates',
    wikiLang: 'en',
    alt: 'Jacques-Louis David (1787): Der Tod des Sokrates',
    credit: 'Wikimedia Commons',
  },
  keyTakeaways: [
    'Sokrates (469–399 v. Chr.) lebte im Stadtstaat Athen, war Steinmetz und Sohn einer Hebamme — und gilt als Begründer der westlichen Philosophie.',
    'Er schrieb selbst nichts auf; wir kennen seine Lehren vor allem durch seinen berühmtesten Schüler Platon.',
    'Seine Methode war das gezielte Fragen („Hebammenkunst“ / Mäeutik) unter dem Motto: „Ich weiß, dass ich nichts weiß.“',
    '399 v. Chr. wurde er mit 70 Jahren angeklagt (Jugend verderben, Götter nicht ehren) und nahm die Todesstrafe durch den Schierlingsbecher ruhig an.',
  ],
  screens: [
    {
      id: 'athen-atlas',
      badge: '01 · Ort & Herkunft',
      title: 'Athen vor 2.500 Jahren — der Denker vom Marktplatz',
      subtitle:
        'Vom Steinmetz zum Begründer der westlichen Philosophie: Verorte Sokrates in Athen und entdecke seine ungewöhnliche Biografie.',
      component: Screen1AthensAtlas,
    },
    {
      id: 'maeutik-labor',
      badge: '02 · Kernbotschaft & Methode',
      title: '„Ich weiß, dass ich nichts weiß“ & die Hebammenkunst',
      subtitle:
        'Teste mit dem Scheinwissen-Regler, warum echtes Denken erst beginnt, wenn wir ungeprüfte Gewissheiten loslassen.',
      component: Screen2MaieutikLab,
    },
    {
      id: 'agora-dialog',
      badge: '03 · Spielbarer Dialog',
      title: 'Du stehst auf der Agora — Sokrates befragt dich',
      subtitle:
        'Erlebe die Mäeutik am eigenen Leib: Beantworte Sokrates’ Fragen und spüre, wie aus Zweifel ein eigener Gedanke entsteht.',
      component: Screen3AgoraDialogue,
    },
    {
      id: 'baukasten-gefahr',
      badge: '04 · Labor & Konflikt',
      title: 'Fragen statt Vorträge — und warum Politiker ihn fürchteten',
      subtitle:
        'Probiere Sokrates’ Methode im Baukasten aus und verfolge, wie öffentliches Zweifeln zum Konflikt mit Athen führte.',
      component: Screen4ToolkitAndDanger,
    },
    {
      id: 'prozess-und-tod',
      badge: '05 · Prozess & Gemälde-Scanner',
      title: 'Der Prozess 399 v. Chr. und der Schierlingsbecher',
      subtitle:
        'Untersuche die beiden Anklagepunkte und scanne Jacques-Louis Davids Meisterwerk „Der Tod des Sokrates“ per Hotspot.',
      component: Screen5TrialAndDeath,
    },
    {
      id: 'vermaechtnis',
      badge: '06 · Einfluss & Video',
      title: 'Was bleibt? Nicht was, sondern wie man denkt',
      subtitle:
        'Verfolge die Kette von Sokrates über Platon bis heute und vertiefe die Mäeutik im kompakten Erklärvideo.',
      component: Screen6LegacyAndVideo,
    },
  ],
  quizzes: [
    {
      id: 'sokrates-quiz-cup-hotspot',
      lessonId: 'philosophie-sokrates-kunst-des-fragens',
      categoryId: 'philosophie',
      type: 'image-hotspot',
      prompt: 'Klicke im berühmten Gemälde „Der Tod des Sokrates“ (1787) direkt auf den Schierlingsbecher!',
      hint: 'Er wird dem sitzenden Sokrates von links aus gereicht, direkt unter seiner linken Hand.',
      explanation:
        'Mit 70 Jahren nahm Sokrates 399 v. Chr. die Todesstrafe ruhig an und griff nach dem Schierlingsbecher mit Gift.',
      image: {
        wikiTitle: 'The_Death_of_Socrates',
        wikiLang: 'en',
        alt: 'Jacques-Louis David (1787): Der Tod des Sokrates',
        credit: 'Wikimedia Commons',
      },
      target: {
        x: 41,
        y: 48,
        radiusPct: 14,
        label: 'Schierlingsbecher',
      },
    },
    {
      id: 'sokrates-quiz-connect',
      lessonId: 'philosophie-sokrates-kunst-des-fragens',
      categoryId: 'philosophie',
      type: 'visual-connect',
      prompt: 'Verbinde jeden Schlüsselbegriff rund um Sokrates mit seiner genauen Bedeutung.',
      explanation:
        'Mäeutik = Hebammenkunst (Geburt eines Gedankens), Platon = berühmtester Schüler & Aufschreiber, Schierlingsbecher = Giftbecher 399 v. Chr., Steinmetz = ursprünglicher Beruf.',
      leftColumnTitle: 'Begriff / Person',
      rightColumnTitle: 'Bedeutung',
      pairs: [
        {
          id: 'maeutik',
          left: 'Mäeutik',
          leftSub: 'Hebammenkunst',
          right: 'Durch gezielte Fragen bei der Geburt eines Gedankens helfen',
        },
        {
          id: 'platon',
          left: 'Platon',
          leftSub: 'Berühmtester Schüler',
          right: 'Schrieb Sokrates’ Gedanken auf, da Sokrates nichts verfasste',
        },
        {
          id: 'schierling',
          left: 'Schierlingsbecher',
          leftSub: '399 v. Chr. · Alter 70',
          right: 'Gifttrank zur Vollstreckung der Todesstrafe',
        },
        {
          id: 'steinmetz',
          left: 'Steinmetz',
          leftSub: 'Handwerk',
          right: 'Sokrates’ ursprünglicher Beruf vor dem Marktplatz-Dialog',
        },
      ],
    },
    {
      id: 'sokrates-quiz-year',
      lessonId: 'philosophie-sokrates-kunst-des-fragens',
      categoryId: 'philosophie',
      type: 'slider-estimate',
      prompt: 'In welchem Jahr wurde Sokrates in Athen angeklagt und zum Tod verurteilt?',
      hint: 'Er lebte von 469 bis zu seinem Tod im Alter von 70 Jahren.',
      explanation:
        'Sokrates wurde im Jahr 399 v. Chr. (im Alter von 70 Jahren) in Athen angeklagt und zum Tod durch den Schierlingsbecher verurteilt.',
      min: -500,
      max: -300,
      step: 1,
      unit: 'Jahre',
      targetValue: -399,
      tolerance: 15,
      formatAsBCE: true,
    },
    {
      id: 'sokrates-quiz-athens-map',
      lessonId: 'philosophie-sokrates-kunst-des-fragens',
      categoryId: 'philosophie',
      type: 'map-pin',
      prompt: 'Wo lag der griechische Stadtstaat Athen, auf dessen Marktplätzen Sokrates wirkte?',
      hint: 'Suche im Südosten des griechischen Festlands an der Ägäis.',
      explanation:
        'Athen liegt in Attika im Südosten Griechenlands — hier schlenderte Sokrates vor rund 2.500 Jahren über die Agora.',
      target: {
        label: 'Athen',
        lon: 23.7275,
        lat: 37.9838,
      },
      toleranceKm: 180,
      mapView: {
        center: [21.5, 38.8],
        scale: 1350,
      },
      contextPins: [
        { label: 'Rom', lon: 12.4964, lat: 41.9028, muted: true },
      ],
    },
  ],
}

export default sokratesLesson
