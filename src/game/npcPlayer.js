import { getOptimalAction } from './blackjackStrategy.js';
import { CHIP_DENOMINATIONS } from '../constants.js';

const NPC_NAMES = ['Alex', 'Jordan', 'Sam', 'Casey', 'Morgan', 'Riley', 'Quinn', 'Taylor'];

export function getRandomNPCName(existingNames) {
  const available = NPC_NAMES.filter(n => !existingNames.includes(n));
  if (available.length === 0) {
    // Fallback: append number to a random name
    const base = NPC_NAMES[Math.floor(Math.random() * NPC_NAMES.length)];
    let i = 2;
    while (existingNames.includes(`${base} ${i}`)) i++;
    return `${base} ${i}`;
  }
  return available[Math.floor(Math.random() * available.length)];
}

export function getNPCBet(chips) {
  // Bet ~3% of chips, snapped to nearest chip denomination
  const target = Math.max(5, Math.floor(chips * 0.03));
  // Find nearest denomination that doesn't exceed chips
  const sorted = [...CHIP_DENOMINATIONS].sort((a, b) => a - b);
  let best = sorted[0];
  for (const denom of sorted) {
    if (denom <= chips && Math.abs(denom - target) <= Math.abs(best - target)) {
      best = denom;
    }
  }
  // Add some variance: occasionally bet one tier up or down
  const currentIdx = sorted.indexOf(best);
  const variance = Math.random();
  if (variance < 0.2 && currentIdx > 0) {
    best = sorted[currentIdx - 1];
  } else if (variance > 0.8 && currentIdx < sorted.length - 1 && sorted[currentIdx + 1] <= chips) {
    best = sorted[currentIdx + 1];
  }
  return Math.min(best, chips);
}

const MISTAKE_RATE = 0.1;

export function getNPCAction(hand, dealerUpCard, availableActions) {
  const optimal = getOptimalAction(hand.cards, dealerUpCard, availableActions);
  // ~10% chance of suboptimal play
  if (Math.random() < MISTAKE_RATE) {
    const alternatives = availableActions.filter(a => a !== optimal);
    if (alternatives.length > 0) {
      return alternatives[Math.floor(Math.random() * alternatives.length)];
    }
  }
  return optimal;
}

// Basic strategy: never take insurance
export function getNPCInsuranceDecision() {
  return false;
}

export function getNPCActionDelay() {
  return 800 + Math.random() * 700;
}
