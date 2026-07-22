/**
 * Stable filename key for a narrated line, shared by the build-time generator
 * (scripts/gen-narration.mjs) and the runtime player (logic/speech.ts) so a
 * clip generated for a line is found again when that line is spoken.
 *
 * Deterministic, synchronous, dependency-free (cyrb53). The key is derived from
 * the speaker and the exact line text, so rewording a line simply means it no
 * longer matches its old clip (and falls back to the browser voice until
 * regenerated).
 */
export function narrationKey(speaker: string, text: string): string {
  const str = `${speaker}|${text}`
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  const n = 4294967296 * (2097151 & h2) + (h1 >>> 0)
  return `n${n.toString(36)}`
}
