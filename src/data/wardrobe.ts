import type { PartSlot, WardrobeItem } from '../types'

/**
 * Everything the star wallet can buy. Cheap items early so the very first
 * level's stars already buy something. Item ids double as asset stems
 * (src/assets/monster/<id>.webp), except body colours (base-body-<variant>).
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
  { id: 'eyes-happy', slot: 'eyes', name: 'Happy eyes', price: 2, variant: 'happy' },
  { id: 'eyes-sleepy', slot: 'eyes', name: 'Sleepy eyes', price: 2, variant: 'sleepy' },
  { id: 'eyes-wink', slot: 'eyes', name: 'Smiley eyes', price: 3, variant: 'wink' },
  { id: 'eyes-angry', slot: 'eyes', name: 'Grumpy eyes', price: 3, variant: 'angry' },
  { id: 'eyes-stars', slot: 'eyes', name: 'Starry eyes', price: 4, variant: 'stars' },
  // Horns
  { id: 'horns-little', slot: 'horns', name: 'Little horns', price: 2, variant: 'little' },
  { id: 'horns-curly', slot: 'horns', name: 'Blue horns', price: 3, variant: 'curly' },
  { id: 'horns-green', slot: 'horns', name: 'Sprout horns', price: 3, variant: 'green' },
  { id: 'horns-antennae', slot: 'horns', name: 'Antennae', price: 3, variant: 'antennae' },
  // Hats
  { id: 'hat-cap', slot: 'hat', name: 'Baseball cap', price: 2, variant: 'cap' },
  { id: 'hat-beanie', slot: 'hat', name: 'Bobble hat', price: 2, variant: 'beanie' },
  { id: 'hat-pirate', slot: 'hat', name: 'Pirate hat', price: 4, variant: 'pirate' },
  { id: 'hat-aviator', slot: 'hat', name: 'Flying cap', price: 4, variant: 'aviator' },
  { id: 'hat-wizard', slot: 'hat', name: 'Wizard hat', price: 5, variant: 'wizard' },
  { id: 'hat-crown', slot: 'hat', name: 'Royal crown', price: 6, variant: 'crown' },
  // Neckwear
  { id: 'face-scarf', slot: 'face', name: 'Red scarf', price: 2, variant: 'scarf' },
  { id: 'face-scarf-green', slot: 'face', name: 'Green scarf', price: 2, variant: 'scarf-green' },
  { id: 'face-scarf-blue', slot: 'face', name: 'Blue scarf', price: 2, variant: 'scarf-blue' },
  { id: 'face-bandana', slot: 'face', name: 'Star bandana', price: 3, variant: 'bandana' },
  { id: 'face-medal', slot: 'face', name: 'Star medal', price: 4, variant: 'medal' },
  // Held
  { id: 'held-icecream', slot: 'held', name: 'Ice cream', price: 2, variant: 'icecream' },
  { id: 'held-balloon', slot: 'held', name: 'Balloon', price: 3, variant: 'balloon' },
  { id: 'held-flag', slot: 'held', name: 'Star flag', price: 3, variant: 'flag' },
  { id: 'held-lantern', slot: 'held', name: 'Lantern', price: 3, variant: 'lantern' },
  { id: 'held-wand', slot: 'held', name: 'Magic wand', price: 4, variant: 'wand' },
  { id: 'held-telescope', slot: 'held', name: 'Telescope', price: 4, variant: 'telescope' },
  // Back & body-worn extras
  { id: 'back-belt', slot: 'back', name: 'Explorer belt', price: 3, variant: 'belt' },
  { id: 'back-cape', slot: 'back', name: 'Hero cape', price: 5, variant: 'cape' },
  { id: 'back-duck', slot: 'back', name: 'Duck ring', price: 5, variant: 'duck' },
  { id: 'back-wings', slot: 'back', name: 'Fairy wings', price: 6, variant: 'wings' },
  { id: 'back-batwings', slot: 'back', name: 'Dragon wings', price: 6, variant: 'batwings' },
]

/**
 * Items from earlier wardrobe versions that no longer exist. Saves owning
 * them get the stars refunded on load.
 */
export const RETIRED_ITEM_PRICES: Record<string, number> = {
  'eyes-one': 2,
  'eyes-three': 3,
  'hat-bow': 2,
  'hat-flower': 2,
  'hat-party': 3,
  'horns-unicorn': 5,
  'face-round': 3,
  'face-sun': 4,
  'face-star': 4,
  'back-satchel': 4,
}

export const SLOT_LABELS: Record<PartSlot, string> = {
  body: 'Colour',
  eyes: 'Eyes',
  horns: 'Horns',
  hat: 'Hats',
  face: 'Neckwear',
  held: 'Holding',
  back: 'Back',
}

export const SLOTS: PartSlot[] = ['body', 'eyes', 'horns', 'hat', 'face', 'held', 'back']

export const itemById = (id: string | undefined): WardrobeItem | undefined =>
  WARDROBE.find((i) => i.id === id)
