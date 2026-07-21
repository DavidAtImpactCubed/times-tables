import type { CSSProperties } from 'react'
import type { PartSlot } from '../types'
import { itemById } from '../data/wardrobe'

export type Mood = 'idle' | 'happy' | 'sad' | 'excited'

/** One compositing layer of the monster; used by the parts sheet to export isolated components. */
export type MonsterLayer = 'base' | 'back' | 'horns' | 'eyes' | 'mouth' | 'face' | 'hat' | 'held'

interface Props {
  equipped: Partial<Record<PartSlot, string>>
  mood?: Mood
  size?: number
  className?: string
  /** render only this layer (all layers when omitted) */
  layer?: MonsterLayer
}

const files = import.meta.glob('../assets/monster/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>
const asset = (stem: string): string | undefined => {
  for (const [path, url] of Object.entries(files)) if (path.endsWith(`/${stem}.webp`)) return url
  return undefined
}

// Shared compositing canvas (from the art-extraction pipeline): 1400×1340 units,
// base body 1034×970 at (183, 290). Placements are {cx, cy, w} in canvas units.
const CANVAS_W = 1400
const CANVAS_H = 1340

interface Placement {
  cx: number
  cy: number
  w: number
}

const PLACE: Record<string, Placement> = {
  'base-body': { cx: 700, cy: 775, w: 1034 },
  'eyes-two': { cx: 700, cy: 610, w: 400 },
  'eyes-one': { cx: 700, cy: 610, w: 260 },
  'eyes-three': { cx: 700, cy: 610, w: 430 },
  'eyes-sleepy': { cx: 700, cy: 610, w: 430 },
  'eyes-stars': { cx: 700, cy: 610, w: 390 },
  'mouth-idle': { cx: 700, cy: 810, w: 230 },
  'mouth-happy': { cx: 700, cy: 810, w: 280 },
  'mouth-sad': { cx: 700, cy: 810, w: 230 },
  'face-round': { cx: 700, cy: 610, w: 470 },
  'face-sun': { cx: 700, cy: 610, w: 470 },
  'face-star': { cx: 700, cy: 610, w: 470 },
  'horns-little': { cx: 700, cy: 300, w: 500 },
  'horns-curly': { cx: 700, cy: 280, w: 560 },
  'horns-antennae': { cx: 700, cy: 200, w: 420 },
  'horns-unicorn': { cx: 700, cy: 210, w: 160 },
  'hat-crown': { cx: 700, cy: 250, w: 380 },
  'hat-wizard': { cx: 700, cy: 230, w: 520 },
  'hat-party': { cx: 700, cy: 180, w: 300 },
  'hat-bow': { cx: 440, cy: 300, w: 320 },
  'hat-flower': { cx: 980, cy: 310, w: 250 },
  'held-balloon': { cx: 1277, cy: 670, w: 260 },
  'held-wand': { cx: 1247, cy: 740, w: 310 },
  'held-icecream': { cx: 1247, cy: 710, w: 200 },
  'held-flag': { cx: 1267, cy: 670, w: 300 },
  'back-cape': { cx: 700, cy: 930, w: 1050 },
  'back-wings': { cx: 700, cy: 620, w: 1220 },
}

function layerStyle(stem: string): CSSProperties {
  const p = PLACE[stem]
  return {
    position: 'absolute',
    left: `${(p.cx / CANVAS_W) * 100}%`,
    top: `${(p.cy / CANVAS_H) * 100}%`,
    width: `${(p.w / CANVAS_W) * 100}%`,
    transform: 'translate(-50%, -50%)',
  }
}

export function Monster({ equipped, mood = 'idle', size = 160, className, layer }: Props) {
  const variant = (slot: PartSlot) => itemById(equipped[slot])?.variant
  const L = (l: MonsterLayer) => layer === undefined || layer === l

  const bodyVariant = variant('body') ?? 'purple'
  const bodyStem = bodyVariant === 'purple' ? 'base-body' : `base-body-${bodyVariant}`
  const eyesStem = equipped.eyes ?? 'eyes-two'
  const mouthStem = `mouth-${mood === 'excited' ? 'happy' : mood}`

  // stacking order: back → base → eyes → mouth → glasses → horns → hat → held
  const stems: [MonsterLayer, string | undefined][] = [
    ['back', equipped.back],
    ['base', bodyStem],
    ['eyes', eyesStem],
    ['mouth', mouthStem],
    ['face', equipped.face],
    ['horns', equipped.horns],
    ['hat', equipped.hat],
    ['held', equipped.held],
  ]

  return (
    <div
      className={className}
      role="img"
      aria-label="Your monster"
      style={{ position: 'relative', width: size, height: size * (CANVAS_H / CANVAS_W) }}
    >
      {stems.map(([l, stem]) => {
        if (!stem || !L(l)) return null
        const url = asset(stem)
        const placeKey = l === 'base' ? 'base-body' : stem
        if (!url || !PLACE[placeKey]) return null
        return <img key={stem} src={url} alt="" draggable={false} style={layerStyle(placeKey)} />
      })}
    </div>
  )
}
