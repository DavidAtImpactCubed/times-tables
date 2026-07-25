import { levelId, type Region, type SaveData } from '../types'

export function starsFor(correct: number): number {
  if (correct >= 10) return 3
  if (correct >= 8) return 2
  if (correct >= 6) return 1
  return 0
}

/** How much each star is WORTH at a region — set per region by difficulty. */
export const starValue = (region: Region): number => region.starValue ?? 1

/**
 * Wallet payout for a run. Improving your best pays the improvement × the
 * stage's star value. A PERFECT run that doesn't improve anything still pays
 * the stage's value once — a practice bonus, so replaying hard stages is
 * always worth more than farming easy ones.
 */
export function walletGain(before: number, stars: number, value: number): { gained: number; practice: boolean } {
  if (stars > before) return { gained: (stars - before) * value, practice: false }
  if (stars === 3) return { gained: value, practice: true }
  return { gained: 0, practice: false }
}

/** Stages finished with at least 1 star, across the whole island. */
export function completedLevels(save: SaveData): number {
  return Object.values(save.stars).filter((s) => s >= 1).length
}

/** How many of a region's levels are finished (≥1 star). */
export function regionLevelsDone(save: SaveData, region: Region): number {
  return region.levels.filter((_, i) => (save.stars[levelId(region.id, i)] ?? 0) >= 1).length
}

/** A region is complete when every one of its levels has ≥1 star. */
export function regionComplete(save: SaveData, region: Region): boolean {
  return regionLevelsDone(save, region) >= region.levels.length
}

/**
 * Region 0 is always open; region n unlocks once region n-1 is fully
 * complete. A region the player has already started never re-locks — so
 * adding new levels to earlier regions can't take the map away from anyone.
 */
export function regionUnlocked(save: SaveData, regions: Region[], regionIndex: number): boolean {
  if (regionIndex === 0) return true
  if (regionLevelsDone(save, regions[regionIndex]) > 0) return true
  if (save.unlockedRegions?.includes(regions[regionIndex].id)) return true
  return regionComplete(save, regions[regionIndex - 1])
}

/** Levels still to finish in the previous region before this one unlocks. */
export function levelsLeftToUnlock(save: SaveData, regions: Region[], regionIndex: number): number {
  if (regionIndex === 0) return 0
  const prev = regions[regionIndex - 1]
  return prev.levels.length - regionLevelsDone(save, prev)
}

export function levelUnlocked(save: SaveData, regions: Region[], regionIndex: number, level: number): boolean {
  if (!regionUnlocked(save, regions, regionIndex)) return false
  // a level you've already earned stars on never re-locks (e.g. when a new
  // level is inserted before it)
  if ((save.stars[levelId(regions[regionIndex].id, level)] ?? 0) >= 1) return true
  if (level === 0) return true
  return (save.stars[levelId(regions[regionIndex].id, level - 1)] ?? 0) >= 1
}

export const totalStars = (save: SaveData): number =>
  Object.values(save.stars).reduce((a, b) => a + b, 0)
