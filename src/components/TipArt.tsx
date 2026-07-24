import { useEffect, useState } from 'react'
import type { TipVisual } from '../types'
import hand1 from '../assets/hands/hand-1.svg'
import hand2 from '../assets/hands/hand-2.svg'
import hand3 from '../assets/hands/hand-3.svg'
import hand4 from '../assets/hands/hand-4.svg'
import hand5 from '../assets/hands/hand-5.svg'

// index by number of raised fingers (1–5); 0 renders an empty slot
const HAND_SRC = [null, hand1, hand2, hand3, hand4, hand5]

/** One hand showing `fingers` (0–5) raised; optionally mirrored for the other hand. */
function Hand({ fingers, mirror }: { fingers: number; mirror?: boolean }) {
  const src = HAND_SRC[Math.max(0, Math.min(5, fingers))]
  return (
    <span className={`tip-hand ${mirror ? 'mirror' : ''}`} aria-hidden>
      {src && <img src={src} alt="" draggable={false} />}
    </span>
  )
}

/** Show `value` (0–10) across up to two hands: the first fills, then the second. */
function Hands({ value, max }: { value: number; max: number }) {
  const left = Math.min(value, 5)
  const right = Math.max(0, value - 5)
  return (
    <div className="tip-hands" aria-hidden>
      <Hand fingers={left} />
      {max > 5 && <Hand fingers={right} mirror />}
    </div>
  )
}

const prefersReduced = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * A looping frame counter: 0, 1, … total-1, back to 0.
 * When the user prefers reduced motion it holds on the final frame instead.
 */
function useFrameLoop(total: number, ms: number): number {
  const reduced = prefersReduced()
  const [frame, setFrame] = useState(reduced ? total - 1 : 0)
  useEffect(() => {
    if (reduced) return
    setFrame(0)
    const id = window.setInterval(() => setFrame((f) => (f + 1) % total), ms)
    return () => window.clearInterval(id)
  }, [total, ms, reduced])
  return frame
}

/** Count objects one at a time, calling out the running number, then the total. */
function CountArt({ to, hands }: { to: number; hands?: boolean }) {
  // frames: 1…to light that many, then two "hold" frames show the total
  const total = to + 3
  const frame = useFrameLoop(total, 640)
  const lit = Math.min(frame, to)
  const showTotal = frame >= to + 1
  return (
    <div className="tip-art tip-count" data-testid="tip-art-count">
      <div className="tip-count-row">
        {Array.from({ length: to }, (_, i) => {
          const on = i < lit
          const current = i === lit - 1 && !showTotal
          return (
            <span key={i} className={`tip-count-star ${on ? 'on' : ''} ${current ? 'current' : ''}`}>
              <span aria-hidden>⭐</span>
              {current && <span className="tip-count-num">{lit}</span>}
            </span>
          )
        })}
      </div>
      {hands && <Hands value={showTotal ? to : lit} max={to} />}
      <div className={`tip-count-total ${showTotal ? 'show' : ''}`} aria-hidden>
        = {to}
      </div>
    </div>
  )
}

/** Fill a ten-frame: a gold stars, then b outlined stars, up to a+b. */
function TenFrameArt({ a, b }: { a: number; b: number }) {
  const sum = a + b
  const total = sum + 3
  const frame = useFrameLoop(total, 520)
  const filled = Math.min(frame, sum)
  return (
    <div className="tip-art tip-tenframe" data-testid="tip-art-tenframe">
      <div className="tenframe-grid">
        {Array.from({ length: 10 }, (_, i) => {
          const on = i < filled
          const cls = on ? (i < a ? 'fill-a' : 'fill-b') : ''
          return (
            <span key={i} className={`tenframe-cell ${cls}`} aria-hidden>
              {on ? '★' : ''}
            </span>
          )
        })}
      </div>
      <div className="tip-tenframe-eq" aria-hidden>
        {a} + {b} = {sum}
      </div>
    </div>
  )
}

/**
 * A marker hops along a number line, `count` steps in direction `dir`
 * (+1 counting on, −1 taking away), from `from`. Ticks run min…max.
 */
function NumberLineArt({
  from,
  count,
  dir,
  min,
  max,
  hands,
  testid,
}: {
  from: number
  count: number
  dir: 1 | -1
  min: number
  max: number
  hands?: boolean
  testid: string
}) {
  const total = count + 3
  const frame = useFrameLoop(total, 720)
  const hops = Math.min(frame, count)
  const pos = from + dir * hops
  const step = 30
  const padX = 20
  const y = 54
  const x = (n: number) => padX + (n - min) * step
  const width = padX * 2 + (max - min) * step
  const arcs = Array.from({ length: hops }, (_, i) => {
    const a = from + dir * i
    const bx = from + dir * (i + 1)
    const midX = (x(a) + x(bx)) / 2
    return `M ${x(a)} ${y} Q ${midX} ${y - 26} ${x(bx)} ${y}`
  })
  const ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  return (
    <div className="tip-art tip-numberline" data-testid={testid}>
      <svg viewBox={`0 0 ${width} 78`} width="100%" role="img" aria-label={`Number line from ${from}`}>
        <line x1={x(min)} y1={y} x2={x(max)} y2={y} className="nl-axis" />
        {ticks.map((n) => (
          <g key={n}>
            <line x1={x(n)} y1={y - 5} x2={x(n)} y2={y + 5} className="nl-tick" />
            <text
              x={x(n)}
              y={y + 20}
              className={`nl-label ${n === from ? 'start' : ''} ${n === pos && hops > 0 ? 'here' : ''}`}
              textAnchor="middle"
            >
              {n}
            </text>
          </g>
        ))}
        {arcs.map((d, i) => (
          <path key={i} d={d} className="nl-hop" fill="none" />
        ))}
        <g className="nl-marker" transform={`translate(${x(pos)}, ${y - 30})`}>
          <circle r="13" />
          <text textAnchor="middle" dy="5">
            {pos}
          </text>
        </g>
      </svg>
      {hands && <Hands value={hops} max={count} />}
    </div>
  )
}

/** Two mirrored groups of n stars combine into the total (doubling). */
function DoubleArt({ n }: { n: number }) {
  const frame = useFrameLoop(4, 680)
  const showRight = frame >= 1
  const showTotal = frame >= 2
  const group = (
    <span className="dbl-group" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="dbl-star">
          ⭐
        </span>
      ))}
    </span>
  )
  return (
    <div className="tip-art tip-double" data-testid="tip-art-double">
      <div className="dbl-row">
        {group}
        <span className="dbl-mirror" aria-hidden />
        <span className={`dbl-second ${showRight ? 'show' : ''}`}>{group}</span>
      </div>
      <div className={`dbl-eq ${showTotal ? 'show' : ''}`} aria-hidden>
        {n} + {n} = {n * 2}
      </div>
    </div>
  )
}

export function TipArt({ visual }: { visual: TipVisual }) {
  switch (visual.kind) {
    case 'count':
      return <CountArt to={visual.to} hands={visual.hands} />
    case 'tenframe':
      return <TenFrameArt a={visual.a} b={visual.b} />
    case 'countOn':
      return (
        <NumberLineArt from={visual.from} count={visual.add} dir={1} min={visual.min ?? 0} max={visual.max} hands={visual.hands} testid="tip-art-counton" />
      )
    case 'countBack':
      return (
        <NumberLineArt from={visual.from} count={visual.sub} dir={-1} min={visual.min ?? 0} max={visual.max} hands={visual.hands} testid="tip-art-countback" />
      )
    case 'double':
      return <DoubleArt n={visual.n} />
  }
}
