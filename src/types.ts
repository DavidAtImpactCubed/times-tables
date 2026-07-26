export type QuestionKind = 'mul' | 'div' | 'add' | 'sub' | 'count' | 'match'

/**
 * A question is one fact with one unknown slot:
 *   mul: a × b = result      div: a ÷ b = result
 *   add: a + b = result      sub: a - b = result
 *   count: "how many?" — `count` objects shown, answer is how many
 * The unknown says which slot the player must fill in.
 */
export interface Question {
  kind: QuestionKind
  a: number
  b: number
  result: number
  unknown: 'a' | 'b' | 'result'
  answer: number
  /** 'choice' shows big answer buttons, 'pad' shows the number pad */
  input: 'choice' | 'pad'
  choices?: number[]
  /** match questions: fact labels shown on the choice buttons, aligned with `choices` */
  choiceLabels?: string[]
  /** reverse match questions: the fact is shown and these arrays are the choices */
  choiceArrays?: Array<{ rows: number; cols: number }>
  /** early picture-match questions: the choices are groups of `object`, this many in each */
  choiceCounts?: number[]
  /** match questions: heading + read-aloud sentence (defaults to the array wording) */
  prompt?: string
  /** match questions: the big text shown in the panel (e.g. "7" or "Double 4") */
  promptLabel?: string
  /** count questions only: how many objects to show, and which emoji */
  count?: number
  object?: string
}

export type LevelMode = 'choice' | 'type' | 'missing' | 'mixed' | 'match'

export interface StoryLine {
  speaker: 'monster' | 'goblin' | 'guide'
  text: string
}

export interface LevelDef {
  mode: LevelMode
  title: string
  /** story beat shown before this level (first time only) */
  story: StoryLine[]
  /** which background art this level uses (canonical index; levels can be
      reordered on the map, but art stays tied to the story) */
  artIndex?: number
  /** horizontal focus of the art in story/tip scenes, 0-100 (default 0 = left edge) */
  artX?: number
  /** Olivia's optional "how to" tip, offered before every play of this level */
  tip?: TipStep[]
}

/**
 * An optional animated illustration for a tip card. Rendered in code
 * (SVG + CSS) so it stays crisp and can loop gently — no image assets.
 *   count:    highlight objects one at a time, then show the total (cardinality)
 *   tenframe: fill a ten-frame with a gold group then a second group
 *   countOn:  a marker hops forward along a number line (counting on)
 *   countBack: a marker hops backward along a number line (taking away)
 *   double:   two mirrored groups of n combine into the total (doubling)
 *   doubleDouble: n doubles to 2n, then doubles again to 4n (the fours)
 * Number-line visuals plot the ticks `min` (default 0) … `max`.
 */
export type TipVisual =
  | { kind: 'count'; to: number; hands?: boolean }
  | { kind: 'tenframe'; a: number; b: number }
  | { kind: 'countOn'; from: number; add: number; min?: number; max: number; hands?: boolean }
  | { kind: 'countBack'; from: number; sub: number; min?: number; max: number; hands?: boolean }
  | { kind: 'double'; n: number; hands?: boolean }
  | { kind: 'doubleDouble'; n: number }
  | { kind: 'hands'; show: number; of?: number }
  | { kind: 'array'; rows: number; cols: number; divide?: boolean; split?: number }
  | { kind: 'skip'; step: number; times: number; hands?: boolean }

/** One card of Olivia's optional "clever trick" mini-lesson for a topic. */
export interface TipStep {
  /** what Olivia says */
  text: string
  /** an optional worked example, shown highlighted beneath the text */
  example?: string
  /** an optional animated illustration shown above the example */
  visual?: TipVisual
}

/** Which age band a profile plays: 'early' = Reception/Year 1, 'main' = Year 2/3. */
export type Curriculum = 'early' | 'main'

export type RegionKind =
  | 'times'
  | 'division'
  | 'mixed'
  // early-years kinds
  | 'count'
  | 'bond'
  | 'add'
  | 'sub'
  | 'double'
  | 'place'
  | 'half'
  | 'pattern'

export interface Region {
  id: string
  name: string
  emoji: string
  color: string
  /** times tables this region draws from (unused by early-years regions) */
  tables: number[]
  kind: RegionKind
  levels: LevelDef[]
  /** which age band this region belongs to (defaults to 'main') */
  curriculum?: Curriculum
  /** background art region id to reuse, when this region has no art of its own */
  art?: string
  /** how much each star here pays into the wallet — reflects difficulty, not unlock order */
  starValue?: number
}

export type PartSlot = 'body' | 'eyes' | 'glasses' | 'horns' | 'hat' | 'face' | 'held' | 'back'

export interface WardrobeItem {
  id: string
  slot: PartSlot
  name: string
  price: number
  /** slot-specific payload, e.g. a colour for body items or a variant key */
  variant: string
}

export interface SaveData {
  version: 1
  /** which age band this player is on */
  curriculum: Curriculum
  /** levelId ("beach-0") -> best stars earned, 0-3 */
  stars: Record<string, number>
  /** spendable stars (earned minus spent) */
  wallet: number
  owned: string[]
  equipped: Partial<Record<PartSlot, string>>
  seenStory: string[]
  /** legacy: region ids whose tip was offered (tips are now offered before every play) */
  seenTips: string[]
  seenFinale: boolean
  muted: boolean
  /** read questions and tips aloud (defaults on for the early-years band) */
  readAloud: boolean
  /** star-economy version; saves from before difficulty pay get a one-time top-up */
  economy?: number
  /** level-layout version; star keys from before levels were reordered get remapped */
  layout?: number
  /** regions unlocked for good (e.g. earned before new levels were added) */
  unlockedRegions?: string[]
}

export const levelId = (regionId: string, level: number) => `${regionId}-${level}`
