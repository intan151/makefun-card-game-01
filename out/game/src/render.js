// Ember Duel — DOM rendering. One job: turn state into the visible table.
import { ELEMENTS, cardById } from './cards.js';

const $ = (id) => document.getElementById(id);

export function elementShapeSvg(element, size) {
  const el = ELEMENTS[element];
  const s = size || 64;
  if (element === 'fire') {
    return `<svg width="${s}" height="${s}" viewBox="0 0 64 64"><path d="M32 6 L56 50 L8 50 Z" fill="${el.color}" stroke="${el.dark}" stroke-width="3" stroke-linejoin="round"/></svg>`;
  }
  if (element === 'water') {
    return `<svg width="${s}" height="${s}" viewBox="0 0 64 64"><path d="M32 6 C46 26 54 34 54 44 A22 22 0 1 1 10 44 C10 34 18 26 32 6 Z" fill="${el.color}" stroke="${el.dark}" stroke-width="3" stroke-linejoin="round"/></svg>`;
  }
  if (element === 'leaf') {
    return `<svg width="${s}" height="${s}" viewBox="0 0 64 64"><path d="M32 4 L60 32 L32 60 L4 32 Z" fill="${el.color}" stroke="${el.dark}" stroke-width="3" stroke-linejoin="round"/></svg>`;
  }
  return `<svg width="${s}" height="${s}" viewBox="0 0 64 64"><rect x="10" y="10" width="44" height="44" rx="6" fill="${el.color}" stroke="${el.dark}" stroke-width="3"/></svg>`;
}

// One face-up card. `playable` marks cards the player may click right now.
export function cardHtml(card, opts) {
  const o = opts || {};
  const el = ELEMENTS[card.element];
  const classes = ['card', 'el-' + card.element];
  if (o.playable) classes.push('playable');
  if (o.small) classes.push('small');
  if (o.dealt) classes.push('dealt');
  return `<div class="${classes.join(' ')}" data-card="${card.id}" ${o.index != null ? `data-index="${o.index}"` : ''} style="--el:${el.color};--eld:${el.dark}">
    <div class="card-cost" title="Energy cost">${card.cost}</div>
    <div class="card-art">${elementShapeSvg(card.element, o.small ? 26 : 48)}</div>
    <div class="card-name">${card.name}</div>
    <div class="card-element">${el.glyph} ${el.name}</div>
    <div class="card-attack" title="Attack damage">⚔ ${card.attack}</div>
  </div>`;
}

export function cardBackHtml() {
  return `<div class="card card-back"><div class="card-back-ember">🔥</div><div class="card-back-text">EMBER<br>DUEL</div></div>`;
}

function lifeBarHtml(life, max) {
  const pct = Math.max(0, Math.min(100, (life / max) * 100));
  const cls = life <= 10 ? ' low' : '';
  return `<div class="lifebar${cls}"><div class="lifefill" style="width:${pct}%"></div><span class="lifenumber">${life} / ${max}</span></div>`;
}

function energyPipsHtml(energy, max) {
  let pips = '';
  for (let i = 0; i < Math.max(max, 1); i++) {
    pips += `<span class="pip${i < energy ? ' on' : ''}">◆</span>`;
  }
  return pips;
}

// Full table render for a live game state.
export function renderTable(state) {
  $('ai-life').innerHTML = lifeBarHtml(state.aiLife, 30);
  $('player-life').innerHTML = lifeBarHtml(state.playerLife, 30);
  $('ai-count').textContent = state.aiHand.length + ' cards';
  $('player-count').textContent = state.playerHand.length + ' cards in hand · ' + state.playerDeck.length + ' in deck';
  $('turn-label').textContent = state.phase === 'play'
    ? (state.turnSide === 'player' ? `Your turn — Turn ${state.turn}` : `Rival is thinking… — Turn ${state.turn}`)
    : (state.phase === 'win' ? 'You win!' : state.phase === 'loss' ? 'You lose' : 'Ember Duel');
  $('energy').innerHTML = energyPipsHtml(state.playerEnergy, state.playerMaxEnergy);
  $('energy-label').textContent = `Energy ${state.playerEnergy}/${state.playerMaxEnergy}`;

  $('ai-hand').innerHTML = state.aiHand.map(() => cardBackHtml()).join('');
  $('ai-table').innerHTML = state.aiTable.length
    ? state.aiTable.slice(-4).map((id) => cardHtml(cardById(id), { small: true })).join('')
    : '<div class="table-empty">Rival has played nothing yet</div>';
  $('player-table').innerHTML = state.playerTable.length
    ? state.playerTable.slice(-4).map((id) => cardHtml(cardById(id), { small: true })).join('')
    : '<div class="table-empty">Your played cards appear here</div>';
  $('player-hand').innerHTML = state.playerHand.map((id, i) => {
    const card = cardById(id);
    const playable = state.phase === 'play' && state.turnSide === 'player' && card.cost <= state.playerEnergy;
    return cardHtml(card, { index: i, playable });
  }).join('');
  $('log').innerHTML = state.log.map((line) => `<div>${line}</div>`).join('');

  const endBtn = $('end-turn');
  endBtn.disabled = !(state.phase === 'play' && state.turnSide === 'player');
  endBtn.textContent = state.turnSide === 'player' ? 'End Turn ⏎' : 'Rival’s turn…';

  if (state.lastDamage) {
    const target = state.lastDamage.side === 'ai' ? $('ai-life') : $('player-life');
    const floater = document.createElement('div');
    floater.className = 'damage-float';
    floater.textContent = '−' + state.lastDamage.amount;
    target.appendChild(floater);
    setTimeout(() => floater.remove(), 900);
    target.classList.remove('shake');
    void target.offsetWidth;
    target.classList.add('shake');
    state.lastDamage = null; // shown once; later renders must not replay it
  }
}

export function showScreen(name) {
  for (const id of ['title-screen', 'game-screen', 'end-screen']) {
    $(id).classList.toggle('hidden', id !== name + '-screen');
  }
}

export function renderEnd(state) {
  const win = state.phase === 'win';
  $('end-title').textContent = win ? '🏆 YOU WIN!' : '💔 YOU LOSE';
  $('end-title').className = win ? 'end-title win' : 'end-title loss';
  $('end-text').textContent = win
    ? `The Rival's ember burns out. Your deck carried the day — ${state.playerLife} life to spare.`
    : `Your ember burns out. The Rival takes this duel — rematch and read its plays.`;
  $('end-score').textContent = `You ${state.playerLife} ♥  ·  Rival ${state.aiLife} ♥  ·  ${state.turn} turns`;
}
