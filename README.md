# Monster Maths Quest ⭐

A friendly maths adventure for primary-age children. Pick an age band when you
start, and the game tailors itself to that stage of the UK curriculum. The
cheeky Star Goblin has pinched all the magic stars from Monster Island — travel
through the regions, solve number puzzles to win the stars back, and spend them
on hats, horns, wings and colours for your own monster in the wardrobe.

## The two age bands

Chosen per player when a new game starts (see the landing screen):

- **Ages 4–6 · Reception & Year 1** — Counting Cove (count to 5 then 10, one
  more/less), Number Bond Bay (make-ten pairs → adding to ten → missing
  numbers), Adding Meadow (add within 10 then 20), Take-Away Trail
  (subtraction), Doubles Keep (doubling & a mixed finish). Questions are visual
  counting and big-button addition/subtraction, with typing later on.
- **Ages 6–8 · Year 2 & 3** — the times-tables adventure: Twinkle Beach (2s),
  Five-Spike Mountain (5s), Ten-Tentacle Lagoon (10s), Triple Tree Forest (3s),
  Eleventy Cloud Castle (11s), Division Cavern, and The Goblin's Tower
  (everything mixed).

## Features

- **Multiple players** — each name has its own save (progress, wallet,
  wardrobe, age band). Chosen from the landing screen; switch any time via the
  tag in the map header.
- **4 levels per region**, ramping in difficulty. Region *n* unlocks once
  3×*n* stages are complete anywhere on the island.
- **Up to 3 stars per level** (10/10 → ⭐⭐⭐); replay to improve.
- **Gentle mistakes** — a wrong answer shows the correct one with a
  count-on / count-back / skip-counting explanation, and the question returns
  later in the level for another (unscored) go.
- **Olly's clever tricks** — when a topic is introduced, Olly the Owl offers an
  *optional* strategy mini-lesson (e.g. "11× → do 10× then add one more
  group"). Revisit any region's trick from the 💡 button on the map.
- **Read-aloud** — questions, stories and tips can be spoken using the browser's
  built-in speech synthesis (no dependency). On by default for the 4–6 band
  (pre-readers); toggle with 🗣️ in the map header, replay with 🔊 in a level.
- **Monster Wardrobe** — ~45 items bought with stars: body colours, eyes,
  glasses, horns, hats, neckwear, held props and wings. Try before you buy.
- **Story** — a skippable comic-strip arc per region and a celebration finale.
- Progress saves automatically in the browser (`localStorage`). Sound effects
  are generated with the Web Audio API and can be muted from the map.

## Run it locally

```bash
npm install
npm run dev        # open the printed URL
```

## Play it on any device (GitHub Pages)

The repo ships with a deploy workflow (`.github/workflows/deploy.yml`) that
builds and publishes on every push to `main`. One-time setup:

1. On GitHub: **Settings → Pages → Source → GitHub Actions**.
2. Push to `main`.

The game then lives at `https://<your-username>.github.io/times-tables/` —
bookmark it on a tablet and it plays full screen. Progress is per browser/device
(localStorage), so it does not follow a player between devices.

## How it's built

Zero-runtime-dependency **React + Vite + TypeScript**. All art is pre-rendered
WebP; all sound is generated at runtime.

| Area | Where |
|------|-------|
| Screen flow (landing → map → story → tip → level → results → wardrobe/finale) | `src/App.tsx` (simple state machine) |
| Regions, level definitions, story beats, Olly's tips | `src/data/regions.ts` |
| Which region set a player sees | `regionsFor(curriculum)` in `src/data/regions.ts` |
| Question generation (per region kind + level) | `src/logic/questions.ts` |
| Unlocking & star thresholds | `src/logic/progress.ts` |
| Save/load, per-name profiles, migrations, item refunds | `src/logic/storage.ts` |
| Read-aloud (Web Speech API) | `src/logic/speech.ts` |
| Layered monster compositing & part placements | `src/components/Monster.tsx` |
| Wardrobe catalogue | `src/data/wardrobe.ts` |
| Background art resolution (+ early-years art aliases) | `src/logic/backgrounds.ts` |

Question types share one model — `a op b = result` with one unknown slot —
covering `mul`, `div`, `add`, `sub`, plus a visual `count` type. See
`Question` in `src/types.ts`.

### Extending it

- **New times table** (e.g. Year 3's 4s and 8s): add a `Region` to `REGIONS` in
  `src/data/regions.ts` with `kind: 'times'` and `tables: [4]`; the generator,
  levels, unlocking, map and background fallback all follow. Add a `TIPS[id]`
  entry for its clever trick.
- **New early-years topic**: add a `Region` to `EARLY_REGIONS`
  (`curriculum: 'early'`, an `art` alias, a `kind`) and a branch in
  `generateEarlyLevel` in `src/logic/questions.ts`.
- **New wardrobe item**: add to `src/data/wardrobe.ts` and give it a placement
  (and asset) in `src/components/Monster.tsx`. Retiring an item? Move its price
  to `RETIRED_ITEM_PRICES` so existing owners are refunded on load.
- **Difficulty tuning**: star thresholds in `src/logic/progress.ts`; number
  ranges in `src/logic/questions.ts`.

## Checks

```bash
npm run build             # type-check + production build
npm run check:questions   # sanity-check every generator (facts, choices, ranges)
```

There is also an end-to-end Playwright walkthrough used during development
(drives a real browser over `vite preview`) covering both age bands, the
wardrobe, persistence, the tip flow and read-aloud controls.
