# Learnings — Draw

> Hard-won knowledge. Bugs, gotchas, surprises, and better approaches discovered through experience.
> Claude Code: **Read this before implementing.** Add entries when something unexpected happens.
> **Never delete entries** — consolidate during periodic reviews.
> Recurring learnings should be promoted to CodingStandards.md as formal standards.

<!--
TEMPLATE — Copy for each new learning:

## L-[NUMBER] — [Short descriptive title]
- **Date:** YYYY-MM-DD
- **Category:** Bug | Gotcha | Performance | Pattern | Tool | Integration | Security
- **Severity:** Low | Medium | High | Critical
- **What happened:** Brief description of the situation.
- **Root cause:** Why it happened (or best theory if uncertain).
- **Solution/Workaround:** How it was resolved.
- **Prevention:** How to avoid this in the future.
- **Time lost:** Rough estimate (helps prioritize prevention)
- **Related:** Links to code, decisions, other learnings, or external resources.
-->

## L-003 — PeerJS guest identity requires exposing peer ID
- **Date:** 2026-03-25
- **Category:** Bug
- **Severity:** High
- **What happened:** With 2+ guests in multiplayer blackjack, every guest controlled the same player. The guest player ID resolution used `multiplayer.players.find(p => !p.isHost && p.id)?.id` which always returns the first non-host player.
- **Root cause:** The hook didn't expose the guest's own PeerJS peer ID. Without it, there was no way to distinguish which player "I" am.
- **Solution/Workaround:** Added `myPeerId` state to `useMultiplayer`, set from `peer.id` in the `open` handler. Guests use this directly as their `localPlayerId`.
- **Prevention:** When building multiplayer identity systems, always expose the local player's unique ID from the connection layer.
- **Time lost:** N/A (discovered during bug investigation)
- **Related:** L-001

## L-002 — PeerJS default cloud server hangs silently when unreachable
- **Date:** 2026-03-25
- **Category:** Bug
- **Severity:** Critical
- **What happened:** Clicking "Join" or "Create" in multiplayer lobby did nothing — no error, no loading, no feedback.
- **Root cause:** `new Peer()` with no config uses the free PeerJS cloud server (`0.peerjs.com`). When unreachable, `peer.on('open')` never fires and there was no timeout. Combined with no loading state, users saw zero feedback.
- **Solution/Workaround:** Added explicit STUN server config, 8-second connection timeout that destroys the peer and shows an error, and `isConnecting` state for UI feedback.
- **Prevention:** Always add connection timeouts for external service dependencies. Always show loading states for async connection operations.
- **Time lost:** N/A (discovered during bug investigation)
- **Related:** PeerJS ^1.5.5, src/hooks/useMultiplayer.js

## L-001 — PeerJS state sync needs ref-based access in callbacks
- **Date:** 2026-03-24
- **Category:** Gotcha
- **Severity:** Medium
- **What happened:** The `setOnAction` callback registered with PeerJS captures stale game state via closure, causing actions to be dispatched against outdated state.
- **Root cause:** React hooks capture values at render time. PeerJS callbacks registered once don't re-capture updated state.
- **Solution/Workaround:** Use `useRef` to hold current game state (`gameRef.current = game`) and access via ref inside callbacks. The `setOnAction` callback reads from `gameRef.current` instead of the closure-captured `game`.
- **Prevention:** Always use refs for values accessed in long-lived callbacks (WebSocket handlers, PeerJS data handlers, timers).
- **Time lost:** ~15 min
- **Related:** DEC-004
