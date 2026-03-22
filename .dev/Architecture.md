# Architecture — Draw

> **Last updated:** 2026-03-21
> Claude Code: Update this doc when adding components, changing relationships, or modifying infrastructure.

## System Overview

<!-- High-level: what does this system do and how is it structured? -->

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 18 | Component-based UI |
| Build Tool | Vite 6 | Fast HMR, ES modules |
| PWA | vite-plugin-pwa + Workbox | Offline-first service worker |
| Styling | CSS (vanilla) | Theme system via CSS custom properties |
| Deployment | Vercel | Static hosting |

## Component Map

<!-- List major components/modules. Add entries as the project grows. -->

### Component: [Name]
- **Purpose:**
- **Location:** `/src/...`
- **Dependencies:**
- **API/Interface:**

## Data Flow

<!-- Request lifecycle, event flows, data transformation pipeline -->

## Integration Points

<!-- External services, APIs, webhooks, third-party libraries -->

## Directory Structure

```
/
├── .dev/               # Project intelligence framework
├── .claude/            # Claude Code configuration
├── src/                # Source code
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── game/           # Game logic (deck, rules)
│   └── styles/         # Theme definitions
├── public/             # Static assets (icons, favicon)
├── scripts/            # Build scripts (icon generation)
└── ...
```

## Key Patterns in Use

<!-- Document adopted patterns. Link to Decisions.md for the "why". -->

## Known Constraints & Technical Debt

<!-- Be honest. Future sessions need to know about landmines. -->
