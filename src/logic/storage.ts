import { EARLY_MATCH_AT, MATCH_AT, regionsFor } from '../data/regions'
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
    layout: 6,
  }
}

/**
 * Regions the player had already earned under the OLD four-level rule stay
 * unlocked for good — newly inserted levels are extra content, not new gates.
 * The "next region" must be judged by the adjacency of that era, so regions
 * added later (the windmill and the early-band expansion) are skipped over —
 * a complete castle granted the cavern, not the windmill.
 */
const POST_GRANT_REGIONS = new Set(['windmill', 'harbour', 'hollow', 'peak'])
function oldRuleGrants(save: SaveData): string[] {
  const regions = regionsFor(save.curriculum).filter((r) => !POST_GRANT_REGIONS.has(r.id))
  const unlocked = new Set(save.unlockedRegions ?? [])
  unlocked.add(regions[0].id)
  for (let i = 0; i < regions.length - 1; i++) {
    const oldComplete = [0, 1, 2, 3].every((l) => (save.stars[levelId(regions[i].id, l)] ?? 0) >= 1)
    if (unlocked.has(regions[i].id) && oldComplete) unlocked.add(regions[i + 1].id)
  }
  return [...unlocked]
}

/** Move star + story-seen keys through a per-region index remap. */
function remapKeys(save: SaveData, remapKey: (key: string) => string): SaveData {
  const stars: Record<string, number> = {}
  for (const [key, v] of Object.entries(save.stars)) stars[remapKey(key)] = v
  return { ...save, stars, seenStory: save.seenStory.map(remapKey) }
}

/**
 * One-time star-key remaps after levels were inserted mid-region. Older saves
 * recorded stars by the level order that existed at the time, so each step
 * reads stored indices in that old order and moves every entry to the level's
 * current position — inserted levels end up unplayed, everything else keeps
 * the stars it really earned, and story-seen markers move the same way.
 *   v2: "Match the arrays" into the five times regions
 *   v3: picture-match levels into Counting Cove and Doubles Keep
 *   v4: Windmill Hill (4s) inserted between the castle and the cavern —
 *       no keys move, but anyone who had earned the cavern under the old
 *       castle→cavern adjacency keeps it unlocked.
 *   v5: early band grows — "Who has more?" inserted at Counting Cove slot 3,
 *       and Ten-Rod Harbour appears between the cove and Number Bond Bay
 *       (anyone who'd finished the cove keeps the bay unlocked).
 *   v6: the harbour moves after Take-Away Trail (matching the school-year
 *       order) and grows from 4 to 7 levels — Whole tens and a gentler Tens
 *       and ones slot in at 2-3, Which is more? at 5. Old harbour stars move
 *       (2→3, 3→6); cove-completers keep the harbour and trail-completers
 *       keep Doubles Keep, as under the old adjacency.
 */
function upgradeLayout(save: SaveData, rawLayout: unknown): SaveData {
  if (rawLayout === 6) return save
  const era =
    rawLayout === 2 ? 2 : rawLayout === 3 ? 3 : rawLayout === 4 ? 4 : rawLayout === 5 ? 5 : 1
  // v4 entitlement, judged in the era the stored keys are in: a complete
  // castle (4 levels before v2, 5 after) had unlocked the cavern.
  const castleLevels = era >= 2 ? [0, 1, 2, 3, 4] : [0, 1, 2, 3]
  const hadCavern =
    era < 4 && save.curriculum !== 'early' && castleLevels.every((l) => (save.stars[levelId('castle', l)] ?? 0) >= 1)
  let s = save
  if (era < 2) {
    s = { ...s, unlockedRegions: oldRuleGrants(s) }
    s = remapKeys(s, (key) => {
      for (const [rid, at] of Object.entries(MATCH_AT)) {
        if (!key.startsWith(`${rid}-`)) continue
        const c = Number(key.slice(rid.length + 1))
        if (!Number.isInteger(c)) return key
        const display = c === 4 ? at : c < at ? c : c + 1
        return `${rid}-${display}`
      }
      return key
    })
  }
  if (era < 3 && s.curriculum === 'early') {
    s = { ...s, unlockedRegions: oldRuleGrants(s) }
    s = remapKeys(s, (key) => {
      for (const [rid, at] of Object.entries(EARLY_MATCH_AT)) {
        if (!key.startsWith(`${rid}-`)) continue
        const c = Number(key.slice(rid.length + 1))
        if (!Number.isInteger(c)) return key
        return `${rid}-${c < at ? c : c + 1}`
      }
      return key
    })
  }
  if (hadCavern) s = { ...s, unlockedRegions: [...new Set([...(s.unlockedRegions ?? []), 'cavern'])] }
  if (era < 5 && s.curriculum === 'early') {
    // judged on the 5-level cove the keys are in by this point (post-v3)
    const coveDone = [0, 1, 2, 3, 4].every((l) => (s.stars[levelId('count-cove', l)] ?? 0) >= 1)
    if (coveDone) s = { ...s, unlockedRegions: [...new Set([...(s.unlockedRegions ?? []), 'bonds-bay'])] }
    s = remapKeys(s, (key) => {
      if (!key.startsWith('count-cove-')) return key
      const c = Number(key.slice('count-cove-'.length))
      if (!Number.isInteger(c)) return key
      return `count-cove-${c < 3 ? c : c + 1}`
    })
  }
  if (s.curriculum === 'early') {
    // v6: keep everything reachable that the old adjacency had opened
    const done = (rid: string, n: number) =>
      Array.from({ length: n }, (_, l) => l).every((l) => (s.stars[levelId(rid, l)] ?? 0) >= 1)
    const grants: string[] = []
    if (done('count-cove', 6)) grants.push('harbour') // the cove used to open the harbour
    if (done('sub-trail', 4)) grants.push('doubles-keep') // the trail used to open the keep
    if (grants.length) s = { ...s, unlockedRegions: [...new Set([...(s.unlockedRegions ?? []), ...grants])] }
    // old harbour stars move to the levels' new slots (2→3, 3→6)
    s = remapKeys(s, (key) => {
      if (!key.startsWith('harbour-')) return key
      const c = Number(key.slice('harbour-'.length))
      if (!Number.isInteger(c)) return key
      return `harbour-${c === 2 ? 3 : c === 3 ? 6 : c}`
    })
  }
  return { ...s, layout: 6 }
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
    localStorage.setItem(saveKey(name), JSON.stringify({ ...save, savedAt: Date.now() }))
  } catch {
    // Storage full/blocked — the game still plays, it just won't remember.
  }
}

const MS_PER_DAY = 86_400_000
/** Whole calendar days from `then` to `now` (midnight to midnight, local time). */
function daysAgo(then: Date, now: Date): number {
  const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  return Math.round((midnight(now) - midnight(then)) / MS_PER_DAY)
}

/**
 * When this save was last written, in words a parent can act on — the point
 * being to tell a played-today profile apart from one left behind months ago.
 */
export function lastSavedLabel(save: SaveData, now: Date = new Date()): string {
  if (!save.savedAt) return 'Last saved date not known'
  const when = new Date(save.savedAt)
  const time = when.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  const days = daysAgo(when, now)
  if (days <= 0) return `Last saved today, ${time}`
  if (days === 1) return `Last saved yesterday, ${time}`
  if (days < 7) return `Last saved ${days} days ago`
  const date = when.toLocaleDateString([], {
    day: 'numeric',
    month: 'short',
    ...(when.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
  })
  return `Last saved ${date}`
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
