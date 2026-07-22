/**
 * Read-aloud using the browser's built-in Web Speech API (no dependencies).
 * A no-op when speech synthesis is unavailable or read-aloud is switched off,
 * so callers can speak() freely without guarding.
 */
const synth: SpeechSynthesis | undefined =
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : undefined

let enabled = false
let preferred: SpeechSynthesisVoice | null = null

function chooseVoice(): void {
  if (!synth) return
  const voices = synth.getVoices()
  if (!voices.length) return
  // Prefer a UK English voice, then any English, then whatever exists.
  preferred =
    voices.find((v) => /en[-_]GB/i.test(v.lang)) ??
    voices.find((v) => /^en/i.test(v.lang)) ??
    voices[0] ??
    null
}

if (synth) {
  chooseVoice()
  // Voices frequently load asynchronously after first paint.
  try {
    synth.addEventListener('voiceschanged', chooseVoice)
  } catch {
    // older browsers: onvoiceschanged only
    synth.onvoiceschanged = chooseVoice
  }
}

export const readAloudSupported = (): boolean => !!synth

export function setReadAloud(on: boolean): void {
  enabled = on
  if (!on) synth?.cancel()
}

/** Speak some text, cancelling anything currently being read. */
export function speak(text: string): void {
  if (!enabled || !synth) return
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  if (preferred) u.voice = preferred
  u.rate = 0.95 // a touch slower for young ears
  u.pitch = 1.1
  synth.speak(u)
}

export function stopSpeaking(): void {
  synth?.cancel()
}
