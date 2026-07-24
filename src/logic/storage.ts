import { RETIRED_ITEM_PRICES, itemById } from '../data/wardrobe'
import type { SaveData } from '../types'

const SAVE_PREFIX = 'monster-maths-save-v1'
const PROFILES_KEY = 'monster-maths-profiles-v1'
const NARRATION_DEFAULT_KEY = 'monster-maths-narration-default-v1'
const saveKey = (name: string) => `${SAVE_PREFIX}::${name}`

export function freshSave(): SaveData {
  return {
    version: 1,
    curriculum: 'main',
    stars: {},
    wallet: 0,
    owned: [],
    equipped: {},
    seenStory: [],
    seenTips: [],
    seenFinale: false,
    muted: false,
    readAloud: true,
  }
}

/** Refund and drop wardrobe items that no longer exist in the catalogue. */
function migrate(save: SaveData): SaveData {
  const owned: string[] = []
  let refund = 0
  for (const id of save.owned) {
    if (itemById(id)) owned.push(id)
    else refund += RETIRED_ITEM_PRICES[id] ?? 0
  }
  const equipped = { ...save.equipped }
  for (const slot of Object.keys(equipped) as (keyof typeof equipped)[]) {
    const id = equipped[slot]
    if (!id || !owned.includes(id)) delete equipped[slot]
  }
  return { ...save, owned, equipped, wallet: save.wallet + refund }
}

function readProfiles(): string[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    const arr = raw ? JSON.parse(raw) : null
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function writeProfiles(names: string[]): void {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(names))
  } catch {
    // storage blocked — profiles just won't persist
  }
}

/** List the saved player profiles. */
export function listProfiles(): string[] {
  // One-time: turn read-aloud on for pre-existing profiles (it's now the default).
  try {
    if (localStorage.getItem(NARRATION_DEFAULT_KEY) === null) {
      for (const name of readProfiles()) {
        const s = loadSave(name)
        if (!s.readAloud) persistSave(name, { ...s, readAloud: true })
      }
      localStorage.setItem(NARRATION_DEFAULT_KEY, '1')
    }
  } catch {
    // ignore
  }
  return readProfiles()
}

export function addProfile(name: string): void {
  const names = readProfiles()
  if (!names.includes(name)) {
    names.push(name)
    writeProfiles(names)
  }
}

export function removeProfile(name: string): void {
  writeProfiles(readProfiles().filter((n) => n !== name))
  try {
    localStorage.removeItem(saveKey(name))
  } catch {
    // ignore
  }
}

export function loadSave(name: string): SaveData {
  try {
    const raw = localStorage.getItem(saveKey(name))
    if (!raw) return freshSave()
    const data = JSON.parse(raw)
    if (!data || data.version !== 1 || typeof data.stars !== 'object') return freshSave()
    return migrate({ ...freshSave(), ...data })
  } catch {
    return freshSave()
  }
}

export function persistSave(name: string, save: SaveData): void {
  try {
    localStorage.setItem(saveKey(name), JSON.stringify(save))
  } catch {
    // Storage full/blocked — the game still plays, it just won't remember.
  }
}

// ---- transfer a player to another device via a link ----------------------

const b64urlEncode = (s: string): string =>
  btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const b64urlDecode = (s: string): string =>
  decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))))

/** Build a shareable URL that recreates this player's save on another device. */
export function makeTransferLink(name: string): string {
  const payload = JSON.stringify({ v: 1, n: name, s: loadSave(name) })
  const url = `${location.origin}${location.pathname}?p=${b64urlEncode(payload)}`
  return url
}

/** Parse a transfer payload from the `?p=` query param, or null if absent/invalid. */
export function readTransferParam(): { name: string; save: SaveData } | null {
  try {
    const p = new URLSearchParams(location.search).get('p')
    if (!p) return null
    const data = JSON.parse(b64urlDecode(p))
    if (!data || typeof data.n !== 'string' || !data.s || typeof data.s.stars !== 'object') return null
    return { name: data.n.slice(0, 12), save: migrate({ ...freshSave(), ...data.s }) }
  } catch {
    return null
  }
}

/** Save an imported player's data under `name` (adding the profile if new). */
export function importPlayer(name: string, save: SaveData): void {
  addProfile(name)
  persistSave(name, save)
}

/** Remove the `?p=` param from the address bar without a reload. */
export function clearTransferParam(): void {
  try {
    history.replaceState(null, '', location.pathname)
  } catch {
    // ignore
  }
}
