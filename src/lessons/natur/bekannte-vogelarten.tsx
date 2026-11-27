import {
  Binoculars,
  CheckCircle2,
  Eye,
  Film,
  HelpCircle,
  Layers,
  RotateCcw,
  Ruler,
  Sparkles,
  Square,
  Trees,
  Volume2,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
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
import { SmartMediaImage } from '../../components/media/SmartMediaImage'
import { SmartVideoPlayer } from '../../components/media/SmartVideoPlayer'
import { playMelody, stopAllAudio } from '../../lib/audioEngine'
import type { SynthNote } from '../../lib/audioEngine'
import type { LessonDefinition } from '../../types/yuno'

/* -------------------------------------------------------------------------- */
/*  MASTER DATASET: ALL 27 VERIFIED BIRD SPECIES FROM ONE-NOTE PDF            */
/* -------------------------------------------------------------------------- */

type BirdWorld = 'garten' | 'kletterer' | 'raben' | 'flug' | 'wasser'
type BirdColor = 'gelb' | 'rot' | 'schwarz' | 'weiss' | 'blau' | 'braun'
type BirdHabitat = 'Garten & Park' | 'Wald & Stamm' | 'Feld & Himmel' | 'Wasser & Küste'

interface BirdSpecies {
  id: string
  name: string
  latin: string
  world: BirdWorld
  colors: BirdColor[]
  habitat: BirdHabitat
  sizeCm: number
  signature: string
  detail: string
  lookalikeTip: string
  wikiTitle: string
  src: string
}

const ALL_BIRDS: BirdSpecies[] = [
  // 1. Garten-Klassiker & Bunte Finken (8)
  {
    id: 'blaumeise',
    name: 'Blaumeise',
    latin: 'Cyanistes caeruleus',
    world: 'garten',
    colors: ['blau', 'gelb'],
    habitat: 'Garten & Park',
    sizeCm: 11.5,
    signature: 'Leuchtend blaue Kappe & gelbe Brust',
    detail: 'Kleiner und zierlicher als die Kohlmeise; turnt kopfüber an dünnsten Zweigen nach Insekten.',
    lookalikeTip: 'Kohlmeise hat einen schwarzen Kopf & Bauchstreifen — die Blaumeise trägt eine blaue Mütze.',
    wikiTitle: 'Eurasian blue tit',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/86/Eurasian_blue_tit_Lancashire.jpg/960px-Eurasian_blue_tit_Lancashire.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },
  {
    id: 'kohlmeise',
    name: 'Kohlmeise',
    latin: 'Parus major',
    world: 'garten',
    colors: ['gelb', 'schwarz'],
    habitat: 'Garten & Park',
    sizeCm: 14,
    signature: 'Schwarzer Kopf, weiße Wangen & schwarzer Bauchstreifen',
    detail: 'Größte heimische Meise. Ihr lauter zweisilbiger Ruf klingt wie „Zi-däh“ (Eselsbrücke: „Judith“).',
    lookalikeTip: 'Der durchgehende schwarze Strich mitten über den gelben Bauch macht sie unverwechselbar.',
    wikiTitle: 'Great tit',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Great_tit_%28Parus_major%29%2C_Parc_du_Rouge-Cloitre%2C_For%C3%AAt_de_Soignes%2C_Brussels_%2826194636951%29.jpg/960px-Great_tit_%28Parus_major%29%2C_Parc_du_Rouge-Cloitre%2C_For%C3%AAt_de_Soignes%2C_Brussels_%2826194636951%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },
  {
    id: 'rotkehlchen',
    name: 'Rotkehlchen',
    latin: 'Erithacus rubecula',
    world: 'garten',
    colors: ['rot', 'braun'],
    habitat: 'Garten & Park',
    sizeCm: 14,
    signature: 'Große, rundliche orange-rote Brust & Gesicht',
    detail: 'Zutraulicher Gartenvogel mit klarem, perlendem Gesang — oft schon in der frühen Dämmerung zu hören.',
    lookalikeTip: 'Kein schwarzes Gesicht wie der Gartenrotschwanz, sondern weich orange bis zur Stirn.',
    wikiTitle: 'European robin',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/Erithacus_rubecula_with_cocked_head.jpg/960px-Erithacus_rubecula_with_cocked_head.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },
  {
    id: 'gartenrotschwanz',
    name: 'Gartenrotschwanz',
    latin: 'Phoenicurus phoenicurus',
    world: 'garten',
    colors: ['rot', 'schwarz'],
    habitat: 'Garten & Park',
    sizeCm: 14,
    signature: 'Schwarze Gesichtsmaske, weiße Stirn & rostrote Brust/Schwanz',
    detail: 'Schlanker Zugvogel alter Obstgärten und Parks; zittert charakteristisch mit seinem ziegelroten Schwanz.',
    lookalikeTip: 'Gegenüber dem Rotkehlchen klar an der schwarzen Kehle und dem leuchtend roten Schwanz erkennbar.',
    wikiTitle: 'Common redstart',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cd/Phoenicurus_phoenicurus_08%28js%29%2C_Lodz_%28Poland%29.jpg/960px-Phoenicurus_phoenicurus_08%28js%29%2C_Lodz_%28Poland%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },
  {
    id: 'buchfink',
    name: 'Buchfink',
    latin: 'Fringilla coelebs',
    world: 'garten',
    colors: ['rot', 'blau', 'braun'],
    habitat: 'Wald & Stamm',
    sizeCm: 15,
    signature: 'Blaugrauer Scheitel, rotbraune Brust & doppelte weiße Flügelbinde',
    detail: 'Einer der häufigsten Brutvögel Europas. Sein kräftiger „Buchfinkenschlag“ endet mit einem markanten Schnörkel.',
    lookalikeTip: 'Die zwei breiten weißen Streifen auf dem Flügel blitzen sogar im Flug deutlich auf.',
    wikiTitle: 'Eurasian chaffinch',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/Male_Chaffinch_-_Fringilla_coelebs.jpg/960px-Male_Chaffinch_-_Fringilla_coelebs.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },
  {
    id: 'gruenfink',
    name: 'Grünfink',
    latin: 'Chloris chloris',
    world: 'garten',
    colors: ['gelb', 'braun'],
    habitat: 'Garten & Park',
    sizeCm: 15,
    signature: 'Olivgrünes Gefieder, kräftiger Schnabel & leuchtend gelber Flügelrand',
    detail: 'Kräftiger Körnerfresser, der gern an Futterhäuschen Sonnenblumenkerne knackt.',
    lookalikeTip: 'Kompakter und grüner als die Goldammer, mit unverwechselbarem dickem Finkenschnabel.',
    wikiTitle: 'European greenfinch',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Chloris_chloris_%28profile%29.jpg/960px-Chloris_chloris_%28profile%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },
  {
    id: 'stieglitz',
    name: 'Stieglitz',
    latin: 'Carduelis carduelis',
    world: 'garten',
    colors: ['rot', 'gelb', 'schwarz'],
    habitat: 'Garten & Park',
    sizeCm: 12,
    signature: 'Knallrote Gesichtsmaske & breites gelbes Flügelband',
    detail: 'Auch Distelfink genannt — einer der buntesten heimischen Singvögel, liebt Distelsamen.',
    lookalikeTip: 'Dreifarbiger Kopf (Rot–Weiß–Schwarz) plus gelbe Flügelbinde: absolut unverwechselbar!',
    wikiTitle: 'European goldfinch',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/072_Wild_European_goldfinch_at_the_Parc_Jura_vaudois_Photo_by_Giles_Laurent.jpg/960px-072_Wild_European_goldfinch_at_the_Parc_Jura_vaudois_Photo_by_Giles_Laurent.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },
  {
    id: 'goldammer',
    name: 'Goldammer',
    latin: 'Emberiza citrinella',
    world: 'garten',
    colors: ['gelb', 'braun'],
    habitat: 'Feld & Himmel',
    sizeCm: 16.5,
    signature: 'Leuchtend zitronengelber Kopf & Bauch, rotbrauner Bürzel',
    detail: 'Typischer Hecken- und Feldrandvogel. Ihr berühmtes Lied klingt wie „Wie-wie-wie-wie-hab-ich-dich-lieb!“',
    lookalikeTip: 'Längerer Schwanz und intensiveres Goldgelb am Kopf als beim Grünfink.',
    wikiTitle: 'Yellowhammer',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Goldammer_Emberiza_citrinella.jpg/960px-Goldammer_Emberiza_citrinella.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },

  // 2. Unscheinbare & Baumkletterer (5)
  {
    id: 'spatz',
    name: 'Spatz (Haussperling)',
    latin: 'Passer domesticus',
    world: 'kletterer',
    colors: ['braun', 'schwarz'],
    habitat: 'Garten & Park',
    sizeCm: 15,
    signature: 'Braun gestreift, grauer Scheitel & schwarzer Kehlfleck (Männchen)',
    detail: 'Geselliger Kulturfolger in Städten und Dörfern — fast immer in munteren Gruppen unterwegs.',
    lookalikeTip: 'Männchen haben graue Kappe und schwarzes Lätzchen; kräftiger Kegelschnabel.',
    wikiTitle: 'House sparrow',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/House_sparrow_male_in_Prospect_Park_%2853532%29.jpg/960px-House_sparrow_male_in_Prospect_Park_%2853532%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },
  {
    id: 'zaunkoenig',
    name: 'Zaunkönig',
    latin: 'Troglodytes troglodytes',
    world: 'kletterer',
    colors: ['braun'],
    habitat: 'Wald & Stamm',
    sizeCm: 9.5,
    signature: 'Winzige braune Kugel mit steil aufgestelltem Stummelschwanz',
    detail: 'Einer der kleinsten Vögel Europas — besitzt aber im Verhältnis zu seiner Größe eine erstaunlich laute Stimme.',
    lookalikeTip: 'Der keck nach oben gereckte Mini-Schwanz verrät ihn sofort im dichten Gebüsch.',
    wikiTitle: 'Eurasian wren',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/Eurasian_wren_2023_12_31_02.jpg/960px-Eurasian_wren_2023_12_31_02.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },
  {
    id: 'bachstelze',
    name: 'Bachstelze',
    latin: 'Motacilla alba',
    world: 'kletterer',
    colors: ['weiss', 'schwarz'],
    habitat: 'Wasser & Küste',
    sizeCm: 18,
    signature: 'Schwarz-weiß-grau mit langem, ständig wippendem Schwanz',
    detail: 'Trippelt blitzschnell über Wiesen, Parkplätze und Ufer, um Insekten zu fangen.',
    lookalikeTip: 'Das ununterbrochene Auf-und-ab-Wippen des langen Schwanzes ist ihr Markenzeichen.',
    wikiTitle: 'White wagtail',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/20180415_015_Winterswijk_Witte_kwikstaart_%2840785272624%29.jpg/960px-20180415_015_Winterswijk_Witte_kwikstaart_%2840785272624%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },
  {
    id: 'specht',
    name: 'Specht',
    latin: 'Dendrocopos major (Buntspecht)',
    world: 'kletterer',
    colors: ['schwarz', 'weiss', 'rot'],
    habitat: 'Wald & Stamm',
    sizeCm: 23,
    signature: 'Schwarz-weißes Gefieder mit leuchtend rotem Unterschwanz',
    detail: 'Trommelt im Frühling lautstark auf trockenen Ästen und zimmert Bruthöhlen in Baumstämme.',
    lookalikeTip: 'Klettert ruckartig senkrecht am Stamm nach oben und stützt sich auf seine steifen Schwanzfedern.',
    wikiTitle: 'Great spotted woodpecker',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/df/Great_spotted_woodpecker_%28Dendrocopos_major%29_male_Drenthe.jpg/960px-Great_spotted_woodpecker_%28Dendrocopos_major%29_male_Drenthe.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },
  {
    id: 'kleiber',
    name: 'Kleiber',
    latin: 'Sitta europaea',
    world: 'kletterer',
    colors: ['blau', 'rot'],
    habitat: 'Wald & Stamm',
    sizeCm: 14,
    signature: 'Blaugrauer Rücken, orange Unterseite & schwarzer Augenstreif',
    detail: 'Einziger heimischer Vogel, der mühelos **kopfüber** Baumstämme hinablaufen kann! Verklebt Höhleneingänge mit Lehm.',
    lookalikeTip: 'Wenn ein kleiner blaugrauer Vogel kopfüber den Baum herunterläuft, ist es garantiert ein Kleiber.',
    wikiTitle: 'Eurasian nuthatch',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Kleiber_Sitta_europaea-0447.jpg/960px-Kleiber_Sitta_europaea-0447.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },

  // 3. Schwarz, Grau & Klug (6)
  {
    id: 'amsel',
    name: 'Amsel',
    latin: 'Turdus merula',
    world: 'raben',
    colors: ['schwarz', 'gelb'],
    habitat: 'Garten & Park',
    sizeCm: 25,
    signature: 'Tiefschwarzes Gefieder mit leuchtend gelbem Schnabel & Augenring (Männchen)',
    detail: 'Bekanntester Gartenvogel mit wunderschönem, flötendem Gesang in der Morgen- und Abenddämmerung.',
    lookalikeTip: 'Weibchen sind dunkelbraun; Männchen erkennst du sofort am gelben Schnabel und langen Schwanz.',
    wikiTitle: 'Common blackbird',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Common_Blackbird.jpg/960px-Common_Blackbird.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },
  {
    id: 'star',
    name: 'Star',
    latin: 'Sturnus vulgaris',
    world: 'raben',
    colors: ['schwarz'],
    habitat: 'Garten & Park',
    sizeCm: 21,
    signature: 'Metallisch grün-violett glänzend mit hellen Perlpunkten',
    detail: 'Begnadeter Stimmenimitator und berühmt für riesige, synchron fliegende Herbstschwärme.',
    lookalikeTip: 'Kürzerer Schwanz als die Amsel; läuft geschäftig statt zu hüpfen und schillert im Sonnenlicht.',
    wikiTitle: 'Common starling',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/Common_starling_%28Sturnus_vulgaris%29_breeding_male_Marken.jpg/960px-Common_starling_%28Sturnus_vulgaris%29_breeding_male_Marken.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },
  {
    id: 'dohle',
    name: 'Dohle',
    latin: 'Coloeus monedula',
    world: 'raben',
    colors: ['schwarz'],
    habitat: 'Garten & Park',
    sizeCm: 33,
    signature: 'Silbergrauer Nacken & stechend hellblau-weiße Augen',
    detail: 'Kleinster und geselligster unserer Rabenvögel — brütet gern in Kirchtürmen und alten Mauern.',
    lookalikeTip: 'Deutlich kleiner als der Rabe und unverwechselbar durch das helle Auge und den grauen Nacken.',
    wikiTitle: 'Western jackdaw',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Nordic_jackdaw_%2852563242448%29.jpg/960px-Nordic_jackdaw_%2852563242448%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },
  {
    id: 'rabe',
    name: 'Rabe',
    latin: 'Corvus corax (Kolkrabe)',
    world: 'raben',
    colors: ['schwarz'],
    habitat: 'Wald & Stamm',
    sizeCm: 64,
    signature: 'Riesig (64 cm), massiver Keilschnabel & keilförmiger Schwanz',
    detail: 'Größter Singvogel der Welt, hochintelligent und an seinem tiefen, rollenden „Korrk“-Ruf erkennbar.',
    lookalikeTip: 'Viel größer und wuchtiger als Dohle oder Amsel, mit struppigem Kehlbart.',
    wikiTitle: 'Common raven',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Corvus_corax_clarionensis%2C_Point_Reyes_National_Seashore.jpg/960px-Corvus_corax_clarionensis%2C_Point_Reyes_National_Seashore.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },
  {
    id: 'elster',
    name: 'Elster',
    latin: 'Pica pica',
    world: 'raben',
    colors: ['schwarz', 'weiss'],
    habitat: 'Garten & Park',
    sizeCm: 46,
    signature: 'Kontrastreiches Schwarz-Weiß & sehr langer metallisch schimmernder Schwanz',
    detail: 'Einer der intelligentesten Vögel überhaupt (besteht sogar den Spiegeltest!) und typischer Parkbewohner.',
    lookalikeTip: 'Der extrem lange Schwanz und das klare Schwarz-Weiß machen sie schon aus 100 m erkennbar.',
    wikiTitle: 'Eurasian magpie',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/Eurasian_magpie_2024_03_03_02.jpg/960px-Eurasian_magpie_2024_03_03_02.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },
  {
    id: 'eichelhaeher',
    name: 'Eichelhäher',
    latin: 'Garrulus glandarius',
    world: 'raben',
    colors: ['blau', 'braun'],
    habitat: 'Wald & Stamm',
    sizeCm: 34,
    signature: 'Rosa-braunes Gefieder & leuchtend blau-schwarz gestreifter Flügelspiegel',
    detail: 'Die „Polizei des Waldes“: warnt laut rätschend vor Gefahr und pflanzt tausende Eichen durch vergessene Wintervorräte.',
    lookalikeTip: 'Das leuchtend blaue Federfeld am Flügel ist sein unverkennbares Markenzeichen.',
    wikiTitle: 'Eurasian jay',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6d/Garrulus_glandarius_1_Luc_Viatour.jpg/960px-Garrulus_glandarius_1_Luc_Viatour.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },

  // 4. Tauben, Kuckuck & Flugkünstler (5)
  {
    id: 'ringeltaube',
    name: 'Ringeltaube',
    latin: 'Columba palumbus',
    world: 'flug',
    colors: ['weiss', 'braun'],
    habitat: 'Garten & Park',
    sizeCm: 41,
    signature: 'Große blaugraue Taube mit markantem weißem Halsfleck',
    detail: 'Größte heimische Taube; beim Auffliegen klatschen ihre Flügel laut aneinander.',
    lookalikeTip: 'Weißer Halsfleck + weiße Flügelbinde unterscheiden sie sofort von der zierlicheren Türkentaube.',
    wikiTitle: 'Common wood pigeon',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Columba_palumbus_EM1B1397_%2827445478998%29.jpg/960px-Columba_palumbus_EM1B1397_%2827445478998%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },
  {
    id: 'tuerkentaube',
    name: 'Türkentaube',
    latin: 'Streptopelia decaocto',
    world: 'flug',
    colors: ['braun', 'schwarz'],
    habitat: 'Garten & Park',
    sizeCm: 32,
    signature: 'Sandbeige mit dünnem, scharf gezeichnetem schwarzem Nackenring',
    detail: 'Schlanke Siedlungstaube mit dreisilbigem, monotonem „Du-duu-du“-Ruf.',
    lookalikeTip: 'Sandfarben + schmaler schwarzer Halbkreis im Nacken statt weißem Fleck wie bei der Ringeltaube.',
    wikiTitle: 'Eurasian collared dove',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/2022-04-06_Streptopelia_decaocto%2C_Plovdiv%2C_Bulgaria_1.jpg/960px-2022-04-06_Streptopelia_decaocto%2C_Plovdiv%2C_Bulgaria_1.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },
  {
    id: 'kuckuck',
    name: 'Kuckuck',
    latin: 'Cuculus canorus',
    world: 'flug',
    colors: ['braun', 'weiss'],
    habitat: 'Wald & Stamm',
    sizeCm: 33,
    signature: 'Schiefergrau, quer gebänderter Bauch & unverwechselbarer „Ku-kuck“-Ruf',
    detail: 'Berühmter Brutparasit und Langstreckenzieher (überwintert in Afrika) — viel öfter gehört als gesehen.',
    lookalikeTip: 'Ähnelt im Flug einem kleinen Sperber, hält aber die Flügel tief und ruft seine fallende Terz.',
    wikiTitle: 'Common cuckoo',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Cuckoo_%2851169010335%29.jpg/960px-Cuckoo_%2851169010335%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },
  {
    id: 'schwalbe',
    name: 'Schwalbe',
    latin: 'Hirundo rustica (Rauchschwalbe)',
    world: 'flug',
    colors: ['blau', 'rot', 'weiss'],
    habitat: 'Feld & Himmel',
    sizeCm: 19,
    signature: 'Tief gegabelter Schwanz, blauschwarzer Rücken & rote Kehle',
    detail: 'Akrobatische Insektenjägerin der Lüfte — baut Lehmnester in Ställen und unter Dachvorsprüngen.',
    lookalikeTip: 'Die langen äußeren Schwanzspieße und blitzschnellen Flugmanöver verraten sie am Himmel sofort.',
    wikiTitle: 'Barn swallow',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7d/Rauchschwalbe_Hirundo_rustica.jpg/960px-Rauchschwalbe_Hirundo_rustica.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },
  {
    id: 'turmfalke',
    name: 'Turmfalke',
    latin: 'Falco tinnunculus',
    world: 'flug',
    colors: ['braun', 'rot'],
    habitat: 'Feld & Himmel',
    sizeCm: 34,
    signature: 'Rüttelflug auf der Stelle, rostbrauner gefleckter Rücken & spitz zulaufende Flügel',
    detail: 'Unser häufigster Greifvogel — steht wie ein Helikopter in der Luft, um Mäuse am Boden zu erspähen.',
    lookalikeTip: 'Wenn ein Greifvogel mit schnellem Flügelschlag minutenlang an einem Punkt in der Luft steht: Turmfalke!',
    wikiTitle: 'Common kestrel',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/Common_kestrel_falco_tinnunculus.jpg/960px-Common_kestrel_falco_tinnunculus.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },

  // 5. Wasser, Wiese & Großvögel (3)
  {
    id: 'schwan',
    name: 'Schwan',
    latin: 'Cygnus olor (Höckerschwan)',
    world: 'wasser',
    colors: ['weiss', 'rot'],
    habitat: 'Wasser & Küste',
    sizeCm: 150,
    signature: 'Schneeweiß, S-förmig gebogener Hals & oranger Schnabel mit schwarzem Höcker',
    detail: 'Bis zu 150 cm lang und über 10 kg schwer — einer der schwersten flugfähigen Vögel Europas.',
    lookalikeTip: 'Durch den tief orangen Schnabel mit schwarzem Stirnhöcker sofort als Höckerschwan erkennbar.',
    wikiTitle: 'Mute swan',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a2/CygneVaires.jpg/960px-CygneVaires.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },
  {
    id: 'storch',
    name: 'Storch',
    latin: 'Ciconia ciconia (Weißstorch)',
    world: 'wasser',
    colors: ['weiss', 'schwarz', 'rot'],
    habitat: 'Wasser & Küste',
    sizeCm: 105,
    signature: 'Weiß-schwarzes Gefieder, lange rote Beine & langer roter Schnabel',
    detail: 'Stakst durch Feuchtwiesen, baut gewaltige Horste auf Dächern und begrüßt seinen Partner mit Schnabelklappern.',
    lookalikeTip: 'Fliegt im Gegensatz zum Graureiher mit gestrecktem Hals — schwarz-weiße Flügel & rote Beine.',
    wikiTitle: 'White stork',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/White_stork_%28Ciconia_ciconia%29_Bia%C5%82owieza.jpg/960px-White_stork_%28Ciconia_ciconia%29_Bia%C5%82owieza.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },
  {
    id: 'moewe',
    name: 'Möwe',
    latin: 'Larus argentatus (Silbermöwe)',
    world: 'wasser',
    colors: ['weiss', 'gelb'],
    habitat: 'Wasser & Küste',
    sizeCm: 60,
    signature: 'Weißer Körper, grauer Mantel, schwarze Flügelspitzen & gelber Schnabel mit rotem Fleck',
    detail: 'Ausdauernde Segelfliegerin an Küsten, Flüssen und Seen — erkennbar an ihrem lauten, lachenden Ruf.',
    lookalikeTip: 'Der rote Punkt am gelben Unterschnabel dient Küken als „Zielscheibe“ beim Betteln um Futter.',
    wikiTitle: 'European herring gull',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2b/European_herring_gull_vocalizing_%2800170%29.jpg/960px-European_herring_gull_vocalizing_%2800170%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  },
]

const WORLD_TABS: Array<{ id: BirdWorld | 'alle'; label: string }> = [
  { id: 'alle', label: 'Alle 27' },
  { id: 'garten', label: 'Garten & Finken (8)' },
  { id: 'kletterer', label: 'Kletterer & Kleine (5)' },
  { id: 'raben', label: 'Rabenvögel & Co. (6)' },
  { id: 'flug', label: 'Tauben & Flieger (5)' },
  { id: 'wasser', label: 'Wasser & Große (3)' },
]

const COLOR_FILTERS: Array<{ id: BirdColor | 'all'; label: string; dot: string }> = [
  { id: 'all', label: 'Alle Farben', dot: 'bg-gradient-to-r from-[#0071E3] via-[#FF9500] to-[#15803D]' },
  { id: 'gelb', label: 'Gelb', dot: 'bg-[#EAB308]' },
  { id: 'rot', label: 'Rot / Orange', dot: 'bg-[#EF4444]' },
  { id: 'blau', label: 'Blau', dot: 'bg-[#2563EB]' },
  { id: 'schwarz', label: 'Schwarz', dot: 'bg-[#1D1D1F]' },
  { id: 'weiss', label: 'Weiß', dot: 'bg-white border border-black/20' },
  { id: 'braun', label: 'Braun / Grau', dot: 'bg-[#92400E]' },
]

function getBirdById(id: string): BirdSpecies {
  return ALL_BIRDS.find((b) => b.id === id) ?? ALL_BIRDS[0]
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 1 (Option A): Visueller Bestimmungs-Atlas aller 27 Arten            */
/* -------------------------------------------------------------------------- */

function Screen1FieldGuideAtlas() {
  const [world, setWorld] = useState<BirdWorld | 'alle'>('alle')
  const [colorFilter, setColorFilter] = useState<BirdColor | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string>('blaumeise')
  const [discovered, setDiscovered] = useState<string[]>(['blaumeise'])

  const filteredBirds = useMemo(() => {
    return ALL_BIRDS.filter((b) => {
      if (world !== 'alle' && b.world !== world) return false
      if (colorFilter !== 'all' && !b.colors.includes(colorFilter)) return false
      return true
    })
  }, [world, colorFilter])

  const selected = getBirdById(selectedId)

  const handleSelectBird = (bird: BirdSpecies) => {
    setSelectedId(bird.id)
    setDiscovered((prev) => (prev.includes(bird.id) ? prev : [...prev, bird.id]))
  }

  return (
    <div className="space-y-5">
      {/* Spotlight Card for Active Bird */}
      <div className="apple-card grid gap-5 rounded-3xl p-5 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <SmartMediaImage
          src={selected.src}
          wikiTitle={selected.wikiTitle}
          wikiLang="en"
          alt={`${selected.name} (${selected.latin})`}
          caption={`${selected.name} (${selected.latin})`}
          credit="Wikimedia Commons"
          aspectClass="aspect-[16/10]"
          className="shadow-none"
        />

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-bold text-[#15803D]">
              {selected.habitat}
            </span>
            <span className="font-mono text-xs font-bold text-[#6E6E73]">
              Größe: ~{selected.sizeCm} cm · Entdeckt: {discovered.length}/27
            </span>
          </div>

          <div>
            <h3 className="font-apple-black text-3xl text-[#1D1D1F]">{selected.name}</h3>
            <p className="font-mono text-xs font-medium text-[#86868B] italic">{selected.latin}</p>
          </div>

          <div className="rounded-2xl bg-[#E8F2FC] p-3.5">
            <p className="text-[11px] font-bold tracking-wide text-[#0071E3] uppercase">
              1-Sekunden-Erkennungsmerkmal
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-[#1D1D1F]">{selected.signature}</p>
          </div>

          <p className="text-xs leading-relaxed font-medium text-[#515154]">{selected.detail}</p>
          <p className="rounded-2xl bg-[#F5F5F7] p-3 text-xs font-medium text-[#515154]">
            <strong className="text-[#1D1D1F]">Verwechslungs-Tipp:</strong> {selected.lookalikeTip}
          </p>
        </div>
      </div>

      {/* Filters: 5 Worlds + Color Chips */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap gap-1.5">
          {WORLD_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setWorld(t.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                world === t.id
                  ? 'bg-[#1D1D1F] text-white'
                  : 'bg-white text-[#515154] ring-1 ring-black/[0.08] hover:bg-[#EFEFF4]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {COLOR_FILTERS.map((cf) => (
            <button
              key={cf.id}
              type="button"
              onClick={() => setColorFilter(cf.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition ${
                colorFilter === cf.id
                  ? 'bg-[#0071E3] text-white'
                  : 'bg-white text-[#515154] ring-1 ring-black/[0.08] hover:text-[#1D1D1F]'
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${cf.dot}`} />
              {cf.label}
            </button>
          ))}
        </div>
      </div>

      {/* All 27 Birds Visual Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filteredBirds.map((bird) => {
          const isSelected = bird.id === selectedId
          const seen = discovered.includes(bird.id)
          return (
            <button
              key={bird.id}
              type="button"
              onClick={() => handleSelectBird(bird)}
              className={`group overflow-hidden rounded-2xl border bg-white text-left transition ${
                isSelected
                  ? 'border-[#0071E3] ring-2 ring-[#0071E3]/25'
                  : 'border-black/[0.07] hover:border-black/20'
              }`}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F2F2F7] p-1">
                <img
                  src={bird.src}
                  alt={bird.name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-contain object-center transition duration-300 group-hover:scale-105"
                />
                {seen && (
                  <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[#16A34A] shadow-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
              <div className="p-2.5">
                <p className="truncate text-xs font-extrabold text-[#1D1D1F]">{bird.name}</p>
                <p className="truncate text-[10px] font-medium text-[#86868B]">{bird.sizeCm} cm</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 2 (Option B): „Nie wieder verwechseln!“ — 5 Kopf-an-Kopf-Duelle     */
/* -------------------------------------------------------------------------- */

const LOOKALIKE_DUELS = [
  {
    id: 'meisen',
    title: 'Blaumeise vs. Kohlmeise',
    summary: 'Beide sind gelb-bunte Gartenvögel — aber ein Blick auf Kopf und Bauch entscheidet in 1 Sekunde.',
    birdIds: ['blaumeise', 'kohlmeise'],
  },
  {
    id: 'tauben',
    title: 'Ringeltaube vs. Türkentaube',
    summary: 'Der Hals-Check löst das Rätsel sofort: weißer Fleck (Ringeltaube) vs. dünner schwarzer Nackenring (Türkentaube).',
    birdIds: ['ringeltaube', 'tuerkentaube'],
  },
  {
    id: 'schwarz',
    title: 'Die 4 dunklen Vögel: Amsel · Star · Dohle · Rabe',
    summary: 'Alle vier wirken aus der Ferne schwarz — doch Schnabel, Größe, Augenfarbe und Gefiederglanz trennen sie klar.',
    birdIds: ['amsel', 'star', 'dohle', 'rabe'],
  },
  {
    id: 'orange',
    title: 'Rotkehlchen vs. Gartenrotschwanz',
    summary: 'Beide leuchten orange-rot — der Gartenrotschwanz trägt aber eine markante schwarze Maske und einen roten Schwanz.',
    birdIds: ['rotkehlchen', 'gartenrotschwanz'],
  },
  {
    id: 'kletterer',
    title: 'Specht vs. Kleiber',
    summary: 'Beide leben an Baumstämmen — der Specht klettert nur nach oben, der Kleiber läuft als Einziger kopfüber hinab!',
    birdIds: ['specht', 'kleiber'],
  },
]

function Screen2LookalikeDuels() {
  const [duelIdx, setDuelIdx] = useState(0)
  const duel = LOOKALIKE_DUELS[duelIdx]
  const birds = duel.birdIds.map(getBirdById)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {LOOKALIKE_DUELS.map((d, idx) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setDuelIdx(idx)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              duelIdx === idx
                ? 'bg-[#1D1D1F] text-white shadow-xs'
                : 'bg-white text-[#515154] ring-1 ring-black/[0.08] hover:bg-[#EFEFF4]'
            }`}
          >
            {idx + 1}. {d.title.split(':')[0]}
          </button>
        ))}
      </div>

      <div className="apple-card space-y-5 rounded-3xl p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#0071E3] uppercase">
            <Layers className="h-3.5 w-3.5" />
            Verwechslungs-Duell #{duelIdx + 1}
          </span>
          <h3 className="font-apple-black mt-1 text-2xl text-[#1D1D1F]">{duel.title}</h3>
          <p className="mt-1 text-sm font-medium text-[#515154]">{duel.summary}</p>
        </div>

        <div className={`grid gap-4 ${birds.length > 2 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2'}`}>
          {birds.map((b) => (
            <div
              key={b.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-[#F5F5F7]"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#F2F2F7] p-1.5">
                <img
                  src={b.src}
                  alt={b.name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-contain object-center"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="font-apple-display text-base text-[#1D1D1F]">{b.name}</h4>
                    <span className="font-mono text-[11px] font-bold text-[#86868B]">{b.sizeCm} cm</span>
                  </div>
                  <p className="mt-2 rounded-xl bg-white p-2.5 text-xs font-bold text-[#0071E3]">
                    {b.signature}
                  </p>
                </div>
                <p className="mt-2.5 text-[11px] leading-relaxed font-medium text-[#515154]">
                  {b.lookalikeTip}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 3 (Option B): Größen-Skala aller 27 Vogelarten (9,5 cm → 150 cm)    */
/* -------------------------------------------------------------------------- */

function Screen3SizeScale() {
  const [tier, setTier] = useState<'small' | 'medium' | 'large'>('small')
  const [focusId, setFocusId] = useState<string>('zaunkoenig')

  const sortedBySize = useMemo(() => [...ALL_BIRDS].sort((a, b) => a.sizeCm - b.sizeCm), [])

  const tierBirds = useMemo(() => {
    if (tier === 'small') return sortedBySize.filter((b) => b.sizeCm <= 15)
    if (tier === 'medium') return sortedBySize.filter((b) => b.sizeCm > 15 && b.sizeCm <= 36)
    return sortedBySize.filter((b) => b.sizeCm > 36)
  }, [sortedBySize, tier])

  const focusBird = getBirdById(focusId)

  return (
    <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
      <div className="apple-card space-y-4 rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#15803D] uppercase">
              <Ruler className="h-3.5 w-3.5" />
              Körperlängen-Vergleich (alle 27 Arten)
            </span>
            <h3 className="font-apple-display text-lg text-[#1D1D1F]">
              Vom 9,5-cm-Zaunkönig zum 150-cm-Schwan
            </h3>
          </div>

          <div className="flex rounded-full bg-[#EFEFF4] p-1 text-xs">
            {(
              [
                { id: 'small', label: 'Klein (≤15 cm)' },
                { id: 'medium', label: 'Mittel (16–36 cm)' },
                { id: 'large', label: 'Groß (>36 cm)' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTier(t.id)
                  const first =
                    t.id === 'small' ? 'zaunkoenig' : t.id === 'medium' ? 'goldammer' : 'schwan'
                  setFocusId(first)
                }}
                className={`rounded-full px-3 py-1 font-bold transition ${
                  tier === t.id ? 'bg-white text-[#1D1D1F] shadow-xs' : 'text-[#6E6E73]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={tierBirds}
              layout="vertical"
              margin={{ top: 4, right: 20, left: 12, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
              <XAxis type="number" unit=" cm" tick={{ fill: '#6E6E73', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={118}
                tick={{ fill: '#1D1D1F', fontSize: 11, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                formatter={(v) => [`${v} cm`, 'Körperlänge']}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: 'rgba(0,0,0,0.08)',
                  borderRadius: '14px',
                  fontSize: '12px',
                  color: '#1D1D1F',
                }}
              />
              <Bar
                dataKey="sizeCm"
                radius={[0, 8, 8, 0]}
                onClick={(entry) => {
                  const id = (entry as { id?: string })?.id
                  if (id) setFocusId(id)
                }}
                className="cursor-pointer"
              >
                {tierBirds.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={entry.id === focusId ? '#0071E3' : '#94A3B8'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs font-medium text-[#6E6E73]">
          Klicke einen Balken an, um den jeweiligen Vogel rechts im Detail zu vergleichen.
        </p>
      </div>

      {/* Selected Bird Size Preview */}
      <div className="flex flex-col justify-between gap-4">
        <SmartMediaImage
          src={focusBird.src}
          wikiTitle={focusBird.wikiTitle}
          wikiLang="en"
          alt={focusBird.name}
          caption={`${focusBird.name} — Körperlänge ca. ${focusBird.sizeCm} cm`}
          credit="Wikimedia Commons"
          aspectClass="aspect-[16/10]"
        />
        <div className="apple-card rounded-3xl p-5">
          <div className="flex items-baseline justify-between">
            <h4 className="font-apple-black text-2xl text-[#1D1D1F]">{focusBird.name}</h4>
            <span className="font-apple-black text-2xl text-[#0071E3] tabular-nums">
              {focusBird.sizeCm} cm
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed font-medium text-[#515154]">
            {focusBird.signature}. {focusBird.detail}
          </p>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 4 (Option C Wildcard): Fernglas-Bestimmungs-Trainer (Alle 27!)      */
/* -------------------------------------------------------------------------- */

function buildDistractors(target: BirdSpecies): BirdSpecies[] {
  // Prefer same world or similar size so the challenge actually trains recognition!
  const sameWorld = ALL_BIRDS.filter((b) => b.id !== target.id && b.world === target.world)
  const others = ALL_BIRDS.filter((b) => b.id !== target.id && b.world !== target.world)
  const pool = [...sameWorld, ...others].slice(0, 3)
  const combined = [target, ...pool]
  // Deterministic rotation based on target name length so correct option position varies cleanly
  const shift = (target.name.length + Math.round(target.sizeCm)) % combined.length
  return [...combined.slice(shift), ...combined.slice(0, shift)]
}

function Screen4BinocularTrainer() {
  const [index, setIndex] = useState(0)
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [blurLens, setBlurLens] = useState(false)
  const [score, setScore] = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)

  const currentBird = ALL_BIRDS[index]
  const options = useMemo(() => buildDistractors(currentBird), [currentBird])

  const handleAnswer = (birdId: string) => {
    if (selectedChoiceId) return
    setSelectedChoiceId(birdId)
    setAnsweredCount((c) => c + 1)
    if (birdId === currentBird.id) {
      setScore((s) => s + 1)
    }
  }

  const nextBird = () => {
    setSelectedChoiceId(null)
    setShowHint(false)
    setIndex((i) => (i + 1) % ALL_BIRDS.length)
  }

  const resetTrainer = () => {
    setIndex(0)
    setSelectedChoiceId(null)
    setShowHint(false)
    setScore(0)
    setAnsweredCount(0)
  }

  const isCorrect = selectedChoiceId === currentBird.id

  return (
    <div className="apple-card space-y-6 rounded-3xl p-6">
      {/* Header & Progress across ALL 27 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#DCFCE7] text-[#15803D]">
            <Binoculars className="h-5 w-5" />
          </div>
          <div>
            <p className="font-mono text-[11px] font-bold text-[#15803D] uppercase">
              Fernglas-Trainer · Alle 27 Arten
            </p>
            <h3 className="font-apple-display text-lg text-[#1D1D1F]">
              Welcher Vogel sitzt vor deiner Linse?
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#F2F2F7] px-3 py-1 font-mono text-xs font-bold text-[#1D1D1F]">
            Vogel {index + 1}/27 · Treffer: {score}/{answeredCount}
          </span>
          <button
            type="button"
            onClick={() => setBlurLens((b) => !b)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition ${
              blurLens ? 'bg-[#1D1D1F] text-white' : 'bg-[#F2F2F7] text-[#515154]'
            }`}
            title="Profi-Modus: Bild erst leicht unscharf wie bei Nebel"
          >
            <Eye className="h-3.5 w-3.5" />
            {blurLens ? 'Profi-Unschärfe aktiv' : 'Scharf'}
          </button>
          {answeredCount > 0 && (
            <button
              type="button"
              onClick={resetTrainer}
              className="inline-flex items-center gap-1 rounded-full bg-[#F2F2F7] px-3 py-1 text-xs font-bold text-[#515154] hover:bg-[#E5E5EA]"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        {/* Clean Apple Binocular Viewfinder (shows 100% of every bird centered, never cropped!) */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-[28px] border-[6px] border-[#1D1D1F] bg-[#F2F2F7] p-2 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.22)]">
            <img
              src={currentBird.src}
              alt="Gesuchte Vogelart im Fernglas"
              referrerPolicy="no-referrer"
              className={`h-full w-full object-contain object-center transition duration-500 ${
                blurLens && !selectedChoiceId ? 'blur-[4px]' : 'blur-0'
              }`}
            />
            {/* Subtle optical viewfinder corner ticks */}
            <span className="pointer-events-none absolute top-3 left-3 h-4 w-4 rounded-tl-md border-t-2 border-l-2 border-[#1D1D1F]/35" />
            <span className="pointer-events-none absolute top-3 right-3 h-4 w-4 rounded-tr-md border-t-2 border-r-2 border-[#1D1D1F]/35" />
            <span className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 rounded-bl-md border-b-2 border-l-2 border-[#1D1D1F]/35" />
            <span className="pointer-events-none absolute right-3 bottom-3 h-4 w-4 rounded-br-md border-r-2 border-b-2 border-[#1D1D1F]/35" />
          </div>

          {!selectedChoiceId && (
            <button
              type="button"
              onClick={() => setShowHint((h) => !h)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#F2F2F7] px-3.5 py-1.5 text-xs font-bold text-[#515154] hover:bg-[#E5E5EA] hover:text-[#1D1D1F]"
            >
              <HelpCircle className="h-3.5 w-3.5 text-[#0071E3]" />
              {showHint ? 'Merkmals-Tipp ausblenden' : 'Schlüsselmerkmal anzeigen'}
            </button>
          )}

          {showHint && !selectedChoiceId && (
            <p className="max-w-sm rounded-2xl bg-[#E8F2FC] px-4 py-2.5 text-center text-xs font-bold text-[#0071E3]">
              Tipp: {currentBird.signature} (~{currentBird.sizeCm} cm)
            </p>
          )}
        </div>

        {/* 4 Plausible Choices */}
        <div className="space-y-3">
          <div className="grid gap-2.5">
            {options.map((opt) => {
              const isPicked = selectedChoiceId === opt.id
              const isRightOpt = Boolean(selectedChoiceId) && opt.id === currentBird.id
              const isWrongPicked = Boolean(selectedChoiceId) && isPicked && opt.id !== currentBird.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={Boolean(selectedChoiceId)}
                  onClick={() => handleAnswer(opt.id)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-sm font-extrabold transition ${
                    isRightOpt
                      ? 'border-[#86EFAC] bg-[#F0FDF4] text-[#14532D]'
                      : isWrongPicked
                        ? 'border-[#FCA5A5] bg-[#FEF2F2] text-[#7F1D1D]'
                        : 'border-black/[0.08] bg-[#F5F5F7] text-[#1D1D1F] hover:border-[#0071E3] hover:bg-[#F0F7FF]'
                  }`}
                >
                  <span>{opt.name}</span>
                  {isRightOpt && <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />}
                  {isWrongPicked && <XCircle className="h-4 w-4 text-[#DC2626]" />}
                </button>
              )
            })}
          </div>

          {selectedChoiceId && (
            <div className="space-y-3 rounded-2xl bg-[#F5F5F7] p-4">
              <p className="text-xs leading-relaxed font-medium text-[#1D1D1F]">
                <strong>{isCorrect ? 'Volltreffer!' : `Das war: ${currentBird.name}.`}</strong>{' '}
                {currentBird.signature}.
              </p>
              <button
                type="button"
                onClick={nextBird}
                className="w-full rounded-full bg-[#0071E3] py-2.5 text-xs font-bold text-white transition hover:bg-[#0077ED]"
              >
                Nächsten Vogel anvisieren ({((index + 1) % ALL_BIRDS.length) + 1}/27) →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 5 (Option C): Vogelstimmen-Studio (WebAudio + Verifizierte Videos)  */
/* -------------------------------------------------------------------------- */

const CUCKOO_CALL: SynthNote[] = [
  { pitch: 'F#5', durationSec: 0.22, offsetSec: 0.0 },
  { pitch: 'D#5', durationSec: 0.36, offsetSec: 0.28 },
  { pitch: 'F#5', durationSec: 0.22, offsetSec: 1.05 },
  { pitch: 'D#5', durationSec: 0.38, offsetSec: 1.33 },
]

const GREAT_TIT_CALL: SynthNote[] = [
  { pitch: 'A5', durationSec: 0.16, offsetSec: 0.0 },
  { pitch: 'F#5', durationSec: 0.22, offsetSec: 0.2 },
  { pitch: 'A5', durationSec: 0.16, offsetSec: 0.52 },
  { pitch: 'F#5', durationSec: 0.22, offsetSec: 0.72 },
  { pitch: 'A5', durationSec: 0.16, offsetSec: 1.04 },
  { pitch: 'F#5', durationSec: 0.26, offsetSec: 1.24 },
]

function Screen5BirdSongs() {
  const [playingId, setPlayingId] = useState<'kuckuck' | 'kohlmeise' | null>(null)
  const [videoTab, setVideoTab] = useState<'garten' | 'haeufig'>('garten')
  const cancelRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => {
      cancelRef.current?.()
      stopAllAudio()
    }
  }, [])

  const toggleCall = (id: 'kuckuck' | 'kohlmeise', notes: SynthNote[]) => {
    if (playingId === id) {
      cancelRef.current?.()
      cancelRef.current = null
      setPlayingId(null)
      return
    }
    cancelRef.current?.()
    setPlayingId(id)
    const { cancel } = playMelody(notes, (idx) => {
      if (idx === null) {
        setPlayingId(null)
        cancelRef.current = null
      }
    })
    cancelRef.current = cancel
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Live Web Audio Bird Motifs */}
      <div className="apple-card flex flex-col justify-between gap-4 rounded-3xl p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#0071E3] uppercase">
            <Volume2 className="h-4 w-4" />
            Akustische Eselsbrücken (Live-Ton)
          </span>
          <h3 className="font-apple-display mt-1 text-lg text-[#1D1D1F]">
            Zwei Rufe, die jeder sofort erkennt
          </h3>
          <p className="mt-1 text-xs font-medium text-[#515154]">
            Tippe die Karten an, um die charakteristischen Tonintervalle direkt anzuhören:
          </p>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl bg-[#F5F5F7] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold text-[#1D1D1F]">Kuckuck („Ku-kuck“)</p>
                <p className="text-xs font-medium text-[#6E6E73]">
                  Unverwechselbare fallende kleine Terz (F#5 → D#5)
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleCall('kuckuck', CUCKOO_CALL)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                  playingId === 'kuckuck'
                    ? 'bg-[#1D1D1F] text-white'
                    : 'bg-[#0071E3] text-white hover:bg-[#0077ED]'
                }`}
              >
                {playingId === 'kuckuck' ? (
                  <>
                    <Square className="h-3 w-3 fill-current" />
                    Stopp
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" />
                    Abspielen
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-[#F5F5F7] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold text-[#1D1D1F]">Kohlmeise („Zi-däh / Judith“)</p>
                <p className="text-xs font-medium text-[#6E6E73]">
                  Lauter, metallischer zweisilbiger Wechsel wie eine Luftpumpe
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleCall('kohlmeise', GREAT_TIT_CALL)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                  playingId === 'kohlmeise'
                    ? 'bg-[#1D1D1F] text-white'
                    : 'bg-[#0071E3] text-white hover:bg-[#0077ED]'
                }`}
              >
                {playingId === 'kohlmeise' ? (
                  <>
                    <Square className="h-3 w-3 fill-current" />
                    Stopp
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" />
                    Abspielen
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#F0FDF4] p-4 text-xs leading-relaxed font-medium text-[#14532D]">
          <strong>Merksatz für draußen:</strong> Amseln flöten weich in der Dämmerung, Rotkehlchen perlen wie ein Bach — und die Goldammer zählt laut: <em>„Wie-wie-wie-wie-hab-ich-dich-lieb!“</em>
        </div>
      </div>

      {/* Verified German Bird Song YouTube Videos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D1D1F]">
            <Film className="h-4 w-4 text-[#15803D]" />
            Echte Vogelstimmen (YouTube)
          </span>
          <div className="flex rounded-full bg-[#EFEFF4] p-1 text-xs">
            <button
              type="button"
              onClick={() => setVideoTab('garten')}
              className={`rounded-full px-3 py-1 font-bold transition ${
                videoTab === 'garten' ? 'bg-white text-[#1D1D1F] shadow-xs' : 'text-[#6E6E73]'
              }`}
            >
              Gartenvögel
            </button>
            <button
              type="button"
              onClick={() => setVideoTab('haeufig')}
              className={`rounded-full px-3 py-1 font-bold transition ${
                videoTab === 'haeufig' ? 'bg-white text-[#1D1D1F] shadow-xs' : 'text-[#6E6E73]'
              }`}
            >
              Häufigste Stimmen
            </button>
          </div>
        </div>

        {videoTab === 'garten' ? (
          <SmartVideoPlayer
            key="vogelstimmen-garten"
            videoId="dh1lDRjjOcs"
            start={35}
            end={185}
            title="Gartenvögel und ihr Gesang | Vogelstimmen lernen"
            channel="Kalle Nibbenhagen"
            segmentLabel="Original-Vogelstimmen mit Bildzuordnung"
          />
        ) : (
          <SmartVideoPlayer
            key="vogelstimmen-haeufig"
            videoId="A311lvGa88g"
            start={20}
            end={170}
            title="Häufige Vogelstimmen im Garten - Vogelstimmen lernen"
            channel="Kalle Nibbenhagen"
            segmentLabel="Amsel, Meisen, Rotkehlchen & Finken live hören"
          />
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SCREEN 6: Lebensraum-Kompass — Alle 27 Arten nach Ort geordnet             */
/* -------------------------------------------------------------------------- */

const HABITATS: BirdHabitat[] = ['Garten & Park', 'Wald & Stamm', 'Feld & Himmel', 'Wasser & Küste']

function Screen6HabitatCompass() {
  const [activeHabitat, setActiveHabitat] = useState<BirdHabitat>('Garten & Park')
  const birdsInHabitat = ALL_BIRDS.filter((b) => b.habitat === activeHabitat)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {HABITATS.map((hab) => {
          const count = ALL_BIRDS.filter((b) => b.habitat === hab).length
          return (
            <button
              key={hab}
              type="button"
              onClick={() => setActiveHabitat(hab)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                activeHabitat === hab
                  ? 'bg-[#1D1D1F] text-white'
                  : 'bg-white text-[#515154] ring-1 ring-black/[0.08] hover:bg-[#EFEFF4]'
              }`}
            >
              <Trees className="h-3.5 w-3.5" />
              <span>
                {hab} ({count})
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {birdsInHabitat.map((b) => (
          <div key={b.id} className="apple-card flex items-center gap-3.5 rounded-2xl p-3.5">
            <div className="h-16 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#F2F2F7] p-1">
              <img
                src={b.src}
                alt={b.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain object-center"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-[#1D1D1F]">{b.name}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug font-medium text-[#515154]">
                {b.signature}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="apple-card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#15803D]">
          <Sparkles className="h-4 w-4" />
          <span>Alle 27 Vogelarten abgedeckt — bereit für deine 5 SM-2-Prüfungen!</span>
        </div>
        <span className="font-mono text-xs font-semibold text-[#86868B]">
          Garten · Wald · Himmel · Wasser
        </span>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  LESSON DEFINITION                                                          */
/* -------------------------------------------------------------------------- */

const bekannteVogelartenLesson: LessonDefinition = {
  id: 'natur-bekannte-vogelarten',
  slug: 'bekannte-vogelarten',
  categoryId: 'natur',
  title: 'Die 27 bekanntesten Vogelarten — Bestimmungs-Atlas',
  subtitle:
    'Von der Blaumeise bis zum Stieglitz: Alle 27 heimischen Vogelarten mit echten Fotos, Verwechslungs-Duellen, Größenskala, Fernglas-Trainer und Vogelstimmen.',
  eraOrContext: '27 Arten · Naturführer',
  estimatedMinutes: 10,
  difficulty: 'Vertiefung',
  xpReward: 280,
  heroMedia: {
    src: getBirdById('stieglitz').src,
    wikiTitle: 'European goldfinch',
    wikiLang: 'en',
    alt: 'Stieglitz (Carduelis carduelis) auf einem Zweig',
    credit: 'Wikimedia Commons',
  },
  keyTakeaways: [
    'Meisen & Finken trennst du am schnellsten über Kopf & Flügel: Blaumeise (blaue Kappe), Kohlmeise (schwarzer Bauchstreifen), Stieglitz (rote Maske + gelbes Band), Buchfink (doppelte weiße Flügelbinde).',
    'Die 4 dunklen Vögel auf einen Blick: Amsel (gelber Schnabel), Star (glänzende Perlpunkte), Dohle (grauer Nacken & helles Auge), Rabe (riesig, 64 cm, Keilschnabel).',
    'Tauben & Kletterer: Ringeltaube hat einen weißen Halsfleck, Türkentaube einen dünnen schwarzen Nackenring — und der Kleiber läuft als Einziger kopfüber Baumstämme hinab.',
    'Größenspektrum in der Natur: Vom 9,5 cm winzigen Zaunkönig bis zum 150 cm großen Höckerschwan; den Turmfalken verrät sein Rüttelflug auf der Stelle.',
  ],
  screens: [
    {
      id: 'vogel-atlas-27',
      badge: '01 · Bestimmungs-Atlas (27/27)',
      title: 'Alle 27 Vogelarten nach Welt & Farbe entdecken',
      subtitle:
        'Filtere alle 27 Arten nach Gruppe oder Gefiederfarbe und präge dir pro Vogel das eine unverwechselbare 1-Sekunden-Merkmal ein.',
      component: Screen1FieldGuideAtlas,
    },
    {
      id: 'verwechslungs-duelle',
      badge: '02 · Verwechslungs-Labor',
      title: 'Nie wieder verwechseln: Die 5 wichtigsten Duelle',
      subtitle:
        'Direkter Foto-Vergleich der ähnlichsten Arten: Meisen, Tauben, schwarze Vögel, Orange-Brüste und Baumkletterer.',
      component: Screen2LookalikeDuels,
    },
    {
      id: 'groessen-skala',
      badge: '03 · Maßstab-Labor',
      title: 'Vom 9,5-cm-Zaunkönig bis zum 150-cm-Schwan',
      subtitle:
        'Neben der Farbe ist die Größe dein zweitstärkstes Bestimmungswerkzeug — vergleiche alle 27 Arten im Balkendiagramm.',
      component: Screen3SizeScale,
    },
    {
      id: 'fernglas-trainer',
      badge: '04 · Live-Fernglas-Trainer',
      title: 'Feld-Challenge: Erkennst du alle 27 Arten?',
      subtitle:
        'Blicke durch das Fernglas, nutze bei Bedarf das Schlüsselmerkmal und trainiere alle 27 Arten gegen ihre Doppelgänger.',
      component: Screen4BinocularTrainer,
    },
    {
      id: 'vogelstimmen',
      badge: '05 · Stimmen & Gesang',
      title: 'Vogelstimmen-Studio & Original-Aufnahmen',
      subtitle:
        'Höre dir Kuckuck und Kohlmeise direkt im Browser an und lerne echte Gartenvogel-Stimmen im Video.',
      component: Screen5BirdSongs,
    },
    {
      id: 'lebensraum-kompass',
      badge: '06 · Lebensraum-Kompass',
      title: 'Wo begegnest du welcher Art draußen?',
      subtitle:
        'Alle 27 Vogelarten geordnet nach Garten & Park, Wald & Stamm, Feld & Himmel sowie Wasser & Küste.',
      component: Screen6HabitatCompass,
    },
  ],
  quizzes: [
    {
      id: 'vogel-quiz-signatures-1',
      lessonId: 'natur-bekannte-vogelarten',
      categoryId: 'natur',
      type: 'visual-connect',
      prompt: 'Verbinde diese 4 Vogelarten mit ihrem unverwechselbaren Erkennungsmerkmal.',
      explanation:
        'Kleiber laufen kopfüber am Stamm, Eichelhäher tragen blaue Flügelfedern, Türkentauben einen dünnen schwarzen Nackenring und Turmfalken rütteln auf der Stelle.',
      leftColumnTitle: 'Vogelart',
      rightColumnTitle: 'Erkennungs-Signatur',
      pairs: [
        {
          id: 'kleiber',
          left: 'Kleiber',
          leftSub: 'Wald & Stamm',
          right: 'Läuft kopfüber Baumstämme hinab',
        },
        {
          id: 'eichelhaeher',
          left: 'Eichelhäher',
          leftSub: 'Rabenvogel',
          right: 'Blau-schwarz gestreifter Flügelspiegel',
        },
        {
          id: 'tuerkentaube',
          left: 'Türkentaube',
          leftSub: 'Sandbeige Taube',
          right: 'Dünner schwarzer Nackenring',
        },
        {
          id: 'turmfalke',
          left: 'Turmfalke',
          leftSub: 'Greifvogel',
          right: 'Rüttelflug auf der Stelle in der Luft',
        },
      ],
    },
    {
      id: 'vogel-quiz-lookalikes-2',
      lessonId: 'natur-bekannte-vogelarten',
      categoryId: 'natur',
      type: 'visual-connect',
      prompt: 'Verwechslungs-Check: Welches Merkmal trennt diese 4 bekannten Gartenarten?',
      explanation:
        'Kohlmeise (schwarzer Bauchstreifen), Ringeltaube (weißer Halsfleck), Amsel-Männchen (gelber Schnabel) und Stieglitz (rote Gesichtsmaske).',
      leftColumnTitle: 'Vogelart',
      rightColumnTitle: 'Klares Unterscheidungsmerkmal',
      pairs: [
        {
          id: 'kohlmeise',
          left: 'Kohlmeise',
          leftSub: 'vs. Blaumeise',
          right: 'Schwarzer Kopf & schwarzer Bauchstreifen',
        },
        {
          id: 'ringeltaube',
          left: 'Ringeltaube',
          leftSub: 'vs. Türkentaube',
          right: 'Groß mit deutlichem weißem Halsfleck',
        },
        {
          id: 'amsel',
          left: 'Amsel (Männchen)',
          leftSub: 'vs. Star & Dohle',
          right: 'Tiefschwarz mit leuchtend gelbem Schnabel',
        },
        {
          id: 'stieglitz',
          left: 'Stieglitz',
          leftSub: 'Distelfink',
          right: 'Knallrote Gesichtsmaske & gelbes Flügelband',
        },
      ],
    },
    {
      id: 'vogel-quiz-cuckoo-audio',
      lessonId: 'natur-bekannte-vogelarten',
      categoryId: 'natur',
      type: 'audio-match',
      prompt: 'Höre das Tonbeispiel an — welcher Vogel ruft diese klassische fallende Terz?',
      explanation:
        'Der Kuckuck ruft seine unverwechselbare fallende kleine Terz („Ku-kuck“), weshalb man ihn viel häufiger hört als sieht.',
      audio: {
        mode: 'tone',
        label: 'Heimischer Vogelruf (fallende Terz)',
        notes: [
          { pitch: 'F#5', duration: '8n', timeOffset: 0.0 },
          { pitch: 'D#5', duration: '4n', timeOffset: 0.28 },
          { pitch: 'F#5', duration: '8n', timeOffset: 1.0 },
          { pitch: 'D#5', duration: '4n', timeOffset: 1.28 },
        ],
      },
      options: [
        { id: 'kuckuck', label: 'Kuckuck', description: 'Brutparasit & Langstreckenzieher' },
        { id: 'specht', label: 'Specht', description: 'Trommelt auf trockenen Ästen' },
        { id: 'bachstelze', label: 'Bachstelze', description: 'Wippender Schwanz am Wasser' },
        { id: 'elster', label: 'Elster', description: 'Schwarz-weiß mit langem Schwanz' },
      ],
      correctOptionId: 'kuckuck',
    },
    {
      id: 'vogel-quiz-size-sort',
      lessonId: 'natur-bekannte-vogelarten',
      categoryId: 'natur',
      type: 'timeline-sort',
      prompt: 'Sortiere diese 4 Vogelarten der Größe nach — von 1 (kleinster) bis 4 (größter)!',
      explanation:
        'Zaunkönig (~9,5 cm) < Rotkehlchen (~14 cm) < Elster (~46 cm) < Schwan (~150 cm).',
      items: [
        { id: 's1', label: 'Zaunkönig', sublabel: 'Steil aufgestellter Mini-Schwanz', order: 0 },
        { id: 's2', label: 'Rotkehlchen', sublabel: 'Kugelige orange Brust', order: 1 },
        { id: 's3', label: 'Elster', sublabel: 'Schwarz-weiß mit langem Schwanz', order: 2 },
        { id: 's4', label: 'Schwan (Höckerschwan)', sublabel: 'Schwerer weißer Wasservogel', order: 3 },
      ],
    },
    {
      id: 'vogel-quiz-swan-size',
      lessonId: 'natur-bekannte-vogelarten',
      categoryId: 'natur',
      type: 'slider-estimate',
      prompt: 'Wie lang (in cm) wird ein ausgewachsener Höckerschwan vom Schnabel bis zur Schwanzspitze?',
      hint: 'Er ist der mit Abstand größte Vogel unserer 27 Arten — deutlich über einem Meter!',
      explanation:
        'Ein ausgewachsener Höckerschwan erreicht rund 150 cm Körperlänge (bei über 2 Metern Flügelspannweite).',
      min: 60,
      max: 220,
      step: 5,
      unit: 'cm',
      targetValue: 150,
      tolerance: 20,
    },
  ],
}

export default bekannteVogelartenLesson
