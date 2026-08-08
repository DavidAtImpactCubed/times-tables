/** Cheerful little synth sounds via the Web Audio API — no audio files needed. */

let ctx: AudioContext | null = null
let muted = false

export const setMuted = (m: boolean) => {
  muted = m
}
export const isMuted = () => muted

function context(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', gain = 0.12) {
  const ac = context()
  if (!ac || muted) return
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t0 = ac.currentTime + start
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(gain, t0 + 0.02)
  g.gain.exponentialRampToValueAtTime(0.001, t0 + duration)
  osc.connect(g).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

// ---------------------------------------------------------------------------
// "The Wardrobe Waltz" — an original little music-box piece in 3/4, composed
// in code like every other sound in the game (so it's royalty-free by
// construction). A bass note on beat one, two chime arpeggio notes after it,
// and a lilting melody over a C–Am–F–G loop.
// ---------------------------------------------------------------------------

const BEAT = 0.7 // seconds — a gentle ~86 BPM waltz

/** A music-box "pluck": a sine with a quiet octave partial and a long decay. */
function pluck(midi: number, at: number, dur = 1.4, gain = 0.05) {
  const ac = context()
  if (!ac || muted) return
  const freq = 440 * Math.pow(2, (midi - 69) / 12)
  for (const [mult, g] of [
    [1, gain],
    [2, gain * 0.25],
  ] as const) {
    const osc = ac.createOscillator()
    const gn = ac.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq * mult
    gn.gain.setValueAtTime(0, at)
    gn.gain.linearRampToValueAtTime(g, at + 0.012)
    gn.gain.exponentialRampToValueAtTime(0.0005, at + dur)
    osc.connect(gn).connect(ac.destination)
    osc.start(at)
    osc.stop(at + dur + 0.05)
  }
}

// Eight bars: bass root, two arpeggio chimes, melody notes as [beat, note].
const WALTZ: Array<{ bass: number; arp: [number, number]; mel: Array<[number, number]> }> = [
  { bass: 48, arp: [64, 67], mel: [[0, 76], [2, 79]] }, // C
  { bass: 48, arp: [64, 67], mel: [[0, 72]] },
  { bass: 45, arp: [60, 64], mel: [[0, 69], [2, 72]] }, // Am
  { bass: 45, arp: [60, 64], mel: [[0, 76]] },
  { bass: 41, arp: [57, 60], mel: [[0, 77], [2, 81]] }, // F
  { bass: 41, arp: [57, 60], mel: [[0, 72]] },
  { bass: 43, arp: [59, 62], mel: [[0, 71], [2, 74]] }, // G
  { bass: 43, arp: [59, 62], mel: [[0, 79]] },
]

function scheduleBar(bar: number, t0: number) {
  const { bass, arp, mel } = WALTZ[bar]
  pluck(bass, t0, 1.8, 0.04)
  pluck(arp[0], t0 + BEAT, 1.1, 0.03)
  pluck(arp[1], t0 + 2 * BEAT, 1.1, 0.03)
  for (const [beat, note] of mel) pluck(note, t0 + beat * BEAT, 1.6, 0.055)
}

let musicTimer: number | null = null

/** Start the wardrobe's looping waltz (no-op if already playing). */
export function startMusic() {
  const ac = context()
  if (!ac || musicTimer !== null) return
  let bar = 0
  let nextBar = ac.currentTime + 0.15
  const tick = () => {
    // schedule just ahead of playback, so stop/mute take effect quickly
    while (nextBar < ac.currentTime + 1.2) {
      if (!muted) scheduleBar(bar % WALTZ.length, nextBar)
      bar++
      nextBar += 3 * BEAT
    }
  }
  tick()
  musicTimer = window.setInterval(tick, 300)
}

export function stopMusic() {
  if (musicTimer !== null) {
    clearInterval(musicTimer)
    musicTimer = null
  }
}

export const sfx = {
  click: () => tone(600, 0, 0.08, 'triangle', 0.06),
  correct: () => {
    tone(523.25, 0, 0.15, 'triangle')
    tone(659.25, 0.08, 0.15, 'triangle')
    tone(783.99, 0.16, 0.25, 'triangle')
  },
  // Deliberately soft and friendly — never a harsh buzzer.
  wrong: () => {
    tone(330, 0, 0.2, 'sine', 0.08)
    tone(294, 0.15, 0.3, 'sine', 0.08)
  },
  star: () => {
    tone(880, 0, 0.12, 'triangle', 0.1)
    tone(1174.66, 0.09, 0.2, 'triangle', 0.1)
  },
  fanfare: () => {
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle'))
    tone(1318.51, 0.5, 0.5, 'triangle', 0.14)
  },
  buy: () => {
    tone(660, 0, 0.1, 'square', 0.05)
    tone(880, 0.09, 0.18, 'square', 0.05)
  },
}
