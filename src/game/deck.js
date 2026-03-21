import { SUITS, RANKS, SUIT_COLORS, RANK_VALUES } from '../constants.js';

export function createDeck() {
  const deck = [];
  let id = 0;
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: id++,
        suit,
        rank,
        color: SUIT_COLORS[suit],
        value: RANK_VALUES[rank],
      });
    }
  }
  return deck;
}

export function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function createShuffledDeck() {
  return shuffleDeck(createDeck());
}

export function compareCards(a, b) {
  if (a.value > b.value) return 1;
  if (a.value < b.value) return -1;
  return 0;
}

export function getCardLabel(card) {
  return `${card.rank}${card.suit}`;
}
