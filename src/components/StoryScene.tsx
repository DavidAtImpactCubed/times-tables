import { useState } from 'react'
import { sfx } from '../logic/audio'
import type { PartSlot, StoryLine } from '../types'
import { Confetti } from './Confetti'
import { Monster } from './Monster'

interface Props {
  lines: StoryLine[]
  background: string
  equipped: Partial<Record<PartSlot, string>>
  finale?: boolean
  onDone: () => void
}

const SPEAKER_NAMES = { monster: 'You', goblin: 'Star Goblin', guide: 'Olly the Owl' }

export function StoryScene({ lines, background, equipped, finale, onDone }: Props) {
  const [index, setIndex] = useState(0)
  const line = lines[index]

  const advance = () => {
    sfx.click()
    if (index + 1 < lines.length) setIndex(index + 1)
    else onDone()
  }

  return (
    <div
      className="screen story-screen"
      style={{ background: `linear-gradient(180deg, ${background}cc, #1e1b4b)` }}
      onClick={advance}
      data-testid="story-scene"
    >
      {finale && <Confetti />}
      <div className="story-avatars">
        <div className={`story-avatar ${line.speaker === 'monster' ? 'talking' : 'quiet'}`}>
          <Monster equipped={equipped} mood={line.speaker === 'monster' ? 'happy' : 'idle'} size={130} />
        </div>
        <div className={`story-avatar big-emoji ${line.speaker === 'guide' ? 'talking' : 'quiet'}`} aria-hidden>
          🦉
        </div>
        <div className={`story-avatar big-emoji ${line.speaker === 'goblin' ? 'talking' : 'quiet'}`} aria-hidden>
          😈
        </div>
      </div>
      <div className="speech-bubble">
        <div className="speech-name">{SPEAKER_NAMES[line.speaker]}</div>
        <p>{line.text}</p>
        <div className="speech-hint">Tap to continue ▸</div>
      </div>
      <button
        className="btn btn-skip"
        onClick={(e) => {
          e.stopPropagation()
          sfx.click()
          onDone()
        }}
        data-testid="story-skip"
      >
        Skip ▸▸
      </button>
    </div>
  )
}
