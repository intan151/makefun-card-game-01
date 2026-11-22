// Ember Duel — synthesized sound. One job: all audio, WebAudio only, no files.
let audioContext = null;
let muted = false;

export function isMuted() { return muted; }
export function toggleMute() { muted = !muted; return muted; }

function ensureContext() {
  if (!audioContext) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioContext = new AC();
  }
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

// One short oscillator note: frequency slides from `from` to `to`.
export function playTone(from, to, duration, type, volume) {
  if (muted) return;
  const ctx = ensureContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(from, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), ctx.currentTime + duration);
  gain.gain.setValueAtTime(volume || 0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration + 0.02);
}

export function soundClick() { playTone(660, 520, 0.07, 'triangle', 0.08); }
export function soundDeal() { playTone(420, 700, 0.12, 'triangle', 0.1); }
export function soundPlayCard() { playTone(300, 900, 0.16, 'square', 0.08); }
export function soundDamage() { playTone(180, 60, 0.25, 'sawtooth', 0.14); }
export function soundTurn() { playTone(520, 780, 0.12, 'sine', 0.09); }

export function soundWin() {
  if (muted) return;
  [523, 659, 784, 1047].forEach((freq, i) => {
    setTimeout(() => playTone(freq, freq, 0.28, 'triangle', 0.12), i * 140);
  });
}

export function soundLoss() {
  if (muted) return;
  [392, 330, 262, 196].forEach((freq, i) => {
    setTimeout(() => playTone(freq, freq * 0.9, 0.3, 'sawtooth', 0.08), i * 160);
  });
}
