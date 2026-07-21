// Sanity checks over the question generators.
// Run with `npm run check:questions` (uses node --experimental-strip-types
// so the .ts sources import directly — no build step needed).

import { REGIONS } from '../src/data/regions.ts'
import { QUESTIONS_PER_LEVEL, explain, generateLevel, questionText } from '../src/logic/questions.ts'

let checks = 0
let failures = 0
const fail = (msg) => {
  failures++
  console.error(`  ❌ ${msg}`)
}

const ROUNDS = 50
for (const region of REGIONS) {
  console.log(`Region ${region.name}`)
  for (let level = 0; level < region.levels.length; level++) {
    for (let round = 0; round < ROUNDS; round++) {
      const qs = generateLevel(region, level)
      checks++
      if (qs.length !== QUESTIONS_PER_LEVEL) fail(`${region.id} L${level}: got ${qs.length} questions`)

      const keys = new Set(qs.map((q) => `${q.kind}:${q.a}:${q.b}:${q.unknown}`))
      if (keys.size !== qs.length) fail(`${region.id} L${level}: duplicate questions in one level`)

      for (const q of qs) {
        // The fact itself must be true.
        if (q.kind === 'mul' && q.a * q.b !== q.result) fail(`bad mul fact ${q.a}×${q.b}=${q.result}`)
        if (q.kind === 'div' && (q.a !== q.b * q.result || q.a % q.b !== 0)) fail(`bad div fact ${q.a}÷${q.b}=${q.result}`)

        // The answer must be the value of the unknown slot.
        const slotValue = q.unknown === 'a' ? q.a : q.unknown === 'b' ? q.b : q.result
        if (q.answer !== slotValue) fail(`answer ${q.answer} ≠ unknown slot ${slotValue}`)

        // Facts stay within the region's tables, multipliers within 1..12.
        const factors = q.kind === 'mul' ? [q.a, q.b] : [q.b, q.result]
        if (!factors.some((f) => region.tables.includes(f)))
          fail(`${region.id} L${level}: fact outside region tables: ${q.a} ${q.kind} ${q.b}`)
        if (factors.every((f) => f < 1 || f > 12)) fail(`no factor in 1..12 for ${q.a} ${q.kind} ${q.b}`)

        // Choice questions: 3 distinct positive options including the answer.
        if (q.input === 'choice') {
          if (!q.choices || q.choices.length !== 3) fail('choice question without 3 options')
          else {
            if (!q.choices.includes(q.answer)) fail(`choices ${q.choices} missing answer ${q.answer}`)
            if (new Set(q.choices).size !== 3) fail(`duplicate choices ${q.choices}`)
            if (q.choices.some((c) => c <= 0)) fail(`non-positive choice in ${q.choices}`)
          }
        }

        // Display renders exactly one "?".
        const t = questionText(q)
        const qMarks = [t.left, t.right, t.result].filter((x) => x === '?').length
        if (qMarks !== 1) fail(`question shows ${qMarks} unknowns`)

        // Explanation chips count up to the full product / dividend.
        const e = explain(q)
        if (q.kind === 'mul' && e.chips[e.chips.length - 1] !== q.result)
          fail(`mul chips end on ${e.chips.at(-1)}, want ${q.result}`)
        if (q.kind === 'div' && e.chips[e.chips.length - 1] !== q.a)
          fail(`div chips end on ${e.chips.at(-1)}, want ${q.a}`)
      }
    }
    console.log(`  L${level + 1} (${region.levels[level].mode}): ${ROUNDS} rounds ok`)
  }
}

console.log(`\n${checks} level generations checked, ${failures} failure(s).`)
process.exit(failures ? 1 : 0)
