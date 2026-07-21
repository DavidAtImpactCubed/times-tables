import { useId } from 'react'
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
  /** render only this layer (all layers when omitted) — everything stays at its canvas position */
  layer?: MonsterLayer
}

const BODY_COLORS: Record<string, { main: string; dark: string }> = {
  purple: { main: '#a78bfa', dark: '#7c3aed' },
  teal: { main: '#2dd4bf', dark: '#0d9488' },
  pink: { main: '#f472b6', dark: '#db2777' },
  orange: { main: '#fb923c', dark: '#ea580c' },
  green: { main: '#4ade80', dark: '#16a34a' },
  blue: { main: '#60a5fa', dark: '#2563eb' },
}

function starPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45
    const ang = (Math.PI / 5) * i - Math.PI / 2
    pts.push(`${(cx + rad * Math.cos(ang)).toFixed(1)},${(cy + rad * Math.sin(ang)).toFixed(1)}`)
  }
  return pts.join(' ')
}

export function Monster({ equipped, mood = 'idle', size = 160, className, layer }: Props) {
  const uid = useId()
  const variant = (slot: PartSlot) => itemById(equipped[slot])?.variant
  const L = (l: MonsterLayer) => layer === undefined || layer === l

  const bodyVariant = variant('body') ?? 'purple'
  const rainbow = bodyVariant === 'rainbow'
  const colors = BODY_COLORS[bodyVariant] ?? BODY_COLORS.purple
  const bodyFill = rainbow ? `url(#${uid}-rainbow)` : colors.main
  const darkFill = rainbow ? '#7c3aed' : colors.dark

  const eyes = variant('eyes') ?? 'two'
  const horns = variant('horns')
  const hat = variant('hat')
  const face = variant('face')
  const held = variant('held')
  const back = variant('back')

  return (
    <svg viewBox="0 0 220 250" width={size} height={size * (250 / 220)} className={className} aria-label="Your monster">
      <defs>
        <linearGradient id={`${uid}-rainbow`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="25%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#4ade80" />
          <stop offset="75%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>

      {/* back layer */}
      {L('back') && back === 'wings' && (
        <g fill="#a5f3fc" stroke="#22d3ee" strokeWidth="3" opacity="0.9">
          <ellipse cx="30" cy="115" rx="26" ry="44" transform="rotate(20 30 115)" />
          <ellipse cx="190" cy="115" rx="26" ry="44" transform="rotate(-20 190 115)" />
        </g>
      )}
      {L('back') && back === 'cape' && (
        <path d="M45 100 Q30 190 40 232 L180 232 Q190 190 175 100 Q110 80 45 100Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="3" />
      )}

      {/* horns behind the head outline */}
      {L('horns') && horns === 'little' && (
        <g fill="#fbbf24" stroke="#d97706" strokeWidth="3">
          <path d="M62 72 L52 38 L82 60Z" />
          <path d="M158 72 L168 38 L138 60Z" />
        </g>
      )}
      {L('horns') && horns === 'curly' && (
        <g fill="none" stroke="#d97706" strokeWidth="8" strokeLinecap="round">
          <path d="M66 68 Q40 50 46 28 Q50 14 62 20" />
          <path d="M154 68 Q180 50 174 28 Q170 14 158 20" />
        </g>
      )}
      {L('horns') && horns === 'antennae' && (
        <g>
          <path d="M85 66 Q80 40 70 30" fill="none" stroke={darkFill} strokeWidth="5" strokeLinecap="round" />
          <path d="M135 66 Q140 40 150 30" fill="none" stroke={darkFill} strokeWidth="5" strokeLinecap="round" />
          <circle cx="70" cy="28" r="8" fill="#fde047" stroke="#eab308" strokeWidth="2" />
          <circle cx="150" cy="28" r="8" fill="#fde047" stroke="#eab308" strokeWidth="2" />
        </g>
      )}
      {L('horns') && horns === 'unicorn' && (
        <path d="M110 8 L98 62 L122 62Z" fill="#fde047" stroke="#eab308" strokeWidth="3" />
      )}

      {/* arms */}
      {L('base') && (
        <g>
          <circle cx="32" cy="152" r="15" fill={bodyFill} stroke={darkFill} strokeWidth="3" />
          <circle cx="188" cy="152" r="15" fill={bodyFill} stroke={darkFill} strokeWidth="3" />
        </g>
      )}

      {/* feet */}
      {L('base') && (
        <g>
          <ellipse cx="75" cy="234" rx="24" ry="13" fill={darkFill} />
          <ellipse cx="145" cy="234" rx="24" ry="13" fill={darkFill} />
        </g>
      )}

      {/* body */}
      {L('base') && (
        <g>
          <ellipse cx="110" cy="145" rx="74" ry="82" fill={bodyFill} stroke={darkFill} strokeWidth="4" />
          <ellipse cx="110" cy="178" rx="46" ry="38" fill="#ffffff" opacity="0.28" />
        </g>
      )}

      {/* eyes */}
      {L('eyes') && eyes === 'two' && (
        <g>
          <circle cx="85" cy="108" r="17" fill="#fff" stroke={darkFill} strokeWidth="2.5" />
          <circle cx="135" cy="108" r="17" fill="#fff" stroke={darkFill} strokeWidth="2.5" />
          <circle cx="88" cy="110" r="7.5" fill="#1f2937" />
          <circle cx="132" cy="110" r="7.5" fill="#1f2937" />
          <circle cx="90.5" cy="107.5" r="2.5" fill="#fff" />
          <circle cx="134.5" cy="107.5" r="2.5" fill="#fff" />
        </g>
      )}
      {L('eyes') && eyes === 'one' && (
        <g>
          <circle cx="110" cy="105" r="26" fill="#fff" stroke={darkFill} strokeWidth="3" />
          <circle cx="110" cy="108" r="11" fill="#1f2937" />
          <circle cx="114" cy="104" r="3.5" fill="#fff" />
        </g>
      )}
      {L('eyes') && eyes === 'three' && (
        <g>
          {[
            [76, 112, 12],
            [110, 98, 13],
            [144, 112, 12],
          ].map(([x, y, r]) => (
            <g key={x}>
              <circle cx={x} cy={y} r={r} fill="#fff" stroke={darkFill} strokeWidth="2.5" />
              <circle cx={x} cy={y + 2} r={r * 0.45} fill="#1f2937" />
            </g>
          ))}
        </g>
      )}
      {L('eyes') && eyes === 'sleepy' && (
        <g fill="none" stroke="#1f2937" strokeWidth="5" strokeLinecap="round">
          <path d="M70 108 Q85 120 100 108" />
          <path d="M120 108 Q135 120 150 108" />
        </g>
      )}
      {L('eyes') && eyes === 'stars' && (
        <g>
          <polygon points={starPoints(85, 108, 16)} fill="#fde047" stroke="#eab308" strokeWidth="2" />
          <polygon points={starPoints(135, 108, 16)} fill="#fde047" stroke="#eab308" strokeWidth="2" />
        </g>
      )}

      {/* mouth by mood */}
      {L('mouth') && mood === 'idle' && (
        <path d="M88 155 Q110 170 132 155" fill="none" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" />
      )}
      {L('mouth') && (mood === 'happy' || mood === 'excited') && (
        <g>
          <path d="M82 150 Q110 190 138 150 Q110 162 82 150Z" fill="#7f1d1d" stroke="#1f2937" strokeWidth="3" />
          <path d="M96 168 Q110 178 124 168 Q110 184 96 168Z" fill="#f87171" />
        </g>
      )}
      {L('mouth') && mood === 'sad' && (
        <path d="M88 168 Q110 152 132 168" fill="none" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" />
      )}

      {/* cheeks */}
      {L('base') && (
        <g>
          <ellipse cx="66" cy="138" rx="9" ry="6" fill="#f9a8d4" opacity="0.7" />
          <ellipse cx="154" cy="138" rx="9" ry="6" fill="#f9a8d4" opacity="0.7" />
        </g>
      )}

      {/* glasses */}
      {L('face') && face === 'round' && (
        <g fill="none" stroke="#1f2937" strokeWidth="4">
          <circle cx="85" cy="108" r="20" />
          <circle cx="135" cy="108" r="20" />
          <path d="M105 108 L115 108" />
        </g>
      )}
      {L('face') && face === 'sun' && (
        <g>
          <rect x="66" y="94" width="38" height="26" rx="12" fill="#1f2937" />
          <rect x="116" y="94" width="38" height="26" rx="12" fill="#1f2937" />
          <path d="M104 104 L116 104" stroke="#1f2937" strokeWidth="4" />
        </g>
      )}
      {L('face') && face === 'star' && (
        <g>
          <polygon points={starPoints(85, 108, 22)} fill="#fbbf2455" stroke="#d97706" strokeWidth="3" />
          <polygon points={starPoints(135, 108, 22)} fill="#fbbf2455" stroke="#d97706" strokeWidth="3" />
        </g>
      )}

      {/* hat */}
      {L('hat') && hat === 'party' && (
        <g>
          <path d="M110 10 L84 62 L136 62Z" fill="#f472b6" stroke="#db2777" strokeWidth="3" />
          <circle cx="110" cy="10" r="7" fill="#fde047" stroke="#eab308" strokeWidth="2" />
        </g>
      )}
      {L('hat') && hat === 'crown' && (
        <path d="M78 62 L74 26 L92 44 L110 18 L128 44 L146 26 L142 62Z" fill="#fde047" stroke="#d97706" strokeWidth="3" />
      )}
      {L('hat') && hat === 'wizard' && (
        <g>
          <path d="M110 2 L86 58 L134 58Z" fill="#6d28d9" stroke="#4c1d95" strokeWidth="3" />
          <ellipse cx="110" cy="59" rx="34" ry="8" fill="#6d28d9" stroke="#4c1d95" strokeWidth="3" />
          <polygon points={starPoints(110, 36, 7)} fill="#fde047" />
        </g>
      )}
      {L('hat') && hat === 'bow' && (
        <g fill="#f472b6" stroke="#db2777" strokeWidth="3">
          <path d="M92 48 Q70 30 66 52 Q64 68 92 60Z" />
          <path d="M92 48 Q114 30 118 52 Q120 68 92 60Z" />
          <circle cx="92" cy="54" r="7" />
        </g>
      )}
      {L('hat') && hat === 'flower' && (
        <g>
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse key={deg} cx="145" cy="42" rx="7" ry="12" fill="#f9a8d4" stroke="#ec4899" strokeWidth="2" transform={`rotate(${deg} 145 52)`} />
          ))}
          <circle cx="145" cy="52" r="7" fill="#fde047" stroke="#eab308" strokeWidth="2" />
        </g>
      )}

      {/* held item, by the right hand */}
      {L('held') && held === 'wand' && (
        <g>
          <path d="M188 148 L212 96" stroke="#92400e" strokeWidth="6" strokeLinecap="round" />
          <polygon points={starPoints(213, 90, 12)} fill="#fde047" stroke="#eab308" strokeWidth="2" />
        </g>
      )}
      {L('held') && held === 'balloon' && (
        <g>
          <path d="M190 145 Q200 110 202 84" fill="none" stroke="#6b7280" strokeWidth="2.5" />
          <ellipse cx="202" cy="62" rx="16" ry="21" fill="#f87171" stroke="#dc2626" strokeWidth="3" />
        </g>
      )}
      {L('held') && held === 'icecream' && (
        <g>
          <path d="M188 150 L200 112 L212 150Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2.5" transform="rotate(180 200 131)" />
          <circle cx="200" cy="104" r="13" fill="#f9a8d4" stroke="#ec4899" strokeWidth="2.5" />
          <circle cx="200" cy="92" r="10" fill="#fef9c3" stroke="#eab308" strokeWidth="2.5" />
        </g>
      )}
      {L('held') && held === 'flag' && (
        <g>
          <path d="M192 150 L192 80" stroke="#92400e" strokeWidth="5" strokeLinecap="round" />
          <path d="M192 80 L220 92 L192 104Z" fill="#60a5fa" stroke="#2563eb" strokeWidth="2.5" />
          <polygon points={starPoints(202, 92, 6)} fill="#fff" />
        </g>
      )}
    </svg>
  )
}
