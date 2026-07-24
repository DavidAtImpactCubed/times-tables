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
  // Like the early band, these are the lesson before the quiz: idea, then a
  // demonstration with arrays / skip-count lines, then the trick in symbols.
  beach: [
    [
      T('The two times table is just DOUBLING — two groups of the same number!', undefined, { kind: 'double', n: 4, hands: true }),
      T('You can also count up in twos: two, four, six, eight, ten!', '2, 4, 6, 8, 10…', { kind: 'skip', step: 2, times: 5 }),
      T('Two times four means two rows of four. Count the stars — eight!', '2 × 4 = 8', { kind: 'array', rows: 2, cols: 4 }),
    ],
    [
      T('Every answer in the two times table is EVEN — it always ends in 0, 2, 4, 6 or 8.', '2, 4, 6, 8, 10…', { kind: 'skip', step: 2, times: 5 }),
      T('Double the number, then type it in. Double seven is fourteen!', '2 × 7  →  double 7  →  14'),
    ],
    [
      T('A number is missing! Count up in twos until you reach the total, and count the jumps on your fingers.', undefined, { kind: 'skip', step: 2, times: 4, hands: true }),
      T('Two, four, six, eight — that took four jumps, so the missing number is four!', '2 × ? = 8  →  4 jumps  →  4'),
    ],
    [
      T('An array shows times AND sharing at once. Two rows of four make eight…', '2 × 4 = 8', { kind: 'array', rows: 2, cols: 4 }),
      T('…and eight shared into fours makes two. The same picture, read backwards!', '8 ÷ 4 = 2', { kind: 'array', rows: 2, cols: 4, divide: true }),
    ],
  ],
  mountain: [
    [
      T('Count up in fives — like counting whole hands of fingers: five, ten, fifteen, twenty!', '5, 10, 15, 20…', { kind: 'skip', step: 5, times: 4 }),
      T('Five times three is three rows of five. Count the rows: five, ten, fifteen!', '5 × 3 = 15', { kind: 'array', rows: 3, cols: 5 }),
    ],
    [
      T('Every answer ends in five or zero — that’s the fives’ secret pattern. Check before you type!', '5, 10, 15, 20, 25…', { kind: 'skip', step: 5, times: 5 }),
      T('Clever shortcut: five is HALF of ten. Five times six is half of sixty — thirty!', '5 × 6  →  half of 60  →  30'),
    ],
    [
      T('Count up in fives until you reach the total, counting the jumps on your fingers.', undefined, { kind: 'skip', step: 5, times: 4, hands: true }),
      T('Five, ten, fifteen, twenty — four jumps! The missing number is four.', '5 × ? = 20  →  4'),
    ],
    [
      T('Four rows of five make twenty…', '4 × 5 = 20', { kind: 'array', rows: 4, cols: 5 }),
      T('…so twenty shared into fives makes four. Times and sharing are one fact family!', '20 ÷ 5 = 4', { kind: 'array', rows: 4, cols: 5, divide: true }),
    ],
  ],
  lagoon: [
    [
      T('Times ten is the friendliest trick of all — just pop a ZERO on the end!', '10 × 3  →  30'),
      T('See it on the line: ten, twenty, thirty. Every jump adds another ten.', '10, 20, 30…', { kind: 'skip', step: 10, times: 3 }),
    ],
    [
      T('Add a zero every time: ten times seven is seventy, ten times nine is ninety.', '10 × 7  →  70'),
      T('All the answers end in zero — if yours doesn’t, have another look!', '10, 20, 30, 40, 50…', { kind: 'skip', step: 10, times: 5 }),
    ],
    [
      T('To find the missing number, just take the zero OFF the total.', '10 × ? = 70  →  7'),
    ],
    [
      T('Dividing by ten? Take the zero off! Seventy shared into tens is seven.', '70 ÷ 10 = 7'),
      T('Times ten and divide by ten undo each other — add the zero, take the zero.', '7 → 70 → 7'),
    ],
  ],
  forest: [
    [
      T('Count up in threes: three, six, nine, twelve, fifteen!', '3, 6, 9, 12, 15…', { kind: 'skip', step: 3, times: 5 }),
      T('Three times four is three rows of four — count them: four, eight, twelve!', '3 × 4 = 12', { kind: 'array', rows: 3, cols: 4 }),
    ],
    [
      T('Clever trick: three of something is DOUBLE it, plus one more group.', undefined, { kind: 'double', n: 4, hands: true }),
      T('Three times four: double four is eight, add one more four — twelve!', '3 × 4  →  8 + 4  →  12'),
    ],
    [
      T('Count up in threes until you reach the total, counting the jumps on your fingers.', undefined, { kind: 'skip', step: 3, times: 4, hands: true }),
      T('Three, six, nine, twelve — four jumps, so the missing number is four!', '3 × ? = 12  →  4'),
    ],
    [
      T('Three rows of four make twelve…', '3 × 4 = 12', { kind: 'array', rows: 3, cols: 4 }),
      T('…and twelve shared into fours makes three. One array, two facts!', '12 ÷ 4 = 3', { kind: 'array', rows: 3, cols: 4, divide: true }),
    ],
  ],
  castle: [
    [
      T('The elevens have a magic pattern — up to nine, just write the digit TWICE!', '11 × 3 → 33      11 × 4 → 44'),
      T('See the pattern on the line: eleven, twenty-two, thirty-three, forty-four!', '11, 22, 33, 44…', { kind: 'skip', step: 11, times: 4 }),
    ],
    [
      T('Another way: eleven times is TEN times, plus one more group.', '11 × 3  →  30 + 3  →  33'),
      T('Ten times is easy — add a zero — then add the number once more.', '11 × 6  →  60 + 6  →  66'),
    ],
    [
      T('If the total is a doubled digit like fifty-five, the missing number is that digit — five!', '11 × ? = 55  →  5'),
      T('Or count the jumps: how many elevens fit into the total?', undefined, { kind: 'skip', step: 11, times: 4, hands: true }),
    ],
    [
      T('Eleven times four is forty-four, so forty-four shared by eleven is four. Same fact family!', '11 × 4 = 44  →  44 ÷ 11 = 4'),
    ],
  ],
  cavern: [
    [
      T('Dividing means SHARING into equal groups — and every share hides a times fact!', undefined, { kind: 'array', rows: 4, cols: 5, divide: true }),
      T('Twenty shared into rows of five makes four rows — because four fives are twenty!', '20 ÷ 5 = 4    because    5 × 4 = 20', { kind: 'array', rows: 4, cols: 5, divide: true }),
    ],
    [
      T('To solve a divide, ask the TIMES question: what times five makes twenty?', '20 ÷ 5  →  5 × ? = 20  →  4'),
      T('Stuck? Count up in fives to the total, and count the jumps on your fingers.', undefined, { kind: 'skip', step: 5, times: 4, hands: true }),
    ],
    [
      T('Trickier splits, same trick: count up in the group size until you reach the total.', '15 ÷ 3  →  3, 6, 9, 12, 15  →  5', { kind: 'skip', step: 3, times: 5, hands: true }),
    ],
    [
      T('Every fact family has four facts — two times, two sharing. Find the one you already know!', '3 × 4 = 12   4 × 3 = 12   12 ÷ 3 = 4   12 ÷ 4 = 3', { kind: 'array', rows: 3, cols: 4, divide: true }),
    ],
  ],
  tower: [
    [
      T('Time for your best tricks! Tens: pop a zero. Fives: end in five or zero. Twos: just double.', '10×6→60    5×6→30    2×6→12'),
      T('Elevens: write the digit twice, or do ten times plus one more group.', '11 × 6  →  66'),
    ],
    [
      T('Take each one slowly: spot WHICH table it is first, then pick your trick.', undefined, { kind: 'skip', step: 5, times: 4 }),
    ],
    [
      T('Missing number? Turn it into a division — or count up in jumps on your fingers.', '5 × ? = 30  →  30 ÷ 5  →  6', { kind: 'skip', step: 5, times: 6, hands: true }),
    ],
    [
      T('Remember: dividing is just multiplying backwards — you know every fact family!', '4 × 5 = 20  ⇄  20 ÷ 5 = 4', { kind: 'array', rows: 4, cols: 5, divide: true }),
      T('This is it — every trick you’ve learned, for all of Monster Island. Go shine!'),
    ],
  ],
  // ---- early years ---------------------------------------------------------
  // These are the primary lesson before each quiz, so most levels get a short
  // sequence of cards: the idea, a demonstration, then "try it with fingers".
  // The read-aloud voice only speaks `text`, so everything important is said
  // in words there; the `example` line is written reinforcement.
  'count-cove': [
    [
      T('Let’s count the stars together! Touch each one as you say the number: one, two, three, four, five.', undefined, { kind: 'count', to: 5, hands: true }),
      T('The LAST number you say tells you how many there are. Five stars!', '1, 2, 3, 4, 5  →  5 stars', { kind: 'count', to: 5, hands: true }),
    ],
    [
      T('Bigger piles now! Count slowly and touch every star exactly once — don’t skip any, and don’t count one twice.', undefined, { kind: 'count', to: 10, hands: true }),
      T('Ten is special — it fills up BOTH your hands!', 'all 10 fingers  →  10', { kind: 'hands', show: 10, of: 10 }),
    ],
    [
      T('One more just means the very next number you say when you count.', undefined, { kind: 'countOn', from: 4, add: 1, max: 8, hands: true }),
      T('Try it: start at four, hop one step… you land on five!', 'one more than 4  →  5', { kind: 'countOn', from: 4, add: 1, max: 8, hands: true }),
    ],
    [
      T('One less means the number that comes just before.', undefined, { kind: 'countBack', from: 6, sub: 1, max: 8, hands: true }),
      T('Start at six and hop one step back… you land on five!', 'one less than 6  →  5', { kind: 'countBack', from: 6, sub: 1, max: 8, hands: true }),
    ],
  ],
  'bonds-bay': [
    [
      T('Some pairs of numbers are best friends — together they always make TEN!', '1&9   2&8   3&7   4&6   5&5', { kind: 'tenframe', a: 7, b: 3 }),
      T('Watch the frame fill up: seven gold stars, then three blue ones. Seven and three make ten!', '7 + 3 = 10', { kind: 'tenframe', a: 7, b: 3 }),
      T('Your hands know it too! Hold up seven fingers — the fingers still folded down are the three that make ten.', undefined, { kind: 'hands', show: 7, of: 10 }),
    ],
    [
      T('To add, start with the BIGGER number, then count on the smaller one.', undefined, { kind: 'countOn', from: 6, add: 3, max: 10, hands: true }),
      T('Say six… then hop: seven, eight, nine. Put up a finger for each hop!', '6 + 3  →  6… 7, 8, 9  →  9', { kind: 'countOn', from: 6, add: 3, max: 10, hands: true }),
    ],
    [
      T('Some stars are hiding! Start at the number you HAVE, and count on until you reach the total.', undefined, { kind: 'countOn', from: 6, add: 3, max: 10, hands: true }),
      T('Put up a finger for each hop, then count your fingers — that’s how many were hiding!', '6 and how many make 9?  →  3 fingers', { kind: 'countOn', from: 6, add: 3, max: 10, hands: true }),
    ],
    [
      T('You know the trick: start at the number, count on to the total, and keep track on your fingers.', '7 + ? = 10  →  7… 8, 9, 10  →  3', { kind: 'countOn', from: 7, add: 3, max: 10, hands: true }),
      T('Then type how many fingers you’re holding up. You’ve got this!'),
    ],
  ],
  'add-meadow': [
    [
      T('To add two numbers, start with the BIGGER one, then count on the smaller one. It’s much quicker!', undefined, { kind: 'countOn', from: 6, add: 3, max: 10, hands: true }),
      T('Three plus six? Flip it round! Start at six and hop three times: seven, eight, nine.', '3 + 6  →  6… 7, 8, 9  →  9', { kind: 'countOn', from: 6, add: 3, max: 10, hands: true }),
    ],
    [
      T('Bigger sums, same trick: start at the bigger number, and your fingers keep track of the hops.', undefined, { kind: 'countOn', from: 8, add: 5, min: 5, max: 15, hands: true }),
      T('Five plus eight: start at eight… nine, ten, eleven, twelve, thirteen!', '5 + 8  →  13', { kind: 'countOn', from: 8, add: 5, min: 5, max: 15, hands: true }),
    ],
    [
      T('Count on from the bigger number, then type the number you land on.', '9 + 4  →  9… 10, 11, 12, 13  →  13', { kind: 'countOn', from: 9, add: 4, min: 5, max: 15, hands: true }),
    ],
    [
      T('A number is hiding! Start at the number you have, count on to the total, and count your fingers.', '6 + ? = 9  →  6… 7, 8, 9  →  3', { kind: 'countOn', from: 6, add: 3, max: 10, hands: true }),
    ],
  ],
  'sub-trail': [
    [
      T('Taking away means counting BACK. Start at the big number and hop backwards.', undefined, { kind: 'countBack', from: 7, sub: 2, max: 10, hands: true }),
      T('Seven take away two: hop back… six, five. Five left!', '7 − 2  →  5', { kind: 'countBack', from: 7, sub: 2, max: 10, hands: true }),
    ],
    [
      T('Put up a finger for each one you take away — stop when your fingers match the number.', '8 − 3  →  8… 7, 6, 5  →  5', { kind: 'countBack', from: 8, sub: 3, max: 10, hands: true }),
      T('Then type the number you landed on.'),
    ],
    [
      T('Bigger numbers, same trick — count back one hop at a time, nice and slow.', '15 − 3  →  15… 14, 13, 12  →  12', { kind: 'countBack', from: 15, sub: 3, min: 9, max: 16, hands: true }),
    ],
    [
      T('Read the sign first! PLUS means count ON — hop forwards.', '5 + 3  →  5… 6, 7, 8  →  8', { kind: 'countOn', from: 5, add: 3, max: 10, hands: true }),
      T('TAKE-AWAY means count BACK — hop backwards.', '8 − 3  →  8… 7, 6, 5  →  5', { kind: 'countBack', from: 8, sub: 3, max: 10, hands: true }),
    ],
  ],
  'doubles-keep': [
    [
      T('Double means two of the SAME number added together — like looking in a mirror!', undefined, { kind: 'double', n: 4, hands: true }),
      T('Show double four on your hands: four fingers on each hand. Count them all — eight!', 'double 4  →  4 + 4  →  8', { kind: 'double', n: 4, hands: true }),
    ],
    [
      T('Add the number to itself, then type the answer.', 'double 5  →  5 + 5  →  10', { kind: 'double', n: 5, hands: true }),
    ],
    [
      T('Look at the sign! PLUS means hop forwards.', '6 + 2  →  6… 7, 8  →  8', { kind: 'countOn', from: 6, add: 2, max: 10, hands: true }),
      T('TAKE-AWAY means hop backwards.', '9 − 2  →  9… 8, 7  →  7', { kind: 'countBack', from: 9, sub: 2, max: 10, hands: true }),
    ],
    [
      T('Use all your tricks: count ON to add, count BACK to take away, and doubles are two of the same!', undefined, { kind: 'double', n: 3, hands: true }),
      T('You know everything you need. Go and win those stars!'),
    ],
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
