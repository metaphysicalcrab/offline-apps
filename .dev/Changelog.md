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

## 2026-06-06 — Blackjack: Haptic Feedback
**Focus:** Wire the previously-unused haptics into the blackjack table (mobile polish)
- `haptics` was passed into BlackjackGame but never used despite the infra existing in every other mode
- Added tap haptics on player actions (hit/stand/double/split/surrender), chip taps/bets, deal, insurance, next hand, and recharge
- Added round-outcome haptics for the local player: success on a net win, fail on a net loss, a distinct celebratory buzz on a natural blackjack, nothing on a push
- All routed through the existing `vibrate` helper, which self-guards on the user's haptics-enabled setting and `navigator.vibrate` support

## 2026-06-06 — Blackjack: Top Helper Banner, Mid-Game Recharge, Dealer Peek
**Focus:** UX visibility fix, a way to top up funds, and a rules-correctness fix
- Moved the strategy helper/feedback banner into the pinned top zone so it's always visible regardless of scroll position or seat in the turn order
- Fixed after-mode feedback being wiped instantly when the last player acted — feedback now persists (cleared only when a new betting round begins) and auto-dismisses after 3s
- Added mid-game recharge: "＋ Add $500" button in betting plus a broke-state prompt in betting and results; only the host/solo player can recharge
- Added session net P&L to the stats bar (current chips − total buy-in, tracked in-memory and reset on table leave)
- Dealer now peeks for blackjack (US rules) so players can't hit/double/split into a dealer natural — see DEC-005
- Visual polish: banner slide-in animation and a balance pulse on top-up (both respect prefers-reduced-motion)
- Decisions made: DEC-005 (dealer peek)

## 2026-03-25 — Auto-scroll to Active Player
**Focus:** Reduce scrolling fatigue by auto-scrolling to the active player's hand
- Added refs to middle zone and player sections
- useEffect scrolls active player into view (smooth, centered) when turn changes
- Works for both local and NPC players during play phase

## 2026-03-25 — Fix Sticky Dealer/Buttons Not Working
**Focus:** Fix the 3-zone layout so dealer hand and action buttons are truly pinned
- Root cause: App container used `minHeight: 100dvh` which allowed it to grow beyond viewport, breaking flex height constraints
- Fix: When in Blackjack mode, override app container to `height: 100dvh; overflow: hidden` so the 3-zone flex layout is properly constrained
- Dealer hand stays visible at top, action buttons stay pinned at bottom, only player hands scroll

## 2026-03-25 — Sticky Layout + Learning Mode for Blackjack
**Focus:** Improve mobile UX and add post-action feedback for learning basic strategy
- Restructured BlackjackGame layout into 3 zones: pinned top (dealer), scrollable middle (player hands), pinned bottom (controls/betting/stats)
- Dealer hand and action buttons now always visible on mobile without scrolling
- Replaced binary hints toggle (ON/OFF) with 3-way hint mode: OFF / BEFORE / AFTER
- AFTER mode shows green/red feedback after each action, comparing player choice to basic strategy optimal play
- Feedback auto-dismisses after 3 seconds and clears on phase changes

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
