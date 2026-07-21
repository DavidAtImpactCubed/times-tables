import type { PartSlot, WardrobeItem } from '../types'

/**
 * Everything the star wallet can buy. Cheap items early so the very first
 * level's stars already buy something. `variant` is interpreted by Monster.tsx.
 */
export const WARDROBE: WardrobeItem[] = [
  // Body colours
  { id: 'body-teal', slot: 'body', name: 'Teal', price: 1, variant: 'teal' },
  { id: 'body-pink', slot: 'body', name: 'Pink', price: 2, variant: 'pink' },
  { id: 'body-orange', slot: 'body', name: 'Orange', price: 2, variant: 'orange' },
  { id: 'body-green', slot: 'body', name: 'Green', price: 3, variant: 'green' },
  { id: 'body-blue', slot: 'body', name: 'Blue', price: 3, variant: 'blue' },
  { id: 'body-rainbow', slot: 'body', name: 'Rainbow', price: 8, variant: 'rainbow' },
  // Eyes
  { id: 'eyes-one', slot: 'eyes', name: 'One big eye', price: 2, variant: 'one' },
  { id: 'eyes-three', slot: 'eyes', name: 'Three eyes', price: 3, variant: 'three' },
  { id: 'eyes-sleepy', slot: 'eyes', name: 'Sleepy eyes', price: 2, variant: 'sleepy' },
  { id: 'eyes-stars', slot: 'eyes', name: 'Starry eyes', price: 4, variant: 'stars' },
  // Horns
  { id: 'horns-little', slot: 'horns', name: 'Little horns', price: 2, variant: 'little' },
  { id: 'horns-curly', slot: 'horns', name: 'Curly horns', price: 3, variant: 'curly' },
  { id: 'horns-antennae', slot: 'horns', name: 'Antennae', price: 3, variant: 'antennae' },
  { id: 'horns-unicorn', slot: 'horns', name: 'Unicorn horn', price: 5, variant: 'unicorn' },
  // Hats
  { id: 'hat-bow', slot: 'hat', name: 'Big bow', price: 2, variant: 'bow' },
  { id: 'hat-flower', slot: 'hat', name: 'Flower', price: 2, variant: 'flower' },
  { id: 'hat-party', slot: 'hat', name: 'Party hat', price: 3, variant: 'party' },
  { id: 'hat-wizard', slot: 'hat', name: 'Wizard hat', price: 5, variant: 'wizard' },
  { id: 'hat-crown', slot: 'hat', name: 'Royal crown', price: 6, variant: 'crown' },
  // Face
  { id: 'face-round', slot: 'face', name: 'Round glasses', price: 3, variant: 'round' },
  { id: 'face-sun', slot: 'face', name: 'Sunglasses', price: 4, variant: 'sun' },
  { id: 'face-star', slot: 'face', name: 'Star glasses', price: 4, variant: 'star' },
  // Held
  { id: 'held-icecream', slot: 'held', name: 'Ice cream', price: 2, variant: 'icecream' },
  { id: 'held-balloon', slot: 'held', name: 'Balloon', price: 3, variant: 'balloon' },
  { id: 'held-flag', slot: 'held', name: 'Star flag', price: 3, variant: 'flag' },
  { id: 'held-wand', slot: 'held', name: 'Magic wand', price: 4, variant: 'wand' },
  // Back
  { id: 'back-cape', slot: 'back', name: 'Hero cape', price: 5, variant: 'cape' },
  { id: 'back-wings', slot: 'back', name: 'Fairy wings', price: 6, variant: 'wings' },
]

export const SLOT_LABELS: Record<PartSlot, string> = {
  body: 'Colour',
  eyes: 'Eyes',
  horns: 'Horns',
  hat: 'Hats',
  face: 'Glasses',
  held: 'Holding',
  back: 'Back',
}

export const SLOTS: PartSlot[] = ['body', 'eyes', 'horns', 'hat', 'face', 'held', 'back']

export const itemById = (id: string | undefined): WardrobeItem | undefined =>
  WARDROBE.find((i) => i.id === id)
