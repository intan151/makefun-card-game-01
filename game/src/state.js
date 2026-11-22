// Ember Duel — game state and turn rules. One job: own the match state.
import { buildDeck, drawCards, makeRng } from './deck.js';
import { cardById, computeDamage } from './cards.js';

export const START_LIFE = 30;
export const START_HAND = 5;
export const MAX_ENERGY = 10;

export function createGame(seed) {
  const rng = makeRng(seed ?? (Date.now() % 2147483647));
  const state = {
    seed,
    rng,
    turn: 1,
    phase: 'title', // title | play | win | loss
    turnSide: 'player',
    playerLife: START_LIFE,
    aiLife: START_LIFE,
    playerEnergy: 1,
    playerMaxEnergy: 1,
    aiEnergy: 0,
    aiMaxEnergy: 0,
    playerDeck: buildDeck(rng),
    aiDeck: buildDeck(rng),
    playerHand: [],
    aiHand: [],
    playerTable: [], // cards played this match, most recent last
    aiTable: [],
    playerPlayedElements: [], // elements played by the player this turn
    aiPlayedElements: [],
    playerLastElement: null,
    aiLastElement: null,
    log: ['Ember Duel begins. You go first — play a card!'],
    lastDamage: null, // { side, amount } for the floating damage number
    winner: null,
  };
  drawCards(state, 'player', START_HAND);
  drawCards(state, 'ai', START_HAND);
  state.phase = 'play';
  return state;
}

export function handCard(state, side, index) {
  const hand = side === 'player' ? state.playerHand : state.aiHand;
  const id = hand[index];
  return id ? cardById(id) : null;
}

export function canPlayCard(state, side, index) {
  if (state.phase !== 'play' || state.turnSide !== side) return false;
  const card = handCard(state, side, index);
  if (!card) return false;
  const energy = side === 'player' ? state.playerEnergy : state.aiEnergy;
  return card.cost <= energy;
}

// Play a card from a hand onto the table: pay energy, deal damage to the
// other side, record the element for advantage / chain bonuses.
export function playCard(state, side, index) {
  if (!canPlayCard(state, side, index)) return null;
  const card = handCard(state, side, index);
  const foe = side === 'player' ? 'ai' : 'player';
  const foeLast = side === 'player' ? state.aiLastElement : state.playerLastElement;
  const played = side === 'player' ? state.playerPlayedElements : state.aiPlayedElements;
  const { damage, bonuses } = computeDamage(card, foeLast, played);

  if (side === 'player') {
    state.playerHand.splice(index, 1);
    state.playerEnergy -= card.cost;
    state.playerTable.push(card.id);
    state.playerPlayedElements.push(card.element);
    state.playerLastElement = card.element;
    state.aiLife = Math.max(0, state.aiLife - damage);
  } else {
    state.aiHand.splice(index, 1);
    state.aiEnergy -= card.cost;
    state.aiTable.push(card.id);
    state.aiPlayedElements.push(card.element);
    state.aiLastElement = card.element;
    state.playerLife = Math.max(0, state.playerLife - damage);
  }
  state.lastDamage = { side: foe, amount: damage };
  const who = side === 'player' ? 'You' : 'Rival';
  const bonusText = bonuses.length ? ' (' + bonuses.join(', ') + ')' : '';
  state.log.unshift(`${who} played ${card.name} — ${damage} damage${bonusText}.`);
  state.log = state.log.slice(0, 5);
  checkEnd(state);
  return { card, damage, bonuses };
}

export function startPlayerTurn(state) {
  state.turn += 1;
  state.turnSide = 'player';
  state.playerMaxEnergy = Math.min(MAX_ENERGY, state.playerMaxEnergy + 1);
  state.playerEnergy = state.playerMaxEnergy;
  state.playerPlayedElements = [];
  drawCards(state, 'player', 1);
  state.log.unshift(`Turn ${state.turn} — your energy is now ${state.playerEnergy}.`);
  state.log = state.log.slice(0, 5);
}

export function startAiTurn(state) {
  state.turnSide = 'ai';
  state.aiMaxEnergy = Math.min(MAX_ENERGY, state.aiMaxEnergy + 1);
  state.aiEnergy = state.aiMaxEnergy;
  state.aiPlayedElements = [];
  drawCards(state, 'ai', 1);
}

export function checkEnd(state) {
  if (state.aiLife <= 0) {
    state.phase = 'win';
    state.winner = 'player';
    state.log.unshift('The Rival ember burns out — YOU WIN!');
  } else if (state.playerLife <= 0) {
    state.phase = 'loss';
    state.winner = 'ai';
    state.log.unshift('Your ember burns out — the Rival wins.');
  }
}
