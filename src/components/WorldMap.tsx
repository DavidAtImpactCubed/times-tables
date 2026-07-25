import { useEffect, useRef, useState } from 'react'
import { sfx } from '../logic/audio'
import { readAloudSupported, speak, stopSpeaking } from '../logic/speech'
import { backgroundFor } from '../logic/backgrounds'
import { levelUnlocked, levelsLeftToUnlock, regionUnlocked, starValue } from '../logic/progress'
import { levelId, type Region, type SaveData } from '../types'
import { Monster } from './Monster'

function regionSubtitle(region: Region): string {
  switch (region.kind) {
    case 'times':
      return `The ${region.tables[0]} times table`
    case 'division':
      return 'Division facts'
    case 'mixed':
      return 'Everything mixed up!'
    case 'count':
      return 'Counting & numbers'
    case 'bond':
      return 'Number bonds'
    case 'add':
      return 'Adding up'
    case 'sub':
      return 'Taking away'
    case 'double':
      return 'Doubles & more'
  }
}

interface Props {
  save: SaveData
  regions: Region[]
  playerName: string
  onPlayLevel: (regionId: string, level: number) => void
  onWardrobe: () => void
  onToggleMute: () => void
  onToggleReadAloud: () => void
  onSwitchPlayer: () => void
}

export function WorldMap({ save, regions, playerName, onPlayLevel, onWardrobe, onToggleMute, onToggleReadAloud, onSwitchPlayer }: Props) {
  // tapping a ⭐×N badge explains the star-value mechanic for that stage
  const [valueInfo, setValueInfo] = useState<{ name: string; value: number } | null>(null)
  const explain = (name: string, value: number) => {
    sfx.click()
    setValueInfo({ name, value })
    speak(
      `Every star you win in ${name} is worth ${value} in your star purse. Trickier stages pay more — and a perfect replay wins ${value} bonus ${value === 1 ? 'star' : 'stars'} for practising!`,
    )
  }
  const closeExplain = () => {
    sfx.click()
    stopSpeaking()
    setValueInfo(null)
  }
  // the furthest level the player can currently play (their progress frontier)
  let frontier: { ri: number; li: number } | null = null
  regions.forEach((region, ri) => {
    if (!regionUnlocked(save, regions, ri)) return
    region.levels.forEach((_, li) => {
      if (levelUnlocked(save, regions, ri, li)) frontier = { ri, li }
    })
  })

  // On open, start at the top and smoothly glide down to that frontier level.
  const frontierRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    window.scrollTo(0, 0)
    const el = frontierRef.current
    if (!el) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const t = window.setTimeout(() => {
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'end' })
    }, 400)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div className="screen map-screen">
      <header className="map-header">
        <button className="map-monster" onClick={onWardrobe} aria-label="Open the wardrobe" data-testid="map-monster">
          <Monster equipped={save.equipped} mood="idle" size={72} className="bounce-slow" />
        </button>
        <div className="map-side">
          <div className="map-actions">
            <button className="wallet" onClick={onWardrobe} aria-label="Your stars — spend them in the wardrobe" data-testid="wallet">
              <span className="star-icon" aria-hidden>⭐</span> {save.wallet}
            </button>
            <button className="btn btn-round" onClick={onWardrobe} aria-label="Monster wardrobe" data-testid="wardrobe-btn">
              👕
            </button>
            <button className="btn btn-round" onClick={onToggleMute} aria-label="Sound on or off">
              {save.muted ? '🔇' : '🔊'}
            </button>
            {readAloudSupported() && (
              <button
                className={`btn btn-round ${save.readAloud ? '' : 'toggle-off'}`}
                onClick={onToggleReadAloud}
                aria-label={save.readAloud ? 'Reading aloud is on' : 'Reading aloud is off'}
                data-testid="readaloud-toggle"
              >
                🗣️
              </button>
            )}
          </div>
          {playerName && (
            <button className="player-tag" onClick={onSwitchPlayer} data-testid="switch-player" aria-label="Switch player">
              <span aria-hidden>👤</span>
              <span className="player-tag-name">{playerName}</span>
              <span className="player-tag-swap" aria-hidden>▾</span>
            </button>
          )}
        </div>
      </header>

      <div className="region-list">
        {regions.map((region, ri) => {
          const unlocked = regionUnlocked(save, regions, ri)
          const missing = levelsLeftToUnlock(save, regions, ri)
          const art = backgroundFor(region.id, 0)
          return (
            <section
              key={region.id}
              className={`region-card ${unlocked ? '' : 'locked'}`}
              style={{ ['--region-color' as string]: region.color }}
              data-testid={`region-${region.id}`}
            >
              {art && <div className="region-art" aria-hidden style={{ backgroundImage: `url(${art})` }} />}
              <div className="region-heading">
                <span className="region-emoji" aria-hidden>
                  {unlocked ? region.emoji : '🔒'}
                </span>
                <div>
                  <h2>{region.name}</h2>
                  <p className="region-sub">{regionSubtitle(region)}</p>
                </div>
                <button
                  className="region-value"
                  onClick={() => explain(region.name, starValue(region))}
                  aria-label={`Stars here are worth ${starValue(region)} each — tap to learn more`}
                  data-testid={`region-value-${region.id}`}
                >
                  ⭐×{starValue(region)}
                </button>
              </div>
              {!unlocked && (
                <p className="unlock-hint" data-testid={`unlock-hint-${region.id}`}>
                  Finish {missing} more stage{missing === 1 ? '' : 's'} in {regions[ri - 1].name} to unlock!
                </p>
              )}
              {unlocked && (
                <div className="level-row" style={{ gridTemplateColumns: `repeat(${region.levels.length}, 1fr)` }}>
                  {region.levels.map((lvl, li) => {
                    const open = levelUnlocked(save, regions, ri, li)
                    const stars = save.stars[levelId(region.id, li)] ?? 0
                    return (
                      <button
                        key={li}
                        ref={frontier?.ri === ri && frontier?.li === li ? frontierRef : undefined}
                        className={`level-btn ${open ? '' : 'locked'} ${stars > 0 ? 'done' : ''}`}
                        disabled={!open}
                        onClick={() => {
                          sfx.click()
                          onPlayLevel(region.id, li)
                        }}
                        data-testid={`level-${region.id}-${li}`}
                      >
                        <span className="level-num">{open ? li + 1 : '🔒'}</span>
                        <span className="level-stars" aria-label={`${stars} stars`}>
                          {'★'.repeat(stars)}
                          {'☆'.repeat(3 - stars)}
                        </span>
                        <span className="level-name">{lvl.title}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </section>
          )
        })}
      </div>

      {valueInfo && (
        <div className="value-pop" onClick={closeExplain} data-testid="value-info">
          <div className="value-pop-card" onClick={(e) => e.stopPropagation()}>
            <div className="value-pop-badge" aria-hidden>
              ⭐×{valueInfo.value}
            </div>
            <p>
              Every star you win in <strong>{valueInfo.name}</strong> is worth <strong>{valueInfo.value}</strong> in
              your star purse!
            </p>
            <p>
              Trickier stages pay more — and a <strong>perfect</strong> replay wins {valueInfo.value} bonus{' '}
              {valueInfo.value === 1 ? 'star' : 'stars'} for practising.
            </p>
            <button className="btn btn-primary" onClick={closeExplain} data-testid="value-info-close">
              Got it! 👍
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
