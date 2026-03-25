# Proposals — Draw

> Ideas, experiments, and design explorations. Track from brainstorm to decision.
> Claude Code: **Create a proposal here before implementing speculative features.**
> **Never delete entries** — mark as Archived with rationale instead.
> See [CONTRIBUTING.md](CONTRIBUTING.md) for entry format and lifecycle.

<!--
TEMPLATE — Copy for each new proposal:

## PRO-[NUMBER] — [Short descriptive title]
- **Date:** YYYY-MM-DD
- **Status:** Draft | Exploring | Accepted | Archived
- **Type:** Feature | Architecture | Process | Tool
- **Summary:** One paragraph — what is this idea?
- **Motivation:** Why does this matter? What problem does it solve?
- **Approach:** High-level how — could be a paragraph or bullet list
- **POC:** Link to branch, design doc, or inline exploration notes
- **Outcome:** (filled when resolved) What happened, why accepted/archived
- **Related:** DEC-xxx if accepted, L-xxx for relevant learnings
-->

## PRO-001 — NPC Multiplayer for Solo Blackjack
- **Date:** 2026-03-25
- **Status:** Accepted
- **Type:** Feature
- **Summary:** Add AI-controlled NPC players to the solo blackjack table to simulate a real casino environment with multiple players.
- **Motivation:** Solo blackjack is 1v1 against the dealer, which doesn't capture the feel of a real casino table. NPCs add visual activity, affect shoe depletion, and make practice more immersive.
- **Approach:** NPCs use `isNPC` flag on existing player model. Leverage `getOptimalAction()` from strategy engine for NPC decisions (~90% accuracy). Auto-bet proportional to chips with randomization. Staggered delays for visual realism. Seat order randomizes each round. Configurable 0-5 NPCs from lobby.
- **Outcome:** Implemented. New file `src/game/npcPlayer.js`, changes to useBlackjack.js reducer, BlackjackLobby.jsx, and BlackjackGame.jsx.
- **Related:** —
