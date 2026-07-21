import { useEffect, useState } from 'react'
import { FINALE, REGIONS, regionById } from './data/regions'
import { setMuted, sfx } from './logic/audio'
import { starsFor } from './logic/progress'
import { freshSave, loadSave, persistSave } from './logic/storage'
import { levelId, type SaveData } from './types'
import { LevelScreen } from './components/LevelScreen'
import { Monster } from './components/Monster'
import { ResultsScreen } from './components/ResultsScreen'
import { StoryScene } from './components/StoryScene'
import { Wardrobe } from './components/Wardrobe'
import { WorldMap } from './components/WorldMap'

type Screen =
  | { name: 'title' }
  | { name: 'map' }
  | { name: 'story'; regionId: string; level: number }
  | { name: 'level'; regionId: string; level: number }
  | { name: 'results'; regionId: string; level: number; correct: number; stars: number; gained: number }
  | { name: 'finale' }
  | { name: 'wardrobe' }

export default function App() {
  const [save, setSave] = useState<SaveData>(loadSave)
  const [screen, setScreen] = useState<Screen>({ name: 'title' })
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    persistSave(save)
    setMuted(save.muted)
  }, [save])

  const startLevel = (regionId: string, level: number) => {
    sfx.click()
    if (!save.seenStory.includes(regionId)) {
      setScreen({ name: 'story', regionId, level })
    } else {
      setScreen({ name: 'level', regionId, level })
    }
  }

  const storyDone = (regionId: string, level: number) => {
    setSave((s) => ({ ...s, seenStory: [...s.seenStory, regionId] }))
    setScreen({ name: 'level', regionId, level })
  }

  const levelDone = (regionId: string, level: number, correct: number) => {
    const stars = starsFor(correct)
    const id = levelId(regionId, level)
    const before = save.stars[id] ?? 0
    const gained = Math.max(0, stars - before)
    if (gained > 0) {
      setSave((s) => ({
        ...s,
        stars: { ...s.stars, [id]: Math.max(before, stars) },
        wallet: s.wallet + gained,
      }))
    }
    setScreen({ name: 'results', regionId, level, correct, stars, gained })
  }

  const afterResults = (regionId: string, level: number, stars: number) => {
    const lastRegion = REGIONS[REGIONS.length - 1]
    const isGrandFinale =
      regionId === lastRegion.id && level === lastRegion.levels.length - 1 && stars >= 1 && !save.seenFinale
    if (isGrandFinale) {
      setSave((s) => ({ ...s, seenFinale: true }))
      setScreen({ name: 'finale' })
    } else {
      setScreen({ name: 'map' })
    }
  }

  switch (screen.name) {
    case 'title':
      return (
        <div className="screen title-screen">
          <div className="title-stars" aria-hidden>
            {Array.from({ length: 14 }, (_, i) => (
              <span key={i} className="twinkle" style={{ animationDelay: `${i * 0.4}s` }}>
                ⭐
              </span>
            ))}
          </div>
          <h1 className="game-title">
            Monster Maths
            <br />
            Quest
          </h1>
          <div className="title-monster">
            <Monster equipped={save.equipped} mood="happy" size={200} className="bounce" />
          </div>
          <button
            className="btn btn-big btn-primary"
            onClick={() => {
              sfx.fanfare()
              setScreen({ name: 'map' })
            }}
          >
            {Object.keys(save.stars).length > 0 ? '▶ Keep playing!' : '▶ Start the adventure!'}
          </button>
          {Object.keys(save.stars).length > 0 &&
            (confirmReset ? (
              <div className="reset-confirm" data-testid="reset-confirm">
                <p>Delete ALL progress and stars?</p>
                <button
                  className="btn btn-danger"
                  data-testid="reset-yes"
                  onClick={() => {
                    setSave(freshSave())
                    setConfirmReset(false)
                  }}
                >
                  Yes, start over
                </button>
                <button className="btn btn-secondary" onClick={() => setConfirmReset(false)}>
                  Keep my stars!
                </button>
              </div>
            ) : (
              <button className="btn btn-quiet reset-btn" data-testid="reset-btn" onClick={() => setConfirmReset(true)}>
                Reset progress
              </button>
            ))}
        </div>
      )

    case 'map':
      return (
        <WorldMap
          save={save}
          onPlayLevel={startLevel}
          onWardrobe={() => setScreen({ name: 'wardrobe' })}
          onToggleMute={() => setSave((s) => ({ ...s, muted: !s.muted }))}
        />
      )

    case 'story': {
      const region = regionById(screen.regionId)
      return (
        <StoryScene
          lines={region.intro}
          background={region.color}
          equipped={save.equipped}
          onDone={() => storyDone(screen.regionId, screen.level)}
        />
      )
    }

    case 'level': {
      const region = regionById(screen.regionId)
      return (
        <LevelScreen
          key={`${screen.regionId}-${screen.level}`}
          region={region}
          level={screen.level}
          equipped={save.equipped}
          onFinish={(correct) => levelDone(screen.regionId, screen.level, correct)}
          onQuit={() => setScreen({ name: 'map' })}
        />
      )
    }

    case 'results': {
      const region = regionById(screen.regionId)
      return (
        <ResultsScreen
          region={region}
          level={screen.level}
          correct={screen.correct}
          stars={screen.stars}
          gained={screen.gained}
          equipped={save.equipped}
          onReplay={() => setScreen({ name: 'level', regionId: screen.regionId, level: screen.level })}
          onContinue={() => afterResults(screen.regionId, screen.level, screen.stars)}
          onWardrobe={() => setScreen({ name: 'wardrobe' })}
        />
      )
    }

    case 'finale':
      return (
        <StoryScene
          lines={FINALE}
          background="#7c3aed"
          equipped={save.equipped}
          finale
          onDone={() => setScreen({ name: 'map' })}
        />
      )

    case 'wardrobe':
      return <Wardrobe save={save} setSave={setSave} onBack={() => setScreen({ name: 'map' })} />
  }
}
