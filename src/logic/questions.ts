import type { Question, Region } from '../types'

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
      // A few "12 ÷ ? = 4" style stretch questions with small numbers.
      ns.slice(7, 12).forEach((n) => qs.push(divQuestion(pick([2, 3, 5]), Math.min(n, 6), 'b', 'choice')))
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
  return {
    left: show('a', q.a),
    op: q.kind === 'mul' ? '×' : '÷',
    right: show('b', q.b),
    result: show('result', q.result),
  }
}

/**
 * Skip-counting explanation shown after a wrong answer, e.g. for 4 × 5:
 * chips [5, 10, 15, 20] and the sentence "4 jumps of 5 makes 20".
 */
export function explain(q: Question): { chips: number[]; text: string } {
  if (q.kind === 'mul') {
    const table = Math.min(q.a, q.b)
    const jumps = Math.max(q.a, q.b)
    const chips = Array.from({ length: jumps }, (_, i) => (i + 1) * table)
    return { chips, text: `${jumps} jumps of ${table} makes ${q.result}. So ${q.a} × ${q.b} = ${q.result}.` }
  }
  const chips = Array.from({ length: q.result }, (_, i) => (i + 1) * q.b)
  return {
    chips,
    text: `Count up in ${q.b}s to reach ${q.a} — that takes ${q.result} jumps. So ${q.a} ÷ ${q.b} = ${q.result}.`,
  }
}
