import { useState } from 'react'
import { sfx } from '../logic/audio'
import { loadSave, makeTransferLink } from '../logic/storage'
import { Monster } from './Monster'

interface Props {
  profiles: string[]
  onBack: () => void
}

/** Pick a player and get a link that recreates their game on another device. */
export function TransferScreen({ profiles, onBack }: Props) {
  const [link, setLink] = useState<{ name: string; url: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const getLink = async (name: string) => {
    sfx.click()
    const url = makeTransferLink(name)
    setLink({ name, url })
    setCopied(false)
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // clipboard blocked — the link is shown below for manual copying
    }
  }

  return (
    <div className="screen transfer-screen" data-testid="transfer">
      <header className="credits-header">
        <button className="btn btn-round" onClick={onBack} aria-label="Back" data-testid="transfer-back">
          ↩
        </button>
        <h1>Move to another phone</h1>
      </header>

      <div className="credits-card">
        <p>Pick a player, then open their link on the other phone to copy the game across.</p>
        <div className="transfer-list">
          {profiles.map((name) => (
            <div key={name} className="transfer-row">
              <Monster equipped={loadSave(name).equipped} size={46} />
              <span className="transfer-name">{name}</span>
              <button className="btn btn-secondary btn-tiny" data-testid={`transfer-${name}`} onClick={() => getLink(name)}>
                Get link
              </button>
            </div>
          ))}
        </div>

        {link && (
          <div className="transfer-result" data-testid="transfer-result">
            <p>
              {copied
                ? `✅ ${link.name}’s link is copied — paste it into a message to yourself, then open it on the other phone.`
                : `Copy ${link.name}’s link and open it on the other phone:`}
            </p>
            <input
              className="transfer-url"
              readOnly
              value={link.url}
              data-testid="transfer-url"
              onFocus={(e) => e.currentTarget.select()}
            />
          </div>
        )}
      </div>
    </div>
  )
}
