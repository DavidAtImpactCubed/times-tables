import type { Curriculum, Region, StoryLine, TipStep } from '../types'

const TIMES_LEVELS = (table: number, stories: StoryLine[][]) => [
  { mode: 'choice' as const, title: `Meet the ${table}s`, story: stories[0] },
  { mode: 'type' as const, title: `Type the ${table}s`, story: stories[1] },
  { mode: 'missing' as const, title: 'Missing numbers', story: stories[2] },
  { mode: 'mixed' as const, title: 'Times & sharing', story: stories[3] },
]

const M = (text: string): StoryLine => ({ speaker: 'monster', text })
const O = (text: string): StoryLine => ({ speaker: 'guide', text })
const G = (text: string): StoryLine => ({ speaker: 'goblin', text })

// Regions in play order: 2, 5, 10, 3, 11, then division and the mixed finale.
export const REGIONS: Region[] = [
  {
    id: 'beach',
    name: 'Twinkle Beach',
    emoji: '🏖️',
    color: '#f59e0b',
    tables: [2],
    kind: 'times',
    levels: TIMES_LEVELS(2, [
      [
        O('Wake up, little monster — disaster! The Star Goblin has stolen every star on Monster Island!'),
        G('Hee hee hee! They’re ALL mine now!'),
        O('His trail starts here on Twinkle Beach. Solve the 2 times table and the stars will shine back to you!'),
        M('Don’t worry, Olivia — I’ll win back every last one. Twos first: 2, 4, 6, 8!'),
      ],
      [O('Look — glowing footprints in the sand, counting up in twos!'), M('The goblin went this way. Follow the twos!')],
      [
        M('Oh no, the waves have washed some footprints away…'),
        O('Then fill in the missing numbers, and the trail will glow again!'),
      ],
      [G('Still here? Try SHARING the stars out — bet you can’t!'), M('Times and sharing are two halves of the same trick. Watch!')],
    ]),
  },
  {
    id: 'mountain',
    name: 'Five-Spike Mountain',
    emoji: '⛰️',
    color: '#8b5cf6',
    tables: [5],
    kind: 'times',
    levels: TIMES_LEVELS(5, [
      [
        O('The trail climbs Five-Spike Mountain. The path rises in jumps of five!'),
        M('5, 10, 15, 20 — I’ll hop up in fives!'),
        G('You’ll never reach the top before me! Hee hee!'),
      ],
      [M('The higher we climb, the more stars I can see twinkling above.'), O('Keep counting in fives — every right answer lights the path.')],
      [O('A rockfall! Some of the numbers have tumbled away.'), M('I can work out what’s missing. Nothing stops this monster!')],
      [G('Fine, take the mountain stars — I’ve a whole SACK more!'), M('Then I’ll win those back too. Onwards!')],
    ]),
  },
  {
    id: 'lagoon',
    name: 'Ten-Tentacle Lagoon',
    emoji: '🐙',
    color: '#06b6d4',
    tables: [10],
    kind: 'times',
    levels: TIMES_LEVELS(10, [
      [
        O('The goblin rowed across Ten-Tentacle Lagoon. The friendly octopus counts in tens!'),
        M('Tens are easy — just pop a zero on the end! 10, 20, 30!'),
        G('Blub blub — hope you can swim, hee hee!'),
      ],
      [M('The octopus is holding stars up on its tentacles — ten on each one!'), O('Answer well and it will pass them to you.')],
      [O('Ripples have hidden some numbers under the water.'), M('I’ll figure out the missing tens!')],
      [M('Look — the goblin dropped a clue, heading for the forest!'), O('Well spotted. To the trees!')],
    ]),
  },
  {
    id: 'forest',
    name: 'Triple Tree Forest',
    emoji: '🌳',
    color: '#22c55e',
    tables: [3],
    kind: 'times',
    levels: TIMES_LEVELS(3, [
      [
        O('Welcome to Triple Tree Forest, where everything grows in threes.'),
        G('My secret hideout is near — but you’ll get LOST in here! Hee hee!'),
        M('Not if I follow the threes: 3, 6, 9, 12!'),
      ],
      [M('Glowing mushrooms in clusters of three light the way.'), O('Follow them deeper — we’re close now.')],
      [O('The path splits! Only the right numbers reveal the true way.'), M('Missing numbers won’t fool me!')],
      [M('There — the goblin’s rope ladder, climbing up into the clouds!'), G('Grrr! How did you find it?!')],
    ]),
  },
  {
    id: 'castle',
    name: 'Eleventy Cloud Castle',
    emoji: '🏰',
    color: '#ec4899',
    tables: [11],
    kind: 'times',
    levels: TIMES_LEVELS(11, [
      [
        O('Up we go, to Eleventy Cloud Castle — home of the tricky elevens!'),
        M('The elevens do a magic doubling trick: 11, 22, 33, 44!'),
        G('You nearly caught me — but not quite! Up, up!'),
      ],
      [M('The clouds are stepping stones — each right answer makes one solid!'), O('Steady now… try not to look down.')],
      [O('The castle gate only opens for the missing numbers.'), M('Eleven times… got it! Open up!')],
      [G('You’re too close! I’m hiding in my CAVE, where you’ll never divide!'), M('Division? That’s just sharing backwards. After him!')],
    ]),
  },
  {
    id: 'cavern',
    name: 'Division Cavern',
    emoji: '💎',
    color: '#64748b',
    tables: [2, 5, 10, 3, 11],
    kind: 'division',
    levels: [
      {
        mode: 'choice',
        title: 'Sharing out',
        story: [
          O('Deep in Division Cavern, the goblin split the stars into equal piles of crystals.'),
          G('Sharing is HARD! Your brain will go dizzy, hee hee!'),
          M('If 5 × 4 = 20, then 20 ÷ 5 = 4 — same fact family!'),
        ],
      },
      { mode: 'type', title: 'Divide & shine', story: [M('Each crystal pile is stars shared out evenly.'), O('Divide carefully and they’ll come loose.')] },
      { mode: 'missing', title: 'Tricky splits', story: [O('These crystals are trickier — thinking caps on!'), M('I love a good puzzle. Bring it on!')] },
      { mode: 'mixed', title: 'Crystal challenge', story: [M('The last tunnel leads up… to the goblin’s tower!'), G('Eep! This is my very LAST hiding place!')] },
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
      {
        mode: 'choice',
        title: 'Tower gates',
        story: [
          G('You found my tower?! Fine — but I’ve MIXED every table together!'),
          O('This is it. Everything you’ve learned, all at once. You can do this!'),
          M('Twos, fives, tens, threes, elevens AND sharing — I’m ready!'),
        ],
      },
      { mode: 'type', title: 'Spiral stairs', story: [M('Up the spiral stairs — the sack of stars is glowing above!'), O('Don’t slow down now!')] },
      { mode: 'missing', title: 'Goblin’s riddles', story: [G('Riddles and tricks! Surely THIS stumps you!'), M('Mix them up all you like — I know my tables!')] },
      { mode: 'mixed', title: 'The final showdown', story: [O('The rooftop! The very last stars are within reach!'), M('This is for all of Monster Island — here we go!')] },
    ],
  },
]

export const FINALE: StoryLine[] = [
  { speaker: 'goblin', text: 'Nooo! You answered EVERYTHING! Fine… take your sparkly stars back.' },
  { speaker: 'guide', text: 'You did it! Every star is home and Monster Island is twinkling again — all thanks to you!' },
  { speaker: 'goblin', text: 'Actually… could you teach ME the times tables? Pretty please?' },
  { speaker: 'monster', text: 'Of course! Maths is more fun with friends. Hooray!' },
]

// ---------------------------------------------------------------------------
// Early-years curriculum (Reception & Year 1, ages 4–6)
// Counting, one more/less, number bonds, addition, subtraction and doubles.
// Regions reuse the main island's background art via the `art` field.
// ---------------------------------------------------------------------------

const EL = (mode: Region['levels'][number]['mode'], title: string, story: StoryLine[]) => ({ mode, title, story })

export const EARLY_REGIONS: Region[] = [
  {
    id: 'count-cove',
    name: 'Counting Cove',
    emoji: '🐚',
    color: '#f59e0b',
    tables: [],
    kind: 'count',
    curriculum: 'early',
    art: 'beach',
    levels: [
      EL('choice', 'Count to 5', [
        O('Welcome to Counting Cove, little monster! Shiny stars are hiding in the sand.'),
        M('I’ll count them one by one — 1, 2, 3!'),
        O('Tap how many you see, and the stars are yours!'),
      ]),
      EL('choice', 'Count to 10', [
        M('So many stars now — right up to ten!'),
        O('Count carefully and tap the number. You’ve got this!'),
      ]),
      EL('choice', 'One more', [
        O('A friendly crab pops ONE more star on the pile each time.'),
        M('One more than 4 is… 5! Easy peasy.'),
      ]),
      EL('choice', 'One less', [
        M('Oops — a little wave washes ONE star away!'),
        O('What’s one less? You can work it out!'),
      ]),
    ],
  },
  {
    id: 'bonds-bay',
    name: 'Number Bond Bay',
    emoji: '🐠',
    color: '#06b6d4',
    tables: [],
    kind: 'bond',
    curriculum: 'early',
    art: 'lagoon',
    levels: [
      EL('choice', 'Make ten', [
        O('In Number Bond Bay, stars love to swim in pairs that make TEN.'),
        M('7 stars need 3 more to make ten. Together they’re a perfect pair!'),
        O('Tap the number that makes ten — these pairs are worth remembering!'),
      ]),
      EL('choice', 'Adding to ten', [
        M('Now I can add any little groups, all the way up to ten.'),
        O('Put the two groups together and tap the total.'),
      ]),
      EL('choice', 'Missing numbers', [
        O('Some stars are hiding! How many more are needed?'),
        M('6 and how many make 9? I can work it out — 3!'),
      ]),
      EL('type', 'Bond champion', [
        G('Blub blub! Type the missing number if you’re so clever! Hee hee!'),
        M('Missing numbers don’t fool me. Watch this!'),
      ]),
    ],
  },
  {
    id: 'add-meadow',
    name: 'Adding Meadow',
    emoji: '🌼',
    color: '#22c55e',
    tables: [],
    kind: 'add',
    curriculum: 'early',
    art: 'forest',
    levels: [
      EL('choice', 'Adding to 10', [
        O('The Adding Meadow is full of flowers, and each has a few stars.'),
        M('I’ll add the stars from two flowers together!'),
      ]),
      EL('choice', 'Adding to 20', [M('Even more stars now — up past ten!'), O('Count on from the bigger number — nice and steady.')]),
      EL('type', 'Type the total', [O('You’re ready to type your answers now!'), M('Tap the numbers and press go. Here we grow!')]),
      EL('missing', 'Missing number', [
        O('Some flowers have hidden their stars. How many more are needed?'),
        M('6 and how many make 9? Let me think… 3!'),
      ]),
    ],
  },
  {
    id: 'sub-trail',
    name: 'Take-Away Trail',
    emoji: '🍂',
    color: '#8b5cf6',
    tables: [],
    kind: 'sub',
    curriculum: 'early',
    art: 'mountain',
    levels: [
      EL('choice', 'Take away to 10', [
        O('On the Take-Away Trail, cheeky birds fly off with some stars!'),
        M('If I had 7 and 2 fly away, I have 5 left.'),
      ]),
      EL('type', 'Type it', [M('I’ll type how many are left!'), O('Count back carefully — you’re doing great.')]),
      EL('choice', 'Take away to 20', [M('Bigger numbers now — but I’m not scared!'), O('Take them away and tap what’s left.')]),
      EL('mixed', 'Add & take away', [
        O('This part mixes adding AND taking away. Read each one carefully!'),
        M('Plus means more, take-away means fewer. I’m ready!'),
      ]),
    ],
  },
  {
    id: 'doubles-keep',
    name: 'Doubles Keep',
    emoji: '🏰',
    color: '#ec4899',
    tables: [],
    kind: 'double',
    curriculum: 'early',
    art: 'castle',
    levels: [
      EL('choice', 'Doubles', [
        O('Up in Doubles Keep, a magic mirror makes TWO of everything!'),
        M('Double 3 is 3 and 3 — that’s 6!'),
      ]),
      EL('type', 'Type the double', [M('I’ll type the doubles all by myself!'), O('Double means add the number to itself.')]),
      EL('choice', 'Add & take away', [
        G('You’ve done SO well… but here’s a mix of everything! Hee hee!'),
        M('Adding, taking away — bring it on!'),
      ]),
      EL('mixed', 'Star champion', [
        O('The very last stars are at the top of the keep!'),
        M('I’ve learned so much. This is for all my new stars!'),
        G('Amazing! You’re a real star champion!'),
      ]),
    ],
  },
]

export const EARLY_FINALE: StoryLine[] = [
  { speaker: 'guide', text: 'Hooray! You collected every single star across the whole island!' },
  { speaker: 'monster', text: 'I can count, add, take away AND double now. I’m so proud!' },
  { speaker: 'goblin', text: 'You’re the cleverest little monster I know. Well done, superstar!' },
]

// ---------------------------------------------------------------------------
// Olivia's optional tips — a short, research-informed "how to" for EVERY level.
// Offered (with an easy "Not now") before every play, so a child can have the
// strategy fresh in mind — especially the younger ones. One entry per level.
// ---------------------------------------------------------------------------
const T = (text: string, example?: string, visual?: TipStep['visual']): TipStep => ({ text, example, visual })

const LEVEL_TIPS: Record<string, TipStep[][]> = {
  // ---- main curriculum -----------------------------------------------------
  beach: [
    [T('The 2 times table is just doubling — two of something! Count up in twos: 2, 4, 6, 8…', '2 × 4  →  double 4  →  8')],
    [T('Every answer is an even number, so it ends in 0, 2, 4, 6 or 8. Count up in twos to check.')],
    [T('Missing number? Count up in twos until you reach the total, then count how many jumps it took.', '2 × ? = 8  →  2, 4, 6, 8  →  4 jumps')],
    [T('Sharing is timesing backwards. If 2 × 4 = 8, then 8 ÷ 2 = 4 — the same fact family!')],
  ],
  mountain: [
    [T('Count up in fives: 5, 10, 15, 20… like counting the fingers on each hand!')],
    [T('Every answer ends in a 5 or a 0. That’s the fives’ special pattern.', '5 × 3  →  5, 10, 15  →  15')],
    [T('Count up in fives until you reach the total; the number of jumps is your answer.', '5 × ? = 20  →  5, 10, 15, 20  →  4')],
    [T('5 × 4 = 20, so 20 ÷ 5 = 4. Timesing and sharing are the same fact family.')],
  ],
  lagoon: [
    [T('Times ten is the easiest trick of all — just pop a zero on the end!', '10 × 3  →  30')],
    [T('So 10 × 7 is 70, and 10 × 9 is 90. Add a zero every time.')],
    [T('To find the missing number, take the zero off the total.', '10 × ? = 70  →  7')],
    [T('70 ÷ 10 = 7 — just take the zero off. Sharing is timesing backwards!')],
  ],
  forest: [
    [T('Count up in threes: 3, 6, 9, 12, 15…')],
    [T('Clever trick: double the number, then add one more group.', '3 × 4  →  (2 × 4) + 4  →  8 + 4  →  12')],
    [T('Count up in threes until you reach the total, then count the jumps.', '3 × ? = 12  →  3, 6, 9, 12  →  4')],
    [T('3 × 4 = 12, so 12 ÷ 3 = 4. Same fact family, just backwards!')],
  ],
  castle: [
    [T('For the elevens up to 9, just say the digit twice!', '11 × 3  →  33      11 × 4  →  44')],
    [T('Another way: do ten times, then add one more group.', '11 × 3  →  (10 × 3) + 3  →  30 + 3  →  33')],
    [T('For a double-digit answer like 33 or 66, the missing number is just that repeated digit.', '11 × ? = 55  →  5')],
    [T('11 × 4 = 44, so 44 ÷ 11 = 4. Timesing and sharing together!')],
  ],
  cavern: [
    [T('Dividing means sharing into equal groups — and it’s multiplying backwards!')],
    [T('To solve 20 ÷ 5, ask: what times 5 makes 20?', '5 × 4 = 20    so    20 ÷ 5 = 4')],
    [T('Stuck? Count up in the group size until you reach the total, and count the jumps.', '15 ÷ 3  →  3, 6, 9, 12, 15  →  5')],
    [T('Every division has a times fact hiding inside it — think of the fact family you already know!')],
  ],
  tower: [
    [T('Use your best tricks! Tens: add a zero. Fives: end in 5 or 0. Twos: just double.')],
    [T('For the elevens, do ten times then add one more group.', '11 × 6  →  60 + 6  →  66')],
    [T('Missing number? Turn it into a division.', '5 × ? = 30  →  30 ÷ 5  →  6')],
    [T('Remember — dividing is just multiplying backwards. You know every fact family. You’ve got this!')],
  ],
  // ---- early years ---------------------------------------------------------
  'count-cove': [
    [T('Touch each thing as you count: 1, 2, 3, 4, 5. The last number you say is how many there are!', undefined, { kind: 'count', to: 5 })],
    [T('Keep touching each star as you count all the way to ten — don’t count any star twice!', undefined, { kind: 'count', to: 10 })],
    [T('One more? Just count on by one — say the very next number.', 'one more than 4  →  5', { kind: 'countOn', from: 4, add: 1, max: 8 })],
    [T('One less? Count back by one — say the number that comes just before.', 'one less than 6  →  5', { kind: 'countBack', from: 6, sub: 1, max: 8 })],
  ],
  'bonds-bay': [
    [T('Some pairs of numbers always make ten. They’re special — try to learn them by heart!', '1&9   2&8   3&7   4&6   5&5', { kind: 'tenframe', a: 7, b: 3 })],
    [T('Start with the bigger number, then count on. Your fingers help you keep track.', '6 + 3  →  6… 7, 8, 9  →  9', { kind: 'countOn', from: 6, add: 3, max: 10 })],
    [T('Start at the number you have and count ON to the total. Put up a finger for each count — that’s your answer!', '6 and how many make 9?  →  6… 7, 8, 9  →  3 fingers', { kind: 'countOn', from: 6, add: 3, max: 10 })],
    [T('To find a missing number, count on from what you have up to the total, keeping track on your fingers.', '7 + ? = 10  →  7… 8, 9, 10  →  3', { kind: 'countOn', from: 7, add: 3, max: 10 })],
  ],
  'add-meadow': [
    [T('Start with the BIGGER number, then count on the smaller one. It’s much quicker!', '3 + 6  →  start at 6… 7, 8, 9  →  9', { kind: 'countOn', from: 6, add: 3, max: 10 })],
    [T('Still start with the bigger number and count on. Use your fingers to keep track.', '5 + 8  →  8… 9, 10, 11, 12, 13  →  13', { kind: 'countOn', from: 8, add: 5, min: 5, max: 15 })],
    [T('Count on from the bigger number, then type the total you land on.', '9 + 4  →  9… 10, 11, 12, 13  →  13', { kind: 'countOn', from: 9, add: 4, min: 5, max: 15 })],
    [T('Start at the number you have and count on to the total — how many did you add on?', '6 + ? = 9  →  6… 7, 8, 9  →  3', { kind: 'countOn', from: 6, add: 3, max: 10 })],
  ],
  'sub-trail': [
    [T('Taking away means counting back. Start at the big number and count back.', '7 − 2  →  7… 6, 5  →  5', { kind: 'countBack', from: 7, sub: 2, max: 10 })],
    [T('Count back on your fingers, then type how many are left.', '8 − 3  →  8… 7, 6, 5  →  5', { kind: 'countBack', from: 8, sub: 3, max: 10 })],
    [T('For bigger numbers, count back one at a time — take your time.', '15 − 3  →  15… 14, 13, 12  →  12', { kind: 'countBack', from: 15, sub: 3, min: 9, max: 16 })],
    [T('Plus means count ON to get more; take-away means count BACK to get fewer. Read each one carefully!')],
  ],
  'doubles-keep': [
    [T('Double means two of the same number added together.', 'double 4  →  4 + 4  →  8', { kind: 'double', n: 4 })],
    [T('Add the number to itself, then type the answer.', 'double 5  →  5 + 5  →  10', { kind: 'double', n: 5 })],
    [T('Plus means more (count on), take-away means fewer (count back). Look at the sign!')],
    [T('Use all your tricks: count on to add, count back to take away, and double by adding a number to itself!')],
  ],
}

const ALL_REGIONS = [...REGIONS, ...EARLY_REGIONS]
for (const r of ALL_REGIONS) {
  const tips = LEVEL_TIPS[r.id]
  if (tips) r.levels.forEach((lvl, i) => { if (tips[i]) lvl.tip = tips[i] })
}

export const regionsFor = (curriculum: Curriculum): Region[] =>
  curriculum === 'early' ? EARLY_REGIONS : REGIONS

export const finaleFor = (curriculum: Curriculum): StoryLine[] =>
  curriculum === 'early' ? EARLY_FINALE : FINALE

export const regionById = (id: string): Region => {
  const r = ALL_REGIONS.find((x) => x.id === id)
  if (!r) throw new Error(`Unknown region ${id}`)
  return r
}
