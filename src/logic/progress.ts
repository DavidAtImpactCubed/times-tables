import { REGIONS } from '../data/regions'
import { levelId, type SaveData } from '../types'

export function starsFor(correct: number): number {
  if (correct >= 10) return 3
  if (correct >= 8) return 2
  if (correct >= 6) return 1
  return 0
}

/** Stages finished with at least 1 star, across the whole island. */
export function completedLevels(save: SaveData): number {
  return Object.values(save.stars).filter((s) => s >= 1).length
}

/** Region n unlocks once 3×n stages are complete (region 0 is always open). */
export const levelsNeededFor = (regionIndex: number): number => regionIndex * 3

export function regionUnlocked(save: SaveData, regionIndex: number): boolean {
  return completedLevels(save) >= levelsNeededFor(regionIndex)
}

export function levelUnlocked(save: SaveData, regionIndex: number, level: number): boolean {
  if (!regionUnlocked(save, regionIndex)) return false
  if (level === 0) return true
  return (save.stars[levelId(REGIONS[regionIndex].id, level - 1)] ?? 0) >= 1
}

export const totalStars = (save: SaveData): number =>
  Object.values(save.stars).reduce((a, b) => a + b, 0)
