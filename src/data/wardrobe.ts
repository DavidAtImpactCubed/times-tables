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
  { id: 'body-orange', slot: 'body', name: 'Orange', price: 3, variant: 'orange' },
  { id: 'body-green', slot: 'body', name: 'Green', price: 5, variant: 'green' },
  { id: 'body-blue', slot: 'body', name: 'Blue', price: 5, variant: 'blue' },
  { id: 'body-rainbow', slot: 'body', name: 'Rainbow', price: 30, variant: 'rainbow' },
  // Eyes
  { id: 'eyes-sleepy', slot: 'eyes', name: 'Sleepy eyes', price: 3, variant: 'sleepy' },
  { id: 'eyes-wink', slot: 'eyes', name: 'Smiley eyes', price: 5, variant: 'wink' },
  { id: 'eyes-angry', slot: 'eyes', name: 'Grumpy eyes', price: 5, variant: 'angry' },
  { id: 'eyes-stars', slot: 'eyes', name: 'Starry eyes', price: 10, variant: 'stars' },
  // Glasses (overlay the eyes)
  { id: 'glasses-round', slot: 'glasses', name: 'Round glasses', price: 3, variant: 'round' },
  { id: 'glasses-blue', slot: 'glasses', name: 'Blue glasses', price: 3, variant: 'blue' },
  { id: 'glasses-shutter', slot: 'glasses', name: 'Party shades', price: 6, variant: 'shutter' },
  { id: 'glasses-pixel', slot: 'glasses', name: 'Cool shades', price: 6, variant: 'pixel' },
  { id: 'glasses-heart', slot: 'glasses', name: 'Heart glasses', price: 8, variant: 'heart' },
  { id: 'glasses-star', slot: 'glasses', name: 'Star glasses', price: 8, variant: 'star' },
  // Horns
  { id: 'horns-little', slot: 'horns', name: 'Large horns', price: 3, variant: 'little' },
  { id: 'horns-cream', slot: 'horns', name: 'Ram horns', price: 5, variant: 'cream' },
  { id: 'horns-teal', slot: 'horns', name: 'Teal horns', price: 5, variant: 'teal' },
  { id: 'horns-green', slot: 'horns', name: 'Sprout horns', price: 5, variant: 'green' },
  { id: 'horns-antennae', slot: 'horns', name: 'Antennae', price: 5, variant: 'antennae' },
  { id: 'horns-curly', slot: 'horns', name: 'Large blue horns', price: 8, variant: 'curly' },
  { id: 'horns-bat', slot: 'horns', name: 'Bat wings', price: 10, variant: 'bat' },
  // Hats
  { id: 'hat-cap', slot: 'hat', name: 'Baseball cap', price: 3, variant: 'cap' },
  { id: 'hat-beanie', slot: 'hat', name: 'Bobble hat', price: 3, variant: 'beanie' },
  { id: 'hat-viking', slot: 'hat', name: 'Viking helmet', price: 10, variant: 'viking' },
  { id: 'hat-pirate', slot: 'hat', name: 'Pirate hat', price: 10, variant: 'pirate' },
  { id: 'hat-aviator', slot: 'hat', name: 'Flying cap', price: 10, variant: 'aviator' },
  { id: 'hat-wizard', slot: 'hat', name: 'Wizard hat', price: 15, variant: 'wizard' },
  { id: 'hat-crown', slot: 'hat', name: 'Royal crown', price: 25, variant: 'crown' },
  // Neckwear
  { id: 'face-scarf', slot: 'face', name: 'Red scarf', price: 2, variant: 'scarf' },
  { id: 'face-scarf-green', slot: 'face', name: 'Green scarf', price: 2, variant: 'scarf-green' },
  { id: 'face-scarf-blue', slot: 'face', name: 'Blue scarf', price: 2, variant: 'scarf-blue' },
  { id: 'face-bowtie', slot: 'face', name: 'Bow tie', price: 3, variant: 'bowtie' },
  { id: 'face-bandana', slot: 'face', name: 'Star bandana', price: 6, variant: 'bandana' },
  { id: 'face-medal', slot: 'face', name: 'Star medal', price: 12, variant: 'medal' },
  // Held
  { id: 'held-icecream', slot: 'held', name: 'Ice cream', price: 3, variant: 'icecream' },
  { id: 'held-balloon', slot: 'held', name: 'Balloon', price: 4, variant: 'balloon' },
  { id: 'held-flag', slot: 'held', name: 'Star flag', price: 5, variant: 'flag' },
  { id: 'held-lantern', slot: 'held', name: 'Lantern', price: 5, variant: 'lantern' },
  { id: 'held-telescope', slot: 'held', name: 'Telescope', price: 8, variant: 'telescope' },
  { id: 'held-wand', slot: 'held', name: 'Star wand', price: 10, variant: 'wand' },
  { id: 'held-moon', slot: 'held', name: 'Moon staff', price: 10, variant: 'moon' },
  { id: 'held-crystal', slot: 'held', name: 'Crystal staff', price: 12, variant: 'crystal' },
  { id: 'held-gem', slot: 'held', name: 'Gem staff', price: 12, variant: 'gem' },
  { id: 'held-orb', slot: 'held', name: 'Orb staff', price: 15, variant: 'orb' },
  // Back & body-worn extras
  { id: 'back-belt', slot: 'back', name: 'Explorer belt', price: 5, variant: 'belt' },
  { id: 'back-duck', slot: 'back', name: 'Duck ring', price: 10, variant: 'duck' },
  { id: 'back-cape', slot: 'back', name: 'Hero cape', price: 12, variant: 'cape' },
  { id: 'back-wings', slot: 'back', name: 'Fairy wings', price: 25, variant: 'wings' },
  { id: 'back-batwings', slot: 'back', name: 'Dragon wings', price: 30, variant: 'batwings' },
]

/**
 * Items from earlier wardrobe versions that no longer exist. Saves owning
 * them get the stars refunded on load.
 */
export const RETIRED_ITEM_PRICES: Record<string, number> = {
  'eyes-one': 2,
  'eyes-three': 3,
  'eyes-happy': 2,
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
  glasses: 'Glasses',
  horns: 'Horns',
  hat: 'Hats',
  face: 'Neckwear',
  held: 'Holding',
  back: 'Back',
}

export const SLOTS: PartSlot[] = ['body', 'eyes', 'glasses', 'horns', 'hat', 'face', 'held', 'back']

export const itemById = (id: string | undefined): WardrobeItem | undefined =>
  WARDROBE.find((i) => i.id === id)
