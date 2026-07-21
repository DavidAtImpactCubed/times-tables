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
