import { SUITS, RANKS } from '../constants.js';
import { BLACKJACK_RANK_VALUES, HAND_STATUS, BLACKJACK_ACTIONS } from '../constants.js';

export function createShoe(deckCount = 6) {
  const cards = [];
  let id = 0;
  for (let d = 0; d < deckCount; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        cards.push({ id: id++, suit, rank });
      }
    }
  }
  return shuffleCards(cards);
}

export function shuffleCards(cards) {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCard(shoe) {
  if (shoe.length === 0) return null;
  const newShoe = [...shoe];
  const card = newShoe.pop();
  return { card, shoe: newShoe };
}

export function calculateHand(cards) {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    const val = BLACKJACK_RANK_VALUES[card.rank];
    total += val;
    if (card.rank === 'A') aces++;
  }

  // Reduce aces from 11 to 1 as needed
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  const soft = cards.some(c => c.rank === 'A') && total <= 21 &&
    cards.reduce((sum, c) => sum + BLACKJACK_RANK_VALUES[c.rank], 0) !== total;

  return { total, soft };
}

export function isBlackjack(cards) {
  if (cards.length !== 2) return false;
  const { total } = calculateHand(cards);
  return total === 21;
}

export function isBusted(cards) {
  return calculateHand(cards).total > 21;
}

export function canSplit(hand, totalHands, resplitLimit, chips, doubleAfterSplit) {
  if (hand.cards.length !== 2) return false;
  if (totalHands >= resplitLimit) return false;
  if (chips < hand.bet) return false;
  return hand.cards[0].rank === hand.cards[1].rank;
}

export function canDouble(hand, chips) {
  if (hand.cards.length !== 2) return false;
  if (chips < hand.bet) return false;
  return true;
}

export function canSurrender(hand, isFirstAction) {
  return hand.cards.length === 2 && isFirstAction;
}

export function shouldDealerHit(cards, standsSoft17) {
  const { total, soft } = calculateHand(cards);
  if (total < 17) return true;
  if (total === 17 && soft && !standsSoft17) return true;
  return false;
}

export function shouldOfferInsurance(dealerCards) {
  return dealerCards.length >= 1 && dealerCards[0].rank === 'A';
}

export function resolveHand(playerHand, dealerTotal, dealerBlackjack, config) {
  const { cards, bet, status, isDoubled, insuranceBet } = playerHand;

  if (status === HAND_STATUS.SURRENDER) {
    return { payout: Math.ceil(bet / 2), result: 'surrender' };
  }

  const playerResult = calculateHand(cards);
  const playerTotal = playerResult.total;
  const playerBJ = isBlackjack(cards);

  let payout = 0;
  let result = 'loss';
  const totalBet = isDoubled ? bet * 2 : bet;

  // Insurance payout
  let insurancePayout = 0;
  if (insuranceBet > 0) {
    insurancePayout = dealerBlackjack ? insuranceBet * 2 : 0;
  }

  if (status === HAND_STATUS.BUST) {
    result = 'bust';
    payout = 0;
  } else if (playerBJ && dealerBlackjack) {
    result = 'push';
    payout = totalBet;
  } else if (playerBJ) {
    result = 'blackjack';
    payout = totalBet + Math.ceil(bet * config.blackjackPays);
  } else if (dealerBlackjack) {
    result = 'loss';
    payout = 0;
  } else if (dealerTotal > 21) {
    result = 'win';
    payout = totalBet * 2;
  } else if (playerTotal > dealerTotal) {
    result = 'win';
    payout = totalBet * 2;
  } else if (playerTotal === dealerTotal) {
    result = 'push';
    payout = totalBet;
  } else {
    result = 'loss';
    payout = 0;
  }

  return { payout: payout + insurancePayout, result };
}

export function getAvailableActions(hand, totalHands, config, chips, isFirstAction) {
  const actions = [BLACKJACK_ACTIONS.HIT, BLACKJACK_ACTIONS.STAND];

  if (canDouble(hand, chips)) {
    // If it's a split hand, only allow double if doubleAfterSplit is enabled
    if (totalHands <= 1 || config.doubleAfterSplit) {
      actions.push(BLACKJACK_ACTIONS.DOUBLE);
    }
  }

  if (canSplit(hand, totalHands, config.resplitLimit, chips, config.doubleAfterSplit)) {
    actions.push(BLACKJACK_ACTIONS.SPLIT);
  }

  if (config.surrenderAllowed && canSurrender(hand, isFirstAction) && totalHands === 1) {
    actions.push(BLACKJACK_ACTIONS.SURRENDER);
  }

  return actions;
}

export function needsNewShoe(shoe, deckCount, cutCardPercent) {
  const totalCards = deckCount * 52;
  const cutPoint = Math.floor(totalCards * (1 - cutCardPercent));
  return shoe.length <= cutPoint;
}

export function getHandDisplayTotal(cards) {
  const { total, soft } = calculateHand(cards);
  if (soft && total <= 21) {
    return `${total - 10}/${total}`;
  }
  return `${total}`;
}
