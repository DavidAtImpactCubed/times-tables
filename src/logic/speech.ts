/**
 * Read-aloud using the browser's built-in Web Speech API (no dependencies).
 * A no-op when speech synthesis is unavailable or read-aloud is switched off,
 * so callers can speak() freely without guarding.
 */
import { narrationKey } from './narrationKey'

const synth: SpeechSynthesis | undefined =
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : undefined

// Pre-generated character voice clips (story / tip / finale lines), keyed by
// narrationKey(speaker, text). Missing clips fall back to the browser voice.
const clipFiles = import.meta.glob('../assets/narration/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>
const clipUrl = (key: string): string | undefined => {
  for (const [path, url] of Object.entries(clipFiles)) if (path.endsWith(`/${key}.mp3`)) return url
  return undefined
}
let audio: HTMLAudioElement | null = null

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
  if (!on) stopSpeaking()
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

/**
 * Voice a character's line: play its pre-generated clip if we have one,
 * otherwise fall back to the browser voice reading the text.
 */
export function narrate(speaker: string, text: string): void {
  if (!enabled) return
  const url = clipUrl(narrationKey(speaker, text))
  if (!url) {
    speak(text)
    return
  }
  synth?.cancel()
  if (audio) audio.pause()
  audio = new Audio(url)
  audio.play().catch(() => {
    /* autoplay/gesture restrictions — silent */
  })
}

export function stopSpeaking(): void {
  synth?.cancel()
  if (audio) {
    audio.pause()
    audio = null
  }
}
