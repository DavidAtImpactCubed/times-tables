import { useEffect } from 'react'
import { sfx } from '../logic/audio'
import { QUESTIONS_PER_LEVEL } from '../logic/questions'
import type { PartSlot, Region } from '../types'
import { Confetti } from './Confetti'
import { Monster } from './Monster'

interface Props {
  region: Region
  level: number
  correct: number
  stars: number
  gained: number
  equipped: Partial<Record<PartSlot, string>>
  onReplay: () => void
  onContinue: () => void
  onWardrobe: () => void
}

export function ResultsScreen({ region, level, correct, stars, gained, equipped, onReplay, onContinue, onWardrobe }: Props) {
  useEffect(() => {
    if (stars > 0) sfx.fanfare()
    const timers = Array.from({ length: stars }, (_, i) => window.setTimeout(sfx.star, 600 + i * 450))
    return () => timers.forEach(clearTimeout)
  }, [stars])

  const message =
    stars === 3
      ? 'PERFECT! Every single one right!'
      : stars === 2
        ? 'Brilliant work, little monster!'
        : stars === 1
          ? 'Well done — stars won back!'
          : 'So close! One more try and those stars are yours!'

  return (
    <div className="screen results-screen" style={{ ['--region-color' as string]: region.color }}>
      {stars > 0 && <Confetti />}
      <h1 className="results-title">
        {region.emoji} {region.levels[level].title}
      </h1>
      <div className="results-stars" data-testid="results-stars" data-stars={stars}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={`result-star ${i < stars ? 'won' : 'lost'}`} style={{ animationDelay: `${0.6 + i * 0.45}s` }}>
            ★
          </span>
        ))}
      </div>
      <p className="results-score" data-testid="results-score">
        {correct} out of {QUESTIONS_PER_LEVEL} correct
      </p>
      <p className="results-message">{message}</p>
      <div className="results-monster">
        <Monster equipped={equipped} mood={stars > 0 ? 'excited' : 'idle'} size={150} className={stars > 0 ? 'jump' : ''} />
      </div>
      {gained > 0 && (
        <p className="results-gain" data-testid="results-gain">
          +{gained} ⭐ for your star purse — spend them in the wardrobe!
        </p>
      )}
      <div className="results-buttons">
        {stars < 3 && (
          <button className="btn btn-secondary" onClick={onReplay} data-testid="replay-btn">
            🔁 Try again
          </button>
        )}
        {gained > 0 && (
          <button className="btn btn-secondary" onClick={onWardrobe} data-testid="results-wardrobe-btn">
            👕 Wardrobe
          </button>
        )}
        {stars > 0 ? (
          <button className="btn btn-primary" onClick={onContinue} data-testid="continue-btn">
            Onwards! ▸
          </button>
        ) : (
          <button className="btn btn-primary" onClick={onReplay} data-testid="retry-btn">
            💪 Have another go!
          </button>
        )}
      </div>
      {stars === 0 && (
        <button className="btn btn-quiet" onClick={onContinue}>
          Back to the map
        </button>
      )}
    </div>
  )
}
