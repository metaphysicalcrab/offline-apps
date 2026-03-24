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
