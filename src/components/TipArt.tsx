import { useEffect, useState } from 'react'
import type { TipVisual } from '../types'

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
function CountArt({ to }: { to: number }) {
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

/** A marker hops forward along a number line, counting on from `from`. */
function CountOnArt({ from, add, max }: { from: number; add: number; max: number }) {
  const total = add + 3
  const frame = useFrameLoop(total, 720)
  const hops = Math.min(frame, add)
  const pos = from + hops
  // layout in an SVG unit grid
  const step = 30
  const padX = 20
  const y = 54
  const x = (n: number) => padX + n * step
  const width = padX * 2 + max * step
  const arcs = Array.from({ length: hops }, (_, i) => {
    const n = from + i
    const x0 = x(n)
    const x1 = x(n + 1)
    const midX = (x0 + x1) / 2
    return `M ${x0} ${y} Q ${midX} ${y - 26} ${x1} ${y}`
  })
  return (
    <div className="tip-art tip-numberline" data-testid="tip-art-counton">
      <svg viewBox={`0 0 ${width} 78`} width="100%" role="img" aria-label={`Counting on from ${from}`}>
        <line x1={x(0)} y1={y} x2={x(max)} y2={y} className="nl-axis" />
        {Array.from({ length: max + 1 }, (_, n) => (
          <g key={n}>
            <line x1={x(n)} y1={y - 5} x2={x(n)} y2={y + 5} className="nl-tick" />
            <text x={x(n)} y={y + 20} className={`nl-label ${n === from ? 'start' : ''} ${n === pos && hops > 0 ? 'here' : ''}`} textAnchor="middle">
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
    </div>
  )
}

export function TipArt({ visual }: { visual: TipVisual }) {
  switch (visual.kind) {
    case 'count':
      return <CountArt to={visual.to} />
    case 'tenframe':
      return <TenFrameArt a={visual.a} b={visual.b} />
    case 'countOn':
      return <CountOnArt from={visual.from} add={visual.add} max={visual.max} />
  }
}
