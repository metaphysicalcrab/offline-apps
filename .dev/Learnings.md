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
