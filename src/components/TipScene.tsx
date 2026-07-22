import { useEffect, useState } from 'react'
import { sfx } from '../logic/audio'
import { speak, stopSpeaking } from '../logic/speech'
import { backgroundFor } from '../logic/backgrounds'
import type { Region } from '../types'
import owlUrl from '../assets/characters/owl.webp'

interface Props {
  region: Region
  /** true when Olly first offers the trick (shows the yes/maybe-later choice) */
  offer: boolean
  readAloud?: boolean
  onDone: () => void
}

/** Olly the Owl's optional "clever trick" mini-lesson for a topic. */
export function TipScene({ region, offer, readAloud, onDone }: Props) {
  const steps = region.tip ?? []
  const [phase, setPhase] = useState<'offer' | 'cards'>(offer ? 'offer' : 'cards')
  const [index, setIndex] = useState(0)

  // read the offer, then each trick card, aloud
  useEffect(() => {
    if (!readAloud) return
    if (phase === 'offer') speak('Would you like to learn a clever trick?')
    else if (steps[index]) speak(steps[index].text)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index])
  useEffect(() => () => stopSpeaking(), [])

  const start = () => {
    sfx.click()
    setPhase('cards')
  }
  const skip = () => {
    sfx.click()
    onDone()
  }
  const advance = () => {
    sfx.click()
    if (index + 1 < steps.length) setIndex(index + 1)
    else onDone()
  }

  const step = steps[index]
  const bg = backgroundFor(region.id, 0)

  return (
    <div className="screen tip-screen" style={{ background: `linear-gradient(180deg, ${region.color}cc, #1e1b4b)` }} data-testid="tip-scene">
      {bg && <div className="story-bg" aria-hidden data-testid="tip-bg" style={{ backgroundImage: `url(${bg})` }} />}
      <div className="tip-owl">
        <img className="story-char" src={owlUrl} alt="Olly the Owl" draggable={false} />
      </div>

      {phase === 'offer' ? (
        <div className="tip-card tip-offer">
          <div className="speech-name">Olly the Owl</div>
          <p className="tip-offer-text">Before we start… would you like to learn a clever trick? 💡</p>
          <div className="tip-buttons">
            <button className="btn btn-primary" onClick={start} data-testid="tip-yes">
              Yes please! 💡
            </button>
            <button className="btn btn-secondary" onClick={skip} data-testid="tip-skip">
              Maybe later
            </button>
          </div>
        </div>
      ) : (
        <div className="tip-card" onClick={advance} data-testid="tip-card">
          <div className="speech-name">Olly’s clever trick 💡</div>
          <p className="tip-text">{step.text}</p>
          {step.example && <div className="tip-example">{step.example}</div>}
          <div className="tip-progress">
            {steps.map((_, i) => (
              <span key={i} className={`tip-dot ${i === index ? 'on' : ''}`} />
            ))}
          </div>
          <button className="btn btn-primary tip-next" onClick={(e) => { e.stopPropagation(); advance() }} data-testid="tip-next">
            {index + 1 < steps.length ? 'Next ▸' : 'Got it! 👍'}
          </button>
        </div>
      )}
    </div>
  )
}
