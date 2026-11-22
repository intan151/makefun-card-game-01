# Ember Duel

[![make.fun](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/c/best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/intan151/makefun-card-game-01/rank.svg)](https://make.fun/c/best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/intan151/makefun-card-game-01/reward.svg)](https://make.fun/c/best-card-game-20261122-1826)

A turn-based card battler, built for the make.fun **"Make the best card game"** bounty
([bounty page](https://make.fun/bounty/best-card-game-20261122-1826)).
You duel a Rival AI with a deck of four-element cards. Both sides start at **30 life**;
reduce the Rival to 0 to win.

## How it plays

- Each turn your energy grows by 1 (up to 10). Cards cost energy and deal their attack as damage.
- Four original elements, told apart by **colour and shape**: Fire ▲ (red), Water ● (blue),
  Leaf ◆ (green), Stone ■ (grey).
- **Element advantage** — Fire beats Leaf, Leaf beats Stone, Stone beats Water, Water beats
  Fire: +2 damage. The Rival reads this too, and prefers advantage plays.
- **Chain bonus** — play two cards of one element in a turn and the second gets +2 damage.
- **The Rival's strategy is readable**: it hoards energy early, then strikes hard when your
  life is low. Counter it by holding advantage cards for the right moment.
- Mouse or keyboard: click a card (or press 1–7) to play it, Enter to end your turn, M to mute.

## Feel

Cards slide and flip onto the table with a deal-in animation, life bars shake and float
damage numbers on every hit, and all sounds are synthesized with WebAudio — no audio files.

## Run it

Serve `game/` with any static server and open `game/index.html` in desktop Chrome.
It loads nothing from the network: every script, style and sound is a file under `game/`.

```sh
cd game && python3 -m http.server 8080
# open http://localhost:8080
```

Screenshot states (deterministic): `?shot=title`, `?shot=play`, `?shot=win`, `?shot=loss`.

## Layout

```
game/
  index.html        title / table / win-loss screens
  styles.css        table, cards, animations
  src/
    cards.js        elements, card pool, advantage + chain damage
    deck.js         deck building, shuffle, draw (seeded RNG)
    state.js        match state, turn rules, playing a card
    ai.js           Rival strategy: scoring and picking plays
    render.js       DOM rendering of the table and cards
    input.js        mouse + keyboard input
    audio.js        WebAudio synthesized sounds
    shots.js        deterministic screenshot states (?shot=…)
    main.js         bootstrap: wires state, input, AI and rendering
main.ts             entry program: copies game/ + screenshots/ to /output, writes dossier.json
vendor/makefun-game.ts   make.fun dossier library (kit copy, unchanged)
```

## License

MIT — see [LICENSE](LICENSE).
