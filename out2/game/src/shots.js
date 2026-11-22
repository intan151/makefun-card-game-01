// Ember Duel — deterministic screenshot states. One job: build each ?shot=
// scene from a fixed seed so screenshots are reproducible renders of the game.
import { createGame, playCard, startAiTurn } from './state.js';
import { runAiTurn } from './ai.js';
import { cardById } from './cards.js';

// A mid-game table: both sides have played, both hands are full, lives differ.
export function buildPlayShot() {
  const state = createGame(20261122);
  state.phase = 'play';
  state.turn = 4;
  state.playerMaxEnergy = 4; state.playerEnergy = 2;
  state.aiMaxEnergy = 4; state.aiEnergy = 3;
  state.playerLife = 24; state.aiLife = 18;
  state.playerHand = ['cinder-fox', 'tidal-wave', 'thorn-rabbit', 'pebble', 'magma-golem'];
  state.aiHand = ['ember-spark', 'spring-drip', 'sprout', 'pebble', 'river-otter'];
  state.playerTable = ['ember-spark', 'vine-snake'];
  state.aiTable = ['spring-drip', 'rock-crab'];
  state.playerLastElement = 'leaf';
  state.aiLastElement = 'stone';
  state.log = [
    'Rival played Rock Crab — 4 damage.',
    'You played Vine Snake — 3 damage.',
    'Rival played Spring Drip — 2 damage.',
    'Turn 4 — your energy is now 4.',
  ];
  return state;
}

export function buildWinShot() {
  const state = buildPlayShot();
  state.phase = 'win';
  state.winner = 'player';
  state.aiLife = 0;
  state.playerLife = 14;
  state.playerTable = ['ember-spark', 'vine-snake', 'wildfire'];
  state.log = ['You played Wildfire — 6 damage.', "The Rival ember burns out — YOU WIN!"];
  return state;
}

export function buildLossShot() {
  const state = buildPlayShot();
  state.phase = 'loss';
  state.winner = 'ai';
  state.playerLife = 0;
  state.aiLife = 11;
  state.aiTable = ['spring-drip', 'rock-crab', 'deep-whale'];
  state.log = ['Rival played Deep Whale — 8 damage.', 'Your ember burns out — the Rival wins.'];
  return state;
}

// Resolve ?shot=title|play|win|loss to a state (null = normal new game).
export function shotState() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot === 'play') return { state: buildPlayShot(), screen: 'game' };
  if (shot === 'win') return { state: buildWinShot(), screen: 'end' };
  if (shot === 'loss') return { state: buildLossShot(), screen: 'end' };
  if (shot === 'title') return { state: null, screen: 'title' };
  return null;
}

// Keep the imports honest: a real game can also reach these states by playing.
export function demoOpeningMoves() {
  const state = createGame(7);
  startAiTurn(state);
  runAiTurn(state, null);
  return state;
}

export { cardById };
