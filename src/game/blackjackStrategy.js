import { calculateHand } from './blackjack.js';
import { BLACKJACK_ACTIONS } from '../constants.js';

const H = BLACKJACK_ACTIONS.HIT;
const S = BLACKJACK_ACTIONS.STAND;
const D = BLACKJACK_ACTIONS.DOUBLE;
const P = BLACKJACK_ACTIONS.SPLIT;
const R = BLACKJACK_ACTIONS.SURRENDER;

// Basic strategy tables
// Dealer upcard: 2, 3, 4, 5, 6, 7, 8, 9, 10, A (indices 0-9)
// Values are: H=hit, S=stand, D=double(hit if can't), P=split, R=surrender(hit if can't)

// Hard totals (rows: 5-17+, dealer up: 2-A)
const HARD_TABLE = {
  5:  [H,H,H,H,H,H,H,H,H,H],
  6:  [H,H,H,H,H,H,H,H,H,H],
  7:  [H,H,H,H,H,H,H,H,H,H],
  8:  [H,H,H,H,H,H,H,H,H,H],
  9:  [H,D,D,D,D,H,H,H,H,H],
  10: [D,D,D,D,D,D,D,D,H,H],
  11: [D,D,D,D,D,D,D,D,D,D],
  12: [H,H,S,S,S,H,H,H,H,H],
  13: [S,S,S,S,S,H,H,H,H,H],
  14: [S,S,S,S,S,H,H,H,H,H],
  15: [S,S,S,S,S,H,H,H,R,R],
  16: [S,S,S,S,S,H,H,R,R,R],
  17: [S,S,S,S,S,S,S,S,S,S],
  18: [S,S,S,S,S,S,S,S,S,S],
  19: [S,S,S,S,S,S,S,S,S,S],
  20: [S,S,S,S,S,S,S,S,S,S],
  21: [S,S,S,S,S,S,S,S,S,S],
};

// Soft totals (rows: A+2 through A+9, dealer up: 2-A)
const SOFT_TABLE = {
  13: [H,H,H,D,D,H,H,H,H,H],  // A,2
  14: [H,H,H,D,D,H,H,H,H,H],  // A,3
  15: [H,H,D,D,D,H,H,H,H,H],  // A,4
  16: [H,H,D,D,D,H,H,H,H,H],  // A,5
  17: [H,D,D,D,D,H,H,H,H,H],  // A,6
  18: [D,D,D,D,D,S,S,H,H,H],  // A,7
  19: [S,S,S,S,D,S,S,S,S,S],  // A,8
  20: [S,S,S,S,S,S,S,S,S,S],  // A,9
};

// Pair splitting (rows: pair value, dealer up: 2-A)
const PAIR_TABLE = {
  'A': [P,P,P,P,P,P,P,P,P,P],
  '2': [P,P,P,P,P,P,H,H,H,H],
  '3': [P,P,P,P,P,P,H,H,H,H],
  '4': [H,H,H,P,P,H,H,H,H,H],
  '5': [D,D,D,D,D,D,D,D,H,H],  // Never split 5s, treat as 10
  '6': [P,P,P,P,P,H,H,H,H,H],
  '7': [P,P,P,P,P,P,H,H,H,H],
  '8': [P,P,P,P,P,P,P,P,P,P],
  '9': [P,P,P,P,P,S,P,P,S,S],
  '10': [S,S,S,S,S,S,S,S,S,S],
};

function dealerIndex(dealerUpCard) {
  const rank = dealerUpCard.rank;
  if (rank === 'A') return 9;
  const val = { '2': 0, '3': 1, '4': 2, '5': 3, '6': 4, '7': 5, '8': 6, '9': 7, '10': 8, 'J': 8, 'Q': 8, 'K': 8 };
  return val[rank] ?? 0;
}

export function getOptimalAction(playerCards, dealerUpCard, availableActions) {
  const idx = dealerIndex(dealerUpCard);
  const { total, soft } = calculateHand(playerCards);
  let action;

  // Check pairs first
  if (playerCards.length === 2 && playerCards[0].rank === playerCards[1].rank) {
    const pairRank = playerCards[0].rank === 'J' || playerCards[0].rank === 'Q' || playerCards[0].rank === 'K'
      ? '10' : playerCards[0].rank;
    const pairAction = PAIR_TABLE[pairRank]?.[idx];
    if (pairAction && availableActions.includes(pairAction)) {
      return pairAction;
    }
    // If can't split, fall through to hard/soft
  }

  // Soft hands
  if (soft && total >= 13 && total <= 20) {
    action = SOFT_TABLE[total]?.[idx] ?? H;
  } else {
    // Hard hands
    const lookupTotal = Math.min(21, Math.max(5, total));
    action = HARD_TABLE[lookupTotal]?.[idx] ?? H;
  }

  // Fallback if action not available
  if (!availableActions.includes(action)) {
    if (action === D) return availableActions.includes(H) ? H : S;
    if (action === R) return availableActions.includes(H) ? H : S;
    if (action === P) return availableActions.includes(H) ? H : S;
    return H;
  }

  return action;
}

export function getActionExplanation(action, playerCards, dealerUpCard) {
  const { total, soft } = calculateHand(playerCards);
  const dealerRank = dealerUpCard.rank;
  const isPair = playerCards.length === 2 && playerCards[0].rank === playerCards[1].rank;

  switch (action) {
    case H:
      if (total <= 11) return `With ${total}, you can't bust — always hit.`;
      return `${total} vs dealer ${dealerRank} — the odds favor taking a card.`;
    case S:
      if (total >= 17) return `${total} is strong enough — stand and let the dealer risk busting.`;
      return `Dealer shows ${dealerRank} (likely to bust) — stand with ${total}.`;
    case D:
      if (total === 11) return `11 is the best double down hand — high chance of getting 21.`;
      if (soft) return `Soft ${total} vs weak dealer ${dealerRank} — double for extra value.`;
      return `${total} vs dealer ${dealerRank} — doubling has a positive expected value.`;
    case P:
      if (isPair && playerCards[0].rank === 'A') return `Always split aces — two chances at 21.`;
      if (isPair && playerCards[0].rank === '8') return `Always split 8s — 16 is the worst hand, two 8s are better.`;
      return `Splitting gives better expected value than playing ${total}.`;
    case R:
      return `${total} vs dealer ${dealerRank} — surrendering saves half your bet in a bad spot.`;
    default:
      return '';
  }
}

// Hi-Lo card counting
export function getHiLoValue(card) {
  const rank = card.rank;
  if (['2', '3', '4', '5', '6'].includes(rank)) return 1;
  if (['7', '8', '9'].includes(rank)) return 0;
  return -1; // 10, J, Q, K, A
}

export function getRunningCount(dealtCards) {
  return dealtCards.reduce((count, card) => count + getHiLoValue(card), 0);
}

export function getTrueCount(runningCount, decksRemaining) {
  if (decksRemaining <= 0) return runningCount;
  return Math.round((runningCount / decksRemaining) * 10) / 10;
}

export function getDecksRemaining(shoeSize, deckCount) {
  return Math.max(0.5, Math.round((shoeSize / 52) * 10) / 10);
}

// Strategy chart data for display
export function getStrategyChartData() {
  return {
    hard: HARD_TABLE,
    soft: SOFT_TABLE,
    pairs: PAIR_TABLE,
    dealerColumns: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'],
  };
}
