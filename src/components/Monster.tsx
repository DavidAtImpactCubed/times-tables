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

// Shared compositing canvas (from the art-extraction pipeline): 1300×1240 units,
// base body 954×1082 at (173, 138). Placements are {cx, cy, w} in canvas units.
const CANVAS_W = 1300
const CANVAS_H = 1240

interface Placement {
  cx: number
  cy: number
  w: number
}

const PLACE: Record<string, Placement> = {
  // standing base is offset left so the head (skewed by the tail) sits at canvas centre
  'base-body': { cx: 598, cy: 679, w: 952 },
  'base-body-raised': { cx: 650, cy: 682, w: 999 },
  'eyes-two': { cx: 650, cy: 468, w: 340 },
  'eyes-happy': { cx: 650, cy: 468, w: 340 },
  'eyes-angry': { cx: 650, cy: 468, w: 340 },
  'eyes-sleepy': { cx: 650, cy: 468, w: 340 },
  'eyes-wink': { cx: 650, cy: 468, w: 330 },
  'eyes-stars': { cx: 650, cy: 468, w: 350 },
  'mouth-idle': { cx: 650, cy: 658, w: 230 },
  'mouth-happy': { cx: 650, cy: 658, w: 280 },
  'mouth-sad': { cx: 650, cy: 658, w: 150 },
  'mouth-excited': { cx: 650, cy: 658, w: 280 },
  'face-scarf': { cx: 650, cy: 803, w: 430 },
  'face-bandana': { cx: 650, cy: 803, w: 440 },
  'face-medal': { cx: 650, cy: 783, w: 380 },
  'horns-little': { cx: 650, cy: 228, w: 470 },
  'horns-curly': { cx: 650, cy: 228, w: 470 },
  'horns-green': { cx: 650, cy: 198, w: 470 },
  'horns-antennae': { cx: 650, cy: 118, w: 420 },
  'hat-crown': { cx: 650, cy: 173, w: 330 },
  'hat-wizard': { cx: 675, cy: 153, w: 470 },
  'hat-pirate': { cx: 650, cy: 168, w: 480 },
  'hat-aviator': { cx: 650, cy: 198, w: 420 },
  'hat-cap': { cx: 665, cy: 193, w: 420 },
  'hat-beanie': { cx: 650, cy: 168, w: 380 },
  // held items sit in the raised-pose fist (canvas ~1038, 557)
  'held-balloon': { cx: 1080, cy: 360, w: 230 },
  'held-wand': { cx: 1070, cy: 480, w: 300 },
  'held-icecream': { cx: 1048, cy: 480, w: 190 },
  'held-flag': { cx: 1060, cy: 460, w: 290 },
  'held-telescope': { cx: 1090, cy: 530, w: 300 },
  'held-lantern': { cx: 1045, cy: 620, w: 220 },
  'back-cape': { cx: 650, cy: 908, w: 1150 },
  'back-wings': { cx: 650, cy: 538, w: 1250 },
  'back-batwings': { cx: 650, cy: 518, w: 1420 },
  'back-belt': { cx: 650, cy: 948, w: 620 },
  'back-satchel': { cx: 320, cy: 918, w: 300 },
  'back-duck': { cx: 650, cy: 988, w: 900 },
}

/** back-slot items worn on the front of the body (rendered above the base). */
const FRONT_BACK = new Set(['back-belt', 'back-satchel', 'back-duck'])

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
  // holding something switches to the raised-hand pose
  const pose = equipped.held ? 'base-body-raised' : 'base-body'
  const bodyStem = bodyVariant === 'purple' ? pose : `${pose}-${bodyVariant}`
  const eyesStem = equipped.eyes ?? 'eyes-two'
  const mouthStem = `mouth-${mood}`

  const back = equipped.back
  const backIsFront = back !== undefined && FRONT_BACK.has(back)

  // stacking order: back → base → front-worn back items → eyes → mouth → neckwear → horns → hat → held
  const stems: [MonsterLayer, string | undefined][] = [
    ['back', backIsFront ? undefined : back],
    ['base', bodyStem],
    ['back', backIsFront ? back : undefined],
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
        const placeKey = l === 'base' ? pose : stem
        if (!url || !PLACE[placeKey]) return null
        return <img key={stem} src={url} alt="" draggable={false} style={layerStyle(placeKey)} />
      })}
    </div>
  )
}
