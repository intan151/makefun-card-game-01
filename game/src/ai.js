// Ember Duel — the Rival AI. One job: decide which cards the AI plays.
// Readable strategy: the Rival saves energy early, then strikes hard when the
// player's life is low, and always prefers an element-advantage play.
import { canPlayCard, handCard, playCard } from './state.js';
import { cardById, elementBeats } from './cards.js';

// Score one candidate play: damage per energy, with a bonus for advantage
// and for chaining the same element the Rival already played this turn.
export function scoreAiPlay(state, index) {
  const card = handCard(state, 'ai', index);
  if (!card) return -1;
  let score = card.attack / card.cost;
  if (elementBeats(card.element, state.playerLastElement)) score += 2;
  if (state.aiPlayedElements.includes(card.element)) score += 1;
  // When the player is nearly beaten, spend everything: prefer big hits.
  if (state.playerLife <= 8) score += card.attack * 0.5;
  // Early on, hoard: skip cheap plays while energy is low and life is safe.
  if (state.turn <= 2 && state.playerLife > 20 && card.cost <= 1) score -= 1.5;
  return score;
}

// Pick the AI's best playable card, or -1 when it should hold.
export function pickAiCard(state) {
  let best = -1;
  let bestScore = 0.6; // below this, the Rival holds its cards
  for (let i = 0; i < state.aiHand.length; i++) {
    if (!canPlayCard(state, 'ai', i)) continue;
    const score = scoreAiPlay(state, i);
    if (score > bestScore) { bestScore = score; best = i; }
  }
  return best;
}

// Play the AI's whole turn, one card at a time, calling onPlayed after each
// so the renderer can animate the card sliding onto the table.
export function runAiTurn(state, onPlayed) {
  const played = [];
  let guard = 0;
  while (guard++ < 10) {
    const index = pickAiCard(state);
    if (index === -1) break;
    const result = playCard(state, 'ai', index);
    if (!result) break;
    played.push(result);
    if (onPlayed) onPlayed(result);
    if (state.phase !== 'play') break;
  }
  return played;
}

export function aiHandSummary(state) {
  return state.aiHand.map((id) => cardById(id));
}
