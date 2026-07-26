/**
 * Level background art, resolved by filename: src/assets/backgrounds/<regionId>-<level>.webp
 * Regions without art simply get no background (the level screen keeps its gradient).
 */
const files = import.meta.glob('../assets/backgrounds/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const byStem: Record<string, string> = {}
for (const [path, url] of Object.entries(files)) {
  const stem = path.split('/').pop()!.replace(/\.webp$/, '')
  byStem[stem] = url
}

/**
 * Early-years regions reuse the main island's art. Windmill Hill borrows the
 * forest's green hills until its own windmill-<level>.webp scenes land —
 * real files win over the alias automatically.
 */
const ART_ALIAS: Record<string, string> = {
  'count-cove': 'beach',
  'bonds-bay': 'lagoon',
  'add-meadow': 'forest',
  'sub-trail': 'mountain',
  'doubles-keep': 'castle',
  windmill: 'forest',
}

export const backgroundFor = (regionId: string, level: number): string | undefined => {
  const id = ART_ALIAS[regionId] ?? regionId
  // fall back to the nearest lower level's art (new levels reuse late-region scenery)
  for (let l = level; l >= 0; l--) {
    const hit = byStem[`${regionId}-${l}`] ?? byStem[`${id}-${l}`]
    if (hit) return hit
  }
  return undefined
}

/** The island vista shown on the title screen. */
export const TITLE_BG: string | undefined = byStem['title']

/** The dressing-room scene behind the wardrobe (and its tutorial). */
export const WARDROBE_BG: string | undefined = byStem['wardrobe']
