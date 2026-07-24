import { useState } from 'react'
import { sfx } from '../logic/audio'
import type { SaveData } from '../types'
import { Monster } from './Monster'

interface Props {
  incoming: { name: string; save: SaveData }
  profiles: string[]
  onImport: (name: string, save: SaveData) => void
  onCancel: () => void
}

/** Shown when the app is opened via a transfer link (?p=…). */
export function ImportScreen({ incoming, profiles, onImport, onCancel }: Props) {
  const exists = profiles.includes(incoming.name)
  const [rename, setRename] = useState(false)
  const [newName, setNewName] = useState('')
  const ages = incoming.save.curriculum === 'early' ? 'Ages 4–6' : 'Ages 6–8'
  const trimmed = newName.trim().slice(0, 12)

  return (
    <div className="screen import-screen" data-testid="import">
      <div className="import-card">
        <div className="import-monster">
          <Monster equipped={incoming.save.equipped} mood="happy" size={120} />
        </div>
        <h1>Move {incoming.name}’s game here?</h1>
        <p className="import-sub">
          ⭐ {incoming.save.wallet} · {ages}
        </p>

        {rename ? (
          <div className="import-buttons">
            <p>Save under a new name:</p>
            <input
              className="name-input"
              autoFocus
              maxLength={12}
              value={newName}
              placeholder="New name"
              onChange={(e) => setNewName(e.target.value)}
              data-testid="import-newname"
            />
            <button
              className="btn btn-primary"
              disabled={!trimmed || profiles.includes(trimmed)}
              onClick={() => {
                sfx.fanfare()
                onImport(trimmed, incoming.save)
              }}
              data-testid="import-savenew"
            >
              Save as {trimmed || '…'}
            </button>
            <button className="btn btn-quiet" onClick={() => setRename(false)}>
              Back
            </button>
          </div>
        ) : exists ? (
          <div className="import-buttons">
            <p className="import-warn">A player called “{incoming.name}” already exists on this phone.</p>
            <button
              className="btn btn-danger"
              onClick={() => {
                sfx.fanfare()
                onImport(incoming.name, incoming.save)
              }}
              data-testid="import-overwrite"
            >
              Overwrite {incoming.name}
            </button>
            <button className="btn btn-secondary" onClick={() => setRename(true)} data-testid="import-asnew">
              Save as new name
            </button>
            <button className="btn btn-quiet" onClick={onCancel} data-testid="import-cancel">
              Cancel
            </button>
          </div>
        ) : (
          <div className="import-buttons">
            <button
              className="btn btn-primary btn-big"
              onClick={() => {
                sfx.fanfare()
                onImport(incoming.name, incoming.save)
              }}
              data-testid="import-add"
            >
              Add {incoming.name}
            </button>
            <button className="btn btn-quiet" onClick={onCancel} data-testid="import-cancel">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
