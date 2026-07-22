import { useState } from 'react'
import { SLOTS, SLOT_LABELS, WARDROBE, itemById } from '../data/wardrobe'
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
  // an unowned item being tried on (not yet bought); cleared when leaving the tab
  const [preview, setPreview] = useState<string | null>(null)
  const items = WARDROBE.filter((i) => i.slot === tab)

  const changeTab = (s: PartSlot) => {
    sfx.click()
    setPreview(null)
    setTab(s)
  }

  // wear an item you already own (free, instant)
  const equip = (id: string | null) => {
    sfx.click()
    setPreview(null)
    setSave((s) => {
      const equipped = { ...s.equipped }
      if (id === null) delete equipped[tab]
      else equipped[tab] = id
      return { ...s, equipped }
    })
  }

  // try an unowned item on the monster without buying
  const tryOn = (id: string) => {
    sfx.click()
    setPreview(id)
  }

  const buyPreview = () => {
    const item = itemById(preview ?? undefined)
    if (!item || save.wallet < item.price || save.owned.includes(item.id)) return
    sfx.buy()
    setPreview(null)
    setSave((s) => ({
      ...s,
      wallet: s.wallet - item.price,
      owned: [...s.owned, item.id],
      equipped: { ...s.equipped, [tab]: item.id },
    }))
  }

  const previewItem = itemById(preview ?? undefined)
  // the big monster reflects the current outfit, with the tried-on item swapped in
  const shownEquipped = preview ? { ...save.equipped, [tab]: preview } : save.equipped

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
        <Monster equipped={shownEquipped} mood="happy" size={170} className="bounce-slow" />
      </div>

      {previewItem && (
        <div className="tryon-bar" data-testid="tryon-bar">
          <span className="tryon-name">{previewItem.name}</span>
          <button
            className="btn btn-primary tryon-buy"
            disabled={save.wallet < previewItem.price}
            onClick={buyPreview}
            data-testid="tryon-buy"
          >
            {save.wallet < previewItem.price ? `Need ${previewItem.price} ⭐` : `Buy for ${previewItem.price} ⭐`}
          </button>
          <button className="btn btn-secondary tryon-cancel" onClick={() => setPreview(null)} data-testid="tryon-cancel">
            Cancel
          </button>
        </div>
      )}

      <nav className="wardrobe-tabs">
        {SLOTS.map((s) => (
          <button key={s} className={`tab ${tab === s ? 'active' : ''}`} onClick={() => changeTab(s)} data-testid={`tab-${s}`}>
            {SLOT_LABELS[s]}
          </button>
        ))}
      </nav>

      <div className="item-grid">
        <button
          className={`item-card ${save.equipped[tab] === undefined && !preview ? 'equipped' : ''}`}
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
          const equippedNow = save.equipped[tab] === item.id && !preview
          const trying = preview === item.id
          const affordable = save.wallet >= item.price
          return (
            <button
              key={item.id}
              className={`item-card ${equippedNow ? 'equipped' : ''} ${trying ? 'trying' : ''} ${!owned && !affordable ? 'too-dear' : ''}`}
              onClick={() => (owned ? equip(equippedNow ? null : item.id) : tryOn(item.id))}
              data-testid={`item-${item.id}`}
            >
              <div className="item-preview">
                <Monster equipped={{ ...save.equipped, [tab]: item.id }} size={64} />
              </div>
              <span className="item-name">{item.name}</span>
              {owned ? (
                <span className="item-price owned">{equippedNow ? 'wearing ✓' : 'owned'}</span>
              ) : (
                <span className="item-price">{trying ? 'trying on…' : `${item.price} ⭐`}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
