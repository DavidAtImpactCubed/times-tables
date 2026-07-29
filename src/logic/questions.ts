import type { Question, Region, TipVisual } from '../types'

export const QUESTIONS_PER_LEVEL = 10
const MAX_N = 12

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

/** 3 answer choices: the answer plus two plausible, positive, distinct distractors. */
function makeChoices(answer: number, nearby: number[]): number[] {
  const pool = shuffle(nearby.filter((x) => x > 0 && x !== answer))
  const distractors: number[] = []
  for (const x of pool) {
    if (!distractors.includes(x)) distractors.push(x)
    if (distractors.length === 2) break
  }
  // Extremely defensive: top up if the pool was too small.
  let bump = 1
  while (distractors.length < 2) {
    const x = answer + bump
    if (x > 0 && x !== answer && !distractors.includes(x)) distractors.push(x)
    bump = bump > 0 ? -bump : -bump + 1
  }
  return shuffle([answer, ...distractors])
}

function mulQuestion(table: number, n: number, unknown: Question['unknown'], input: Question['input']): Question {
  // Present facts both ways round: n × table and table × n.
  const flip = Math.random() < 0.5
  const a = flip ? table : n
  const b = flip ? n : table
  // A missing-number question always hides the MULTIPLIER, never the table —
  // "3 × ? = 27" is solved by counting in threes, but "? × 9 = 27" would need
  // the nine times table, which the child hasn't been taught.
  if (unknown !== 'result') unknown = flip ? 'b' : 'a'
  const result = table * n
  const answer = unknown === 'result' ? result : unknown === 'a' ? a : b
  const q: Question = { kind: 'mul', a, b, result, unknown, answer, input }
  if (input === 'choice') {
    q.choices =
      unknown === 'result'
        ? makeChoices(answer, [answer - table, answer + table, answer - n, answer + n, answer + 1, answer - 1])
        : makeChoices(answer, [answer - 1, answer + 1, answer - 2, answer + 2])
  }
  return q
}

function divQuestion(table: number, n: number, unknown: Question['unknown'], input: Question['input']): Question {
  // (table × n) ÷ table = n
  const a = table * n
  const b = table
  const result = n
  const answer = unknown === 'result' ? result : unknown === 'a' ? a : b
  const q: Question = { kind: 'div', a, b, result, unknown, answer, input }
  if (input === 'choice') {
    q.choices =
      unknown === 'a'
        ? makeChoices(answer, [answer - table, answer + table, answer - 1, answer + 1])
        : makeChoices(answer, [answer - 1, answer + 1, answer - 2, answer + 2])
  }
  return q
}

/**
 * Match an array picture to its times fact — or, reversed, a fact to its
 * array. Forward: the screen shows `rows` rows of `cols` stars and the child
 * taps the fact it shows. Reverse: the fact is shown and the choices are
 * three mini arrays. Either way the distractors are neighbouring facts with
 * DISTINCT products, so counting always settles it and the commutative twin
 * can never appear as a distractor.
 */
function matchQuestion(rows: number, cols: number, reverse = false, maxRows = Infinity): Question {
  const result = rows * cols
  const facts: Array<{ r: number; c: number }> = [{ r: rows, c: cols }]
  // Reverse (pick-the-array) distractors vary ONLY the row count, so all
  // three array buttons share a width, stay big, and compare cleanly.
  // maxRows keeps all three on screen together where rows are costly (rods).
  const candidates = shuffle(
    reverse
      ? [
          { r: rows + 1, c: cols },
          { r: rows - 1, c: cols },
          { r: rows + 2, c: cols },
          { r: rows - 2, c: cols },
          { r: rows + 3, c: cols },
        ]
      : [
          { r: rows + 1, c: cols },
          { r: rows - 1, c: cols },
          { r: rows, c: cols + 1 },
          { r: rows, c: cols - 1 },
          { r: rows + 2, c: cols },
          { r: rows, c: cols + 2 },
        ],
  )
  for (const f of candidates) {
    if (facts.length === 3) break
    if (f.r < 1 || f.c < 1 || f.r > maxRows) continue
    if (facts.some((g) => g.r * g.c === f.r * f.c)) continue
    facts.push(f)
  }
  const shuffled = shuffle(facts)
  const q: Question = {
    kind: 'match',
    a: rows,
    b: cols,
    result,
    unknown: 'result',
    answer: result,
    input: 'choice',
    choices: shuffled.map((f) => f.r * f.c),
  }
  // Show the WHOLE fact ("4 × 11 = 44", not just "4 × 11"): every choice
  // carries its own correct product, so nothing is given away, and each
  // question rehearses the complete fact triple.
  if (reverse) {
    q.choiceArrays = shuffled.map((f) => ({ rows: f.r, cols: f.c }))
    q.promptLabel = `${rows} × ${cols} = ${result}`
  } else {
    q.choiceLabels = shuffled.map((f) => `${f.r} × ${f.c} = ${f.r * f.c}`)
  }
  return q
}

/**
 * Early picture-match: a big numeral is shown and read aloud, and the child
 * picks the GROUP with exactly that many objects — numeral→quantity, the
 * reverse of the counting levels. Groups wrap five-per-row so quantities
 * read in the fives structure.
 */
function pickCount(n: number, object: string): Question {
  const choices = makeChoices(n, [n - 1, n + 1, n - 2, n + 2])
  return {
    kind: 'match',
    a: n,
    b: 0,
    result: n,
    unknown: 'result',
    answer: n,
    input: 'choice',
    choices,
    choiceCounts: choices,
    object,
    prompt: `Which picture shows ${n}?`,
    promptLabel: String(n),
  }
}

/** Early compare: three piles — tap the one with more (or fewer). */
function compareQuestion(): Question {
  const more = Math.random() < 0.5
  const counts = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3)
  const answer = more ? Math.max(...counts) : Math.min(...counts)
  const shuffled = shuffle(counts)
  return {
    kind: 'match',
    a: answer,
    b: more ? 1 : 0, // direction in the key, so more/fewer questions stay distinct
    result: answer,
    unknown: 'result',
    answer,
    input: 'choice',
    choices: shuffled,
    choiceCounts: shuffled,
    object: pick(COUNT_OBJECTS),
    prompt: `Which pile has ${more ? 'more' : 'fewer'}?`,
    promptLabel: '', // the prompt says it all — no fact chip needed
  }
}

/**
 * Place-value counting: `n` shown as base-ten rods plus loose ones, so 42
 * reads as "4 tens and 2" — not forty-two loose objects to count. The
 * digit-swap distractor (24 for 42) is the classic teens/tens confusion.
 */
function rodCountQuestion(n: number): Question {
  const tens = Math.floor(n / 10)
  const ones = n % 10
  const swap = ones >= 1 && ones !== tens ? ones * 10 + tens : n + 10
  const q: Question = {
    kind: 'count',
    a: n,
    b: 0,
    result: n,
    unknown: 'result',
    answer: n,
    input: 'choice',
    count: n,
    object: pick(COUNT_OBJECTS),
    rods: true,
  }
  q.choices = makeChoices(n, [swap, n + 10, n - 10, n + 1, n - 1])
  return q
}

/**
 * Whole tens only: rods with no loose ones, so counting IN tens is the whole
 * task. "3 rods = 3" is THE misconception, so 3 is always on offer.
 */
function wholeTensQuestion(): Question {
  const t = rnd(1, 5)
  const n = 10 * t
  const q: Question = {
    kind: 'count',
    a: n,
    b: 0,
    result: n,
    unknown: 'result',
    answer: n,
    input: 'choice',
    count: n,
    object: pick(COUNT_OBJECTS),
    rods: true,
  }
  q.choices = makeChoices(n, [t, n + 10, n - 10])
  return q
}

/** Compare two-digit numerals — tens first! — always including the digit-swap pair. */
function compareNumbersQuestion(): Question {
  const biggest = Math.random() < 0.5
  const t = rnd(2, 7)
  let o = rnd(1, 9)
  if (o === t) o = o === 9 ? 8 : o + 1
  const n = 10 * t + o
  const swap = 10 * o + t
  // a third with the SAME tens, so ties force an ones comparison
  const third = 10 * t + (o >= 5 ? o - rnd(1, 3) : o + rnd(1, 3))
  const choices = shuffle([n, swap, third])
  const answer = biggest ? Math.max(...choices) : Math.min(...choices)
  return {
    kind: 'match',
    a: answer,
    b: biggest ? 3 : 4, // direction in the key, so biggest/smallest stay distinct
    result: answer,
    unknown: 'result',
    answer,
    input: 'choice',
    choices,
    prompt: `Which number is the ${biggest ? 'biggest' : 'smallest'}?`,
    promptLabel: '',
  }
}

/**
 * Visual introduction to halving: the pile is SHOWN, arranged in twos — its
 * two columns are the two monsters' shares — and the child answers in words
 * ("how many each?"), no ÷ symbol yet.
 */
function shareIntroQuestion(): Question {
  const half = rnd(1, 5)
  const n = 2 * half
  return {
    kind: 'match',
    a: n,
    b: 2,
    result: half,
    unknown: 'result',
    answer: half,
    input: 'choice',
    choices: makeChoices(half, [half - 1, half + 1, half + 2, n]),
    count: n,
    object: pick(COUNT_OBJECTS),
    prompt: 'Share them between two monsters — how many each?',
    promptLabel: String(n),
  }
}

/** Odd or even, concretely: which pile can TWO monsters share fairly? */
function shareFairQuestion(): Question {
  const even = 2 * rnd(1, 5)
  const odds = shuffle([1, 3, 5, 7, 9]).slice(0, 2)
  const counts = shuffle([even, ...odds])
  return {
    kind: 'match',
    a: even,
    b: 2,
    result: even,
    unknown: 'result',
    answer: even,
    input: 'choice',
    choices: counts,
    choiceCounts: counts,
    object: pick(COUNT_OBJECTS),
    prompt: 'Which pile can two monsters share fairly?',
    promptLabel: 'EVEN',
  }
}

/** Skip-counting: shows "step, 2·step, …" and asks what comes next. */
function nextInPattern(step: number, shown: number): Question {
  const result = step * (shown + 1)
  return {
    kind: 'match',
    a: step,
    b: shown + 1,
    result,
    unknown: 'result',
    answer: result,
    input: 'choice',
    choices: makeChoices(result, [result - step, result + step, result - 1, result + 1]),
    prompt: 'What comes next?',
    promptLabel: `${Array.from({ length: shown }, (_, i) => (i + 1) * step).join(', ')}, …`,
  }
}

/** Early doubles-match: "Double 4" → pick the picture with two rows of four. */
function pickDouble(k: number): Question {
  const cols: number[] = [k]
  for (const c of shuffle([k - 1, k + 1, k - 2, k + 2])) {
    if (cols.length === 3) break
    if (c >= 1 && !cols.includes(c)) cols.push(c)
  }
  const shuffled = shuffle(cols)
  return {
    kind: 'match',
    a: 2,
    b: k,
    result: 2 * k,
    unknown: 'result',
    answer: 2 * k,
    input: 'choice',
    choices: shuffled.map((c) => 2 * c),
    choiceArrays: shuffled.map((c) => ({ rows: 2, cols: c })),
    prompt: `Which picture shows double ${k}?`,
    promptLabel: `Double ${k}`,
  }
}

// ---- early-years question builders (addition, subtraction, counting) ----

const COUNT_OBJECTS = ['⭐', '🐚', '🌸', '🍎', '🐟', '🎈', '🍄', '🦋', '🌟', '🐚']

const rnd = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))

function addQuestion(a: number, b: number, unknown: Question['unknown'], input: Question['input']): Question {
  const result = a + b
  const answer = unknown === 'result' ? result : unknown === 'a' ? a : b
  const q: Question = { kind: 'add', a, b, result, unknown, answer, input }
  if (input === 'choice') q.choices = makeChoices(answer, [answer - 1, answer + 1, answer - 2, answer + 2, answer + 3])
  return q
}

function subQuestion(a: number, b: number, unknown: Question['unknown'], input: Question['input']): Question {
  // a - b = result, with a >= b >= 0 so the answer is never negative
  const result = a - b
  const answer = unknown === 'result' ? result : unknown === 'a' ? a : b
  const q: Question = { kind: 'sub', a, b, result, unknown, answer, input }
  if (input === 'choice') q.choices = makeChoices(answer, [answer - 1, answer + 1, answer - 2, answer + 2])
  return q
}

function countQuestion(n: number, input: Question['input']): Question {
  const q: Question = {
    kind: 'count',
    a: n,
    b: 0,
    result: n,
    unknown: 'result',
    answer: n,
    input,
    count: n,
    object: pick(COUNT_OBJECTS),
  }
  if (input === 'choice') q.choices = makeChoices(n, [n - 1, n + 1, n - 2, n + 2])
  return q
}

/** Split a total into two positive parts a + b = total. */
function splitTotal(total: number, maxPart = 12): [number, number] {
  const lo = Math.max(1, total - maxPart)
  const hi = Math.min(total - 1, maxPart)
  const a = rnd(lo, hi)
  return [a, total - a]
}

/**
 * Build `n` questions from a factory. Uses only distinct questions when the
 * factory can produce at least `n` of them; if its pool is smaller (e.g. "count
 * to 5"), it tops up with repeats but never places the same question twice in a
 * row.
 */
function fill(n: number, factory: () => Question): Question[] {
  const out: Question[] = []
  const seen = new Set<string>()
  let guard = 0
  // first, gather as many distinct questions as we can
  while (out.length < n && guard++ < 1000) {
    const q = factory()
    const k = qKey(q)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(q)
  }
  // small pool: top up with repeats, just not back-to-back
  guard = 0
  while (out.length < n && guard++ < 1000) {
    const q = factory()
    if (out.length && qKey(q) === qKey(out[out.length - 1])) continue
    out.push(q)
  }
  // shuffle, then repair any accidental back-to-back duplicates
  const arr = shuffle(out)
  for (let i = 1; i < arr.length; i++) {
    if (qKey(arr[i]) !== qKey(arr[i - 1])) continue
    for (let j = i + 1; j < arr.length; j++) {
      if (qKey(arr[j]) !== qKey(arr[i]) && qKey(arr[j]) !== qKey(arr[i - 1])) {
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
        break
      }
    }
  }
  return arr
}

const EARLY_KINDS = new Set(['count', 'bond', 'add', 'sub', 'double', 'place', 'half', 'pattern'])

function generateEarlyLevel(region: Region, level: number): Question[] {
  const mode = region.levels[level].mode
  const N = QUESTIONS_PER_LEVEL

  const factory = (): Question => {
    switch (region.kind) {
      case 'count':
        if (level === 0) return countQuestion(rnd(1, 5), 'choice')
        if (level === 1) return countQuestion(rnd(1, 10), 'choice')
        if (level === 2) return pickCount(rnd(2, 9), pick(COUNT_OBJECTS)) // find the number
        if (level === 3) return compareQuestion() // who has more / fewer?
        if (level === 4) return addQuestion(rnd(0, 9), 1, 'result', 'choice') // one more
        return subQuestion(rnd(1, 10), 1, 'result', 'choice') // one less

      case 'place': {
        // a gentle ladder: teens → the second rod → counting whole rods in
        // tens → a few loose ones to count on → the full range with digit
        // swaps → comparing numerals → one more/one less
        if (level === 0) return rodCountQuestion(rnd(11, 15))
        if (level === 1) return rodCountQuestion(rnd(14, 24))
        if (level === 2) return wholeTensQuestion()
        if (level === 3) return rodCountQuestion(10 * rnd(2, 5) + rnd(1, 4)) // few ones: tens, then count on
        if (level === 4) return rodCountQuestion(rnd(21, 79)) // giant crates, digit-swap traps
        if (level === 5) return compareNumbersQuestion()
        // one more / one less with bigger numbers
        const n = rnd(10, 49)
        return Math.random() < 0.5 ? addQuestion(n, 1, 'result', 'choice') : subQuestion(n + 1, 1, 'result', 'choice')
      }

      case 'half': {
        if (level === 0) return shareIntroQuestion() // visual introduction, no ÷ yet
        if (level === 1) return divQuestion(2, rnd(2, 10), 'result', 'choice') // half of evens to 20
        if (level === 2) return shareFairQuestion() // odd or even?
        if (level === 3) return divQuestion(4, rnd(1, 5), 'result', 'choice') // quarters (half of half)
        // double or half?
        return Math.random() < 0.5 ? doubleQ(rnd(1, 10), 'choice') : divQuestion(2, rnd(1, 10), 'result', 'choice')
      }

      case 'pattern': {
        if (level === 0) return nextInPattern(2, rnd(2, 5)) // count in 2s
        if (level === 1) return nextInPattern(10, rnd(2, 8)) // count in 10s
        if (level === 2) return nextInPattern(5, rnd(2, 8)) // count in 5s
        // star champion: a little of everything the island taught
        const r = Math.random()
        if (r < 0.2) return doubleQ(rnd(1, 10), 'choice')
        if (r < 0.4) return divQuestion(2, rnd(1, 8), 'result', 'choice')
        if (r < 0.6) {
          const [a, b] = splitTotal(rnd(4, 20), 12)
          return addQuestion(a, b, 'result', 'pad')
        }
        if (r < 0.8) {
          const a = rnd(4, 20)
          return subQuestion(a, rnd(1, Math.min(a, 12)), 'result', 'pad')
        }
        return nextInPattern(pick([2, 5, 10]), rnd(2, 6))
      }

      case 'bond': {
        // Progression: make ten → add up to ten → find the missing number within ten.
        if (level === 0) {
          const a = rnd(1, 9)
          return addQuestion(a, 10 - a, 'b', 'choice') // a + ? = 10 (the pairs that make ten)
        }
        if (level === 1) {
          const [a, b] = splitTotal(rnd(2, 10), 9)
          return addQuestion(a, b, 'result', 'choice') // a + b = ? up to ten
        }
        if (level === 2) {
          const c = rnd(2, 10)
          const a = rnd(1, c - 1)
          return addQuestion(a, c - a, 'b', 'choice') // a + ? = c within ten
        }
        const c = rnd(2, 10)
        const a = rnd(1, c - 1)
        return addQuestion(a, c - a, 'b', 'pad') // missing number, typed
      }

      case 'add': {
        if (level === 0) {
          const [a, b] = splitTotal(rnd(2, 10), 9)
          return addQuestion(a, b, 'result', 'choice')
        }
        if (level === 1) {
          const [a, b] = splitTotal(rnd(6, 20), 12)
          return addQuestion(a, b, 'result', 'choice')
        }
        if (level === 2) {
          const [a, b] = splitTotal(rnd(6, 20), 12)
          return addQuestion(a, b, 'result', 'pad')
        }
        const a = rnd(1, 9)
        const b = rnd(1, 9)
        return addQuestion(a, b, 'b', 'choice') // a + ? = total
      }

      case 'sub': {
        if (level === 0) {
          const a = rnd(2, 10)
          return subQuestion(a, rnd(1, a), 'result', 'choice')
        }
        if (level === 1) {
          const a = rnd(2, 10)
          return subQuestion(a, rnd(1, a), 'result', 'pad')
        }
        if (level === 2) {
          const a = rnd(6, 20)
          return subQuestion(a, rnd(1, Math.min(a, 12)), 'result', 'choice')
        }
        // mixed add & take away within 20
        if (Math.random() < 0.5) {
          const [a, b] = splitTotal(rnd(4, 20), 12)
          return addQuestion(a, b, 'result', 'choice')
        }
        const a = rnd(4, 20)
        return subQuestion(a, rnd(1, Math.min(a, 12)), 'result', 'choice')
      }

      case 'double':
      default: {
        if (level === 0) return doubleQ(rnd(1, 10), 'choice')
        if (level === 1) return doubleQ(rnd(1, 10), 'pad')
        if (level === 2) return pickDouble(rnd(2, 5)) // match the doubles
        if (level === 3) {
          // near doubles: neighbour numbers, solved by doubling the smaller
          const n = rnd(2, 9)
          return Math.random() < 0.5
            ? addQuestion(n, n + 1, 'result', 'choice')
            : addQuestion(n + 1, n, 'result', 'choice')
        }
        // keep champion: spot-your-trick — doubles and near doubles mixed
        // with plain adding/taking away, so the child must NOTICE when
        // doubling applies rather than double everything
        const r = Math.random()
        if (r < 0.3) return doubleQ(rnd(1, 10), 'pad')
        if (r < 0.55) {
          const n = rnd(2, 9)
          return Math.random() < 0.5
            ? addQuestion(n, n + 1, 'result', 'choice')
            : addQuestion(n + 1, n, 'result', 'choice')
        }
        if (r < 0.8) {
          const [a, b] = splitTotal(rnd(4, 20), 12)
          return addQuestion(a, b, 'result', 'pad')
        }
        const a = rnd(4, 20)
        return subQuestion(a, rnd(1, Math.min(a, 12)), 'result', 'pad')
      }
    }
  }

  void mode
  return fill(N, factory)
}

/** Double a number, shown as n + n = ? */
function doubleQ(n: number, input: Question['input']): Question {
  return addQuestion(n, n, 'result', input)
}

const qKey = (q: Question) => `${q.kind}${q.choiceArrays ? '~' : ''}:${q.a}:${q.b}:${q.unknown}`

/** Take up to `count` questions with distinct keys. */
function takeDistinct(qs: Question[], count: number): Question[] {
  const seen = new Set<string>()
  const out: Question[] = []
  for (const q of qs) {
    const k = qKey(q)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(q)
    if (out.length === count) break
  }
  return out
}

/** ns 1..max shuffled — one question per multiplier so a level never repeats a fact. */
const multipliers = (max = MAX_N) => shuffle(Array.from({ length: max }, (_, i) => i + 1))

export function generateLevel(region: Region, level: number): Question[] {
  if (EARLY_KINDS.has(region.kind)) return generateEarlyLevel(region, level)

  const mode = region.levels[level].mode
  const qs: Question[] = []

  if (region.kind === 'times') {
    const table = region.tables[0]
    if (mode === 'choice') {
      // Gentle start: smaller multipliers first, multiple choice.
      const ns = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      for (const n of ns) qs.push(mulQuestion(table, n, 'result', 'choice'))
    } else if (mode === 'type') {
      for (const n of multipliers()) qs.push(mulQuestion(table, n, 'result', 'pad'))
    } else if (mode === 'missing') {
      for (const n of multipliers()) qs.push(mulQuestion(table, n, pick(['a', 'b']), 'choice'))
    } else if (mode === 'match') {
      // both directions and both orientations: read an array as a fact, and
      // pick the array a fact describes
      if (table === 10 || table === 11) {
        // tens and elevens always sit rows-of-the-table, so every row renders
        // as a base-ten rod (elevens add one loose unit per row). A tall rod
        // stack is fine as the ONE question array, but the three
        // pick-the-array buttons must all fit on screen together — so reverse
        // facts stay small and their distractors are capped at 5 rods.
        for (const n of shuffle([2, 3, 4, 5, 6, 7, 8, 9])) qs.push(matchQuestion(n, table, false))
        for (const n of shuffle([2, 3, 4])) qs.push(matchQuestion(n, table, true, 5))
      } else {
        for (const n of shuffle([2, 3, 4, 5, 6, 7])) {
          const flip = Math.random() < 0.5
          qs.push(matchQuestion(flip ? table : n, flip ? n : table, false))
          // reverse arrays sit few-rows-of-many so the choice buttons stay wide and shallow
          qs.push(matchQuestion(Math.min(table, n), Math.max(table, n), true))
        }
      }
    } else {
      // mixed: times facts and their matching division facts
      const ns = multipliers()
      ns.slice(0, 5).forEach((n) => qs.push(mulQuestion(table, n, 'result', 'pad')))
      ns.slice(5, 12).forEach((n) => qs.push(divQuestion(table, n, 'result', 'pad')))
    }
  } else if (region.kind === 'division') {
    const easyTables = [2, 5, 10]
    const trickyTables = [3, 4, 11]
    if (mode === 'choice' || mode === 'type') {
      const input = mode === 'choice' ? 'choice' : 'pad'
      for (const n of multipliers()) qs.push(divQuestion(pick(easyTables), n, 'result', input))
    } else if (mode === 'missing') {
      for (const n of multipliers()) qs.push(divQuestion(pick(trickyTables), n, 'result', 'choice'))
    } else {
      const ns = multipliers()
      ns.slice(0, 7).forEach((n) => qs.push(divQuestion(pick(region.tables), n, 'result', 'pad')))
      // A few "? ÷ 3 = 4" style stretch questions with small numbers. (The
      // divisor is never hidden — "12 ÷ ? = 4" would need an untaught table.)
      ns.slice(7, 12).forEach((n) => qs.push(divQuestion(pick([2, 3, 5]), Math.min(n, 6), 'a', 'choice')))
    }
  } else {
    // Goblin's Tower: everything mixed.
    const tables = region.tables
    if (mode === 'choice') {
      const ns = shuffle([1, 2, 3, 4, 5, 6, 7, 8])
      for (const n of ns.concat(ns)) qs.push(mulQuestion(pick(tables), n, 'result', 'choice'))
    } else if (mode === 'type') {
      for (const n of multipliers().concat(multipliers())) qs.push(mulQuestion(pick(tables), n, 'result', 'pad'))
    } else if (mode === 'missing') {
      for (const n of multipliers().concat(multipliers()))
        qs.push(mulQuestion(pick(tables), n, pick(['a', 'b']), 'choice'))
    } else {
      const ns = multipliers().concat(multipliers())
      ns.slice(0, 8).forEach((n) => qs.push(mulQuestion(pick(tables), n, 'result', 'pad')))
      ns.slice(8, 16).forEach((n) => qs.push(divQuestion(pick(tables), n, 'result', 'pad')))
      ns.slice(16, 24).forEach((n) => qs.push(mulQuestion(pick(tables), n, pick(['a', 'b']), 'choice')))
    }
  }

  const distinct = takeDistinct(shuffle(qs), QUESTIONS_PER_LEVEL)
  // Top up in the unlikely case random picks collided too often.
  let guard = 0
  while (distinct.length < QUESTIONS_PER_LEVEL && guard++ < 100) {
    const table = pick(region.tables)
    const n = 1 + Math.floor(Math.random() * MAX_N)
    const q =
      region.kind === 'division' ? divQuestion(table, n, 'result', 'pad') : mulQuestion(table, n, 'result', 'pad')
    if (!distinct.some((d) => qKey(d) === qKey(q))) distinct.push(q)
  }
  return distinct
}

/** Human-readable question, with the unknown slot rendered as "?" (used by display + tests). */
export function questionText(q: Question): { left: string; op: string; right: string; result: string } {
  const show = (slot: Question['unknown'], value: number) => (q.unknown === slot ? '?' : String(value))
  const op = q.kind === 'mul' || q.kind === 'match' ? '×' : q.kind === 'div' ? '÷' : q.kind === 'add' ? '+' : '−'
  return {
    left: show('a', q.a),
    op,
    right: show('b', q.b),
    result: show('result', q.result),
  }
}

/** A natural-language reading of a question, for the read-aloud voice. */
export function spokenQuestion(q: Question): string {
  if (q.kind === 'count') return 'How many?'
  if (q.kind === 'match') {
    if (q.prompt) return q.prompt
    return q.choiceArrays
      ? `Which array shows ${q.a} times ${q.b} equals ${q.result}?`
      : 'Which times fact does this array show?'
  }
  const op = q.kind === 'mul' ? 'times' : q.kind === 'div' ? 'divided by' : q.kind === 'add' ? 'plus' : 'take away'
  if (q.unknown === 'result') return `What is ${q.a} ${op} ${q.b}?`
  if (q.unknown === 'b') return `${q.a} ${op} what makes ${q.result}?`
  return `What ${op} ${q.b} makes ${q.result}?`
}

/**
 * Skip-counting explanation shown after a wrong answer, e.g. for 4 × 5:
 * chips [5, 10, 15, 20] and the sentence "4 jumps of 5 makes 20".
 */
// ---------------------------------------------------------------------------
// Wrong-answer explanations. Instead of one generic message, pick the BEST
// strategy for this exact question — the same tricks Olivia teaches in the
// tips — and use the question the child just got wrong as the worked example.
// Visuals reuse the tip illustrations (skip lines, arrays, ten-frames, hands).
// ---------------------------------------------------------------------------

export interface Explanation {
  text: string
  visual?: TipVisual
  /** what to call the answer in "The answer is …" (defaults to the number) */
  answerLabel?: string
}

const groups = (k: number, n: number) => (n === 1 ? `one more ${k}` : `${n} more ${k}s`)

/** Window a count-on/count-back line so big numbers stay readable. */
const onWindow = (from: number, add: number) => {
  const total = from + add
  return total <= 10 ? { min: 0, max: 10 } : { min: from - 1, max: total + 1 }
}
const backWindow = (from: number, sub: number) => {
  const result = from - sub
  return from <= 10 ? { min: 0, max: 10 } : { min: result - 1, max: from + 1 }
}

function explainAdd(q: Question): Explanation {
  const { a, b, result, unknown, answer } = q
  if (unknown === 'result') {
    if (a === b) {
      return {
        text: `Double ${a}! ${a} plus ${a} makes ${result}.`,
        visual: a <= 6 ? { kind: 'double', n: a, hands: a <= 5 } : undefined,
      }
    }
    if (result === 10) {
      return {
        text: `${a} and ${b} are a make-ten pair — they always make ten together!`,
        visual: { kind: 'tenframe', a, b },
      }
    }
    if (Math.abs(a - b) === 1) {
      const small = Math.min(a, b)
      return {
        text: `Neighbour numbers — use a NEAR DOUBLE! Double ${small} is ${2 * small}, then one more makes ${result}.`,
        visual: small <= 6 ? { kind: 'double', n: small, hands: small <= 5 } : undefined,
      }
    }
    const from = Math.max(a, b)
    const add = Math.min(a, b)
    return {
      text: `Start at the bigger number, ${from}, and count on ${add}: you reach ${result}.`,
      visual: { kind: 'countOn', from, add, ...onWindow(from, add), hands: true },
    }
  }
  // missing addend: count on from what you have, keeping track on fingers
  const known = unknown === 'a' ? b : a
  if (result === 10) {
    return {
      text: `${known} and ${answer} make ten — one of the special pairs!`,
      visual: { kind: 'tenframe', a: known, b: answer },
    }
  }
  return {
    text: `Start at ${known} and count on to ${result}, putting up a finger each time: ${answer} fingers.`,
    visual: { kind: 'countOn', from: known, add: answer, ...onWindow(known, answer), hands: true },
  }
}

function explainSub(q: Question): Explanation {
  const { a, b, result, unknown, answer } = q
  if (unknown === 'result') {
    return {
      text: `Start at ${a} and count back ${b}: you land on ${result}.`,
      visual: { kind: 'countBack', from: a, sub: b, ...backWindow(a, b), hands: true },
    }
  }
  if (unknown === 'b') {
    return {
      text: `Count on from ${result} up to ${a} — that takes ${answer} hops.`,
      visual: { kind: 'countOn', from: result, add: answer, ...onWindow(result, answer), hands: true },
    }
  }
  return {
    text: `Put the ${b} back: ${result} plus ${b} is ${answer}.`,
    visual: { kind: 'countOn', from: result, add: b, ...onWindow(result, b), hands: true },
  }
}

/** The five-and-ten anchor, in words: 27 is "ten threes, take one three away". */
function anchorText(k: number, m: number, total: number): string {
  if (m === 9) return `Ten ${k}s are ${10 * k}; take one ${k} away — ${total}.`
  if (m === 10) return `Ten ${k}s are exactly ${total} — ten!`
  if (m === 11) return `Ten ${k}s are ${10 * k}; add one more ${k} — ${total}.`
  if (m === 12) return `Ten ${k}s are ${10 * k}; add two more ${k}s — ${total}.`
  return `Five ${k}s are ${5 * k}; keep counting in ${k}s up to ${total}.`
}

function explainMul(q: Question): Explanation {
  const { a, b, result, unknown, answer } = q
  if (unknown === 'result') {
    // pick the trick operand: easiest table wins
    const t = [10, 11, 2, 5, 3, 4].find((k) => a === k || b === k) ?? Math.min(a, b)
    const n = a === t ? b : a
    if (t === 10) {
      return {
        text: `Times ten? Pop a zero on the end of ${n}: ${result}!`,
        visual: n <= 5 ? { kind: 'skip', step: 10, times: n } : undefined,
      }
    }
    if (t === 11) {
      if (n <= 9) return { text: `Eleven magic: write ${n} twice — ${result}!` }
      return { text: `Eleven ${n}s: ten ${n}s are ${10 * n}, plus one more ${n} — ${result}.` }
    }
    if (t === 2) {
      return {
        text: `Two times ${n} is double ${n}: ${n} plus ${n} is ${result}.`,
        visual: n <= 6 ? { kind: 'double', n, hands: n <= 5 } : undefined,
      }
    }
    if (t === 5) {
      if (n <= 6) {
        const seq = Array.from({ length: n }, (_, i) => (i + 1) * 5).join(', ')
        return { text: `Count up in fives: ${seq}. ${n} jumps lands on ${result}.`, visual: { kind: 'skip', step: 5, times: n } }
      }
      return { text: `Five is HALF of ten: ten ${n}s are ${10 * n}, and half of that is ${result}.` }
    }
    if (t === 4) {
      return {
        text: `Four ${n}s: double ${n} is ${2 * n}, then double AGAIN — ${result}!`,
        visual: n <= 6 ? { kind: 'doubleDouble', n } : undefined,
      }
    }
    // threes: skip-count small ones, anchor the big ones on easy multiples
    if (n <= 5) {
      const seq = Array.from({ length: n }, (_, i) => (i + 1) * 3).join(', ')
      return { text: `Count up in threes: ${seq}. So ${result}.`, visual: { kind: 'array', rows: n, cols: 3 } }
    }
    if (n <= 7) {
      return {
        text: `Five threes are 15 — add ${groups(3, n - 5)}: ${result}.`,
        visual: { kind: 'array', rows: n, cols: 3, split: 5 },
      }
    }
    if (n === 8) return { text: `Double ${n} is ${2 * n}, plus one more ${n}: ${result}.` }
    return { text: anchorText(3, n, result) }
  }
  // missing number: how many jumps of the known table reach the total?
  const k = unknown === 'a' ? b : a
  if (k === 10) return { text: `Take the zero off ${result}: ${answer}!` }
  if (k === 11 && answer <= 9) return { text: `${result} is just ${answer} written twice — so ${answer}.` }
  if (answer <= 6) {
    return {
      text: `Count up in ${k}s until you reach ${result}: ${answer} jumps.`,
      visual: { kind: 'skip', step: k, times: answer, hands: true },
    }
  }
  return { text: anchorText(k, answer, result) }
}

function explainDiv(q: Question): Explanation {
  const { a, b, result, unknown, answer } = q
  if (unknown === 'result') {
    if (b === 10) return { text: `Dividing by ten? Take the zero off ${a}: ${result}.` }
    if (b === 11 && result <= 9) return { text: `${a} is ${result} written twice, so ${a} ÷ 11 = ${result}.` }
    if (b === 2) {
      return {
        text: `Half of ${a} is ${result} — because double ${result} makes ${a}.`,
        visual: result <= 6 ? { kind: 'double', n: result, hands: result <= 5 } : undefined,
      }
    }
    if (b === 4) {
      return { text: `Divide by four by halving TWICE: half of ${a} is ${a / 2}, half again is ${result}.` }
    }
    if (result <= 6) {
      return {
        text: `Ask the times question: what times ${b} makes ${a}? Count up in ${b}s: ${result} jumps.`,
        visual: { kind: 'skip', step: b, times: result, hands: true },
      }
    }
    return { text: anchorText(b, result, a) }
  }
  if (unknown === 'a') {
    return {
      text: `A times fact is hiding here: ${b} × ${result} = ${answer}.`,
      visual: b <= 5 && result <= 5 ? { kind: 'array', rows: result, cols: b, divide: true } : undefined,
    }
  }
  return { text: `Ask: what times ${result} makes ${a}? ${answer}!` }
}

export function explain(q: Question): Explanation {
  if (q.kind === 'count') {
    const n = q.count ?? q.result
    if (n > 10) {
      const tens = Math.floor(n / 10)
      const ones = n % 10
      return {
        text:
          ones === 0
            ? `Each rod is one whole ten — no counting needed! ${tens} tens make ${n}.`
            : `Each rod is one whole ten. ${tens} ${tens === 1 ? 'ten' : 'tens'} and ${ones} more make ${n}.`,
      }
    }
    return {
      text: `Touch each one as you count — the last number you say is how many. There are ${n}.`,
      visual: { kind: 'count', to: n, hands: n <= 10 },
    }
  }
  if (q.kind === 'add') return explainAdd(q)
  if (q.kind === 'sub') return explainSub(q)
  if (q.kind === 'match') {
    if (q.prompt === 'What comes next?') {
      const seq = Array.from({ length: q.b - 1 }, (_, i) => (i + 1) * q.a).join(', ')
      return {
        text: `Count up in ${q.a}s: ${seq} — one more jump of ${q.a} lands on ${q.result}!`,
        visual: { kind: 'skip', step: q.a, times: q.b, hands: q.b <= 10 },
      }
    }
    if (q.prompt?.startsWith('Share them')) {
      return {
        answerLabel: `${q.result} each`,
        text: `One for you, one for me! ${q.a} shared between two monsters is ${q.result} each — because ${q.result} and ${q.result} make ${q.a}.`,
        visual: { kind: 'double', n: q.result, hands: q.result <= 5 },
      }
    }
    if (q.promptLabel === 'EVEN') {
      return {
        text: `Pair them up! An EVEN pile shares fairly — ${q.result} splits into ${q.result / 2} and ${q.result / 2} with none left over. Odd piles always leave one out.`,
        visual: { kind: 'double', n: q.result / 2, hands: q.result <= 10 },
      }
    }
    if (q.prompt?.startsWith('Which pile has ')) {
      const want = q.prompt.includes('more') ? 'biggest' : 'smallest'
      return {
        text: `Count each pile, one at a time, and compare. The ${want} pile has ${q.result} — that's the one!`,
        visual: { kind: 'count', to: q.result, hands: q.result <= 10 },
      }
    }
    if (q.prompt?.startsWith('Which number is the ')) {
      const biggest = q.prompt.includes('biggest')
      return {
        text: `Compare the TENS first — more tens means a bigger number. If the tens match, compare the ones. The ${
          biggest ? 'biggest' : 'smallest'
        } here is ${q.result}: ${Math.floor(q.result / 10)} tens and ${q.result % 10}.`,
      }
    }
    if (q.choiceCounts) {
      return {
        text: `Touch and count each picture, one at a time — the one with exactly ${q.result} is the match!`,
        visual: { kind: 'count', to: q.result, hands: q.result <= 10 },
      }
    }
    if (q.promptLabel?.startsWith('Double')) {
      return {
        answerLabel: `2 rows of ${q.b}`,
        text: `Double ${q.b} means TWO rows of ${q.b} — count them: ${q.b} and ${q.b} make ${q.result}.`,
        visual: { kind: 'double', n: q.b, hands: q.b <= 5 },
      }
    }
    if (q.choiceArrays) {
      return {
        answerLabel: `${q.a} rows of ${q.b}`,
        text: `You were looking for ${q.a} rows of ${q.b}. Count the ROWS in each picture — the right one has ${q.a} rows, with ${q.b} in every row.`,
        visual: { kind: 'array', rows: q.a, cols: q.b },
      }
    }
    if (q.b === 11) {
      return {
        answerLabel: `${q.a} × 11 = ${q.result}`,
        text: `Each row is a full ten and one more. ${q.a} rows makes ${q.a} tens and ${q.a} ones — ${q.result}. The ${q.a} appears twice!`,
        visual: { kind: 'array', rows: q.a, cols: 11 },
      }
    }
    const seq = Array.from({ length: q.a }, (_, i) => (i + 1) * q.b).join(', ')
    return {
      answerLabel: `${q.a} × ${q.b} = ${q.result}`,
      text: `The array has ${q.a} rows with ${q.b} in each row. Count up in ${q.b}s, once for each row: ${seq}. That's ${q.a} × ${q.b} = ${q.result}.`,
      visual: { kind: 'array', rows: q.a, cols: q.b },
    }
  }
  if (q.kind === 'mul') return explainMul(q)
  return explainDiv(q)
}
