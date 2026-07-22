export type QuestionKind = 'mul' | 'div'

/**
 * A question is one fact with one unknown slot:
 *   mul: a × b = result      div: a ÷ b = result
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
}

export type LevelMode = 'choice' | 'type' | 'missing' | 'mixed'

export interface StoryLine {
  speaker: 'monster' | 'goblin' | 'guide'
  text: string
}

export interface LevelDef {
  mode: LevelMode
  title: string
  /** story beat shown before this level (first time only) */
  story: StoryLine[]
}

export interface Region {
  id: string
  name: string
  emoji: string
  color: string
  /** times tables this region draws from */
  tables: number[]
  kind: 'times' | 'division' | 'mixed'
  levels: LevelDef[]
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
  /** levelId ("beach-0") -> best stars earned, 0-3 */
  stars: Record<string, number>
  /** spendable stars (earned minus spent) */
  wallet: number
  owned: string[]
  equipped: Partial<Record<PartSlot, string>>
  seenStory: string[]
  seenFinale: boolean
  muted: boolean
}

export const levelId = (regionId: string, level: number) => `${regionId}-${level}`
