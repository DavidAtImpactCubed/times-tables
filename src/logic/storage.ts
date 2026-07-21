import type { SaveData } from '../types'

const KEY = 'monster-maths-save-v1'

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
    return { ...freshSave(), ...data }
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
