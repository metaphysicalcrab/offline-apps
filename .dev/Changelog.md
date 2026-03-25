# Changelog — Draw

> Session log. One entry per Claude Code session summarizing what was accomplished.
> Newest sessions at top. Claude Code: Add an entry at the end of each session.

<!--
FORMAT:

## YYYY-MM-DD — [Brief session summary]
**Focus:** [What this session was primarily about]
- Key accomplishment or change
- Key accomplishment or change
- Issues encountered (reference L-### in Learnings.md if logged)
- Decisions made (reference DEC-### in Decisions.md if logged)
-->

## 2026-03-25 — Add NPC Multiplayer to Solo Blackjack
**Focus:** Add AI-controlled players to solo blackjack to simulate a real casino table
- Created `src/game/npcPlayer.js` — NPC behavior module (names, betting, action selection using basic strategy with ~10% mistake rate)
- Updated player model with `isNPC` flag, NPC auto-betting in NEW_ROUND, seat order shuffle each round
- Added NPC configuration screen to BlackjackLobby (add/remove 0-5 NPCs before starting solo)
- Added NPC auto-play effect in BlackjackGame with 800-1500ms delays per action for visual realism
- NPCs auto-rebuy when chips run out, decline insurance (basic strategy), and get filtered from player stats
- Human player seat position randomizes each round alongside NPCs
- Existing solo (0 NPCs) and real multiplayer modes unaffected

## 2026-03-25 — Fix Multiplayer Room Joining
**Focus:** Fix three bugs preventing multiplayer blackjack from working
- Added PeerJS peer config with explicit STUN servers and 8-second connection timeout (was silently hanging forever when signaling server unreachable)
- Added `isConnecting` state + "Connecting..." button feedback in lobby (was showing no loading indicator)
- Fixed guest player ID resolution: guests now use their actual PeerJS peer ID instead of picking the first non-host player (was broken with 2+ guests)
- Expanded error handling for PeerJS error types (network, server-error, unavailable-id)
- Learnings logged: L-002, L-003

## 2026-03-24 — Wire Up Multiplayer State Sync & Polish
**Focus:** Connect existing multiplayer infrastructure to game state, add animations and reconnection
- Wired host-authoritative multiplayer: host broadcasts game state on every phase change, guests render from synced state
- Added SYNC_STATE reducer action for guests to receive full state from host
- Added action routing: guests send actions to host via PeerJS, host dispatches and re-broadcasts
- Updated player identity system with peer IDs for multiplayer turn management
- Added multiplayer betting UI: all players place bets independently, host controls deal
- Added connection status bar (room code, player count, green/red indicator)
- Added 30-second turn timeout with countdown for multiplayer (auto-stand on timeout)
- Added card deal animation (slide-in with stagger) and dealer hole card flip animation
- Added guest reconnection with exponential backoff (3 attempts: 1s, 2s, 4s)
- Added "Waiting for..." indicators throughout multiplayer flow (lobby, betting, turns, results)
- Decisions made: DEC-004 (host-authoritative state sync pattern)

## 2026-03-24 — Multiplayer Blackjack Feature
**Focus:** Full blackjack game mode with multi-device multiplayer and casino practice tools
- Added BLACKJACK game mode with full casino rules (6-deck shoe, split/re-split up to 4, double down, insurance, surrender)
- Built pure game logic engine (`src/game/blackjack.js`) and basic strategy engine (`src/game/blackjackStrategy.js`)
- Created `useBlackjack` hook with useReducer state machine (betting → dealing → insurance → player turn → dealer turn → resolve)
- Built 8 new UI components: BlackjackGame, BlackjackHand, BlackjackBetting, BlackjackControls, BlackjackResults, BlackjackRules, BlackjackStrategy, BlackjackLobby
- Added practice tools: real-time optimal play hints, Hi-Lo card counting display (running count + true count), basic strategy chart (hard/soft/pairs), comprehensive rules breakdown with casino etiquette
- Added PeerJS (WebRTC) for multi-device multiplayer via room codes — host-authoritative model, no backend needed
- Stats tracking: hands played, win rate, blackjacks, persisted to localStorage
- Decisions made: DEC-002 (PeerJS for multiplayer), DEC-003 (lobby pattern)

## 2026-03-21 — Project Initialized
**Focus:** Framework setup
- Initialized Dev Framework (.dev/ directory structure)
- Configured universal standards and project templates
