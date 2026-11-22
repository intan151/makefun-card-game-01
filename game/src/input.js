// Ember Duel — mouse and keyboard input. One job: turn clicks and keys into moves.
// getState is a function returning the live state, so input keeps working
// after a restart replaces the state object.
import { playCard } from './state.js';
import { soundClick, soundDamage, soundPlayCard, toggleMute, isMuted } from './audio.js';

export function bindInput(getState, hooks) {
  // Click a card in the player's hand to play it.
  document.getElementById('player-hand').addEventListener('click', (event) => {
    const el = event.target.closest('.card');
    if (!el || !el.dataset.index) return;
    tryPlay(getState(), Number(el.dataset.index), hooks);
  });

  document.getElementById('end-turn').addEventListener('click', () => {
    if (hooks.onEndTurn) hooks.onEndTurn();
  });

  document.getElementById('mute-btn').addEventListener('click', (event) => {
    const muted = toggleMute();
    event.target.textContent = muted ? '🔇 Sound off' : '🔊 Sound on';
  });

  document.getElementById('restart-btn').addEventListener('click', () => {
    if (hooks.onRestart) hooks.onRestart();
  });

  // Keyboard: 1–7 play a hand card, Enter/Space ends the turn, M mutes.
  document.addEventListener('keydown', (event) => {
    const state = getState();
    if (!state) return;
    if (state.phase !== 'play') {
      if ((event.key === 'Enter' || event.key === ' ') && state.phase !== 'title') {
        if (hooks.onRestart) hooks.onRestart();
      }
      return;
    }
    if (event.key >= '1' && event.key <= '7') {
      tryPlay(state, Number(event.key) - 1, hooks);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (hooks.onEndTurn) hooks.onEndTurn();
    } else if (event.key === 'm' || event.key === 'M') {
      const muted = toggleMute();
      document.getElementById('mute-btn').textContent = muted ? '🔇 Sound off' : '🔊 Sound on';
    }
  });
}

function tryPlay(state, index, hooks) {
  if (state.phase !== 'play' || state.turnSide !== 'player') return;
  const result = playCard(state, 'player', index);
  if (!result) { soundClick(); return; }
  soundPlayCard();
  setTimeout(soundDamage, 120);
  if (hooks.onPlayerPlayed) hooks.onPlayerPlayed(result);
}
