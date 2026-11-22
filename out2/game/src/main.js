// Ember Duel — bootstrap. One job: wire state, rendering, input and AI together.
import { createGame, startPlayerTurn, startAiTurn, playCard } from './state.js';
import { pickAiCard } from './ai.js';
import { renderTable, renderEnd, showScreen } from './render.js';
import { bindInput } from './input.js';
import { shotState } from './shots.js';
import { soundDeal, soundTurn, soundWin, soundLoss, soundDamage } from './audio.js';

let state = null;
let aiBusy = false;

function refresh() {
  renderTable(state);
  if (state.phase === 'win' || state.phase === 'loss') {
    renderEnd(state);
    showScreen('end');
    if (state.phase === 'win') soundWin(); else soundLoss();
  }
}

function newGame() {
  state = createGame();
  aiBusy = false;
  showScreen('game');
  renderTable(state);
  soundDeal();
}

// The Rival plays one card, pauses so it slides in, then plays the next.
function aiPlayStep() {
  if (!state || state.phase !== 'play') { aiBusy = false; refresh(); return; }
  const index = pickAiCard(state);
  if (index === -1) {
    startPlayerTurn(state);
    soundTurn();
    aiBusy = false;
    renderTable(state);
    return;
  }
  const result = playCard(state, 'ai', index);
  if (result) { soundDeal(); setTimeout(soundDamage, 150); }
  renderTable(state);
  if (state.phase !== 'play') { aiBusy = false; refresh(); return; }
  setTimeout(aiPlayStep, 650);
}

function endTurn() {
  if (!state || state.phase !== 'play' || state.turnSide !== 'player' || aiBusy) return;
  aiBusy = true;
  startAiTurn(state);
  renderTable(state);
  setTimeout(aiPlayStep, 700);
}

function start() {
  const shot = shotState();
  bindInput(() => state, { onEndTurn: endTurn, onRestart: newGame, onPlayerPlayed: refresh });
  document.getElementById('start-btn').addEventListener('click', newGame);
  document.getElementById('how-btn').addEventListener('click', () => {
    document.getElementById('howto').classList.toggle('hidden');
  });

  if (shot) {
    document.body.classList.add('no-anim');
    if (shot.screen === 'title') { showScreen('title'); return; }
    state = shot.state;
    if (shot.screen === 'end') {
      renderTable(state);
      renderEnd(state);
      showScreen('end');
    } else {
      showScreen('game');
      renderTable(state);
    }
    return;
  }

  // Normal play: title screen first, then a fresh game on Start.
  showScreen('title');
}

start();
