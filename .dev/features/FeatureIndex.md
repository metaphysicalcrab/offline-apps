# Feature Index — Draw

> Master index of all documented features, systems, and utilities.
> Claude Code: Scan this index to find the right doc before modifying a feature, system, or utility.
> **Last updated:** 2026-03-25

## Features

> User-facing functionality — things a player/user directly interacts with.

| Name | One-liner | Doc |
|------|-----------|-----|
| Blackjack | Casino blackjack with full rules, practice tools, multiplayer, and NPC players | — |
| Free Draw | Basic deck drawing for any card game | — |
| King's Cup | Drinking game with customizable rules per card rank | — |
| High-Low | Guess if next card is higher or lower, track streaks | — |

## Systems

> Engine/game systems — runtime infrastructure that features depend on.

| Name | One-liner | Doc |
|------|-----------|-----|
| Deck System | Card creation, shuffling, shoe management | `src/game/deck.js`, `src/game/blackjack.js` |
| Multiplayer | PeerJS WebRTC peer-to-peer connections | `src/hooks/useMultiplayer.js` |
| Strategy Engine | Basic strategy lookup and Hi-Lo card counting | `src/game/blackjackStrategy.js` |
| NPC Player System | AI-controlled players for solo blackjack (betting, decisions, timing) | `src/game/npcPlayer.js` |

## Utilities

> Shared tools, helpers, singletons — cross-cutting concerns used by multiple features/systems.

| Name | One-liner | Doc |
|------|-----------|-----|
| useLocalStorage | Generic localStorage persistence hook | `src/hooks/useLocalStorage.js` |
| useAudio | Web Audio API sound effects | `src/hooks/useAudio.js` |
| useHaptics | Vibration feedback patterns | `src/hooks/useHaptics.js` |
| Theme System | Dark/light theme with inline style objects | `src/hooks/useTheme.js`, `src/styles/themes.js` |
