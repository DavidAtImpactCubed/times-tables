# Monster Maths Quest ⭐

A times-tables adventure game for children starting Year 3 (age ~7), covering the
**2, 3, 5, 10 and 11 times tables**, matching **division facts**, and
**missing-number problems** (`3 × ? = 15`).

The cheeky Star Goblin has pinched all the magic stars from Monster Island.
Travel through 7 regions, solve number puzzles to win the stars back, and spend
them on hats, horns, wings and colours for your own monster in the wardrobe.

## The game

- **7 story regions**, unlocked in order: Twinkle Beach (2s), Triple Tree Forest (3s),
  Five-Spike Mountain (5s), Ten-Tentacle Lagoon (10s), Eleventy Cloud Castle (11s),
  Division Cavern, and The Goblin's Tower (everything mixed).
- **4 levels per region** with ramping difficulty: multiple choice → typed answers on a
  big number pad → missing numbers → mixed times & division.
- **Up to 3 stars per level** (10/10 → ⭐⭐⭐). Replay any level to improve your stars.
- **Gentle mistakes**: a wrong answer shows the correct one with a skip-counting
  explanation, and the question comes back later in the level for another (unscored) go.
- **Monster Wardrobe**: ~30 items to buy with stars — body colours, eyes, horns, hats,
  glasses, held items and wings.
- Progress saves automatically in the browser (`localStorage`). Sound effects are
  generated with the Web Audio API and can be muted from the map.

## Run it locally

```bash
npm install
npm run dev        # open the printed URL
```

## Play it on any device (GitHub Pages)

The repo ships with a deploy workflow (`.github/workflows/deploy.yml`). One-time setup:

1. On GitHub: **Settings → Pages → Source → GitHub Actions**.
2. Merge/push to `main`.

The game then lives at `https://<your-username>.github.io/times-tables/` — bookmark it
on a tablet and it plays full screen. Progress is saved per browser/device.

## Extending the game (as she grows)

- **New times table** (Year 3 adds 4s and 8s): add a region in
  `src/data/regions.ts` — question generation, levels, unlocking and the map all
  follow automatically.
- **New wardrobe items**: add to `src/data/wardrobe.ts` and draw the variant in
  `src/components/Monster.tsx`.
- **Difficulty tuning**: star thresholds live in `src/logic/progress.ts`; question
  ranges in `src/logic/questions.ts`.

## Checks

```bash
npm run build             # type-check + production build
npm run check:questions   # sanity-check every question generator (facts, choices, ranges)
```
