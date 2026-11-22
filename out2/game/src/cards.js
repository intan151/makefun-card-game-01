// Ember Duel — card definitions.
// Four original elements, told apart by colour AND shape, never by text alone:
// Fire = red triangle, Water = blue droplet, Leaf = green diamond, Stone = grey square.
export const ELEMENTS = {
  fire:  { name: 'Fire',  color: '#e5484d', dark: '#8f1d22', shape: 'triangle', beats: 'leaf',  glyph: '▲' },
  water: { name: 'Water', color: '#3e8fe8', dark: '#174a80', shape: 'droplet', beats: 'fire',  glyph: '●' },
  leaf:  { name: 'Leaf',  color: '#46a758', dark: '#1d5c2e', shape: 'diamond', beats: 'stone', glyph: '◆' },
  stone: { name: 'Stone', color: '#9a8f7a', dark: '#5c5344', shape: 'square',   beats: 'water', glyph: '■' },
};

export const ELEMENT_ORDER = ['fire', 'water', 'leaf', 'stone'];

// attack bonus when the attacker's element beats the defender's last played element
export const ADVANTAGE_BONUS = 2;
// attack bonus for the 2nd+ card of the same element played in one turn (a chain)
export const CHAIN_BONUS = 2;

// One card: id, name, element, cost (energy), attack (damage).
export const CARD_POOL = [
  { id: 'ember-spark',   name: 'Ember Spark',   element: 'fire',  cost: 1, attack: 2 },
  { id: 'cinder-fox',    name: 'Cinder Fox',    element: 'fire',  cost: 2, attack: 4 },
  { id: 'flame-lizard',  name: 'Flame Lizard',  element: 'fire',  cost: 2, attack: 3 },
  { id: 'wildfire',      name: 'Wildfire',      element: 'fire',  cost: 3, attack: 6 },
  { id: 'magma-golem',   name: 'Magma Golem',   element: 'fire',  cost: 4, attack: 8 },
  { id: 'ash-phoenix',   name: 'Ash Phoenix',   element: 'fire',  cost: 3, attack: 5 },
  { id: 'spring-drip',   name: 'Spring Drip',   element: 'water', cost: 1, attack: 2 },
  { id: 'river-otter',   name: 'River Otter',   element: 'water', cost: 2, attack: 4 },
  { id: 'rain-heron',    name: 'Rain Heron',    element: 'water', cost: 2, attack: 3 },
  { id: 'tidal-wave',    name: 'Tidal Wave',    element: 'water', cost: 3, attack: 6 },
  { id: 'deep-whale',    name: 'Deep Whale',    element: 'water', cost: 4, attack: 8 },
  { id: 'mist-eel',      name: 'Mist Eel',      element: 'water', cost: 3, attack: 5 },
  { id: 'sprout',        name: 'Sprout',        element: 'leaf',  cost: 1, attack: 2 },
  { id: 'thorn-rabbit',  name: 'Thorn Rabbit',  element: 'leaf',  cost: 2, attack: 4 },
  { id: 'vine-snake',    name: 'Vine Snake',    element: 'leaf',  cost: 2, attack: 3 },
  { id: 'forest-stag',   name: 'Forest Stag',   element: 'leaf',  cost: 3, attack: 6 },
  { id: 'oak-titan',     name: 'Oak Titan',     element: 'leaf',  cost: 4, attack: 8 },
  { id: 'spore-fox',     name: 'Spore Fox',     element: 'leaf',  cost: 3, attack: 5 },
  { id: 'pebble',        name: 'Pebble',        element: 'stone', cost: 1, attack: 2 },
  { id: 'rock-crab',     name: 'Rock Crab',     element: 'stone', cost: 2, attack: 4 },
  { id: 'gravel-mole',   name: 'Gravel Mole',   element: 'stone', cost: 2, attack: 3 },
  { id: 'boulder-bear',  name: 'Boulder Bear',  element: 'stone', cost: 3, attack: 6 },
  { id: 'mountain-ox',   name: 'Mountain Ox',   element: 'stone', cost: 4, attack: 8 },
  { id: 'crystal-bat',   name: 'Crystal Bat',   element: 'stone', cost: 3, attack: 5 },
];

export function cardById(id) {
  return CARD_POOL.find((c) => c.id === id);
}

// Element advantage: attacker's element beats defender's element?
export function elementBeats(attackerElement, defenderElement) {
  if (!attackerElement || !defenderElement) return false;
  return ELEMENTS[attackerElement].beats === defenderElement;
}

// Full damage of a card, given the defender's last played element and the
// elements already played by this side this turn (for the chain bonus).
export function computeDamage(card, defenderLastElement, playedElementsThisTurn) {
  let damage = card.attack;
  let bonuses = [];
  if (elementBeats(card.element, defenderLastElement)) {
    damage += ADVANTAGE_BONUS;
    bonuses.push('advantage +' + ADVANTAGE_BONUS);
  }
  const sameCount = playedElementsThisTurn.filter((e) => e === card.element).length;
  if (sameCount > 0) {
    damage += CHAIN_BONUS;
    bonuses.push('chain +' + CHAIN_BONUS);
  }
  return { damage, bonuses };
}
