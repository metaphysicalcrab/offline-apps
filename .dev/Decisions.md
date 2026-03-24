# Decisions — Draw

> Architecture Decision Records (ADRs). **Append-only.**
> Claude Code: Add an entry whenever a meaningful technical decision is made.
> **Never delete entries** — mark superseded decisions as `Superseded by DEC-XXX`.

<!--
TEMPLATE — Copy for each new decision:

## DEC-[NUMBER] — [Title]
- **Date:** YYYY-MM-DD
- **Status:** Accepted | Superseded by DEC-XXX | Deprecated
- **Context:** What situation or problem prompted this decision?
- **Options Considered:**
  1. **[Option A]** — Pros: ... / Cons: ...
  2. **[Option B]** — Pros: ... / Cons: ...
- **Decision:** What was chosen and why.
- **Consequences:** What this means going forward. Trade-offs accepted.
- **Related:** Links to relevant learnings, architecture sections, or other decisions.
-->

## DEC-004 — Host-Authoritative State Sync for Multiplayer
- **Date:** 2026-03-24
- **Status:** Accepted
- **Context:** Need to sync blackjack game state across devices connected via PeerJS WebRTC.
- **Options Considered:**
  1. **Host-authoritative (full state broadcast)** — Pros: Simple, no desync possible, host validates all actions / Cons: More bandwidth (full state each update), single point of failure
  2. **Action replay (broadcast actions only)** — Pros: Less bandwidth / Cons: Desync risk, harder to debug, need deterministic random
  3. **CRDT / eventual consistency** — Pros: Resilient to network issues / Cons: Massive overkill for a turn-based game
- **Decision:** Host-authoritative with full state broadcast. The host runs the `useBlackjack` reducer as source of truth. Guests send actions to host, host dispatches locally and broadcasts the resulting state via `SYNC_STATE`. Guests replace their local state wholesale.
- **Consequences:** If host disconnects, game ends for all players (acceptable for casual PWA). State payloads include the shoe array (~300 cards) which is larger than necessary but simplifies the protocol. Guest actions have slight network latency but blackjack is turn-based so this is imperceptible.
- **Related:** DEC-002 (PeerJS choice), DEC-003 (lobby pattern)

## DEC-003 — Blackjack Lobby Pattern for Mode Entry
- **Date:** 2026-03-24
- **Status:** Accepted
- **Context:** Blackjack has multiplayer and solo modes needing a pre-game entry point, unlike other modes which start immediately.
- **Decision:** BlackjackGame renders a lobby (BlackjackLobby) first, where players choose solo/create/join. After selection, the lobby hides and the game table renders.
- **Consequences:** Blackjack has its own navigation flow within the game mode. Future multiplayer modes can reuse this pattern.

## DEC-002 — PeerJS (WebRTC) for Multi-Device Multiplayer
- **Date:** 2026-03-24
- **Status:** Accepted
- **Context:** Need multi-device play without a backend server (Vercel static hosting).
- **Options Considered:**
  1. **PeerJS (WebRTC)** — Pros: No backend, free signaling server, works cross-network / Cons: Requires internet for signaling, PeerJS cloud dependency
  2. **WebSocket server** — Pros: More reliable / Cons: Requires backend infrastructure, hosting costs
  3. **Local-only same device** — Pros: Zero complexity / Cons: Not true multi-device
- **Decision:** PeerJS with lazy-loading (dynamic import) so offline single-player still works. Host-authoritative model where one device manages game state.
- **Consequences:** Added `peerjs` as production dependency (~115KB gzipped, code-split). Multiplayer requires internet for initial connection but could theoretically work on LAN. Single-player remains fully offline.

## DEC-001 — Adopt Dev Framework for Project Intelligence
- **Date:** 2026-03-21
- **Status:** Accepted
- **Context:** Need structured way to maintain project knowledge across Claude Code sessions and prevent context amnesia.
- **Decision:** Using .dev/ directory framework with CLAUDE.md entry point and universal/project-specific doc layers.
- **Consequences:** All significant decisions logged here. Claude Code reads before deciding, writes after deciding. Human review on periodic cadence.
