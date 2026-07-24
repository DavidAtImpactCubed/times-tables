// Sanity checks over the question generators.
// Run with `npm run check:questions` (uses node --experimental-strip-types
// so the .ts sources import directly — no build step needed).

import { EARLY_REGIONS, REGIONS } from '../src/data/regions.ts'
import { QUESTIONS_PER_LEVEL, explain, generateLevel, questionText } from '../src/logic/questions.ts'

let checks = 0
let failures = 0
const fail = (msg) => {
  failures++
  console.error(`  ❌ ${msg}`)
}

const EARLY_KINDS = new Set(['count', 'bond', 'add', 'sub', 'double'])
const ROUNDS = 50

// Every wrong-answer explanation must have text, and any visual it picks must
// be mathematically consistent with the question it explains.
function checkExplanation(q) {
  const e = explain(q)
  if (!e.text || typeof e.text !== 'string') fail(`explain(${q.kind}) has no text`)
  const v = e.visual
  if (!v) return
  const id = `${q.kind} ${q.a}/${q.b}/${q.result} (${q.unknown})`
  switch (v.kind) {
    case 'count':
      if (v.to !== (q.count ?? q.result)) fail(`${id}: count visual to=${v.to}`)
      break
    case 'tenframe':
      if (v.a + v.b !== 10) fail(`${id}: tenframe ${v.a}+${v.b} ≠ 10`)
      break
    case 'countOn':
      if (v.from + v.add > (v.max ?? 99)) fail(`${id}: countOn lands past max`)
      if ((v.min ?? 0) > v.from) fail(`${id}: countOn starts before min`)
      break
    case 'countBack':
      if (v.from - v.sub < (v.min ?? 0)) fail(`${id}: countBack lands before min`)
      if (v.from > (v.max ?? 99)) fail(`${id}: countBack starts past max`)
      break
    case 'double':
      if (q.kind === 'add' && q.a === q.b && v.n !== q.a) fail(`${id}: double n=${v.n}`)
      break
    case 'skip':
      if (q.kind === 'mul' && q.unknown === 'result' && v.step * v.times !== q.result)
        fail(`${id}: skip ${v.step}×${v.times} ≠ ${q.result}`)
      if (q.kind === 'div' && q.unknown === 'result' && v.step * v.times !== q.a)
        fail(`${id}: skip ${v.step}×${v.times} ≠ ${q.a}`)
      break
    case 'array': {
      const total = v.rows * v.cols
      const want = q.kind === 'div' ? q.a : q.result
      if (total !== want) fail(`${id}: array ${v.rows}×${v.cols} ≠ ${want}`)
      break
    }
  }
}

function checkCommon(region, level, qs) {
  checks++
  if (qs.length !== QUESTIONS_PER_LEVEL) fail(`${region.id} L${level}: got ${qs.length} questions`)
  for (const q of qs) {
    // The answer must be the value of the unknown slot.
    const slotValue = q.unknown === 'a' ? q.a : q.unknown === 'b' ? q.b : q.result
    if (q.answer !== slotValue) fail(`${region.id}: answer ${q.answer} ≠ unknown slot ${slotValue}`)
    // Display renders exactly one "?" (equation-based questions only).
    if (q.kind !== 'count') {
      const t = questionText(q)
      const qMarks = [t.left, t.right, t.result].filter((x) => x === '?').length
      if (qMarks !== 1) fail(`${region.id}: question shows ${qMarks} unknowns`)
    }
  }
}

// ---- tip lessons: arrays/skip lines must count in a table the region teaches ----
for (const region of REGIONS) {
  region.levels.forEach((lvl, li) => {
    for (const step of lvl.tip ?? []) {
      const v = step.visual
      if (!v) continue
      if (v.kind === 'array' && !region.tables.includes(v.cols))
        fail(`${region.id} L${li} tip array counts in ${v.cols}s — not a table this region teaches`)
      if (v.kind === 'skip' && !region.tables.includes(v.step))
        fail(`${region.id} L${li} tip skip line counts in ${v.step}s — not a table this region teaches`)
    }
  })
}

// ---- main curriculum (times tables & division) ----
for (const region of REGIONS) {
  console.log(`Region ${region.name}`)
  for (let level = 0; level < region.levels.length; level++) {
    for (let round = 0; round < ROUNDS; round++) {
      const qs = generateLevel(region, level)
      checkCommon(region, level, qs)

      const keys = new Set(qs.map((q) => `${q.kind}:${q.a}:${q.b}:${q.unknown}`))
      if (keys.size !== qs.length) fail(`${region.id} L${level}: duplicate questions in one level`)

      for (const q of qs) {
        if (q.kind === 'mul' && q.a * q.b !== q.result) fail(`bad mul fact ${q.a}×${q.b}=${q.result}`)
        if (q.kind === 'div' && (q.a !== q.b * q.result || q.a % q.b !== 0)) fail(`bad div fact ${q.a}÷${q.b}=${q.result}`)

        const factors = q.kind === 'mul' ? [q.a, q.b] : [q.b, q.result]
        if (!factors.some((f) => region.tables.includes(f)))
          fail(`${region.id} L${level}: fact outside region tables: ${q.a} ${q.kind} ${q.b}`)
        if (factors.every((f) => f < 1 || f > 12)) fail(`no factor in 1..12 for ${q.a} ${q.kind} ${q.b}`)

        // Missing-number questions must hide the multiplier, never the table:
        // the child solves them by counting in a table they've been taught.
        if (q.kind === 'mul' && q.unknown !== 'result') {
          const known = q.unknown === 'a' ? q.b : q.a
          if (!region.tables.includes(known))
            fail(`${region.id} L${level}: missing-number leaves untaught ${known}s visible (${questionText(q).left} × ${questionText(q).right})`)
        }
        if (q.kind === 'div' && q.unknown === 'b') fail(`${region.id} L${level}: division hides the divisor`)

        if (q.input === 'choice') {
          if (!q.choices || q.choices.length !== 3) fail('choice question without 3 options')
          else {
            if (!q.choices.includes(q.answer)) fail(`choices ${q.choices} missing answer ${q.answer}`)
            if (new Set(q.choices).size !== 3) fail(`duplicate choices ${q.choices}`)
            if (q.choices.some((c) => c <= 0)) fail(`non-positive choice in ${q.choices}`)
          }
        }

        checkExplanation(q)
      }
    }
    console.log(`  L${level + 1} (${region.levels[level].mode}): ${ROUNDS} rounds ok`)
  }
}

// ---- early-years curriculum (counting, bonds, add, subtract, doubles) ----
for (const region of EARLY_REGIONS) {
  if (!EARLY_KINDS.has(region.kind)) fail(`${region.id}: unexpected kind ${region.kind}`)
  console.log(`Early region ${region.name}`)
  for (let level = 0; level < region.levels.length; level++) {
    for (let round = 0; round < ROUNDS; round++) {
      const qs = generateLevel(region, level)
      checkCommon(region, level, qs)

      for (const q of qs) {
        if (!['add', 'sub', 'count'].includes(q.kind)) fail(`${region.id}: unexpected early kind ${q.kind}`)
        if (q.kind === 'add' && q.a + q.b !== q.result) fail(`bad add fact ${q.a}+${q.b}=${q.result}`)
        if (q.kind === 'sub') {
          if (q.a - q.b !== q.result) fail(`bad sub fact ${q.a}-${q.b}=${q.result}`)
          if (q.result < 0 || q.b < 0) fail(`negative in sub ${q.a}-${q.b}`)
        }
        if (q.kind === 'count' && !(q.count === q.result && q.result === q.answer && q.count >= 1))
          fail(`bad count question count=${q.count} result=${q.result}`)

        // answers stay in a sensible young range
        if (q.answer < 0 || q.answer > 20) fail(`${region.id} L${level}: answer ${q.answer} out of range`)

        // choice questions: 3 distinct options incl. the answer, none negative (0 allowed for take-away)
        if (q.input === 'choice') {
          if (!q.choices || q.choices.length !== 3) fail(`${region.id}: choice without 3 options`)
          else {
            if (!q.choices.includes(q.answer)) fail(`choices ${q.choices} missing answer ${q.answer}`)
            if (new Set(q.choices).size !== 3) fail(`duplicate choices ${q.choices}`)
            if (q.choices.some((c) => c < 0)) fail(`negative choice in ${q.choices}`)
          }
        }

        checkExplanation(q)
      }
    }
    console.log(`  L${level + 1} (${region.levels[level].mode}): ${ROUNDS} rounds ok`)
  }
}

console.log(`\n${checks} level generations checked, ${failures} failure(s).`)
process.exit(failures ? 1 : 0)
