import { useEffect } from 'react'
import { sfx } from '../logic/audio'

interface Props {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled?: boolean
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓']

export function NumberPad({ value, onChange, onSubmit, disabled }: Props) {
  const press = (key: string) => {
    if (disabled) return
    sfx.click()
    if (key === '⌫') onChange(value.slice(0, -1))
    else if (key === '✓') {
      if (value.length > 0) onSubmit()
    } else if (value.length < 3) onChange(value + key)
  }

  // Physical keyboard works too.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (disabled) return
      if (/^[0-9]$/.test(e.key)) press(e.key)
      else if (e.key === 'Backspace') press('⌫')
      else if (e.key === 'Enter') press('✓')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  return (
    <div className="number-pad" data-testid="number-pad">
      {KEYS.map((k) => (
        <button
          key={k}
          className={`pad-key ${k === '✓' ? 'pad-submit' : ''} ${k === '⌫' ? 'pad-back' : ''}`}
          onClick={() => press(k)}
          disabled={disabled || (k === '✓' && value.length === 0)}
          data-testid={`pad-${k === '⌫' ? 'back' : k === '✓' ? 'submit' : k}`}
        >
          {k}
        </button>
      ))}
    </div>
  )
}
