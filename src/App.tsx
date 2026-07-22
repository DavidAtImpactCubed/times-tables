import { useEffect, useMemo, useRef, useState } from 'react'
import { FINALE, REGIONS, regionById } from './data/regions'
import { WARDROBE } from './data/wardrobe'
import { setMuted, sfx } from './logic/audio'
import { TITLE_BG, backgroundFor } from './logic/backgrounds'
import { starsFor, totalStars } from './logic/progress'
import { addProfile, freshSave, listProfiles, loadSave, persistSave, removeProfile } from './logic/storage'
import { levelId, type SaveData } from './types'
import { LevelScreen } from './components/LevelScreen'
import { Monster } from './components/Monster'
import { ResultsScreen } from './components/ResultsScreen'
import { StoryScene } from './components/StoryScene'
import { Wardrobe } from './components/Wardrobe'
import { WorldMap } from './components/WorldMap'

type Screen =
  | { name: 'landing' }
  | { name: 'map' }
  | { name: 'story'; regionId: string; level: number }
  | { name: 'level'; regionId: string; level: number }
  | { name: 'results'; regionId: string; level: number; correct: number; stars: number; gained: number }
  | { name: 'finale' }
  | { name: 'wardrobe' }

/** Unlock all levels, own every item and top up stars (tester cheat). */
function applyCheat(save: SaveData): SaveData {
  const stars = { ...save.stars }
  for (const region of REGIONS)
    for (let l = 0; l < region.levels.length; l++) {
      const id = levelId(region.id, l)
      stars[id] = Math.max(stars[id] ?? 0, 1)
    }
  return { ...save, stars, wallet: save.wallet + 99, owned: WARDROBE.map((i) => i.id) }
}

export default function App() {
  const [profiles, setProfiles] = useState<string[]>(() => listProfiles())
  const [profile, setProfile] = useState<string | null>(null)
  const [save, setSave] = useState<SaveData>(freshSave)
  const [screen, setScreen] = useState<Screen>({ name: 'landing' })
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [cheatArmed, setCheatArmed] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const titleTaps = useRef<number[]>([])

  // persist the active profile's save
  useEffect(() => {
    if (profile) persistSave(profile, save)
    setMuted(save.muted)
  }, [save, profile])

  // Hidden tester cheat: 5 quick taps on the title arms it for the next player chosen.
  const titleTapped = () => {
    const now = Date.now()
    titleTaps.current = [...titleTaps.current.filter((t) => now - t < 3000), now]
    if (titleTaps.current.length >= 5) {
      titleTaps.current = []
      sfx.fanfare()
      setCheatArmed(true)
    }
  }

  const playAs = (name: string) => {
    let s = loadSave(name)
    if (cheatArmed) {
      s = applyCheat(s)
      setCheatArmed(false)
    }
    setProfile(name)
    setSave(s)
    persistSave(name, s)
    sfx.fanfare()
    setScreen({ name: 'map' })
  }

  const createPlayer = () => {
    const name = newName.trim().slice(0, 12)
    if (!name || profiles.includes(name)) return
    addProfile(name)
    setProfiles(listProfiles())
    setNewName('')
    setAdding(false)
    playAs(name)
  }

  const deletePlayer = (name: string) => {
    removeProfile(name)
    setProfiles(listProfiles())
    setConfirmDelete(null)
  }

  const startLevel = (regionId: string, level: number) => {
    sfx.click()
    const id = levelId(regionId, level)
    if (!save.seenStory.includes(id)) setScreen({ name: 'story', regionId, level })
    else setScreen({ name: 'level', regionId, level })
  }

  const storyDone = (regionId: string, level: number) => {
    const id = levelId(regionId, level)
    setSave((s) => ({ ...s, seenStory: [...s.seenStory, id] }))
    setScreen({ name: 'level', regionId, level })
  }

  const levelDone = (regionId: string, level: number, correct: number) => {
    const stars = starsFor(correct)
    const id = levelId(regionId, level)
    const before = save.stars[id] ?? 0
    const gained = Math.max(0, stars - before)
    if (gained > 0) {
      setSave((s) => ({ ...s, stars: { ...s.stars, [id]: Math.max(before, stars) }, wallet: s.wallet + gained }))
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

  // summaries for the landing chips
  const profileCards = useMemo(
    () => profiles.map((name) => ({ name, save: loadSave(name) })),
    [profiles, screen.name],
  )

  switch (screen.name) {
    case 'landing':
      return (
        <div className="screen landing-screen">
          {TITLE_BG && (
            <div className="title-bg" aria-hidden data-testid="title-bg" style={{ backgroundImage: `url(${TITLE_BG})` }} />
          )}
          <div className="title-stars" aria-hidden>
            {Array.from({ length: 14 }, (_, i) => (
              <span key={i} className="twinkle" style={{ animationDelay: `${i * 0.4}s` }}>
                ⭐
              </span>
            ))}
          </div>
          <div className="landing-inner" data-testid="landing">
            <h1 className="game-title" onClick={titleTapped} data-testid="game-title">
              Monster Maths
              <br />
              Quest
            </h1>
            {cheatArmed && (
              <div className="cheat-toast" data-testid="cheat-toast">
                🔓 Cheat ready — it’ll unlock the next player!
              </div>
            )}

            {adding ? (
              <div className="name-entry" data-testid="name-entry">
                <p className="name-prompt">What’s your name?</p>
                <input
                  className="name-input"
                  data-testid="name-input"
                  value={newName}
                  maxLength={12}
                  autoFocus
                  placeholder="Type your name"
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createPlayer()}
                />
                <div className="name-buttons">
                  <button className="btn btn-primary" data-testid="name-go" disabled={!newName.trim()} onClick={createPlayer}>
                    Let’s go! ▸
                  </button>
                  <button className="btn btn-quiet" onClick={() => { setAdding(false); setNewName('') }}>
                    Back
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="landing-sub">{profileCards.length ? 'Who’s playing?' : 'Start your adventure!'}</p>
                <div className="profile-list">
                  {profileCards.map(({ name, save: ps }) => (
                    <div key={name} className="profile-chip-wrap">
                      <button className="profile-chip" data-testid={`profile-${name}`} onClick={() => playAs(name)}>
                        <Monster equipped={ps.equipped} mood="happy" size={72} />
                        <span className="profile-name">{name}</span>
                        <span className="profile-stars">⭐ {totalStars(ps)}</span>
                      </button>
                      {confirmDelete === name ? (
                        <div className="profile-del-confirm">
                          <button className="btn btn-danger btn-tiny" data-testid={`delete-yes-${name}`} onClick={() => deletePlayer(name)}>
                            Delete
                          </button>
                          <button className="btn btn-secondary btn-tiny" onClick={() => setConfirmDelete(null)}>
                            Keep
                          </button>
                        </div>
                      ) : (
                        <button className="profile-del" aria-label={`Delete ${name}`} onClick={() => setConfirmDelete(name)}>
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button className="btn btn-big btn-primary" data-testid="new-player-btn" onClick={() => setAdding(true)}>
                  ＋ New player
                </button>
              </>
            )}
          </div>
        </div>
      )

    case 'map':
      return (
        <WorldMap
          save={save}
          playerName={profile ?? ''}
          onPlayLevel={startLevel}
          onWardrobe={() => setScreen({ name: 'wardrobe' })}
          onToggleMute={() => setSave((s) => ({ ...s, muted: !s.muted }))}
          onSwitchPlayer={() => {
            setProfiles(listProfiles())
            setConfirmDelete(null)
            setScreen({ name: 'landing' })
          }}
        />
      )

    case 'story': {
      const region = regionById(screen.regionId)
      return (
        <StoryScene
          lines={region.levels[screen.level].story}
          background={region.color}
          image={backgroundFor(region.id, screen.level)}
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
          image={backgroundFor('tower', 3)}
          imageEnd
          equipped={save.equipped}
          finale
          onDone={() => setScreen({ name: 'map' })}
        />
      )

    case 'wardrobe':
      return <Wardrobe save={save} setSave={setSave} onBack={() => setScreen({ name: 'map' })} />
  }
}
