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

## DEC-006 — Allow "Double For Less"; `hand.bet` Holds the Full Committed Wager
- **Date:** 2026-06-06
- **Status:** Accepted
- **Context:** Doubling down was hidden entirely whenever the player's remaining chips were below their original bet (`canDouble` returned false on `chips < bet`). A player on a downswing couldn't double even in textbook spots (e.g. 11 vs. dealer 6) simply because their balance had dipped under the bet. Separately, the wager model stored `bet` as the *original* stake and recomputed the doubled total as `isDoubled ? bet * 2` in three places — fine for full doubles but unable to represent a partial double.
- **Options Considered:**
  1. **Keep hiding double when short** — Pros: zero change / Cons: frustrating, blocks correct play, doesn't match common casino "double for less" courtesy.
  2. **Double for less, tracked via a separate `doubleBet` field** — Pros: keeps `bet` meaning "original" / Cons: another field threaded through ~6 hand initializers and all payout/display sites; two sources of truth for the total.
  3. **Double for less, fold the doubled stake into `hand.bet`** — Pros: single source of truth for the committed wager, deletes the scattered `× 2` logic, payouts/display "just work" for full and partial doubles / Cons: `bet` semantics shift (now total, not original) — anything reading `bet` after a double sees the larger number (desired here).
- **Decision:** Option 3. `canDouble` now only requires `chips > 0`; the `DOUBLE` reducer stakes `min(originalBet, chips)` and adds it to `hand.bet`. `resolveHand`, results building, and the hand display read `hand.bet` directly (no multiplier). The control relabels to `Double $<amount>` when the stake is reduced.
- **Consequences:** Short-stacked players (human and NPC) can always double for whatever they have. `hand.bet` means "total committed wager" post-double; split/insurance/canSplit all read it *before* any double so they're unaffected. Blackjack hands are never doubled, so the BJ bonus still uses the original `bet` correctly.
- **Related:** `src/game/blackjack.js` (`canDouble`, `resolveHand`), `src/hooks/useBlackjack.js` (`DOUBLE`, results), `src/components/BlackjackControls.jsx`, `src/components/BlackjackHand.jsx`

## DEC-005 — Dealer Peeks for Blackjack (US "Peek" Rules)
- **Date:** 2026-06-06
- **Status:** Accepted
- **Context:** When the dealer's upcard was a ten-value card, the game still routed to the player turn even though the dealer held a natural. Players could then hit, double, or split into a guaranteed dealer blackjack and lose more than their original wager. With an Ace upcard, insurance was offered but the peek still never happened. This is incorrect under standard US table rules and contradicts the basic-strategy trainer, which assumes peek.
- **Options Considered:**
  1. **No peek (European/ENHC rules)** — Pros: simplest / Cons: punishes doubles/splits against dealer naturals, surprising to most players, mismatched with the strategy engine.
  2. **Peek for blackjack (US rules)** — Pros: matches the strategy engine and player expectations, prevents over-committing chips / Cons: slightly more reducer branching.
- **Decision:** Dealer peeks. In `DEAL`, when the upcard is ten-value and the dealer has a natural (or every player has blackjack), the round goes straight to `DEALER_TURN`. When the upcard is an Ace, insurance is offered first and the peek is deferred to the `TAKE_INSURANCE` / `DECLINE_INSURANCE` handlers, which route to `DEALER_TURN` if the dealer has blackjack. Hole-card reveal and count tracking continue to flow through `DEALER_PLAY`.
- **Consequences:** Player decisions can no longer be made against a known dealer natural. Basic-strategy hints/feedback now align with actual outcomes. The insurance flow is unchanged for the player; only post-decision routing gained a blackjack check.
- **Related:** DEC-004, `src/hooks/useBlackjack.js`

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
