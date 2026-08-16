import { useEffect, useMemo, useRef, useState } from 'react'
import { sfx } from '../logic/audio'
import { backgroundFor } from '../logic/backgrounds'
import { QUESTIONS_PER_LEVEL, explain, generateLevel, questionText, spokenQuestion } from '../logic/questions'
import { speak, stopSpeaking } from '../logic/speech'
import type { PartSlot, Question, Region, TipVisual } from '../types'
import { Monster, type Mood } from './Monster'
import { NumberPad } from './NumberPad'
import { TenRod } from './TenRod'
import { TipArt } from './TipArt'

interface Props {
  region: Region
  level: number
  equipped: Partial<Record<PartSlot, string>>
  readAloud: boolean
  onFinish: (correct: number) => void
  onQuit: () => void
}

interface Entry {
  q: Question
  retry: boolean
}

type Feedback = null | { kind: 'correct' } | { kind: 'wrong'; text: string; answer: number; answerLabel?: string; visual?: TipVisual }

/** Read maths symbols aloud as words (for speech and screen readers). */
const spokenSymbols = (s: string) =>
  s.replace(/×/g, 'times').replace(/÷/g, 'divided by').replace(/=/g, 'equals')

const STREAK_MESSAGES: Record<number, string> = {
  3: '3 in a row! 🔥',
  5: '5 in a row! Amazing! 🌟',
  8: '8 in a row! Unstoppable! 🚀',
}

export function LevelScreen({ region, level, equipped, readAloud, onFinish, onQuit }: Props) {
  const initial = useMemo(() => generateLevel(region, level).map((q): Entry => ({ q, retry: false })), [region, level])
  const [queue, setQueue] = useState<Entry[]>(initial)
  const [pos, setPos] = useState(0)
  const [answeredFirst, setAnsweredFirst] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [streak, setStreak] = useState(0)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [typed, setTyped] = useState('')
  // two-part questions: 1 = name the calculation, 2 = work it out
  const [step, setStep] = useState<1 | 2>(1)
  const advanceTimer = useRef<number | undefined>(undefined)

  const entry = queue[pos]
  const q = entry.q
  const text = questionText(q)
  const part2 = step === 2 && q.step2 ? q.step2 : null

  // read the current question (or its second part) aloud when it appears
  useEffect(() => {
    if (feedback === null) {
      const s2 = q.step2
      speak(step === 2 && s2 ? `${s2.prompt} ${spokenSymbols(s2.label)}` : spokenQuestion(q))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, step])
  // stop any speech when leaving the level
  useEffect(() => () => stopSpeaking(), [])

  const explainSpeech = (answer: string, body: string) => `The answer is ${spokenSymbols(answer)}. ${body}`
  const replay = () => {
    if (feedback?.kind === 'wrong') speak(explainSpeech(feedback.answerLabel ?? String(feedback.answer), feedback.text))
    else if (part2) speak(`${part2.prompt} ${spokenSymbols(part2.label)}`)
    else speak(spokenQuestion(q))
  }
  const mood: Mood = feedback?.kind === 'correct' ? 'excited' : feedback?.kind === 'wrong' ? 'sad' : 'idle'

  const advance = (nextQueue: Entry[], nextCorrect: number) => {
    setFeedback(null)
    setTyped('')
    setStep(1)
    if (pos + 1 < nextQueue.length) setPos(pos + 1)
    else onFinish(nextCorrect)
  }

  const submit = (value: number) => {
    if (feedback) return
    const isRight = value === q.answer

    // Two-part question: naming the calculation correctly opens part two.
    // Scoring and the streak wait for the second part — it's one question.
    if (isRight && q.step2 && step === 1) {
      sfx.star()
      setTyped('')
      setStep(2)
      return
    }

    const nextAnsweredFirst = entry.retry ? answeredFirst : answeredFirst + 1
    const nextCorrect = !entry.retry && isRight ? correct + 1 : correct
    setAnsweredFirst(nextAnsweredFirst)
    setCorrect(nextCorrect)

    if (isRight) {
      sfx.correct()
      const nextStreak = streak + 1
      setStreak(nextStreak)
      if (STREAK_MESSAGES[nextStreak]) window.setTimeout(sfx.star, 350)
      setFeedback({ kind: 'correct' })
      advanceTimer.current = window.setTimeout(() => advance(queue, nextCorrect), 1000)
    } else {
      sfx.wrong()
      setStreak(0)
      const info = explain(q, step)
      // Give the same question another (unscored) go later in the level.
      const nextQueue = entry.retry ? queue : [...queue, { q, retry: true }]
      setQueue(nextQueue)
      setFeedback({ kind: 'wrong', text: info.text, answer: q.answer, answerLabel: info.answerLabel, visual: info.visual })
      speak(explainSpeech(info.answerLabel ?? String(q.answer), info.text))
    }
  }

  const gotIt = () => {
    sfx.click()
    advance(queue, correct)
  }

  const progress = Math.min(answeredFirst / QUESTIONS_PER_LEVEL, 1)
  const bg = backgroundFor(region.id, region.levels[level].artIndex ?? level)

  return (
    <div className="screen level-screen" style={{ ['--region-color' as string]: region.color }}>
      {bg && (
        <div
          className="level-bg"
          aria-hidden
          data-testid="level-bg"
          style={{ backgroundImage: `url(${bg})`, backgroundPosition: `${progress * 100}% 50%` }}
        />
      )}
      <header className="level-header">
        <button className="btn btn-round" onClick={onQuit} aria-label="Back to the map">
          🗺️
        </button>
        <div className="progress-track" role="progressbar" aria-valuenow={answeredFirst} aria-valuemax={QUESTIONS_PER_LEVEL}>
          <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
          <span className="progress-star" style={{ left: `calc(${progress * 100}% - 14px)` }}>
            ⭐
          </span>
        </div>
        {readAloud && (
          <button className="btn btn-round" onClick={replay} aria-label="Read it again" data-testid="speak-btn">
            🔊
          </button>
        )}
        <div className="level-badge">
          {region.emoji} {level + 1}
        </div>
      </header>

      {STREAK_MESSAGES[streak] && feedback?.kind === 'correct' && (
        <div className="streak-toast">{STREAK_MESSAGES[streak]}</div>
      )}

      <main className="level-main">
        {entry.retry && (
          <div className="retry-banner" data-testid="retry-banner">
            🔁 Second try — just for practice, not scored!
          </div>
        )}
        <div className="level-monster">
          <Monster equipped={equipped} mood={mood} size={110} className={feedback?.kind === 'correct' ? 'jump' : ''} />
        </div>

        {q.kind === 'count' ? (
          <div className={`count-panel ${feedback?.kind === 'correct' ? 'equation-right' : ''}`} data-testid="count-panel">
            <p className="count-prompt">How many?</p>
            {q.rods || (q.count ?? 0) > 10 ? (
              // place value: whole tens as rods, loose ones as objects
              <div className="count-objects count-rods" data-testid="count-objects" aria-label={`${q.count}`}>
                <span className="rod-stack">
                  {Array.from({ length: Math.floor((q.count ?? 0) / 10) }, (_, i) => (
                    <TenRod key={i} />
                  ))}
                </span>
                {(q.count ?? 0) % 10 > 0 && (
                  <span className="count-ones">
                    {/* loose ones are the same gold cells as the rods — ten of
                        these become one of those (matching the elevens' +1) */}
                    {Array.from({ length: (q.count ?? 0) % 10 }, (_, i) => (
                      <span key={i} className="rod-one">
                        <span className="rod-cell" />
                      </span>
                    ))}
                  </span>
                )}
              </div>
            ) : (
              <div className="count-objects" data-testid="count-objects">
                {Array.from({ length: q.count ?? 0 }, (_, i) => (
                  <span key={i} className="count-obj" style={{ animationDelay: `${i * 0.06}s` }}>
                    {q.object}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : q.kind === 'match' ? (
          <div
            className={`count-panel match-panel ${feedback?.kind === 'correct' ? 'equation-right' : ''}`}
            data-testid="match-panel"
            data-rows={q.a}
            data-cols={q.b}
            data-reverse={q.choiceArrays ? 'true' : undefined}
          >
            <p className="count-prompt">
              {part2?.prompt ??
                q.prompt ??
                (q.choiceArrays ? 'Which array shows this fact?' : 'Which fact does this array show?')}
            </p>
            {(part2?.label ?? q.promptLabel) && (
              <div
                className={`match-fact ${part2 ? 'match-fact-won' : ''}`}
                aria-label={spokenSymbols(part2?.label ?? q.promptLabel!)}
                data-testid={part2 ? 'step2-fact' : undefined}
              >
                {part2?.label ?? q.promptLabel}
              </div>
            )}
            {/* halving introduction: the pile to share, in twos — each
                column is one monster's share */}
            {q.count != null && q.object && (
              <div className="share-pile choice-pair-group" aria-label={`${q.count} to share`} data-testid="share-pile">
                {Array.from({ length: q.count }, (_, i) => (
                  <span key={i} aria-hidden>
                    {q.object}
                  </span>
                ))}
              </div>
            )}
            {q.showArray && (
              <>
                {q.b >= 10 ? (
                  <div className="rod-stack" aria-label={`${q.a} rows of ${q.b}`}>
                    {Array.from({ length: q.a }, (_, i) => (
                      <TenRod key={i} plusOne={q.b === 11} />
                    ))}
                  </div>
                ) : (
                  <div
                    className="match-grid"
                    style={{
                      gridTemplateColumns: `repeat(${q.b}, auto)`,
                      // same sizing rule as the pick-the-array buttons, so stars feel consistent
                      fontSize: `${Math.max(14, Math.min(q.b > 8 ? 17 : 26, Math.floor(160 / q.a)))}px`,
                    }}
                    aria-label={`${q.a} rows of ${q.b}`}
                  >
                    {Array.from({ length: q.a * q.b }, (_, i) => (
                      <span key={i} className="match-star" style={{ animationDelay: `${i * 0.02}s` }} aria-hidden>
                        ⭐
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className={`equation ${feedback?.kind === 'correct' ? 'equation-right' : ''}`} data-testid="equation">
            <span className={text.left === '?' ? 'slot unknown' : 'slot'}>
              {text.left === '?' && q.input === 'pad' && typed ? typed : text.left}
            </span>
            <span className="slot op">{text.op}</span>
            <span className={text.right === '?' ? 'slot unknown' : 'slot'}>
              {text.right === '?' && q.input === 'pad' && typed ? typed : text.right}
            </span>
            <span className="slot op">=</span>
            <span className={text.result === '?' ? 'slot unknown' : 'slot'}>
              {text.result === '?' && q.input === 'pad' && typed ? typed : text.result}
            </span>
          </div>
        )}

        {feedback?.kind === 'wrong' ? (
          <div className="explain-panel" data-testid="explain-panel">
            <p className="explain-title">
              Nearly! The answer is <strong>{feedback.answerLabel ?? feedback.answer}</strong>. Here’s how:
            </p>
            {feedback.visual && <TipArt visual={feedback.visual} />}
            <p className="explain-text">{feedback.text}</p>
            <button className="btn btn-primary" onClick={gotIt} data-testid="got-it">
              Got it! 👍
            </button>
          </div>
        ) : feedback === null ? (
          part2 ? (
            // part two: plain number buttons, under the picture and its fact
            <div className="choices" data-testid="choices">
              {part2.choices.map((c) => (
                <button key={c} className="btn choice-btn" onClick={() => submit(c)} data-testid={`choice-${c}`}>
                  {c}
                </button>
              ))}
            </div>
          ) : q.input === 'choice' ? (
            <div className={`choices ${q.choiceArrays || q.choiceCounts ? 'choices-arrays' : ''}`} data-testid="choices">
              {q.choices!.map((c, i) =>
                q.choiceCounts ? (
                  <button
                    key={c}
                    className="btn choice-btn choice-array"
                    onClick={() => submit(c)}
                    aria-label={`${q.choiceCounts[i]} ${q.object}`}
                    data-testid={`choice-${c}`}
                  >
                    {/* odd-or-even piles wrap in PAIRS, so a leftover shows;
                        counting piles keep the fives structure for subitising */}
                    <span className={q.promptLabel === 'EVEN' ? 'choice-pair-group' : 'choice-count-group'}>
                      {Array.from({ length: q.choiceCounts[i] }, (_, j) => (
                        <span key={j} aria-hidden>
                          {q.object}
                        </span>
                      ))}
                    </span>
                  </button>
                ) : q.choiceArrays ? (
                  <button
                    key={c}
                    className="btn choice-btn choice-array"
                    onClick={() => submit(c)}
                    aria-label={`${q.choiceArrays[i].rows} rows of ${q.choiceArrays[i].cols}`}
                    data-testid={`choice-${c}`}
                  >
                    {q.choiceArrays[i].cols >= 10 ? (
                      <span className="rod-stack">
                        {Array.from({ length: q.choiceArrays[i].rows }, (_, j) => (
                          <TenRod key={j} plusOne={q.choiceArrays![i].cols === 11} />
                        ))}
                      </span>
                    ) : (
                      <span
                        className="choice-array-grid"
                        style={{
                          gridTemplateColumns: `repeat(${q.choiceArrays[i].cols}, auto)`,
                          // as big as the space allows: narrower and shallower arrays get larger stars
                          fontSize: `${Math.max(14, Math.min(q.choiceArrays[i].cols > 8 ? 17 : 26, Math.floor(130 / q.choiceArrays[i].rows)))}px`,
                        }}
                      >
                        {Array.from({ length: q.choiceArrays[i].rows * q.choiceArrays[i].cols }, (_, j) => (
                          <span key={j} aria-hidden>
                            ⭐
                          </span>
                        ))}
                      </span>
                    )}
                  </button>
                ) : (
                  <button key={c} className="btn choice-btn" onClick={() => submit(c)} data-testid={`choice-${c}`}>
                    {q.choiceLabels?.[i] ?? c}
                  </button>
                ),
              )}
            </div>
          ) : (
            <NumberPad value={typed} onChange={setTyped} onSubmit={() => submit(parseInt(typed, 10))} />
          )
        ) : null}

        {feedback?.kind === 'correct' && <div className="correct-flash">✔ {q.answer} — brilliant!</div>}
      </main>
    </div>
  )
}
