import { RETIRED_ITEM_PRICES, itemById } from '../data/wardrobe'
import type { SaveData } from '../types'

const KEY = 'monster-maths-save-v1'

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

export function freshSave(): SaveData {
  return {
    version: 1,
    stars: {},
    wallet: 0,
    owned: [],
    equipped: {},
    seenStory: [],
    seenFinale: false,
    muted: false,
  }
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return freshSave()
    const data = JSON.parse(raw)
    if (!data || data.version !== 1 || typeof data.stars !== 'object') return freshSave()
    // Merge over a fresh save so missing fields never crash the game.
    return migrate({ ...freshSave(), ...data })
  } catch {
    return freshSave()
  }
}

export function persistSave(save: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(save))
  } catch {
    // Storage full/blocked — the game still plays, it just won't remember.
  }
}
