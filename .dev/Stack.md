# Stack & Dependencies — Draw

> **Last updated:** 2026-03-21
> Claude Code: Update when dependencies are added, removed, or upgraded.
> Check this before suggesting package upgrades or new dependencies.

## Runtime & Language

| Component | Version | Notes |
|-----------|---------|-------|
| Node.js | — | Check local version |
| JavaScript | ES2020+ | JSX via Vite |

## Core Dependencies

| Package | Version | Purpose | Pinned? |
|---------|---------|---------|---------|
| react | ^18.3.1 | UI framework | No |
| react-dom | ^18.3.1 | React DOM renderer | No |
| peerjs | ^1.x | WebRTC for multiplayer (lazy-loaded) | No |

## Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| vite | ^6.0.0 | Build tool & dev server |
| @vitejs/plugin-react | ^4.3.4 | React support for Vite |
| vite-plugin-pwa | ^0.21.1 | PWA/service worker generation |
| sharp | ^0.33.5 | Icon generation script |

## External Services & APIs

| Service | Purpose | Auth Method | Docs |
|---------|---------|-------------|------|
| PeerJS Cloud | WebRTC signaling for multiplayer room connections | None (public) | peerjs.com |

## Infrastructure

| Component | Provider | Notes |
|-----------|----------|-------|
| Hosting | Vercel | Static site deployment |

## Version Constraints

<!-- Document known compatibility issues and version pins -->

## Upgrade Log

| Date | Package | From | To | Notes |
|------|---------|------|----|-------|
