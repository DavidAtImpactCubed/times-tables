import { RETIRED_ITEM_PRICES, itemById } from '../data/wardrobe'
import type { SaveData } from '../types'

const LEGACY_KEY = 'monster-maths-save-v1'
const PROFILES_KEY = 'monster-maths-profiles-v1'
const saveKey = (name: string) => `${LEGACY_KEY}::${name}`

export function freshSave(): SaveData {
  return {
    version: 1,
    curriculum: 'main',
    stars: {},
    wallet: 0,
    owned: [],
    equipped: {},
    seenStory: [],
    seenFinale: false,
    muted: false,
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

/**
 * List the saved player profiles. On first run this migrates a legacy
 * single-player save into a profile named "Elyse".
 */
export function listProfiles(): string[] {
  try {
    if (localStorage.getItem(PROFILES_KEY) === null) {
      const legacy = localStorage.getItem(LEGACY_KEY)
      if (legacy) {
        localStorage.setItem(saveKey('Elyse'), legacy)
        localStorage.removeItem(LEGACY_KEY)
        writeProfiles(['Elyse'])
      } else {
        writeProfiles([])
      }
    }
  } catch {
    // ignore — fall through to reading whatever exists
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
