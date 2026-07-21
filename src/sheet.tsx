// Temporary reference sheet of every monster component, for the art pipeline.
// Not part of the game build.
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Monster, type Mood } from './components/Monster'
import { WARDROBE } from './data/wardrobe'
import type { PartSlot } from './types'

const SIZE = 150

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: SIZE + 30 }}>
      <div
        style={{
          width: SIZE + 20,
          height: SIZE * (250 / 220) + 20,
          display: 'grid',
          placeItems: 'center',
          background: '#e5e7eb',
          borderRadius: 12,
          border: '1px solid #9ca3af',
        }}
      >
        {children}
      </div>
      <span style={{ fontFamily: 'monospace', fontSize: 14, marginTop: 4 }}>{label}</span>
    </div>
  )
}

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: 'monospace', fontSize: 20, margin: '0 0 10px' }}>{title}</h2>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>{children}</div>
    </section>
  )
}

const slotItems = (slot: PartSlot) => WARDROBE.filter((i) => i.slot === slot)

function Sheet() {
  return (
    <div style={{ padding: 30, background: '#fff', width: 1560 }}>
      <h1 style={{ fontFamily: 'monospace', fontSize: 26 }}>
        MONSTER COMPONENT SHEET — base body + all wardrobe layers (game renders these stacked)
      </h1>
      <Row title="1. MOODS (expression only changes the mouth; base purple body)">
        {(['idle', 'happy', 'sad', 'excited'] as Mood[]).map((m) => (
          <Cell key={m} label={`mood: ${m}`}>
            <Monster equipped={{}} mood={m} size={SIZE} />
          </Cell>
        ))}
      </Row>
      <Row title="2. BODY COLOURS (slot: body — recolours the whole base body)">
        <Cell label="body: purple (default)">
          <Monster equipped={{}} size={SIZE} />
        </Cell>
        {slotItems('body').map((i) => (
          <Cell key={i.id} label={`body: ${i.variant}`}>
            <Monster equipped={{ body: i.id }} size={SIZE} />
          </Cell>
        ))}
      </Row>
      <Row title="3. EYES (slot: eyes — replaces the default two eyes)">
        <Cell label="eyes: two (default)">
          <Monster equipped={{}} size={SIZE} />
        </Cell>
        {slotItems('eyes').map((i) => (
          <Cell key={i.id} label={`eyes: ${i.variant}`}>
            <Monster equipped={{ eyes: i.id }} size={SIZE} />
          </Cell>
        ))}
      </Row>
      <Row title="4. HORNS (slot: horns — sits on top of the head)">
        {slotItems('horns').map((i) => (
          <Cell key={i.id} label={`horns: ${i.variant}`}>
            <Monster equipped={{ horns: i.id }} size={SIZE} />
          </Cell>
        ))}
      </Row>
      <Row title="5. HATS (slot: hat — sits on top of the head, above horns)">
        {slotItems('hat').map((i) => (
          <Cell key={i.id} label={`hat: ${i.variant}`}>
            <Monster equipped={{ hat: i.id }} size={SIZE} />
          </Cell>
        ))}
      </Row>
      <Row title="6. GLASSES (slot: face — overlays the eyes)">
        {slotItems('face').map((i) => (
          <Cell key={i.id} label={`face: ${i.variant}`}>
            <Monster equipped={{ face: i.id }} size={SIZE} />
          </Cell>
        ))}
      </Row>
      <Row title="7. HELD ITEMS (slot: held — at the right hand)">
        {slotItems('held').map((i) => (
          <Cell key={i.id} label={`held: ${i.variant}`}>
            <Monster equipped={{ held: i.id }} size={SIZE} />
          </Cell>
        ))}
      </Row>
      <Row title="8. BACK ITEMS (slot: back — behind the body)">
        {slotItems('back').map((i) => (
          <Cell key={i.id} label={`back: ${i.variant}`}>
            <Monster equipped={{ back: i.id }} size={SIZE} />
          </Cell>
        ))}
      </Row>
      <Row title="9. EXAMPLE COMBINATIONS (layers stack: back → body → eyes → mouth → glasses → horns → hat → held)">
        <Cell label="teal + crown + star glasses + wings + wand">
          <Monster
            equipped={{ body: 'body-teal', hat: 'hat-crown', face: 'face-star', back: 'back-wings', held: 'held-wand' }}
            mood="happy"
            size={SIZE}
          />
        </Cell>
        <Cell label="pink + party + one eye + balloon">
          <Monster equipped={{ body: 'body-pink', hat: 'hat-party', eyes: 'eyes-one', held: 'held-balloon' }} mood="excited" size={SIZE} />
        </Cell>
        <Cell label="green + wizard + sleepy + cape">
          <Monster equipped={{ body: 'body-green', hat: 'hat-wizard', eyes: 'eyes-sleepy', back: 'back-cape' }} size={SIZE} />
        </Cell>
      </Row>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Sheet />)
