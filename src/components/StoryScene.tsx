import { useEffect, useState } from 'react'
import { sfx } from '../logic/audio'
import { narrate, stopSpeaking } from '../logic/speech'
import type { PartSlot, StoryLine } from '../types'
import { Confetti } from './Confetti'
import { Monster } from './Monster'
import owlUrl from '../assets/characters/owl.webp'
import goblinUrl from '../assets/characters/goblin.webp'

interface Props {
  lines: StoryLine[]
  background: string
  /** panorama shown behind the dialogue; left edge for intros, right edge when imageEnd */
  image?: string
  imageEnd?: boolean
  equipped: Partial<Record<PartSlot, string>>
  readAloud?: boolean
  finale?: boolean
  onDone: () => void
}

const SPEAKER_NAMES = { monster: 'You', goblin: 'Star Goblin', guide: 'Olly the Owl' }

export function StoryScene({ lines, background, image, imageEnd, equipped, readAloud, finale, onDone }: Props) {
  const [index, setIndex] = useState(0)
  const line = lines[index]
  // only bring on a character who actually has a line in this scene
  const speakers = new Set(lines.map((l) => l.speaker))

  // read each story line aloud as it appears
  useEffect(() => {
    if (readAloud) narrate(line.speaker, line.text)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])
  useEffect(() => () => stopSpeaking(), [])

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
      {image && (
        <div
          className="story-bg"
          aria-hidden
          data-testid="story-bg"
          style={{ backgroundImage: `url(${image})`, backgroundPosition: `${imageEnd ? 100 : 0}% 50%` }}
        />
      )}
      {finale && <Confetti />}
      <div className="story-avatars">
        <div className={`story-avatar ${line.speaker === 'monster' ? 'talking' : 'quiet'}`}>
          <Monster equipped={equipped} mood={line.speaker === 'monster' ? 'happy' : 'idle'} size={130} />
        </div>
        {speakers.has('guide') && (
          <div className={`story-avatar ${line.speaker === 'guide' ? 'talking' : 'quiet'}`}>
            <img className="story-char" src={owlUrl} alt="Olly the Owl" draggable={false} />
          </div>
        )}
        {speakers.has('goblin') && (
          <div className={`story-avatar ${line.speaker === 'goblin' ? 'talking' : 'quiet'}`}>
            <img className="story-char" src={goblinUrl} alt="The Star Goblin" draggable={false} />
          </div>
        )}
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
