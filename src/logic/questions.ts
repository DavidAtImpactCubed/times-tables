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

const EARLY_KINDS = new Set(['count', 'bond', 'add', 'sub', 'double'])

function generateEarlyLevel(region: Region, level: number): Question[] {
  const mode = region.levels[level].mode
  const N = QUESTIONS_PER_LEVEL

  const factory = (): Question => {
    switch (region.kind) {
      case 'count':
        if (level === 0) return countQuestion(rnd(1, 5), 'choice')
        if (level === 1) return countQuestion(rnd(1, 10), 'choice')
        if (level === 2) return addQuestion(rnd(0, 9), 1, 'result', 'choice') // one more
        return subQuestion(rnd(1, 10), 1, 'result', 'choice') // one less

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
        if (level === 2) {
          if (Math.random() < 0.5) {
            const [a, b] = splitTotal(rnd(4, 20), 12)
            return addQuestion(a, b, 'result', 'choice')
          }
          const a = rnd(4, 20)
          return subQuestion(a, rnd(1, Math.min(a, 12)), 'result', 'choice')
        }
        // star champion: doubles, adding and taking away, typed
        const r = Math.random()
        if (r < 0.34) return doubleQ(rnd(1, 10), 'pad')
        if (r < 0.67) {
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

const qKey = (q: Question) => `${q.kind}:${q.a}:${q.b}:${q.unknown}`

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
    } else {
      // mixed: times facts and their matching division facts
      const ns = multipliers()
      ns.slice(0, 5).forEach((n) => qs.push(mulQuestion(table, n, 'result', 'pad')))
      ns.slice(5, 12).forEach((n) => qs.push(divQuestion(table, n, 'result', 'pad')))
    }
  } else if (region.kind === 'division') {
    const easyTables = [2, 5, 10]
    const trickyTables = [3, 11]
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
  const op = q.kind === 'mul' ? '×' : q.kind === 'div' ? '÷' : q.kind === 'add' ? '+' : '−'
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
    const t = [10, 11, 2, 5, 3].find((k) => a === k || b === k) ?? Math.min(a, b)
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
    return {
      text: `Touch each one as you count — the last number you say is how many. There are ${n}.`,
      visual: { kind: 'count', to: n, hands: n <= 10 },
    }
  }
  if (q.kind === 'add') return explainAdd(q)
  if (q.kind === 'sub') return explainSub(q)
  if (q.kind === 'mul') return explainMul(q)
  return explainDiv(q)
}
