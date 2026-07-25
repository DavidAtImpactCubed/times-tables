import { MATCH_AT, regionsFor } from '../data/regions'
import { RETIRED_ITEM_PRICES, itemById } from '../data/wardrobe'
import { starValue } from './progress'
import { levelId, type SaveData } from '../types'

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
    economy: 4,
    layout: 2,
  }
}

/**
 * One-time star-key remap after "Match the arrays" was inserted mid-region:
 * older saves recorded stars by the ORIGINAL level order (choice, type,
 * missing, mixed, then match at the end), so read stored indices as that
 * canonical order and move each entry to the level's current position. The
 * inserted match level ends up unplayed, and the last level of each stage
 * keeps the stars it really earned. Story-seen markers move the same way.
 */
function upgradeLayout(save: SaveData, rawLayout: unknown): SaveData {
  if (rawLayout === 2) return save
  // Regions the player had already earned under the OLD four-level rule stay
  // unlocked for good — the new match level is extra content, not a new gate.
  const regions = regionsFor(save.curriculum)
  const unlocked = new Set(save.unlockedRegions ?? [])
  unlocked.add(regions[0].id)
  for (let i = 0; i < regions.length - 1; i++) {
    const oldComplete = [0, 1, 2, 3].every((l) => (save.stars[levelId(regions[i].id, l)] ?? 0) >= 1)
    if (unlocked.has(regions[i].id) && oldComplete) unlocked.add(regions[i + 1].id)
  }
  const remapKey = (key: string): string => {
    for (const [rid, at] of Object.entries(MATCH_AT)) {
      if (!key.startsWith(`${rid}-`)) continue
      const c = Number(key.slice(rid.length + 1))
      if (!Number.isInteger(c)) return key
      const display = c === 4 ? at : c < at ? c : c + 1
      return `${rid}-${display}`
    }
    return key
  }
  const stars: Record<string, number> = {}
  for (const [key, v] of Object.entries(save.stars)) stars[remapKey(key)] = v
  return { ...save, stars, seenStory: save.seenStory.map(remapKey), unlockedRegions: [...unlocked], layout: 2 }
}

/**
 * One-time rebalance for saves from before difficulty pay (and from the
 * short-lived earnings-only top-up, economy 2): recompute the wallet as if
 * the new economy had always existed — every finished level paid at the
 * stage's star value, every owned item bought at today's price. Items are
 * always kept; the wallet is floored at zero so nobody goes into debt.
 * This keeps siblings comparable whether they spent early (at cheap old
 * prices) or saved up.
 */
function upgradeEconomy(save: SaveData, rawEconomy: unknown): SaveData {
  if (rawEconomy === 4) return save
  let earned = 0
  regionsFor(save.curriculum).forEach((region) => {
    region.levels.forEach((_, li) => {
      earned += (save.stars[levelId(region.id, li)] ?? 0) * starValue(region)
    })
  })
  const spent = save.owned.reduce((sum, id) => sum + (itemById(id)?.price ?? 0), 0)
  return { ...save, wallet: Math.max(0, earned - spent), economy: 4 }
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
    return upgradeEconomy(upgradeLayout(migrate({ ...freshSave(), ...data }), data.layout), data.economy)
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
    return { name: data.n.slice(0, 12), save: upgradeEconomy(upgradeLayout(migrate({ ...freshSave(), ...data.s }), data.s.layout), data.s.economy) }
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
