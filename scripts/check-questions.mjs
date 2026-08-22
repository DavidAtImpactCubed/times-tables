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

const EARLY_KINDS = new Set(['count', 'bond', 'add', 'sub', 'double', 'place', 'half', 'pattern'])
const ROUNDS = 50

// Every wrong-answer explanation must have text, and any visual it picks must
// be mathematically consistent with the question it explains.
function checkExplanation(q, step = 1) {
  const e = explain(q, step)
  if (!e.text || typeof e.text !== 'string') fail(`explain(${q.kind}, step ${step}) has no text`)
  // a two-part question's second explanation must state its own answer
  if (step === 2) {
    if (!e.text.includes(String(q.step2.answer)))
      fail(`step 2 explanation never states the answer ${q.step2.answer}`)
    const v2 = e.visual
    const eq = q.step2.equation
    if (v2?.kind === 'array' && eq) {
      // the array must draw the fact being ASKED, not part one's
      const product = eq.kind === 'div' ? eq.a : eq.result
      if (v2.rows * v2.cols !== product) fail(`step 2 array ${v2.rows}×${v2.cols} ≠ ${product}`)
      if (v2.split != null && v2.split >= v2.rows) fail(`step 2 split ${v2.split} ≥ rows ${v2.rows}`)
    }
    return
  }
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
      if (q.kind === 'add' && Math.abs(q.a - q.b) === 1 && v.n !== Math.min(q.a, q.b))
        fail(`${id}: near-double n=${v.n} ≠ smaller of ${q.a}+${q.b}`)
      break
    case 'doubleDouble':
      if (q.kind === 'mul' && q.unknown === 'result' && 4 * v.n !== q.result)
        fail(`${id}: double-double 4×${v.n} ≠ ${q.result}`)
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

// ---- two-part questions: part two must stand on what part one established ----
function checkStep2(region, q) {
  const s2 = q.step2
  if (!s2) return
  if (!s2.prompt || !s2.label) fail(`${region.id}: step 2 without a prompt/label`)
  if (!s2.choices || s2.choices.length !== 3) fail(`${region.id}: step 2 without 3 options`)
  else {
    if (!s2.choices.includes(s2.answer)) fail(`step 2 choices ${s2.choices} missing answer ${s2.answer}`)
    if (new Set(s2.choices).size !== 3) fail(`duplicate step 2 choices ${s2.choices}`)
    if (s2.choices.some((c) => c <= 0)) fail(`non-positive step 2 choice in ${s2.choices}`)
  }
  const e = s2.equation
  if (e) {
    if (e.kind === 'div' && e.a !== e.b * e.result) fail(`bad step 2 fact ${e.a}\u00f7${e.b}=${e.result}`)
    if (e.kind === 'mul' && e.a * e.b !== e.result) fail(`bad step 2 fact ${e.a}\u00d7${e.b}=${e.result}`)
    if (e.kind === 'div' && e.unknown === 'b') fail(`${region.id}: step 2 division hides the divisor`)
    const slot = e.unknown === 'a' ? e.a : e.unknown === 'b' ? e.b : e.result
    if (slot !== s2.answer) fail(`step 2 answer ${s2.answer} \u2260 its unknown slot ${slot}`)
    const family = (k, a, b, r) => (k === 'div' ? [b, r, a] : [a, b, r])
    const [x1, y1, p1] = family(q.kind, q.a, q.b, q.result)
    const [x2, y2, p2] = family(e.kind, e.a, e.b, e.result)
    if (s2.relation === 'anchor') {
      // anchors hop from an easy multiple to a NEARBY fact in the same table
      const shared = [x1, y1].filter((f) => f === x2 || f === y2)
      if (!shared.length) fail(`${region.id}: anchor hop changes table (${x1}\u00b7${y1} \u2192 ${x2}\u00b7${y2})`)
      else {
        const t = shared[0]
        const from = x1 === t ? y1 : x1
        const to = x2 === t ? y2 : x2
        if (![5, 10].includes(from)) fail(`${region.id}: anchor ${from} is not a \u00d75 or \u00d710 fact`)
        if (from === to) fail(`${region.id}: anchor hop goes nowhere (${from} \u2192 ${to})`)
        if (Math.abs(to - from) > 3) fail(`${region.id}: anchor hop of ${Math.abs(to - from)} is too far`)
        if (!region.tables.includes(t)) fail(`${region.id}: anchor table ${t} is not taught here`)
        // no hopping to a fact that's already easy: eleven times a single
        // digit is the digit written twice
        if ((t === 11 && to <= 9) || (to === 11 && t <= 9))
          fail(`${region.id}: anchor hop reaches ${t} \u00d7 ${to}, already easy via the elevens trick`)
      }
    } else if (s2.relation === 'halve') {
      // quarters: the same total, halved and then quartered
      if (q.kind !== 'div' || e.kind !== 'div' || e.a !== q.a || q.b !== 2 || e.b !== 4)
        fail(`${region.id}: halve step 2 is not half-then-quarter (${q.a}\u00f7${q.b} \u2192 ${e.a}\u00f7${e.b})`)
      else if (e.result * 2 !== q.result) fail(`${region.id}: quarter ${e.result} is not half of ${q.result}`)
    } else if (p1 !== p2 || [x1, y1].sort((m, n) => m - n).join() !== [x2, y2].sort((m, n) => m - n).join())
      fail(`${region.id}: step 2 leaves part one's fact family (${x1}\u00b7${y1}=${p1} \u2192 ${x2}\u00b7${y2}=${p2})`)
  } else {
    // division arrays: the label is the calculation part one identified
    if (s2.label !== `${q.result} \u00f7 ${q.b}`) fail(`step 2 label "${s2.label}" \u2260 ${q.result} \u00f7 ${q.b}`)
  }
  checkExplanation(q, 2)
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

      const keys = new Set(
        qs.map(
          (q) =>
            `${q.kind}${q.choiceArrays ? '~' : ''}:${q.a}:${q.b}:${q.unknown}` +
            (q.step2?.equation ? `>${q.step2.equation.a}:${q.step2.equation.b}` : ''),
        ),
      )
      if (keys.size !== qs.length) fail(`${region.id} L${level}: duplicate questions in one level`)

      for (const q of qs) {
        if (q.kind === 'mul' && q.a * q.b !== q.result) fail(`bad mul fact ${q.a}×${q.b}=${q.result}`)
        if (q.kind === 'div' && (q.a !== q.b * q.result || q.a % q.b !== 0)) fail(`bad div fact ${q.a}÷${q.b}=${q.result}`)

        const factors = q.kind === 'mul' || q.kind === 'match' ? [q.a, q.b] : [q.b, q.result]
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

        // match-the-array: every fact label / array choice must multiply out to
        // its choice value, and the prompt's own product must be the answer
        const divMatch = q.kind === 'match' && !!q.choiceLabels?.some((l) => l.includes('÷'))
        if (divMatch) {
          // division arrays: the picture is a×b, the tap value is the quotient
          if (q.answer !== q.a) fail(`div-match answer ${q.answer} ≠ quotient ${q.a}`)
          if (q.result !== q.a * q.b) fail(`div-match total ${q.result} ≠ ${q.a}×${q.b}`)
          // part one names the calculation only — showing "= 3" would answer part two
          q.choiceLabels.forEach((label, i) => {
            const m = label.match(/^(\d+) ÷ (\d+)$/)
            if (!m || +m[1] % +m[2] !== 0 || +m[1] / +m[2] !== q.choices[i])
              fail(`div-match label "${label}" ≠ choice ${q.choices[i]}`)
            // only the ANSWER may be a true reading of the array on screen —
            // a wrong option sharing its total would be ambiguous
            else if (+m[1] === q.a * q.b && q.choices[i] !== q.answer)
              fail(`div-match distractor "${label}" also reads the ${q.a}×${q.b} array`)
          })
        }
        if (q.kind === 'match' && !divMatch) {
          if (q.answer !== q.a * q.b) fail(`match answer ${q.answer} ≠ ${q.a}×${q.b}`)
          if (q.choiceArrays) {
            if (q.choiceArrays.length !== q.choices.length) fail('reverse match without aligned arrays')
            else
              q.choiceArrays.forEach((f, i) => {
                if (f.rows * f.cols !== q.choices[i]) fail(`match array ${f.rows}×${f.cols} ≠ choice ${q.choices[i]}`)
                // rod stacks (tens & elevens) are tall: all three buttons must
                // fit on screen together, so no option may exceed 5 rods
                if (f.cols >= 10 && f.rows > 5) fail(`${region.id}: reverse rod option ${f.rows}×${f.cols} too tall`)
              })
          } else if (!q.choiceLabels || q.choiceLabels.length !== q.choices.length) {
            fail('match without aligned labels')
          } else {
            // fact labels show the whole equation and must be internally true
            q.choiceLabels.forEach((label, i) => {
              const m = label.match(/^(\d+) × (\d+) = (\d+)$/)
              if (!m || +m[1] * +m[2] !== q.choices[i] || +m[3] !== q.choices[i])
                fail(`match label "${label}" ≠ choice ${q.choices[i]}`)
            })
          }
          // reverse prompts that show an equation must be internally true too
          if (q.promptLabel?.includes('×')) {
            const m = q.promptLabel.match(/^(\d+) × (\d+) = (\d+)$/)
            if (!m || +m[1] !== q.a || +m[2] !== q.b || +m[3] !== q.a * q.b)
              fail(`match prompt "${q.promptLabel}" ≠ ${q.a} × ${q.b} = ${q.a * q.b}`)
          }
        }

        if (q.input === 'choice') {
          if (!q.choices || q.choices.length !== 3) fail('choice question without 3 options')
          else {
            if (!q.choices.includes(q.answer)) fail(`choices ${q.choices} missing answer ${q.answer}`)
            if (new Set(q.choices).size !== 3) fail(`duplicate choices ${q.choices}`)
            if (q.choices.some((c) => c <= 0)) fail(`non-positive choice in ${q.choices}`)
          }
        }

        checkStep2(region, q)

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
        if (!['add', 'sub', 'count', 'match', 'div'].includes(q.kind)) fail(`${region.id}: unexpected early kind ${q.kind}`)
        if (q.kind === 'match') {
          if (q.answer !== q.result) fail(`${region.id}: match answer ${q.answer} ≠ ${q.result}`)
          if (q.choiceCounts) {
            q.choiceCounts.forEach((n, i) => { if (n !== q.choices[i]) fail(`${region.id}: picture count ${n} ≠ choice ${q.choices[i]}`) })
            // odd-or-even: exactly one sharable pile among the options
            if (q.promptLabel === 'EVEN' && q.choiceCounts.filter((n) => n % 2 === 0).length !== 1)
              fail(`${region.id}: share-fairly piles ${q.choiceCounts} need exactly one even`)
          } else if (q.choiceArrays) {
            q.choiceArrays.forEach((f, i) => { if (f.rows * f.cols !== q.choices[i]) fail(`${region.id}: array ${f.rows}×${f.cols} ≠ choice ${q.choices[i]}`) })
            if (q.choiceArrays.some((f) => f.rows !== 2)) fail(`${region.id}: early doubles arrays must have two rows`)
          } else if (q.prompt === 'What comes next?') {
            // skip-counting: the pattern must be internally true
            if (q.a * q.b !== q.result) fail(`${region.id}: pattern ${q.promptLabel} next ≠ ${q.result}`)
          } else if (q.count != null) {
            // halving introduction: the shown pile must be twice the answer
            if (q.count !== q.a || q.result * 2 !== q.count)
              fail(`${region.id}: share pile ${q.count} ≠ 2 × ${q.result}`)
          } else if (q.prompt?.startsWith('Which number is the ')) {
            // numeral comparison: the answer must be the extreme it asks for
            const want = q.prompt.includes('biggest') ? Math.max(...q.choices) : Math.min(...q.choices)
            if (q.answer !== want) fail(`${region.id}: compare answer ${q.answer} ≠ ${want} of ${q.choices}`)
          } else fail(`${region.id}: early match without pictures`)
        }
        if (q.kind === 'add' && q.a + q.b !== q.result) fail(`bad add fact ${q.a}+${q.b}=${q.result}`)
        if (q.kind === 'sub') {
          if (q.a - q.b !== q.result) fail(`bad sub fact ${q.a}-${q.b}=${q.result}`)
          if (q.result < 0 || q.b < 0) fail(`negative in sub ${q.a}-${q.b}`)
        }
        if (q.kind === 'div' && (q.a !== q.b * q.result || ![2, 4].includes(q.b)))
          fail(`${region.id}: early divide must halve or quarter (${q.a}÷${q.b}=${q.result})`)
        if (q.kind === 'count' && !(q.count === q.result && q.result === q.answer && q.count >= 1))
          fail(`bad count question count=${q.count} result=${q.result}`)

        // answers stay in a sensible young range (place value & skip counting reach higher)
        const maxAnswer = region.kind === 'place' || region.kind === 'pattern' ? 100 : 20
        if (q.answer < 0 || q.answer > maxAnswer) fail(`${region.id} L${level}: answer ${q.answer} out of range`)
        checkStep2(region, q)

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
