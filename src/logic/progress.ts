import { REGIONS } from '../data/regions'
import { levelId, type SaveData } from '../types'

export function starsFor(correct: number): number {
  if (correct >= 10) return 3
  if (correct >= 8) return 2
  if (correct >= 6) return 1
  return 0
}

export function regionUnlocked(save: SaveData, regionIndex: number): boolean {
  if (regionIndex === 0) return true
  const prev = REGIONS[regionIndex - 1]
  return (save.stars[levelId(prev.id, prev.levels.length - 1)] ?? 0) >= 1
}

export function levelUnlocked(save: SaveData, regionIndex: number, level: number): boolean {
  if (!regionUnlocked(save, regionIndex)) return false
  if (level === 0) return true
  return (save.stars[levelId(REGIONS[regionIndex].id, level - 1)] ?? 0) >= 1
}

export const totalStars = (save: SaveData): number =>
  Object.values(save.stars).reduce((a, b) => a + b, 0)
