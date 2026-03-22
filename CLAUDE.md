# CLAUDE.md — Draw

> Entry point for Claude Code. Read relevant `.dev/` docs before making changes — don't guess.

## Project

- **Name:** Draw
- **Created:** 2026-03-21
- **Stack:** React 18 / Vite 6 / PWA (vite-plugin-pwa + Workbox)
- **Status:** Active Development

## Rules

> **MANDATORY: Update `.dev/` docs after every task.** Changelog always. Learnings/Decisions/Architecture when relevant. No exceptions. See [CONTRIBUTING.md](.dev/CONTRIBUTING.md).

1. **Before writing code** → read [Architecture.md](.dev/Architecture.md) and [CodingStandards.md](.dev/CodingStandards.md)
2. **Before design/architecture choices** → check [Decisions.md](.dev/Decisions.md) for prior decisions
3. **Before implementing UI** → read [DesignSystem.md](.dev/DesignSystem.md) and [DesignStandards.md](.dev/DesignStandards.md)
4. **Before implementing anything** → check [Learnings.md](.dev/Learnings.md) for known pitfalls
5. **Before adding dependencies** → check [Stack.md](.dev/Stack.md) for existing deps and constraints
6. **Before brainstorming or prototyping** → create a proposal in [Proposals.md](.dev/Proposals.md) first
7. **Before making architectural decisions** → search cross-project learnings via MCP if available
8. **Project standards override universal** → [.dev/CodingStandards.md](.dev/CodingStandards.md) wins over [.dev/universal/CodingStandards.md](.dev/universal/CodingStandards.md)
9. **If multiple git authors detected** but no `.dev/.team` → recommend `dev team init`
10. **If `.gitattributes` missing merge rules** → recommend `dev hooks install`

## Context Loading

Choose based on task size. When `.dev/.summary.md` exists, use it for efficiency.

**Quick tasks** (bug fix, small tweak):
→ Load `.dev/.summary.md` only. It has architecture, active decisions, critical learnings, and stack in one file.

**Standard tasks** (feature, refactor):
→ Load Architecture.md + CodingStandards.md (both levels) + Learnings.md + Decisions.md + Proposals.md + Stack.md + Feature Index

**Large tasks** (new module, major refactor):
→ Load ALL `.dev/` docs including universals.

If `.dev/.summary.md` is missing or stale, read individual docs instead.

## Docs

| Doc | When to Read | Path |
|-----|-------------|------|
| **Summary** | Quick tasks — condensed context | [.dev/.summary.md](.dev/.summary.md) |
| Architecture | Adding features, refactoring | [.dev/Architecture.md](.dev/Architecture.md) |
| Coding Standards (universal) | Baseline conventions | [.dev/universal/CodingStandards.md](.dev/universal/CodingStandards.md) |
| Coding Standards (project) | Project overrides | [.dev/CodingStandards.md](.dev/CodingStandards.md) |
| Design System | Creating/modifying UI | [.dev/DesignSystem.md](.dev/DesignSystem.md) |
| Design Standards | UX decisions | [.dev/DesignStandards.md](.dev/DesignStandards.md) |
| Decisions | Architectural/tech choices | [.dev/Decisions.md](.dev/Decisions.md) |
| Learnings | Check for pitfalls | [.dev/Learnings.md](.dev/Learnings.md) |
| Proposals | Brainstorming, idea tracking | [.dev/Proposals.md](.dev/Proposals.md) |
| Stack | Dependencies & versions | [.dev/Stack.md](.dev/Stack.md) |
| **Feature Index** | Before modifying a feature/system | [.dev/features/FeatureIndex.md](.dev/features/FeatureIndex.md) |
| Changelog | Recent session history | [.dev/Changelog.md](.dev/Changelog.md) |
| Contributing | When updating docs | [.dev/CONTRIBUTING.md](.dev/CONTRIBUTING.md) |

## Team Mode

<!-- Remove this section if not using team mode -->
If `.dev/.team` exists, this project uses team mode:
- Detect current user from `git config user.name` (lowercased, spaces → hyphens)
- If `.dev/team/<username>/` doesn't exist, offer to create it (the user is new to the team)
- **At session start:** read `.dev/team/<username>/context.md` to resume where they left off
- **At session start:** read `.dev/team/<username>/preferences.md` — if it only contains HTML comments (no real content has been filled in), ask the developer to set up their preferences before proceeding with work. Ask about each section one at a time:
  1. **Communication Style** — How do you prefer me to communicate? (e.g., concise vs detailed, show alternatives, explain reasoning)
  2. **Coding Preferences** — Any personal style preferences? (e.g., named functions vs arrow functions, explicit types, brace style)
  3. **Areas of Expertise** — What are you strongest at? (so I can adjust my level of detail by topic)
  4. **Working On** — What are you currently focused on in this project?
  Write their answers into `preferences.md`, replacing the placeholder comments with real content. Keep answers concise — a few bullet points per section, not essays.
- **At session end:** update `.dev/team/<username>/context.md` with current task state, blockers, and next steps
- Use `@username` attribution on Learnings, Decisions, and Changelog entries
- Prefix entries with username: `L-<username>-001`, `DEC-<username>-001`
- See [.dev/team/TEAM_GUIDE.md](.dev/team/TEAM_GUIDE.md) for collaboration rules

## Cross-Project Intelligence

If the `dev-framework` MCP server is available:
- **Before making architectural decisions or choosing libraries**, use `search_learnings` and `search_decisions` to check if other projects have already encountered this problem or evaluated this tool. This is not optional for standard+ tasks.
- Use `search_proposals` to find related ideas across projects before creating new proposals
- This project's own docs take precedence over cross-project results

---
*Dev Framework — [.dev/README.md](.dev/README.md)*
