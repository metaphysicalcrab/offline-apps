import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Force-clear stale service workers and caches from previous deploys.
// The SW version is tied to the build hash — when it changes, we nuke everything.
const APP_VERSION = '__BUILD_TIME__';
const STORED_VERSION_KEY = 'card-app-version';

async function clearStaleCache() {
  const stored = localStorage.getItem(STORED_VERSION_KEY);
  if (stored === APP_VERSION) return;

  // Unregister all service workers
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  }

  // Clear all caches
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  }

  // Clear old localStorage keys from broken versions
  ['card-app-deck', 'card-app-current', 'card-app-history'].forEach((k) => {
    localStorage.removeItem(k);
  });

  localStorage.setItem(STORED_VERSION_KEY, APP_VERSION);

  // If we had a stale SW, reload to get fresh assets
  if (stored !== null) {
    window.location.reload();
    return;
  }
}

clearStaleCache();

// Lock orientation to portrait when possible (PWA / fullscreen)
try {
  screen.orientation?.lock?.('portrait').catch(() => {});
} catch { /* not supported */ }

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
