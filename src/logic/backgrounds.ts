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

/** Early-years regions reuse the main island's art. */
const ART_ALIAS: Record<string, string> = {
  'count-cove': 'beach',
  'bonds-bay': 'lagoon',
  'add-meadow': 'forest',
  'sub-trail': 'mountain',
  'doubles-keep': 'castle',
}

export const backgroundFor = (regionId: string, level: number): string | undefined =>
  byStem[`${regionId}-${level}`] ?? byStem[`${ART_ALIAS[regionId] ?? regionId}-${level}`]

/** The island vista shown on the title screen. */
export const TITLE_BG: string | undefined = byStem['title']
