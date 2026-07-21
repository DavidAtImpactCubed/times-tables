import type { Region } from '../types'

const TIMES_LEVELS = (table: number) => [
  { mode: 'choice' as const, title: `Meet the ${table}s` },
  { mode: 'type' as const, title: `Type the ${table}s` },
  { mode: 'missing' as const, title: 'Missing numbers' },
  { mode: 'mixed' as const, title: 'Times & sharing' },
]

export const REGIONS: Region[] = [
  {
    id: 'beach',
    name: 'Twinkle Beach',
    emoji: '🏖️',
    color: '#f59e0b',
    tables: [2],
    kind: 'times',
    levels: TIMES_LEVELS(2),
    intro: [
      { speaker: 'guide', text: 'Oh no! The cheeky Star Goblin has pinched ALL the magic stars from Monster Island!' },
      { speaker: 'goblin', text: 'Hee hee hee! They are MINE now! You will never get them back!' },
      { speaker: 'guide', text: 'Stars only shine for clever monsters. Answer number puzzles and they will fly back to you!' },
      { speaker: 'monster', text: 'Let’s start here on Twinkle Beach with the 2 times table. I can do this!' },
    ],
  },
  {
    id: 'forest',
    name: 'Triple Tree Forest',
    emoji: '🌳',
    color: '#22c55e',
    tables: [3],
    kind: 'times',
    levels: TIMES_LEVELS(3),
    intro: [
      { speaker: 'guide', text: 'Welcome to Triple Tree Forest, where everything grows in threes!' },
      { speaker: 'goblin', text: 'Grrr! You got the beach stars. But the 3 times table is MUCH too tricky for you!' },
      { speaker: 'monster', text: 'Threes are easy-peasy: 3, 6, 9, 12… Watch me, Goblin!' },
    ],
  },
  {
    id: 'mountain',
    name: 'Five-Spike Mountain',
    emoji: '⛰️',
    color: '#8b5cf6',
    tables: [5],
    kind: 'times',
    levels: TIMES_LEVELS(5),
    intro: [
      { speaker: 'guide', text: 'Five-Spike Mountain! Every path up climbs in jumps of 5.' },
      { speaker: 'goblin', text: 'I hid the stars at the TOP! Hope you don’t know your 5s… hee hee!' },
      { speaker: 'monster', text: '5, 10, 15, 20 — I’ll be at the top in no time!' },
    ],
  },
  {
    id: 'lagoon',
    name: 'Ten-Tentacle Lagoon',
    emoji: '🐙',
    color: '#06b6d4',
    tables: [10],
    kind: 'times',
    levels: TIMES_LEVELS(10),
    intro: [
      { speaker: 'guide', text: 'This is Ten-Tentacle Lagoon. The friendly octopus counts everything in tens!' },
      { speaker: 'goblin', text: 'Ha! I tied the stars to the octopus’s tentacles. Ten knots on each one!' },
      { speaker: 'monster', text: 'Tens are my favourite — just pop a zero on the end!' },
    ],
  },
  {
    id: 'castle',
    name: 'Eleventy Cloud Castle',
    emoji: '🏰',
    color: '#ec4899',
    tables: [11],
    kind: 'times',
    levels: TIMES_LEVELS(11),
    intro: [
      { speaker: 'guide', text: 'Up in the clouds sits Eleventy Castle, home of the elegant 11s.' },
      { speaker: 'goblin', text: 'ELEVENS?! Even I get those wrong. You’ve got no chance!' },
      { speaker: 'monster', text: 'The 11s do a magic double trick: 22, 33, 44… I see the pattern!' },
    ],
  },
  {
    id: 'cavern',
    name: 'Division Cavern',
    emoji: '💎',
    color: '#64748b',
    tables: [2, 5, 10, 3, 11],
    kind: 'division',
    levels: [
      { mode: 'choice', title: 'Sharing out' },
      { mode: 'type', title: 'Divide & shine' },
      { mode: 'missing', title: 'Tricky splits' },
      { mode: 'mixed', title: 'Crystal challenge' },
    ],
    intro: [
      { speaker: 'guide', text: 'Deep in Division Cavern, stars are shared into equal piles of glittering crystals.' },
      { speaker: 'goblin', text: 'Dividing is times tables BACKWARDS! Your brain will get dizzy! Hee hee!' },
      { speaker: 'monster', text: 'If 5 × 4 = 20, then 20 ÷ 5 = 4. It’s the same fact family — nice try, Goblin!' },
    ],
  },
  {
    id: 'tower',
    name: 'The Goblin’s Tower',
    emoji: '🗼',
    color: '#ef4444',
    tables: [2, 3, 5, 10, 11],
    kind: 'mixed',
    levels: [
      { mode: 'choice', title: 'Tower gates' },
      { mode: 'type', title: 'Spiral stairs' },
      { mode: 'missing', title: 'Goblin’s riddles' },
      { mode: 'mixed', title: 'The final showdown' },
    ],
    intro: [
      { speaker: 'goblin', text: 'You found my tower?! Fine! But I mixed EVERYTHING up — all the tables at once!' },
      { speaker: 'guide', text: 'This is it — beat the Goblin’s mixed-up puzzles and every star comes home!' },
      { speaker: 'monster', text: 'Twos, threes, fives, tens AND elevens… bring it on!' },
    ],
  },
]

export const FINALE: { speaker: 'monster' | 'goblin' | 'guide'; text: string }[] = [
  { speaker: 'goblin', text: 'Nooo! You answered EVERYTHING! Fine… take your sparkly stars back.' },
  { speaker: 'guide', text: 'You did it! Monster Island is twinkling again, all thanks to you!' },
  { speaker: 'goblin', text: 'Actually… could you teach ME the 11 times table? Pretty please?' },
  { speaker: 'monster', text: 'Of course! Maths is more fun with friends. Hooray!' },
]

export const regionById = (id: string): Region => {
  const r = REGIONS.find((x) => x.id === id)
  if (!r) throw new Error(`Unknown region ${id}`)
  return r
}
