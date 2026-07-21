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

export const backgroundFor = (regionId: string, level: number): string | undefined =>
  byStem[`${regionId}-${level}`]
