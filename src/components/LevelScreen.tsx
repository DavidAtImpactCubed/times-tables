import { useMemo, useRef, useState } from 'react'
import { sfx } from '../logic/audio'
import { QUESTIONS_PER_LEVEL, explain, generateLevel, questionText } from '../logic/questions'
import type { PartSlot, Question, Region } from '../types'
import { Monster, type Mood } from './Monster'
import { NumberPad } from './NumberPad'

interface Props {
  region: Region
  level: number
  equipped: Partial<Record<PartSlot, string>>
  onFinish: (correct: number) => void
  onQuit: () => void
}

interface Entry {
  q: Question
  retry: boolean
}

type Feedback = null | { kind: 'correct' } | { kind: 'wrong'; chips: number[]; text: string; answer: number }

const STREAK_MESSAGES: Record<number, string> = {
  3: '3 in a row! 🔥',
  5: '5 in a row! Amazing! 🌟',
  8: '8 in a row! Unstoppable! 🚀',
}

export function LevelScreen({ region, level, equipped, onFinish, onQuit }: Props) {
  const initial = useMemo(() => generateLevel(region, level).map((q): Entry => ({ q, retry: false })), [region, level])
  const [queue, setQueue] = useState<Entry[]>(initial)
  const [pos, setPos] = useState(0)
  const [answeredFirst, setAnsweredFirst] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [streak, setStreak] = useState(0)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [typed, setTyped] = useState('')
  const advanceTimer = useRef<number | undefined>(undefined)

  const entry = queue[pos]
  const q = entry.q
  const text = questionText(q)
  const mood: Mood = feedback?.kind === 'correct' ? 'excited' : feedback?.kind === 'wrong' ? 'sad' : 'idle'

  const advance = (nextQueue: Entry[], nextCorrect: number) => {
    setFeedback(null)
    setTyped('')
    if (pos + 1 < nextQueue.length) setPos(pos + 1)
    else onFinish(nextCorrect)
  }

  const submit = (value: number) => {
    if (feedback) return
    const isRight = value === q.answer
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
      const info = explain(q)
      // Give the same question another (unscored) go later in the level.
      const nextQueue = entry.retry ? queue : [...queue, { q, retry: true }]
      setQueue(nextQueue)
      setFeedback({ kind: 'wrong', chips: info.chips, text: info.text, answer: q.answer })
    }
  }

  const gotIt = () => {
    sfx.click()
    advance(queue, correct)
  }

  const progress = Math.min(answeredFirst / QUESTIONS_PER_LEVEL, 1)

  return (
    <div className="screen level-screen" style={{ ['--region-color' as string]: region.color }}>
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

        {feedback?.kind === 'wrong' ? (
          <div className="explain-panel" data-testid="explain-panel">
            <p className="explain-title">
              Nearly! The answer is <strong>{feedback.answer}</strong>. Count the jumps:
            </p>
            <div className="chips">
              {feedback.chips.map((c, i) => (
                <span key={i} className="chip" style={{ animationDelay: `${i * 0.12}s` }}>
                  {c}
                </span>
              ))}
            </div>
            <p className="explain-text">{feedback.text}</p>
            <button className="btn btn-primary" onClick={gotIt} data-testid="got-it">
              Got it! 👍
            </button>
          </div>
        ) : q.input === 'choice' ? (
          <div className="choices" data-testid="choices">
            {q.choices!.map((c) => (
              <button
                key={c}
                className="btn choice-btn"
                disabled={feedback !== null}
                onClick={() => submit(c)}
                data-testid={`choice-${c}`}
              >
                {c}
              </button>
            ))}
          </div>
        ) : (
          <NumberPad
            value={typed}
            onChange={setTyped}
            onSubmit={() => submit(parseInt(typed, 10))}
            disabled={feedback !== null}
          />
        )}

        {feedback?.kind === 'correct' && <div className="correct-flash">✔ {q.answer} — brilliant!</div>}
      </main>
    </div>
  )
}
