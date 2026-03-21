# Draw — Card Game Companion

A fully offline PWA that replaces a physical deck of cards. Perfect for camping, road trips, and anywhere without cell service.

## Game Modes

- **Free Draw** — Draw from a shuffled 52-card deck, undo, reshuffle
- **King's Cup** — Classic drinking game with customizable rules per rank, tracks king count
- **High-Low** — Guess if the next card is higher or lower, streak tracking

## Features

- 3D card flip animations
- Turn tracker with player management
- Customizable King's Cup rules (persisted)
- Sound effects (Web Audio API synthesis)
- Haptic feedback on supported devices
- Shake to shuffle
- Dark/light theme
- Drawn card history
- Full offline support — install as PWA

## Development

```bash
npm install
npm run dev
```

## Build & Deploy

```bash
npm run generate-icons   # generates PWA icons from SVG
npm run build            # production build
npm run preview          # preview production build locally
```

Deploy the `dist/` folder to any static host. Includes `vercel.json` for Vercel deployment.

## PWA Install

1. Open in Chrome/Safari
2. Tap "Add to Home Screen" or install prompt
3. Works fully offline after first load
