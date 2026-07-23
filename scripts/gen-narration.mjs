// Generate character-voice narration clips with ElevenLabs.
//
//   ELEVENLABS_API_KEY=sk_... node scripts/gen-narration.mjs [speaker ...]
//
// Speakers: goblin, guide (Olivia), monster (You). With no speaker arguments it
// generates every speaker that has a voice assigned in VOICES below. Clips that
// already exist are skipped, so it is safe to re-run and cheap on quota. Output
// goes to src/assets/narration/<narrationKey>.mp3 and is played back at runtime
// by src/logic/speech.ts (missing clips fall back to the browser voice).
//
// The API key is read from the environment only — it is never written to disk.

import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { REGIONS, EARLY_REGIONS, FINALE, EARLY_FINALE } from '../src/data/regions.ts'
import { narrationKey } from '../src/logic/narrationKey.ts'

// --- voice assignment (ElevenLabs voice IDs) ------------------------------
// Fill in guide/monster once their voices are chosen, then re-run.
const VOICES = {
  goblin: 'Z7RrOqZFTyLpIlzCgfsp', // Toby – Little Mythical Monster
  guide: null, // Olivia the Owl — TODO: paste voice id
  monster: null, // You (the little monster) — TODO: paste voice id
}

// Match the settings used for the hand-made sample (pvc s50 sb75 se29 speaker-boost, speed .87).
const VOICE_SETTINGS = { stability: 0.5, similarity_boost: 0.75, style: 0.29, use_speaker_boost: true, speed: 0.87 }
const MODEL_ID = 'eleven_multilingual_v2'

const OUT_DIR = fileURLToPath(new URL('../src/assets/narration/', import.meta.url))
const API = (voiceId) => `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`

// --- collect every narrated line ------------------------------------------
const lines = []
const seen = new Set()
const add = (speaker, text) => {
  const key = narrationKey(speaker, text)
  if (seen.has(key)) return
  seen.add(key)
  lines.push({ speaker, text, key })
}
for (const band of [REGIONS, EARLY_REGIONS]) {
  for (const r of band) for (const lv of r.levels) for (const l of lv.story) add(l.speaker, l.text)
}
for (const l of [...FINALE, ...EARLY_FINALE]) add(l.speaker, l.text)
add('guide', 'Would you like to learn a clever trick?') // tip offer line
// Olivia reads every clever-trick card text
for (const band of [REGIONS, EARLY_REGIONS]) for (const r of band) for (const t of r.tip ?? []) add('guide', t.text)

// --- run -------------------------------------------------------------------
const key = process.env.ELEVENLABS_API_KEY
if (!key) {
  console.error('Set ELEVENLABS_API_KEY in the environment first.')
  process.exit(1)
}
const filter = process.argv.slice(2)
const wanted = (sp) => (filter.length ? filter.includes(sp) : true) && VOICES[sp]

mkdirSync(OUT_DIR, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let made = 0
let skipped = 0
let chars = 0
for (const { speaker, text, key: k } of lines) {
  if (!wanted(speaker)) continue
  const path = `${OUT_DIR}${k}.mp3`
  if (existsSync(path)) {
    skipped++
    continue
  }
  const res = await fetch(API(VOICES[speaker]), {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: MODEL_ID, voice_settings: VOICE_SETTINGS }),
  })
  if (!res.ok) {
    console.error(`✗ ${speaker}: "${text}"\n  ${res.status} ${await res.text()}`)
    process.exit(1)
  }
  writeFileSync(path, Buffer.from(await res.arrayBuffer()))
  made++
  chars += text.length
  console.log(`✓ [${speaker}] ${k}  "${text}"`)
  await sleep(400) // be gentle on rate limits
}

console.log(`\nGenerated ${made} clip(s) (${chars} chars), skipped ${skipped} existing.`)
if (filter.length) {
  const others = lines.filter((l) => !filter.includes(l.speaker) && VOICES[l.speaker]).length
  if (others) console.log(`${others} more line(s) available for other speakers — re-run without a filter.`)
}
const noVoice = [...new Set(lines.filter((l) => !VOICES[l.speaker]).map((l) => l.speaker))]
if (noVoice.length) console.log(`No voice set for: ${noVoice.join(', ')} — add ids to VOICES and re-run.`)
