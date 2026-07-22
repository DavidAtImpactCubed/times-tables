import type { CSSProperties } from 'react'
import type { PartSlot } from '../types'
import { itemById } from '../data/wardrobe'

export type Mood = 'idle' | 'happy' | 'sad' | 'excited'

/** One compositing layer of the monster; used by the parts sheet to export isolated components. */
export type MonsterLayer =
  | 'base'
  | 'back'
  | 'horns'
  | 'eyes'
  | 'glasses'
  | 'mouth'
  | 'face'
  | 'hat'
  | 'held'
  | 'fingers'

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

// Shared compositing canvas (from the art-extraction pipeline): 1300×1520 units,
// base body 952×1082 at (~122, 418). The extra headroom above the body fits tall
// worn hats (beanie pompom, wizard tip). Placements are {cx, cy, w} in canvas units.
const CANVAS_W = 1300
const CANVAS_H = 1520

interface Placement {
  cx: number
  cy: number
  w: number
}

const PLACE: Record<string, Placement> = {
  // standing base is offset left so the head (skewed by the tail) sits at canvas centre
  'base-body': { cx: 598, cy: 959, w: 952 },
  'base-body-raised': { cx: 650, cy: 962, w: 999 },
  // fingers overlay shares the raised-body frame, drawn over held props so handles look gripped
  fingers: { cx: 650, cy: 962, w: 999 },
  'eyes-two': { cx: 650, cy: 748, w: 340 },
  'eyes-happy': { cx: 650, cy: 748, w: 340 },
  'eyes-angry': { cx: 650, cy: 748, w: 340 },
  'eyes-sleepy': { cx: 650, cy: 748, w: 340 },
  'eyes-wink': { cx: 650, cy: 748, w: 330 },
  'eyes-stars': { cx: 650, cy: 748, w: 350 },
  'mouth-idle': { cx: 650, cy: 938, w: 230 },
  'mouth-happy': { cx: 650, cy: 938, w: 280 },
  'mouth-sad': { cx: 650, cy: 938, w: 150 },
  'mouth-excited': { cx: 650, cy: 938, w: 280 },
  'glasses-round': { cx: 650, cy: 780, w: 387 },
  'glasses-blue': { cx: 650, cy: 780, w: 387 },
  'glasses-pixel': { cx: 650, cy: 774, w: 387 },
  'glasses-shutter': { cx: 650, cy: 774, w: 387 },
  'glasses-heart': { cx: 650, cy: 780, w: 387 },
  'glasses-star': { cx: 650, cy: 774, w: 396 },
  'face-bowtie': { cx: 650, cy: 1055, w: 300 },
  'face-scarf': { cx: 650, cy: 1075, w: 530 },
  'face-scarf-green': { cx: 650, cy: 1075, w: 530 },
  'face-scarf-blue': { cx: 650, cy: 1075, w: 530 },
  'face-bandana': { cx: 650, cy: 1115, w: 560 },
  'face-medal': { cx: 650, cy: 1090, w: 760 },
  'horns-little': { cx: 650, cy: 445, w: 470 },
  'horns-curly': { cx: 650, cy: 445, w: 470 },
  'horns-green': { cx: 650, cy: 425, w: 470 },
  'horns-antennae': { cx: 650, cy: 398, w: 420 },
  'horns-cream': { cx: 650, cy: 560, w: 480 },
  'horns-teal': { cx: 650, cy: 558, w: 480 },
  'horns-bat': { cx: 650, cy: 572, w: 470 },
  'hat-crown': { cx: 650, cy: 453, w: 330 },
  'hat-wizard': { cx: 658, cy: 420, w: 420 },
  'hat-pirate': { cx: 650, cy: 448, w: 480 },
  'hat-aviator': { cx: 650, cy: 478, w: 420 },
  'hat-cap': { cx: 665, cy: 473, w: 420 },
  'hat-beanie': { cx: 652, cy: 450, w: 330 },
  'hat-viking': { cx: 650, cy: 452, w: 490 },
  // held items sit in the raised-pose fist
  'held-balloon': { cx: 1110, cy: 640, w: 230 },
  // vertical staffs/wands gripped in the raised fist (handle down through the fingers)
  'held-wand': { cx: 1068, cy: 696, w: 150 },
  'held-moon': { cx: 1068, cy: 705, w: 146 },
  'held-crystal': { cx: 1068, cy: 700, w: 108 },
  'held-gem': { cx: 1068, cy: 705, w: 98 },
  'held-orb': { cx: 1068, cy: 712, w: 200 },
  'held-icecream': { cx: 1045, cy: 760, w: 190 },
  'held-flag': { cx: 945, cy: 616, w: 290 },
  'held-telescope': { cx: 1120, cy: 810, w: 300 },
  'held-lantern': { cx: 1075, cy: 900, w: 220 },
  'back-cape': { cx: 650, cy: 1188, w: 1150 },
  'back-wings': { cx: 650, cy: 818, w: 1250 },
  'back-batwings': { cx: 650, cy: 798, w: 1420 },
  'back-belt': { cx: 650, cy: 1228, w: 620 },
  'back-duck': { cx: 580, cy: 1230, w: 930 },
}

/** back-slot items worn on the front of the body (rendered above the base). */
const FRONT_BACK = new Set(['back-belt', 'back-duck'])

/** held items that extend beyond the fingers, so the gripping-fingers overlay is skipped. */
const NO_FINGERS = new Set(['held-lantern', 'held-telescope'])

/** big head-toppers drawn above hats so the hat tucks under them rather than hiding them. */
const HORNS_OVER_HAT = new Set(['horns-cream', 'horns-teal', 'horns-bat'])

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
  // eyes/mouths carry monster skin (lids, brows, lips) tinted to match the body;
  // the rainbow body uses the green-shifted face, matching its gradient at head height
  const faceSuffix = bodyVariant === 'purple' ? '' : bodyVariant === 'rainbow' ? '-green' : `-${bodyVariant}`
  const bodySuffix = bodyVariant === 'purple' ? '' : `-${bodyVariant}`
  const eyesBase = equipped.eyes ?? 'eyes-two'
  const mouthBase = `mouth-${mood}`

  const back = equipped.back
  const backIsFront = back !== undefined && FRONT_BACK.has(back)

  // most horns sit under the hat; big head-toppers (ram/teal/bat) sit above it
  const horns = equipped.horns
  const hornsUnderHat = horns && !HORNS_OVER_HAT.has(horns) ? horns : undefined
  const hornsOverHat = horns && HORNS_OVER_HAT.has(horns) ? horns : undefined

  // stacking order: back → base → front-worn back items → eyes → mouth → neckwear
  //   → under-hat horns → hat → over-hat horns → held
  const stems: { layer: MonsterLayer; stem?: string; place?: string }[] = [
    { layer: 'back', stem: backIsFront ? undefined : back },
    { layer: 'base', stem: bodyStem, place: pose },
    { layer: 'back', stem: backIsFront ? back : undefined },
    { layer: 'eyes', stem: `${eyesBase}${faceSuffix}`, place: eyesBase },
    { layer: 'glasses', stem: equipped.glasses },
    { layer: 'mouth', stem: `${mouthBase}${faceSuffix}`, place: mouthBase },
    { layer: 'face', stem: equipped.face },
    { layer: 'horns', stem: hornsUnderHat },
    { layer: 'hat', stem: equipped.hat },
    { layer: 'horns', stem: hornsOverHat },
    { layer: 'held', stem: equipped.held },
    // fingers painted over the held prop so its handle looks gripped by the fist —
    // skip for props that extend past the fingers (they'd be wrongly overlapped)
    {
      layer: 'fingers',
      stem: equipped.held && !NO_FINGERS.has(equipped.held) ? `fingers${bodySuffix}` : undefined,
      place: 'fingers',
    },
  ]

  return (
    <div
      className={className}
      role="img"
      aria-label="Your monster"
      style={{ position: 'relative', width: size, height: size * (CANVAS_H / CANVAS_W) }}
    >
      {stems.map(({ layer: l, stem, place }) => {
        if (!stem || !L(l)) return null
        const url = asset(stem)
        const placeKey = place ?? stem
        if (!url || !PLACE[placeKey]) return null
        return <img key={stem} src={url} alt="" draggable={false} style={layerStyle(placeKey)} />
      })}
    </div>
  )
}
