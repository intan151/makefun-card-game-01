// Ember Duel — deck building and drawing. One job: own the draw pile.
import { CARD_POOL } from './cards.js';

// Small deterministic RNG (mulberry32) so screenshot states are reproducible.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function nextRandom() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleDeck(cards, rng) {
  const deck = cards.slice();
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// A 30-card deck: the full 24-card pool plus one extra copy of six cheap cards.
export function buildDeck(rng) {
  const extra = ['ember-spark', 'spring-drip', 'sprout', 'pebble', 'cinder-fox', 'river-otter'];
  const base = CARD_POOL.map((c) => c.id);
  for (const id of extra) base.push(id);
  return shuffleDeck(base, rng);
}

// Draw up to n cards from the deck into the hand (hand cap 7).
export function drawCards(state, side, n) {
  const pile = side === 'player' ? state.playerDeck : state.aiDeck;
  const hand = side === 'player' ? state.playerHand : state.aiHand;
  let drawn = 0;
  while (drawn < n && pile.length > 0 && hand.length < 7) {
    hand.push(pile.shift());
    drawn++;
  }
  return drawn;
}
