import { useState } from 'react'
import { SLOTS, SLOT_LABELS, WARDROBE } from '../data/wardrobe'
import { sfx } from '../logic/audio'
import type { PartSlot, SaveData } from '../types'
import { Monster } from './Monster'

interface Props {
  save: SaveData
  setSave: React.Dispatch<React.SetStateAction<SaveData>>
  onBack: () => void
}

export function Wardrobe({ save, setSave, onBack }: Props) {
  const [tab, setTab] = useState<PartSlot>('body')
  const items = WARDROBE.filter((i) => i.slot === tab)

  const buy = (id: string, price: number) => {
    if (save.wallet < price || save.owned.includes(id)) return
    sfx.buy()
    setSave((s) => ({
      ...s,
      wallet: s.wallet - price,
      owned: [...s.owned, id],
      equipped: { ...s.equipped, [tab]: id },
    }))
  }

  const equip = (id: string | null) => {
    sfx.click()
    setSave((s) => {
      const equipped = { ...s.equipped }
      if (id === null) delete equipped[tab]
      else equipped[tab] = id
      return { ...s, equipped }
    })
  }

  return (
    <div className="screen wardrobe-screen">
      <header className="wardrobe-header">
        <button className="btn btn-round" onClick={onBack} aria-label="Back to the map" data-testid="wardrobe-back">
          🗺️
        </button>
        <h1>Monster Wardrobe</h1>
        <span className="wallet" data-testid="wallet">
          ⭐ {save.wallet}
        </span>
      </header>

      <div className="wardrobe-preview">
        <Monster equipped={save.equipped} mood="happy" size={170} className="bounce-slow" />
      </div>

      <nav className="wardrobe-tabs">
        {SLOTS.map((s) => (
          <button key={s} className={`tab ${tab === s ? 'active' : ''}`} onClick={() => setTab(s)} data-testid={`tab-${s}`}>
            {SLOT_LABELS[s]}
          </button>
        ))}
      </nav>

      <div className="item-grid">
        <button
          className={`item-card ${save.equipped[tab] === undefined ? 'equipped' : ''}`}
          onClick={() => equip(null)}
          data-testid="item-none"
        >
          <div className="item-preview">
            <Monster equipped={{ ...save.equipped, [tab]: undefined }} size={64} />
          </div>
          <span className="item-name">{tab === 'body' ? 'Purple' : 'None'}</span>
          <span className="item-price free">free</span>
        </button>
        {items.map((item) => {
          const owned = save.owned.includes(item.id)
          const equippedNow = save.equipped[tab] === item.id
          const affordable = save.wallet >= item.price
          return (
            <button
              key={item.id}
              className={`item-card ${equippedNow ? 'equipped' : ''} ${!owned && !affordable ? 'too-dear' : ''}`}
              onClick={() => (owned ? equip(equippedNow ? null : item.id) : buy(item.id, item.price))}
              data-testid={`item-${item.id}`}
            >
              <div className="item-preview">
                <Monster equipped={{ ...save.equipped, [tab]: item.id }} size={64} />
              </div>
              <span className="item-name">{item.name}</span>
              {owned ? (
                <span className="item-price owned">{equippedNow ? 'wearing ✓' : 'owned'}</span>
              ) : (
                <span className="item-price">{item.price} ⭐</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
